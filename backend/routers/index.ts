import express, { Request, Response, NextFunction } from 'express';
import { loginRequest } from '../middleware/auth';
import { createTable, insertUser, getUsers, getRooms } from '../database/index';
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


export default router;
