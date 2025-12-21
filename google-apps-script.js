// ============================================================
// 🌐 Google Apps Script للربط مع موقع فلوسنا
// ============================================================
// رابط الجدول: https://docs.google.com/spreadsheets/d/1w9UXX3EKLL6zJ4sPCSPFA3S_yC2harQtHAIX_eUqRJQ/edit

function doGet(e) {
  try {
    // إذا كان هناك معامل data، معناه طلب من الموقع
    if (e.parameter.data) {
      const data = JSON.parse(e.parameter.data);
      const action = data.action;
      
      Logger.log('📥 Action received (GET): ' + action);
      Logger.log('📦 Data: ' + JSON.stringify(data));
      
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
      } else if (action === 'deleteAll') {
        return deleteAllData();
      } else if (action === 'getPaymentMethods') {
        return getPaymentMethods();
      } else if (action === 'savePaymentMethods') {
        return savePaymentMethods(data);
      }
      
      return createResponse({status: 'error', message: 'Unknown action: ' + action});
    }
    
    // رد افتراضي للتحقق من أن الـ API يعمل
    return ContentService.createTextOutput(JSON.stringify({status: 'ok', message: 'Flosna API is running'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('❌ Error in doGet: ' + error.toString());
    return createResponse({status: 'error', message: error.toString()});
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    Logger.log('📥 Action received: ' + action);
    Logger.log('📦 Data: ' + JSON.stringify(data));
    
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
    } else if (action === 'getPaymentMethods') {
      return getPaymentMethods();
    } else if (action === 'savePaymentMethods') {
      return savePaymentMethods(data);
    }
    
    return createResponse({status: 'error', message: 'Unknown action: ' + action});
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
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
    .concat(readSheet(ss, 'السحوبات_المقبولة'))
    .concat(readSheet(ss, 'السحوبات_المرفوضة'));
  
  // تحميل طرق الدفع
  const paymentMethods = getPaymentMethodsData(ss);
  
  Logger.log('✅ Data retrieved: ' + deposits.length + ' deposits, ' + expenses.length + ' expenses, ' + withdrawals.length + ' withdrawals');
  
  return createResponse({
    status: 'success',
    data: {
      deposits: deposits,
      expenses: expenses,
      withdrawals: withdrawals,
      paymentMethods: paymentMethods
    }
  });
}

function readSheet(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log('⚠️ Sheet not found: ' + sheetName);
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // فقط العناوين
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.filter(row => row[0] !== '').map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// ============================================================
// 📝 إضافة إيداع جديد
// ترتيب الأعمدة: ID | الاسم | الهاتف | المبلغ | التاريخ | الحالة | صورة_التحويل
// ============================================================
function addDeposit(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('الإيداعات_المعلقة');
  
  if (!sheet) {
    return createResponse({status: 'error', message: 'Sheet not found: الإيداعات_المعلقة'});
  }
  
  sheet.appendRow([
    data.ID,
    data.الاسم,
    data.الهاتف,
    data.المبلغ,
    data.التاريخ,
    data.الحالة || 'معلق',
    data.الصورة || ''
  ]);
  
  Logger.log('✅ Deposit added: ' + data.ID);
  return createResponse({status: 'success', message: 'Deposit added successfully'});
}

// ============================================================
// 🔄 تحديث حالة الإيداع
// ============================================================
function updateDepositStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pendingSheet = ss.getSheetByName('الإيداعات_المعلقة');
  const targetSheet = data.الحالة === 'approved' 
    ? ss.getSheetByName('الإيداعات_المقبولة')
    : ss.getSheetByName('الإيداعات_المرفوضة');
  
  if (!pendingSheet || !targetSheet) {
    return createResponse({status: 'error', message: 'Sheets not found'});
  }
  
  const pendingData = pendingSheet.getDataRange().getValues();
  
  for (let i = 1; i < pendingData.length; i++) {
    if (pendingData[i][0] == data.ID) {
      // نقل للورقة الجديدة (بدون صورة)
      targetSheet.appendRow([
        pendingData[i][0], // ID
        pendingData[i][1], // الاسم
        pendingData[i][2], // الهاتف
        pendingData[i][3], // المبلغ
        pendingData[i][4], // التاريخ
        data.الحالة === 'approved' ? 'مقبول' : 'مرفوض'
      ]);
      
      // حذف من المعلقة
      pendingSheet.deleteRow(i + 1);
      Logger.log('✅ Deposit status updated: ' + data.ID + ' -> ' + data.الحالة);
      return createResponse({status: 'success'});
    }
  }
  
  return createResponse({status: 'error', message: 'Deposit not found: ' + data.ID});
}

// ============================================================
// 💰 إضافة مصروف
// ترتيب الأعمدة: ID | الوصف | الفئة | المبلغ | التاريخ
// ============================================================
function addExpense(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('المصروفات');
  
  if (!sheet) {
    return createResponse({status: 'error', message: 'Sheet not found: المصروفات'});
  }
  
  sheet.appendRow([
    data.ID,
    data.الوصف,
    data.الفئة,
    data.المبلغ,
    data.التاريخ
  ]);
  
  Logger.log('✅ Expense added: ' + data.ID);
  return createResponse({status: 'success', message: 'Expense added successfully'});
}

// ============================================================
// 📤 إضافة سحب
// ترتيب الأعمدة: ID | الاسم | الهاتف | المبلغ | السبب | التاريخ | الحالة
// ============================================================
function addWithdrawal(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('السحوبات_المعلقة');
  
  if (!sheet) {
    return createResponse({status: 'error', message: 'Sheet not found: السحوبات_المعلقة'});
  }
  
  sheet.appendRow([
    data.ID,
    data.الاسم,
    data.الهاتف,
    data.المبلغ,
    data.السبب,
    data.التاريخ,
    data.الحالة || 'معلق'
  ]);
  
  Logger.log('✅ Withdrawal added: ' + data.ID);
  return createResponse({status: 'success', message: 'Withdrawal added successfully'});
}

// ============================================================
// 🔄 تحديث حالة السحب
// ============================================================
function updateWithdrawalStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pendingSheet = ss.getSheetByName('السحوبات_المعلقة');
  
  if (!pendingSheet) {
    return createResponse({status: 'error', message: 'Sheet not found: السحوبات_المعلقة'});
  }
  
  if (data.الحالة === 'approved') {
    const targetSheet = ss.getSheetByName('السحوبات_المقبولة');
    if (!targetSheet) {
      return createResponse({status: 'error', message: 'Sheet not found: السحوبات_المقبولة'});
    }
    
    const pendingData = pendingSheet.getDataRange().getValues();
    
    for (let i = 1; i < pendingData.length; i++) {
      if (pendingData[i][0] == data.ID) {
        targetSheet.appendRow([
          pendingData[i][0], // ID
          pendingData[i][1], // التاريخ
          pendingData[i][2], // الاسم
          pendingData[i][3], // الهاتف
          pendingData[i][4], // المبلغ
          pendingData[i][5], // السبب
          'مقبول'
        ]);
        
        pendingSheet.deleteRow(i + 1);
        Logger.log('✅ Withdrawal approved: ' + data.ID);
        return createResponse({status: 'success'});
      }
    }
  } else if (data.الحالة === 'rejected') {
    const targetSheet = ss.getSheetByName('السحوبات_المرفوضة');
    if (!targetSheet) {
      return createResponse({status: 'error', message: 'Sheet not found: السحوبات_المرفوضة'});
    }
    
    const pendingData = pendingSheet.getDataRange().getValues();
    
    for (let i = 1; i < pendingData.length; i++) {
      if (pendingData[i][0] == data.ID) {
        targetSheet.appendRow([
          pendingData[i][0], // ID
          pendingData[i][1], // التاريخ
          pendingData[i][2], // الاسم
          pendingData[i][3], // الهاتف
          pendingData[i][4], // المبلغ
          pendingData[i][5], // السبب
          'مرفوض'
        ]);
        
        pendingSheet.deleteRow(i + 1);
        Logger.log('✅ Withdrawal rejected: ' + data.ID);
        return createResponse({status: 'success'});
      }
    }
  }
  
  return createResponse({status: 'error', message: 'Withdrawal not found: ' + data.ID});
}

// ============================================================
// 🗑️ حذف إيداع
// ============================================================
function deleteDeposit(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['الإيداعات_المعلقة', 'الإيداعات_المقبولة', 'الإيداعات_المرفوضة'];
  
  for (const sheetName of sheets) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;
    
    const sheetData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] == data.ID) {
        sheet.deleteRow(i + 1);
        Logger.log('✅ Deposit deleted: ' + data.ID);
        return createResponse({status: 'success'});
      }
    }
  }
  
  return createResponse({status: 'error', message: 'Deposit not found: ' + data.ID});
}

// ============================================================
// 🗑️ حذف مصروف
// ============================================================
function deleteExpense(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('المصروفات');
  
  if (!sheet) {
    return createResponse({status: 'error', message: 'Sheet not found: المصروفات'});
  }
  
  const sheetData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] == data.ID) {
      sheet.deleteRow(i + 1);
      Logger.log('✅ Expense deleted: ' + data.ID);
      return createResponse({status: 'success'});
    }
  }
  
  return createResponse({status: 'error', message: 'Expense not found: ' + data.ID});
}

// ============================================================
// 🗑️ حذف سحب
// ============================================================
function deleteWithdrawal(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['السحوبات_المعلقة', 'السحوبات_المقبولة', 'السحوبات_المرفوضة'];
  
  for (const sheetName of sheets) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;
    
    const sheetData = sheet.getDataRange().getValues();
    
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] == data.ID) {
        sheet.deleteRow(i + 1);
        Logger.log('✅ Withdrawal deleted: ' + data.ID);
        return createResponse({status: 'success'});
      }
    }
  }
  
  return createResponse({status: 'error', message: 'Withdrawal not found: ' + data.ID});
}

// ============================================================
// 🗑️ حذف جميع البيانات من كل الشيتات
// ============================================================
function deleteAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = [
    'الإيداعات_المعلقة', 'الإيداعات_المقبولة', 'الإيداعات_المرفوضة',
    'المصروفات',
    'السحوبات_المعلقة', 'السحوبات_المقبولة', 'السحوبات_المرفوضة'
  ];
  
  try {
    for (const sheetName of sheets) {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) continue;
      
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        // حذف كل الصفوف ما عدا صف العناوين
        sheet.deleteRows(2, lastRow - 1);
      }
    }
    
    Logger.log('✅ All data deleted from all sheets');
    return createResponse({status: 'success', message: 'All data deleted successfully'});
  } catch (error) {
    Logger.log('❌ Error deleting all data: ' + error.toString());
    return createResponse({status: 'error', message: error.toString()});
  }
}
// ============================================================
// ?? ????? ??? ?????
// ============================================================

// ???? ?????? ??? ????? ?? Google Sheets
function getPaymentMethodsData(ss) {
  const sheet = ss.getSheetByName('???????_???_?????');
  if (!sheet) {
    Logger.log('?? Sheet ???????_???_????? not found, creating default payment methods');
    return {
      instapay: {enabled: false, number: '', name: ''},
      ewallet: {enabled: false, type: '', number: '', name: ''},
      bank: {enabled: false, bankName: '', account: '', holder: '', iban: ''}
    };
  }
  
  try {
    const data = sheet.getRange(2, 1, 1, 12).getValues()[0];
    
    return {
      instapay: {
        enabled: data[0] === 'TRUE' || data[0] === true,
        number: data[1] || '',
        name: data[2] || ''
      },
      ewallet: {
        enabled: data[3] === 'TRUE' || data[3] === true,
        type: data[4] || '',
        number: data[5] || '',
        name: data[6] || ''
      },
      bank: {
        enabled: data[7] === 'TRUE' || data[7] === true,
        bankName: data[8] || '',
        account: data[9] || '',
        holder: data[10] || '',
        iban: data[11] || ''
      }
    };
  } catch (error) {
    Logger.log('? Error reading payment methods: ' + error.toString());
    return {
      instapay: {enabled: false, number: '', name: ''},
      ewallet: {enabled: false, type: '', number: '', name: ''},
      bank: {enabled: false, bankName: '', account: '', holder: '', iban: ''}
    };
  }
}

// ???? ?????? ??? ????? ???
function getPaymentMethods() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const paymentMethods = getPaymentMethodsData(ss);
  
  return createResponse({
    status: 'success',
    data: paymentMethods
  });
}

// ???? ???? ??? ????? ?? Google Sheets
function savePaymentMethods(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('???????_???_?????');
  
  // ????? ????? ??? ?? ??? ??????
  if (!sheet) {
    sheet = ss.insertSheet('???????_???_?????');
    // ????? ????????
    sheet.getRange(1, 1, 1, 12).setValues([[
      'Instapay ????', 'Instapay ???', 'Instapay ???',
      '????? ?????', '????? ???', '????? ???', '????? ???',
      '??? ????', '??? ???', '??? ????', '??? ???? ??????', '??? IBAN'
    ]]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#667eea').setFontColor('#ffffff');
  }
  
  try {
    const pm = data.paymentMethods;
    
    // ??? ???????? ?? ???? ??????
    sheet.getRange(2, 1, 1, 12).setValues([[
      pm.instapay.enabled,
      pm.instapay.number,
      pm.instapay.name,
      pm.ewallet.enabled,
      pm.ewallet.type,
      pm.ewallet.number,
      pm.ewallet.name,
      pm.bank.enabled,
      pm.bank.bankName,
      pm.bank.account,
      pm.bank.holder,
      pm.bank.iban
    ]]);
    
    Logger.log('? Payment methods saved successfully');
    return createResponse({status: 'success', message: 'Payment methods saved successfully'});
  } catch (error) {
    Logger.log('? Error saving payment methods: ' + error.toString());
    return createResponse({status: 'error', message: error.toString()});
  }
}
