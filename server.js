const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

app.use(express.json());

// الاتصال بقاعدة البيانات باستخدام الرابط الذي وضعناه في Render
const client = new MongoClient(process.env.MONGODB_URI);

async function startConnection() {
    try {
        await client.connect();
        console.log("✅ تم الاتصال بـ MongoDB بنجاح!");
    } catch (err) {
        console.error("❌ خطأ في الاتصال:", err.message);
    }
}
startConnection();

app.post('/webhook', (req, res) => {
    console.log("استلمنا فاتورة جديدة...");
    res.status(200).send('OK');
});

app.listen(3000, () => console.log('السيرفر يعمل...'));
