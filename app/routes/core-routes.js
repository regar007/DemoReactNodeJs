var loginData = {name : '', age : '', secret : {username : '', password : ''}};
var mongodbjs = require('../routes/mongodb.js');

var MyApp = function(app) {

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
		//req.sessionStror.destroy();
		// if(req.session)
		// 	req.session.cookie.expires = new Date(Date.now());
	
		// req.sessionStore.destroy();
		req.session.destroy();
		//res.clearCookie('connect.sid', { path: '/' }); 
		//res.clearCookie('mycookie', { path: '/' }); 
//		console.log(req);
		console.log("in main page");
    	res.render('main');
	});
};

module.exports = MyApp;