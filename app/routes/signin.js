var mongodbjs = require('../routes/mongodb.js');
var url = require('url');

var MyApp = function(app){

	app.get('/signin', function(req, res){
//		console.log(req);
		var data = {exist : false};
		var url_parts = url.parse(req.url, true);
		var exist = (url_parts.query.exist) ? true : false;
		console.log(exist);
		if(req.session.userName && exist)
			data.exist = true;
		//	req.session.destroy();
		console.log("in sign get");
		res.render('signin', data);
	});


	app.post('/signin', function(req, res){
		var query = req.body;
		var loginData = { secret : {username : '', password : ''}};
		loginData.secret.username = query.username;
		loginData.secret.password = query.password;
		console.log("in signin post ="+ query.username +" : "+ query.password);

//		passport.authenticate('local', { failureRedirect: '/signin' });

		mongodbjs.findRecord(loginData, res, req, 'signin');
	});

};

module.exports = MyApp;