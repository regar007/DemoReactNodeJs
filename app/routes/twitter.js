var Twitter = require('twitter');
var url = require('url');
 
 
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
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		var regExp = /\(([^)]+)\)/;
		var matches = regExp.exec(query.name);
		console.log("in twitter get!");
		console.log("Twitter search : "+ matches[1]);
		client.get('search/tweets',{count: 5, q : matches[1]}, function(error, tweets, response){
			if(error) throw error;
			console.log(tweets);  // The favorites. 
		 // console.log(response);  // Raw response object. 
		res.render('friend',{tweets : tweets});
		});
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

