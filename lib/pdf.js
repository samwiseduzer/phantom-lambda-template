const PDFParser = require('pdf2json'),
	pdf = require('html-pdf'),
	fs = require('fs'),
	path = require('path'),
	config = {
		height: '8in',
		width: '8in'
		// phantomPath: './node_modules/html-pdf/node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs'
	};

module.exports = {
	create: create,
	parse: parse,
	remove: remove
};

function create(html, path) {
	return new Promise((resolve, reject) => {
		try {
			pdf.create(html, config).toFile(path, function(err, res) {
				if (err) {
					fs.stat(path, function(err2, stat) {
						if (stat && stat.isFile()) {
							resolve(path);
						} else {
							reject(err);
						}
					});
				} else {
					resolve(path);
				}
			});
		} catch (e) {
			reject(e);
		}
	});
}

function parse(path) {
	return new Promise((resolve, reject) => {
		const pdfParser = new PDFParser();
		pdfParser.on('pdfParser_dataReady', function(data) {
			console.log('successfully parsed...');
			resolve({ path: path, data: data });
		});
		console.log('parsing pdf at path: ' + path);
		pdfParser.loadPDF(path);
	});
}

function remove(input) {
	return new Promise((resolve, reject) => {
		console.log('removing pdf...');
		fs.unlink(typeof input === 'String' ? input : input.path, err => {
			resolve(input);
		});
	});
}
