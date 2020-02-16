/*
Name: Inderpreet Dhillon
UCID: 10159608
Tutorial Section: 04
*/

let socket = io();
let messagesContainer = $('#messages')[0];
const userName = Cookies.get('user');

/* Scroll to bottom of container from https://stackoverflow.com/questions/3562202/setting-a-scrollbar-position */
let scrollToBottom = () => {
    let messages = $('.message');
    let bottomRow = messages[messages.length - 1];
    messagesContainer.scrollTop = bottomRow.offsetTop;
}

// scrollToBottom();

$("#name").text(userName);
// $("#name").text(document.cookie)