module.exports = function(app){

	app.get('/signup', function(req, res){
		res.render('signup');
	});

	app.post('/signup', function(req, res){
		loginData.username = req.body.username;
		loginData.pawd = rq.body.password;

		if(loginData.username === 'Ashok' && loginData.pawd === '123')
			res.render('signin', loginData);
		else
			res.render('signup', loginData);
	});

};