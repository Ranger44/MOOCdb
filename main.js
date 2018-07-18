/*  
    Uses express, dbcon for database connection, body parser to parse form data 
    handlebars for HTML templates  
*/
var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);
app.use('/', express.static('public'));
app.use('/course', require('./course.js'));
app.use('/language', require('./language.js'));
app.use('/topic', require('./topic.js'));
app.use('/company', require('./company.js'));
app.use('/timeUnit',require('./timeUnit.js'));
app.use('/course_topic',require('./course_topic.js'));
app.use('/course_language',require('./course_language.js'));
//app.use('/search_topic', require('./search_topic.js'));

/*
app.get('/language',function(req,res) {
	res.render('language');
});
*/
/*
app.get('/company',function(req,res) {
	res.render('company');
});
*/
/*
app.get('/timeUnit',function(req,res) {
	res.render('timeUnit');
});
/*
app.get('/topic',function(req,res) {
	res.render('topic');
});
*/
/*
app.get('/course_language',function(req,res) {
	res.render('course_language');
});

app.get('/course_topic',function(req,res) {
	res.render('course_topic');
});
*/
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
