<?php
/* ===========================================================================
 * ERP  |  config.php   —   للخادم فقط، لا يُرفع إلى GitHub
 * ---------------------------------------------------------------------------
 * AwardSpace تحجب كل اتصال صادر خارج خادمها، لذلك:
 *   • مصدرا الأنظمة والأجهزة على الخادم نفسه  →  تُقرأ مباشرة
 *   • مصدر الإجازات خارجي  →  يجلبه GitHub Actions ويرفعه إلى data/leave.json
 *   • النشر  →  GitHub Actions يدفع عبر FTP  (deploy.php لم يعد يُستعمل)
 * ========================================================================= */

return [

    /* -----------------------------------------------------------------
     * 1) DATABASE  —  AwardSpace MySQL
     * -----------------------------------------------------------------
     * قاعدة البيانات
     * ----------------------------------------------------------------- */
    'db' => [
        'enabled' => true,
        'host'    => 'fdb1028.awardspace.net',
        'port'    => 3306,
        'name'    => '4786925_howiyati',
        'user'    => '4786925_howiyati',
        'pass'    => 'CHANGE_ME_db_password',
        'charset' => 'utf8mb4',
        'prefix'  => 'portal_',
    ],

    /* -----------------------------------------------------------------
     * 2) DATA SOURCES
     *    apps / hardware : same server, reachable
     *    leave           : local copy, refreshed hourly by GitHub Actions
     * -----------------------------------------------------------------
     * مصادر البيانات
     * الأنظمة والأجهزة على الخادم نفسه فتُقرأ مباشرة
     * والإجازات نسخة محلية يحدّثها GitHub كل ساعة
     * ----------------------------------------------------------------- */
    'endpoints' => [
        'apps'     => 'http://amnaai.atwebpages.com/AppsManagement/api/api_applications.json',
        'hardware' => 'http://aldhaheri1907.atwebpages.com/Hardware/export_json.php',
        'leave'    => 'http://amnaai.atwebpages.com/ERP/data/leave.json',
    ],

    /* -----------------------------------------------------------------
     * 3) GENERAL
     * -----------------------------------------------------------------
     * رمز المزامنة يُطلب عند إنشاء الجداول وعند المزامنة
     * ----------------------------------------------------------------- */
    'api_headers'     => [],
    'cache_ttl'       => 90,
    'sync_token'      => 'CHANGE_ME_sync_token',
    'default_user'    => 'amna.aldhaheri',
    'store_snapshots' => true,

    /* -----------------------------------------------------------------
     * 4) GITHUB  —  kept for reference only
     *    deploy.php cannot reach GitHub from this host.
     *    Deployment now runs from GitHub Actions over FTP.
     * -----------------------------------------------------------------
     * هذا القسم للتوثيق فقط، النشر صار من GitHub Actions عبر FTP
     * ----------------------------------------------------------------- */
    'github' => [
        'owner'          => 'agaldhaheriai',
        'repo'           => 'ERP',
        'branch'         => 'main',
        'source_dir'     => 'public',
        'deploy_token'   => 'CHANGE_ME_deploy_token',
        'webhook_secret' => '',
        'github_token'   => '',
        'protect'        => ['config.php', '.deploy-state.json', 'deploy.log'],
    ],
];
