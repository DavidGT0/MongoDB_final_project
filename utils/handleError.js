// ממפה שגיאות Mongoose / MongoDB לקודי HTTP מתאימים
module.exports = (res, error) => {
    if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }
    if (error.name === 'CastError') {
        return res.status(400).json({ error: `Invalid value for ${error.path}: ${error.value}` });
    }
    if (error.code === 11000) {
        return res.status(409).json({ error: `Duplicate value: ${JSON.stringify(error.keyValue)}` });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
};
