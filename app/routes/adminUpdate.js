var request = require('request');
var cheerio = require('cheerio');
var mongodbjs = require('../routes/mongodb.js');
var currMatch = {ipl : {name : '', url : '', date : ''}};

module.exports = {
	currMatch : currMatch, 

	updateAdminIPLUrls : function(job, done){
		var urlCricbuzzIPL = 'http://www.cricbuzz.com/cricket-series/2430/indian-premier-league-2016/matches';
		var monthNames = ["January", "February", "March", "Apr", "May", "June",
		  "July", "August", "September", "October", "November", "December"
		]; 
		var dateTracker = 0;
		var data = {matches : [], urls : [], dates : []}
		var d = new Date(), detailFetch = false;
		request(urlCricbuzzIPL, function(error, response, html){
		  if(!error){
		    var $ = cheerio.load(html);
		    
		   $('.schedule-date').filter(function(){
		        var a = $(this);
		        if(monthNames.indexOf(a.text().split(" ")[0]) == d.getMonth() && parseInt(a.text().split(" ")[1]) >= d.getDate() && parseInt(a.text().split(" ")[1]) >= dateTracker ){
		        	dateTracker = parseInt(a.text().split(" ")[1]);

		            var matchStr = a.next().next().children().text().split(','); 
		            data.matches.push(matchStr[0]);
		            data.dates.push(a.text() + " : "+matchStr[2].substring(matchStr[2].indexOf('/')+2, matchStr[2].indexOf(' LOCAL')));
		            data.urls.push('http://www.cricbuzz.com'+a.next().next().children().children().attr('href'));
		        }
		    })            
		      //   console.log(data.matches, data.dates , data.urls);
		  }
		  		//save the match details which is going to happen
		  		currMatch.ipl.name = data.matches[0];
		  		currMatch.ipl.url = data.urls[0];
		  		currMatch.ipl.date = data.dates[0];
				mongodbjs.updateCollection(data, null, 'adminUpdate', 'IPL');
				console.log("in update job");
				done();
		});
	},

}