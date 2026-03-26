const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const header = req.header('Authorization');
    if (!header) return res.status(401).json({ msg: 'No token, auth denied' });

    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
