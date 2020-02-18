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

let socket = io();
let messagesContainer = $('#messages');
let usersContainer = $('#users');
let user = Cookies.get('user');
let inputArea = $('#input')
let errorArea = $('#error');
let nickcolor = 'yellow';

/* Scroll to bottom of container from https://stackoverflow.com/questions/3562202/setting-a-scrollbar-position */
let scrollToBottom = (container = '.message') => {
    let messages = $(container);
    if (messages.length > 0) {
        let bottomRow = messages[messages.length - 1];
        messagesContainer[0].scrollTop = bottomRow.offsetTop;
    }
}

let showError = errorMessage => {
    errorArea.show();
    errorArea.text(`Error: ${errorMessage}`);
}

let sendUsername = () => {
    socket.emit(EVENTS.USER, {user: user});
}
socket.on(EVENTS.CONNECT, sendUsername);
socket.on(EVENTS.DISCONNECT, sendUsername);

let setName = data => {
    user = data.user;
    $("#name").text(user);
    Cookies.set('user', user);
}
socket.on(EVENTS.USER, setName);
socket.on(EVENTS.NICK_NAME, data => {
    if (data.result) {
        setName(data);
        inputArea.val('');
    } else {
        showError('Nickname already in use')
    }
})

socket.on(EVENTS.ALL_USERS, data => {
    usersContainer.empty();
    usersContainer.append('<div style="height: 10000px;"></div>');
    for(let user of data.users) {
        usersContainer.append(`<div class="user">${user}</div>`);
    }
    scrollToBottom('.users');
});

socket.on(EVENTS.ALL_MESSAGES, data => {
    messagesContainer.empty();
    messagesContainer.append('<div style="height: 10000px;"></div>');
    messagesContainer.append(`<div id="user-description">You are ${user}.</div>`)
    for (let info of data.messages) {
        let timeSpan = `<span class="time">${info.time}</span>`;
        let userSpan = `<span class="username">${info.user}</span>`;
        let messageSpan = `<span class="message-data">: ${info.message}</span>`;
        let messageClass = 'message';
        
        if (info.user == user) {
            userSpan = `<span class="username" style="color: ${nickcolor};">${info.user}</span>`;
            messageClass += ' message-current-user';
        }

        let elem = `<div class="${messageClass}">${timeSpan} ${userSpan}${messageSpan}</div>`;
        messagesContainer.append(elem);
    }
    scrollToBottom();
});

socket.on(EVENTS.NICK_COLOR, data => {
    nickcolor = data.color;
});

inputArea.keypress(event => {
    if (event.charCode === 13) {
        errorArea.hide();
        let message = inputArea.val().toString();
        if (message.startsWith('/nick ')) {
            let splitted = message.split(' ');
            if (splitted.length !== 2) {
                showError('Incorrect number of arguments, expected 1');
            } else {
                let data = {
                    current_name: user,
                    new_name: splitted[1],
                }
                socket.emit(EVENTS.NICK_NAME, data);
            }
        } else if (message.startsWith('/nickcolor ')) {
            let splitted = message.split(' ');
            if (splitted.length !== 2) {
                showError('Incorrect number of arguments, expected 1');
            } else {
                socket.emit(EVENTS.NICK_COLOR, {user: user, color: splitted[1]});
                inputArea.val('');
            }
        } else if (message.startsWith('/')) {
            showError('Invalid command');
        } else {
            socket.emit(EVENTS.MESSAGE, {user: user, message: message});
            inputArea.val('');
        }
    }
});