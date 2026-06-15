const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);
let db;

// الاتصال بالخزانة أولاً
async function init() {
    await client.connect();
    db = client.db("Clutch-Jofotara-DB");
    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح!");
}
init();

app.post('/webhook', async (req, res) => {
    const merchantId = req.body.merchant_id;
    // الموظف يبحث في الخزانة
    const store = await db.collection('stores').findOne({ merchant_id: merchantId });
    
    if (store) {
        console.log(`✅ الموظف يقول: الفاتورة تخص المتجر: ${store.store_name} وهو فعال (active)!`);
    } else {
        console.log(`❌ الموظف يقول: لم أجد أي سجل لهذا المتجر: ${merchantId}`);
    }
    res.status(200).send('OK');
});const axios = require('axios');
// ====== كود اختبار الاتصال بنظام الضريبة (للتجربة فقط) ======
const dummyClientId = "test-client-id-12345";
const dummySecret = "test-secret-key-67890";
// هذه كلمة "فاتورة تجريبية" مشفرة بنظام Base64 كما تطلب الضريبة
const dummyXMLBase64 = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPEludm9pY2U+VGVzdDwvSW52b2ljZT4="; 

// نجعل السيرفر ينتظر 3 ثواني بعد تشغيله ثم يطرق باب الضريبة
setTimeout(() => {
    console.log("==> جاري تنفيذ اختبار النبض مع خوادم جو فوترة...");
    sendToJoFotara(dummyClientId, dummySecret, dummyXMLBase64);
}, 3000);

// دالة لإرسال الفاتورة إلى جو فوترة
async function sendToJoFotara(clientId, secretKey, encryptedXML) {
    const url = "https://backend.jofotara.gov.jo/core/invoices/";
    
    const headers = {
        "Client-Id": clientId,
        "Secret-Key": secretKey,
        "Content-Type": "application/json"
    };

    const body = {
        "invoice": encryptedXML
    };

    try {
        console.log("==> جاري إرسال الفاتورة إلى نظام جو فوترة...");
        const response = await axios.post(url, body, { headers: headers });
        
        console.log("✅ تم قبول الفاتورة بنجاح!");
        console.log("رد الضريبة:", response.data);
        
        // الرد سيحتوي على الـ QR Code من الضريبة
        return response.data; 

    } catch (error) {
        console.log("❌ حدث خطأ أثناء إرسال الفاتورة للضريبة:");
        if (error.response) {
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
        return null;
    }
}

app.listen(3000);
