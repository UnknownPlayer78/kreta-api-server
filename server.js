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

kreta_api.fetch();
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

app.get("/api/v1/notes", (req, res) => {
  let data = kreta_api.user_data;
  data = server_api.get_notes(data);

  res.send(data);
});

app.get("/api/v1/absences", (req, res) => {
  let data = kreta_api.user_data;
  data = server_api.get_absences(data);

  res.send(data);
});

app.get("/api/v1/averages", (req, res) => {
  let precise = false;
  if (req.query.precise == 1) {
    precise = true;
  }

  let data = kreta_api.user_data;
  data = server_api.get_averages(data, precise);

  res.send(data);
});


let server = app.listen(8080, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log(`KRETA API Server listening at http://${host}:${port}`);
});