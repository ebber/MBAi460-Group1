//
// This is an Express server-side program that runs as a web app
// inside a web server. Express allows us to get an API --- a set 
// of functions --- up and running quickly as a web service using 
// JavaScript.
//
// Reference: https://expressjs.com/
//

const express = require("express");
const app = express();
//
// if running in cloud use environment variable to obtain port, 
// otherwise default to port 8080:
//
const PORT = process.env.PORT || 8080;

// 
// main() for the node.js app:
//
app.listen(PORT, () => {
  console.log(`**SERVER: web service running, listening on port ${PORT}...`);
});

//
// Function: "/"
//
app.get("/", (request, response) => {
  console.log("**SERVER: call to /");

  response.send("<HTML><body><H3>Home page is empty, we are a calculator service!</H3></body></HTML>");
});

//
// API functions:
//

// increment x:
app.get("/incr/:x", (request, response) => {

  try {
    console.log("**SERVER: call to /incr");
    let x = parseInt(request.params.x);
    if (isNaN(x))
      throw new Error("expecting a numeric value for x");

    console.log(`received: ${x}`);

    let y = x + 1;

    console.log(`responding with: ${y}`);
    response.send(y.toString());

    console.log("**DONE");
    return;
  }
  catch(err) {
    console.log(`**ERROR: "${err.message}"`);
    response.status(400).send(err.message);  // 400 => bad request
  }
});


// add x and y:
app.get("/add/:x/:y", (request, response) => {

  response.send("TODO");

  return;
});




