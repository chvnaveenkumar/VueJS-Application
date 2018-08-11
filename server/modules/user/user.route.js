const express = require('express');
const router = express.Router()
const usersController = require('./controllers/user.controller');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

router.get('/', (req,res) => {
    res.render('index');
});

router.post('/validateUser', usersController.validateEmail);
router.post('/signup', usersController.signUp);
router.post('/signin', usersController.signIn);
router.post('/details',usersController.details);


module.exports = router