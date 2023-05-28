const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require("cookie-parser");
const { promisify } = require ('util');
const { error } = require("console");

const database = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});


exports.register = (req,res) => {
    console.log(req.body);

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.email;
    const passwordConfirm = req.body.passwordConfirm;

    //const { name, email, password, passwordConfirm} = req.body; // <--- same like line upper.
    database.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => { //async becouse it takes time to hash password
        if(error) {
            console.log(error);
        } 
        if(results.length > 0){
            return res.render('register',{
                message: 'That email is already in use.'
            });
        } else if(password !== passwordConfirm ) {
            return res.render('register', {
                message: 'The passwords do not match.'
            });
        }

        let hashedPassword = await bcrypt.hash(password,8);  //what want to hash/how many rounds wanna hash //await - becouse it is time to hash.
        console.log(hashedPassword);

        database.query('INSERT INTO users SET ?', {username: name, email: email, password: hashedPassword}, (error, results) => {
            if(error){
                console.log(error);
            } else {
                return res.render('register',{
                    message: 'User registered. Now you can login.'
                });
            }
        });
        

    }); //to avoid sql injections.


    //res.send("Form subnitted")
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if( !email || !password ) {
        return res.status(400).render('login', { //return to rest code dont execute.
          message: 'Please use email and password.' 
        })
      }
  
      database.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        console.log(results);
        if( !results || !(await bcrypt.compare(password, results[0].password)) ) {
          res.status(401).render('login', {
            message: 'Email or Password is not correct.'
          })
        } else {
          const id = results[0].id;
  
          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN //evry user has own token //password expires in 365d 
          });
  
          console.log("The token is: " + token);
  
          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000  //need to multiply this to ms
            ),
            httpOnly: true
          }
  
          res.cookie('jwt', token, cookieOptions );
          res.status(200).redirect("/");
        }
  
      })
  
    } catch (error) {
      console.log(error);
    }
};

exports.isLoggedIn = async (req,res, next) => {
  console.log(req.cookies);
  if (req.cookies.jwt){
    try{
      //verify the token
      const decoded = await promisify (jwt.verify)(req.cookies.jwt,
        process.env.JWT_SECRET
        );
        console.log(decoded);
      //
      //check the user exist
        database.query('SELECT * FROM users WHERE id =?', [decoded.id], (error, result) => {
            console.log(result);//check what comes from database.

            if (!result) {
              return next();
            }
            req.user = result[0]
            return next();

        })
    } catch (error) {
      console.log(error)
      return next();
    } 
  } else {
    next();
  } 
};

exports.logout = async (req,res, next) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 2*1000),
    httpOnly: true
  });
  res.status(200).redirect('/');
};

exports.addingrecipe = async (req,res) => {
  console.log(req.body);
  const recipe_name = req.body.recipe_name;
  const ingredients = req.body.ingredients;
  const instructions = req.body.instructions;
  database.query('SELECT recipe_name FROM recipes WHERE recipe_name = ?', [recipe_name], async (error, results) => { 
      if(error) {
          console.log(error);
      } 
      if(results.length > 0){
          return res.render('addrecipe',{
              message: 'That recipe name is already in use.'
          });
      } 
      database.query('INSERT INTO recipes SET ?', {recipe_name: recipe_name, ingredients: ingredients, instructions: instructions}, (error, results) => {
          if(error){
              console.log(error);
          } else {
              return res.render('addrecipe',{
                  message: 'Recipe added. Now you can see it in Recipes.'
              });
          };
      });
  });
};