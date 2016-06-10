var mongodbjs = require('../routes/mongodb.js');
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var worker = require('../routes/worker');

var MyApp = function(app){
	app.get('/cricData', function(req, res){
//		console.log(req);
		console.log("in welcome get!");
		if(!req.session.userName)
			res.redirect('/signin');
		else{
			console.log(req.session.userName);
			var url_parts = url.parse(req.url, true);
			var todo = url_parts.query.todo;
			var series = [];

		    //get the future match urls from cricbuzz
		    if(todo === 'CRICDATA' || todo === 'GETFIXTURE'){
				mongodbjs.findRecord(series, res, url_parts.query.series, todo);			    			
			}
		}
	});

	app.post('/cricData', function(req, res){
		console.log("in welcome post!");
		var data = req.body.value;
		var todo = req.body.todo;

		if(todo === 'criSub'){

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
		else if(todo === 'searcName'){
			mongodbjs.showRecord(data , todo , res);
		}
	});
};

module.exports = MyApp;