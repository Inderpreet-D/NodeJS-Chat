/*
Name: Inderpreet Dhillon
UCID: 10159608
Tutorial Section: 04
*/

const EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    USER: 'user',
    ALL_USERS: 'all_users',
    MESSAGE: 'message',
    ALL_MESSAGES: 'all_messages',
    NICK_NAME: 'nick',
    NICK_COLOR: 'color',
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
let colors = {};

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

let getTimestamp = () => {
    let date = new Date();
    let minutes = date.getMinutes();
    if (minutes <= 9) {
        minutes = `0${minutes}`;
    }
    let time = `:${minutes}`;
    let hour = date.getHours();
    if (hour > 12) {
        time = `${hour - 12}${time}PM`;
    } else if (hour == 0) {
        time = `${hour + 12}${time}AM`;
    } else if (hour == 12) {
        time = `${hour}${time}PM`;
    } else {
        time = `${hour}${time}AM`;
    }
    return time;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/chat/chat.html'));
});

server.listen(1961, () => {
    console.log('Chat listening on port 1961');
});

io.on(EVENTS.CONNECT, socket => {
    console.log('>> Socket connected');
    socket.on(EVENTS.USER, data => {
        if (!data.user || users.indexOf(data.user) >= 0) {
            data.user = getRandomUsername();
        }
        if (!(data.user in colors)) {
            colors[data.user] = 'yellow';
        }
        socket.emit(EVENTS.NICK_COLOR, {color: colors[data.user]});
        users.push(data.user);
        socket.emit(EVENTS.USER, data);
        io.emit(EVENTS.ALL_USERS, {users: users.sort()});
        io.emit(EVENTS.ALL_MESSAGES, {messages: messages});
    });
    socket.on(EVENTS.DISCONNECT, () => {
        console.log('<< Socket disconnected');
        users = [];
        io.emit(EVENTS.DISCONNECT);
    });
    socket.on(EVENTS.NICK_NAME, data => {
        if (users.indexOf(data.new_name) >= 0) {
            socket.emit(EVENTS.NICK_NAME, {result: false});
        } else {
            /* Remove element from https://stackoverflow.com/questions/5767325/how-do-i-remove-a-particular-element-from-an-array-in-javascript */
            let oldIdx = users.indexOf(data.current_name);
            users.splice(oldIdx, 1);
            
            users.push(data.new_name);
            colors[data.new_name] = colors[data.current_name];

            socket.emit(EVENTS.NICK_NAME, {result: true, user: data.new_name});
            io.emit(EVENTS.ALL_USERS, {users: users.sort()});
            io.emit(EVENTS.ALL_MESSAGES, {messages: messages});
        }
    });
    socket.on(EVENTS.MESSAGE, data => {
        messages.push({
            time: getTimestamp(),
            user: data.user,
            message: data.message
        });
        io.emit(EVENTS.ALL_MESSAGES, {messages: messages});
    });
    socket.on(EVENTS.NICK_COLOR, data => {
        colors[data.user] = data.color;
        socket.emit(EVENTS.NICK_COLOR, {color: data.color});
        socket.emit(EVENTS.ALL_MESSAGES, {messages: messages});
    });
});