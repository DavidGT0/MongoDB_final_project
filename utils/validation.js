const { z } = require('zod');

// מזהה MongoDB תקין: מחרוזת של 24 תווים הקסדצימליים
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const isValidId = (id) => objectId.safeParse(id).success;

// הופך את שגיאות Zod לרשימה קריאה של שדה + הודעה
const formatZodError = (error) =>
    error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message }));

module.exports = { objectId, isValidId, formatZodError };
