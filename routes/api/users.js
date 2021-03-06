const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys')
const passport = require('passport');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "User Works"}));

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if(!isValid) {
    return res.status(400).json(errors);
  }

//  console.log('testing: req = ' + req);

  User.findOne({ email: req.body.email })
    .then(user => {
      if(user) {
        errors.email = 'Email already exists'
        return res.status(400).json(errors);
      } else {

        const avatar = gravatar.url(req.body.email, {
          s: '200',   // Size
          r: 'pg',    // Rating
          d: 'mm'     // Default
        });

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        });

 //       console.log('test-name: ' + newUser.name)
  //      console.log('test-email: ' + newUser.email)

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    });
});

// @route   GET api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if(!isValid) {
    return res.status(400).json(errors);
  }

  // Find user by Email
  User.findOne({email})
    .then(user => {
      // Check for user
      if(!user) {
        errors.email = 'User not found';
        return res.status(404).json(errors);
      }
      // !user ? res.status(404).json({email: 'User not found'})

      // Check password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          // /*
          if(isMatch) {
            // User Matched

            const payload = {
              id: user.id,
              name: user.name,
              avatar: user.avatar
            } // Create JWT payload

            // Sign Token
            jwt.sign(
              payload,
              keys.secretOrKey,
              // Changed from one hour to one day
              // { expiresIn: 3600},
              { expiresIn: 86400 },
              (err, token) => {
                res.json({
                  success: true,
                  token: 'Bearer ' + token
                });
              }
            );
            // return res.json({msg: 'Success'});
          } else {
            errors.password = 'Password incorrect'
            return res.status(400).json(errors);
          }
        // */
        /*
          isMatch ? res.json({msg: 'Success'});
            : res.status(400).json({password: 'Password incorrect'});
        */
        });
    });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private

router.get(
  '/current',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
    // res.json(req.user.keys.filter( key => key === !password ));
  // res.json({msg:   'Success'});
});
module.exports = router;
