<?php
/* ============================================================================
 *  البوابة الداخلية  |  Internal Portal
 *  index.php — واجهة + بروكسي API + قاعدة بيانات MySQL
 *  ---------------------------------------------------------------------------
 *  مصادر البيانات (لا يوجد في البوابة أي بيانات خارجها):
 *    apps      → api_applications.json   (الموظفون، الأقسام، الأنظمة، الأدوار)
 *    leave     → leave_api.php           (الإجازة السنوية والرصيد لكل موظف)
 *    hardware  → export_json.php         (الأجهزة، الضمان، الطابعة، السكانر)
 *  ---------------------------------------------------------------------------
 *  التشغيل:
 *    1) ارفع index.php + config.php في نفس المجلد.
 *    2) index.php?action=install&token=<sync_token>   ← إنشاء الجداول
 *    3) index.php?action=sync&token=<sync_token>      ← أول مزامنة
 *    4) index.php                                     ← البوابة
 * ==========================================================================*/

declare(strict_types=1);
mb_internal_encoding('UTF-8');
date_default_timezone_set('Asia/Dubai');

$CFG = require __DIR__ . '/config.php';
$EP  = $CFG['endpoints'];
$PFX = $CFG['db']['prefix'];

/* ══════════════════════════ أدوات مساعدة ══════════════════════════════════ */

/** مفتاح مطابقة الأسماء بين الأنظمة الثلاثة */
function name_key(?string $n): string {
    $n = (string)$n;
    $n = preg_replace('/[\x{0640}\x{064B}-\x{0652}]/u', '', $n);          // تشكيل وتطويل
    $n = strtr($n, ['أ'=>'ا','إ'=>'ا','آ'=>'ا','ة'=>'ه','ى'=>'ي','ؤ'=>'و','ئ'=>'ي']);
    $n = mb_strtolower($n, 'UTF-8');
    $n = preg_replace('/\b(al|el)[\s\-]?/u', '', $n);                      // Al / El
    $n = preg_replace('/[^\p{L}\p{N}]+/u', '', $n);
    return (string)$n;
}
function b2i($v): int {
    if (is_bool($v)) return $v ? 1 : 0;
    $s = mb_strtolower(trim((string)$v));
    return in_array($s, ['1','yes','y','true','نعم','متوفر'], true) ? 1 : 0;
}
function first_of(array $row, array $keys, $def = null) {
    foreach ($keys as $k) {
        foreach ($row as $rk => $rv) {
            if (strcasecmp((string)$rk, $k) === 0 && $rv !== null && $rv !== '') return $rv;
        }
    }
    return $def;
}
function warranty_state(?string $d): string {
    if (!$d) return 'unknown';
    $ts = strtotime($d);
    if (!$ts) return 'unknown';
    $days = (int)floor(($ts - time()) / 86400);
    if ($days < 0)  return 'expired';
    if ($days <= 90) return 'expiring';
    return 'active';
}

/* ══════════════════════════ قاعدة البيانات ════════════════════════════════ */
function db(array $CFG): ?PDO {
    static $pdo = null, $tried = false;
    if ($tried) return $pdo;
    $tried = true;
    if (empty($CFG['db']['enabled'])) return null;
    $flag = sys_get_temp_dir() . '/portal_db_down.flag';
    if (is_readable($flag) && (time() - filemtime($flag) < 120)) return null;
    $d = $CFG['db'];
    try {
        $pdo = new PDO("mysql:host={$d['host']};port={$d['port']};dbname={$d['name']};charset={$d['charset']}",
            $d['user'], $d['pass'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
             PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
             PDO::ATTR_EMULATE_PREPARES => false, PDO::ATTR_TIMEOUT => 5]);
    } catch (Throwable $e) { $pdo = null; @touch($flag); }
    if ($pdo && is_file($flag)) @unlink($flag);
    return $pdo;
}

function db_install(PDO $p, string $x): array {
    $eng = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    $q = [
    "CREATE TABLE IF NOT EXISTS {$x}departments (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(160) NOT NULL,
      employees INT DEFAULT 0, updated_at DATETIME NOT NULL,
      UNIQUE KEY uq_name (name)) $eng",

    "CREATE TABLE IF NOT EXISTS {$x}employees (
      id INT AUTO_INCREMENT PRIMARY KEY, emp_code VARCHAR(40) NOT NULL,
      name_key VARCHAR(190) NULL, full_name VARCHAR(190) NOT NULL, name_ar VARCHAR(190) NULL,
      department VARCHAR(160) NULL, job_title VARCHAR(160) NULL, email VARCHAR(190) NULL,
      account_name VARCHAR(120) NULL, access_level VARCHAR(40) NULL, status VARCHAR(40) NULL,
      last_login DATETIME NULL, updated_at DATETIME NOT NULL,
      UNIQUE KEY uq_code (emp_code), KEY ix_nk (name_key), KEY ix_dept (department)) $eng",

    "CREATE TABLE IF NOT EXISTS {$x}applications (
      id INT AUTO_INCREMENT PRIMARY KEY, app_code VARCHAR(40) NOT NULL,
      app_name VARCHAR(190) NOT NULL, description TEXT NULL, version VARCHAR(40) NULL,
      app_type VARCHAR(80) NULL, status VARCHAR(60) NULL, developers TEXT NULL,
      app_url VARCHAR(400) NULL, date_created DATE NULL, last_update DATE NULL,
      updated_at DATETIME NOT NULL, UNIQUE KEY uq_app (app_code)) $eng",

    "CREATE TABLE IF NOT EXISTS {$x}app_roles (
      id INT AUTO_INCREMENT PRIMARY KEY, app_code VARCHAR(40) NOT NULL,
      role_name VARCHAR(120) NOT NULL, emp_code VARCHAR(40) NULL, emp_name VARCHAR(190) NULL,
      department VARCHAR(160) NULL, updated_at DATETIME NOT NULL,
      UNIQUE KEY uq_role (app_code, role_name, emp_code), KEY ix_app (app_code)) $eng",

    "CREATE TABLE IF NOT EXISTS {$x}leave_balances (
      id INT AUTO_INCREMENT PRIMARY KEY, person_key VARCHAR(190) NOT NULL,
      name_key VARCHAR(190) NULL, full_name VARCHAR(190) NOT NULL, email VARCHAR(190) NULL,
      phone VARCHAR(60) NULL, department VARCHAR(160) NULL, job_title VARCHAR(160) NULL,
      salary DECIMAL(12,2) NULL, hire_date DATE NULL, address VARCHAR(190) NULL,
      annual_leave INT NULL, leave_balance INT NULL, src VARCHAR(40) NULL,
      source_created DATETIME NULL, updated_at DATETIME NOT NULL,
      UNIQUE KEY uq_person (person_key), KEY ix_nk (name_key), KEY ix_dept (department)) $eng",

    "CREATE TABLE IF NOT EXISTS {$x}hardware (
      id INT AUTO_INCREMENT PRIMARY KEY, item_key VARCHAR(190) NOT NULL,
      name_key VARCHAR(190) NULL, employee_name VARCHAR(190) NOT NULL,
      department VARCHAR(160) NULL, computer_model VARCHAR(190) NULL,
      warranty_expiry DATE NULL, warranty_state VARCHAR(20) NULL,
      printer TINYINT(1) DEFAULT 0, scanner TINYINT(1) DEFAULT 0,
      updated_at DATETIME NOT NULL,
      UNIQUE KEY uq_item (item_key), KEY ix_nk (name_key), KEY ix_w (warranty_state)) $eng",

    "CREATE TABLE IF NOT EXISTS {$x}edits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module VARCHAR(30) NOT NULL,           -- employees | leave | hardware | applications
      record_key VARCHAR(190) NOT NULL,      -- emp_code | person_key | item_key | app_code
      payload JSON NULL,                     -- الحقول المعدّلة فقط
      is_new TINYINT(1) DEFAULT 0,           -- 1 = سجل أضافه المستخدم (ليس من الـ API)
      is_deleted TINYINT(1) DEFAULT 0,       -- 1 = مخفي
      updated_by VARCHAR(120) NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      UNIQUE KEY uq_edit (module, record_key), KEY ix_mod (module)) $eng",

    "CREATE TABLE IF NOT EXISTS {$x}audit (
      id INT AUTO_INCREMENT PRIMARY KEY, module VARCHAR(30) NOT NULL,
      record_key VARCHAR(190) NOT NULL, op VARCHAR(12) NOT NULL,
      changes JSON NULL, actor VARCHAR(120) NULL, created_at DATETIME NOT NULL,
      KEY ix_mod (module), KEY ix_t (created_at)) $eng",

    "CREATE TABLE IF NOT EXISTS {$x}snapshots (
      id INT AUTO_INCREMENT PRIMARY KEY, source_key VARCHAR(40) NOT NULL,
      source_url VARCHAR(500) NULL, payload LONGTEXT NOT NULL, fetched_at DATETIME NOT NULL,
      KEY ix_key (source_key), KEY ix_t (fetched_at)) $eng",

    "CREATE TABLE IF NOT EXISTS {$x}sync_log (
      id INT AUTO_INCREMENT PRIMARY KEY, source_key VARCHAR(40) NOT NULL,
      result VARCHAR(20) NOT NULL, message VARCHAR(400) NULL, rows_count INT DEFAULT 0,
      duration_ms INT DEFAULT 0, created_at DATETIME NOT NULL,
      KEY ix_key (source_key), KEY ix_t (created_at)) $eng",
    ];
    $ok = 0; $errs = [];
    foreach ($q as $s) { try { $p->exec($s); $ok++; } catch (Throwable $e) { $errs[] = $e->getMessage(); } }
    return ['tables' => $ok, 'errors' => $errs];
}

/* ══════════════════════════ جلب + تطبيع ═══════════════════════════════════ */
function http_get(string $url, array $headers): array {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_FOLLOWLOCATION=>true,
            CURLOPT_TIMEOUT=>20, CURLOPT_CONNECTTIMEOUT=>8,
            CURLOPT_HTTPHEADER=>array_merge($headers,['Accept: application/json']),
            CURLOPT_USERAGENT=>'InternalPortal/2.0']);
        $b = curl_exec($ch); $c = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); $e = curl_error($ch); curl_close($ch);
        if ($b === false) return ['ok'=>false,'error'=>$e ?: 'curl failed'];
        return ['ok'=>$c>=200 && $c<300, 'code'=>$c, 'body'=>$b];
    }
    $ctx = stream_context_create(['http'=>['method'=>'GET','timeout'=>20,
        'header'=>implode("\r\n", array_merge($headers,['Accept: application/json'])),'ignore_errors'=>true]]);
    $b = @file_get_contents($url, false, $ctx);
    if ($b === false) return ['ok'=>false,'error'=>'fetch failed'];
    return ['ok'=>true,'code'=>200,'body'=>$b];
}

/** يبحث عن أول مصفوفة سجلات داخل استجابة JSON مهما كان اسم المفتاح */
function find_rows($data, array $prefer = []): array {
    if (!is_array($data)) return [];
    if (array_is_list($data)) return $data;
    foreach ($prefer as $k) if (!empty($data[$k]) && is_array($data[$k]) && array_is_list($data[$k])) return $data[$k];
    foreach ($data as $v) if (is_array($v) && array_is_list($v) && $v && is_array($v[0])) return $v;
    return [];
}

/** apps → شكل موحّد */
function norm_apps(array $d): array {
    $emps = [];
    foreach (($d['employees'] ?? []) as $e) {
        if (empty($e['emp_code'])) continue;
        $emps[] = ['emp_code'=>$e['emp_code'], 'full_name'=>$e['full_name'] ?? '', 'name_ar'=>$e['name_ar'] ?? null,
            'name_key'=>name_key($e['full_name'] ?? ''), 'department'=>$e['department'] ?? null,
            'job_title'=>$e['job_title'] ?? null, 'email'=>$e['email'] ?? null,
            'account_name'=>$e['account_name'] ?? null, 'access_level'=>$e['access_level'] ?? null,
            'status'=>$e['status'] ?? null, 'last_login'=>$e['last_login'] ?? null];
    }
    $apps = [];
    foreach (($d['applications'] ?? []) as $a) {
        if (empty($a['app_code'])) continue;
        $roles = [];
        foreach (($a['roles'] ?? []) as $r) {
            $roles[] = ['role_name'=>$r['role_name'] ?? '-', 'emp_code'=>$r['employee']['emp_code'] ?? null,
                'emp_name'=>$r['employee']['name'] ?? null, 'department'=>$r['employee']['department'] ?? null];
        }
        $apps[] = ['app_code'=>$a['app_code'], 'app_name'=>$a['app_name'] ?? '', 'description'=>$a['description'] ?? null,
            'version'=>$a['version'] ?? null, 'app_type'=>$a['app_type'] ?? null, 'status'=>$a['status'] ?? null,
            'developers'=>array_values($a['developers'] ?? []), 'app_url'=>$a['app_url'] ?? null,
            'date_created'=>$a['date_created'] ?? null, 'last_update'=>$a['last_update'] ?? null, 'roles'=>$roles];
    }
    $deps = [];
    foreach (($d['departments'] ?? []) as $x) if (!empty($x['name'])) $deps[] = ['name'=>$x['name'], 'employees'=>(int)($x['employees'] ?? 0)];
    return ['employees'=>$emps, 'applications'=>$apps, 'departments'=>$deps];
}

/** leave → شكل موحّد + إزالة التكرار (يُبقي أحدث سجل لكل شخص) */
function norm_leave(array $d): array {
    $rows = find_rows($d, ['employees','data','records','rows']);
    $byKey = [];
    foreach ($rows as $r) {
        if (!is_array($r)) continue;
        $name  = (string)(first_of($r, ['full_name','name','employee_name','employee'], ''));
        if ($name === '') continue;
        $email = (string)(first_of($r, ['email','mail'], ''));
        $key   = $email !== '' ? mb_strtolower($email) : ('n:' . name_key($name));
        $created = (string)(first_of($r, ['created_at','updated_at','created'], ''));
        $al  = first_of($r, ['annual_leave','annual_leave_days','annual'], null);
        $lb  = first_of($r, ['leave_balance','balance','remaining_leave'], null);
        $rec = [
            'person_key'=>$key, 'name_key'=>name_key($name), 'full_name'=>$name, 'email'=>$email ?: null,
            'phone'=>first_of($r,['phone','mobile']), 'department'=>first_of($r,['department','dept']),
            'job_title'=>first_of($r,['job_title','title','position']),
            'salary'=>is_numeric(first_of($r,['salary','basic_salary'])) ? (float)first_of($r,['salary','basic_salary']) : null,
            'hire_date'=>($hd = first_of($r,['hire_date','joining_date','join_date'])) ? substr((string)$hd,0,10) : null,
            'address'=>first_of($r,['address','city','location']),
            'annual_leave'=>is_numeric($al) ? (int)$al : null,
            'leave_balance'=>is_numeric($lb) ? (int)$lb : null,
            'src'=>first_of($r,['source','src']), 'source_created'=>$created ?: null,
        ];
        // نُبقي الأحدث، ونُفضّل السجل الذي يحمل رصيد إجازة فعلي
        if (isset($byKey[$key])) {
            $old = $byKey[$key];
            $newerTime = strtotime($rec['source_created'] ?? '') >= strtotime($old['source_created'] ?? '');
            $newHasLeave = $rec['annual_leave'] !== null;
            $oldHasLeave = $old['annual_leave'] !== null;
            if (!($newHasLeave && !$oldHasLeave) && !($newerTime && ($newHasLeave || !$oldHasLeave))) continue;
        }
        $byKey[$key] = $rec;
    }
    return ['people'=>array_values($byKey)];
}

/** hardware → شكل موحّد (يتحمّل اختلاف أسماء الحقول) */
function norm_hardware(array $d): array {
    $rows = find_rows($d, ['records','data','hardware','employees','items','rows']);
    $out = [];
    foreach ($rows as $r) {
        if (!is_array($r)) continue;
        $name = (string)(first_of($r, ['employee_name','employee','full_name','name'], ''));
        if ($name === '') continue;
        $w = first_of($r, ['warranty_expiry','warranty_expiry_date','warranty_date','warranty_end','warranty']);
        $w = $w ? substr((string)$w, 0, 10) : null;
        $id = first_of($r, ['id','record_id','#']);
        $out[] = [
            'item_key'=>(string)($id !== null ? 'id:' . $id : 'n:' . name_key($name)),
            'name_key'=>name_key($name), 'employee_name'=>$name,
            'department'=>first_of($r, ['department','dept']),
            'computer_model'=>first_of($r, ['computer_model','model','device_model','computer','device']),
            'warranty_expiry'=>$w, 'warranty_state'=>warranty_state($w),
            'printer'=>b2i(first_of($r, ['printer','has_printer','printer_assigned'], 0)),
            'scanner'=>b2i(first_of($r, ['scanner','has_scanner','scanner_assigned'], 0)),
        ];
    }
    return ['devices'=>$out];
}

function normalize(string $key, array $data): array {
    if ($key === 'apps')     return norm_apps($data);
    if ($key === 'leave')    return norm_leave($data);
    if ($key === 'hardware') return norm_hardware($data);
    return [];
}

/* ══════════════════════════ المزامنة إلى قاعدة البيانات ═══════════════════ */
function sync_one(PDO $p, string $x, string $key, string $url, array $hdr, bool $snap): array {
    $t0 = microtime(true);
    $res = http_get($url, $hdr);
    if (!$res['ok']) { $m = $res['error'] ?? ('HTTP '.($res['code'] ?? '?')); log_sync($p,$x,$key,'error',$m,0,$t0); return ['key'=>$key,'ok'=>false,'error'=>$m]; }
    $raw = json_decode($res['body'], true);
    if (!is_array($raw)) { log_sync($p,$x,$key,'error','invalid JSON',0,$t0); return ['key'=>$key,'ok'=>false,'error'=>'invalid JSON']; }
    $d = normalize($key, $raw);
    $now = date('Y-m-d H:i:s'); $n = 0;

    if ($snap) $p->prepare("INSERT INTO {$x}snapshots (source_key,source_url,payload,fetched_at) VALUES (?,?,?,?)")
                 ->execute([$key, $url, $res['body'], $now]);

    if ($key === 'apps') {
        $sd = $p->prepare("INSERT INTO {$x}departments (name,employees,updated_at) VALUES (?,?,?)
              ON DUPLICATE KEY UPDATE employees=VALUES(employees), updated_at=VALUES(updated_at)");
        foreach ($d['departments'] as $r) { $sd->execute([$r['name'],$r['employees'],$now]); $n++; }

        $se = $p->prepare("INSERT INTO {$x}employees (emp_code,name_key,full_name,name_ar,department,job_title,email,account_name,access_level,status,last_login,updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
              ON DUPLICATE KEY UPDATE name_key=VALUES(name_key),full_name=VALUES(full_name),name_ar=VALUES(name_ar),
              department=VALUES(department),job_title=VALUES(job_title),email=VALUES(email),account_name=VALUES(account_name),
              access_level=VALUES(access_level),status=VALUES(status),last_login=VALUES(last_login),updated_at=VALUES(updated_at)");
        foreach ($d['employees'] as $r) { $se->execute([$r['emp_code'],$r['name_key'],$r['full_name'],$r['name_ar'],$r['department'],$r['job_title'],$r['email'],$r['account_name'],$r['access_level'],$r['status'],$r['last_login'],$now]); $n++; }

        $sa = $p->prepare("INSERT INTO {$x}applications (app_code,app_name,description,version,app_type,status,developers,app_url,date_created,last_update,updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?)
              ON DUPLICATE KEY UPDATE app_name=VALUES(app_name),description=VALUES(description),version=VALUES(version),
              app_type=VALUES(app_type),status=VALUES(status),developers=VALUES(developers),app_url=VALUES(app_url),
              date_created=VALUES(date_created),last_update=VALUES(last_update),updated_at=VALUES(updated_at)");
        $sr = $p->prepare("INSERT INTO {$x}app_roles (app_code,role_name,emp_code,emp_name,department,updated_at) VALUES (?,?,?,?,?,?)
              ON DUPLICATE KEY UPDATE emp_name=VALUES(emp_name),department=VALUES(department),updated_at=VALUES(updated_at)");
        foreach ($d['applications'] as $a) {
            $sa->execute([$a['app_code'],$a['app_name'],$a['description'],$a['version'],$a['app_type'],$a['status'],
                json_encode($a['developers'], JSON_UNESCAPED_UNICODE),$a['app_url'],$a['date_created'],$a['last_update'],$now]); $n++;
            foreach ($a['roles'] as $r) $sr->execute([$a['app_code'],$r['role_name'],$r['emp_code'],$r['emp_name'],$r['department'],$now]);
        }
    }
    elseif ($key === 'leave') {
        $s = $p->prepare("INSERT INTO {$x}leave_balances (person_key,name_key,full_name,email,phone,department,job_title,salary,hire_date,address,annual_leave,leave_balance,src,source_created,updated_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE name_key=VALUES(name_key),full_name=VALUES(full_name),phone=VALUES(phone),
             department=VALUES(department),job_title=VALUES(job_title),salary=VALUES(salary),hire_date=VALUES(hire_date),
             address=VALUES(address),annual_leave=VALUES(annual_leave),leave_balance=VALUES(leave_balance),
             src=VALUES(src),source_created=VALUES(source_created),updated_at=VALUES(updated_at)");
        foreach ($d['people'] as $r) { $s->execute([$r['person_key'],$r['name_key'],$r['full_name'],$r['email'],$r['phone'],$r['department'],$r['job_title'],$r['salary'],$r['hire_date'],$r['address'],$r['annual_leave'],$r['leave_balance'],$r['src'],$r['source_created'],$now]); $n++; }
    }
    elseif ($key === 'hardware') {
        $s = $p->prepare("INSERT INTO {$x}hardware (item_key,name_key,employee_name,department,computer_model,warranty_expiry,warranty_state,printer,scanner,updated_at)
             VALUES (?,?,?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE name_key=VALUES(name_key),employee_name=VALUES(employee_name),department=VALUES(department),
             computer_model=VALUES(computer_model),warranty_expiry=VALUES(warranty_expiry),warranty_state=VALUES(warranty_state),
             printer=VALUES(printer),scanner=VALUES(scanner),updated_at=VALUES(updated_at)");
        foreach ($d['devices'] as $r) { $s->execute([$r['item_key'],$r['name_key'],$r['employee_name'],$r['department'],$r['computer_model'],$r['warranty_expiry'],$r['warranty_state'],$r['printer'],$r['scanner'],$now]); $n++; }
    }

    log_sync($p, $x, $key, 'ok', 'synced', $n, $t0);
    return ['key'=>$key, 'ok'=>true, 'rows'=>$n];
}
function log_sync(PDO $p, string $x, string $k, string $r, string $m, int $n, float $t0): void {
    try { $p->prepare("INSERT INTO {$x}sync_log (source_key,result,message,rows_count,duration_ms,created_at) VALUES (?,?,?,?,?,?)")
        ->execute([$k,$r,mb_substr($m,0,380),$n,(int)round((microtime(true)-$t0)*1000),date('Y-m-d H:i:s')]); } catch (Throwable $e) {}
}

/* ══════════════════════════ طبقة التعديلات اليدوية ════════════════════════
 *  التعديلات تُخزَّن منفصلة عن بيانات الـ API، فتنجو من كل مزامنة.
 *  عند القراءة: تُدمج فوق بيانات المصدر · السجلات المضافة تُلحق · المحذوفة تُخفى.
 * ==========================================================================*/
function edits_for(?PDO $p, string $x, string $module): array {
    if (!$p) return [];
    try {
        $st = $p->prepare("SELECT record_key,payload,is_new,is_deleted,updated_at,updated_by FROM {$x}edits WHERE module=?");
        $st->execute([$module]);
        $out = [];
        foreach ($st->fetchAll() as $r) {
            $out[$r['record_key']] = [
                'data'    => json_decode((string)$r['payload'], true) ?: [],
                'new'     => (int)$r['is_new'] === 1,
                'deleted' => (int)$r['is_deleted'] === 1,
                'at'      => $r['updated_at'], 'by' => $r['updated_by'],
            ];
        }
        return $out;
    } catch (Throwable $e) { return []; }
}

/** يدمج التعديلات فوق مصفوفة سجلات */
function apply_edits(array $rows, array $edits, string $keyField, array $blank): array {
    $out = [];
    foreach ($rows as $r) {
        $k = (string)($r[$keyField] ?? '');
        $e = $edits[$k] ?? null;
        if ($e && $e['deleted']) continue;
        if ($e) { $r = array_merge($r, $e['data']); $r['_edited'] = $e['at']; $r['_editor'] = $e['by']; }
        $r['_key'] = $k; $r['_origin'] = 'api';
        $out[] = $r;
        if ($e) unset($edits[$k]);
    }
    foreach ($edits as $k => $e) {          // سجلات أضافها المستخدم
        if ($e['deleted'] || !$e['new']) continue;
        $r = array_merge($blank, $e['data']);
        $r[$keyField] = $k; $r['_key'] = $k; $r['_origin'] = 'local';
        $r['_edited'] = $e['at']; $r['_editor'] = $e['by'];
        $out[] = $r;
    }
    return $out;
}

const EDIT_FIELDS = [
  'employees'    => ['full_name','name_ar','department','job_title','email','account_name','access_level','status','emp_code'],
  'leave'        => ['full_name','email','phone','department','job_title','salary','hire_date','address','annual_leave','leave_balance'],
  'hardware'     => ['employee_name','department','computer_model','warranty_expiry','printer','scanner'],
  'applications' => ['app_name','description','version','app_type','status','app_url','date_created','last_update','app_code'],
];
const EDIT_KEY = ['employees'=>'emp_code','leave'=>'person_key','hardware'=>'item_key','applications'=>'app_code'];
const EDIT_BLANK = [
  'employees'=>['emp_code'=>'','full_name'=>'','name_ar'=>null,'department'=>null,'job_title'=>null,'email'=>null,
                'account_name'=>null,'access_level'=>'staff','status'=>'active','last_login'=>null,'name_key'=>''],
  'leave'=>['person_key'=>'','full_name'=>'','email'=>null,'phone'=>null,'department'=>null,'job_title'=>null,
            'salary'=>null,'hire_date'=>null,'address'=>null,'annual_leave'=>null,'leave_balance'=>null,'src'=>'manual','name_key'=>''],
  'hardware'=>['item_key'=>'','employee_name'=>'','department'=>null,'computer_model'=>null,'warranty_expiry'=>null,
               'warranty_state'=>'unknown','printer'=>0,'scanner'=>0,'name_key'=>''],
  'applications'=>['app_code'=>'','app_name'=>'','description'=>null,'version'=>null,'app_type'=>null,'status'=>'Active',
                   'app_url'=>null,'date_created'=>null,'last_update'=>null,'developers'=>[],'roles'=>[]],
];

/** ينظّف الحقول الواردة من الواجهة */
function clean_payload(string $module, array $in): array {
    $allow = EDIT_FIELDS[$module] ?? [];
    $out = [];
    foreach ($allow as $f) {
        if (!array_key_exists($f, $in)) continue;
        $v = $in[$f];
        if (is_string($v)) { $v = trim($v); if ($v === '') $v = null; }
        if (in_array($f, ['printer','scanner'], true))      $v = b2i($v);
        if (in_array($f, ['annual_leave','leave_balance'], true)) $v = ($v === null || $v === '') ? null : (int)$v;
        if ($f === 'salary')                                 $v = ($v === null || $v === '') ? null : (float)$v;
        if (in_array($f, ['hire_date','warranty_expiry','date_created','last_update'], true))
            $v = $v ? substr((string)$v, 0, 10) : null;
        $out[$f] = $v;
    }
    // حقول مشتقّة
    if (isset($out['full_name']))     $out['name_key'] = name_key((string)$out['full_name']);
    if (isset($out['employee_name'])) $out['name_key'] = name_key((string)$out['employee_name']);
    if (array_key_exists('warranty_expiry', $out)) $out['warranty_state'] = warranty_state($out['warranty_expiry']);
    return $out;
}

function save_edit(PDO $p, string $x, string $module, string $key, array $payload, bool $isNew, bool $del, string $actor): array {
    $now = date('Y-m-d H:i:s');
    $st = $p->prepare("SELECT payload,is_new FROM {$x}edits WHERE module=? AND record_key=?");
    $st->execute([$module, $key]);
    $cur = $st->fetch();
    $merged = array_merge(json_decode((string)($cur['payload'] ?? '{}'), true) ?: [], $payload);
    $isNew = $isNew || (int)($cur['is_new'] ?? 0) === 1;
    $p->prepare("INSERT INTO {$x}edits (module,record_key,payload,is_new,is_deleted,updated_by,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE payload=VALUES(payload),is_new=VALUES(is_new),is_deleted=VALUES(is_deleted),
        updated_by=VALUES(updated_by),updated_at=VALUES(updated_at)")
      ->execute([$module, $key, json_encode($merged, JSON_UNESCAPED_UNICODE), $isNew ? 1 : 0, $del ? 1 : 0, $actor, $now, $now]);
    $p->prepare("INSERT INTO {$x}audit (module,record_key,op,changes,actor,created_at) VALUES (?,?,?,?,?,?)")
      ->execute([$module, $key, $del ? 'delete' : ($isNew ? 'insert' : 'update'),
                 json_encode($payload, JSON_UNESCAPED_UNICODE), $actor, $now]);
    return ['ok'=>true, 'module'=>$module, 'key'=>$key, 'fields'=>count($payload)];
}

/* ══════════════════════════ قراءة من قاعدة البيانات ═══════════════════════ */
function db_read(PDO $p, string $x, string $key): ?array {
    try {
        if ($key === 'apps') {
            $emps = $p->query("SELECT emp_code,name_key,full_name,name_ar,department,job_title,email,account_name,access_level,status,last_login FROM {$x}employees ORDER BY emp_code")->fetchAll();
            if (!$emps) return null;
            $deps = $p->query("SELECT name,employees FROM {$x}departments ORDER BY name")->fetchAll();
            $apps = $p->query("SELECT app_code,app_name,description,version,app_type,status,developers,app_url,date_created,last_update FROM {$x}applications ORDER BY app_code")->fetchAll();
            $roles = $p->query("SELECT app_code,role_name,emp_code,emp_name,department FROM {$x}app_roles")->fetchAll();
            $by = []; foreach ($roles as $r) { $c = $r['app_code']; unset($r['app_code']); $by[$c][] = $r; }
            foreach ($apps as &$a) { $a['developers'] = json_decode((string)$a['developers'], true) ?: []; $a['roles'] = $by[$a['app_code']] ?? []; } unset($a);
            foreach ($deps as &$dd) $dd['employees'] = (int)$dd['employees']; unset($dd);
            $emps = apply_edits($emps, edits_for($p,$x,'employees'),    'emp_code', EDIT_BLANK['employees']);
            $apps = apply_edits($apps, edits_for($p,$x,'applications'), 'app_code', EDIT_BLANK['applications']);
            return ['employees'=>$emps,'applications'=>$apps,'departments'=>$deps];
        }
        if ($key === 'leave') {
            $r = $p->query("SELECT person_key,name_key,full_name,email,phone,department,job_title,salary,hire_date,address,annual_leave,leave_balance,src,source_created FROM {$x}leave_balances ORDER BY full_name")->fetchAll();
            if (!$r) return null;
            foreach ($r as &$q) { $q['salary'] = $q['salary']!==null?(float)$q['salary']:null;
                $q['annual_leave']=$q['annual_leave']!==null?(int)$q['annual_leave']:null;
                $q['leave_balance']=$q['leave_balance']!==null?(int)$q['leave_balance']:null; } unset($q);
            $r = apply_edits($r, edits_for($p,$x,'leave'), 'person_key', EDIT_BLANK['leave']);
            return ['people'=>$r];
        }
        if ($key === 'hardware') {
            $r = $p->query("SELECT item_key,name_key,employee_name,department,computer_model,warranty_expiry,warranty_state,printer,scanner FROM {$x}hardware ORDER BY employee_name")->fetchAll();
            if (!$r) return null;
            foreach ($r as &$q) { $q['printer']=(int)$q['printer']; $q['scanner']=(int)$q['scanner'];
                $q['warranty_state']=warranty_state($q['warranty_expiry']); } unset($q);
            $r = apply_edits($r, edits_for($p,$x,'hardware'), 'item_key', EDIT_BLANK['hardware']);
            return ['devices'=>$r];
        }
    } catch (Throwable $e) { return null; }
    return null;
}

/* ══════════════════════════ المسارات ══════════════════════════════════════ */
session_start();
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
if (empty($_SESSION['account_name'])) $_SESSION['account_name'] = $CFG['default_user'];

$action = $_GET['action'] ?? null;

/* ── حفظ / إضافة / حذف سجل ── */
if ($action === 'save') {
    header('Content-Type: application/json; charset=utf-8');
    $in = json_decode((string)file_get_contents('php://input'), true) ?: [];
    if (!hash_equals((string)$_SESSION['csrf'], (string)($in['csrf'] ?? ''))) {
        http_response_code(403); exit(json_encode(['ok'=>false,'error'=>'انتهت الجلسة — أعد تحميل الصفحة'], JSON_UNESCAPED_UNICODE));
    }
    $module = (string)($in['module'] ?? '');
    if (!isset(EDIT_FIELDS[$module])) { http_response_code(400); exit(json_encode(['ok'=>false,'error'=>'unknown module'], JSON_UNESCAPED_UNICODE)); }
    $p = db($CFG);
    if (!$p) { http_response_code(503); exit(json_encode(['ok'=>false,'error'=>'قاعدة البيانات غير متصلة — التعديل يحتاج اتصالاً بها'], JSON_UNESCAPED_UNICODE)); }
    db_install($p, $PFX);

    $op   = (string)($in['op'] ?? 'update');
    $key  = trim((string)($in['key'] ?? ''));
    $data = clean_payload($module, (array)($in['data'] ?? []));
    $kf   = EDIT_KEY[$module];

    if ($op === 'insert') {
        if ($key === '') {                       // ولّد مفتاحاً إن لم يُرسَل
            $base = $module === 'leave' ? (string)($data['email'] ?? '') : '';
            $key = $base !== '' ? mb_strtolower($base) : strtoupper(substr($module,0,3)) . '-' . substr(md5(uniqid('', true)), 0, 8);
        }
        $st = $p->prepare("SELECT 1 FROM {$PFX}edits WHERE module=? AND record_key=?");
        $st->execute([$module, $key]);
        if ($st->fetchColumn()) { http_response_code(409); exit(json_encode(['ok'=>false,'error'=>'المفتاح مستخدم مسبقاً'], JSON_UNESCAPED_UNICODE)); }
        $data[$kf] = $key;
        exit(json_encode(save_edit($p, $PFX, $module, $key, $data, true, false, (string)$_SESSION['account_name']) + ['key'=>$key], JSON_UNESCAPED_UNICODE));
    }
    if ($key === '') { http_response_code(400); exit(json_encode(['ok'=>false,'error'=>'missing key'], JSON_UNESCAPED_UNICODE)); }
    if ($op === 'delete')  exit(json_encode(save_edit($p, $PFX, $module, $key, [], false, true,  (string)$_SESSION['account_name']), JSON_UNESCAPED_UNICODE));
    if ($op === 'restore') exit(json_encode(save_edit($p, $PFX, $module, $key, [], false, false, (string)$_SESSION['account_name']), JSON_UNESCAPED_UNICODE));
    exit(json_encode(save_edit($p, $PFX, $module, $key, $data, false, false, (string)$_SESSION['account_name']), JSON_UNESCAPED_UNICODE));
}

/* ── سجل التغييرات ── */
if ($action === 'audit') {
    header('Content-Type: application/json; charset=utf-8');
    $p = db($CFG);
    if (!$p) exit(json_encode(['ok'=>false,'rows'=>[]], JSON_UNESCAPED_UNICODE));
    try { $r = $p->query("SELECT module,record_key,op,actor,created_at FROM {$PFX}audit ORDER BY id DESC LIMIT 60")->fetchAll(); }
    catch (Throwable $e) { $r = []; }
    exit(json_encode(['ok'=>true,'rows'=>$r], JSON_UNESCAPED_UNICODE));
}
if (in_array($action, ['install','sync','dbtest'], true)) {
    header('Content-Type: application/json; charset=utf-8');
    if (!hash_equals((string)$CFG['sync_token'], (string)($_GET['token'] ?? ''))) {
        http_response_code(403); exit(json_encode(['ok'=>false,'error'=>'invalid token'], JSON_UNESCAPED_UNICODE));
    }
    $p = db($CFG);
    if (!$p) exit(json_encode(['ok'=>false,'error'=>'تعذّر الاتصال بقاعدة البيانات — راجع config.php'], JSON_UNESCAPED_UNICODE));
    if ($action === 'dbtest') {
        $tt = [];
        foreach ($p->query("SHOW TABLES LIKE '{$PFX}%'")->fetchAll(PDO::FETCH_NUM) as $r)
            $tt[$r[0]] = (int)$p->query("SELECT COUNT(*) FROM `{$r[0]}`")->fetchColumn();
        exit(json_encode(['ok'=>true,'server'=>$p->getAttribute(PDO::ATTR_SERVER_VERSION),'tables'=>$tt], JSON_UNESCAPED_UNICODE));
    }
    if ($action === 'install') exit(json_encode(['ok'=>true] + db_install($p, $PFX), JSON_UNESCAPED_UNICODE));
    db_install($p, $PFX);
    $only = $_GET['key'] ?? null; $out = [];
    foreach ($EP as $k => $u) { if ($only && $only !== $k) continue;
        $out[] = $u ? sync_one($p, $PFX, $k, $u, $CFG['api_headers'], (bool)$CFG['store_snapshots'])
                    : ['key'=>$k,'ok'=>false,'error'=>'not configured']; }
    exit(json_encode(['ok'=>true,'synced_at'=>date('c'),'results'=>$out], JSON_UNESCAPED_UNICODE));
}

if (isset($_GET['api'])) {
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    $k = (string)$_GET['api'];
    if (!array_key_exists($k, $EP)) { http_response_code(404); exit(json_encode(['ok'=>false,'error'=>'unknown endpoint'], JSON_UNESCAPED_UNICODE)); }
    $fresh = !empty($_GET['fresh']);
    if (!$fresh && ($p = db($CFG)) && ($d = db_read($p, $PFX, $k)))
        exit(json_encode(['ok'=>true,'source'=>'db','fetched_at'=>date('c'),'data'=>$d], JSON_UNESCAPED_UNICODE));
    $url = $EP[$k];
    if (!$url) exit(json_encode(['ok'=>false,'source'=>'none','error'=>'endpoint not configured'], JSON_UNESCAPED_UNICODE));
    $cf = sys_get_temp_dir() . '/p2_' . md5($url) . '.json';
    if (!$fresh && $CFG['cache_ttl'] > 0 && is_readable($cf) && time()-filemtime($cf) < $CFG['cache_ttl']) exit(file_get_contents($cf));
    $res = http_get($url, $CFG['api_headers']);
    if (!$res['ok']) { http_response_code(502); exit(json_encode(['ok'=>false,'source'=>'none','error'=>$res['error'] ?? 'fetch error'], JSON_UNESCAPED_UNICODE)); }
    $raw = json_decode($res['body'], true);
    if (!is_array($raw)) { http_response_code(502); exit(json_encode(['ok'=>false,'source'=>'none','error'=>'invalid JSON'], JSON_UNESCAPED_UNICODE)); }
    $norm = normalize($k, $raw);
    if ($pp = db($CFG)) {                       // ادمج التعديلات اليدوية فوق البيانات المباشرة
        if ($k === 'apps') {
            $norm['employees']    = apply_edits($norm['employees'],    edits_for($pp,$PFX,'employees'),    'emp_code', EDIT_BLANK['employees']);
            $norm['applications'] = apply_edits($norm['applications'], edits_for($pp,$PFX,'applications'), 'app_code', EDIT_BLANK['applications']);
        } elseif ($k === 'leave')    $norm['people']  = apply_edits($norm['people'],  edits_for($pp,$PFX,'leave'),    'person_key', EDIT_BLANK['leave']);
        elseif   ($k === 'hardware') $norm['devices'] = apply_edits($norm['devices'], edits_for($pp,$PFX,'hardware'), 'item_key',   EDIT_BLANK['hardware']);
    }
    $out = json_encode(['ok'=>true,'source'=>'live','fetched_at'=>date('c'),'data'=>$norm], JSON_UNESCAPED_UNICODE);
    exit($out);
}

$dbs = ['enabled'=>(bool)$CFG['db']['enabled'],'connected'=>false,'tables'=>0,'last_sync'=>null,
        'name'=>$CFG['db']['name'],'host'=>$CFG['db']['host'],'counts'=>[]];
if ($p = db($CFG)) { $dbs['connected'] = true;
    try {
        $dbs['tables'] = count($p->query("SHOW TABLES LIKE '{$PFX}%'")->fetchAll());
        $dbs['last_sync'] = $p->query("SELECT created_at FROM {$PFX}sync_log ORDER BY id DESC LIMIT 1")->fetchColumn() ?: null;
        foreach (['employees','applications','leave_balances','hardware'] as $tb)
            $dbs['counts'][$tb] = (int)$p->query("SELECT COUNT(*) FROM {$PFX}{$tb}")->fetchColumn();
    } catch (Throwable $e) {}
}
$SRCINFO = [];
foreach ($EP as $k => $u) $SRCINFO[$k] = ['bound'=>(bool)$u, 'url'=>$u ?: null];
$BOOT = ['user'=>$_SESSION['account_name'] ?? $CFG['default_user'],
         'csrf'=>$_SESSION['csrf'],
         'canEdit'=>$dbs['connected'],
         'sources'=>$SRCINFO,
         'db'=>$dbs, 'server'=>['php'=>PHP_VERSION,'time'=>date('c'),'cache_ttl'=>$CFG['cache_ttl']]];
/* بصمة للملفات الثابتة حتى يلتقط المتصفح أي تعديل فوراً */
$ASSET_V = @filemtime(__DIR__ . '/style.css') . '-' . @filemtime(__DIR__ . '/app.js');
?>
<!doctype html>
<html lang="ar" dir="rtl" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>البوابة الداخلية | Internal Portal</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css?v=<?= $ASSET_V ?>">
</head>
<body>

<div class="bgfx" aria-hidden="true">
  <div class="mesh"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span><span class="blob b4"></span></div>
  <div class="grid"></div>
</div>

<header class="nav">
  <div class="brand">
    <div class="mark">IP</div>
    <div><b id="brandT">البوابة الداخلية</b><small id="brandS">Internal Portal</small></div>
  </div>
  <nav class="tabs" id="tabs"></nav>
  <div class="tools">
    <button class="nbtn" id="pickBtn" onclick="App.openPicker()" title="اختيار موظف">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
      <span id="pickLbl">اختيار موظف</span>
    </button>
    <button class="nbtn" id="refBtn" onclick="App.reload()" title="تحديث">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/></svg>
    </button>
    <button class="nbtn" onclick="App.theme()" title="الوضع الليلي">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
    </button>
    <button class="nbtn" id="langBtn" onclick="App.lang()">EN</button>
    <div class="who" onclick="App.openPicker()">
      <span class="ava s" id="whoAv">—</span>
      <span style="min-width:0"><span class="nm" id="whoNm">—</span></span>
    </div>
  </div>
</header>

<main class="wrap" id="view"></main>

<div class="bd" id="bd" onclick="App.closePicker()"></div>
<aside class="sheet" id="sheet">
  <header>
    <button class="btn s" onclick="App.closePicker()">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <h3 id="sheetT">اختيار موظف</h3>
  </header>
  <div style="padding:11px 12px 0">
    <input id="pickQ" type="search" placeholder="ابحث بالاسم أو الرمز…"
      style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--line-2);background:var(--panel);outline:none;font-size:13px"
      oninput="App.renderPicker()">
  </div>
  <div class="body" id="pickList"></div>
</aside>

<div class="modal-bd" id="modalBd" onclick="App.closeModal()"></div>
<section class="modal" id="modal" role="dialog" aria-modal="true">
  <header>
    <span class="ava" id="modalIcon" style="background:var(--acc)">+</span>
    <div style="flex:1;min-width:0"><h3 id="modalTitle" style="font-size:15px">—</h3>
      <div id="modalSub" style="font-size:11.5px;color:var(--ink-3)"></div></div>
    <button class="iconbtn" onclick="App.closeModal()">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </header>
  <div class="mb"><form id="modalForm" onsubmit="return App.submit(event)"><div class="fgrid" id="modalFields"></div></form></div>
  <footer>
    <button class="btn p" onclick="App.submit(event)" id="modalSave">حفظ</button>
    <button class="btn" onclick="App.closeModal()">إلغاء</button>
    <span id="modalMsg" style="margin-inline-start:auto;font-size:12px;color:var(--ink-3);align-self:center"></span>
  </footer>
</section>

<div class="toast" id="toast"></div>

<script>window.BOOT = <?= json_encode($BOOT, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) ?>;</script>
<script src="app.js?v=<?= $ASSET_V ?>"></script>
</body>
</html>
