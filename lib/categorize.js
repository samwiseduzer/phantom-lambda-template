const lo = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	pug = require('pug'),
	PDF = require('./pdf'),
	sizeOf = require('image-size'),
	url = require('url'),
	request = {
		http: require('http'),
		https: require('https')
	},
	compiledTestPug = pug.compileFile(path.join(__dirname, '../static_assets/templates/test.pug'));

module.exports = categorizeContributions;

function categorizeContributions(order, assets) {
	//update order.numPages to 3 + contribution pages
	return new Promise((resolve, reject) => {
		console.log('begin categorize...');
		try {
			const contributionSizeMap = {};
			const promises = [];
			order.contributions.forEach(contribution => {
				promises.push(categorizeContribution(contribution, order, assets));
			});
			Promise.all(promises).then(results => {
				results.forEach(contribution => {
					contributionSizeMap[contribution.stats.numPages] =
						contributionSizeMap[contribution.stats.numPages] || [];
					contributionSizeMap[contribution.stats.numPages].push(contribution);
				});
				resolve({
					sizeMap: contributionSizeMap,
					contributions: order.contributions,
					order: order,
					assets: assets
				});
			});
		} catch (e) {
			reject(e);
		}
	});
}

function categorizeContribution(contribution, order, assets) {
	return new Promise((resolve, reject) => {
		try {
			console.log('begin categorize (categorizeContribution)...');
			const html = compiledTestPug({
				contribution: contribution,
				assets: assets
			});
			// createHtml(html, contribution.name); // debugging purposes only
			getStats(contribution, html).then(stats => {
				contribution.stats = {};
				contribution.stats.numPages = stats.numPages + (contribution.img ? 1 : 0);
				contribution.stats.lines = stats.lines;
				contribution.stats.linesOnLastPage = stats.linesOnLastPage;
				if (contribution.img) {
					request[contribution.img.slice(0, 5) === 'https' ? 'https' : 'http'].get(
						url.parse(contribution.img),
						function(response) {
							const chunks = [];
							response
								.on('data', function(chunk) {
									chunks.push(chunk);
								})
								.on('end', function() {
									const buffer = Buffer.concat(chunks);
									const dimensions = sizeOf(buffer);
									contribution.larger = dimensions.height > dimensions.width ? 'height' : 'width';
									resolve(contribution);
								});
						}
					);
				} else {
					resolve(contribution);
				}
			});
		} catch (e) {
			console.error(e);
			reject(e);
		}
	});
}

function getStats(contribution, html) {
	return new Promise((resolve, reject) => {
		console.log('begin categorize (getStats)...');
		PDF.create(html, path.join(__dirname, `../results/test_${contribution.name}.pdf`))
			.then(PDF.parse)
			.then(PDF.remove)
			.then(data => {
				const stats = parsePDFStats(data.data.formImage.Pages[data.data.formImage.Pages.length - 1]);
				resolve(stats);
			})
			.catch(err => reject(err));
	});
}

function parsePDFStats(statsPage) {
	console.log('begin categorize (parsePDFStats)...');
	const texts = statsPage.Texts;
	const yCoordsMap = {};
	const statsArr = [];

	texts.forEach(textNode => {
		yCoordsMap[textNode.y] = yCoordsMap[textNode.y] || '';
		yCoordsMap[textNode.y] += textNode.R[0].T;
	});

	Object.keys(yCoordsMap)
		.sort()
		.forEach(key => {
			const rawStr = yCoordsMap[key].replace('%3A', ':');
			statsArr.push(rawStr.split(':'));
		});

	const statsObj = statsArr.reduce((prev, curr) => {
		prev[curr[0]] = +curr[1];
		return prev;
	}, {});

	return statsObj;
}

function createHtml(text, name) {
	fs.writeFile(path.join(__dirname, `../dev/html/test_${name}.html`), text, 'utf8', (err, data) => {
		if (err) console.error(err);
	});
}
