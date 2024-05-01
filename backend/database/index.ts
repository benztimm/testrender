import { Pool, PoolConfig, QueryResult } from "pg";

const result = require("dotenv").config();

if (result.error) {
  console.error(result.error);
}

const dbConfig: PoolConfig = {
  user: process.env.POSTGRE_ID,
  password: process.env.POSTGRE_PASS,
  host: process.env.DB_HOST,
  port: 5432,
  database: "csc667bingodb",
  ssl: true,
};

const pool = new Pool(dbConfig);

async function query(text: string, params: any[]): Promise<QueryResult<any>> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("executed query", { text, duration, rows: res.rowCount });
  return res;
}

async function insertUser(
  username: string,
  password: string,
  email: string
): Promise<void> {
  try {
    const queryText =
      'INSERT INTO bingo_schema."Users" (username, password, email) VALUES ($1, $2, $3)';
    const queryParams = [username, password, email];
    await query(queryText, queryParams);
    console.log("User inserted successfully");
  } catch (error) {
    console.error("Error inserting user:", error);
    throw error;
  }
}

async function checkConnection(): Promise<void> {
  try {
    const result = await query("SELECT NOW() as now", []);
    const currentTime = result.rows[0].now;
    console.log(
      "Successfully connected to PostgreSQL server. Current time:",
      currentTime
    );
  } catch (error) {
    console.error("Error connecting to PostgreSQL server:", error);
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
    console.error("Error creating table:", error);
    throw error; // Rethrow the error for handling at a higher level
  }
}

async function getUsers() {
  try {
    const result = await query('SELECT * FROM bingo_schema."Users"', []);
    console.log(result.rows);
  } catch (error) {
    console.error("Error executing query", error);
  }
}

async function getUserData(userVerify: string) {
  try {
    const user = await query(
      `SELECT * FROM bingo_schema."Users" WHERE username = $1`,
      [userVerify]
    );
    return user.rows[0];
  } catch (error) {
    console.error("Error executing query", error);
  }
}

/**
 * Makes a room data in the database.
 * @param room_name Name of the room
 */
async function createRoom(room_name: string) {
  try {
    const queryText = `INSERT INTO bingo_schema."Rooms"(room_name) VALUES ($1);`;
    const queryParams = [room_name];
    await query(queryText, queryParams);
    console.log("User inserted successfully");
  } catch (error) {
    console.error("Error inserting user:", error);
    throw error;
  }
}

/**
 * Add player to the room.
 *
 * @param player_id Player ID joining the room.
 * @param room_id Room ID.
 */
async function addPlayerToRoom(player_id: number, room_id: number) {
  try {
    const queryText = `INSERT INTO bingo_schema.room_player_table(user_id, room_id)VALUES ($1, $2);`;
    const queryParams = [player_id, room_id];
    await query(queryText, queryParams);
    console.log("User inserted successfully");
  } catch (error) {
    console.error("Error inserting user:", error);
    throw error;
  }
}

/**
 * Removes the player in the room. Can be used in a leave button.
 * @param player_id Player ID joining the room.
 * @param room_id  Room ID.
 */
async function removePlayerFromRoom(player_id: number, room_id: number) {
  try {
    const queryText = `DELETE FROM bingo_schema.room_player_table WHERE user_id = $1 AND room_id = $2;`;
    const queryParams = [player_id, room_id];
    await query(queryText, queryParams);
    console.log("User inserted successfully");
  } catch (error) {
    console.error("Error inserting user:", error);
    throw error;
  }
}

/**
 * Fetch the Player in the room.
 * @param player_id ID of the player in the room
 * @param room_id ID of the specified room.
 * @returns A row of the user if it exist in the table
 */
async function getPlayerInRoom(player_id: number, room_id: number) {
  try {
    const user = await query(
      `SELECT * FROM bingo_schema."Users" WHERE user_id = $1 AND room_id = $2`,
      [player_id, room_id]
    );
    return user.rows[0];
  } catch (error) {
    console.error("Error inserting user:", error);
    throw error;
  }
}

/**
 * Inserts the generated card into the database
 * @param arrayOfNum An array of integer array.
 */
async function insertCard(arrayOfNum: number[][]) {
  try {
    const cardData = JSON.stringify(arrayOfNum);

    const queryText = `
      INSERT INTO bingo_schema.cards_table(card_data)
      VALUES ($1)
    `;

    const queryParams = [cardData];

    await query(queryText, queryParams);
    console.log("Card inserted successfully");
  } catch (error) {
    console.error("Error inserting card:", error);
    throw error;
  }
}
/**
 * Get a card from our database
 * @param card_id ID of the specified card.
 * @returns The card information
 */
async function getCard(card_id: number) {
  try {
    const card = await query(
      `SELECT * FROM bingo_schema.cards_table WHERE card_id = $1;`,
      [card_id]
    );
    return card.rows[0];
  } catch (error) {
    console.error("Error inserting user:", error);
    throw error;
  }
}

export {
  insertUser,
  getUsers,
  createTable,
  getUserData,
  createRoom,
  addPlayerToRoom,
  removePlayerFromRoom,
  getPlayerInRoom,
  insertCard,
  getCard,
};
