const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection(process.env.DATABASE_URL);

// ตรวจสอบการเชื่อมต่อฐานข้อมูล
connection.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to database.');
});

// ดึงร้านอาหารทั้งหมด
app.get('/restaurants', (req, res) => {
    connection.query('SELECT * FROM restaurants', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(results);
        }
    });
});

// ดึงข้อมูลร้านอาหารตาม ID
app.get('/restaurants/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM restaurants WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(results);
        }
    });
});

// ดึงเมนูของร้านอาหารตาม ID ร้าน
app.get('/restaurants/:id/menu', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM menu WHERE restaurant_id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(results);
        }
    });
});

// เพิ่มร้านอาหารใหม่
app.post('/restaurants', (req, res) => {
    const { name, description, address, avatar } = req.body;
    connection.query(
        'INSERT INTO restaurants (name, description, address, avatar) VALUES (?, ?, ?, ?)',
        [name, description, address, avatar],
        (err, results) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(201).send({ id: results.insertId, ...req.body });
            }
        }
    );
});

// เพิ่มเมนูใหม่ในร้านอาหาร
app.post('/menu', (req, res) => {
    const { restaurant_id, name, price, description, image_url } = req.body;
    connection.query(
        'INSERT INTO menu (restaurant_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
        [restaurant_id, name, price, description, image_url],
        (err, results) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(201).send({ id: results.insertId, ...req.body });
            }
        }
    );
});

// อัปเดตร้านอาหาร
app.put('/restaurants/:id', (req, res) => {
    const { name, description, address, avatar } = req.body;
    const id = req.params.id;
    connection.query(
        'UPDATE restaurants SET name=?, description=?, address=?, avatar=? WHERE id=?',
        [name, description, address, avatar, id],
        (err, results) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send({ id, ...req.body });
            }
        }
    );
});

// อัปเดตเมนู
app.put('/menu/:id', (req, res) => {
    const { name, price, description, image_url } = req.body;
    const id = req.params.id;
    connection.query(
        'UPDATE menu SET name=?, price=?, description=?, image_url=? WHERE id=?',
        [name, price, description, image_url, id],
        (err, results) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send({ id, ...req.body });
            }
        }
    );
});

// ลบร้านอาหาร
app.delete('/restaurants/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM restaurants WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send({ message: 'Deleted successfully' });
        }
    });
});

// ลบเมนู
app.delete('/menu/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM menu WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send({ message: 'Deleted successfully' });
        }
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});

module.exports = app;