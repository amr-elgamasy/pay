// ============================================================
// 💳 إضافة إدارة طرق الدفع إلى Google Apps Script
// ============================================================
// أضف هذا الكود في نهاية ملف google-apps-script.js

// دالة لتحميل طرق الدفع من Google Sheets
function getPaymentMethodsData(ss) {
  const sheet = ss.getSheetByName('إعدادات_طرق_الدفع');
  if (!sheet) {
    Logger.log('⚠️ Sheet إعدادات_طرق_الدفع not found');
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
    Logger.log('❌ Error reading payment methods: ' + error.toString());
    return {
      instapay: {enabled: false, number: '', name: ''},
      ewallet: {enabled: false, type: '', number: '', name: ''},
      bank: {enabled: false, bankName: '', account: '', holder: '', iban: ''}
    };
  }
}

// دالة لإرجاع طرق الدفع فقط
function getPaymentMethods() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const paymentMethods = getPaymentMethodsData(ss);
  
  return createResponse({
    status: 'success',
    data: paymentMethods
  });
}

// دالة لحفظ طرق الدفع في Google Sheets
function savePaymentMethods(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('إعدادات_طرق_الدفع');
  
  // إنشاء الشيت إذا لم يكن موجوداً
  if (!sheet) {
    sheet = ss.insertSheet('إعدادات_طرق_الدفع');
    // إضافة العناوين
    sheet.getRange(1, 1, 1, 12).setValues([[
      'Instapay مفعل', 'Instapay رقم', 'Instapay اسم',
      'محفظة مفعلة', 'محفظة نوع', 'محفظة رقم', 'محفظة اسم',
      'بنك مفعل', 'بنك اسم', 'بنك حساب', 'بنك صاحب الحساب', 'بنك IBAN'
    ]]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#667eea').setFontColor('#ffffff');
  }
  
  try {
    const pm = data.paymentMethods;
    
    // حفظ البيانات في الصف الثاني
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
    
    Logger.log('✅ Payment methods saved successfully');
    return createResponse({status: 'success', message: 'Payment methods saved successfully'});
  } catch (error) {
    Logger.log('❌ Error saving payment methods: ' + error.toString());
    return createResponse({status: 'error', message: error.toString()});
  }
}
