var R = require('ramda');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync('./config.json'));
var twitterConfig = config.twitter;
console.log(twitterConfig);
var twitter = new (require("twit"))(twitterConfig);

var hashtags = ["adamiced1", "adamiced2", "adamiced3", "adamiced4"];
var props = {
  "track": R.reduce(function(acc, next) {
    next = "#" + next;
    if (R.isEmpty(acc))
      return next;
    else
      return acc + " " + next;
  }, "", hashtags)
};

var tweetstream = twitter.stream("user", props);

var votes = {};

tweetstream.on('connect', function() {
  console.log("CONNECT");
});

tweetstream.on('connected', function() {
  console.log("CONNECTED");
});

tweetstream.on('reconnect', function() {
  console.log("RECONNECT");
});

tweetstream.on('disconnect', function(disconnectMessage) {
  // TODO : handle gracefully
  console.log("DISCONNECT");
  console.log(disconnectMessage);
});

tweetstream.on('error', function(err) {
  // TODO : handle error gracefully
  console.log("ERROR");
  console.log(err);
});

tweetstream.on('tweet', function(tweet) {
  console.log("TWEET");
  var tag = R.reduce(function(acc, next) {
    if (R.isEmpty(acc) && R.contains(next.text, hashtags))
      return next.text;
    else if (R.contains(next.text, hashtags))
      return "";
    else
      return acc;
  }, "", tweet.entities.hashtags);
  if (!R.has(tag, votes))
    votes[tag] = 1;
  else
    votes[tag]++;
  console.log(tag);
});

var app = require("koa")();

app.use(require("koa-logger")());
app.use(require("koa-router")(app));

app.get("/", function *(next) {
  var pair = R.maxBy(R.nth(1), R.toPairs(votes));
  console.log(pair);
  if (pair)
    this.body = JSON.stringify(hashtags.indexOf(pair[0]));
  else
    this.body = "-1";
});

app.get("/resetVotes", function *(next) {
  var pair = R.maxBy(R.nth(1), R.toPairs(votes));
  console.log(pair);
  if (pair)
    this.body = JSON.stringify(hashtags.indexOf(pair[0]));
  else
    this.body = "-1";
  console.log("Resetting votes");
  votes = {};
});

app.listen(3000);
