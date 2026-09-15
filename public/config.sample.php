<?php
/* ============================================================================
 *  ERPSYS — البوابة الداخلية
 *  config.php  ·  انسخ هذا الملف باسم config.php على الخادم فقط
 *  ---------------------------------------------------------------------------
 *  ⚠️  config.php مستبعَد من Git (.gitignore) لأنه يحوي كلمات المرور.
 *      لا ترفعه إلى GitHub أبداً. يبقى على الاستضافة وحدها.
 * ==========================================================================*/
return [

    /* ── 1) قاعدة البيانات على AwardSpace ─────────────────────────────────
     *  القيم من: لوحة AwardSpace ← Hosting Tools ← MySQL Databases
     */
    'db' => [
        'enabled' => true,
        'host'    => 'fdb1028.awardspace.net',
        'port'    => 3306,
        'name'    => '4786925_howiyati',
        'user'    => '4786925_howiyati',
        'pass'    => 'ضع-كلمة-المرور-هنا',
        'charset' => 'utf8mb4',
        'prefix'  => 'portal_',
    ],

    /* ── 2) مصادر البيانات (ملفات JSON) ───────────────────────────────── */
    'endpoints' => [
        'apps'     => 'http://amnaai.atwebpages.com/AppsManagement/api/api_applications.json',
        'leave'    => 'https://fifthday.free.je/leave_api.php',
        'hardware' => 'http://aldhaheri1907.atwebpages.com/Hardware/export_json.php',
    ],

    'api_headers'     => [],
    'cache_ttl'       => 90,
    'sync_token'      => 'ضع-رمزاً-سرياً-طويلاً-هنا',
    'default_user'    => 'amna.aldhaheri',
    'store_snapshots' => true,

    /* ── 3) الوصلة مع GitHub (يستخدمها deploy.php) ────────────────────────
     *  owner/repo  = اسم حسابك واسم المستودع على GitHub
     *  branch      = الفرع الذي يُنشر منه
     *  source_dir  = المجلد داخل المستودع الذي يُنسخ إلى /ERP/  (erp-portal/public)
     *  deploy_token= رمز سرّي تكتبه أنت — يُطلب عند النشر اليدوي
     *  webhook_secret = نفس القيمة التي تضعها في إعدادات Webhook على GitHub
     *  github_token= اتركه فارغاً للمستودعات العامة.
     *                للمستودع الخاص: Personal Access Token بصلاحية "Contents: read"
     *  protect     = ملفات لا يمسّها النشر أبداً (إعداداتك وسجلاتك)
     *                .htaccess ليس منها — فهو في المستودع ويُحدَّث مع الكود.
     */
    'github' => [
        'owner'          => 'agaldhaheriai',
        'repo'           => 'ERPSYS',
        'branch'         => 'main',
        'source_dir'     => 'erp-portal/public',
        'deploy_token'   => 'ضع-رمز-نشر-سرياً-هنا',
        'webhook_secret' => 'ضع-سر-الويبهوك-هنا',
        'github_token'   => '',
        'protect'        => ['config.php', '.deploy-state.json', 'deploy.log'],
    ],
];
