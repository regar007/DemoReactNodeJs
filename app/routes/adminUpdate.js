var request = require('request');
var cheerio = require('cheerio');
var mongodbjs = require('../routes/mongodb.js');
var cricbuzz = require('../routes/cricbuzz');
var currMatch = {ipl : {name : [], url : [], date : []}};
var currOver = 1;
var matchOver = false;

module.exports = {
	currMatch : currMatch,

	currOver : currOver, 
	
	matchOver : matchOver,

	updateAdminCricbuzz : function(job, done){
	
		cricbuzz.updateSeries();

	},
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
		  		for(var i = 0 ; i < 2; i++){
			  		currMatch.ipl.name[i] = data.matches[0];
			  		currMatch.ipl.url[i] = data.urls[0];
			  		currMatch.ipl.date[i] = data.dates[0];
		  		}
				mongodbjs.updateCollection(data, null, 'adminUpdate', 'IPL');
				console.log("in update job");
				done();
		});
	},

	matchTimeInMilli : function( url, date, name){
		var urlCricbuzzIPL = url;
		var timeStr = name + " at "+ date;
		var date = parseInt(timeStr.substring(timeStr.indexOf(' at')+3).split(" ")[2]);
		var match_time = parseInt(timeStr.substring(timeStr.indexOf(':')+1));
		var am_pm = timeStr.indexOf("AM"); 
		console.log("date : ", date,", match_time : ",match_time, ", am_pm : ", am_pm);

		//get current time
		var d = new Date();
		var hrUTC = d.getUTCHours();
		var minUTC = d.getUTCMinutes();
		var hr = (hrUTC + 5 > 24) ? (hrUTC + 5 - 24) :  hrUTC + 5;
		if(hrUTC + 5 > 24 || (hrUTC + 5 > 23 && minUTC + 30 > 60 )){
			date = date - 1;
		}
		var min = minUTC + 30 ;

		//calculate delay in miliseconds
		var daysRemain= (date - d.getUTCDate());
		if(am_pm == -1){
			match_time = match_time + 12;
		}
		var hrRemain = (match_time - hr );
		var minElapsed = -min;
		var timeInMili = ((((daysRemain * 24) + hrRemain) * 60) + minElapsed) * 60 * 1000;
		console.log("daysRemain : "+ daysRemain+", hrRemain : "+ hrRemain+", minElapsed : "+ minElapsed + ", timeInMili : "+ timeInMili);

		return timeInMili;
	},
}