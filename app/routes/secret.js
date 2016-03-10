var loginData = {};
var express = require('express');
var router = express.Router();

router.get('/signup', function(req, res){
	res.render('signup');
});

router.post('/signup', function(req, res){
	loginData.username = req.body.username;
	loginData.pawd = rq.body.password;

	if(loginData.username === 'Ashok' && loginData.pawd === '123')
		res.render('signin', loginData);
	else
		res.render('signup', loginData);
});

module.exports = router;
