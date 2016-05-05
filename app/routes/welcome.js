var mongodbjs = require('../routes/mongodb.js');
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');


var MyApp = function(app){
	app.get('/welcome', function(req, res){
//		console.log(req);
		console.log("in welcome get!");
		if(!req.session.userName)
			res.redirect('/signin');
		else{
			console.log(req.session.userName);
			var data = {userType : 'old' ,'twitterFriend' : '', user : {name : ''} , matchesDetails : {}};
			var todo = 'getPreferences';
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

		     //get the future match urls from cricbuzz
		     if(todo === 'getPreferences'){
					mongodbjs.findRecord(data, res, req, todo);			    			
			    }
			    else{
					mongodbjs.findRecord(data, res, req, todo);
				}
		//	res.render('welcome', data);
		}
	});

	app.post('/welcome', function(req, res){
		console.log("in welcome post!");
		var data = req.body.value;
		var todo = req.body.todo;

		if(todo === 'cricSub'){

	     //get the crrent match url from cricbuzz
	    //   var urlCricbuzzIPL = 'http://www.cricbuzz.com/cricket-series/2430/indian-premier-league-2016';
	    //   request(urlCricbuzzIPL, function(error, response, html){
	    //       if(!error){
	    //         var $ = cheerio.load(html);
	            
	    //        $('#scag_content').filter(function(){
	    //             var a = $(this).children().children().first();
	    //             console.log(a.attr('title'));
	    //             console.log(a.attr('href'));

					// var title = a.attr('title').replace('Live Cricket Score of','') ;
					// var href = a.attr('href');
					// var title_href = title+"_"+href;
					// console.log("title_href : ",title_href);
					// console.log("overInterval : ",data);
					// var dataToUpdate = {overInterval : data, title_href : [title_href]};
			
					// mongodbjs.updateCollection(dataToUpdate, res, req, todo);
	    //         })            
	    //       }
	    //     });			
	    		var subscriptionData = {matchName : [req.body.matchName], matchURL : [req.body.matchURL], overInterval : [data], date : [new Date()]}
	    		mongodbjs.updateCollection(subscriptionData, res, req, todo);
		}
		else if(todo === 'searchName'){
			mongodbjs.showRecord(data , todo , res);
		}
	});
};

module.exports = MyApp;