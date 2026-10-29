const User = require('../models/User');
const { z } = require('zod');
const handleError = require('../utils/handleError');
const { isValidId, formatZodError } = require('../utils/validation');

const userSchemaZod = z.object({
    name: z.string().trim().min(2),
    email: z.email()
});

exports.createUser = async (req, res) => {
    try {
        const parseResult = userSchemaZod.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: formatZodError(parseResult.error) });
        }
        const newUser = new User(parseResult.data);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        handleError(res, error);
    }
};

exports.getUserById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid user id' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        handleError(res, error);
    }
};
