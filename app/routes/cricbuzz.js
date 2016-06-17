var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var phantom = require('phantom');
var mongodbjs = require('../routes/mongodb.js');
var myMethods = require('../routes/myMethods');
var cricbuzzURL = 'http://www.cricbuzz.com';
var score = require('../routes/score.js');
var kue = require('kue'),
queue = kue.createQueue();


module.exports = {

	updateSeries : function(done, prevCallback){
	    console.log('################ update series ################# ');
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; 
		var count = 0;
		var series = [];
		series.push({'allurls' : []});
		var data = {matches : [], urls : [], dates : []}
		var d = new Date(), detailetch = false;
		
        async.series([
            function(callback){
                var _ph, _page, _oo;
                
                phantom.create().then(instance => {
                    _ph = instance;
                    return _ph.createPage();
                }).then(page => {
                    _page = page;
                    _page.open(cricbuzzURL + '/cricket-schedule/series', function(){
                         _page.evaluate(function() {
                            console.log('in evaluate');
                            document.querySelector("#srs_category[3]\\.dom_id").click(function(){
                                console.log("The paragraph was clicked.");
                            });
                        });
                        
                    });
                });
                
        		request(cricbuzzURL, function(error, response, html){
        		  if(!error){
        		    var $ = cheerio.load(html);
        		    
                    // $("#srs_category[3].dom_id").click(function(){
                    //     alert("The paragraph was clicked.");
                    // });

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
                                        if(month >= d.getMonth() && date >= d.getDate()){
                                            //console.log("Date ", date,', month ', month);
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
                                
                	            //console.log(series[index].matches);
                                count++;
                	            //creates job for first match in series
                	            var t = series[index].matches[0].time.split(',');
                	            var timeInMilli = myMethods.matchTimeInMilli(series[index].matches[0].url,t[0], t[t.length-1]);
                                
                        		queue.process('SERIES_SCORE', function(job, done){
                        			score.sendIPLScore(job.data.jobId, null, done, queue, job.data.index);
                        			console.log("--------------------------------", myMethods.seriesOvers[0].over, " matchOver : ",myMethods.seriesOvers[0].matchOver);
                        			if(myMethods.seriesOvers[job.data.index].matchOver){
                        				console.log("sent scores for the IPL Match################ ", job.data.jobId);
                        	//			admin.currOver = 1;
                        				myMethods.seriesOvers[0].matchOver = false;
                        				done();
                        				return;
                        			}
                        			queue.create('SERIES_SCORE', {
                        			      jobId: job.data.jobId,
                        			      index : job.data.index
                        		        }).delay(10000).priority('high').save( function(err){
                        		       		if( !err ) console.log("created Next task for @ ", job.data.jobId);
                        				});
                        		});
                        		
                    			queue.create('SERIES_SCORE', {
                    			      jobId: series[index].matches[0].url,
                    			      index : index -1
                    		        }).delay(timeInMilli).priority('high').save( function(err){
                    		       if( !err ) console.log("created job for #####", series[index].matches[0].name);
                    			});
                        		
		                        matchesCounter = 0;
                    		    if(count == series.length - 1)
                            		callback(null, 'five');
                		    }
                	    });
        	    	}
                }
            },
            function(callback){
				mongodbjs.findRecord({'series' : series}, callback, 'adminUpdate', 'SERIES');
            }
        ],
		function(err, results){
			if(!err){
			    if(results[2].length > 0){
    			    for(var i = 0; i < series[0].allurls.length; i++){
    		            if(results[2][0].allurls.indexOf(series[0].allurls[i]) < 0){
    		                results[2][0].allurls.push(series[0].allurls[i]);
    		                results[2].push(series[i+1]);
    		            }
    			    }
			    }else{
			        results[2] = series;
			    }
    			mongodbjs.updateCollection({'series' : results[2]}, prevCallback, 'adminUpdate', 'SERIES');
    			done();
            	//prevCallback(null, 'seven');
			}
        });
	    
	},
	
}

//converts GMT to IST time
function convetGMTtoIST(time, am_pm){
    if(time == 12)
        if(am_pm == 'AM'){
            am_pm = 'PM';
        }else{
            am_pm = 'AM';
        }
	time = time + 5.30;
	var rem = time % parseInt(time);
    rem = (rem).toFixed(2);
    if(rem >= .60)
        time = parseInt(time) + 1 + (rem % .60);
	
	if(am_pm == 'AM'){
		if(time >= 12){
            time = (time < 13 ) ? time : time - 12;
		    am_pm = 'PM';
		}
	}else{
		if(time >= 12){
		    time = (time < 13 ) ? time : time - 12.00;
		    am_pm = 'AM';
		}
	}
    return ''+ time.toFixed(2) + ' '+ am_pm  ;
        
}