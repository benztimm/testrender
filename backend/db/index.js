
// const { Client } = require('pg');
// const client = new Client({
//   user: process.env.POSTGRE_ID,
//   password: process.env.POSTGRE_PASS,
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   database: 'bingo',
// });

// client.connect((err: any) => {
//   if (err) {
//     console.error('Error connecting to MySQL database:', err);
//     return;
//   }
//   console.log('Connected to MySQL database');
// });

// // const insertUserQuery = `
// //     INSERT INTO users (username, password, email, full_name)
// //     VALUES ('Hello', 'password', 'abc@what.else', 'Abc Users')
// // `;

// // client.query(insertUserQuery, (err: any, result: any) => {
// //   if (err) {
// //     console.error('Error inserting user data:', err);
// //   } else {
// //     console.log('User data inserted successfully.');
// //   }
// //   client.end();
// // });