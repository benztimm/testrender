import express, { Request, Response, NextFunction } from 'express';
import homeRouter from './routers';
import path from 'path';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { sessionData, requiredLoginAllSites, loginRequest } from './middleware/auth';
import { logger } from './middleware/logger'
import{ createRoom,getRoomId } from './database/index'
require('dotenv').config({path: './backend/database/config.env'})
const app = express();
const server = createServer(app);
const io = new Server(server);


app.use(logger)
app.use(sessionData)

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.set('views', path.join(__dirname, 'views')).set('view engine', 'ejs');
app.use(requiredLoginAllSites);


io.on('connection', (socket) => {
  socket.on('join room', (roomId) => {
      socket.join(roomId);
  });

  socket.on('chat message', (data) => {
      io.to(data.room).emit('chat message', {
          user: data.user,
          message: data.message,
          room: data.room
      });
  });
  socket.on('create room', async (data) => {
    createRoom(data.roomName, data.user);
    const room_id = await getRoomId(data.roomName, data.user);
    socket.emit('update room', { roomName: data.roomName, user: data.user, roomId: room_id}); // Respond back to the client
});
});



app.use('/', homeRouter);


server.listen(process.env.PORT_ENV || 8000, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT_ENV || 8000}`);
});
