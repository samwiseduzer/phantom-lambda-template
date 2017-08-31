const fs = require('fs'),
	base64 = require('base64url'),
	path = require('path'),
	base64Img = require('base64-img');

module.exports = function() {
	return new Promise((resolve, reject) => {
		const assets = {};
		embedLogos(assets)
			.then(embedFonts)
			.then(embedJSDeps)
			.then(embedStyles)
			.then(finalAssets => {
				resolve(finalAssets);
			})
			.catch(msg => reject(msg));
	});
};

function embedLogos(assets) {
	return new Promise((resolve, reject) => {
		base64Img.base64(path.join(__dirname, '../static_assets/images/GratbookLogo_Icon_White.png'), (err, data) => {
			if (err) return reject(err);
			assets.logo = data;
			resolve(assets);
		});
	});
}

function embedFonts(assets) {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(__dirname, '../static_assets/Fonts/avenir.ttf'), 'utf8', (err, data) => {
			if (err) return reject(err);
			assets.bigFont = 'Avenir';
			assets.bigFont64 = base64.toBase64(data);
			fs.readFile(path.join(__dirname, '../static_assets/Fonts/Bariol_Regular.otf'), 'utf8', (err, data) => {
				if (err) return reject(err);
				assets.font = 'Bariol_Regular';
				assets.font64 = base64.toBase64(data);
				resolve(assets);
			});
		});
	});
}

function embedJSDeps(assets) {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(__dirname, '../node_modules/trunk8/trunk8.js'), 'utf8', (err, data) => {
			if (err) return reject(err);
			assets.trunk8 = data;
			fs.readFile(path.join(__dirname, '../static_assets/scripts/test.js'), 'utf8', (err, data) => {
				if (err) return reject(err);
				assets.testJS = data;
				fs.readFile(path.join(__dirname, '../static_assets/scripts/final-public.js'), 'utf8', (err, data) => {
					if (err) return reject(err);
					assets.finalPublicJS = data;
					fs.readFile(
						path.join(__dirname, '../static_assets/scripts/final-private.js'),
						'utf8',
						(err, data) => {
							if (err) return reject(err);
							assets.finalPrivateJS = data;
							resolve(assets);
						}
					);
				});
			});
		});
	});
}

function embedStyles(assets) {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(__dirname, '../static_assets/styles/main.css'), 'utf8', (err, data) => {
			if (err) return reject(err);
			assets.mainCSS = data;
			fs.readFile(path.join(__dirname, '../static_assets/styles/test.css'), 'utf8', (err, data) => {
				if (err) return reject(err);
				assets.testCSS = data;
				fs.readFile(path.join(__dirname, '../static_assets/styles/final.css'), 'utf8', (err, data) => {
					if (err) return reject(err);
					assets.finalCSS = data;
					fs.readFile(path.join(__dirname, '../static_assets/styles/cover.css'), 'utf8', (err, data) => {
						if (err) return reject(err);
						assets.coverCSS = data;
						resolve(assets);
					});
				});
			});
		});
	});
}
