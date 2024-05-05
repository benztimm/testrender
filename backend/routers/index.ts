import express, { Request, Response, NextFunction } from 'express';
import { loginRequest } from '../middleware/auth';
import { createTable, insertUser, getUsers, getRooms, } from '../database/index';
import * as db from '../database/index';
const bcrypt = require("bcrypt");
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index',{session: req.session});
});

router.get('/lobby', (req, res) => {
  res.render('lobby',{session: req.session});
});

router.get('/register', (req, res) => {
  res.render('register',{session: req.session});
});


router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  //Add a check function to check if username or email has
  //already been used.
  //PROCESS DATA:
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);
  
  // - Store all of them to DB
  await insertUser(username, hash, email);
  res.render('login',{session: req.session});
});

router.get('/login', (req:Request, res:Response) => {
  res.render('login',{session: req.session});
});
router.post('/login', (req:Request, res:Response) => { 
  loginRequest(req, res);
});

router.post('/logout', (req:Request, res:Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

router.get('/available_rooms', async (req: Request, res: Response) => {
  try {
    const result = await getRooms(); // Await the getRooms() function call
    if (result) {
      res.json(result); // Send the result directly
    } else {
      res.status(500).send('Error retrieving rooms');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving rooms');
  }
});

router.get('/waiting/:roomId', (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  res.send(`Waiting room for room ${roomId}`);
  
  //const roomDetails = db.getRoomDetail(parseInt(roomId)); // You need to implement this function
  /*
  if (roomDetails) {
      res.render('waiting-room', {
          roomName: roomDetails.roomName,
          host: roomDetails.host,
          players: roomDetails.players,
          room_id: roomId,
          user: req.session.user // Assuming you're using sessions to track logged-in users
      });
  } else {
      res.status(404).send('Room not found');
  }*/
});

router.post('/join_room/:roomId', async (req: Request, res: Response) => {
  if (req.session.user) {
    const player_id = await db.getUserIdByUsername(req.session.user.username);
    const room_id = parseInt(req.params.roomId);

    // It's better to check if player_id or room_id are valid before proceeding
    if (!player_id || isNaN(room_id)) {
        return res.status(400).json({ message: 'Invalid user or room ID' });
    }

    const playerExistInRoom = await db.ifPlayerInRoom(player_id, room_id);
    const allPlayers = await db.getPlayerInRoom(room_id);

    if (allPlayers.length >= 4) {
        res.status(403).json({ message: 'Room is full' });
    } else if (playerExistInRoom) {
        res.status(200).json({ message: 'Player already in room' });
    } else {
        await db.addPlayerToRoom(player_id, room_id);
        res.status(201).json({ message: 'Player added to room' });
    }
} else {
    res.status(401).json({ message: 'User not logged in' }); // 401 for unauthorized access
}
});

export default router;
