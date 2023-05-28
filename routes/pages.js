const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/',authController.isLoggedIn, (req,res) =>{

    res.render('index', {
        user: req.user
    });
});

router.get("/register",(req,res) => {
    res.render("register")
});


router.get("/login",(req,res) => {
    res.render("login")
});

router.get("/recipespage",authController.isLoggedIn,(req,res) => {
    res.render("recipespage", {
        user: req.user
    });
});

router.get("/recipepage",authController.isLoggedIn,(req,res) => {
    res.render("recipepage",{
        user: req.user
    });
});

router.get("/addrecipe",authController.isLoggedIn,(req,res) => {
    res.render("addrecipe",{
        user: req.user
    });
});


router.get("/profilepage",authController.isLoggedIn,(req,res) => {
    if (req.user) {
        res.render("profilepage", {
            user: req.user
        })
    }else {
        res.redirect('/login');
    
    }
});

module.exports = router;