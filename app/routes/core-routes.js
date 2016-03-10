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
		console.log("in main page");
    	res.render('main');
	});
};

module.exports = MyApp;