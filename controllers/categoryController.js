const Category = require('../models/Category');
const Product = require('../models/Product');
const { z } = require('zod');
const handleError = require('../utils/handleError');
const { isValidId, formatZodError } = require('../utils/validation');

const categorySchemaZod = z.object({
    name: z.string().trim().min(2)
});

exports.createCategory = async (req, res) => {
    try {
        const parseResult = categorySchemaZod.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: formatZodError(parseResult.error) });
        }
        const category = new Category(parseResult.data);
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        handleError(res, error);
    }
};

// הצגת מספר המוצרים בכל קטגוריה (כולל קטגוריות ללא מוצרים)
exports.getProductsCountPerCategory = async (req, res) => {
    try {
        const counts = await Category.aggregate([
            {
                $lookup: {
                    from: Product.collection.name,
                    localField: '_id',
                    foreignField: 'category',
                    as: 'products'
                }
            },
            { $project: { name: 1, productsCount: { $size: '$products' } } },
            { $sort: { name: 1 } }
        ]);
        res.status(200).json(counts);
    } catch (error) {
        handleError(res, error);
    }
};

// הצגת מספר המוצרים בקטגוריה מסוימת
exports.getProductsCountByCategory = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid category id' });
        }
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });

        const count = await Product.countDocuments({ category: category._id });
        res.status(200).json({ categoryId: category._id, name: category.name, productsCount: count });
    } catch (error) {
        handleError(res, error);
    }
};
