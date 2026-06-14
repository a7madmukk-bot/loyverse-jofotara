const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// الرابط الأساسي للتأكد أن السيرفر مستيقظ
app.get('/', (req, res) => {
    res.send('السيرفر يعمل بنجاح ومستعد لاستقبال الفواتير...');
});

app.post('/webhook', (req, res) => {
    console.log("=== 🧾 استلام بيانات جديدة من لويفيرس ===");

    try {
        const data = req.body;

        // التحقق من وجود بيانات فاتورة
        if (data.receipts && data.receipts.length > 0) {
            const receipt = data.receipts[0];
            
            console.log(`📌 رقم الفاتورة: ${receipt.receipt_number}`);
            console.log(`💰 الإجمالي: ${receipt.total_money}`);
            console.log(`⚖️ الضريبة: ${receipt.total_tax}`);
            console.log(`🆔 رمز المتجر (Merchant ID): ${data.merchant_id}`);
            console.log("⏳ جاري التجهيز للإرسال إلى نظام الفوترة...");
            
            // هنا سنضع لاحقاً كود الإرسال إلى جو فوترة باستخدام axios
            
        } else {
            console.log("تم استلام حدث، ولكن ليس فاتورة مبيعات.");
        }
    } catch (error) {
        console.log("خطأ في معالجة البيانات:", error.message);
    }

    console.log("=======================================");
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`السيرفر يعمل على المنفذ ${PORT}`);
});
