const passport = require('passport');

require('./passport-google');
require('./passport-facebook');
require('./passport-apple');

module.exports = passport;