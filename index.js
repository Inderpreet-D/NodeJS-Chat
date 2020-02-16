let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');

let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

app.use('/', express.static('chat'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

let users = [];
let messages = [];

let getRandomUsername = () => {
    return 'TestName';
}

app.get('/', (req, res) => {
    console.log(req.cookies);
    if (!req.cookies['user']) {
        res.cookie('user', getRandomUsername());
    }
    res.sendFile(path.join(__dirname + '/chat/chat.html'));

});

server.listen(80, () => {
    console.log('Chat listening on port 80');
});

io.on('connection', socket => {
    console.log(`Connected to ${socket.id}`);
    // socket.emit('retrieve', {messages: 'Server Data'});
});
