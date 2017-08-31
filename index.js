var AWS = require('aws-sdk'),
	generator = require('./generator.js');

exports.handler = function(event, context, callback) {
	const fs = require('fs');

	fs.readdir('./', (err, files) => {
		files.forEach(file => {
			console.log(file);
		});
		fs.readdir('./node_modules', (err, files) => {
			files.forEach(file => {
				console.log('./node_modules/' + file);
			});
			fs.readdir('./node_modules/html-pdf', (err, files) => {
				files.forEach(file => {
					console.log('./node_modules/html-pdf/' + file);
				});
				generator.test();
			});
			generator.test();
		});
	});
};
