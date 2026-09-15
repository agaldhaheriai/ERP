-- ════════════════════════════════════════════════════════════════════════
--  ERPSYS — مخطط قاعدة البيانات (MySQL / MariaDB)
--  ------------------------------------------------------------------------
--  طريقتان لإنشاء الجداول — اختر واحدة:
--    أ) من البوابة:  /ERP/index.php?action=install&token=<sync_token>
--    ب) من phpMyAdmin على AwardSpace: استورد هذا الملف في قاعدة البيانات
--
--  الجداول 1–6 تُملأ تلقائياً من المزامنة مع ملفات الـ JSON.
--  الجدولان 7–8 يحفظان تعديلاتك اليدوية وتنجو من كل مزامنة لاحقة.
-- ════════════════════════════════════════════════════════════════════════

SET NAMES utf8mb4;

-- 1) الأقسام ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_departments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(160) NOT NULL,
  employees  INT DEFAULT 0,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uq_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) الموظفون (من api_applications.json) ──────────────────────────────
CREATE TABLE IF NOT EXISTS portal_employees (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  emp_code     VARCHAR(40)  NOT NULL,
  name_key     VARCHAR(190) NULL,
  full_name    VARCHAR(190) NOT NULL,
  name_ar      VARCHAR(190) NULL,
  department   VARCHAR(160) NULL,
  job_title    VARCHAR(160) NULL,
  email        VARCHAR(190) NULL,
  account_name VARCHAR(120) NULL,
  access_level VARCHAR(40)  NULL,
  status       VARCHAR(40)  NULL,
  last_login   DATETIME     NULL,
  updated_at   DATETIME     NOT NULL,
  UNIQUE KEY uq_code (emp_code),
  KEY ix_nk (name_key), KEY ix_dept (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) الأنظمة والتطبيقات ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_applications (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  app_code     VARCHAR(40)  NOT NULL,
  app_name     VARCHAR(190) NOT NULL,
  description  TEXT         NULL,
  version      VARCHAR(40)  NULL,
  app_type     VARCHAR(80)  NULL,
  status       VARCHAR(60)  NULL,
  developers   TEXT         NULL,
  app_url      VARCHAR(400) NULL,
  date_created DATE         NULL,
  last_update  DATE         NULL,
  updated_at   DATETIME     NOT NULL,
  UNIQUE KEY uq_app (app_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) أدوار الأنظمة ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_app_roles (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  app_code   VARCHAR(40)  NOT NULL,
  role_name  VARCHAR(120) NOT NULL,
  emp_code   VARCHAR(40)  NULL,
  emp_name   VARCHAR(190) NULL,
  department VARCHAR(160) NULL,
  updated_at DATETIME     NOT NULL,
  UNIQUE KEY uq_role (app_code, role_name, emp_code),
  KEY ix_app (app_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5) الإجازات السنوية (من leave_api.php) ───────────────────────────────
CREATE TABLE IF NOT EXISTS portal_leave_balances (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  person_key     VARCHAR(190) NOT NULL,
  name_key       VARCHAR(190) NULL,
  full_name      VARCHAR(190) NOT NULL,
  email          VARCHAR(190) NULL,
  phone          VARCHAR(60)  NULL,
  department     VARCHAR(160) NULL,
  job_title      VARCHAR(160) NULL,
  salary         DECIMAL(12,2) NULL,
  hire_date      DATE         NULL,
  address        VARCHAR(190) NULL,
  annual_leave   INT          NULL,
  leave_balance  INT          NULL,
  src            VARCHAR(40)  NULL,
  source_created DATETIME     NULL,
  updated_at     DATETIME     NOT NULL,
  UNIQUE KEY uq_person (person_key),
  KEY ix_nk (name_key), KEY ix_dept (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6) الأجهزة والضمان (من export_json.php) ──────────────────────────────
CREATE TABLE IF NOT EXISTS portal_hardware (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  item_key        VARCHAR(190) NOT NULL,
  name_key        VARCHAR(190) NULL,
  employee_name   VARCHAR(190) NOT NULL,
  department      VARCHAR(160) NULL,
  computer_model  VARCHAR(190) NULL,
  warranty_expiry DATE         NULL,
  warranty_state  VARCHAR(20)  NULL,
  printer         TINYINT(1)   DEFAULT 0,
  scanner         TINYINT(1)   DEFAULT 0,
  updated_at      DATETIME     NOT NULL,
  UNIQUE KEY uq_item (item_key),
  KEY ix_nk (name_key), KEY ix_w (warranty_state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7) تعديلاتك اليدوية — تُطبَّق فوق بيانات الـ API ولا تُمحى بالمزامنة ──
CREATE TABLE IF NOT EXISTS portal_edits (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  module     VARCHAR(30)  NOT NULL,   -- employees | leave | hardware | applications
  record_key VARCHAR(190) NOT NULL,
  payload    JSON         NULL,       -- الحقول المعدّلة فقط
  is_new     TINYINT(1)   DEFAULT 0,  -- 1 = سجل أضفته أنت
  is_deleted TINYINT(1)   DEFAULT 0,  -- 1 = مخفي من البوابة
  updated_by VARCHAR(120) NULL,
  created_at DATETIME     NOT NULL,
  updated_at DATETIME     NOT NULL,
  UNIQUE KEY uq_edit (module, record_key),
  KEY ix_mod (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8) سجل التغييرات ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portal_audit (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  module     VARCHAR(30)  NOT NULL,
  record_key VARCHAR(190) NOT NULL,
  op         VARCHAR(12)  NOT NULL,   -- insert | update | delete
  changes    JSON         NULL,
  actor      VARCHAR(120) NULL,
  created_at DATETIME     NOT NULL,
  KEY ix_mod (module), KEY ix_t (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9) نسخ خام من كل استجابة JSON + سجل المزامنة ─────────────────────────
CREATE TABLE IF NOT EXISTS portal_snapshots (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  source_key VARCHAR(40)  NOT NULL,
  source_url VARCHAR(500) NULL,
  payload    LONGTEXT     NOT NULL,
  fetched_at DATETIME     NOT NULL,
  KEY ix_key (source_key), KEY ix_t (fetched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portal_sync_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  source_key  VARCHAR(40)  NOT NULL,
  result      VARCHAR(20)  NOT NULL,
  message     VARCHAR(400) NULL,
  rows_count  INT DEFAULT 0,
  duration_ms INT DEFAULT 0,
  created_at  DATETIME     NOT NULL,
  KEY ix_key (source_key), KEY ix_t (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
