var React = require('react/addons'),
ReactApp = React.createFactory(require('../components/ReactApp'));
var loginData = {name : '', age : '', secret : {username : '', password : ''}};
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/mongo_db1';
var userExist = false;
var init = false;
var _id = 0;

// if(!init){
// 	console.log("init: "+init);
// 	MongoClient.connect(url, function (err, db) {
// 	  if (err) {
// 	    console.log('Unable to connect to the mongoDB server. Error:', err);
// 	  } else {
// 	  	var users = db.collection('users') 
// 	  	users.remove();
// 	  }
// 	});
// 	init = !init;
// }
var saveMongo = function(loginData, res, data){
	MongoClient.connect(url, function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	    //HURRAY!! We are connected. :)
	    console.log('Connection established to : saveMongo', url);

	    // Get the documents collection
	    var collection = db.collection('users');

	    //Create some id
	    loginData._id = loginData.name + loginData.secret.username + loginData.age;

	    // Insert some users
	    console.log(loginData);
	    collection.insert(loginData, function (err, result) {
	      if (err) {
	        console.log(err);
	        userExist = true;
	      } else {
	        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length + result);
	      	data.userType = 'new';
	      	res.render('welcome', data);

	      }
	      //Close connection
	      db.close();
	    });
	  }
	});
};
var updateCollection = function(loginData){

	console.log("In updateCollection");
	// Get the documents collection
	var collection = db.collection('users');

	// Insert some users
	collection.update({name: loginData.name}, {$set: {enabled: false}}, function (err, numUpdated) {
	  if (err) {
	    console.log(err);
	  } else if (numUpdated) {
	    console.log('Updated Successfully %d document(s).', numUpdated);
	  } else {
	    console.log('No document found with defined "find" criteria!');
	  }
	  //Close connection
	  db.close();
	});
};

var findRecord = function(loginData, res, data, route){
	// Use connect method to connect to the Server
	MongoClient.connect(url, function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	    //HURRAY!! We are connected. :)
	    console.log('Connection established to: findUser', url);

	    // Get the documents collection
	    var collection = db.collection('users');

	    // Insert some users
	    console.log(loginData.secret.username);
	    collection.find({secret : {username : loginData.secret.username, password : loginData.secret.password}}).toArray(function (err, result) {
	      if (err) {
	        console.log(err);
	      } else if (result.length) {
	        console.log('Found:', result[0].name);
	        data.loginData.name = result[0].name;
	        
	        if(route === 'signup')
				res.render('signin', data);
			if(route === 'signin')
				res.render('welcome', data);

	      } else {
	      	if(route === 'signup')
				saveMongo(loginData, res, data);
			if(route === 'signin')
				res.render('signin');
	      }
	      //Close connection
	      db.close();
	    });
	  }
	});
};

var showRecord = function(loginData){
	// Use connect method to connect to the Server
	MongoClient.connect(url, function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	    //HURRAY!! We are connected. :)
	    console.log('Connection established to : showRecord', url);

	    // Get the documents collection
	    var collection = db.collection('users');

	    //We have a cursor now with our find criteria
	    var cursor = collection.find({name: loginData.name});

	    //We need to sort by age descending
	    cursor.sort({age: -1});

	    //Limit to max 10 records
	    cursor.limit(10);

	    //Skip specified records. 0 for skipping 0 records.
	    cursor.skip(0);

	    //Lets iterate on the result
	    cursor.each(function (err, doc) {
	      if (err) {
	        console.log(err);
	      } else {
	        console.log('Fetched:', doc);
	      }
	    });
	  }
	});	
}

module.exports = function(app) {

/*	app.get('/', function(req, res){
		// React.renderToString takes your component
    // and generates the markup
		var reactHtml = React.renderToString(ReactApp({}));
    // Output html rendered by react
		console.log(ReactApp);
    res.render('index.ejs', {reactOutput: reactHtml});
	});
*/

	app.get('/', function(req, res){
		console.log("in main page");
    	res.render('main');
	});

	app.get('/signup', function(req, res){
		console.log("in signup get : ");
		res.render('signup');
	});

	app.post('/signup', function(req, res){
		var query = req.body;
		loginData.secret.username = query.username;
		loginData.secret.password = query.password;
		loginData.name = query.name;
		loginData.age = query.age;

		console.log("in signup post : "+ loginData.secret.username);
		if(loginData.secret.username !== '' && loginData.secret.password !== '' && loginData.name !== '' && loginData.age !== ''){
			userExist = false;
			var data = {userType : 'old', loginData : loginData};
			findRecord(loginData, res, data, 'signup');
		}
		else
			res.render('signup', loginData);
	});

	app.get('/signin', function(req, res){
		console.log("in sign get");
		res.render('signin', loginData);
	});

	app.post('/signin', function(req, res){
		var query = req.body;
		loginData.secret.username = query.username;
		loginData.secret.password = query.password;
		console.log("in signin post"+ query.username +" : "+ query.password);
		var data = {userType : 'old', loginData : loginData};
		findRecord(loginData,res,data, 'signin');
		console.log("in sign get");
	});
	app.get('/welcome', function(){
		console.log("in welcom get");
		res.render('welcome');
	});
};
