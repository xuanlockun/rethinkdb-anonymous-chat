const express = require('express');
const bodyParser = require('body-parser');
const r = require('rethinkdbdash')();
const pug = require('pug');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'views')));

r.connect({ host: 'localhost', port: 28015, db: 'test' })
    .then(connection => {
        app.locals.rdbConnection = connection;
    })
    .catch(err => {
        console.error('Lỗi kết nối RethinkDB', err);
    });

app.get('/', async (req, res) => {
    try {
        const connection = req.app.locals.rdbConnection;
        const result = await r.table('a').orderBy('time').pluck('chat').run(connection);
        res.render('template.pug', { data: result });
    } catch (error) {
        console.error('Lỗi truy vấn', error);
        res.status(500).json({ error: 'Lỗi truy vấn' });
    }
});

app.post('/', async (req, res) => {
    console.log(req.body);
    try {
        const newChat = req.body.chat;
        await r.table('a').insert({ chat: newChat, time: Date.now() });
        io.emit('new message', newChat);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Lỗi truy vấn Insert', error);
        res.status(500).json({ error: 'Lỗi truy vấn Insert' });
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
