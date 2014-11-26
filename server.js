var express = require("express"),
    app = express(),
    bodyParser = require('body-parser')
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    port = parseInt(process.env.PORT, 10) || 4567;

var data = [
  {title: "Go to movie", importance: 1},
  {title: "Eat pizza", importance: 1}
];

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

app.get("/", function (req, res) {
  res.redirect("/index.html");
});

app.get('/todos', function (req, res) {
  res.json(data);
});

app.post('/todos', function(req, res) {
  data.push(req.body);
  return res.json(data);
});

console.log("Simple static server listening at http://localhost:" + port);
app.listen(port);