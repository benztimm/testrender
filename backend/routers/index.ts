import express, { Request, Response, NextFunction } from 'express';
import { loginRequest } from '../middleware/auth';
// import { createTable, insertUser, getUsers } from './database/index';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/lobby', (req, res) => {
  res.render('lobby');
});

router.get('/register', (req, res) => {
  res.render('register');
});


router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  //PROCESS DATA:
  // - Encrypt password
  
  // - Store all of them to DB
  // await insertUser("user1", 'test1@bingo.edu', 'password1')
  res.render('login');
});

router.get('/login', (req:Request, res:Response) => {
  res.render('login');
});
router.post('/login', (req:Request, res:Response) => { 
  loginRequest(req, res);
});


export default router;
