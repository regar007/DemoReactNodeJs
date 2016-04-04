var text = require('textbelt');
var mongodbjs = require('../routes/mongodb.js');
var url = require('url');

var MyApp = function(app){
	app.get('/textbelt', function(req, res){
		console.log("in textbelt get!");
		if(!req.session.userName){
			res.redirect('/signin');
		}else{
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			console.log(query.message);

			if(query.message){
				text.send('8807435009', 'A sample text message!', undefined, function(err) {
					if (err) {
						console.log(err);
					}
					else {
						res.redirect('/configure');
					}
				});				
			}
			// var todo = 'sendSMS';
			// var regExp = /\(([^)]+)\)/;
			// var matches = regExp.exec(req.session.userName);
			// data.user.name = matches[1];
			// mongodbjs.findRecord(data, res, req, todo);			
		}
	});

	app.post('/textbelt', function(req, res){
		console.log("in textbelt post!");
		var listData = req.body.value;
		var todo = req.body.todo;

		mongodbjs.updateCollection(listData, res, req, todo);

	});
};

module.exports = MyApp;