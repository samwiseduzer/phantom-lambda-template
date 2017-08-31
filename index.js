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
			fs.readdir('./node_modules/phantomjs-prebuilt', (err, files) => {
				files.forEach(file => {
					console.log('./node_modules/phantomjs-prebuilt/' + file);
				});
				fs.readdir('./node_modules/phantomjs-prebuilt/lib', (err, files) => {
					files.forEach(file => {
						console.log('./node_modules/phantomjs-prebuilt/lib/' + file);
					});
					fs.readdir('./node_modules/phantomjs-prebuilt/phantom', (err, files) => {
						files.forEach(file => {
							console.log('./node_modules/phantomjs-prebuilt/phantom/' + file);
						});
						fs.readdir('./node_modules/phantomjs-prebuilt/phantom/bin', (err, files) => {
							files.forEach(file => {
								console.log('./node_modules/phantomjs-prebuilt/phantom/bin' + file);
							});
							generator.test();
						});
					});
				});
			});
		});
	});
};
