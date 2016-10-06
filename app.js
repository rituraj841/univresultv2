var express = require('express');
var session = require('express-session');
var hbars = require('express-handlebars');
var chalk = require('chalk');
bodyparser = require('body-parser');
var db = require('./models/db.js');  // db.js must be required before routes.js
var routes = require('./routes/routes.js');
var app = express();


app.use(express.static(__dirname + "/public"));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use(session({secret: "secret",  resave : true,  saveUninitialized : false}));
app.set('view engine', 'handlebars');
app.engine('handlebars', hbars({}));

//Protecting application from unauthenticated users :: BEGIN
app.all('*', function(req, res, next){
	console.log(req.path);
	if (req.session.authenticated){
		console.log("You are already authenticated.");
		next();
	}else {
		if ((req.path === "/") 
			|| (req.path === "/authenticate")
			|| (req.path === "/registerForm")
			|| (req.path === "/register")
			){
			console.log("You are going through the auth process.");
			next();
		}else  {
			console.log("You need to login.");
			res.redirect('/');
		}
	}	
	
});
//Protecting application from unauthenticated users :: END

app.get('/', routes.loginFormHandler);
app.post('/authenticate', routes.authHandler);
app.get('/logout', routes.logoutHandler);
app.get('/registerForm', routes.registerFormHandler);
app.post('/register', routes.registerUserHandler);

app.get('/resultform', routes.resultFormHandler);
app.post('/resultpage', routes.resultHandler);
app.post('/marksEntry',routes.marksEntry);
app.get('/marksentryform', routes.marksEntryForm);
app.get('/crosslist', routes.crosslistHandler);
app.get('/delete', routes.deleteHandler);
app.get('/edit', routes.editPageHandler);
app.post('/saveChanges', routes.saveChangesHandler);


app.use("*", function(req, res) {
     res.status(404);
     res.render('404.handlebars', {});
});

app.use(function(error, req, res, next) {
     console.log('Error : 500::' + error);
     res.status(500);
     res.render('500.handlebars', {err:error});  // good for knowledge but don't do it
});


var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log('HTTP server is listening on port: ' + port);
});