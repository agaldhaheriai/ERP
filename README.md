# erp-portal — البوابة الداخلية

تطبيق **مستقل** داخل مستودع ERPSYS. لا يشترك مع منصّة ERPSYS في أي ملف أو جدول:

| | منصّة ERPSYS | erp-portal |
|---|---|---|
| المعمارية | MVC (router · modules · views) | ملف واحد + CSS + JS |
| مجلد النشر | `/erpsys` | `/ERP` |
| بادئة الجداول | `erp_` | `portal_` |
| الإعدادات | `config/config.php` | `erp-portal/public/config.php` |

```
erp-portal/
├─ public/              ← هذا وحده ما يُنشر إلى /ERP/
│  ├─ index.php  style.css  app.js
│  ├─ deploy.php         ★ الوصلة بين GitHub و AwardSpace
│  ├─ config.sample.php  نموذج — يُنسخ باسم config.php على الخادم
│  └─ .htaccess
├─ db/schema.sql         ١٠ جداول بادئتها portal_
├─ github-workflow/deploy.yml   ← انسخه إلى .github/workflows/ إن أردت النشر عبر Actions
├─ SETUP.md              ← الخطوات كاملة
└─ README.md            (هذا الملف)
```

## ما تفعله البوابة

تقرأ من ثلاثة أنظمة عبر JSON، تُطابق الموظفين بينها بالاسم، وتخزّن النتيجة في
قاعدة بيانات AwardSpace — مع إضافة وتعديل وحذف تُحفظ في `portal_edits` وتنجو من كل مزامنة.

| المفتاح | المصدر | ما يُقرأ منه |
|---|---|---|
| `apps` | `amnaai.atwebpages.com/AppsManagement/api/api_applications.json` | الموظفون · الأقسام · الأنظمة · الأدوار |
| `leave` | `fifthday.free.je/leave_api.php` | الإجازة السنوية والرصيد · الراتب · التعيين |
| `hardware` | `aldhaheri1907.atwebpages.com/Hardware/export_json.php` | موديل الجهاز · الضمان · الطابعة · السكانر |

## التركيب

اتبع **[SETUP.md](SETUP.md)**.
