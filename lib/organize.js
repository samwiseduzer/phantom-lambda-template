const lo = require('lodash');

module.exports = function(data) {
	return new Promise((resolve, reject) => {
		console.log('begin organize...');
		try {
			const ends = getExtremeContributions(data);
			const bodyShape = getMainBodyShape(ends);
			const pages = getPageOrder(data, bodyShape, ends);
			resolve({ pages: pages, order: data.order, assets: data.assets });
		} catch (e) {
			reject(e);
		}
	});
};

function getExtremeContributions(data) {
	//adjust for first contribution - if it has an img, it will be on the left side of first page, else it begins on right side
	return {
		first: getFirstContribution(data),
		last: getLastContribution(data)
	};

	function getFirstContribution(data) {
		return getExtremeContribution('first', data);
	}

	function getLastContribution(data) {
		return getExtremeContribution('last', data);
	}

	//first || last
	function getExtremeContribution(pos, data) {
		const contribution = data.contributions.reduce(
			(prev, curr) => (prev ? prev : data.order[`${pos}Id`] && curr.id === data.order[`${pos}Id`] ? curr : prev),
			null
		);
		return contribution;
	}
}

function getMainBodyShape(ends) {
	const postStartSide = ends.first && isOdd(ends.first.stats.numPages) ? 'left' : 'right';
	const lastStartSide = ends.last ? (ends.last.img && isOdd(ends.last.stats.numPages) ? 'left' : 'right') : 'either';
	const pageDivisibility = lastStartSide === 'either' ? 'either' : postStartSide === lastStartSide ? 'even' : 'odd';
	return {
		postStartSide: postStartSide,
		lastStartSide: lastStartSide,
		pageDivisibility: pageDivisibility
	};
}

function getPageOrder(data, bodyShape, ends) {
	const contributions = getContributionsSansEnds(data.contributions, ends);
	//throw everything besides ends into page groups
	const collapsedGroups = collapseContributions(contributions);
	//divide page groups into even/odd
	const pageGroupsByDivisibility = {
		even: collapsedGroups.filter(
			group => (!group.hasImg || (group.hasImg && group.numPages !== 2)) && isEven(group.numPages)
		),
		odd: collapsedGroups.filter(group => isOdd(group.numPages)),
		twoPageImgs: collapsedGroups.filter(group => group.hasImg && group.numPages === 2)
	};
	//find windows for twoPageImgs
	const twoPageImgWindows = getTwoPageImgWindows(pageGroupsByDivisibility, bodyShape.postStartSide);
	const finalShape = getFinalShape(pageGroupsByDivisibility, bodyShape.postStartSide, twoPageImgWindows);
	let bodyOrder = getRandomOrder(finalShape, pageGroupsByDivisibility);
	return addEndsToBody(ends, bodyOrder);
}

function getContributionsSansEnds(contributions, ends) {
	return contributions
		.slice(0)
		.filter(c => ![ends.first ? ends.first.id : null, ends.last ? ends.last.id : null].includes(c.id));
}

function collapseContributions(contributions) {
	const groups = [];

	const lessThanPageContributions = contributions
		.filter(entry => entry.stats.numPages === 1 && entry.stats.lines < 16)
		.map(entry => lo.assign({}, entry, { linesRemaining: remainingLines(entry) }))
		.sort((entry1, entry2) => entry2.stats.linesOnLastPage - entry1.stats.linesOnLastPage);

	const roomyMultiPageContributions = contributions
		.filter(
			entry =>
				(entry.stats.numPages === 2 && entry.img && entry.stats.linesOnLastPage < 13) ||
				(entry.stats.numPages > 1 && entry.stats.linesOnLastPage < 18)
		)
		.map(entry => lo.assign({}, entry, { linesRemaining: remainingLines(entry) }))
		.sort((entry1, entry2) => entry1.linesRemaining - entry2.linesRemaining);

	const allOtherContributions = contributions
		.filter(
			entry =>
				(entry.stats.numPages === 1 && entry.stats.lines >= 16) ||
				((entry.stats.numPages === 2 && entry.img && entry.stats.linesOnLastPage >= 13) ||
					(entry.stats.numPages > 1 && entry.stats.linesOnLastPage >= 18))
		)
		.map(entry => {
			({ content: [entry], numPages: entry.stats.numPages, hasImg: !!entry.img });
		});

	lessThanPageContributions.forEach(smallEntry => {
		let matched = false;
		for (let i = roomyMultiPageContributions.length - 1, bigEntry; i >= 0 && !matched; i--) {
			bigEntry = roomyMultiPageContributions[i];
			if (bigEntry.linesRemaining >= smallEntry.stats.lines) {
				groups.push({
					content: [bigEntry, smallEntry],
					numPages: bigEntry.stats.numPages,
					hasImg: !!bigEntry.img
				});
				roomyMultiPageContributions.splice(i, 1);
				matched = true;
			}
		}
		if (!matched) {
			roomyMultiPageContributions.push(smallEntry);
			roomyMultiPageContributions.sort((entry1, entry2) => entry1.linesRemaining - entry2.linesRemaining);
		}
	});

	const remainingContributions = roomyMultiPageContributions.map(entry => ({
		content: [entry],
		numPages: entry.stats.numPages,
		hasImg: !!entry.img
	}));

	return [...groups, ...remainingContributions, ...allOtherContributions];

	function remainingLines(entry) {
		//subtract two for name header
		if (entry.stats.numPages === 1 || (entry.stats.numPages == 2 && entry.img)) {
			return 16 - entry.stats.linesOnLastPage - 2;
		} else {
			return 18 - entry.stats.linesOnLastPage - 2;
		}
	}
}

function isEven(num) {
	return num % 2 === 0;
}

function isOdd(num) {
	return num % 2 === 1;
}

function getTwoPageImgWindows(groupsByDiv, startingSide) {
	let windowsCount = 0;
	if (startingSide === 'left') {
		windowsCount++;
		windowsCount += Math.floor(groupsByDiv.odd.length / 2);
	} else if (startingSide === 'right' && groupsByDiv.odd.length) {
		windowsCount += Math.ceil(groupsByDiv.odd.length / 2);
	}
	return windowsCount;
}

function getFinalShape(groupsByDiv, startSide, windows) {
	//get a list of strings ('even','odd','twoPageImgs') that dictate the order of the submissions
	const evens = groupsByDiv.even.map(() => 'even');
	const odds = groupsByDiv.odd.map(() => 'odd');
	const twoPageImgs = groupsByDiv.twoPageImgs.map(() => 'twoPageImgs');
	if (!windows) {
		return randomize([...evens, ...twoPageImgs]);
	} else {
		const oddBlocks = getOddBlocks(odds, startSide);
		const evenBlocks = getEvenBlocks(evens, twoPageImgs, windows);
		const order = zipBlocks(oddBlocks, evenBlocks, startSide);
		return lo.flattenDeep(order);
	}

	function randomize(arr) {
		return arr.sort(() => 0.5 - Math.random());
	}

	function zipBlocks(oddBlocks, evenBlocks, startSide) {
		if (startSide === 'left') {
			return zipStaggered(evenBlocks, oddBlocks);
		} else if (startSide === 'right') {
			return zipStaggered(oddBlocks, evenBlocks);
		}
		function zipStaggered(arr1, arr2) {
			const finalArr = [];
			for (let i = 0; i < (arr1.length > arr2.length ? arr1.length : arr2.length); i++) {
				if (i + 1 <= arr1.length) {
					finalArr.push(arr1[i]);
				}
				if (i + 1 <= arr2.length) {
					finalArr.push(arr2[i]);
				}
			}
			return finalArr;
		}
	}

	function getEvenBlocks(evens, twoPageImgs, windows) {
		const combined = randomize([...evens, ...twoPageImgs]);
		return splitIntoNLists(combined, windows);

		function splitIntoNLists(arr, n) {
			const lists = new Array(n);
			for (let i = 0; i < lists.length; i++) {
				lists[i] = [];
			}
			for (let i = 0; i < arr.length; i++) {
				lists[i % n].push(arr[i]);
			}
			return lists;
		}
	}

	function getOddBlocks(odds, startSide) {
		if (startSide === 'left') {
			const numOddBlocks = Math.ceil(odds.length / 2);
			const oddBlocks = [];
			for (let i = 0; i < numOddBlocks; i++) {
				oddBlocks.push(odds.length - i * 2 > 1 ? ['odd', 'odd'] : ['odd']);
			}
			return oddBlocks;
		} else if (startSide === 'right') {
			const numOddBlocks = 1 + Math.ceil((odds.length - 1) / 2);
			const oddBlocks = [['odd']];
			for (let i = 1; i < numOddBlocks; i++) {
				oddBlocks.push(odds.length - 1 - i * 2 > 1 ? ['odd', 'odd'] : ['odd']);
			}
			return oddBlocks;
		}
	}
}

function getRandomOrder(shape, groupsByDiv) {
	const groups = lo.cloneDeep(groupsByDiv);
	const finalOrder = [];
	shape.forEach(type => finalOrder.push(pluckRandomElement(groups[type])));
	return finalOrder;

	function pluckRandomElement(arr) {
		const randIdx = randNum(0, arr.length - 1);
		const el = arr[randIdx];
		arr.splice(randIdx, 1);
		return el;

		function randNum(min, max) {
			return Math.floor(Math.random() * (max + 1 - min) + min);
		}
	}
}

function addEndsToBody(ends, bodyOrder) {
	let overallOrder = bodyOrder;
	if (ends.first) {
		overallOrder = [
			...[
				{
					content: [ends.first],
					numPages: ends.first.stats.numPages,
					hasImg: !!ends.first.img,
					isFirst: true
				}
			],
			...bodyOrder
		];
	}
	if (ends.last) {
		overallOrder = [
			...overallOrder,
			...[
				{
					content: [ends.last],
					numPages: ends.last.stats.numPages,
					hasImg: !!ends.last.img,
					isLast: true
				}
			]
		];
	}
	return overallOrder;
}
