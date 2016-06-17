var async = require('async');
var mongodb = require('../routes/mongodb.js');
var kue = require('kue'),
queue = kue.createQueue();

queue.process('IPL_SMS', function(job, done){
    sendByPlivo(job.data.mob, job.data.msg, done);
});


//Plivo another SMS api to send sms
var plivo = require('plivo');
var p = plivo.RestAPI({
  authId: 'MAYMEXZJRLNTA3NDRMNJ',
  authToken: 'NzhiNDIyM2Y0ZTM3ZWU4NDM2YWM1OWU1MDc3NjM1'
});

var sendByPlivo = function(mob, msg, done){
  var params = {
      'src': +919829920598, // Sender's phone number with country code
      'dst' : "+91" + mob,//mob, // Receiver's phone Number with country code
      'text' : msg, // Your SMS Text Message - English
      //'text' : "こんにちは、元気ですか？" // Your SMS Text Message - Japanese
      //'text' : "Ce est texte généré aléatoirement" // Your SMS Text Message - French
  }; 

  p.send_message(params, function (status, response) {
    console.log('Status: ', status);
    console.log('API Response:\n', response);
   // if(status == 200)
    	done();
  });        

}

module.exports = {

	iplSMSJobs : function(msg, url, index, currOver){
		console.log("in iplSMSJobs : ", url);		
		async.series([
			function(callback){
				mongodb.findRecord(url, callback, index, 'sms');
			}
		],
		function(err, results){
			if(!err){
				console.log("iplSMSJobs has length of ", results[0].length);
				for(var i = 0; i < results[0].length; i++){		
					if(parseInt(currOver) % (parseInt(results[0][i].subscription.cricSub.series[0].over)) === 0){
						queue.create('SERIES_SMS', {
							msg : "Series : " + results[0][i].subscription.cricSub.series[0].seriesName + ", Fixture : " + results[0][i].subscription.cricSub.series[0].name  + msg,
							mob : results[0][i].mob
						}).priority('critical').save(function(err){
						         if( !err ) console.log("started job for sending SERIES_SMS for user ", results[0][i].name);
						});
					}
				}
			}
		});
	}
}
