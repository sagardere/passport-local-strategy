var express = require('express');
var router = express.Router();
var passport = require('passport');
var validator = require("email-validator");
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register
router.get('/register', (req, res) => {
	res.render('register');
});

// Login
router.get('/login', (req, res) => {
	res.render('login');
});

// Register User
router.post('/register', (req, res) => {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	if ((typeof name == undefined) || name == "") {

					let message = "Name not defined."
           errors(message,req,res);

        } else if (validator.validate(email) == false) {

        	let message = "Enter correct email address.."
            errors(message,req,res);

        } else if ((typeof username == undefined) || username == "") {

        	let message = "Username not defined."
            errors(message,req,res);

        } else if ((typeof password == undefined) || password == "") {

        	let message = "password not defined."
        	  errors(message,req,res);

        }  else if ((typeof password2 == undefined) || password2 == "") {

						let message = "password not defined."
        	  	errors(message,req,res);

        } else if (password !== password2) {

            let message = "Password does't match."
        	  	errors(message,req,res);

        } else {

					User.findOne({email: email}).exec((err, userInfo) => {

							if(userInfo){

									console.log("Email all ready exist, Trying another email.");

									res.render('register',{
										error:'Email all ready exist, Trying another email.'
									});

								} else {
									//user not exists in database.
										var newUser = new User({
											name: name,
											email:email,
											username: username,
											password: password
										});

									User.createUser(newUser,(err, user) => {
										if(err) throw err;
										console.log("User Created Successfully.");
										//console.log(user);
									});

									req.flash('success_msg', 'You are registered and can now login');

									res.redirect('/users/login');
								}
					});//findOne
		}
});

//define errors function
	function errors(msg,req,res){

		res.render('register',{
						error:msg
				});

		}

	passport.use(new LocalStrategy(
	  (username, password, done) => {
	   User.getUserByUsername(username,(err, user) => {
	   	if(err) throw err;
	   	console.log("@@@@",user);
	   	if(!user){
	   		return done(null, false, {message: 'Unknown User'});
	   	}

	   	User.comparePassword(password, user.password, (err, isMatch) => {
	   		if(err) throw err;
	   		if(isMatch){
	   			return done(null, user);
	   		} else {
	   			return done(null, false, {message: 'Invalid password'});
	   		}
	   	});
	   });
	  }));

	//serializeUser
	passport.serializeUser((user, done) => {
	  done(null, user.id);
	});

	//deserializeUser
	passport.deserializeUser((id, done) => {
	  User.getUserById(id,(err, user) => {
	    done(err, user);
	  });
	});

	router.post('/login',
	  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
	  (req, res) => {
	    res.redirect('/');
	  });

	router.get('/logout', (req, res) => {
		req.logout();

		req.flash('success_msg', 'You are logged out');

		res.redirect('/users/login');
	});

module.exports = router;