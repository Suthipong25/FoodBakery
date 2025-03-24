const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// สร้าง connection pool
const pool = mysql.createPool(process.env.DATABASE_URL).promise();

// ตรวจสอบการเชื่อมต่อฐานข้อมูล
pool.getConnection()
    .then(connection => {
        console.log('Connected to database.');
        connection.release();
    })
    .catch(err => console.error('Database connection failed:', err.stack));

// ดึงร้านอาหารทั้งหมด
app.get('/restaurants', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM restaurants');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ดึงข้อมูลร้านอาหารตาม ID
app.get('/restaurants/:id', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
        if (results.length === 0) return res.status(404).json({ error: 'Restaurant not found' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ดึงเมนูของร้านอาหารตาม ID ร้าน
app.get('/restaurants/:id/menu', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM menu WHERE restaurant_id = ?', [req.params.id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// เพิ่มร้านอาหารใหม่
app.post('/restaurants', async (req, res) => {
    try {
        const { name, description, address, avatar } = req.body;
        const [result] = await pool.query(
            'INSERT INTO restaurants (name, description, address, avatar) VALUES (?, ?, ?, ?)',
            [name, description, address, avatar]
        );
        res.status(201).json({ id: result.insertId, name, description, address, avatar });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// เพิ่มเมนูใหม่ในร้านอาหาร
app.post('/menu', async (req, res) => {
    try {
        const { restaurant_id, name, price, description, image_url } = req.body;
        const [result] = await pool.query(
            'INSERT INTO menu (restaurant_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
            [restaurant_id, name, price, description, image_url]
        );
        res.status(201).json({ id: result.insertId, restaurant_id, name, price, description, image_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// อัปเดตร้านอาหาร
app.put('/restaurants/:id', async (req, res) => {
    try {
        const { name, description, address, avatar } = req.body;
        const [result] = await pool.query(
            'UPDATE restaurants SET name=?, description=?, address=?, avatar=? WHERE id=?',
            [name, description, address, avatar, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Restaurant not found' });
        res.json({ id: req.params.id, name, description, address, avatar });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// อัปเดตเมนู
app.put('/menu/:id', async (req, res) => {
    try {
        const { name, price, description, image_url } = req.body;
        const [result] = await pool.query(
            'UPDATE menu SET name=?, price=?, description=?, image_url=? WHERE id=?',
            [name, price, description, image_url, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Menu not found' });
        res.json({ id: req.params.id, name, price, description, image_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ลบร้านอาหาร
app.delete('/restaurants/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM restaurants WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Restaurant not found' });
        res.json({ message: 'Restaurant deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ลบเมนู
app.delete('/menu/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM menu WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Menu not found' });
        res.json({ message: 'Menu deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;