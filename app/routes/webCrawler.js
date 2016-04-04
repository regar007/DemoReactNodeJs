var url = require('url');

var MyApp = function(app){
	app.get('/webCrawler', function(req, res){
		console.log(req);
		console.log("in welcome get!");
		if(!req.session.userName)
			res.redirect('/signin');
		else{
			var data = {userType : 'old' , country : '', user : {name : ''}};
			var url_parts = url.parse(req.url, true);
			var exist = (url_parts.query.country) ? true : false;
			
			if(exist)
				data.country = url_parts.query.country;
			var regExp = /\(([^)]+)\)/;
			var matches = regExp.exec(req.session.userName);
			if(matches != null){
				data.user.name = matches[1];
			}	
			data.userType = 'new'					
//			res.render('webCrawler', data);
		}
	});

	app.post('/webCrawler', function(req, res){
		console.log("in welcome post!");
		var data = req.body.value;
		var todo = req.body.todo;
		console.log(data);
		var data = mongodbjs.showRecord(data, todo, res);
	});
};

module.exports = MyApp;