#  پرشینر : تجربه روان فارسی در وب (افزونه کروم)​


<div align="center">

![Extension Icon](icons/icon128.png)

**P E R S I A N E R**

**تجربه روان فارسی در وبگردی**

**تبدیل شگفت انگیز انواع تاریخ میلادی به شمسی**

**راست‌چین سازی خودکار متون‌ فارسی و پاسخ‌های هوش مصنوعی**



[![Download Persianer](https://img.shields.io/badge/Download-ZIP%20v2.0.2-1f7a4c?style=for-the-badge&logo=github&logoColor=white)](https://github.com/MohammadKani/Persianer/releases/download/2.0.2/Persianer_2.0.2.zip)

**دانلود سریع افزونه: [Persianer_2.0.2.zip](https://github.com/MohammadKani/Persianer/releases/download/2.0.2/Persianer_2.0.2.zip)**

</div>

## ​


<div align="center">

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/Version-05.03.28-success?style=for-the-badge)](https://github.com/MohammadKani/Persianer)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**توسعه یافته با ❤️ برای جامعه فارسی‌زبان**


</div>

---

## پرشینر چیه؟ 🤔

پرشینر یک افزونه سبک برای Chrome است که صفحه‌های وب را برای کاربر فارسی‌زبان راحت‌تر می‌کند.

کار اصلی آن:

- 📅 تاریخ میلادی را هرکجا که باشه به شمسی (جلالی) تبدیل می‌کند.
- 📝 متن‌های فارسی را هوشمندانه راست‌چین می‌کند و فونت مناسب می‌دهد.
- 📊 حتی در اکثر چارت‌ها و نمودارها کار می‌کند.
- 🎚️ با سیستم پروفایل، تنظیمات متفاوتی برای سایت‌های مختلف داشته باشید.
- ⚡ روی همان تب فعال کار می‌کند و استفاده از آن خیلی ساده است.

---

## جدید در نسخه ۲.۰ 🆕

سیستم پروفایل جایگزین دو سوئیچ ساده قبلی شد. حالا می‌توانید:

- ✅ **چند پروفایل همزمان فعال** داشته باشید (OR-merge)
- ✅ **۶ پروفایل پیش‌فرض** برای سایت‌های پرکاربرد (خاموش، پیش‌فرض، کلاد، چت‌جی‌پی‌تی، گیتهاب کوپایلوت، گوگل)
- ✅ **وایت‌لیست و بلک‌لیست با regex** برای هر پروفایل
- ✅ **انتخاب فونت** از بین ۱۰ فونت رایج فارسی + ورودی آزاد
- ✅ **راست‌چین کل صفحه** (`dir=rtl` روی `<body>`) به‌عنوان جایگزین راست‌چین جمله‌ای
- ✅ **ساخت پروفایل سفارشی** با نام، رنگ و تنظیمات دلخواه
- ✅ **نشان «منطبق با این صفحه»** در popup برای پروفایل‌های سازگار
- ✅ **صفحه تنظیمات کامل** با سایدبار لیست پروفایل‌ها و فرم ویرایش
- ✅ **مهاجرت خودکار** از نسخه ۱.۰ (تنظیمات قدیمی `enabled`/`autoRtlEnabled` حفظ می‌شوند)

---

## امکانات اصلی 🌟

### 1) تبدیل تاریخ میلادی به شمسی 📆

نمونه‌هایی که تشخیص می‌دهد:

- `2024-11-15`
- `2024-11-15 14:30:00`
- `11/15/2024` (با درنظرگرفتن ابهام US/EU)
- `15.11.2024` (استاندارد اروپایی)
- `Sep`، `November 15, 2024`، `15 September`
- `۱۴۰۳/۰۸/۲۵` (هم‌ارز شمسی برای خروجی)

**اولویت تشخیص الگو:** فرمت‌های دارای ساعت **همیشه** قبل از فرمت‌های بدون ساعت بررسی می‌شوند تا «14:30» اشتباهی بخشی از تاریخ نشود.

### 2) راست‌چین خودکار فارسی 🧭

- متن‌های فارسی (بیش از N کاراکتر) در بلاک‌های `<p>`, `<div>`, `<li>`, `<td>`, `<h1>`-`<h6>`, `<blockquote>`, `<section>`, `<article>`, `<figure>`, `<figcaption>`, `<pre>` و… راست‌چین می‌شوند.
- **حداقل تعداد کاراکتر فارسی** قابل تنظیم در هر پروفایل (پیش‌فرض: ۱۰).
- **رصدگر تغییرات (MutationObserver)** برای محتوایی که بعداً بارگذاری می‌شود (SPA، داشبوردها).
- نودهایی که فارسی‌شان فقط از تبدیل تاریخ آمده، دوباره راست‌چین نمی‌شوند (`WeakSet` نگهداری می‌شود).

### 3) راست‌چین کل صفحه ↔️

- قابل جایگزینی با «راست‌چین جملات فارسی» در **هر پروفایل** (mutually exclusive در فرم).
- با فعال‌بودن، `dir="rtl"` روی `<body>` تنظیم می‌شود.
- برای سایت‌هایی مثل GitHub Copilot که کل چیدمان RTL می‌خواهند، مناسب است.

### 4) فونت قابل تنظیم 🔤

- لیست ۱۰ فونت منتخب: Sahel، Vazir، Vazirmatn، Shabnam، IRANSans، IRANSansX، Estedad، Tahoma، Segoe UI، Arial
- امکان **ورود آزاد** نام فونت دلخواه
- فونت انتخابی در CSS تزریق‌شده `<style id="persianer-rtl-style">` اعمال می‌شود
- رویداد `Persianer-font-change` برای اعمال زنده بدون رفرش تب

---

## سیستم پروفایل‌ها 🎚️

### مفاهیم پایه

| مفهوم | توضیح |
|---|---|
| **پروفایل** | یک بسته تنظیمات با نام، رنگ و لیست سایت‌های هدف |
| **پروفایل فعال** | پروفایلی که تیک خورده و روی صفحات اعمال می‌شود |
| **چند فعال همزمان** | چند پروفایل می‌توانند هم‌زمان فعال باشند |
| **انطباق (match)** | هاست فعلی با وایت‌لیست پروفایل سازگار است و با بلک‌لیست ناسازگار نیست |
| **ادغام OR** | تنظیمات بولی از همه پروفایل‌های منطبق «OR» می‌شوند |
| **انتخاب اسکالر** | فونت و حداقل کاراکتر از «اختصاصی‌ترین» پروفایل منطبق گرفته می‌شود |

<<<<<<< ours
### ۶ پروفایل پیش‌فرض
||||||| ancestor
### 3) تنظیمات ساده 🎛️
=======
<<<<<<< New base: option panel and popup
### 3) تنظیمات ساده 🎛️
||||||| Common ancestor
### 3) سیستم پروفایل‌ها 🎚️
=======
### ۶ پروفایل پیش‌فرض
>>>>>>> Current commit: optiosn
>>>>>>> theirs

<<<<<<< ours
| پروفایل | سایت هدف | تبدیل تاریخ | راست‌چین جمله | RTL کل صفحه | قفل |
|---|---|---|---|---|---|
| **خاموش** | — (همه غیرفعال) | ❌ | ❌ | ❌ | 🔒 |
| **پیش‌فرض** | همه سایت‌ها | ✅ | ✅ | ❌ | — |
| **سایت کلاد** | `claude.ai` / `*.claude.ai` | ✅ | ✅ | ❌ | — |
| **سایت چت‌جی‌پی‌تی** | `chatgpt.com` / `chat.openai.com` / `*.openai.com` | ❌ | ❌ | ❌ | — |
| **سایت گیتهاب کوپایلوت** | `github.com` / `*.github.com` / `copilot.github.com` | ✅ | ✅ | ✅ | — |
| **سایت گوگل** | `google.com` / `*.google.com` | ❌ | ✅ | ❌ | — |

### منطق ادغام (OR-Merge)

وقتی چند پروفایل فعال و منطبق وجود داشته باشد:

- **بولین‌ها** (`dateConversion`, `persianRtl`, `fullPageRtl`): اگر هر کدام `true` باشد، نتیجه `true`.
- **فونت و حداقل کاراکتر**: از **اختصاصی‌ترین** پروفایل منطبق گرفته می‌شود. منظور از اختصاصی، پروفایلی است که **وایت‌لیست غیرخالی** دارد (یعنی صریحاً برای سایت‌های خاص نوشته شده). در صورت تساوی، پروفایل زودتر در لیست اصلی برنده است.

### قاعده «خاموش» انحصاری

- فعال‌کردن «خاموش» همه پروفایل‌های دیگر را غیرفعال می‌کند.
- فعال‌کردن هر پروفایل دیگری، «خاموش» را حذف می‌کند.
- وقتی فقط «خاموش» فعال است، **آیکون افزونه** به نسخه `-disabled` تغییر می‌کند.

### وایت‌لیست / بلک‌لیست (Regex)

- **هر خط** یک الگوی regex است.
- **خالی بودن وایت‌لیست** = پروفایل با همه سایت‌ها منطبق است.
- **هر بلک‌لیست منطبق** = پروفایل حذف می‌شود (حتی اگر وایت‌لیست منطبق باشد).
- الگوهای نامعتبر در زمان **اعتبارسنجی** گزارش می‌شوند ولی در runtime نادیده گرفته می‌شوند (تا پروفایل خراب همه را نشکند).
- مثال: `^claude\.ai$`، `^.*\.openai\.com$`

### رفتار متقابل راست‌چین

در فرم ویرایش پروفایل، دو گزینه‌ی زیر **متضاد** هستند و فعال‌کردن یکی، دیگری را خاموش می‌کند:

- **راست‌چین جملات فارسی** ←→ **راست‌چین کل صفحه**

وقتی **راست‌چین کل صفحه** روشن شود، فیلد «حداقل تعداد کاراکتر فارسی» نیز غیرفعال می‌شود (چون دیگر کاربرد ندارد).

---

## رابط کاربری 🖼️

### Popup (با کلیک روی آیکون افزونه)

- **کارت وضعیت:** نقطه سبز = فعال، نقطه قرمز = خاموش/غیرفعال برای این صفحه. نام هاست فعلی در پایین کارت.
- **لیست پروفایل‌ها:** به ترتیب profileOrder، با چک‌باکس، نقطه رنگی، نام، و دکمه چرخ‌دنده ویرایش.
- **نشان «منطبق با این صفحه»:** فقط روی پروفایل‌هایی که با هاست فعلی سازگارند نمایش داده می‌شود.
- **دکمه «مدیریت پروفایل‌ها»:** صفحه تنظیمات کامل را باز می‌کند.

### صفحه تنظیمات (Options)

- **سایدبار چپ:** لیست پروفایل‌ها با نقطه رنگی، نام، قفل 🔒 برای پروفایل‌های قفل‌شده.
- **دکمه «+ پروفایل جدید»:** ساخت پروفایل سفارشی با تنظیمات پیش‌فرض.
- **فرم ویرایش (وسط):** تمام فیلدهای پروفایل با اعتبارسنجی.
- **سوئیچ‌های RTL متقابلاً انحصاری** (طبق توضیح بالا).
- **Combobox فونت:** با دکمه فلش، فیلتر زنده، کلیک‌خارج برای بستن، کلید Escape برای بستن.
- **اعلان Toast** برای بازخورد ذخیره/حذف/خطا.

### تب فعال، رفرش می‌شود

هر تغییر (ذخیره پروفایل، تغییر فعال‌بودن) فقط **همان تب فعال** را رفرش می‌کند، نه همه تب‌ها. URL‌های `chrome://` و `edge://` رفرش نمی‌شوند.
||||||| ancestor
- دکمه روشن/خاموش تبدیل تاریخ
- دکمه روشن/خاموش راست چین
- نمایش وضعیت فعال یا غیرفعال به صورت واضح
=======
<<<<<<< New base: option panel and popup
- دکمه روشن/خاموش تبدیل تاریخ
- دکمه روشن/خاموش راست چین
- نمایش وضعیت فعال یا غیرفعال به صورت واضح
||||||| Common ancestor
از نسخه ۲.۰، پرشینر از یک **سیستم پروفایل** استفاده می‌کند. هر پروفایل مجموعه‌ای از تنظیمات است که می‌تواند برای سایت‌های خاص فعال شود. می‌توانید **چندین پروفایل را همزمان فعال** داشته باشید.

**۶ پروفایل پیش‌فرض:**

| پروفایل | سایت هدف | تبدیل تاریخ | راست‌چین | RTL کل صفحه |
|---|---|---|---|---|
| خاموش | همه | ❌ | ❌ | ❌ |
| پیش‌فرض | همه | ✅ | ✅ | ❌ |
| سایت کلاد | `claude.ai` | ✅ | ✅ | ❌ |
| سایت چت‌جی‌پی‌تی | `chatgpt.com` / `openai.com` | ❌ | ❌ | ❌ |
| سایت گیتهاب کوپایلوت | `github.com` | ✅ | ✅ | ✅ |
| سایت گوگل | `google.com` | ❌ | ✅ | ❌ |

**نحوه ترکیب:** وقتی چند پروفایل فعال باشند، تنظیمات به‌صورت OR ادغام می‌شوند — اگر هر پروفایلی یک ویژگی را روشن کرده باشد، آن ویژگی فعال است. فونت و حداقل تعداد کاراکتر از پروفایلی می‌آید که با وایت‌لیست دقیق‌تر مطابقت دارد.

**پروفایل «خاموش»** انحصاری است: فعال کردن آن همه چیز را خاموش می‌کند.

مدیریت پروفایل‌ها از دکمه **«مدیریت پروفایل‌ها»** در popup انجام می‌شود: ایجاد، ویرایش، حذف، تنظیم وایت‌لیست/بلک‌لیست (regex)، فونت و رنگ.
=======
| پروفایل | سایت هدف | تبدیل تاریخ | راست‌چین جمله | RTL کل صفحه | قفل |
|---|---|---|---|---|---|
| **خاموش** | — (همه غیرفعال) | ❌ | ❌ | ❌ | 🔒 |
| **پیش‌فرض** | همه سایت‌ها | ✅ | ✅ | ❌ | — |
| **سایت کلاد** | `claude.ai` / `*.claude.ai` | ✅ | ✅ | ❌ | — |
| **سایت چت‌جی‌پی‌تی** | `chatgpt.com` / `chat.openai.com` / `*.openai.com` | ❌ | ❌ | ❌ | — |
| **سایت گیتهاب کوپایلوت** | `github.com` / `*.github.com` / `copilot.github.com` | ✅ | ✅ | ✅ | — |
| **سایت گوگل** | `google.com` / `*.google.com` | ❌ | ✅ | ❌ | — |

### منطق ادغام (OR-Merge)

وقتی چند پروفایل فعال و منطبق وجود داشته باشد:

- **بولین‌ها** (`dateConversion`, `persianRtl`, `fullPageRtl`): اگر هر کدام `true` باشد، نتیجه `true`.
- **فونت و حداقل کاراکتر**: از **اختصاصی‌ترین** پروفایل منطبق گرفته می‌شود. منظور از اختصاصی، پروفایلی است که **وایت‌لیست غیرخالی** دارد (یعنی صریحاً برای سایت‌های خاص نوشته شده). در صورت تساوی، پروفایل زودتر در لیست اصلی برنده است.

### قاعده «خاموش» انحصاری

- فعال‌کردن «خاموش» همه پروفایل‌های دیگر را غیرفعال می‌کند.
- فعال‌کردن هر پروفایل دیگری، «خاموش» را حذف می‌کند.
- وقتی فقط «خاموش» فعال است، **آیکون افزونه** به نسخه `-disabled` تغییر می‌کند.

### وایت‌لیست / بلک‌لیست (Regex)

- **هر خط** یک الگوی regex است.
- **خالی بودن وایت‌لیست** = پروفایل با همه سایت‌ها منطبق است.
- **هر بلک‌لیست منطبق** = پروفایل حذف می‌شود (حتی اگر وایت‌لیست منطبق باشد).
- الگوهای نامعتبر در زمان **اعتبارسنجی** گزارش می‌شوند ولی در runtime نادیده گرفته می‌شوند (تا پروفایل خراب همه را نشکند).
- مثال: `^claude\.ai$`، `^.*\.openai\.com$`

### رفتار متقابل راست‌چین

در فرم ویرایش پروفایل، دو گزینه‌ی زیر **متضاد** هستند و فعال‌کردن یکی، دیگری را خاموش می‌کند:

- **راست‌چین جملات فارسی** ←→ **راست‌چین کل صفحه**

وقتی **راست‌چین کل صفحه** روشن شود، فیلد «حداقل تعداد کاراکتر فارسی» نیز غیرفعال می‌شود (چون دیگر کاربرد ندارد).

---

## رابط کاربری 🖼️

### Popup (با کلیک روی آیکون افزونه)

- **کارت وضعیت:** نقطه سبز = فعال، نقطه قرمز = خاموش/غیرفعال برای این صفحه. نام هاست فعلی در پایین کارت.
- **لیست پروفایل‌ها:** به ترتیب profileOrder، با چک‌باکس، نقطه رنگی، نام، و دکمه چرخ‌دنده ویرایش.
- **نشان «منطبق با این صفحه»:** فقط روی پروفایل‌هایی که با هاست فعلی سازگارند نمایش داده می‌شود.
- **دکمه «مدیریت پروفایل‌ها»:** صفحه تنظیمات کامل را باز می‌کند.

### صفحه تنظیمات (Options)

- **سایدبار چپ:** لیست پروفایل‌ها با نقطه رنگی، نام، قفل 🔒 برای پروفایل‌های قفل‌شده.
- **دکمه «+ پروفایل جدید»:** ساخت پروفایل سفارشی با تنظیمات پیش‌فرض.
- **فرم ویرایش (وسط):** تمام فیلدهای پروفایل با اعتبارسنجی.
- **سوئیچ‌های RTL متقابلاً انحصاری** (طبق توضیح بالا).
- **Combobox فونت:** با دکمه فلش، فیلتر زنده، کلیک‌خارج برای بستن، کلید Escape برای بستن.
- **اعلان Toast** برای بازخورد ذخیره/حذف/خطا.

### تب فعال، رفرش می‌شود

هر تغییر (ذخیره پروفایل، تغییر فعال‌بودن) فقط **همان تب فعال** را رفرش می‌کند، نه همه تب‌ها. URL‌های `chrome://` و `edge://` رفرش نمی‌شوند.
>>>>>>> Current commit: optiosn
>>>>>>> theirs

---

## نصب آسان 🚀

### از فایل ZIP (کاربر عادی)

1. [Persianer_2.0.2.zip](https://github.com/MohammadKani/Persianer/releases/download/2.0.2/Persianer_2.0.2.zip) را دانلود و از حالت فشرده خارج کنید.
2. در Chrome بروید به: `chrome://extensions/`
3. گزینه **Developer mode** را روشن کنید.
4. روی **Load unpacked** بزنید.
5. پوشه `Persianer_2.0.2` (یا `build-prod`) را انتخاب کنید.

### از سورس (توسعه‌دهنده)

```powershell
git clone https://github.com/MohammadKani/Persianer.git
cd Persianer
pwsh ./build.ps1 -Mode prod    # خروجی در build-prod/
# یا
pwsh ./build.ps1 -Mode dev     # خروجی در build-dev/ با لاگ فعال
```

سپس پوشه `build-prod` (یا `build-dev`) را در `chrome://extensions/` با Load unpacked بارگذاری کنید.

تمام! حالا آیکون افزونه را بزنید و قابلیت‌ها را فعال کنید ✅

---

## روش استفاده (خیلی ساده) 🧩

1. وارد یک سایت شوید که تاریخ میلادی دارد.
2. روی آیکون افزونه کلیک کنید.
3. در popup، پروفایل‌های مورد نظر را با چک‌باکس فعال/غیرفعال کنید.
4. نشان «منطبق با این صفحه» روی پروفایل‌هایی که با سایت جاری مطابقت دارند نمایش داده می‌شود.
5. همان تب فعال، رفرش می‌شود و نتیجه را می‌بینید.

<<<<<<< ours
برای ویرایش پیشرفته (فونت، وایت‌لیست، بلک‌لیست، RTL کل صفحه، رنگ، نام):
||||||| ancestor
پیشنهاد:
=======
<<<<<<< New base: option panel and popup
پیشنهاد:
||||||| Common ancestor
برای ویرایش پیشرفته (فونت، وایت‌لیست، بلک‌لیست، RTL کل صفحه):
=======
برای ویرایش پیشرفته (فونت، وایت‌لیست، بلک‌لیست، RTL کل صفحه، رنگ، نام):
>>>>>>> Current commit: optiosn
>>>>>>> theirs

<<<<<<< ours
- روی دکمه **«مدیریت پروفایل‌ها»** در popup بزنید تا صفحه تنظیمات باز شود.
- یا روی آیکون چرخ‌دنده ⚙ کنار هر پروفایل در popup بزنید (به‌طور مستقیم همان پروفایل را ویرایش می‌کند).
||||||| ancestor
- اگر فقط تاریخ می خواهید: فقط گزینه تاریخ روشن باشد.
- اگر فقط راست چین می خواهید: فقط گزینه راست چین روشن باشد.
- اگر هر دو را می خواهید: هر دو گزینه روشن باشند.
=======
<<<<<<< New base: option panel and popup
- اگر فقط تاریخ می خواهید: فقط گزینه تاریخ روشن باشد.
- اگر فقط راست چین می خواهید: فقط گزینه راست چین روشن باشد.
- اگر هر دو را می خواهید: هر دو گزینه روشن باشند.
||||||| Common ancestor
- روی دکمه **«مدیریت پروفایل‌ها»** بزنید تا صفحه تنظیمات باز شود.
- یا روی آیکون چرخ‌دنده کنار هر پروفایل در popup بزنید.
=======
- روی دکمه **«مدیریت پروفایل‌ها»** در popup بزنید تا صفحه تنظیمات باز شود.
- یا روی آیکون چرخ‌دنده ⚙ کنار هر پروفایل در popup بزنید (به‌طور مستقیم همان پروفایل را ویرایش می‌کند).
>>>>>>> Current commit: optiosn
>>>>>>> theirs

---

## حریم خصوصی و امنیت 🔒

پرشینر کاملاً کاربرمحور و امن طراحی شده:

- ❌ هیچ داده‌ای جمع‌آوری نمی‌شود
- ❌ هیچ اطلاعاتی به سرور ارسال نمی‌شود
- ❌ هیچ ردیابی یا Analytics ندارد
- ✅ پردازش کاملاً روی دستگاه شما انجام می‌شود
- ✅ تمام تنظیمات در `chrome.storage.sync` محلی مرورگر شما ذخیره می‌شوند
- ✅ هیچ اتصال شبکه‌ای توسط افزونه باز نمی‌شود

---

## پرسش‌های رایج ❓

### آیا اینترنت یا اکانت لازم دارد؟
خیر. هیچ ثبت‌نامی نیاز نیست و افزونه به هیچ سروری متصل نمی‌شود.

### چطور فقط برای یک سایت خاص فعال کنم؟
در صفحه تنظیمات، پروفایل «پیش‌فرض» را غیرفعال کنید و فقط پروفایل آن سایت (مثلاً «سایت کلاد») را فعال بگذارید. یا یک پروفایل سفارشی با وایت‌لیست دقیق بسازید.

### آیا می‌توانم چند پروفایل هم‌زمان داشته باشم؟
بله. هر تعداد. تنظیمات بولی به‌صورت OR ادغام می‌شوند. فونت و حداقل کاراکتر از اختصاصی‌ترین پروفایل منطبق گرفته می‌شود.

### «راست‌چین جملات فارسی» با «راست‌چین کل صفحه» چه فرقی دارد؟
- **راست‌چین جملات:** فقط بلاک‌هایی که متن فارسی کافی دارند، `dir=rtl` می‌گیرند. ظاهر اصلی صفحه حفظ می‌شود.
- **راست‌چین کل صفحه:** کل `<body>` راست‌چین می‌شود. چیدمان کلی صفحه معکوس می‌شود (مثل حالت RTL سایت).

این دو در فرم متقابلاً انحصاری هستند.

### فونت دلخواهم در لیست نیست
در فیلد فونت، هر نام دلخواهی تایپ کنید. مرورگر در صورت نصب‌بودن آن فونت، اعمالش می‌کند. در غیر این صورت به فونت پیش‌فرض سیستم برمی‌گردد.

### اگر نخواهم ازش استفاده کنم؟
خیلی راحت در popup، پروفایل «خاموش» را فعال کنید. همه چیز متوقف می‌شود.

### چطور پروفایل سفارشی بسازم؟
در صفحه تنظیمات، روی «+ پروفایل جدید» بزنید. یک پروفایل با تنظیمات پیش‌فرض ساخته می‌شود که می‌توانید نام، رنگ، فونت و سایر تنظیماتش را ویرایش کنید.

### آیا regex اشتباه همه چیز را خراب می‌کند؟
خیر. الگوهای نامعتبر در زمان ذخیره گزارش می‌شوند ولی **در runtime نادیده گرفته می‌شوند**. اگر فقط یک الگوی خراب داشته باشید، بقیه الگوهای همان پروفایل کار می‌کنند.

---

## معماری و توسعه 🛠️

### ساختار فایل‌ها

```
Persianer/
├── manifest.json          # Manifest V3، دسترسی‌ها، محتوا، آیکون
├── background.js          # سرویس ورکر، مدیریت پیام‌ها و آیکون
├── content.js             # اسکریپت محتوا، محاسبه تنظیمات مؤثر، تزریق
├── script.js              # اسکریپت صفحه (PAGE world)، تبدیل تاریخ و RTL
├── config.js              # پیکربندی محیط (dev/prod)
├── logger.js              # لاگ‌گیری ساختاریافته
├── profiles.js            # هسته مشترک: پروفایل، تطبیق، ادغام، ذخیره‌سازی
├── popup.html / popup.js  # رابط popup
├── options.html / options.js / options.css  # صفحه تنظیمات
├── test.html / testlive.html  # صفحات تست داخلی
├── icons/                 # 16, 48, 128 px
└── build.ps1              # اسکریپت ساخت PowerShell
```

### World‌های اجرا

- **Service Worker** (`background.js`): هماهنگ‌کننده پیام‌ها، مدیریت آیکون.
- **Content Script** (`content.js`): در ISOLATED world اجرا می‌شود. دسترسی به `chrome.*` و `chrome.storage.sync` دارد.
- **Page Script** (`script.js`، `config.js`، `logger.js`): در MAIN world صفحه تزریق می‌شوند. از طریق `data-*` attributes و `CustomEvent` با content script صحبت می‌کنند.

### انتقال تنظیمات به Page Script

تنظیمات مؤثر به‌جای `postMessage` از طریق **ویژگی‌های data روی `<html>`** منتقل می‌شوند (سازگار با CSP سخت‌گیرانه):

```html
<html data-persianer-enabled="true"
      data-persianer-autortl="true"
      data-persianer-fullrtl="false"
      data-persianer-minchars="10"
      data-persianer-font="Sahel">
```

### رویدادهای زنده (بدون رفرش)

اگر `chrome.tabs.reload` به هر دلیلی نامطلوب باشد، content.js پیام `applySettings` را می‌گیرد و این رویدادها را dispatch می‌کند:

- `Persianer-rtl-toggle` ← وضعیت راست‌چین جملات
- `Persianer-fullrtl-toggle` ← وضعیت راست‌چین کل صفحه
- `Persianer-font-change` ← فونت
- `Persianer-reconvert` ← تبدیل مجدد تاریخ

### شمای ذخیره‌سازی (`chrome.storage.sync`)

```json
{
  "schemaVersion": 2,
  "profiles": {
    "<id>": {
      "id": "claude",
      "name": "سایت کلاد",
      "builtin": true,
      "deletable": true,
      "editable": true,
      "color": "#d97757",
      "settings": {
        "dateConversion": true,
        "persianRtl": true,
        "minPersianChars": 10,
        "fullPageRtl": false,
        "font": "Sahel",
        "blacklist": [],
        "whitelist": ["^claude\\.ai$", "^.*\\.claude\\.ai$"]
      }
    }
  },
  "profileOrder": ["off", "default", "claude", "chatgpt", "copilot", "google"],
  "activeProfileIds": ["default"],
  "installDate": "2026-06-24T..."
}
```

### مهاجرت (Migration)

تنظیمات قدیمی (`enabled`، `autoRtlEnabled` از نسخه ۱.۰) به‌طور خودکار به `activeProfileIds` تبدیل می‌شوند:

- اگر `enabled=true` یا `autoRtlEnabled=true` → `[DEFAULT_ID]`
- در غیر این صورت → `[OFF_ID]`

### ساخت (Build)

```powershell
# Development: خروجی در build-dev/، IS_DEV=true، لاگ فعال
pwsh ./build.ps1 -Mode dev

# Production: خروجی در build-prod/، IS_DEV=false، لاگ غیرفعال، config منجمد
pwsh ./build.ps1 -Mode prod
```

اسکریپت build:
- فایل‌های مورد نیاز را به پوشه خروجی کپی می‌کند
- `.playwright-mcp` و سایر فایل‌های موقت را حذف می‌کند
- در حالت prod، `IS_DEV=false` در background/popup/script، `mode: 'production'` در config و `Object.freeze` روی CONFIG اعمال می‌شود
- نسخه `manifest.json` را به‌روز نگه می‌دارد

---

## مجوز 📄

MIT — استفاده آزاد، تغییر و توزیع مجاز.

---

## پشتیبانی و ارتباط 💬

- گزارش مشکل: https://github.com/MohammadKani/Persianer/issues
- پیشنهاد قابلیت جدید: https://github.com/MohammadKani/Persianer/issues
- گفتگو: https://github.com/MohammadKani/Persianer/discussions

---

<div align="center" dir="rtl">

### اگر پرشینر برات مفید بود، بهش ستاره بده ⭐

#### ✨ توسعه یافته با هوش مصنوعی ✨

</div>

---

## English (Quick Intro)

Persianer is a beginner-friendly Chrome extension that makes the web more comfortable for Persian-speaking users.

### What it does

- **Gregorian → Jalali date conversion** in many formats (`2024-11-15`, `11/15/2024`, `15.11.2024`, `Sep`, `November 15, 2024`, with or without time).
- **Smart per-block RTL** for Persian text (`<p>`, `<div>`, `<li>`, `<td>`, headings, etc.) with configurable minimum Persian character count.
- **Optional full-page RTL** (`dir=rtl` on `<body>`) as an alternative to per-block RTL.
- **Configurable font** for RTL blocks (10 curated Persian/web fonts + custom input).
- **Mutation observer** that re-applies conversion and RTL to late-loading SPA / dashboard content.
- **Format detection priority** ensures timestamps aren't mistaken for dates.

### Profile system (v2.0)

<<<<<<< ours
- 6 built-in profiles: **Off, Default, Claude (`claude.ai`), ChatGPT (`chatgpt.com` / `openai.com`), Copilot (`github.com`), Google (`google.com`)**.
- **Multiple profiles active simultaneously** with OR-merge for booleans.
- Per-profile **whitelist / blacklist as regex** (one per line); invalid patterns are reported on save but ignored at runtime so they never break a profile.
- Per-profile **font** and **minimum Persian char count**.
- Create / edit / delete custom profiles in the options page (sidebar + form, Zero Omega-style).
- **Off profile is exclusive**: activating it deactivates everything else (icon switches to `-disabled`).
- **Live popup status** shows which features are on for the current page; a "matches this page" badge highlights relevant profiles.
- **Legacy migration** from v1 settings (`enabled` / `autoRtlEnabled`) is automatic.
- **Schema versioning** (`schemaVersion: 2`) with `normalizeState()` for forward-compat.
||||||| ancestor
- Converts Gregorian dates to Jalali
- Applies smart RTL to Persian text blocks
- Uses simple popup toggles
- Runs fully local with no tracking
=======
<<<<<<< New base: option panel and popup
- Converts Gregorian dates to Jalali
- Applies smart RTL to Persian text blocks
- Uses simple popup toggles
- Runs fully local with no tracking
||||||| Common ancestor
- Converts Gregorian dates to Jalali
- Applies smart RTL to Persian text blocks
- **Profile system (v2.0):** multiple profiles, multiple active at once, per-site whitelist/blacklist (regex), configurable font & min char count, full-page RTL
- 6 built-in profiles (Off, Default, Claude, ChatGPT, Copilot, Google)
- Runs fully local with no tracking
=======
- 6 built-in profiles: **Off, Default, Claude (`claude.ai`), ChatGPT (`chatgpt.com` / `openai.com`), Copilot (`github.com`), Google (`google.com`)**.
- **Multiple profiles active simultaneously** with OR-merge for booleans.
- Per-profile **whitelist / blacklist as regex** (one per line); invalid patterns are reported on save but ignored at runtime so they never break a profile.
- Per-profile **font** and **minimum Persian char count**.
- Create / edit / delete custom profiles in the options page (sidebar + form, Zero Omega-style).
- **Off profile is exclusive**: activating it deactivates everything else (icon switches to `-disabled`).
- **Live popup status** shows which features are on for the current page; a "matches this page" badge highlights relevant profiles.
- **Legacy migration** from v1 settings (`enabled` / `autoRtlEnabled`) is automatic.
- **Schema versioning** (`schemaVersion: 2`) with `normalizeState()` for forward-compat.
>>>>>>> Current commit: optiosn
>>>>>>> theirs

### Mutual-exclusion UX

- **Persian sentence RTL** ↔ **Full-page RTL** are mutually exclusive in the form (toggling one disables the other). The min-char field is disabled when full-page RTL is on.

<<<<<<< ours
### Architecture

- **Manifest V3** service worker, content scripts, and page-world injection.
- **MV3-safe config transport**: effective settings are written to `<html>` as `data-persianer-*` attributes (CSP-friendly) and read by the page script.
- **Live custom events** (`Persianer-rtl-toggle`, `Persianer-fullrtl-toggle`, `Persianer-font-change`, `Persianer-reconvert`) allow re-applying without a tab reload when desired.
- **Reload policy**: only the **current active tab** is reloaded on settings change; `chrome://` and `edge://` URLs are skipped.
- **Shared core** (`profiles.js`) is loaded by the service worker, content script, popup, and options page for consistent profile/match/merge logic.

### Install

1. Download [Persianer_2.0.2.zip](https://github.com/MohammadKani/Persianer/releases/download/2.0.2/Persianer_2.0.2.zip) and extract it.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder (or `build-prod/` if you built from source).

### Usage

- Click the extension icon to open the popup.
- Toggle profiles with the checkboxes. A "matches this page" badge shows which apply to the current site.
- The **Off** profile is exclusive — it deactivates everything else.
- Click **Manage profiles** (or the ⚙ gear next to any profile) to open the options page for full editing.
- All settings live in `chrome.storage.sync`. **No network calls, no telemetry, no accounts**.

### Build (from source)

```powershell
git clone https://github.com/MohammadKani/Persianer.git
cd Persianer
pwsh ./build.ps1 -Mode prod    # writes build-prod/ with IS_DEV=false
```

### License

||||||| ancestor
=======
<<<<<<< New base: option panel and popup
||||||| Common ancestor
Usage:

- Click the extension icon to open the popup.
- Toggle profiles on/off with checkboxes. The "matches this page" badge shows which profiles apply to the current site.
- Click "Manage profiles" (or the gear icon) to open the options page for full editing (font, whitelist/blacklist regex, full-page RTL, color, delete).

=======
### Architecture

- **Manifest V3** service worker, content scripts, and page-world injection.
- **MV3-safe config transport**: effective settings are written to `<html>` as `data-gd2pd-*` attributes (CSP-friendly) and read by the page script.
- **Live custom events** (`Persianer-rtl-toggle`, `Persianer-fullrtl-toggle`, `Persianer-font-change`, `Persianer-reconvert`) allow re-applying without a tab reload when desired.
- **Reload policy**: only the **current active tab** is reloaded on settings change; `chrome://` and `edge://` URLs are skipped.
- **Shared core** (`profiles.js`) is loaded by the service worker, content script, popup, and options page for consistent profile/match/merge logic.

### Install

1. Download [Persianer_2.0.2.zip](https://github.com/MohammadKani/Persianer/releases/download/2.0.2/Persianer_2.0.2.zip) and extract it.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the extracted folder (or `build-prod/` if you built from source).

### Usage

- Click the extension icon to open the popup.
- Toggle profiles with the checkboxes. A "matches this page" badge shows which apply to the current site.
- The **Off** profile is exclusive — it deactivates everything else.
- Click **Manage profiles** (or the ⚙ gear next to any profile) to open the options page for full editing.
- All settings live in `chrome.storage.sync`. **No network calls, no telemetry, no accounts**.

### Build (from source)

```powershell
git clone https://github.com/MohammadKani/Persianer.git
cd Persianer
pwsh ./build.ps1 -Mode prod    # writes build-prod/ with IS_DEV=false
```

### License

>>>>>>> theirs
MIT.
>>>>>>> Current commit: optiosn
