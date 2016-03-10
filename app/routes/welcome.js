var loginData = {name : '', age : '', secret : {username : '', password : ''}};
var mongodbjs = require('../routes/mongodb.js');

var MyApp = function(app){
	app.get('/welcome', function(req, res){
		console.log("in welcome get!");
		res.render('welcome');
	});

	app.post('/welcome', function(req, res){
		console.log("in welcome post!");
		var data = req.body.value;
		console.log(data);
		var data = mongodbjs.showRecord(data, 'searchName', res);

		//response.setContentType("text/json");
		//response.setCharacterEncoding("UTF-8");
	});
};

module.exports = MyApp;