const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection(process.env.DATABASE_URL);

// ตรวจสอบการเชื่อมต่อฐานข้อมูล
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database');
});

// เส้นทางหลัก
app.get('/', (req, res) => {
    res.send('Welcome to Restaurant API!');
});

// ดึงข้อมูลร้านอาหารทั้งหมด
app.get('/restaurants', (req, res) => {
    connection.query('SELECT * FROM restaurants', (err, results) => {
        if (err) {
            console.error('Error fetching restaurants:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).json(results);
        }
    });
});

// ดึงข้อมูลร้านอาหารตาม ID
app.get('/restaurants/:id', (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM restaurants WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error fetching restaurant:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).json(results);
        }
    });
});

// ดึงเมนูทั้งหมดของร้านอาหารตาม restaurant_id
app.get('/restaurants/:id/menus', (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM menus WHERE restaurant_id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error fetching menus:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).json(results);
        }
    });
});

// เพิ่มร้านอาหารใหม่
app.post('/restaurants', (req, res) => {
    const { id, name, description, address, avatar } = req.body;
    connection.query('INSERT INTO restaurants (id, name, description, address, avatar) VALUES (?, ?, ?, ?, ?)',
        [id, name, description, address, avatar],
        (err, results) => {
            if (err) {
                console.error('Error adding restaurant:', err);
                res.status(500).send('Internal Server Error');
            } else {
                res.status(201).json({ message: 'Restaurant added successfully', id: results.insertId });
            }
        });
});

// เพิ่มเมนูใหม่ในร้านอาหาร
app.post('/menus', (req, res) => {
    const { restaurant_id, name, price, description, image_url } = req.body;
    connection.query('INSERT INTO menus (restaurant_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
        [restaurant_id, name, price, description, image_url],
        (err, results) => {
            if (err) {
                console.error('Error adding menu:', err);
                res.status(500).send('Internal Server Error');
            } else {
                res.status(201).json({ message: 'Menu added successfully', id: results.insertId });
            }
        });
});

// เริ่มต้นเซิร์ฟเวอร์
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// ส่งออกแอปเพื่อรองรับ Vercel
module.exports = app;
