var mongodbjs = require('../routes/mongodb.js');
var loginData = {name : '', age : '', secret : {username : '', password : ''}};

var MyApp = function(app){

	app.get('/signin', function(req, res){
		console.log("in sign get");
		res.render('signin', loginData);
	});

	app.post('/signin', function(req, res){
		var query = req.body;
		loginData.secret.username = query.username;
		loginData.secret.password = query.password;
		console.log("in signin post"+ query.username +" : "+ query.password);
		var data = {userType : 'old', loginData : loginData};
		mongodbjs.findRecord(loginData,res,data, 'signin');
		console.log("in sign get");
	});
};

module.exports = MyApp;