const pug = require('pug'),
	path = require('path'),
	publicPug = pug.compileFile(path.join(__dirname, '../static_assets/templates/final-public.pug')),
	privatePug = pug.compileFile(path.join(__dirname, '../static_assets/templates/final-private.pug')),
	lo = require('lodash'),
	uuid = require('uuid'),
	PDF = require('./pdf');

module.exports = function(finalOrder) {
	return new Promise((resolve, reject) => {
		console.log('begin publish...');
		finalOrder.pages.forEach(page => {
			if (page.content.length > 1) {
				page.id = uuid();
			}
		});

		const privateHTML = privatePug({
			order: finalOrder.order,
			pageGroups: finalOrder.pages,
			assets: finalOrder.assets,
			uuid: uuid
		});
		const publicHTML = publicPug({
			order: finalOrder.order,
			pageGroups: finalOrder.order.contributions.filter(c => !c.private),
			assets: finalOrder.assets,
			uuid: uuid
		});

		// createHtml(privateHTML, `${finalOrder.order.name}_private`);
		// createHtml(publicHTML, `${finalOrder.order.name}_public`);

		const privatePromise = PDF.create(
			privateHTML,
			path.join(__dirname, `../results/${finalOrder.order.name}_private_${finalOrder.order.bookId}.pdf`)
		).catch(err => reject(err));

		const publicPromise = PDF.create(
			publicHTML,
			path.join(__dirname, `../results/${finalOrder.order.name}_public_${finalOrder.order.bookId}.pdf`)
		).catch(err => reject(err));

		Promise.all([privatePromise, publicPromise])
			.then(results => {
				console.log(results);
				//store private to printing s3 bucket
				//store public to email s3 bucket (putting public in s3 bucket triggers email)
				//remove PDFs from results
				//save addresses in db
				//when printing shop POSTs done, delete private PDF
			})
			.catch(err => console.error(err));
	});
};

function createHtml(text, name) {
	require('fs').writeFile(path.join(__dirname, `./dev/html/test_${name}.html`), text, 'utf8', (err, data) => {
		if (err) return console.error(err);
		console.log(`Finished: ${name}`);
	});
}
