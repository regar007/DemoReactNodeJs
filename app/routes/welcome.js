var mongodbjs = require('../routes/mongodb.js');
var url = require('url');

var MyApp = function(app){
	app.get('/welcome', function(req, res){
//		console.log(req);
		console.log("in welcome get!");
		if(!req.session.userName)
			res.redirect('/signin');
		else{
			console.log(req.session.userName);
			var data = {userType : 'old' ,'twitterFriend' : '', user : {name : ''}};
			var url_parts = url.parse(req.url, true);
			// if name is present in url for finding friend then redirect it to twitter
			if(url_parts.query.name){
				res.redirect('/twitter?name='+ url_parts.query.name)
			}
			//check if redirected from twitter
			if(url_parts.query.twitterName){
				data.twitterFriend = url_parts.query.twitterName;
			}
			if(url_parts.query.userType){
				data.userType = url_parts.query.userType;
			}

			var exist = (url_parts.query.exist) ? true : false;
			console.log(exist);
			console.log(data);

			var regExp = /\(([^)]+)\)/;
			var matches = regExp.exec(req.session.userName);
			if(matches != null){
				data.user.name = matches[1];
			}

			res.render('welcome', data);
		}
	});

	app.post('/welcome', function(req, res){
		console.log("in welcome post!");
		var data = req.body.value;
		var todo = req.body.todo;
		console.log(data);

		mongodbjs.updateCollection(data, res, req, todo);
	});
};

module.exports = MyApp;