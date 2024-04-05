import express from 'express';
import userRouter from './routers/users';

import dotenv from 'dotenv';
dotenv.config();


const app = express();

const logger = (req: any, res: any, next: any) => {
  const ipAdress = req.ip;
  console.log(ipAdress, req.originalUrl);
  next();
};
app.use(logger);


const { Client } = require('pg');
const client = new Client({
  user: process.env.POSTGRE_ID,
  password: process.env.POSTGRE_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'bingo',
});

client.connect((err: any) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// const insertUserQuery = `
//     INSERT INTO users (username, password, email, full_name)
//     VALUES ('Hello', 'password', 'abc@what.else', 'Abc Users')
// `;

// client.query(insertUserQuery, (err: any, result: any) => {
//   if (err) {
//     console.error('Error inserting user data:', err);
//   } else {
//     console.log('User data inserted successfully.');
//   }
//   client.end();
// });

const port = process.env.PORT_ENV || 8000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  console.log('here');
  res.render('index', { text: 'World' });
});


app.use('/users', userRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
