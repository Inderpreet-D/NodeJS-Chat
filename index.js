/*
Name: Inderpreet Dhillon
UCID: 10159608
Tutorial Section: 04
*/

const EVENTS = {
    CONNECT: 'connection',
    DISCONNECT: 'disconnect',
    USER: 'user',
    ALL_USERS: 'all_users',
    MESSAGE: 'message',
    ALL_MESSAGES: 'all_messages',
};

let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let fs = require('fs');

let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

app.use('/', express.static('chat'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

let users = [];
let messages = [];

let possibleUsernames = [];
fs.readFile('names.txt', (err, data) => {
    if (err) {
        console.error(`Error reading names: ${err}`);
        possibleUsernames = ['User'];
    } else {
        possibleUsernames = data.toString().split('\n');
    }
});

let getRandomUsername = () => {
    let num = Math.floor(Math.random() * 9000) + 1000;
    let idx = Math.floor(Math.random() * possibleUsernames.length);
    let name = `${possibleUsernames[idx]}#${num}`;
    if (users.indexOf(name) !== -1) {
        return getRandomUsername();
    }
    return name;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/chat/chat.html'));
});

server.listen(80, () => {
    console.log('Chat listening on port 80');
});

io.on(EVENTS.CONNECT, socket => {
    console.log('>> Socket connected');
    socket.on(EVENTS.USER, data => {
        if (!data.user) {
            data.user = getRandomUsername();
        }
        if (users.indexOf(data.user) == -1) {
            users.push(data.user);
        }
        socket.emit(EVENTS.USER, data);
        io.emit(EVENTS.ALL_USERS, {users: users.sort()});
    });
    socket.on(EVENTS.DISCONNECT, () => {
        console.log('<< Socket disconnected');
        users = [];
        io.emit(EVENTS.DISCONNECT);
    });
});
