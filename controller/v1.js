/**
 * New node file
 */

var app = require("express")();
app.use(require('./login'));
app.use(require('./import'));

module.exports = app;
