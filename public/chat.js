var socket = io();

const btnSend = document.querySelector('#send');
console.log(btnSend);
btnSend.addEventListener('click', () => {
  const input = document.querySelector('#input');
  socket.emit('chat message', input.value);
});

document.getElementById('input').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

socket.on('chat message', (msg) => {
  const messageBox = document.querySelector('.message-box');
  messageBox.innerHTML += `<div class="message server-message">${msg}</div>`;
  console.log('Received chat message:', msg);
});

socket.on('server message', (msg) => {
  const messageBox = document.querySelector('.message-box');
  messageBox.innerHTML += `<div class="message">${msg}</div>`;
  console.log('Received server message:', msg);
});

function sendMessage() {
  const input = document.querySelector('#input');
  socket.emit('chat message', input.value);
  input.value = ''; // Clear input vid enter klick
}
