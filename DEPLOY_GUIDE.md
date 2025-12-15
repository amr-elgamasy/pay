# دليل نشر الموقع 🚀

## الخطوة 1: إعداد Google Sheets

### أ) إنشاء Google Sheet جديد
1. افتح [Google Sheets](https://sheets.google.com)
2. اضغط "Blank" لإنشاء ملف جديد
3. سَمِّ الملف: **فلوسنا - قاعدة البيانات**

### ب) إنشاء الأوراق المطلوبة
أنشئ 6 أوراق (Sheets) في نفس الملف:

1. **الإيداعات_المعلقة**
2. **الإيداعات_المقبولة**
3. **الإيداعات_المرفوضة**
4. **المصروفات**
5. **السحوبات_المعلقة**
6. **السحوبات_المقبولة**

### ج) إضافة الأعمدة في كل ورقة

**في ورقة الإيداعات_المعلقة:**
```
ID | التاريخ | الاسم | الهاتف | المبلغ | الحالة | الصورة
```

**في ورقة الإيداعات_المقبولة:**
```
ID | التاريخ | الاسم | الهاتف | المبلغ | تاريخ الموافقة
```

**في ورقة الإيداعات_المرفوضة:**
```
ID | التاريخ | الاسم | الهاتف | المبلغ | تاريخ الرفض
```

**في ورقة المصروفات:**
```
ID | التاريخ | الوصف | الفئة | المبلغ
```

**في ورقة السحوبات_المعلقة:**
```
ID | التاريخ | الاسم | الهاتف | المبلغ | السبب | الحالة
```

**في ورقة السحوبات_المقبولة:**
```
ID | التاريخ | الاسم | الهاتف | المبلغ | السبب | تاريخ الموافقة
```

---

## الخطوة 2: إنشاء Google Apps Script

### أ) فتح محرر السكريبت
1. من Google Sheet، اضغط **Extensions** > **Apps Script**
2. احذف أي كود موجود
3. الصق الكود التالي:

```javascript
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'getAll') {
      return getAllData();
    } else if (action === 'addDeposit') {
      return addDeposit(data);
    } else if (action === 'updateDepositStatus') {
      return updateDepositStatus(data);
    } else if (action === 'addExpense') {
      return addExpense(data);
    } else if (action === 'addWithdrawal') {
      return addWithdrawal(data);
    } else if (action === 'updateWithdrawalStatus') {
      return updateWithdrawalStatus(data);
    } else if (action === 'deleteDeposit') {
      return deleteDeposit(data);
    } else if (action === 'deleteExpense') {
      return deleteExpense(data);
    } else if (action === 'deleteWithdrawal') {
      return deleteWithdrawal(data);
    }
    
    return createResponse({status: 'error', message: 'Unknown action'});
  } catch (error) {
    return createResponse({status: 'error', message: error.toString()});
  }
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const deposits = readSheet(ss, 'الإيداعات_المعلقة')
    .concat(readSheet(ss, 'الإيداعات_المقبولة'))
    .concat(readSheet(ss, 'الإيداعات_المرفوضة'));
  
  const expenses = readSheet(ss, 'المصروفات');
  
  const withdrawals = readSheet(ss, 'السحوبات_المعلقة')
    .concat(readSheet(ss, 'السحوبات_المقبولة'));
  
  return createResponse({
    status: 'success',
    data: {
      deposits: deposits,
      expenses: expenses,
      withdrawals: withdrawals
    }
  });
}

function readSheet(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function addDeposit(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('الإيداعات_المعلقة');
  
  sheet.appendRow([
    data.ID,
    data.التاريخ,
    data.الاسم,
    data.الهاتف,
    data.المبلغ,
    'معلق',
    data.الصورة || ''
  ]);
  
  return createResponse({status: 'success'});
}

function updateDepositStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pendingSheet = ss.getSheetByName('الإيداعات_المعلقة');
  const targetSheet = data.الحالة === 'approved' 
    ? ss.getSheetByName('الإيداعات_المقبولة')
    : ss.getSheetByName('الإيداعات_المرفوضة');
  
  const pendingData = pendingSheet.getDataRange().getValues();
  
  for (let i = 1; i < pendingData.length; i++) {
    if (pendingData[i][0] == data.ID) {
      targetSheet.appendRow([
        pendingData[i][0],
        pendingData[i][1],
        pendingData[i][2],
        pendingData[i][3],
        pendingData[i][4],
        new Date().toLocaleDateString('ar-EG')
      ]);
      
      pendingSheet.deleteRow(i + 1);
      break;
    }
  }
  
  return createResponse({status: 'success'});
}

function addExpense(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('المصروفات');
  
  sheet.appendRow([
    data.ID,
    data.التاريخ,
    data.الوصف,
    data.الفئة,
    data.المبلغ
  ]);
  
  return createResponse({status: 'success'});
}

function addWithdrawal(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('السحوبات_المعلقة');
  
  sheet.appendRow([
    data.ID,
    data.التاريخ,
    data.الاسم,
    data.الهاتف,
    data.المبلغ,
    data.السبب,
    'معلق'
  ]);
  
  return createResponse({status: 'success'});
}

function updateWithdrawalStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pendingSheet = ss.getSheetByName('السحوبات_المعلقة');
  
  if (data.الحالة === 'approved') {
    const targetSheet = ss.getSheetByName('السحوبات_المقبولة');
    const pendingData = pendingSheet.getDataRange().getValues();
    
    for (let i = 1; i < pendingData.length; i++) {
      if (pendingData[i][0] == data.ID) {
        targetSheet.appendRow([
          pendingData[i][0],
          pendingData[i][1],
          pendingData[i][2],
          pendingData[i][3],
          pendingData[i][4],
          pendingData[i][5],
          new Date().toLocaleDateString('ar-EG')
        ]);
        
        pendingSheet.deleteRow(i + 1);
        break;
      }
    }
  }
  
  return createResponse({status: 'success'});
}

function deleteDeposit(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['الإيداعات_المعلقة', 'الإيداعات_المقبولة', 'الإيداعات_المرفوضة'];
  
  for (const sheetName of sheets) {
    const sheet = ss.getSheetByName(sheetName);
    const sheetData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] == data.ID) {
        sheet.deleteRow(i + 1);
        return createResponse({status: 'success'});
      }
    }
  }
  
  return createResponse({status: 'error', message: 'Not found'});
}

function deleteExpense(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('المصروفات');
  const sheetData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] == data.ID) {
      sheet.deleteRow(i + 1);
      return createResponse({status: 'success'});
    }
  }
  
  return createResponse({status: 'error', message: 'Not found'});
}

function deleteWithdrawal(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['السحوبات_المعلقة', 'السحوبات_المقبولة'];
  
  for (const sheetName of sheets) {
    const sheet = ss.getSheetByName(sheetName);
    const sheetData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] == data.ID) {
        sheet.deleteRow(i + 1);
        return createResponse({status: 'success'});
      }
    }
  }
  
  return createResponse({status: 'error', message: 'Not found'});
}
```

### ب) نشر السكريبت
1. اضغط **Deploy** > **New deployment**
2. اختر نوع: **Web app**
3. الإعدادات:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. اضغط **Deploy**
5. **انسخ الرابط** (Web app URL) - ستحتاجه!

---

## الخطوة 3: نشر الموقع على GitHub Pages

### أ) تحديث رابط Google Sheets في الموقع
1. افتح ملف `index.html`
2. ابحث عن `GOOGLE_SHEETS_URL`
3. الصق الرابط الذي نسخته

### ب) رفع الكود على GitHub
```bash
git add .
git commit -m "تفعيل قاعدة بيانات Google Sheets"
git push origin main
```

### ج) تفعيل GitHub Pages
1. افتح الريبو على GitHub: https://github.com/amr-elgamasy/pay
2. اذهب إلى **Settings** > **Pages**
3. في **Source** اختر: **main** branch
4. اضغط **Save**
5. انتظر دقيقة - الموقع سيكون متاح على:
   ```
   https://amr-elgamasy.github.io/pay/
   ```

---

## الخطوة 4: شارك الرابط! 🎉

الآن يمكنك إرسال الرابط لأي شخص:
```
https://amr-elgamasy.github.io/pay/
```

✅ البيانات ستكون مشتركة بين الجميع
✅ يعمل على الجوال والكمبيوتر
✅ مجاني تماماً!

---

## ملاحظات مهمة:

1. **النسخ الاحتياطي**: Google Sheets يحفظ تلقائياً، ويمكنك تنزيل نسخة Excel أي وقت
2. **الأمان**: غيّر كلمة مرور الإدارة من الكود
3. **السرعة**: قد يكون هناك تأخير بسيط (1-2 ثانية) لأن البيانات على السحابة
4. **الصور**: تُحفظ مضغوطة لتوفير المساحة

---

## إذا واجهت مشاكل:

### المشكلة: "Authorization required"
**الحل**: في Apps Script، اضغط Run مرة واحدة ووافق على الأذونات

### المشكلة: البيانات لا تظهر
**الحل**: تأكد من أسماء الأوراق بالعربي صحيحة 100%

### المشكلة: الموقع لا يفتح
**الحل**: انتظر 5 دقائق بعد تفعيل GitHub Pages
