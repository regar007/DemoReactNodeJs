var async = require('async');
var admin = require('../routes/adminUpdate');
var myMethods = require('../routes/myMethods');
var score = require('../routes/score.js');
var mongodb = require('../routes/mongodb.js');
var crypto = require('crypto');
var kue = require('kue'),
queue = kue.createQueue();
var redis = require('redis');
var client = redis.createClient();
var dayInMilli = 24 * 60 * 60 * 1000;

client.keys("*", function(err, key) {
	if(!err)
	  client.del(key, function(err, numRemoved){
	    if(!err)console.log(numRemoved);
	  });
});

queue.on('job enqueue', function(id, type){
  console.log( 'Job %s got queued of type %s', id, type );
 
}).on('job complete', function(id, result){
  kue.Job.get(id, function(err, job){
    if (err) return;
    job.remove(function(err){
      if (err) throw err;
      console.log('removed completed job #%d', job.id);
    });
  });
});

async.series([
	function (callback) {
		//Add the Admin for keeping track of some data over the time
		var adminData = {name : 'Ashok',mob : 8124313034, age : 24,twitterName: '@ASHOKREGAR',subscription : {series : [], iplSub : {matchesNames : [],matchesURL : [] , matchesDates : [], overInterval : '', noOfMatches : 0 }}, hashTag : [], schedule : {days : [], times : []}, secret : {username : 'regar007', password : crypto.createHash('md5').update('Ashu@007').digest("hex")}};
		mongodb.findRecord(adminData, callback, null, 'admin');
	},
  function(callback){
		//Update Admin for the day provide data need to run application
		queue.process('UPDATE_IPL', function(job, done){
			//update next day
			queue.create('UPDATE_IPL').delay(dayInMilli).save(function(err){
		         if( !err ) console.log("created job for admin update");
		    });
		    
		    admin.updateAdminIPLUrls(job, done);
           
            setTimeout(function(){
            	callback(null, 'two');
            }, 5000);
		});

		queue.create('UPDATE_IPL').save(function(err){
		         if( !err ) console.log("started job for admin update");
		});
  },
  function(callback){
		//Update Admin for the day provide data need to run application
		queue.process('UPDATE_SERIES', function(job, done){
			//update next day
			queue.create('UPDATE_SERIES').delay(dayInMilli).save(function(err){
		         if( !err ) console.log("created job for admin update IPL");
		    });
		    
		    admin.updateAdminCricbuzz(job, done, callback);

		});

		queue.create('UPDATE_SERIES').save(function(err){
		         if( !err ) console.log("started job for admin update SERIES");
		});
  },
  function(callback){
    	console.log("in ipl job");
		//create a job for IPL score
		var urlCricbuzzIPL = admin.currMatch.ipl.url[0];
		var timeInMili = myMethods.matchTimeInMilli(admin.currMatch.ipl.url[0],admin.currMatch.ipl.date[0], admin.currMatch.ipl.name[0]);
		console.log("timeInMili @@@@@@@@@@@@@@@@@@@@: "+ timeInMili);

		queue.process('IPL_SCORE', function(job, done){
			
			score.sendIPLScore(job.data.jobId, admin.currMatch.ipl.name, done, queue, null);
			console.log("--------------------------------", admin.currOver, " matchOver : ",admin.matchOver);
			if(admin.matchOver){
				console.log("sent scores for the IPL Match################")
	//			admin.currOver = 1;
				admin.matchOver = false;
				done();
				return;
			}
			queue.create('IPL_SCORE', {
			      jobId: urlCricbuzzIPL
		        }).delay(10000).priority('high').save( function(err){
		       		if( !err ) console.log("created Next task for @", admin.currMatch.ipl.name[0]);
				});
		});

	//	if(timeInMili > 0){
			admin.currOver = 1;
			// queue.create('IPL_SCORE', {
			//       jobId: urlCricbuzzIPL
		 //       }).delay(timeInMili).priority('high').save( function(err){
		 //      if( !err ) console.log("Started Task for #####", admin.currMatch.ipl.name[0]);
			// });
		callback(null, 'three');
//		}
  }
]);



