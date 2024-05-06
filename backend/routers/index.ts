import express, { Request, Response, NextFunction } from 'express';
import { loginRequest } from '../middleware/auth';
import { createTable, insertUser, getUsers, getRooms, } from '../database/index';
import * as db from '../database/index';
import session from 'express-session';
const bcrypt = require("bcrypt");
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { session: req.session });
});

router.get('/lobby', (req, res) => {
  res.render('lobby', { session: req.session });
});

router.get('/register', (req, res) => {
  res.render('register', { session: req.session });
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
  res.render('login', { session: req.session });
});

router.get('/login', (req: Request, res: Response) => {
  res.render('login', { session: req.session });
});
router.post('/login', (req: Request, res: Response) => {
  loginRequest(req, res);
});

router.post('/logout', (req: Request, res: Response) => {
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


router.get('/waiting/:roomId', async (req, res) => {
  const roomId = req.params.roomId;

  try {
      const rawData = await db.getRoomDetails(parseInt(roomId));

      // Assuming all entries have the same room details
      const roomDetails = {
          room_id: rawData[0].room_id,
          room_name: rawData[0].room_name,
          host_id: rawData[0].host_id,
          players: rawData.map(player => ({
              user_id: player.user_id,
              username: player.username
          }))
      };

      const host = rawData.find(player => player.host_id === player.user_id);
      res.render('waitroom', {
          roomDetails: roomDetails,
          players: roomDetails.players,
          host: host,
          user: req.session.user, // Assuming session management
          session: req.session
          
      });
  } catch (error) {
      console.error('Failed to load room details:', error);
      res.status(500).send('Internal Server Error');
  }
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
    if (allPlayers.length >= 4 && !playerExistInRoom) {
      res.status(403).json({ message: 'Room is full' });
    } else {
      if (playerExistInRoom) {
        res.status(200).json({ message: 'Player added to room, joining' });
      } else {
        await db.addPlayerToRoom(player_id, room_id);
        res.status(201).json({ message: 'Player added to room' });
      }
    }
  } else {
    res.status(401).json({ message: 'User not logged in' }); // 401 for unauthorized access
  }
});

router.get('/game', async (req, res) => {
  res.render('game');
});
export default router;
/**
 * if (allPlayers.length >= 4) {
        res.status(403).json({ message: 'Room is full' });
    } else 
 */