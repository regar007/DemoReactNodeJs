var mongodbjs = require('../routes/mongodb.js');
var url = require('url');

var MyApp = function(app){
	app.get('/welcome', function(req, res){
		console.log(req);
		console.log("in welcome get!");
		if(!req.session.userName)
			res.redirect('/signin');
		else{
			var data = {userType : 'old' , user : {name : ''}};
			var url_parts = url.parse(req.url, true);
			var exist = (url_parts.query.userType) ? true : false;
			
			if(exist)
				data.userType = url_parts.query.userType;
			var regExp = /\(([^)]+)\)/;
			var matches = regExp.exec(req.session.userName);
			if(matches != null){
				data.user.name = matches[1];
			}	
			data.userType = 'new'			
		
			res.render('welcome', data);
		}
	});

	app.post('/welcome', function(req, res){
		console.log("in welcome post!");
		var data = req.body.value;
		var todo = req.body.todo;
		console.log(data);
		var data = mongodbjs.showRecord(data, todo, res);
	});
};

module.exports = MyApp;