var request = require('request');
var cheerio = require('cheerio');
var url = require('url');
var URL = require('url-parse');
var currTime;

//Plivo another SMS api to send sms
var plivo = require('plivo');
var p = plivo.RestAPI({
  authId: 'MAYMEXZJRLNTA3NDRMNJ',
  authToken: 'NzhiNDIyM2Y0ZTM3ZWU4NDM2YWM1OWU1MDc3NjM1'
});



//var Crawler = require("simplecrawler");

// var pageToVisit = "http://www.arstechnica.com";
// console.log("Visiting page " + pageToVisit);
// request(pageToVisit, function(error, response, body) {
//    if(error) {
//      console.log("Error: " + error);
//    }
//    // Check status code (200 is HTTP OK)
//    console.log("Status code: " + response.statusCode);
//    if(response.statusCode === 200) {
//      // Parse the document body
//      var $ = cheerio.load(body);
//      console.log("Page title:  " + $('title').text());
//    }
// });


var MyApp = function(app){
  app.get('/score', function(req, res){
//    console.log(req);
    console.log("in score get!");
    if(!req.session.userName){
      res.redirect('/signin');
    }else{
      var query = url.parse(req.url, true).query;
      var todo = 'sendScore';
      var matchdata;
      if(query.matchURL){
        console.log("url for match: ", query.matchURL)
      }
      var mob = "+91"+req.session.userName.substr(req.session.userName.indexOf(")") + 1);
      //start crawling...
      var urlMatch = 'http://www.espncricinfo.com/indian-premier-league-2016/engine/match/980937.html';//'http://www.espncricinfo.com/indian-premier-league-2016/engine/match/980931.html';
      var urlCricinfoIPL = 'http://www.espncricinfo.com/indian-premier-league-2016/engine/match/980937.html';
      var urlCricbuzzIPL = query.matchURL.replace(/ /g, '');

     //get the crrent match url from cricinfo
      request(urlCricinfoIPL, function(error, response, html){
          if(!error){
            var $ = cheerio.load(html);
            
           $('#livescores-full').filter(function(){
                var a = $(this);
                  var timeStr = a.find('.result-text').parent().next().first().text();
                  var time = timeStr.split("begin at ").pop();
                  var time = time.substring(0, time.indexOf('local'));
                  console.log(time);
                  if(new Date().getTime() > time ){
                    var urlMatch = 'http://www.espncricinfo.com'+a.find('.result-text').children().attr('href');
                    console.log("b : " ,urlMatch);                    
                  }
                  else{
                    var url1 = 'http://www.cricbuzz.com/live-cricket-scores/16407/gl-vs-rcb-19th-match-indian-premier-league-2016';
                  }
            })            
          }
        });

     // urlToCrawl = 'http://www.imdb.com/title/tt2093991/?ref_=inth_ov_tt';
     // currTime = new Date().getTime();
  //     var score = setInterval(function(){
        request(urlCricbuzzIPL, function(error, response, html){
            if(!error){
            var $ = cheerio.load(html);
            console.log("in cricbuzz");

            var msg = "";
 
          // trying diifferent div's to get score
          var count = 0,firstInning = true, matchdata = {requirement : '', player1 : {name : '', runs : 0, balls : 0}, player2 : {name : '', runs : 0, balls : 0}, teamBatting : {name :'', total_score : '' }, teamBowling : {name :'', total_score : '' }};
           //  $('.innings-information').each(function(i, element){
           //      var data = $(this);
           //      console.log("current : ", data.text());
           //      var team1 = data.children().first().text();
           //      var team2 = data.children().first().next().text();
           //      var requirement = data.children().first().next().next().text();

           //      console.log(team1 ," :", team2, " : ", requirement, " : ");
           //  }); 
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
           $('.cb-min-inf').each(function(i, element){
                var data = $(this);
                if(c == 0){
                console.log("score 2 : ", data.children().next().next().find('.cb-col-10').next().first().text());
                var batsman1 = data.children().next().children().first().text();
                var ball1 =  data.children().next().find('.cb-col-10').first().text();
                var r1 = data.children().next().find('.cb-col-10').next().first().text();
                var ball2 = data.children().next().next().find('.cb-col-10').first().text();
                var r2 = data.children().next().next().find('.cb-col-10').next().first().text();                
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


            //getting score from cricInfo when the match is over
            // $('.th-innings-heading').each(function(i, element){
            //   var a = $(this);
            //   if(a.text() != 'Bowling' && firstInning){
            //     console.log("team name"+a.text());
            //     matchdata.teamBatting.name = a.text().trim().replace(" +", " ");
            //     a = a.parent();

            //     var pl1 = a.next().children().next();
            //     matchdata.player1.name = pl1.children().text();
            //     matchdata.player1.runs = pl1.next().next().first().text();
            //     matchdata.player1.balls = pl1.next().next().next().first().text();

            //     var pl2 = a.next().next().next().children().next();
            //     matchdata.player2.name = pl2.children().text();
            //     matchdata.player2.runs = pl2.next().next().next().first().text();
            //     matchdata.player2.balls = pl2.next().next().next().first().text();
            //     while(a.attr("class") != 'total-wrap'){
            //         a = a.next();
            //     }
            //     console.log("total_score 1"+a.children().next().next().text());
            //     matchdata.teamBatting.total_score = a.children().next().next().text().replace(/[()]/g, "' ");
            //     firstInning =false;
            //   }
            //   else if(a.text() != 'Bowling' && !firstInning){
            //     matchdata.teamBowling.name = matchdata.teamBatting.name;
            //     matchdata.teamBatting.name = a.text().trim().replace(" +", " ");
            //     a = a.parent();
            //     while(a.attr("class") != 'total-wrap'){
            //         a = a.next();
            //     }
            //     console.log("total_score 2"+a.children().next().next().text());
            //     matchdata.teamBowling.total_score = matchdata.teamBatting.total_score;
            //     matchdata.teamBatting.total_score = a.children().next().next().text().replace(/[()]/g, "' ");
            //   }
            // });

            
           }
          var full_score = JSON.stringify(matchdata);

          msg = "IPL : "+ matchdata.teamBatting.name +" Vs "+ matchdata.teamBowling.name+", Batting : "+matchdata.player1.name+" [ Runs : "+ matchdata.player1.runs+", Balls : "+matchdata.player1.balls+" ] " +"& "+ matchdata.player2.name +" [ Runs : "+ matchdata.player2.runs+", Balls : "+matchdata.player2.balls+" ], "+ matchdata.requirement; 

          //Inning 1 total score : "+ matchdata.teamBatting.total_score+ ", Inning 2 total score : "+ matchdata.teamBowling.total_score+ ".";

          console.log("full_score : ", full_score);
          console.log("msg : ", msg);

          //send score
          var params = {
              'src': +111111111, // Sender's phone number with country code
              'dst' : mob, // Receiver's phone Number with country code
              'text' : msg, // Your SMS Text Message - English
              //'text' : "こんにちは、元気ですか？" // Your SMS Text Message - Japanese
              //'text' : "Ce est texte généré aléatoirement" // Your SMS Text Message - French
          }; 

          p.send_message(params, function (status, response) {
            console.log('Status: ', status);
            console.log('API Response:\n', response);
          });        
          res.redirect('welcome');

        });
//      },  5000);  

      setTimeout(function(){ 
        console.log("score cleared!");
    //    clearInterval(score);
      }, 20000);
        // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
    }
  });

  app.post('/score', function(req, res){
    console.log("in score post!");
    var listData = req.body.value;
    var todo = req.body.todo;

    mongodbjs.updateCollection(listData, res, req, todo);

  });
};

module.exports = MyApp;
