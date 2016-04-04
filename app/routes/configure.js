//var loginData = {name : '', age : '', secret : {username : '', password : ''}};
var mongodbjs = require('../routes/mongodb.js');
var url = require('url');

var MyApp = function(app){
	app.get('/configure', function(req, res){
//		console.log(req);
		console.log("in configure get!");
		var data = {user : {name : ''}};
		if(!req.session.userName){
			res.redirect('/signin');
		}else{
			var todo = 'getConfig';
			var regExp = /\(([^)]+)\)/;
			var matches = regExp.exec(req.session.userName);
			data.user.name = matches[1];
			mongodbjs.findRecord(data, res, req, todo);			
		}
	});

	app.post('/configure', function(req, res){
		console.log("in configure post!");
		var listData = req.body.value;
		var todo = req.body.todo;

		mongodbjs.updateCollection(listData, res, req, todo);

	});
};

module.exports = MyApp;