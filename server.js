var express = require('express');
var https = require('https');
var http = require('http');
var app = express();
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var fs = require('fs');
var port = parseInt(process.env.PORT, 10) || 4567;
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

http.createServer(app).listen(port+1);
https.createServer(options, app).listen(port+10);

var rawData = '{"-JafZf5-ixZyCBI1s7F8":{"completed":true,"id":"-JafZf5-ixZyCBI1s7F8","order":0,"title":"Learn Backbone"},"-JafZfpzEmIMFNlonz1E":{"completed":true,"id":"-JafZfpzEmIMFNlonz1E","order":0,"title":"Learn Firebase"},"-JajzjTWgx07LxO2YQ72":{"completed":true,"id":"-JajzjTWgx07LxO2YQ72","order":0,"title":"Make another todo"},"-JbJ8FZ6LzQOLrunqPsl":{"completed":true,"id":"-JbJ8FZ6LzQOLrunqPsl","order":0,"title":"Launch new version"},"-JbXi2KDkTg2PFRCOp7e":{"completed":false,"id":"-JbXi2KDkTg2PFRCOp7e","order":0,"title":"hi"}}';

var data = JSON.parse(rawData);
var dataArray = Object.keys(data).map(function(key) {
  return data[key];
});

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}


app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/app'));
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));
app.use(allowCrossDomain);

app.get("/", function (req, res) {
  res.redirect("/index.html");
});

app.get('/todos', function (req, res) {
  res.json(dataArray);
});

app.post('/todos', function(req, res) {
  dataArray.push(req.body);
  return res.json(dataArray);
});

console.log("Simple static server listening at http://localhost:" + (port + 1));
app.listen(port);