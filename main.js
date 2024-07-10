// main.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let connectedClients = 0;
let ready_count = 0;
let janken_type_count = 0;
let janken_types = [];
io.on('connection', (socket) => {
    if (connectedClients >= 2) {
        socket.emit('message', '空きがありません');
        socket.disconnect();
        return;
    }

    connectedClients++;
    socket.broadcast.emit('new_challenger', '挑戦者が現れました！');
    console.log('クライアントが接続されました。',
        connectedClients, socket.id);
    if (connectedClients == 2) {
        socket.emit('you_are_challenger', '先客がいます');
    }

    socket.on('ready', () => {
        ready_count++;
        if (ready_count == 2) {
            io.emit('start', 'ゲームを開始します！');
            ready_count = 0;
        }
        console.log('ready_count:', ready_count);
    });

    socket.on('unready', () => {
        ready_count--;
        console.log('ready_count:', ready_count);
    });

    socket.on('janken_type', (janken_type) => {
        janken_type_count++;
        janken_types.push(janken_type);
        if (janken_type_count == 2) {
            io.emit('result', janken_types);
            console.log(janken_types);
            janken_type_count = 0;
            janken_types = [];

        }
    });
    socket.on('disconnect', () => {
        connectedClients--;
        io.emit('leaved', 'クライアントが切断されました。');
        console.log('クライアントが切断されました。',
            connectedClients, socket.id);
    });
});

server.listen(3000, () => {
    console.log('サーバがポート3000で起動しました。');
});
