const express = require('express');
const axios = require('axios'); // هذه المكتبة المسؤولة عن الإرسال
const app = express();

app.use(express.json());

// الرابط التجريبي الذي سنرسل له البيانات لنختبر (استبدله لاحقاً برابط جو فوترة)
const JO_FOTARA_URL = 'https://webhook.site/YOUR_UNIQUE_URL'; 

app.post('/webhook', async (req, res) => {
    console.log("=== 🧾 استلام فاتورة من لويفيرس ===");
    const receipt = req.body.receipts ? req.body.receipts[0] : null;

    if (receipt) {
        console.log(`📌 جاري تجهيز الفاتورة رقم: ${receipt.receipt_number}`);

        // تجهيز بيانات الفاتورة بالشكل الذي تحتاجه الضريبة
        const invoiceData = {
            invoiceNumber: receipt.receipt_number,
            totalAmount: receipt.total_money,
            taxAmount: receipt.total_tax,
            timestamp: receipt.created_at
        };

        // محاولة إرسال البيانات
        try {
            console.log("🚀 جاري إرسال البيانات إلى نظام الفوترة...");
            // هنا سنرسل البيانات فعلياً
            // await axios.post(JO_FOTARA_URL, invoiceData); 
            console.log("✅ تم إرسال البيانات بنجاح (تجريبي):", invoiceData);
        } catch (error) {
            console.log("❌ فشل الإرسال:", error.message);
        }
    }
    
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`السيرفر يعمل...`));
