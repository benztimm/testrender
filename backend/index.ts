import dotenv from 'dotenv'
dotenv.config() //{ path: './backend/database/config.env' }

import express, { Request, Response, NextFunction } from 'express';
import homeRouter from './routers';
import path from 'path';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { sessionData, requiredLoginAllSites, loginRequest } from './middleware/auth';
import { logger } from './middleware/logger'
import * as db from './database/index'

const app = express();
const server = createServer(app);
const io = new Server(server);


app.use(logger)
app.use(sessionData)

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.set('views', path.join(__dirname, 'views')).set('view engine', 'ejs');
app.use(requiredLoginAllSites);
app.use(express.json());

io.on('connection', (socket) => {
	socket.on('join room', (roomId) => {
		socket.join(roomId)
	})

	socket.on('chat message', (data) => {
		io.to(data.room).emit('chat message', {
			user: data.user,
			message: data.message,
			room: data.room,
		})
	})
	socket.on('create room', async (data) => {
		await db.createRoom(data.roomName, data.user)
		const player_id = await db.getUserIdByUsername(data.user)
		const room_id = await db.getRoomId(data.roomName, data.user)
		await db.addPlayerToRoom(player_id, room_id)
		await db.insertPlayerStatus(player_id, room_id)

		io.to('lobby').emit('update room', {roomName: data.roomName, user: data.user, roomId: room_id}) // Respond back to the client
	})
	socket.on('player ready', async (data) => {
		const {roomId, userId} = data
		const playerStatus = await db.getPlayerStatus(userId, roomId)
		const updatedStatus = await db.updatePlayerStatus(userId, roomId, !playerStatus.status)

		//Old version
		// let updatedStatus;
		// if (playerStatus.status === false) {
		// 	updatedStatus = await db.updatePlayerStatus(userId, roomId, true)
		// } else {
		// 	updatedStatus = await db.updatePlayerStatus(userId, roomId, false)
		// }
		io.to(roomId).emit('player ready', {userId: userId, status: updatedStatus}) // Notify others in the room
		// Update database or manage internal state as necessary
	})

	socket.on('exit room', async (data) => {
		const {roomId, userId} = data

		await db.removePlayerFromRoom(userId, roomId)
		await db.deletePlayerStatus(userId, roomId)
		io.to(roomId).emit('player exited', {userId: userId}) // Notify others in the room
		// Update database or manage internal state as necessary
	})
	socket.on('kicking player', async (data) => {
		const {roomId, userId} = data
		await db.deletePlayerStatus(userId, roomId)
		io.to(roomId).emit('player kicked', {userId: userId}) // Notify others in the room
		// Update database or manage internal state as necessary
	})

	socket.on('delete room', async (data) => {
		const {roomId, userId} = data
		io.to('lobby').emit('room deleted', {roomId: roomId, userId: userId}) // Notify others in the room
		// Update database or manage internal state as necessary
	})
	socket.on('new player joined', async (data) => {
		const user_id = await db.getUserIdByUsername(data.user)
		io.to(data.roomId).emit('new player joined', {
			username: data.user,
			roomId: data.roomId,
			userId: user_id,
		})
	})

	socket.on('starting game', (data) => {
		io.to(data.roomId).emit('game started', {roomId: data.roomId})
	})
})

app.use('/', homeRouter)

server.listen(process.env.PORT_ENV || 8000, () => {
	console.log(`Server is running at http://localhost:${process.env.PORT_ENV || 8000}`)
})
