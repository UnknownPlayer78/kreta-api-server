const axios = require('axios').default;
var qs = require('querystring');

function log(type, msg) {
  let d = new Date();
  let date = d.toISOString().replace("T", " ").replace("Z", "");

  console.log(`[${date}] [${type.toUpperCase()}] ${msg}`);
}

class Kreta {
  constructor({ institute_code, username, password }) {
    this.useragent = "Kreta.Ellenorzo/2.9.11.2020033003"
    this.institute_code = institute_code;
    this.username = username;
    this.password = password;

    this.endpoints = {
      "login": "/idp/api/v1/Token",
      "user": "/mapi/api/v1/Student"
    }
  }

  async get(path) {
    let res = await axios.get(`https://${this.institute_code}.e-kreta.hu${path}`,
      { headers: { 'User-Agent': this.useragent, 'Authorization': `Bearer ${this.token}` } })
      .catch(e => {
        log("error", e.toString());
        return '';
      });

    return res.data;
  }

  async post(path, data) {
    let res = await axios.post(`https://${this.institute_code}.e-kreta.hu${path}`, data,
      { headers: { 'User-Agent': this.useragent, 'Authorization': `Bearer ${this.token}` } })
      .catch(e => {
        log("error", e.toString());
        return '';
      });

    return res.data;
  }

  async login() {
    let data = qs.stringify({
      'password': this.password,
      'institute_code': this.institute_code,
      'grant_type': 'password',
      'client_id': '919e0c1c-76a2-4646-a2fb-7085bbbf3c56',
      'userName': this.username
    });

    let res = await this.post(this.endpoints.login, data);
    if (res) {
      this.token = res.access_token;
      log("info", "Logged in successfully.");
    } else {
      log("error", "Failed to log in");
    }
  }

  async fetch() {
    await this.login();

    this.user_data = await this.get_user_data();
  }

  async get_user_data() {
    let res = await this.get(this.endpoints.user);
    if (res) {
      log("info", "GET user data successful");
      return res;
    } else {
      log("error", "GET user data failed")
    }
  }
}

exports.backend = Kreta;
exports.log = log;