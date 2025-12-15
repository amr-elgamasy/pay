// نموذج الإعدادات - انسخ والصقه في index.html

// ===== Google Sheets إعداد =====
const GOOGLE_SHEETS_CONFIG = {
    enabled: true, // ✅ فعّل بعد الإعداد
    scriptUrl: 'YOUR_GOOGLE_SCRIPT_URL_HERE', // مثال: https://script.google.com/macros/s/AKfycbxxx.../exec
};

// ===== Telegram إعداد =====
const TELEGRAM_CONFIG = {
    enabled: true, // ✅ فعّل بعد الإعداد
    botToken: 'YOUR_BOT_TOKEN_HERE', // مثال: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
    chatId: 'YOUR_CHAT_ID_HERE', // مثال: 987654321 أو -1001234567890 للمجموعات
};

/*
📝 ملاحظات:
- اتبع دليل SETUP_GUIDE.md للحصول على البيانات المطلوبة
- ضع enabled: false إذا أردت تعطيل أي خدمة مؤقتاً
- تأكد من عدم مشاركة Bot Token مع أحد
*/
