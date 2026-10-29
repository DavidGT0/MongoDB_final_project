const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2 },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
    }
});
module.exports = mongoose.model('User', userSchema);
