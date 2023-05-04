const express = require('express');
const app = express();
const http = require('http');
const path = require('path');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = require('socket.io')(server);

const lib = 'to the library';
const waitingRoom = 'waiting room';
let peopleInRoom = 0;

io.on('connection', (socket) => {
  peopleInRoom++;
  console.log('Random anslöt');
  console.log('Antal i rum: ' + peopleInRoom);

  if (peopleInRoom <= 2) {
    socket.join(lib);
    socket.emit('server message', 'Welcome ' + lib);
  } else {
    socket.join(waitingRoom);
    socket.emit('server message', 'Welcome ' + waitingRoom);
  }

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
    socket.emit('server message', 'waiting for librarian');
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/chat.html');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
