const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// ตั้งค่า CORS และให้ใช้งาน JSON
app.use(cors());
app.use(express.json());

// เชื่อมต่อกับฐานข้อมูล MySQL
const connection = mysql.createConnection(process.env.DATABASE_URL);

// ตรวจสอบการเชื่อมต่อ
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// API หลักเพื่อดึงข้อมูลร้านอาหารและเมนูทั้งหมด
app.get('/restaurants', (req, res) => {
  connection.query(
    'SELECT * FROM restaurants',
    (err, restaurants) => {
      if (err) {
        return res.status(500).send('Error fetching restaurants');
      }

      // ดึงเมนูทั้งหมด
      connection.query(
        'SELECT * FROM menu',
        (err, menu) => {
          if (err) {
            return res.status(500).send('Error fetching menu');
          }

          // การเชื่อมโยงร้านอาหารกับเมนู
          const result = restaurants.map(restaurant => ({
            id: restaurant.id,
            name: restaurant.name,
            description: restaurant.description,
            address: restaurant.address,
            avatar: restaurant.avatar,
            menu: menu
              .filter(item => item.restaurant_id === restaurant.id)
              .map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                description: item.description,
                image_url: item.image_url
              }))
          }));

          res.json({ restaurants: result }); // ส่งข้อมูลกลับเป็น JSON
        }
      );
    }
  );
});

// เพิ่มร้านอาหาร
app.post('/restaurants', (req, res) => {
  const { name, description, address, avatar } = req.body;
  connection.query(
    'INSERT INTO restaurants (name, description, address, avatar) VALUES (?, ?, ?, ?)',
    [name, description, address, avatar],
    (err, result) => {
      if (err) {
        return res.status(500).send('Error adding restaurant');
      }
      res.status(200).send(result);
    }
  );
});

// เพิ่มเมนู
app.post('/menu', (req, res) => {
  const { restaurant_id, name, price, description, image_url } = req.body;
  connection.query(
    'INSERT INTO menu (restaurant_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
    [restaurant_id, name, price, description, image_url],
    (err, result) => {
      if (err) {
        return res.status(500).send('Error adding menu item');
      }
      res.status(200).send(result);
    }
  );
});

// อัพเดตข้อมูลร้านอาหาร
app.put('/restaurants/:id', (req, res) => {
  const { name, description, address, avatar } = req.body;
  const { id } = req.params;
  connection.query(
    'UPDATE restaurants SET name=?, description=?, address=?, avatar=? WHERE id=?',
    [name, description, address, avatar, id],
    (err, result) => {
      if (err) {
        return res.status(500).send('Error updating restaurant');
      }
      res.status(200).send(result);
    }
  );
});

// อัพเดตเมนู
app.put('/menu/:id', (req, res) => {
  const { name, price, description, image_url } = req.body;
  const { id } = req.params;
  connection.query(
    'UPDATE menu SET name=?, price=?, description=?, image_url=? WHERE id=?',
    [name, price, description, image_url, id],
    (err, result) => {
      if (err) {
        return res.status(500).send('Error updating menu');
      }
      res.status(200).send(result);
    }
  );
});

// ลบร้านอาหาร
app.delete('/restaurants/:id', (req, res) => {
  const { id } = req.params;
  connection.query(
    'DELETE FROM restaurants WHERE id=?',
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).send('Error deleting restaurant');
      }
      res.status(200).send(result);
    }
  );
});

// ลบเมนู
app.delete('/menu/:id', (req, res) => {
  const { id } = req.params;
  connection.query(
    'DELETE FROM menu WHERE id=?',
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).send('Error deleting menu item');
      }
      res.status(200).send(result);
    }
  );
});

// เริ่มเซิร์ฟเวอร์
app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port 3000');
});

// export app สำหรับการใช้งานใน serverless functions
module.exports = app;
