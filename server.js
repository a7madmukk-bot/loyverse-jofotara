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
});

app.listen(3000);
