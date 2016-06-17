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
// 	  	users.remove();
	  	var admin = db.collection('admin'); 
//	  	admin.remove();
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
			}else if(todo === 'cricSub'){
				query = {$set: {'subscription.cricSub.matchName' : userdata.matchName, 'subscription.cricSub.matchURL' : userdata.matchURL, 'subscription.cricSub.date' : userdata.date, 'subscription.cricSub.overInterval' : userdata.overInterval, 'subscription.cricSub.noOfMatches' : 1}};
			}else if(todo === 'CRICSUB'){
				query = {$set: {'subscription.cricSub.series' : [{'seriesName' : userdata.series, 'url' : userdata.matchURL, 'name' : userdata.matchName, 'time' : userdata.time, 'over' : userdata.overInterval}]}};
			}else if(todo === 'UNSUBCRIC'){
				query = {$set: {'subscription.cricSub.series' : []}};
			}else if(todo === 'IPL'){
				username = 'regar007';
				query = {$set: {'subscription.iplSub.matchesNames' : userdata.matches, 'subscription.iplSub.matchesURL' : userdata.urls, 'subscription.iplSub.matchesDates' : userdata.dates}};
			}else if(todo === 'SERIES'){
				username = 'regar007';
				query = {$set: {'subscription.series' : userdata.series}};
			}

//			console.log("query : ", query)
			collection.update({'secret.username' : username}, query, function (err, numUpdated) {
			  if (err) {
			    console.log(err);
			  } else if (numUpdated) {
			  	isUpdated = true;
			  } else {
			    console.log('No document found with defined "find" criteria!');
			  }

 			  if(isUpdated){
				  if(todo === 'CRICSUB'){
				  		res.json({result : 'Subscribed!', subStatus : true});
				  }else if(todo == 'UNSUBCRIC'){
				  		res.json({result : 'Unsubscribed!', subStatus : false});
				  }else if(todo === 'IPL'){
						res(null, 'IPL');	
				  }else if(todo === 'SERIES'){
					    console.log('Series Updated Successfully document(s).');
						res(null, 'SERIES');	
				  }else{
				  		res.json({result : 'success'})
				  }
			 }else{
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
						if(result[0]){
							// //IPL data
		    	// 			var details = result[0].subscription.iplSub;
		    	// 			adminData.matchesDetails = {matches : details.matchesNames , dates : details.matchesDates, urls : details.matchesURL};
		    				//ongoing series data
		    	//			adminData.series = result[0].subscription.series; 
						}
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
		    	if(req != null){
		    		query = {'subscription.cricSub.series.0.url' : data};
		    	}else{
		    		query = {'subscription.cricSub.matchURL.0' : data};
		    	}
		    }else if(todo === 'CRICDATA' || todo === 'GETFIXTURE' || todo === 'SERIES'){
		    	query = {'secret.username' : 'regar007'};
		    	db.collection('admin').find(query).toArray(function(err, result){
		    		if(!err){
						console.log("Admin : ",result[0]);
						if(result[0]){
							if(todo === 'CRICDATA'){
								for(var k = 1; k < result[0].subscription.series.length; k++){
									data.push({'name' : result[0].subscription.series[k].name});
								}
							}else if(todo === 'GETFIXTURE'){
								for(var k = 1; k < result[0].subscription.series.length; k++){
									if(result[0].subscription.series[k].name && result[0].subscription.series[k].name === req){
										data = result[0].subscription.series[k].matches;
										break;
									}
								}
							}else if(todo === 'SERIES'){
								//res is callback here
								res(null, result[0].subscription.series);
								return;
							}
						}else{
							if(todo === 'SERIES'){
								//res is callback here
								res(null, []);
								return;
							}
							data = [];
						}
		    			res.json(data);
					}
		    	});
		    }

		    console.log("query :" , query);
		    
			collection.find(query).toArray(function (err, result) {
		      if (err) {
		        console.log("error: ",err);
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
					//for ipl 
					//res.render('welcome', {data : data, adminData : adminData, title_href : result[0].subscription.cricSub.matchURL, overInterval : result[0].subscription.cricSub.overInterval, noOfMatches: result[0].subscription.cricSub.noOfMatches});
					res.render('welcome', {data : data, subscription : result[0].subscription.cricSub.series});
				}
				else if(todo == 'sms'){
					//res is callback here
					res(null, result);
				}else if(todo === 'admin'){
					res(null, 'one');
				}

		      } else {
		      	console.log('person not found');
				if(todo === 'admin'){
		      		data._id = query._id;
					saveMongo(data, res, todo);
				}
		      	else if(todo === 'signup'){
		      		data._id = query._id;
			        req.session.userName = data.secret.username+ "("+data.name+")"+data.mob;
			        console.log(req);
					saveMongo(data, res, null);
				}
				else if(todo === 'signin'){
					res.render('signin', {loginStatus : 'failed'});
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

var	saveMongo = function(loginData, res, req){
		MongoClient.connect(url, function (err, db) {
		  if (err) {
		    console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
		    //HURRAY!! We are connected. :)
		    console.log('Connection established to : saveMongo', url);

		    // Get the documents collection
		    var collection = db.collection('users');
		    if(req === 'admin'){
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
		      	if(req !== 'admin'){
			      	res.redirect('/welcome?userType=new');
		      	}else{
			      	res(null, 'one');
			    }
		      }
		      //Close connection
		      db.close();
		    });
     	}
	});
};
