var Twit = require('twit');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var sentiment = require('sentiment');

var databaseUrl = "localhost:27017";
var collections = ["tweets"];
var db = require("mongojs").connect(databaseUrl, collections);

var semiFinalTags = ['Cup', 'World', 'fifa', '#WorldCup', '#FIFA', 'Brazil', 'Netherlands', 'Holland', '#BRA', '#NED'];

var T = new Twit({
	consumer_key: '5PH1JMUsGzHpMiTcBnfhv22C0',
	consumer_secret: 'jCH5uAaX7PrtW9sWbuy8wpmC7v9O9Ym3oOiL3acr1Qss9Zq7E9',
	access_token: '2581695344-TTeFtedQILvREUmP5bD7w7sUVcOeOv5sDhn7Dsf',
	access_token_secret: 'mq0D9cKuLjHeV9S7Gn20bdvcJoF3OPDjK2Dxiz5APhG6T'
	});

app.get('/', function(req, res){
	res.sendfile('index.html');
});

io.on('connection', function(socket) {
	console.log("user connected");
	socket.on('trackWordSubmitted', function(trackWord) {
		console.log("start tracking: " + trackWord);
		var stream = T.stream('statuses/filter', { track: trackWord });
		stream.on('tweet', function(tweet) {
			if(tweet.coordinates) {
				db.tweets.save(tweet, function(error, saved) {
				});
				var locationData = {};
				locationData.lat = tweet.coordinates.coordinates[1];
				locationData.lng = tweet.coordinates.coordinates[0];
				locationData.sentiment = sentiment(tweet.text).score;
				io.sockets.emit('tweet', locationData);
			}
		});
	});
});

http.listen(3000, function(){
	console.log("Listening on port 3000");
});


