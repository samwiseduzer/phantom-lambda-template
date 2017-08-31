var AWS = require('aws-sdk'),
	generator = require('./generator.js');

exports.handler = function(event, context, callback) {
	const fs = require('fs');

	fs.readdir('./', (err, files) => {
		files.forEach(file => {
			console.log(file);
		});
		generator.test();
	});
};
