// Google Apps Script - انسخ والصق هذا الكود في Google Apps Script

/**
 * وظيفة لاستقبال البيانات من التطبيق وإضافتها إلى Google Sheets
 * 
 * كيفية الاستخدام:
 * 1. افتح Google Sheets الخاص بك
 * 2. اذهب إلى Extensions > Apps Script
 * 3. امسح أي كود موجود والصق هذا الكود
 * 4. احفظ (Ctrl+S)
 * 5. انقر Deploy > New deployment
 * 6. اختر Web app
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. انقر Deploy وانسخ الرابط
 */

function doPost(e) {
  try {
    // قراءة البيانات المرسلة
    const data = JSON.parse(e.postData.contents);
    const sheetName = data.sheet;
    const rowData = data.data;
    
    // الحصول على الورقة المطلوبة
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    // إذا لم تكن الورقة موجودة، أنشئها
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      
      // إضافة رؤوس الأعمدة حسب نوع الورقة
      const headers = getHeadersForSheet(sheetName);
      if (headers.length > 0) {
        sheet.appendRow(headers);
        
        // تنسيق رؤوس الأعمدة
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#4285f4');
        headerRange.setFontColor('#ffffff');
        headerRange.setHorizontalAlignment('center');
      }
    }
    
    // إضافة البيانات كصف جديد
    const values = Object.values(rowData);
    sheet.appendRow(values);
    
    // تنسيق آخر صف
    const lastRow = sheet.getLastRow();
    const range = sheet.getRange(lastRow, 1, 1, values.length);
    range.setHorizontalAlignment('center');
    
    // تلوين الصف بناءً على نوع الورقة
    colorRowBySheet(sheet, lastRow, sheetName);
    
    // تعديل عرض الأعمدة تلقائياً
    sheet.autoResizeColumns(1, values.length);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'تم إضافة البيانات بنجاح',
      sheet: sheetName,
      row: lastRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    'Google Sheets API للمحفظة الجماعية - فلوسنا 🎉\n' +
    'الـ API يعمل بنجاح! ✅'
  );
}

/**
 * دالة للحصول على رؤوس الأعمدة حسب نوع الورقة
 */
function getHeadersForSheet(sheetName) {
  const headersMap = {
    'الإيداعات_المعلقة': ['التاريخ', 'الاسم', 'الهاتف', 'المبلغ', 'الحالة'],
    'الإيداعات_المقبولة': ['التاريخ', 'الاسم', 'الهاتف', 'المبلغ', 'تاريخ الموافقة'],
    'الإيداعات_المرفوضة': ['التاريخ', 'الاسم', 'الهاتف', 'المبلغ', 'تاريخ الرفض'],
    'المصروفات': ['التاريخ', 'الوصف', 'الفئة', 'المبلغ']
  };
  
  return headersMap[sheetName] || [];
}

/**
 * دالة لتلوين الصفوف حسب نوع الورقة
 */
function colorRowBySheet(sheet, row, sheetName) {
  const range = sheet.getRange(row, 1, 1, sheet.getLastColumn());
  
  switch(sheetName) {
    case 'الإيداعات_المعلقة':
      range.setBackground('#fff3cd'); // أصفر فاتح
      break;
    case 'الإيداعات_المقبولة':
      range.setBackground('#d4edda'); // أخضر فاتح
      break;
    case 'الإيداعات_المرفوضة':
      range.setBackground('#f8d7da'); // أحمر فاتح
      break;
    case 'المصروفات':
      range.setBackground('#d1ecf1'); // أزرق فاتح
      break;
    default:
      range.setBackground('#ffffff'); // أبيض
  }
}

/**
 * دالة اختيارية لإنشاء الأوراق الأربعة تلقائياً
 * قم بتشغيلها مرة واحدة من القائمة في Apps Script
 */
function createAllSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = [
    'الإيداعات_المعلقة',
    'الإيداعات_المقبولة', 
    'الإيداعات_المرفوضة',
    'المصروفات'
  ];
  
  sheetNames.forEach(sheetName => {
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      
      // إضافة رؤوس الأعمدة
      const headers = getHeadersForSheet(sheetName);
      if (headers.length > 0) {
        sheet.appendRow(headers);
        
        // تنسيق رؤوس الأعمدة
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#4285f4');
        headerRange.setFontColor('#ffffff');
        headerRange.setHorizontalAlignment('center');
        
        // تعديل عرض الأعمدة
        sheet.autoResizeColumns(1, headers.length);
      }
      
      Logger.log('تم إنشاء الورقة: ' + sheetName);
    }
  });
  
  Logger.log('تم إنشاء جميع الأوراق بنجاح!');
}
