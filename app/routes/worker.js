var async = require('async');
var admin = require('../routes/adminUpdate.js');
var score = require('../routes/score.js');
var mongodb = require('../routes/mongodb.js');
var kue = require('kue'),
queue = kue.createQueue();
var redis = require('redis');
var client = redis.createClient();
var dayInMilli = 24 * 60 * 60 * 1000;

client.keys("*", function(err, key) {
  client.del(key, function(err, numRemoved){
    console.log(numRemoved);
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
    function(callback){
		//Update Admin for the day provide data need to run application
		queue.process('UPDATE_ADMIN', function(job, done){
			//update next day
			queue.create('UPDATE_ADMIN').delay(dayInMilli).save(function(err){
		         if( !err ) console.log("created job for admin update");
		    });
		    admin.updateAdminIPLUrls(job, done);
            setTimeout(function(){
            	callback(null, 'one');
            }, 5000);
		});

		queue.create('UPDATE_ADMIN').save(function(err){
		         if( !err ) console.log("started job for admin update");
		});
    },
    function(callback){
    	console.log("in ipl job");
		//create a job for IPL score
		var urlCricbuzzIPL = admin.currMatch.ipl.url;
		var timeStr = admin.currMatch.ipl.name + " at "+ admin.currMatch.ipl.date;
		var date = parseInt(timeStr.substring(timeStr.indexOf(' at')+3).split(" ")[2]);
		var match_time = parseInt(timeStr.substring(timeStr.indexOf(':')+1));
		var am_pm = timeStr.indexOf("AM"); 
		console.log("date : ", date,", match_time : ",match_time, ", am_pm : ", am_pm);

		//get current time
		var d = new Date();
		var hrUTC = d.getUTCHours();
		var minUTC = d.getUTCMinutes();
		var hr = (hrUTC + 5 > 24) ? (hrUTC + 5 - 24) :  hrUTC + 5;
		if(hrUTC + 5 > 24 || (hrUTC + 5 > 23 && minUTC + 30 > 60 )){
			date = date - 1;
		}
		var min = minUTC + 30 ;

		//calculate delay in miliseconds
		var daysRemain= (date - d.getUTCDate());
		if(am_pm == -1){
			match_time = match_time + 12;
		}
		var hrRemain = (match_time - hr );
		var minElapsed = -min;
		var timeInMili = ((((daysRemain * 24) + hrRemain) * 60) + minElapsed) * 60 * 1000;
		console.log("daysRemain : "+ daysRemain+", hrRemain : "+ hrRemain+", minElapsed : "+ minElapsed + ", timeInMili : "+ timeInMili);

		queue.process('IPL_SCORE', function(job, done){
			
			score.sendIPLScore(job.data.jobId, admin.currMatch.ipl.name, done);
			console.log("--------------------------------", admin.currOver);
			if(admin.currOver > 20){
				console.log("sent scores for the IPL Match################")
				admin.currOver = 0;
				done();
				return;
			}
			queue.create('IPL_SCORE', {
			      jobId: urlCricbuzzIPL
		        }).delay(30000).priority('high').save( function(err){
		       		if( !err ) console.log("created crawling task for #####IPL");
				});
		});

		if(timeInMili > 0){
			admin.currOver = 1;
			queue.create('IPL_SCORE', {
			      jobId: urlCricbuzzIPL
		        }).delay(timeInMili).priority('high').save( function(err){
		       if( !err ) console.log("created crawling task for #####IPL");
			});
		callback(null, 'two');
		}
    }
]);



