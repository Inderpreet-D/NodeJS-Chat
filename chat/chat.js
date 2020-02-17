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
};

let socket = io();
let messagesContainer = $('#messages');
let usersContainer = $('#users');
let userName = Cookies.get('user');
let inputArea = $('#input')
let errorArea = $('#error');
let nickcolor = 'blue';

let showError = errorMessage => {
    errorArea.show();
    errorArea.text(`Error: ${errorMessage}`);
}

let sendUsername = () => {
    socket.emit('user', {user: userName});
}
socket.on(EVENTS.CONNECT, sendUsername);
socket.on(EVENTS.DISCONNECT, sendUsername);

let setName = data => {
    userName = data.user;
    $("#name").text(userName);
    Cookies.set('user', userName);
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
    for(let user of data.users) {
        usersContainer.append(`<div class="user">${user}</div>`);
    }
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
                    current_name: userName,
                    new_name: splitted[1],
                }
                socket.emit(EVENTS.NICK_NAME, data);
            }
        } else if (message.startsWith('/nickcolor ')) {
            let splitted = message.split(' ');
            if (splitted.length !== 2) {
                showError('Incorrect number of arguments, expected 1');
            } else {
                nickcolor = splitted[1];
            }
        } else if (message.startsWith('/')) {
            showError('Invalid command');
        }
    }
});

/* Scroll to bottom of container from https://stackoverflow.com/questions/3562202/setting-a-scrollbar-position */
let scrollToBottom = () => {
    let messages = $('.message');
    let bottomRow = messages[messages.length - 1];
    messagesContainer[0].scrollTop = bottomRow.offsetTop;
}

scrollToBottom();