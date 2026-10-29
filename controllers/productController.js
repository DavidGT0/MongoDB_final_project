const Product = require('../models/Product');
const Category = require('../models/Category');
const { z } = require('zod');
const handleError = require('../utils/handleError');
const { objectId, isValidId, formatZodError } = require('../utils/validation');

const productSchemaZod = z.object({
    name: z.string().trim().min(2),
    price: z.number().positive(),
    stock: z.number().int().nonnegative(),
    category: objectId
});

// בעדכון כל השדות אופציונליים, אבל חייב להגיע לפחות שדה אחד
const productUpdateSchemaZod = productSchemaZod.partial().refine(
    data => Object.keys(data).length > 0,
    { message: 'At least one field (name, price, stock, category) is required' }
);

exports.createProduct = async (req, res) => {
    try {
        const parseResult = productSchemaZod.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: formatZodError(parseResult.error) });
        }
        if (!(await Category.exists({ _id: parseResult.data.category }))) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const product = new Product(parseResult.data);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        handleError(res, error);
    }
};

// הצגת מוצרים לפי קטגוריה בשימוש ב-query (למשל: /api/products?category=ID)
exports.getProducts = async (req, res) => {
    try {
        const filter = {};
        if (req.query.category) {
            if (!isValidId(req.query.category)) {
                return res.status(400).json({ error: 'Invalid category id' });
            }
            if (!(await Category.exists({ _id: req.query.category }))) {
                return res.status(404).json({ error: 'Category not found' });
            }
            filter.category = req.query.category;
        }
        const products = await Product.find(filter).populate('category');
        res.status(200).json(products);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getProductById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid product id' });
        }
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        handleError(res, error);
    }
};

exports.updateProduct = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid product id' });
        }
        const parseResult = productUpdateSchemaZod.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: formatZodError(parseResult.error) });
        }
        if (parseResult.data.category && !(await Category.exists({ _id: parseResult.data.category }))) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const product = await Product.findByIdAndUpdate(req.params.id, parseResult.data, {
            returnDocument: 'after',
            runValidators: true
        }).populate('category');
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        handleError(res, error);
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid product id' });
        }
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.status(200).json({ message: 'Product deleted', product });
    } catch (error) {
        handleError(res, error);
    }
};
