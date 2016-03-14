var loginData = {name : '', age : '',twitterName: '', secret : {username : '', password : ''}};
var mongodbjs = require('../routes/mongodb.js');
var crypto = require('crypto');


var MyApp = function(app){

	app.get('/signup', function(req, res){
		console.log("in signup get : ");
		res.render('signup');
	});

	app.post('/signup', function(req, res){
		var query = req.body;
		var todo = 'signup';
		loginData.secret.username = query.username;
		loginData.secret.password = crypto.createHash('md5').update(query.password).digest("hex");
		loginData.name = query.name;
		loginData.age = query.age;
		loginData.twitterName = query.twitterName;

		console.log("in signup post : "+ loginData.secret.username);
		userExist = false;
		var data = {userType : 'old', user : { name : ''}};
		mongodbjs.findRecord(loginData, res, req, data, todo);
	});

};

module.exports = MyApp;
