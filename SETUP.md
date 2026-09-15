# خطوات التركيب — من الصفر إلى بوابة تعمل

المدة المتوقعة: ٢٠–٣٠ دقيقة. اتبع الخطوات بالترتيب.

قبل البدء جهّز ثلاث كلمات سر ستكتبها أنت (اكتبها في ورقة الآن):

| الاسم | استعماله | مثال |
|---|---|---|
| `sync_token` | تشغيل المزامنة وإنشاء الجداول | `sync-9f3k2j7xQp` |
| `deploy_token` | النشر اليدوي من الرابط | `dep-4mZ8vR1tLw` |
| `webhook_secret` | توقيع الويبهوك القادم من GitHub | `hook-7bN2xK9sEy` |

> اجعل كلاً منها طويلة وعشوائية ومختلفة عن الأخريين. لا تضعها في GitHub.

---

## الخطوة ١ — رفع المستودع إلى GitHub

البوابة تعيش داخل مستودع **ERPSYS** في مجلد `erp-portal/` — مستقلة تماماً عن
منصّة ERPSYS نفسها (التي تُنشر إلى `/erpsys`)، ولا تتداخل معها في أي ملف.

1. إن لم يكن المستودع مرفوعاً بعد، أنشئ واحداً باسم **`ERPSYS`** من
   [github.com/new](https://github.com/new) — اختر **Private** إن أردت
   (الوصلة تدعم المستودع الخاص، انظر الخطوة ٥-ب). **لا** تضف README أو .gitignore من الشاشة.
   ثم:

```bash
cd "C:\Users\Administrator\Desktop\VideCoding\ERPSYS"
git init
git branch -M main
git remote add origin https://github.com/agaldhaheriai/ERPSYS.git
```

2. في كل الحالات — ارفع:

```bash
cd "C:\Users\Administrator\Desktop\VideCoding\ERPSYS"

git add .
git commit -m "erp-portal: البوابة الداخلية + وصلة النشر"
git push
```

3. **تأكّد الآن** أن `erp-portal/public/config.php` **غير** موجود في المستودع على GitHub.
   يجب أن ترى `config.sample.php` فقط. إن ظهر `config.php` فأزِله فوراً:

```bash
git rm --cached erp-portal/public/config.php
git commit -m "إزالة ملف الإعدادات من المستودع"
git push
```

---

## الخطوة ٢ — قاعدة البيانات على AwardSpace

قاعدة البيانات موجودة لديك: `4786925_howiyati` على `fdb1028.awardspace.net`.

1. ادخل لوحة AwardSpace ← **Hosting Tools** ← **MySQL Databases** ← **phpMyAdmin**.
2. اختر قاعدة `4786925_howiyati` ← تبويب **Import**.
3. ارفع الملف `erp-portal/db/schema.sql` من المستودع ← **Go**.
4. يجب أن تظهر ١٠ جداول تبدأ بـ `portal_`.

> بديل: تستطيع تخطّي هذه الخطوة وإنشاء الجداول لاحقاً من البوابة نفسها
> عبر `?action=install` (الخطوة ٦).

---

## الخطوة ٣ — المجلد على الاستضافة

1. من لوحة AwardSpace ← **File Manager** (أو أي FTP).
2. ادخل مجلد الموقع `amnaai.atwebpages.com` وأنشئ بداخله مجلداً اسمه **`ERP`**.
3. ارفع فيه هذه الملفات الثلاثة من `erp-portal/public/` **يدوياً هذه المرة فقط**:

```
ERP/
├─ deploy.php
├─ config.sample.php
└─ .htaccess
```

> بعد هذه المرة لن تحتاج FTP أبداً — `deploy.php` سيجلب بقية الملفات وكل تحديث لاحق.
> إن لم يظهر `.htaccess` في مدير الملفات فعليك تفعيل «إظهار الملفات المخفية».

---

## الخطوة ٤ — ملف الإعدادات على الخادم

1. في مجلد `ERP/` **انسخ** `config.sample.php` باسم **`config.php`**
   (في File Manager: زر يمين ← Copy، ثم أعد التسمية).
2. افتح `config.php` للتحرير واملأ:

```php
'db' => [
    'pass' => 'كلمة مرور قاعدة البيانات من لوحة AwardSpace',
],

'sync_token' => 'sync-9f3k2j7xQp',          // من جدول كلمات السر

'github' => [
    'owner'          => 'agaldhaheriai',     // اسم حسابك على GitHub
    'repo'           => 'ERPSYS',
    'branch'         => 'main',
    'source_dir'     => 'erp-portal/public',
    'deploy_token'   => 'dep-4mZ8vR1tLw',
    'webhook_secret' => 'hook-7bN2xK9sEy',
    'github_token'   => '',                  // فارغ للمستودع العام
],
```

3. احفظ الملف.

---

## الخطوة ٥ — فحص الوصلة ثم أول نشر

### ٥-أ) الفحص

افتح في المتصفح:

```
https://amnaai.atwebpages.com/ERP/deploy.php?action=status&token=dep-4mZ8vR1tLw
```

يجب أن ترى:

```json
"github_reachable": true,
"server": { "curl": true, "ZipArchive": true, "writable": true, "pdo_mysql": true }
```

| إن ظهر | المعنى والحل |
|---|---|
| `"github_reachable": false` | الاستضافة لا تصل إلى GitHub — راجع «إن لم ينجح النشر» بالأسفل |
| `"ZipArchive": false` | طبيعي — الوصلة ستنتقل تلقائياً إلى طريقة الملف-ملف |
| `"writable": false` | صلاحيات مجلد `ERP` — اجعلها `755` من File Manager |
| `رمز النشر غير صحيح` | `deploy_token` في الرابط ≠ الذي في `config.php` |

### ٥-ب) للمستودع الخاص فقط

إن جعلت المستودع Private، أنشئ رمز وصول:
**GitHub ← Settings ← Developer settings ← Personal access tokens ← Fine-grained tokens**
→ اختر مستودع `ERPSYS` فقط → صلاحية **Contents: Read-only** → انسخ الرمز وضعه في
`github_token` داخل `config.php`.

### ٥-ج) أول نشر

```
https://amnaai.atwebpages.com/ERP/deploy.php?action=deploy&token=dep-4mZ8vR1tLw
```

يجب أن ترى `"ok": true` وقائمة `added` فيها `index.php` و `style.css` و `app.js`.
افتح مجلد `ERP` في File Manager — ستجد الملفات وصلت.

---

## الخطوة ٦ — تشغيل البوابة

```
https://amnaai.atwebpages.com/ERP/index.php?action=install&token=sync-9f3k2j7xQp   ← إنشاء الجداول
https://amnaai.atwebpages.com/ERP/index.php?action=sync&token=sync-9f3k2j7xQp      ← أول مزامنة
https://amnaai.atwebpages.com/ERP/                                                  ← البوابة
```

الخطوتان الأولى والثانية متاحتان أيضاً من داخل البوابة: صفحة **المصادر والمزامنة**.

---

## الخطوة ٧ — النشر التلقائي بعد كل push

اختر **واحدة** من الطريقتين.

### الطريقة أ — Webhook (الأبسط، موصى بها)

1. GitHub ← مستودع `ERPSYS` ← **Settings** ← **Webhooks** ← **Add webhook**
2. املأ:

| الحقل | القيمة |
|---|---|
| Payload URL | `https://amnaai.atwebpages.com/ERP/deploy.php` |
| Content type | `application/json` |
| Secret | `hook-7bN2xK9sEy` (نفس `webhook_secret`) |
| Which events | **Just the push event** |
| Active | ✅ |

3. **Add webhook**. سيرسل GitHub طلب `ping` فوراً — افتح الويبهوك وانظر
   **Recent Deliveries**: يجب أن يكون أخضر ويردّ `{"ok":true,"pong":true}`.

الآن كل `git push` على `main` ينشر تلقائياً خلال ثوانٍ.

### الطريقة ب — GitHub Actions

إن لم يصل الويبهوك (بعض الاستضافات المجانية تحجب طلبات GitHub الواردة)، استخدم
ملف `erp-portal/github-workflow/deploy.yml` — انسخه إلى `.github/workflows/deploy.yml` في جذر المستودع. يحتاج سرّين:

GitHub ← **Settings** ← **Secrets and variables** ← **Actions** ← **New repository secret**

| الاسم | القيمة |
|---|---|
| `DEPLOY_URL` | `https://amnaai.atwebpages.com/ERP/deploy.php` |
| `DEPLOY_TOKEN` | `dep-4mZ8vR1tLw` |

بعدها يعمل تلقائياً بعد كل push، وتستطيع تشغيله يدوياً من تبويب **Actions** ← **Run workflow**.

---

## دورة العمل اليومية

```bash
# عدّل ملفات erp-portal/public/ على جهازك، ثم:
git add .
git commit -m "وصف التعديل"
git push
```

خلال ثوانٍ يصل التعديل إلى `amnaai.atwebpages.com/ERP/` تلقائياً.
`index.php` يضيف بصمة للـ CSS و JS، فالمتصفح يلتقط الجديد فوراً بلا مسح ذاكرة.

**لا تعدّل الملفات مباشرة على الاستضافة** — أي نشر لاحق سيدهسها. المصدر الوحيد هو GitHub.
الاستثناء: `config.php` محميّ ولا يُمسّ أبداً.

---

## أوامر مرجعية

| الرابط | ما يفعله |
|---|---|
| `deploy.php?action=status&token=…` | فحص البيئة والاتصال بـ GitHub وآخر نشر |
| `deploy.php?action=deploy&token=…` | نشر يدوي (يتخطّى إن لم تتغيّر الشيفرة) |
| `deploy.php?action=deploy&force=1&token=…` | نشر إجباري حتى دون تغيير |
| `deploy.php?action=log&token=…` | سجل عمليات النشر |
| `index.php?action=install&token=…` | إنشاء جداول قاعدة البيانات |
| `index.php?action=sync&token=…` | مزامنة كل المصادر |
| `index.php?action=sync&key=leave&token=…` | مزامنة مصدر واحد |
| `index.php?action=dbtest&token=…` | اختبار الاتصال بقاعدة البيانات وعدّ الصفوف |

### مزامنة تلقائية كل ساعة (اختياري)

من لوحة AwardSpace ← **Cron Jobs**:

```
curl -s "https://amnaai.atwebpages.com/ERP/index.php?action=sync&token=sync-9f3k2j7xQp"
```

---

## إن لم ينجح النشر

الاستضافات المجانية أحياناً تمنع الاتصال الصادر. جرّب بالترتيب:

1. **`"github_reachable": false` في status** — الاستضافة لا تصل إلى GitHub.
   جرّب ترقية الحزمة، أو استعمل الحل الاحتياطي رقم ٣.

2. **`ZipArchive` غير متاح** — لا تفعل شيئاً؛ الوصلة تنتقل وحدها إلى تنزيل الملفات
   واحداً واحداً عبر واجهة GitHub. أبطأ قليلاً لكنه يعمل.

3. **الحل الاحتياطي: النشر اليدوي**
   من GitHub اضغط **Code ← Download ZIP**، فُكّ الضغط، وارفع محتويات `public/`
   إلى `ERP/` عبر File Manager (من مجلد `erp-portal/public/`) — **ما عدا `config.php`**.

4. **الويبهوك أحمر في Recent Deliveries** — انتقل إلى الطريقة ب (GitHub Actions).

5. **`"failed"` فيها ملفات** — صلاحيات الكتابة. اجعل مجلد `ERP` = `755`
   والملفات `644` من File Manager.

---

## الأمان — تذكير أخير

- `config.php` لا يُرفع إلى GitHub. تأكّد بعد كل `git push` بنظرة سريعة على المستودع.
- غيّر كلمة مرور قاعدة البيانات من لوحة AwardSpace إلى كلمة قوية بعد انتهاء التجربة.
- `deploy_token` و `webhook_secret` و `sync_token` ثلاثتها تُعطي صلاحيات — عاملها ككلمات مرور.
- `.htaccess` يمنع تنزيل `config.php` و `deploy.log` من المتصفح. إن كانت استضافتك
  لا تدعمه، تحقّق يدوياً أن `…/ERP/config.php` لا يعرض محتواه.
- ضع البوابة خلف نظام تسجيل الدخول لديك، واضبط `$_SESSION['account_name']`
  باسم حساب الموظف ليرى ملفه تلقائياً.
