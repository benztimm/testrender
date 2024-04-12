import { config } from 'dotenv'; config();
import express, { Request, Response, NextFunction } from 'express';
import userRouter from './routers/users';
import path from 'path';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { sessionData, requiredLoginAllSites, loginRequest } from './middleware/auth';
import { logger } from './middleware/logger'
import { createTable, insertUser, getUsers } from './db/index';


const app = express();
const server = createServer(app);
const io = new Server(server);


app.use(logger)
app.use(sessionData)
// app.use(requiredLoginAllSites) ;
app.use(express.urlencoded({ extended: true }));



io.on('connection', (socket) => {
  console.log('Hello');
});

app.set('views', path.join(__dirname, 'views')).set('view engine', 'ejs');


app.get('/login', (req:Request, res:Response) => {
  res.render('login');
});
app.post('/login', (req:Request, res:Response) => { 
  loginRequest(req, res);
});

app.get('/', async (req:Request, res:Response) => {
  const user = {username: 'user1', email:'test1@bingo.edu', password: 'password1'}
  // await insertUser("user1", 'test1@bingo.edu', 'password1')
  // createTable()
  // getUsers()
  res.render('index', { text: 'World' });
});


app.use('/users', userRouter);

server.listen(process.env.PORT_ENV || 8000, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT_ENV || 8000}`);
});
