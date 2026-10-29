const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { z } = require('zod');
const handleError = require('../utils/handleError');
const { objectId, isValidId, formatZodError } = require('../utils/validation');

const orderSchemaZod = z.object({
    user: objectId,
    products: z.array(z.object({
        product: objectId,
        quantity: z.number().int().positive()
    })).min(1)
});

// החזרת מלאי שכבר הורד, במקרה שההזמנה נכשלה באמצע
const restoreStock = (items) => Promise.all(items.map(item =>
    Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
));

exports.createOrder = async (req, res) => {
    try {
        const parseResult = orderSchemaZod.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: formatZodError(parseResult.error) });
        }

        const { user, products } = parseResult.data;

        if (!(await User.exists({ _id: user }))) {
            return res.status(404).json({ error: `User ${user} not found` });
        }

        // איחוד שורות של אותו מוצר, כדי שבדיקת המלאי תתייחס לכמות הכוללת
        const quantities = new Map();
        for (const item of products) {
            quantities.set(item.product, (quantities.get(item.product) || 0) + item.quantity);
        }
        const items = [...quantities].map(([product, quantity]) => ({ product, quantity }));

        // שלב א': בדיקה שהמוצרים קיימים ושקיים מלאי מספיק + חישוב מחיר בצד השרת
        let totalPrice = 0;
        for (const item of items) {
            const productDoc = await Product.findById(item.product);
            if (!productDoc) {
                return res.status(404).json({ error: `Product ${item.product} not found` });
            }
            if (productDoc.stock < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for product ${productDoc.name}. Available: ${productDoc.stock}` });
            }
            item.price = productDoc.price;
            totalPrice += productDoc.price * item.quantity;
        }

        // שלב ב': עדכון המלאי - הורדה אטומית רק אם עדיין יש מספיק מלאי
        const updated = [];
        for (const item of items) {
            const result = await Product.updateOne(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            );
            if (result.modifiedCount === 0) {
                await restoreStock(updated);
                return res.status(409).json({ error: `Stock for product ${item.product} changed, please try again` });
            }
            updated.push(item);
        }

        // שלב ג': יצירת ההזמנה ושמירה
        let order;
        try {
            order = await Order.create({ user, products: items, totalPrice });
        } catch (error) {
            await restoreStock(updated);
            throw error;
        }

        await order.populate(['user', 'products.product']);
        res.status(201).json(order);
    } catch (error) {
        handleError(res, error);
    }
};

// הצגת הזמנה יחד עם פרטי המשתמש והמוצרים הקשורים אליה (populate)
exports.getOrderById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid order id' });
        }
        const order = await Order.findById(req.params.id)
            .populate('user')
            .populate({ path: 'products.product', populate: { path: 'category' } });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.status(200).json(order);
    } catch (error) {
        handleError(res, error);
    }
};

// הצגת כל ההזמנות של משתמש מסוים
exports.getOrdersByUser = async (req, res) => {
    try {
        if (!isValidId(req.params.userId)) {
            return res.status(400).json({ error: 'Invalid user id' });
        }
        if (!(await User.exists({ _id: req.params.userId }))) {
            return res.status(404).json({ error: 'User not found' });
        }
        const orders = await Order.find({ user: req.params.userId })
            .populate('products.product')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        handleError(res, error);
    }
};
