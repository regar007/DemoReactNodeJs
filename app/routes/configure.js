//var loginData = {name : '', age : '', secret : {username : '', password : ''}};
var mongodbjs = require('../routes/mongodb.js');
var url = require('url');
//
var data = {user : {name : '', sms : {status : '', details : ''}}};

var MyApp = function(app){
	app.get('/configure', function(req, res){
//		console.log(req);
		console.log("in configure get!");
		if(!req.session.userName){
			res.redirect('/signin');
		}else{
			var query = url.parse(req.url, true).query;
			var todo = 'getConfig';
			console.log("status : ", query)
			if(query.status){
				data.user.sms.status = query.status;
				data.user.sms.details = query.details;
			}
			var regExp = /\(([^)]+)\)/;
			var matches = regExp.exec(req.session.userName);
			console.log(matches[1]);
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