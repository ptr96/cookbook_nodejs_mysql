const express = require("express");
const mysql = require("mysql");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
dotenv.config({ path: './.env'});

const app = express();

const database = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});


const publicDirectory = path.join(__dirname, './public' );
app.use(express.static(publicDirectory));

//Parse URL-Encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: false}));
//Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());

app.set('view engine','hbs');
database.connect((error) => {
    if(error){
        console.log(error)
    } else {
        console.log("MYSQL Connected.")
    }
});

//Define Routes
app.use('/',require('./routes/pages.js'));
app.use('/auth',require('./routes/auth.js'));

app.listen(3001,() => {
    console.log("Server started on Port 3001.")
})