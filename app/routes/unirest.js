var unirest = require('unirest');

var url = require('url');

var MyApp = function(app){
	app.get('/unirest', function(req, res){
		console.log("in unirest get!");
		if(!req.session.userName){
			res.redirect('/signin');
		}else{
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			console.log(query.message);

			if(query.message){
				// These code snippets use an open-source library.
				unirest.get("https://webaroo-send-message-v1.p.mashape.com/sendMessage?message="+query.message+"&phone="+8807435009)
					.header("X-Mashape-Key", "kglZT88ajkmshi04f7U7OXx4H7JIp15Uj0QjsnA9Wj80AE8iQe")
					.end(function (result) {
				  		console.log(result.status);
				  		if(result.status == 200){
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
		res.redirect('/configure');
	});

	app.post('/unirest', function(req, res){
		console.log("in unirest post!");
		var listData = req.body.value;
		var todo = req.body.todo;

		mongodbjs.updateCollection(listData, res, req, todo);

	});
};

module.exports = MyApp;