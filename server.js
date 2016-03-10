// server.js

var express = require('express'),
jade = require('jade'),
path = require('path'),
app = express(),
port = 4444,
bodyParser = require('body-parser');
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: false }));
var router = express.Router();
var signup = require('./app/routes/secret.js');

// Make sure to include the JSX transpiler
require('node-jsx').install();

// Include static assets. Not advised for production
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));
// Set view path
app.set('views', path.join(__dirname, 'views'));
// set up ejs for templating. You can use whatever
//app.set('view engine', 'ejs');
app.set('view engine', 'jade');
app.use(router);

// Set up Routes for the application
require('./app/routes/core-routes.js')(app);
//app.use('/signup', signup);

// router.get('/', function(req, res){
// 	res.render('contact');
// });

// router.post('/secret', function(req, res){
// 	var secret = req.body.secret;
// 	var user = {
// 		authorised : {
// 			toggle : false,
// 			key1 : {
// 				name : secret,
// 				comp : "Pramati"
// 			}
// 		}
// 	};
// 	user.authorised.toggle = (secret === secretKey) ? true : false;
// 	console.log(user.authorised.key1.name);
// 	res.render("secret", user);
// });
//parameter
// router.get('/secret/:key', function(req, res){
// 	var key = req.body.key;
// 	var user = {};
// 	user.authorised = (secret === secretKey) ? true: false;
// 	console.log("2"+user.authorised);
// 	res.render('secret', user);
// });
// Query
// router.get('/secret*', function (req, res) {  
//   var key = req.query.key;
//   res.end('Password: ' + key);
// });
// router.get('/secret', function(req , res){
// 	var user = {
// 		authorised : false
// 	};
// 	console.log("3"+ user.authorised);
// 	res.render('secret', user);
// });

//Route not found -- Set 404
app.get('*', function(req, res) {
    res.json({
        'route': 'Sorry this page does not exist!'
    });
});

app.listen(port);
console.log('Server is Up and Running at Port : ' + port);

module.exports = app;
