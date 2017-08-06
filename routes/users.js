const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

const User = require('../models/user');


router.get('/register', function(req, res) {
    res.render('register');
});


router.post('/register', function(req, res, next) {
    const {username, email, password, confirm } = req.body;

    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('email', 'Email is required!').notEmpty();
    req.checkBody('email', 'Email is not valid!').isEmail();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('confirm', 'Passwords do not match!').equals(password);

    let errors = req.validationErrors();

    if(errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        const user = new User({
            username,
            email,
            password
        });

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) {
                    console.log('error hashing');
                }
                user.password = hash;
                user.save()
                    .then(() => {
                        req.flash('success', 'A new user successfully registered');
                        passport.authenticate('local', {
                            successRedirect: '/',
                            failureRedirect: '/users/login',
                            failureFlash: true
                        })(req, res, next)
                    })
                    
                    .catch(err => {
                        req.flash('error', 'Failed to create user!');
                        res.redirect('/users/register');
                    });
            })
        })
    }
});



router.get('/login', function(req, res) {
    res.render('login');
});


router.post('/login', function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
});


router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'User successfully logged out');
    res.redirect('/users/login');
})

module.exports = router;