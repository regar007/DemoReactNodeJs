var request = require('request');
var cheerio = require('cheerio');
var sms = require('../routes/sms.js');
var currOver = 1; //intial 1
var secondInning = false; //intial false

module.exports = {

	sendIPLScore : function(url, teams, done) {
		console.log("sending IPL score...");
		var msg = "";

		// trying diifferent div's to get score
		var count = 0; 
		var firstInning = true;
		var matchdata = {requirement : '', player1 : {name : '', runs : 0, balls : 0}, player2 : {name : '', runs : 0, balls : 0}, teamBatting : {name :'', total_score : '' }, teamBowling : {name :'', total_score : '' }};
		var matchOver = false;

//        var score = setInterval(function(){
        request(url, function(error, response, html){
            if(!error){
	            var $ = cheerio.load(html);
	            console.log("in cricbuzz");

	            //check if match over
	            $('.cb-text-mom').each(function(i, element){
	                var data = $(this);
	                console.log("current : ", data.text());
	                if(data.text() != ""){
	                    matchOver = true;
	                }
	            }); 
	           // $('.innings-1-score ').each(function(i, element){
	           //      var data = $(this);
	           //      console.log("score 1 : ", data);
	           //  });

	           //getting score from cricbuzz site while macth is going on
	           var c= 0;	
	           $('.cb-scrs-wrp').each(function(i, element){
	                var data = $(this);
	                console.log("score 1 : ", data.children().next().next().first().text());
	                var team1 = data.children().first().text().trim().replace(" +", " ");

	                var team2 = data.children().next().first().text().trim().replace(" +", " ");
	                var requir = data.children().next().next().first().text();

	                matchdata.teamBatting.name = team1;
	                matchdata.teamBowling.name = team2;
	                matchdata.requirement = requir;  
	            }); 
             console.log("team2 : ", matchdata.teamBowling.name);
             if(matchdata.teamBowling.name.replace(/ /g, '') === 'InningsBreak'){
             	done();
             	secondInning = true;
             	return;
             }
           $('.cb-min-inf').each(function(i, element){
	                var data = $(this);
	                if(c == 0){
		                console.log("score 2 : ", data.children().next().next().find('.cb-col-10').next().first().text());
		                var batsman1 = data.children().next().children().first().text();
		                var r1 =  data.children().next().find('.cb-col-10').first().text();
		                var ball1 = data.children().next().find('.cb-col-10').next().first().text();
		                var r2 = data.children().next().next().find('.cb-col-10').first().text();
		                var ball2 = data.children().next().next().find('.cb-col-10').next().first().text();                
		                var bat2 = data.children().next().next().children().first().text();
		                console.log(batsman1 +" : "+ bat2 + " : " + ball1 + " : " + ball2 + " : "+ r1 + " : "+ r2);
		                
		                matchdata.player1.name = batsman1;
		                matchdata.player1.runs = r1;
		                matchdata.player1.balls = ball1;

		                matchdata.player2.name = bat2;
		                matchdata.player2.runs = r2;
		                matchdata.player2.balls = ball2;

		                c++;
	                }
	            });  
                //if team1 name is empty then match is not started
                if(matchdata.teamBatting.name === ""){
            		console.log("match not started, rolling back...");
            		done();
					return;
                }
				var full_score = JSON.stringify(matchdata);

				msg = "IPL : "+ matchdata.teamBatting.name +" Vs "+ matchdata.teamBowling.name+", ";
				msg = (matchdata.player1.name == "") ? "" : msg + "Batting : "+matchdata.player1.name+" [ Runs : "+ matchdata.player1.runs+", Balls : "+matchdata.player1.balls+" ] ";
				msg = (matchdata.player2.name == "") ? "" : msg + "& "+ matchdata.player2.name +" [ Runs : "+ matchdata.player2.runs+", Balls : "+matchdata.player2.balls+" ], ";
				msg = msg + matchdata.requirement; 

				msg = msg.replace(/\u00A0/g,'');
				//Inning 1 total score : "+ matchdata.teamBatting.total_score+ ", Inning 2 total score : "+ matchdata.teamBowling.total_score+ ".";

				console.log("full_score : ", full_score);
				console.log("msg : ", msg);

                //check if over has finished

                var battinTeam = matchdata.teamBatting.name;
                var _over = parseInt(battinTeam.substring(battinTeam.indexOf('(')+1, battinTeam.indexOf('Ovs)')));
                if(secondInning){
  	               battinTeam = matchdata.teamBowling.name;
                	_over = parseInt(battinTeam.substring(battinTeam.indexOf('(')+1, battinTeam.indexOf('Ovs)')));
                }

        		console.log("over current##################### ", currOver, " : ", _over);
                if(_over === currOver){
					sms.iplSMSJobs(msg, url);
					currOver++;
					if(currOver > 20){
						currOver = 1;
					}
            }

				done();
			}
        });
 //     },  5000);  
      
    //  if(matchOver)
  //       setTimeout(function(){ 
  //         console.log("score cleared!");
  //         clearInterval(score);
  //       });
	}


}