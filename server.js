const express = require('express');
const app = express();

// السماح للنظام بقراءة بيانات الفاتورة القادمة
app.use(express.json());

// المسار الذي سيستقبل الفواتير من لويفيرس
app.post('/webhook', (req, res) => {
    const receiptData = req.body;
    
    console.log('-----------------------------------');
    console.log('🎉 إشعار: تم استقبال فاتورة جديدة بنجاح!');
    console.log('تفاصيل الفاتورة:');
    console.log(JSON.stringify(receiptData, null, 2));
    console.log('-----------------------------------');
    
    // الرد على لويفيرس لتأكيد الاستلام
    res.status(200).send('Receipt received');
});

// تشغيل النظام على المنفذ 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 النظام يعمل ويستمع على المنفذ ${PORT}`);
});