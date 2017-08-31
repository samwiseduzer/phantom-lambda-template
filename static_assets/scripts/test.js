//# sourceURL=dynamicScript.js
$(document).ready(function() {
	init();
});

function init() {
	var name = $('#name').html();
	var text = $('#text').html();
	$('#name').remove();
	$('#text').remove();
	$('body').append($('<div class="trial-page first">'));
	$('.trial-page').append($('<h2 class="contributor-name">' + name + '</h2>'));
	$('.trial-page').append($('<p class="contributor-text">' + text + '</p>'));
	var lines = $('.contributor-text').height() / 27;
	var pages = lines <= 16 ? 1 : 1 + Math.ceil((lines - 16) / 17);
	if (pages > 1) {
		truncate(16, function(truncatedText) {
			recursiveTruncate(2, pages, truncatedText);
		});
	}
	onPageGen();
	genStats(lines, pages);

	function recursiveTruncate(pageNum, pages) {
		if (pageNum > pages) return;
		$('body').append('<div class="trial-page"><div class="contributor-text">' + text + '</div></div>');
		truncate(18, function(truncatedText) {
			recursiveTruncate(++pageNum, pages);
		});
	}

	//returns truncated text
	function truncate(num, cb) {
		$('.trial-page > .contributor-text').trunk8({
			lines: num,
			fill: '',
			onTruncate: function() {
				onPageGen();
				cb(text);
			}
		});
	}

	function onPageGen() {
		var truncatedText = $('.trial-page > .contributor-text').html();
		var remainingText = text.replace(truncatedText, '');
		truncatedText = mungeTruncatedText(truncatedText, remainingText);
		text = text.replace(truncatedText, '').trim();
		$('.trial-page > .contributor-text').html(truncatedText.trim());
		$('.trial-page').removeClass('trial-page').addClass('page');
	}
}

function getLinesOnLastPage(lines, pages) {
	if (pages === 1) {
		return lines;
	} else {
		return 18 - ((pages - 1) * 18 + 16 - lines);
	}
}

function mungeTruncatedText(truncText, remainingText) {
	if (remainingText.indexOf(' ') !== -1) {
		if (remainingText[0].trim()) {
			//some character exists at front of string
			truncText = truncText.split(' ').slice(0, -1).join(' ');
		}
	}
	return truncText;
}

function genStats(lines, pages) {
	$('body').append(
		$(
			'<div class="page trial-page">' +
				'<p id="line-count"> lines: ' +
				lines +
				'</p>' +
				'<p id="page-count"> numPages: ' +
				pages +
				'</p>' +
				'<p id="last-page-line-count"> linesOnLastPage: ' +
				getLinesOnLastPage(lines, pages) +
				'</p>' +
				'</div>'
		)
	);
}
