var AWS = require('aws-sdk'),
	generator = require('./generator.js');

exports.handler = function(event, context, callback) {
	generator.test();
};
