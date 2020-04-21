#!/usr/bin/env node

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require("fs");
const { backend, log } = require('./src/backend');
const pkg = require("./package.json");
const { api } = require('./src/api');


app.use(bodyParser.urlencoded({ extended: true }));

conf = fs.readFileSync("./credentials.json");
conf = JSON.parse(conf);

const kreta_api = new backend(conf);
const server_api = new api();

setInterval(() => {
  kreta_api.fetch();
}, 60000)

app.get('/api/v1/fetch', (req, res) => {
  kreta_api.fetch();
  res.end();
});

app.get('/api/v1/about', (req, res) => {
  res.send("KRETA API Server " + pkg.version);
});

app.get('/api/v1/user', (req, res) => {
  let data = kreta_api.user_data;
  data = server_api.get_user_info(data);

  res.send(data);
});

app.get('/api/v1/evaluations', (req, res) => {
  let data = kreta_api.user_data;
  data = server_api.get_evaluations(data);

  res.send(data);
});


var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log(`KRETA API Server listening at http://${host}:${port}`);
});