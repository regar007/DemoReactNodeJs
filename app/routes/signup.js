var loginData = {name : '', age : '', secret : {username : '', password : ''}};
var mongodbjs = require('../routes/mongodb.js');

var MyApp = function(app){

	app.get('/signup', function(req, res){
		console.log("in signup get : ");
		res.render('signup');
	});

	app.post('/signup', function(req, res){
		var query = req.body;
		var todo = 'signup';
		loginData.secret.username = query.username;
		loginData.secret.password = query.password;
		loginData.name = query.name;
		loginData.age = query.age;

		console.log("in signup post : "+ loginData.secret.username);
		if(loginData.secret.username != '' && loginData.secret.password != '' && loginData.name != '' && loginData.age != ''){
			userExist = false;
			var data = {userType : 'old', loginData : loginData};
			mongodbjs.findRecord(loginData, res, data, todo);
		}
		else
			res.render(todo, loginData);
	});

};

module.exports = MyApp;
