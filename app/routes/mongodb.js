//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
var crypto = require('crypto');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/mongo_db1';
var init = false;

 if(!init){
 	console.log("init: "+init);
 	MongoClient.connect(url, function (err, db) {
 	  if (err) {
 	    console.log('Unable to connect to the mongoDB server. Error:', err);
 	  } else {
 	  	var users = db.collection('users'); 
 	  	users.remove();
	  	var admin = db.collection('admin'); 
	  	admin.remove();
 	  }
 	});
 	init = !init;
 };


module.exports = {

	updateCollection : function(userdata, res, req, todo){
		MongoClient.connect(url, function (err, db) {
		  if (err) {
		    console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			console.log('Connection established to: updateCollection', url);
			// Get the documents collection
			var collection = db.collection('users');
			if(req === 'adminUpdate'){
				collection = db.collection('admin');
			}

			var query = {};

			//get the username from session
			var regExp = / *\([^)]*\) */g;
			var username = (req.session && req.session.userName) ? req.session.userName.substring(0, req.session.userName.indexOf("(")) : '' ;
			var isUpdated= false;
			console.log(username +" : "+ userdata);
			if(todo === 'userList'){
				console.log("in userList");
				query = {$set: {hashTag : userdata}};
			}
			else if(todo === 'daysList'){
				console.log("in daysList	")
				query = {$set: {'schedule.days' : userdata}};
			}
			else if(todo === 'timeList'){
				query = {$set: {'schedule.times' : userdata}};
			}
			else if(todo === 'cricSub'){
				query = {$set: {'subscription.cricSub.matchName' : userdata.matchName, 'subscription.cricSub.matchURL' : userdata.matchURL, 'subscription.cricSub.date' : userdata.date, 'subscription.cricSub.overInterval' : userdata.overInterval, 'subscription.cricSub.noOfMatches' : 1}};
			}else if(todo == 'IPL'){
				username = 'regar007';
				query = {$set: {'subscription.iplSub.matchesNames' : userdata.matches, 'subscription.iplSub.matchesURL' : userdata.urls, 'subscription.iplSub.matchesDates' : userdata.dates}};
			}

//			console.log("query : ", query)
			collection.update({'secret.username' : username}, query, function (err, numUpdated) {
			  if (err) {
			    console.log(err);
			  } else if (numUpdated) {
			  	isUpdated = true;
			    console.log('Updated Successfully %d document(s).', numUpdated);
			  } else {
			    console.log('No document found with defined "find" criteria!');
			  }

			  if(req != 'adminUpdate'){
			 	 if(isUpdated)
			  		res.json({result : 'success'});
			  	else
			  		res.json({result : 'failed'});
			  }

			  //Close connection
			  db.close();			 
			});
		  }
		});
	},

	findRecord : function(data, res, req, todo){
		// Use connect method to connect to the Server
		MongoClient.connect(url, function (err, db) {
		  if (err) {
		    console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
		    //HURRAY!! We are connected. :)
		    console.log('Connection established to: findUser', url);

		    // Get the documents collection
	    	var collection = db.collection('users');
		    if(todo === 'admin'){
		    	collection = db.collection('admin');
		    }
		    //set query	
		    var query = {};
		    var adminData = {};
			if(todo === 'signin')
		    	query = {secret : {username : data.secret.username, password : crypto.createHash('md5').update(data.secret.password).digest("hex")}};
		    else if(todo === 'signup'){
		    	var x = crypto.createHash('md5').update(data.secret.username).digest("hex");
		    	query = {_id : x};
		    	console.log("id: "+query._id);
		    }
		    else if(todo === 'getConfig'){
		  //   	var regExp = / *\([^)]*\) */g;
				// var username = req.session.userName.replace(regExp, '');
				var username = req.session.userName.substring(0, req.session.userName.indexOf('('));
				console.log(username);
		    	query = {_id : crypto.createHash('md5').update(username).digest("hex")};
		    }
		    else if(todo === 'getPreferences'){
		    	//get common data from admin account
		    	query = {'secret.username' : 'regar007'};
		    	db.collection('admin').find(query).toArray(function(err, result){
		    		if(!err){
						console.log("Admin : ",result[0]);
		    			var details = result[0].subscription.iplSub;
		    			adminData.matchesDetails = {matches : details.matchesNames , dates : details.matchesDates, urls : details.matchesURL};
		    		}
		    	});
				var username = req.session.userName.substring(0, req.session.userName.indexOf('('));
				console.log(username);
		    	query = {_id : crypto.createHash('md5').update(username).digest("hex")};		    	
		    }
		    else if(todo === 'admin'){
		    	var x = crypto.createHash('md5').update(data.secret.username).digest("hex");
		    	query = {_id : x};
		    	console.log("id: "+query._id);		    	
		    }
		    else if(todo === 'sms'){
		    	query = {'subscription.cricSub.matchURL.0' : data};
		    }

		    console.log("query :" , query);
		    
			collection.find(query).toArray(function (err, result) {
		      if (err) {
		        console.log(err);
		      } else if (result.length) {
		        console.log('Found:', result[0].secret.username);

		        if(todo === 'signup')
					res.redirect('/signin?exist='+true);
				else if(todo === 'signin'){
			        req.session.userName = result[0].secret.username+ "("+result[0].name+")"+result[0].mob;
//			        console.log(req);
			        console.log("username :"+ req.session.userName);
					res.redirect('/welcome?exist='+true);
				}
				else if(todo === 'getConfig'){
					console.log("user data : ", result[0], " status : ", data.user.sms.status);
					res.render('configure', {user : result[0], sms : {status : data.user.sms.status, details : data.user.sms.details}});
				}
				else if(todo === 'getPreferences'){
					console.log('user data : ', result[0]);
					res.render('welcome', {data : data, adminData : adminData, title_href : result[0].subscription.cricSub.matchURL, overInterval : result[0].subscription.cricSub.overInterval, noOfMatches: result[0].subscription.cricSub.noOfMatches});
				}
				else if(todo == 'sms'){
					//res is callback here
					res(null, result);
				}

		      } else {
		      	console.log('id not found');
				if(todo === 'admin'){
		      		data._id = query._id;
					saveMongo(data, todo);
				}
		      	else if(todo === 'signup'){
		      		data._id = query._id;
			        req.session.userName = data.secret.username+ "("+data.name+")"+data.mob;
			        console.log(req);
					saveMongo(data, res);
				}
				else if(todo === 'signin'){
					res.redirect('/signin');
				}
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
		    var regex = "^" +loginData+'/*';
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
	           		data.push(doc.name +" "+doc.twitterName);
	           	else{
//	           		data = JSON.parse(data);
//					res.setContentType("text/json");
//					res.setCharacterEncoding("UTF-8");	           		
					res.json({data : data});
	           	}
		      }
		    });
		  }
		});	
	}
};

var	saveMongo = function(loginData, res){
		MongoClient.connect(url, function (err, db) {
		  if (err) {
		    console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
		    //HURRAY!! We are connected. :)
		    console.log('Connection established to : saveMongo', url);

		    // Get the documents collection
		    var collection = db.collection('users');
		    if(res === 'admin'){
		    	collection = db.collection('admin');
		    }

		    // Insert some users
		    console.log(loginData);
		    collection.insert(loginData, function (err, result) {
		      if (err) {
		        console.log(err);
		        userExist = true;
		      } else {
		        console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length);
		      	if(res !== 'admin')
			      	res.redirect('/welcome?userType=new');

		      }
		      //Close connection
		      db.close();
		    });
     	}
	});
};
