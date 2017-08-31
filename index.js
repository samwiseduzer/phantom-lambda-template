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
					if (err) return console.error(err);
					files.forEach(file => {
						console.log('./node_modules/phantomjs-prebuilt/lib/' + file);
					});
					fs.readdir('./node_modules/phantomjs-prebuilt/lib/phantom', (err, files) => {
						if (err) return console.error(err);
						files.forEach(file => {
							console.log('./node_modules/phantomjs-prebuilt/lib/phantom/' + file);
						});
						fs.readdir('./node_modules/phantomjs-prebuilt/lib/phantom/bin', (err, files) => {
							if (err) return console.error(err);
							files.forEach(file => {
								console.log('./node_modules/phantomjs-prebuilt/lib/phantom/bin' + file);
							});
							generator.test();
						});
					});
				});
			});
		});
	});
};
