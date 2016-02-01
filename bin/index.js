#! /usr/bin/env node

const HttpsServer = require('@panosoft/https-server');
const path = require('path');
const routes = require('../lib/routes');

const packageFilename = path.resolve(__dirname, '../package.json');
HttpsServer.cli(packageFilename, routes);
