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
      console.log("status : ", query)
      if(query.status){
        data.user.sms.status = query.status;
        data.user.sms.details = query.details;
      }
      var mob = "+91"+req.session.userName.substr(req.session.userName.indexOf(")") + 1);
      //start crawling...
      var urlMatch = '';//'http://www.espncricinfo.com/indian-premier-league-2016/engine/match/980931.html';
      var urlIPL = 'http://www.espncricinfo.com/indian-premier-league-2016/content/series/968923.html';
 
     //get the crrent match url
      request(urlIPL, function(error, response, html){
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
            })            
          }
        });
        return;
     // urlToCrawl = 'http://www.imdb.com/title/tt2093991/?ref_=inth_ov_tt';
     // currTime = new Date().getTime();
  //     var score = setInterval(function(){
        request(urlMatch, function(error, response, html){
            if(!error){
            var $ = cheerio.load(html);

            var msg = "";

            // $('div.team-1-name').filter(function(){
            //     var data = $(this);
            //     matchdata = data;
            //     msg += data.text() + " : ";            
            // })
            // $('.innings-1-score').filter(function(){
            //     var data = $(this);
            //     matchdata = data;
            //     console.log("innings-1-score : " ,data.children());
            //     msg += data.text() + ", ";            
            // })
            // $('.team-2-name').filter(function(){
            //     var data = $(this);
            //     console.log("team2 : ",data.text());
            //     msg += data.text() + " : ";            
            // })
            // $('.innings-current').filter(function(){
            //     var data = $(this);
            //     matchdata = data;
            //     console.log("innings-current : " ,data.children());
            //     msg += data.text() + ", ";            
            // })

            // $('.innings-requirement').filter(function(){
            //     var data = $(this);
            //     console.log("requirement : ",data.text());
            //     msg += "Result : " + data.text().trim().replace(" +", " ");
            // })
 
          // trying diifferent div's to get score
          var count = 0,firstInning = true, matchdata = {player1 : {name : '', runs : 0, balls : 0}, player2 : {name : '', runs : 0, balls : 0}, teamBatting : {name :'', total_score : '' }, teamBowling : {name :'', total_score : '' }};
          
            $('.th-innings-heading').each(function(i, element){
              var a = $(this);
              if(a.text() != 'Bowling' && firstInning){
                console.log("team name"+a.text());
                matchdata.teamBatting.name = a.text().trim().replace(" +", " ");
                a = a.parent();

                var pl1 = a.next().children().next();
                matchdata.player1.name = pl1.children().text();
                matchdata.player1.runs = pl1.next().next().first().text();
                matchdata.player1.balls = pl1.next().next().next().first().text();

                var pl2 = a.next().next().next().children().next();
                matchdata.player2.name = pl2.children().text();
                matchdata.player2.runs = pl2.next().next().next().first().text();
                matchdata.player2.balls = pl2.next().next().next().first().text();
                while(a.attr("class") != 'total-wrap'){
                    a = a.next();
                }
                console.log("total_score 1"+a.children().next().next().text());
                matchdata.teamBatting.total_score = a.children().next().next().text().replace(/[()]/g, "' ");
                firstInning =false;
              }
              else if(a.text() != 'Bowling' && !firstInning){
                matchdata.teamBowling.name = matchdata.teamBatting.name;
                matchdata.teamBatting.name = a.text().trim().replace(" +", " ");
                a = a.parent();
                while(a.attr("class") != 'total-wrap'){
                    a = a.next();
                }
                console.log("total_score 2"+a.children().next().next().text());
                matchdata.teamBowling.total_score = matchdata.teamBatting.total_score;
                matchdata.teamBatting.total_score = a.children().next().next().text().replace(/[()]/g, "' ");
              }
            });
           }
          var full_score = JSON.stringify(matchdata);

          msg = "IPL : "+ matchdata.teamBatting.name +" Vs "+ matchdata.teamBowling.name+", Batting : "+matchdata.player1.name+" [ Runs : "+ matchdata.player1.runs+", Balls : "+matchdata.player1.balls+" ] " +"& "+ matchdata.player2.name +" [ Runs : "+ matchdata.player2.runs+", Balls : "+matchdata.player2.balls+" ], Inning 1 total score : "+ matchdata.teamBatting.total_score+ ", Inning 2 total score : "+ matchdata.teamBowling.total_score+ ".";

          console.log("full_score : ", full_score);
          console.log("msg : ", msg);

          //send score
          var params = {
              'src': +918807435009, // Sender's phone number with country code
              'dst' : mob, // Receiver's phone Number with country code
              'text' : msg, // Your SMS Text Message - English
              //'text' : "こんにちは、元気ですか？" // Your SMS Text Message - Japanese
              //'text' : "Ce est texte généré aléatoirement" // Your SMS Text Message - French
          }; 

          // p.send_message(params, function (status, response) {
          //   console.log('Status: ', status);
          //   console.log('API Response:\n', response);
          // });        
          // res.redirect('welcome');

        });
//      },  2000);  

      setTimeout(function(){ 
        console.log("score cleared!");
    //    clearInterval(score);
      }, 10000);
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
