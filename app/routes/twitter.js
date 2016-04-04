var Twitter = require('twitter');
//NOTE : working hour for unirest API is 9 to 9, so it does not send sms after 9!
var unirest = require('unirest');
var url = require('url');

var smsMsendKeys = ["GeNLhyvdA3mshms4sgX0UNlvrMq4p1BS6Y7jsnj7lnSAdQIJPE", "TkVUXGPzbtmshgLmNGKzETRULzB5p1zhjSUjsngn8Qz18LKiWp" ,"GL0kvACRGjmshKB4QJyIyv3C3znzp11zvUnjsn3KzIiEs8xhnx" , "GgzPVjghDTmshcf0l5fj4Advrg0Dp1sOSFNjsnVoqNBcnvXjzl", "roJ9hoiztsmshqmKewezaAJ3uemyp1G4STBjsnaf0cBFVfmWMY", "dYgQRgFASKmshSndeAKYZ3SSAS4Up1bKunIjsncK6LfpO583GZ", "EwDc7SKpVdmshiBWm87kJJjwNYXVp1Y7XsQjsnhXijtzASXlC7", "kglZT88ajkmshi04f7U7OXx4H7JIp15Uj0QjsnA9Wj80AE8iQe","GKiP6mPBmBmshCx7E5dHe164Jslap1LdFvrjsn11zIcorsNJfg", "2qYrprcb8WmshusjIjCoVDPTQ1qZp1XDdlljsnM1hvnXSHXesa", "PfRnmtUiummshqRdhnTGr30jaY98p1pKwkLjsnYcJqONE5bkoZ" ];

var newsChanels= ["HT EntertainmentVerified account", "Bollywood Bubble", "Movified Bollywood", "Dailyhunt", "757Live Movies", "TOI Photogallery", "INDIAN_BY_HEART"];
 
var params = {screen_name: 'nodejs'};
var count = 0,
	util = require('util');
var client = new Twitter({
  consumer_key: 'PAQL8X75nvvI4xpyUECFJNw5o',
  consumer_secret: 'sckqMdZLkXR0Sb4ky2IlxfPRk1hG0xj4j66M96j8vHp9wATS5e',
  access_token_key: '598946505-sY4ngi9SMCPbk469McxxCZCuAOuoEFWG90kT3cHf',
  access_token_secret: 'ZMTw2Av2uJJg4qIscWTPxMhQrlENFgoX3dOmPaW7foNuC'
});
console.log(client);

// client.stream('statuses/filter', {track : 'love'}, function(stream){
// 	stream.on('data', function(data){
// 		console.log(data);
// 		stream.destroy();
// 		process.exit(0);
// 	});
// 	stream.on('error', function(error) {
//      throw error;
//   });
// });

// var client = new Twitter({
//   consumer_key: process.env.TWITTER_CONSUMER_KEY,
//   consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
//   access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
//   access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
// });

// client.stream('statuses/filter', {track: 'javascript'}, function(stream) {
//   stream.on('data', function(tweet) {
//     console.log(tweet.text);
//   });	
// 	setTimeout(function(){
// 		stream.destroy();
// 		process.exit(0);
// 	}, 5000);
// });

var MyApp = function(app){
	app.get('/twitter', function(req, res){
		console.log("in twitter get!");
		if(!req.session.userName)
			res.redirect('/signin');
		else{
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			var twitterName = '';
//			var	name = query.name.replace(/ *\([^)]*\) */g, '');
//			var regExp = /\(([^)]+)\)/;
			// var matches = regExp.exec(query.name);
			// if(matches != null){
			// 	twitterName = matches[1].replace('@', '');
			// }
			if(query.name){
				var str = query.name;
				if(str.indexOf("@")){
					twitterName = '@'+str.substr(str.indexOf("@") + 1);
					name = str.substr(0, str.indexOf("@"));
				}else{
					twitterName = '@'+str;
				}
				console.log("Twitter search : "+ twitterName + ", name : "+ name);
				client.get('statuses/user_timeline',{count: 50, screen_name : twitterName}, function(error, tweets, response){
					if(error)
						res.redirect('/welcome?twitterName='+twitterName+'&accExist='+false);
					//console.log(tweets);  // The favorites. 
					//	console.log(response);  // Raw response object. 
					res.render('friend',{tweets : tweets, name : name});
				});
			}
			else if(query.count){
				var feed = [];
				var messageStr= '';
				var allDone = 1;
				var count = query.count;
				console.log(count);
				for(var i=0; i< count; i++){
					console.log("searching tweets for ", query['count'+i]);
					var q = {q : '#'+query['count'+i], lang : 'en', result_type : 'recent', count : 20};
					client.get('search/tweets', q, function(error, tweets, response){
						if(error)
							console.log(query['count'+i], " : error");
						else{
							tweets.search_metadata.query = '#'+tweets.search_metadata.query.replace("%23","");

							if(query.todo == 'feed'){
								feed.push(tweets);
							}
							else if(query.todo == 'sms'){
								var x= tweets.search_metadata.query;
								for(var ind = 0; ind < tweets.statuses.length; ind++){
									//first tweet of the current topic
//									if(newsChanels.indexOf(tweets.statuses[ind].user.name) != -1)
									if(tweets.statuses[ind].text.substring(0,2) != 'RT')
										x = x + tweets.statuses[ind].text +":"+tweets.statuses[ind].created_at; 
								}
//								feed.push(x);
								messageStr = messageStr + x;
							}
							if(allDone==count){
								console.log("feed : ", feed);
								if(query.todo == 'feed'){
									res.render('updates', {tweets : feed});
								}
								else if(query.todo == 'sms'){
									//shorten the message if larger than 160 character
									if(messageStr.charAt(160)){
//										messageStr = messageStr.substring(0,10) + "...";
									}
									console.log("Mob No. : "+query.mob+", messageStr : ", messageStr);
									// These code snippets use an open-source library. sending SMS
									var key = smsMsendKeys[Math.floor(Math.random()*smsMsendKeys.length)];
									console.log(key);
									unirest.get("https://webaroo-send-message-v1.p.mashape.com/sendMessage?message="+"messageStrAshok"+"&phone="+query.mob)
										.header("X-Mashape-Key", "avl7MKKf7tmshQ2cBIe8LttZyo5jp1CbOoZjsnbF0Rh1A1Tcq4")
										.end(function (result) {
									  		console.log(result.status);
									  		if(result.status == 200){
									  			res.redirect('/configure');
									  		}
									});			
								}
							}else{
								allDone++;
							}
							console.log(allDone, ":", i);
						}
					});
				}
			}
		}
	});

	app.post('/twitter', function(req, res){
		console.log("in twitter post!");
		var data = req.body.value;
		//var todo = req.body.todo;
		console.log(data);
		// client.post('statuses/update', {status: 'I Love Twitter'},  function(error, tweet, response){
		//   if(error) throw error;
		//   console.log(tweet);  // Tweet body. 
		//   console.log(response);  // Raw response object. 
		// });
		res.json({name : data});	
	});
};

module.exports = MyApp;

