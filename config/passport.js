const passport = require('passport');

require('./passport-google');
require('./passport-facebook');
require('./passport-apple');
require('./passport-local')

module.exports = passport;