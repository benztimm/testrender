import { Pool, PoolConfig, QueryResult } from 'pg';

const result = require('dotenv').config();

if (result.error) {
  console.error(result.error);
}

const dbConfig: PoolConfig = {
  user: process.env.POSTGRE_ID,
  password: process.env.POSTGRE_PASS,
  host: process.env.DB_HOST,
  port: 5432,
  database: 'csc667bingodb',
  ssl:true
};

const pool = new Pool(dbConfig);

async function query(text: string, params: any[]): Promise<QueryResult<any>> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}

async function insertUser(username: string, password: string, email: string): Promise<void> {
  try {
    const queryText = 'INSERT INTO bingo_schema."Users" (username, password, email) VALUES ($1, $2, $3)';
    const queryParams = [username, password, email];
    await query(queryText, queryParams);
    console.log('User inserted successfully');
  } catch (error) {
    console.error('Error inserting user:', error);
    throw error;
  }
}

async function checkConnection(): Promise<void> {
  try {
    const result = await query('SELECT NOW() as now', []);
    const currentTime = result.rows[0].now;
    console.log('Successfully connected to PostgreSQL server. Current time:', currentTime);
  } catch (error) {
    console.error('Error connecting to PostgreSQL server:', error);
    throw error;
  }
}

async function createTable(): Promise<void> {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL
      )
    `;
    await query(createTableQuery, []);
    console.log('Table "users" created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
    throw error; // Rethrow the error for handling at a higher level
  }
}

async function getUsers() {
  try {
    const result = await query('SELECT * FROM bingo_schema."Users"', []);
    console.log(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
  }
}

async function getUserData(userVerify:string) {
  try {
    const user = await query(`SELECT * FROM bingo_schema."Users" WHERE username = $1`, [userVerify]);
    return (user.rows[0])
  } catch (error) {
    console.error('Error executing query', error);
  }
}

async function addRoom(roomName:string, host:string) {
  try {
    const queryText = 'INSERT INTO bingo_schema."Rooms" (room_name, host) VALUES ($1, $2)';
    const queryParams = [roomName, host];
    await query(queryText, queryParams);
    console.log('Room inserted successfully');
  } catch (error) {
    console.error('Error inserting room:', error);
    throw error;
  }
}

async function getRooms() {
  try {
    const result = await query('SELECT * FROM bingo_schema."Rooms"', []);
    return result.rows;
  } catch (error) {
    console.error('Error executing query', error);
  }

}
async function getRoomId(roomName:string, host:string): Promise<any>{
  try {
    const queryText = `
    Select room_id from bingo_schema."Rooms"
    WHERE room_name =  $1 AND host = $2`;
    const queryParams = [roomName, host];
    const result = await query(queryText, queryParams);
    return result.rows[0].room_id;
  } catch (error) {
    console.error('Error executing query', error);
  }

}

export {insertUser, getUsers, createTable, getUserData,addRoom,getRooms,getRoomId }