var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var mongodbjs = require('../routes/mongodb.js');
var cricbuzzURL = 'http://www.cricbuzz.com';


module.exports = {

	updateSeries : function(){
	    console.log('################ update series ################# ');
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; 
		var count = 0;
		var series = [];
		series.push({'allurls' : []});
		var data = {matches : [], urls : [], dates : []}
		var d = new Date(), detailFetch = false;
		
        async.series([
            function(callback){
        		request(cricbuzzURL, function(error, response, html){
        		  if(!error){
        		    var $ = cheerio.load(html);
                    $('#seriesDropDown .cb-subnav-item').filter(function(){
                        var a = $(this);
                        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@' ,a.attr('href'));
                        series.push({'name' : a.text(), 'matches' : [] , 'url' : cricbuzzURL + a.attr('href')+ '/matches'});
                        series[0].allurls.push(cricbuzzURL + a.attr('href')+ '/matches');
                    })            
                	callback(null, 'four');
        		  }
        		});
            },
            function(callback){
                var matchesCounter = 0; 
                if(series.length > 0){
            		for(var i = 0; i < series[0].allurls.length; i++){
            		    var curr = i;
                		request(series[0].allurls[curr], function(error, response, html){
                		    if(!error){
                   		        var currURL = 'http://'+ response.request.host + response.request.path;
//                		        console.log(currURL);
                                var index = series[0].allurls.indexOf(currURL)+ 1;
                    		    var $ = cheerio.load(html);
                                $('#series-matches .cb-col-100').filter(function(){
                                    if(matchesCounter < 10){
                                        var a = $(this).children();
                                        // console.log('#########################' ,a.first().next().text());
                                        //console.log('#########################' ,a.next().next().children().find('span').text());
                                        // console.log('#########################' ,a.next().next().children().children().first().attr('href'));
                                        // console.log('#########################' ,a.attr('class', '.schedule-date ng-isolate-scope').find('span').text());
                                        var dayStr = a.first().next().text();
                                        var month = monthNames.indexOf(dayStr.split(' ')[0]);
                                        var date = parseInt(dayStr.split(' ')[1]);
                                        if(month >= d.getMonth() && date > d.getDate()){
                                            console.log("Date ", date,', month ', month);
                                            var t = a.next().next().children().next().text().replace(/\s+/g, ' ');
                                            var gmt = t.substring(0, t.indexOf('GMT')).replace(':', '.');
                                            if(gmt.indexOf('AM') > -1){
                                                t = convetGMTtoIST(parseFloat(gmt), 'AM');
                                            }else{
                                                t = convetGMTtoIST(parseFloat(gmt), 'PM');
                                            }
                                            var time = a.first().next().text() +', '+ t;
                                            var name = a.next().next().children().children().first().text();
                                            var url = cricbuzzURL + a.next().next().children().children().first().attr('href');
                                            series[index].matches.push({'name' : name, 'time' : time, 'url' : url});
                                            matchesCounter++;
                                        }
                                    }
                                });
                                
                	            console.log(series[index].matches);
                                count++;
                                matchesCounter = 0;
                    		    if(count == series.length - 1)
                            		callback(null, 'five');
                		    }
                	    });
        	    	}
                }
            },
            function(callback){
				mongodbjs.updateCollection({'series' : series}, callback, 'adminUpdate', 'SERIES');
            }
        ]);
	    
	},

}

//converts GMT to IST time
function convetGMTtoIST(time, am_pm){
	time = time + 5.30;
	var rem = time % parseInt(time);
    rem = (rem).toFixed(2);
    if(rem >= .60)
        time = parseInt(time) + 1 + (rem % .60);
	
	if(am_pm == 'AM'){
		if(time > 12){
		    time = time - 12;
		    am_pm = 'PM';
		}
	}else{
		if(time > 12){
		    time = time - 12.00;
		    am_pm = 'AM';
		}
	}
    return ''+ time.toFixed(2) + ' '+ am_pm  ;
        
}