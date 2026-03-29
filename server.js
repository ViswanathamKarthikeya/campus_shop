const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Karthikeya12#',
    database: 'campus_shop'
});

db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err.message);
    } else {
        console.log('Database connected successfully!');
    }
});

let shopOpen = true;

app.get('/test', (req, res) => {
    res.send('Server is working!');
});

app.get('/shop-status', (req, res) => {
    res.json({ isOpen: shopOpen });
});

app.post('/toggle-shop', (req, res) => {
    shopOpen = !shopOpen;
    res.json({ isOpen: shopOpen });
});

app.get('/items', (req, res) => {
    db.query('SELECT * FROM items', (err, result) => {
        if (err) {
            res.json([]);
        } else {
            res.json(result);
        }
    });
});

app.post('/add-item', (req, res) => {
    const { name, price, quantity } = req.body;
    db.query('INSERT INTO items (name, price, quantity) VALUES (?, ?, ?)',
        [name, price, quantity],
        (err) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error');
            } else {
                res.send('Item added');
            }
        });
});

app.delete('/delete-item/:id', (req, res) => {
    db.query('DELETE FROM items WHERE id=?', [req.params.id], (err) => {
        if (err) {
            res.status(500).send('Error');
        } else {
            res.send('Deleted');
        }
    });
});

app.put('/update-item/:id', (req, res) => {
    db.query('UPDATE items SET quantity=? WHERE id=?',
        [req.body.quantity, req.params.id],
        (err) => {
            if (err) {
                res.status(500).send('Error');
            } else {
                res.send('Updated');
            }
        });
});

app.post('/login', (req, res) => {
    if (req.body.username === 'admin' && req.body.password === '1234') {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log('\n===================================');
    console.log('🚀 Server Started!');
    console.log('===================================');
    console.log(`🌐 Open: http://localhost:${PORT}`);
    console.log(`🔑 Admin: admin / 1234`);
    console.log('===================================\n');
});