const express = require("express");
const mysql = require("mysql");
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: './passwords.env'});

const app = express();

const database = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
app.set('view engine','hbs');

const publicDirectory = path.join(__dirname, './public' );
app.use(express.static(publicDirectory));

console.log(__dirname);

database.connect((error) => {
    if(error){
        console.log(error)
    } else {
        console.log("MYSQL Connected.")
    }
});

//Define Routes
app.use('/',require('./routes/pages.js'))


app.listen(3001,() => {
    console.log("Server started on Port 3001.")
})