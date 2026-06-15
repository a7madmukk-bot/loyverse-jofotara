const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(express.json());

// =========================================================================
// 1. إعدادات قاعدة البيانات (الخزانة)
// =========================================================================

// ضع رابط قاعدة بيانات MongoDB الخاص بك بين علامتي التنصيص هنا
const mongoURI = "mongodb+srv://admin_ahmad:Mukran12@cluster0.n1tq5.mongodb.net/clutch_db?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log('✅ تم الاتصال بقاعدة البيانات MongoDB بنجاح'))
    .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// تعريف شكل بيانات العميل في الخزانة
const storeSchema = new mongoose.Schema({
    merchant_id: String,
    status: String,
    store_name: String
}, { collection: 'stores' });

const Store = mongoose.model('Store', storeSchema);


// =========================================================================
// 2. دوال نظام "جو فوترة" (المترجم والمُرسل)
// =========================================================================

// أ. المترجم: يحول بيانات الفاتورة إلى صيغة XML معتمدة ثم يشفرها
function generateJoFotaraXML(receiptData) {
    // قالب UBL 2.1 مبسط
    const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:ID>${receiptData.receipt_number || 'INV-001'}</cbc:ID>
    <cbc:IssueDate>2026-06-15</cbc:IssueDate>
    <cbc:InvoiceTypeCode name="011">388</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>JOD</cbc:DocumentCurrencyCode>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>Clutch</cbc:Name>
            </cac:PartyName>
        </cac:Party>
    </cac:AccountingSupplierParty>
    <cac:LegalMonetaryTotal>
        <cbc:TaxExclusiveAmount currencyID="JOD">${receiptData.total_money || '0.00'}</cbc:TaxExclusiveAmount>
        <cbc:PayableAmount currencyID="JOD">${receiptData.total_money || '0.00'}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
</Invoice>`;

    // التشفير إلى Base64
    const base64XML = Buffer.from(xmlTemplate).toString('base64');
    return base64XML;
}

// ب. المُرسل: يطرق باب الضريبة ويرسل الفاتورة المشفرة
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
        console.log("==> جاري إرسال الفاتورة المشفرة إلى نظام جو فوترة...");
        const response = await axios.post(url, body, { headers: headers });
        
        console.log("✅ تم قبول الفاتورة بنجاح من الضريبة!");
        console.log("رد الضريبة:", response.data);
        return response.data; 

    } catch (error) {
        console.log("❌ تم رفض الطلب من قِبل الضريبة (وهذا طبيعي الآن لأننا نستخدم مفاتيح وهمية):");
        if (error.response) {
            console.log("السبب:", error.response.data);
        } else {
            console.log(error.message);
        }
        return null;
    }
}


// =========================================================================
// 3. البوابة الرئيسية (استقبال الطلبات من لويفيرس)
// =========================================================================

app.post('/webhook', async (req, res) => {
    // الرد السريع على لويفيرس حتى لا ينقطع الاتصال
    res.status(200).send('Webhook received!');

    try {
        const receiptData = req.body;
        const merchantId = receiptData.merchant_id;

        console.log(`\n--- فاتورة جديدة قادمة! ---`);
        
        // البحث عن التاجر في قاعدة البيانات
        const store = await Store.findOne({ merchant_id: merchantId });

        if (!store) {
            console.log(`❌ الموظف يقول: لم أجد أي سجل لهذا المتجر (${merchantId}) في الخزانة. سيتم تجاهل الفاتورة.`);
            return;
        }

        // إذا كان التاجر موجوداً، نفحص حالته
        if (store.status === "active") {
            console.log(`✅ الفاتورة تخص المتجر: ${store.store_name} وهو فعال.`);
            
            // 1. تمرير الفاتورة للمترجم لتشفيرها
            const encryptedInvoice = generateJoFotaraXML(receiptData);
            console.log("تمت ترجمة وتشفير الفاتورة بنجاح.");
            
            // 2. إرسالها إلى الضريبة بمفاتيح تجريبية لاختبار الاتصال
            const dummyClientId = "test-client-id-12345";
            const dummySecret = "test-secret-key-67890";
            
            await sendToJoFotara(dummyClientId, dummySecret, encryptedInvoice);
            
        } else {
            console.log(`⚠️ المتجر: ${store.store_name} موجود لكن اشتراكه غير فعال (inactive). لن يتم إرسال الفاتورة.`);
        }

    } catch (error) {
        console.error('❌ حدث خطأ في معالجة الفاتورة:', error);
    }
});

// =========================================================================
// 4. تشغيل السيرفر
// =========================================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل بنجاح ومستعد لاستقبال الفواتير على المنفذ ${PORT}`);
});
