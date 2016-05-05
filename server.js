// server.js

var express = require('express'),
favicon = require('serve-favicon'),
jade = require('jade'),
path = require('path'),
ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
port = process.env.OPENSHIFT_NODEJS_PORT || 4444,
app = express(),
bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//var passport = require('passport'),
//Strategy = require('passport-local').Strategy,
var expressSession = require('express-session');
//var mongodbjs = require('./app/routes/mongodb.js');

//configure strategy
// passport.use(new Strategy(
//   function(username, password, cb) {
//   	console.log('in strategy :'+username +" : "+passport);
//     mongodbjs.findByUsername({ username: username }, function (err, user) {
//       if (err) { return cb(err); }
//       if (!user) { return cb(null, false); }
//       if (!user.verifyPassword(password)) { return cb(null, false); }
//       return cb(null, user);
//     });
//   }
// ));

// passport.serializeUser(function(user, cb) {
//   cb(null, user.id);
// });

// passport.deserializeUser(function(id, cb) {
//   mongodbjs.findById(id, function (err, user) {
//     cb(err, user);
//   });
// });

 app.use(cookieParser());
// app.use(require('express-session')({ secret: 'keyboard-cat', resave: false, saveUninitialized: false }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use(expressSession({secret : 'ada231sdkwkqw124kcmkcms1', cookieName : 'mycookie'}));
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(__dirname + '/public/favicon.ico'));

var router = express.Router();



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
require('./app/routes/signup.js')(app);
require('./app/routes/signin.js')(app);
require('./app/routes/welcome.js')(app);
require('./app/routes/twitter.js')(app);
require('./app/routes/configure.js')(app);
require('./app/routes/textbelt.js')(app);
require('./app/routes/unirest.js')(app);
require('./app/routes/crawler.js')(app);


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

app.listen(port, ipaddress);
console.log('Server is Up and Running at Port : ' + 4444);

module.exports = app;
