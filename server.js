const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
    console.log("=== 🧾 استلام فاتورة جديدة من لويفيرس ===");

    try {
        const data = req.body;

        // لويفيرس يرسل بيانات الإيصال داخل قائمة اسمها receipts
        if (data.receipts && data.receipts.length > 0) {
            const receipt = data.receipts[0];
            
            console.log(`📌 رقم الفاتورة: ${receipt.receipt_number}`);
            console.log(`💰 الإجمالي: ${receipt.total_money}`);
            console.log(`⚖️ الضريبة: ${receipt.total_tax}`);
            console.log(`🕒 وقت الإصدار: ${receipt.created_at}`);
            console.log("⏳ هذه هي البيانات النظيفة التي سيتم إرسالها إلى جو فوترة لاحقاً...");
            
        } else {
            console.log("تم الاستلام، لكن لم يتم العثور على تفاصيل الإيصال.");
        }
    } catch (error) {
        console.log("حدث خطأ في قراءة البيانات:", error.message);
    }

    console.log("=======================================");
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`السيرفر يعمل ومستعد لاستقبال الفواتير...`);
});
