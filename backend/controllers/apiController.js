const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashed]);
        res.json({ msg: "Registered!" });
    } catch (err) {
        res.status(500).json({ error: "Register error or email exists" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query("SELECT * FROM users WHERE email=?", [email]);
        if (!users.length) return res.status(400).json({ msg: "Invalid user" });
        const isMatch = await bcrypt.compare(password, users[0].password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
        const token = jwt.sign({ id: users[0].id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, name: users[0].name });
    } catch (err) {
        res.status(500).json({ error: "Login error" });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM categories WHERE user_id=?", [req.user.id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Error" }); }
};

exports.createCategory = async (req, res) => {
    try {
        await db.query("INSERT INTO categories (user_id, name) VALUES (?, ?)", [req.user.id, req.body.name]);
        res.json({ msg: "Category created" });
    } catch (err) { res.status(500).json({ error: "Error" }); }
};

exports.getGroups = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM `groups` WHERE user_id=?", [req.user.id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Error" }); }
};

exports.createGroup = async (req, res) => {
    try {
        await db.query("INSERT INTO `groups` (user_id, name) VALUES (?, ?)", [req.user.id, req.body.name]);
        res.json({ msg: "Group created" });
    } catch (err) { res.status(500).json({ error: "Error" }); }
};

exports.getExpenses = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.*, c.name as category_name, g.name as group_name 
            FROM expenses e 
            JOIN categories c ON e.category_id=c.id 
            LEFT JOIN \`groups\` g ON e.group_id=g.id 
            WHERE e.user_id=? ORDER BY e.date DESC
        `, [req.user.id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Error" }); }
};

exports.createExpense = async (req, res) => {
    try {
        const { category_id, group_id, amount, description, date } = req.body;
        const finalGroup = group_id ? group_id : null;
        await db.query("INSERT INTO expenses (user_id, category_id, group_id, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)",
            [req.user.id, category_id, finalGroup, amount, description, date]);
        res.json({ msg: "Expense added" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error" });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const [totalRows] = await db.query("SELECT SUM(amount) as t FROM expenses WHERE user_id=?", [req.user.id]);
        const total = totalRows[0].t || 0;

        const [catRows] = await db.query(`
            SELECT c.name, SUM(e.amount) as t FROM expenses e 
            JOIN categories c ON e.category_id=c.id 
            WHERE e.user_id=? GROUP BY c.id
        `, [req.user.id]);

        const [grpRows] = await db.query(`
            SELECT g.name, SUM(e.amount) as t FROM expenses e 
            JOIN \`groups\` g ON e.group_id=g.id 
            WHERE e.user_id=? GROUP BY g.id
        `, [req.user.id]);

        const [trendRows] = await db.query(`
            SELECT e.date, c.name as category_name, SUM(e.amount) as t FROM expenses e 
            JOIN categories c ON e.category_id=c.id
            WHERE e.user_id=? GROUP BY e.date, c.name ORDER BY e.date ASC LIMIT 100
        `, [req.user.id]);

        const [recent] = await db.query(`
            SELECT e.amount, e.description, e.date, c.name as category_name, g.name as group_name 
            FROM expenses e 
            JOIN categories c ON e.category_id=c.id 
            LEFT JOIN \`groups\` g ON e.group_id=g.id
            WHERE e.user_id=? ORDER BY e.date DESC LIMIT 5
        `, [req.user.id]);

        res.json({ total, byCategory: catRows, byGroup: grpRows, trend: trendRows, recent });
    } catch (err) { res.status(500).json({ error: "Error" }); }
};
