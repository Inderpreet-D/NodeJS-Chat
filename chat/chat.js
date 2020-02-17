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
};

let socket = io();
let messagesContainer = $('#messages')[0];
let usersContainer = $('#users');
let userName = Cookies.get('user');

let sendUsername = () => {
    socket.emit('user', {user: userName});
}
socket.on(EVENTS.CONNECT, sendUsername);
socket.on(EVENTS.DISCONNECT, sendUsername);

socket.on(EVENTS.USER, data => {
    userName = data.user;
    $("#name").text(userName);
    Cookies.set('user', userName);
});

socket.on(EVENTS.ALL_USERS, data => {
    usersContainer.empty();
    for(let user of data.users) {
        usersContainer.append(`<div class="user">${user}</div>`);
    }
});

/* Scroll to bottom of container from https://stackoverflow.com/questions/3562202/setting-a-scrollbar-position */
let scrollToBottom = () => {
    let messages = $('.message');
    let bottomRow = messages[messages.length - 1];
    messagesContainer.scrollTop = bottomRow.offsetTop;
}

// scrollToBottom();