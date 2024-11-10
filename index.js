"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
dotenv.config();
var apiUrl = process.env.MICROSERVICE_URL;
console.log(apiUrl);
