# النشر عبر FTP — البديل بعد اكتشاف حجب AwardSpace

## لماذا تغيّرت الطريقة

فحص `probe.php` أثبت أن AwardSpace تحجب **كل** اتصال صادر خارج خادمها:

| الوجهة | النتيجة |
|---|---|
| `amnaai.atwebpages.com:80` · نفس الخادم | ✅ HTTP 200 |
| `aldhaheri1907.atwebpages.com:80` · نفس الخادم | ✅ HTTP 200 |
| `fifthday.free.je:443` · خارجي | ❌ Connection refused |
| `api.github.com:443` · خارجي | ❌ Connection refused |
| `example.com:80` · خارجي | ❌ Network unreachable |

عنوان الخادم `185.176.43.100` هو نفسه عنوان الموقعين اللذين نجحا — فالمسموح هو الخادم نفسه لا منفذ معيّن.

لذلك: `deploy.php` لا يستطيع السحب من GitHub، والبوابة لا تستطيع قراءة مصدر الإجازات.
الحل أن **يدفع GitHub** بدل أن تسحب الاستضافة — الاتصال يصبح وارداً، والوارد غير محجوب.

```
GitHub Actions ──┬── يجلب leave_api.php ──┐
                 │                         ├── FTP ──▶ /ERP/
                 └── يأخذ public/        ──┘
```

---

## الخطوة ١ — بيانات FTP من AwardSpace

لوحة AwardSpace ← **Hosting Tools** ← **FTP Accounts**

أنشئي حساباً (أو استعملي الموجود) وسجّلي أربع قيم:

| القيمة | مثال |
|---|---|
| الخادم | `ftp.awardspace.net` |
| اسم المستخدم | `4786925_amna` |
| كلمة المرور | التي تضعينها |
| المجلد | `/amnaai.atwebpages.com/ERP` |

> اختاري كلمة مرور **بلا فاصلة `,`** — بعض إصدارات أدوات FTP تفسّرها فاصلاً.

---

## الخطوة ٢ — الأسرار في GitHub

المستودع `ERP` ← **Settings** ← **Secrets and variables** ← **Actions** ← **New repository secret**

أنشئي أربعة، بالأسماء هذه حرفياً:

| الاسم | القيمة |
|---|---|
| `FTP_HOST` | `ftp.awardspace.net` |
| `FTP_USER` | اسم مستخدم FTP |
| `FTP_PASS` | كلمة مروره |
| `FTP_DIR` | `/amnaai.atwebpages.com/ERP` |

الأسرار مخفية في السجلات ولا يراها أحد بعد الحفظ، ولا تدخل الكود.

---

## الخطوة ٣ — ملف الـ workflow

انسخي `deploy.yml` إلى `.github/workflows/deploy.yml` في جذر المستودع، ثم:

```bash
git add .github/workflows/deploy.yml
git commit -m "نشر عبر FTP"
git push
```

الرفع نفسه يشغّل النشر. تابعيه من تبويب **Actions**.

---

## الخطوة ٤ — الإعدادات على الخادم

استبدلي `/ERP/config.php` بالنسخة الجديدة، واملئي قيمتين فقط:

| السطر | المفتاح |
|---|---|
| 25 | كلمة مرور قاعدة البيانات |
| 55 | `sync_token` |

الفرق عن النسخة السابقة: مصدر الإجازات صار `http://amnaai.atwebpages.com/ERP/data/leave.json` — ملف محلي على الخادم نفسه، يحدّثه GitHub كل ساعة.

---

## الخطوة ٥ — نظّفي

احذفي من `/ERP/` ما لم يعد له عمل:

- `probe.php` — أدّى غرضه
- `deploy.php` — لا يستطيع الوصول إلى GitHub، وبقاؤه يفتح سطحاً بلا فائدة

---

## الخطوة ٦ — شغّلي البوابة

```
index.php?action=install&token=<sync_token>     ← إنشاء الجداول
index.php?action=sync&token=<sync_token>        ← أول مزامنة
/ERP/                                            ← البوابة
```

في صفحة **المصادر والمزامنة** يجب أن تظهر المصادر الثلاثة خضراء.

---

## دورة العمل بعد اليوم

```bash
# عدّلي ملفات public/ ثم:
git add . && git commit -m "وصف" && git push
```

خلال دقيقة يرفع GitHub الملفات إلى `/ERP/`. ويعمل تلقائياً كل ساعة أيضاً لتحديث ملف الإجازات وحده.
ويمكنك تشغيله يدوياً وقتما شئت: تبويب **Actions** ← **Deploy to AwardSpace** ← **Run workflow**.

---

## ما يحميه النشر

| الملف | يُرفع؟ |
|---|---|
| `index.php` · `style.css` · `app.js` | ✅ من `public/` |
| `data/leave.json` | ✅ يُجلب ويُرفع |
| `config.php` | ❌ مستثنى — إعداداتك لا تُدهس |
| `deploy.log` · `.deploy-state.json` | ❌ مستثناة |

وقبل كل رفع يتحقق الـ workflow من وجود الملفات الثلاثة، ويتوقف بخطأ صريح لو وجد `config.php` قد تسرّب إلى المستودع.

---

## إن فشل الـ workflow

| الرسالة | السبب والحل |
|---|---|
| `أسرار FTP غير مضبوطة` | نقص أحد الأربعة أو خطأ في الاسم |
| `Login failed` | اسم المستخدم أو كلمة المرور |
| `Access failed: No such file` | `FTP_DIR` خاطئ — تحققي من المسار الكامل في File Manager |
| `تعذّر جلب مصدر الإجازات` | تحذير لا خطأ: يُرفع الكود وتبقى نسخة الإجازات السابقة |
| نجح الرفع والبوابة لم تتغيّر | ذاكرة المتصفح — `Ctrl+F5` |
