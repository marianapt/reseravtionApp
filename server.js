// Dependencies
// =============================================================
var express       = require("express");
var bodyParser    = require("body-parser");
var path          = require("path");
var twilio        = require('twilio');

const Reservation = require('./Reservation')

// Set up Twillo
// =============================================================
var accountSid = 'AC500c53a6560908ce75907dc5e14e75eb'; // Your Account SID from www.twilio.com/console
var authToken = '300acbb52b21a6e0e722e4328c5eb7d9';   // Your Auth Token from www.twilio.com/console
var client = new twilio(accountSid, authToken);

// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Routes
// =============================================================

var pages = ["", "reserve", "tables", "404"];

// Web server routes
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/reserve", function(req, res) {
  res.sendFile(path.join(__dirname, "reserve.html"));
});

app.get("/tables", function(req, res) {
  res.sendFile(path.join(__dirname, "tables.html"));
});

app.get("/:page", function (req, res) {
  res.sendFile(path.join(__dirname, "404.html"));
});


// Logic
// =============================================================
var Table = function(tableNumber) {
  return {
    tableNumber,
    seats:5
  }
}

//limited to 5
var tablelist = [];
var waitlist = [];

function addReservation(reserv) {
  if (tablelist.length > 4) {
    waitlist.push(reserv);
  } else {
    tablelist.push(reserv);
  }
}

function sendSMS(body, toPhone) {
  return new Promise(function(resolve, reject) {
    console.log("sending "+body+" to "+toPhone);
      client.messages.create({
          body: body,
          to: '+' + toPhone,  // Text this number
          from: '+18302132871' // From a valid Twilio number
      }).then(msg => {
        console.log(msg.sid);
        resolve(msg.sid)
      });
  });
}

// api GET table list
app.get("/api/tables", function(request, response) {
  response.json(tablelist);
});

// api POST new reservation
app.post("/api/new", function(req, res) {
  console.log(req.body);
  addReservation(req.body);
  res.send(req.body);
});

// api GET waitlist
app.get("/api/waitlist", function(req, res) {
  res.json(waitlist);
});

app.post("/api/sms", function(req, res) {
  // res.json(req.body.msg, req.body.toPhone)
  sendSMS(req.body.msg, req.body.toPhone).then( resp => {
    console.log("sent!");
    res.end(resp);
  })
});

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});
