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

// ดึงข้อมูลร้านอาหารทั้งหมด รวมข้อมูลเมนู
app.get('/restaurants', (req, res) => {
    const sql = `
        SELECT 
            r.id AS restaurant_id,
            r.name AS restaurant_name,
            r.description AS restaurant_description,
            r.address AS restaurant_address,
            r.avatar AS restaurant_avatar,
            m.id AS menu_id,
            m.name AS menu_name,
            m.price AS menu_price,
            m.description AS menu_description,
            m.image_url AS menu_image_url
        FROM restaurants r
        LEFT JOIN menus m ON r.id = m.restaurant_id;
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching restaurants and menus:', err);
            res.status(500).send('Internal Server Error');
        } else {
            // สร้าง array ของ restaurants โดยมีเมนูเป็น array ภายในแต่ละร้าน
            const formattedResults = [];
            let currentRestaurant = null;

            results.forEach(row => {
                if (currentRestaurant && currentRestaurant.restaurant_id === row.restaurant_id) {
                    // เพิ่มเมนูเข้าไปในร้านอาหารที่มีอยู่แล้ว
                    if (row.menu_id) {
                        currentRestaurant.menu.push({
                            id: row.menu_id,
                            name: row.menu_name,
                            price: row.menu_price,
                            description: row.menu_description,
                            image_url: row.menu_image_url
                        });
                    }
                } else {
                    // สร้างร้านอาหารใหม่
                    if (currentRestaurant) {
                        formattedResults.push(currentRestaurant);
                    }
                    currentRestaurant = {
                        id: row.restaurant_id,
                        name: row.restaurant_name,
                        description: row.restaurant_description,
                        address: row.restaurant_address,
                        avatar: row.restaurant_avatar,
                        menu: [] // สร้าง array สำหรับเมนู
                    };

                    // เพิ่มเมนูแรกเข้าไป
                    if (row.menu_id) {
                        currentRestaurant.menu.push({
                            id: row.menu_id,
                            name: row.menu_name,
                            price: row.menu_price,
                            description: row.menu_description,
                            image_url: row.menu_image_url
                        });
                    }
                }
            });

            // เพิ่มร้านอาหารสุดท้ายที่ค้างอยู่
            if (currentRestaurant) {
                formattedResults.push(currentRestaurant);
            }

            // ส่งข้อมูลในรูปแบบที่ต้องการ
            res.status(200).json({ restaurants: formattedResults });
        }
    });
});

// ดึงข้อมูลร้านอาหารตาม ID รวมข้อมูลเมนู
app.get('/restaurants/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
            r.id AS restaurant_id,
            r.name AS restaurant_name,
            r.description AS restaurant_description,
            r.address AS restaurant_address,
            r.avatar AS restaurant_avatar,
            m.id AS menu_id,
            m.name AS menu_name,
            m.price AS menu_price,
            m.description AS menu_description,
            m.image_url AS menu_image_url
        FROM restaurants r
        LEFT JOIN menus m ON r.id = m.restaurant_id
        WHERE r.id = ?;
    `;

    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching restaurant:', err);
            res.status(500).send('Internal Server Error');
        } else {
            const formattedResults = [];
            let currentRestaurant = null;

            results.forEach(row => {
                if (currentRestaurant && currentRestaurant.restaurant_id === row.restaurant_id) {
                    // เพิ่มเมนูเข้าไปในร้านอาหารที่มีอยู่แล้ว
                    if (row.menu_id) {
                        currentRestaurant.menu.push({
                            id: row.menu_id,
                            name: row.menu_name,
                            price: row.menu_price,
                            description: row.menu_description,
                            image_url: row.menu_image_url
                        });
                    }
                } else {
                    // สร้างร้านอาหารใหม่
                    if (currentRestaurant) {
                        formattedResults.push(currentRestaurant);
                    }
                    currentRestaurant = {
                        id: row.restaurant_id,
                        name: row.restaurant_name,
                        description: row.restaurant_description,
                        address: row.restaurant_address,
                        avatar: row.restaurant_avatar,
                        menu: [] // สร้าง array สำหรับเมนู
                    };

                    // เพิ่มเมนูแรกเข้าไป
                    if (row.menu_id) {
                        currentRestaurant.menu.push({
                            id: row.menu_id,
                            name: row.menu_name,
                            price: row.menu_price,
                            description: row.menu_description,
                            image_url: row.menu_image_url
                        });
                    }
                }
            });

            // เพิ่มร้านอาหารสุดท้ายที่ค้างอยู่
            if (currentRestaurant) {
                formattedResults.push(currentRestaurant);
            }

            // ส่งข้อมูลในรูปแบบที่ต้องการ
            res.status(200).json({ restaurants: formattedResults });
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
