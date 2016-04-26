// server.js

var express = require('express'),
jade = require('jade'),
path = require('path'),
app = express(),
port = 4444,
bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//var passport = require('passport'),
//Strategy = require('passport-local').Strategy,
var expressSession = require('express-session');


 app.use(cookieParser());
// app.use(require('express-session')({ secret: 'keyboard-cat', resave: false, saveUninitialized: false }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use(expressSession({secret : 'ada231sdkwkqw124kcmkcms1', cookieName : 'mycookie'}));
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));

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
//app.use('/signup', signup);


//Route not found -- Set 404
app.get('*', function(req, res) {
    res.json({
        'route': 'Sorry this page does not exist!'
    });
});

app.listen(port);
console.log('Server is Up and Running at Port : ' + port);

module.exports = app;
