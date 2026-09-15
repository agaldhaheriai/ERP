<?php
/* ============================================================================
 *  ERPSYS — الوصلة بين GitHub و AwardSpace
 *  deploy.php
 *  ---------------------------------------------------------------------------
 *  ماذا يفعل؟
 *    يسحب آخر نسخة من الكود من GitHub ويضعها في هذا المجلد (/ERP/) مباشرة.
 *    قاعدة البيانات تبقى كما هي على AwardSpace — هذا الملف لا يمسّها إطلاقاً.
 *
 *  ثلاث طرق للتشغيل:
 *    1) يدوياً :  /ERP/deploy.php?action=deploy&token=<deploy_token>
 *    2) تلقائياً:  GitHub Webhook (push)  →  /ERP/deploy.php
 *                 يُتحقَّق من التوقيع بـ webhook_secret
 *    3) فحص    :  /ERP/deploy.php?action=status&token=<deploy_token>
 *
 *  الأمان:
 *    • كل طلب يحتاج deploy_token أو توقيع ويبهوك صحيحاً.
 *    • الملفات في قائمة protect لا تُمسّ (config.php أولها).
 *    • لا يحذف شيئاً خارج قائمة الملفات القادمة من المستودع.
 * ==========================================================================*/

declare(strict_types=1);
@set_time_limit(300);
@ini_set('memory_limit', '256M');
date_default_timezone_set('Asia/Dubai');

$ROOT = __DIR__;
$CFGF = $ROOT . '/config.php';
if (!is_readable($CFGF)) { http_response_code(500); exit('config.php غير موجود بجانب deploy.php'); }
$CFG = require $CFGF;
$G   = $CFG['github'] ?? [];

$STATE_FILE = $ROOT . '/.deploy-state.json';
$LOG_FILE   = $ROOT . '/deploy.log';
$PROTECT    = array_map('strtolower', $G['protect'] ?? ['config.php']);

function jout(array $a, int $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    exit(json_encode($a, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
}
function logline(string $f, string $m): void {
    @file_put_contents($f, '[' . date('Y-m-d H:i:s') . '] ' . $m . "\n", FILE_APPEND);
}
function state(string $f): array { return is_readable($f) ? (json_decode((string)file_get_contents($f), true) ?: []) : []; }

/* ── طلب HTTP إلى GitHub ─────────────────────────────────────────────── */
function gh_get(string $url, array $G, bool $raw = false) {
    $h = ['User-Agent: ERPSYS-Deploy', 'Accept: ' . ($raw ? 'application/vnd.github.raw' : 'application/vnd.github+json')];
    if (!empty($G['github_token'])) $h[] = 'Authorization: Bearer ' . $G['github_token'];

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 120, CURLOPT_CONNECTTIMEOUT => 15, CURLOPT_HTTPHEADER => $h,
        ]);
        $b = curl_exec($ch);
        $c = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $e = curl_error($ch);
        curl_close($ch);
        if ($b === false) return ['ok' => false, 'error' => $e ?: 'curl failed'];
        return ['ok' => $c >= 200 && $c < 300, 'code' => $c, 'body' => $b];
    }
    if (!ini_get('allow_url_fopen')) return ['ok' => false, 'error' => 'لا curl ولا allow_url_fopen على هذا الخادم'];
    $ctx = stream_context_create(['http' => ['method' => 'GET', 'timeout' => 120,
        'header' => implode("\r\n", $h), 'ignore_errors' => true]]);
    $b = @file_get_contents($url, false, $ctx);
    if ($b === false) return ['ok' => false, 'error' => 'fetch failed'];
    return ['ok' => true, 'code' => 200, 'body' => $b];
}

/* ── عناوين GitHub (قابلة للتبديل لخوادم GitHub Enterprise) ──────────── */
function gh_base(array $G, string $k): string {
    $d = ['api' => 'https://api.github.com', 'codeload' => 'https://codeload.github.com',
          'raw' => 'https://raw.githubusercontent.com'];
    return rtrim((string)($G[$k . '_base'] ?? $d[$k]), '/');
}

/* ── آخر commit على الفرع ─────────────────────────────────────────────── */
function latest_commit(array $G): array {
    $u = sprintf(gh_base($G,'api') . '/repos/%s/%s/commits/%s',
        rawurlencode((string)$G['owner']), rawurlencode((string)$G['repo']), rawurlencode((string)$G['branch']));
    $r = gh_get($u, $G);
    if (!$r['ok']) return ['ok' => false, 'error' => $r['error'] ?? ('HTTP ' . ($r['code'] ?? '?'))];
    $j = json_decode($r['body'], true);
    if (!isset($j['sha'])) return ['ok' => false, 'error' => 'استجابة GitHub غير متوقعة'];
    return ['ok' => true, 'sha' => $j['sha'],
            'message' => $j['commit']['message'] ?? '', 'author' => $j['commit']['author']['name'] ?? '',
            'date' => $j['commit']['author']['date'] ?? ''];
}

/* ── كتابة ملف بأمان ──────────────────────────────────────────────────── */
function put_file(string $root, string $rel, string $data, array $protect, array &$res): void {
    $rel = ltrim(str_replace('\\', '/', $rel), '/');
    if ($rel === '' || strpos($rel, '..') !== false) { $res['skipped'][] = $rel; return; }
    if (in_array(strtolower(basename($rel)), $protect, true)) { $res['protected'][] = $rel; return; }
    $dest = $root . '/' . $rel;
    $dir  = dirname($dest);
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) { $res['failed'][] = $rel; return; }
    $old = is_readable($dest) ? (string)file_get_contents($dest) : null;
    if ($old === $data) { $res['unchanged'][] = $rel; return; }
    if (@file_put_contents($dest, $data) === false) { $res['failed'][] = $rel; return; }
    $res[$old === null ? 'added' : 'updated'][] = $rel;
}

/* ══════════════════════ طريقة 1: تنزيل ZIP كامل ═══════════════════════ */
function deploy_zip(string $root, array $G, array $protect): array {
    if (!class_exists('ZipArchive')) return ['ok' => false, 'error' => 'ZipArchive غير متاح'];
    $url = sprintf(gh_base($G,'codeload') . '/%s/%s/zip/refs/heads/%s',
        rawurlencode((string)$G['owner']), rawurlencode((string)$G['repo']), rawurlencode((string)$G['branch']));
    $r = gh_get($url, $G, true);
    if (!$r['ok']) return ['ok' => false, 'error' => 'تعذّر تنزيل الأرشيف: ' . ($r['error'] ?? ('HTTP ' . ($r['code'] ?? '?')))];

    $tmp = tempnam(sys_get_temp_dir(), 'erp');
    if ($tmp === false || @file_put_contents($tmp, $r['body']) === false)
        return ['ok' => false, 'error' => 'تعذّرت الكتابة في المجلد المؤقت'];

    $zip = new ZipArchive();
    if ($zip->open($tmp) !== true) { @unlink($tmp); return ['ok' => false, 'error' => 'الأرشيف غير صالح']; }

    $src = trim((string)($G['source_dir'] ?? ''), '/');
    $res = ['added' => [], 'updated' => [], 'unchanged' => [], 'protected' => [], 'skipped' => [], 'failed' => []];
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $name = (string)$zip->getNameIndex($i);
        if (substr($name, -1) === '/') continue;
        $p = strpos($name, '/');                       // احذف المجلد الجذري «repo-branch/»
        if ($p === false) continue;
        $rel = substr($name, $p + 1);
        if ($src !== '') {
            if (strpos($rel, $src . '/') !== 0) continue;
            $rel = substr($rel, strlen($src) + 1);
        }
        if ($rel === '' || strpos($rel, '.github/') === 0) continue;
        $data = $zip->getFromIndex($i);
        if ($data === false) { $res['failed'][] = $rel; continue; }
        put_file($root, $rel, $data, $protect, $res);
    }
    $zip->close(); @unlink($tmp);
    return ['ok' => true, 'method' => 'zip'] + $res;
}

/* ══════════════ طريقة 2: ملفاً ملفاً عبر واجهة GitHub ═══════════════════
 *  تُستخدم تلقائياً إن لم يكن ZipArchive متاحاً على الاستضافة.
 */
function deploy_api(string $root, array $G, array $protect, string $sha): array {
    $u = sprintf(gh_base($G,'api') . '/repos/%s/%s/git/trees/%s?recursive=1',
        rawurlencode((string)$G['owner']), rawurlencode((string)$G['repo']), rawurlencode($sha));
    $r = gh_get($u, $G);
    if (!$r['ok']) return ['ok' => false, 'error' => 'تعذّرت قراءة شجرة الملفات: ' . ($r['error'] ?? ('HTTP ' . ($r['code'] ?? '?')))];
    $j = json_decode($r['body'], true);
    if (empty($j['tree'])) return ['ok' => false, 'error' => 'شجرة الملفات فارغة'];

    $src = trim((string)($G['source_dir'] ?? ''), '/');
    $res = ['added' => [], 'updated' => [], 'unchanged' => [], 'protected' => [], 'skipped' => [], 'failed' => []];
    foreach ($j['tree'] as $node) {
        if (($node['type'] ?? '') !== 'blob') continue;
        $path = (string)$node['path'];
        $rel  = $path;
        if ($src !== '') {
            if (strpos($path, $src . '/') !== 0) continue;
            $rel = substr($path, strlen($src) + 1);
        }
        if ($rel === '' || strpos($rel, '.github/') === 0) continue;
        $raw = sprintf(gh_base($G,'raw') . '/%s/%s/%s/%s',
            rawurlencode((string)$G['owner']), rawurlencode((string)$G['repo']), rawurlencode($sha), $path);
        $f = gh_get($raw, $G, true);
        if (!$f['ok']) { $res['failed'][] = $rel; continue; }
        put_file($root, $rel, $f['body'], $protect, $res);
    }
    return ['ok' => true, 'method' => 'api'] + $res;
}

/* ══════════════════════════ المسارات ══════════════════════════════════ */
$action = $_GET['action'] ?? null;
$token  = (string)($_GET['token'] ?? '');
$isHook = ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST'
          && (isset($_SERVER['HTTP_X_GITHUB_EVENT']) || isset($_SERVER['HTTP_X_HUB_SIGNATURE_256']));

/* ── ويبهوك GitHub ── */
if ($isHook) {
    $body  = (string)file_get_contents('php://input');
    $sig   = (string)($_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '');
    $event = (string)($_SERVER['HTTP_X_GITHUB_EVENT'] ?? '');
    $secret = (string)($G['webhook_secret'] ?? '');

    if ($secret === '' || $sig === '' || !hash_equals('sha256=' . hash_hmac('sha256', $body, $secret), $sig)) {
        logline($LOG_FILE, 'webhook rejected: bad signature');
        jout(['ok' => false, 'error' => 'توقيع غير صالح'], 401);
    }
    if ($event === 'ping') jout(['ok' => true, 'pong' => true]);
    if ($event !== 'push') jout(['ok' => true, 'ignored' => $event]);

    $payload = json_decode($body, true) ?: [];
    $ref = (string)($payload['ref'] ?? '');
    if ($ref !== '' && $ref !== 'refs/heads/' . $G['branch'])
        jout(['ok' => true, 'ignored' => 'branch ' . $ref]);
    $action = 'deploy';                                   // تابع إلى النشر
}
elseif (!hash_equals((string)($G['deploy_token'] ?? ''), $token)) {
    /* واجهة صغيرة تشرح الاستخدام بدل صفحة خطأ صمّاء */
    if ($action === null) {
        header('Content-Type: text/html; charset=utf-8');
        $st = state($STATE_FILE);
        exit('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">
<title>ERPSYS · وصلة النشر</title>
<style>body{font-family:system-ui,"Segoe UI",sans-serif;background:#f4f3f0;color:#16181c;margin:0;padding:40px 18px}
.c{max-width:620px;margin:auto;background:#fff;border:1px solid #e0ddd6;border-radius:14px;padding:26px}
h1{font-size:19px;margin:0 0 6px}p{color:#4d5259;font-size:14px;line-height:1.7}
code{background:#f1f0ec;padding:2px 7px;border-radius:5px;font-size:12.5px;direction:ltr;display:inline-block}
.k{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#83888f;margin-top:18px}</style>
<div class="c"><h1>وصلة النشر — ERPSYS</h1>
<p>هذه نقطة الربط بين مستودع GitHub وهذه الاستضافة. تحتاج رمز النشر للمتابعة.</p>
<div class="k">النشر اليدوي</div><p><code>deploy.php?action=deploy&amp;token=رمز-النشر</code></p>
<div class="k">فحص البيئة</div><p><code>deploy.php?action=status&amp;token=رمز-النشر</code></p>
<div class="k">آخر نشر</div><p>' . htmlspecialchars((string)($st['deployed_at'] ?? 'لم يحدث بعد'), ENT_QUOTES) . '</p>
</div></html>');
    }
    jout(['ok' => false, 'error' => 'رمز النشر غير صحيح'], 403);
}

/* ── فحص البيئة ── */
if ($action === 'status') {
    $c = latest_commit($G);
    jout([
        'ok' => true,
        'repo'   => ($G['owner'] ?? '?') . '/' . ($G['repo'] ?? '?') . '@' . ($G['branch'] ?? '?'),
        'target' => $ROOT,
        'source_dir' => $G['source_dir'] ?? '(جذر المستودع)',
        'server' => [
            'php'           => PHP_VERSION,
            'curl'          => function_exists('curl_init'),
            'ZipArchive'    => class_exists('ZipArchive'),
            'allow_url_fopen' => (bool)ini_get('allow_url_fopen'),
            'pdo_mysql'     => in_array('mysql', PDO::getAvailableDrivers(), true),
            'writable'      => is_writable($ROOT),
            'tmp_writable'  => is_writable(sys_get_temp_dir()),
        ],
        'github_reachable' => $c['ok'],
        'github_error'     => $c['ok'] ? null : ($c['error'] ?? null),
        'latest_commit'    => $c['ok'] ? ['sha' => substr($c['sha'], 0, 7), 'message' => $c['message'],
                                          'author' => $c['author'], 'date' => $c['date']] : null,
        'deployed'         => state($STATE_FILE),
        'database'         => ['host' => $CFG['db']['host'] ?? null, 'name' => $CFG['db']['name'] ?? null,
                               'note' => 'قاعدة البيانات على AwardSpace — النشر لا يمسّها'],
    ]);
}

/* ── النشر ── */
if ($action === 'deploy') {
    $t0 = microtime(true);
    $c = latest_commit($G);
    if (!$c['ok']) { logline($LOG_FILE, 'FAIL ' . $c['error']); jout(['ok' => false, 'error' => $c['error']], 502); }

    $prev = state($STATE_FILE);
    if (empty($_GET['force']) && ($prev['sha'] ?? null) === $c['sha'] && !$isHook)
        jout(['ok' => true, 'skipped' => 'لا تغييرات — نفس آخر commit', 'sha' => substr($c['sha'], 0, 7)]);

    $r = deploy_zip($ROOT, $G, $PROTECT);
    if (!$r['ok']) $r = deploy_api($ROOT, $G, $PROTECT, $c['sha']);
    if (!$r['ok']) { logline($LOG_FILE, 'FAIL ' . $r['error']); jout(['ok' => false, 'error' => $r['error']], 502); }

    $changed = count($r['added']) + count($r['updated']);
    $st = ['sha' => $c['sha'], 'short' => substr($c['sha'], 0, 7), 'message' => $c['message'],
           'author' => $c['author'], 'deployed_at' => date('Y-m-d H:i:s'), 'method' => $r['method'],
           'files_changed' => $changed];
    @file_put_contents($STATE_FILE, json_encode($st, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    logline($LOG_FILE, sprintf('OK %s (%s) — %d ملف، %.1f ث', substr($c['sha'], 0, 7), $r['method'], $changed, microtime(true) - $t0));

    jout(['ok' => true, 'commit' => $st, 'method' => $r['method'],
          'added' => $r['added'], 'updated' => $r['updated'],
          'unchanged' => count($r['unchanged']), 'protected' => $r['protected'],
          'failed' => $r['failed'], 'seconds' => round(microtime(true) - $t0, 1)]);
}

/* ── السجل ── */
if ($action === 'log') {
    header('Content-Type: text/plain; charset=utf-8');
    exit(is_readable($LOG_FILE) ? (string)file_get_contents($LOG_FILE) : 'لا يوجد سجل بعد');
}

jout(['ok' => false, 'error' => 'action غير معروف — استخدم status أو deploy أو log'], 400);
