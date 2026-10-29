// שם: דוד גזית
require('dotenv').config({ quiet: true });
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// נתיב שלא קיים
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// טיפול בשגיאות כלליות (למשל JSON לא תקין בגוף הבקשה)
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

// השרת עולה רק אחרי שהחיבור ל-MongoDB הצליח
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB - virtual_store');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

startServer();
