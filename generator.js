const lo = require('lodash'),
	Categorize = require('./lib/categorize'),
	Embed = require('./lib/embed'),
	Organize = require('./lib/organize'),
	Publish = require('./lib/publish');

function test() {
	const testOrder = require('./dev/dummyData').data;
	genBatch([testOrder]);
	// genBatch([testOrder, testOrder, testOrder]);
}

function handler(event, context, cb) {
	console.log('event: ', event);
	const request = JSON.parse(event.body);
	console.log('request: ', request);
}

function genBatch(orders) {
	console.log('begin embedding...');
	Embed().then(assets => {
		console.log('begin orders...');
		orders.forEach(order => {
			gen(order, assets);
		});
	});
}

function gen(order, assets) {
	Categorize(order, assets)
		.then(Organize)
		.then(Publish)
		.then(result => console.log('RESULT:', result))
		.catch(err => console.error('ERROR:', err));
}

module.exports = {
	test: test,
	handler: handler
};
