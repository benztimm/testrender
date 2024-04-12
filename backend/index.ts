import { config } from 'dotenv'; config();
import express, { Request, Response, NextFunction } from 'express';
import userRouter from './routers/users';
import path from 'path';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { sessionData, requiredLoginAllSites, loginRequest } from './middleware/auth';
import { logger } from './middleware/logger'

const app = express();
const server = createServer(app);
const io = new Server(server);


app.use(logger, sessionData, requiredLoginAllSites) ;
app.use(express.urlencoded({ extended: true }));


// io.on('connection', (socket) => {
//   console.log('Hello');
// });

app.set('views', path.join(__dirname, 'views')).set('view engine', 'ejs');




app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login', (req, res) => { 
  loginRequest(req, res);
});



app.get('/', (req, res) => {
  res.render('index', { text: 'World' });
});


app.use('/users', userRouter);

server.listen(process.env.PORT_ENV || 8000, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT_ENV || 8000}`);
});
