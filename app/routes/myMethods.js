var seriesOvers = [];

module.exports = {
    
    seriesOvers : seriesOvers,
    
	matchTimeInMilli : function( url, date, t){
		var urlCricbuzzIPL = url;
		var timeStr = t + " at "+ date;
		var date = parseInt(timeStr.substring(timeStr.indexOf(' at')+3).split(" ")[2]);
		var match_time = parseFloat(timeStr.substring(timeStr.indexOf(':')+1));
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
		    if(match_time > 12)
		        match_time = match_time - 12;
			match_time = match_time + 12;
		}else{
		    if(match_time > 12)
		        match_time = match_time- 12;
		}
		var hrRemain = (match_time - hr );
		var minElapsed = -min;
		var timeInMili = ((((daysRemain * 24) + hrRemain) * 60) + minElapsed) * 60 * 1000;
		console.log("daysRemain : "+ daysRemain+", hrRemain : "+ hrRemain+", minElapsed : "+ minElapsed + ", timeInMili : "+ timeInMili);

		seriesOvers.push({'over' : 0,  'matchOver' : false, 'currOver' : 0, 'secondInning' : false});
		return timeInMili;
	},
}
