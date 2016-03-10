//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/mongo_db1';

module.exports = {

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
	updateCollection : function(loginData){

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
	},

	findRecord : function(loginData, res, data, route){
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
	},

	showRecord : function(loginData, todo, res){
	    var data = [];

		// Use connect method to connect to the Server
		MongoClient.connect(url, function (err, db) {
		  if (err) {
		    console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
		    //HURRAY!! We are connected. :)
		    console.log('Connection established to : showRecord : ' + loginData + ", ", url);

		    // Get the documents collection
		    var collection = db.collection('users');

		    //We have a cursor now with our find criteria
		    var regex = '/*'+loginData+'/*';
		    console.log(regex+ " : "+todo);
		    var cursor = {};
		    if(todo === 'searchName'){
		    	cursor = collection.find({name : {$regex: regex, $options: 'i'}});
		    }
		    else
			    cursor = collection.find({name: loginData.name});

		    //We need to sort by age descending
		   // cursor.sort({age: -1});

		    //Limit to max 10 records
		    //cursor.limit(10);

		    //Skip specified records. 0 for skipping 0 records.
		    //cursor.skip(0);
		    //Lets iterate on the result
		    cursor.each(function (err, doc) {
		      if (err) {
		        console.log(err);
		      } else {
		        console.log('Fetched:', doc);
	            if(doc)  
	           		data.push(doc.name); 
	           	else
					res.json({ data : data});
		      }
		    });
		  }
		});	
	}
};

var	saveMongo = function(loginData, res, data){
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
