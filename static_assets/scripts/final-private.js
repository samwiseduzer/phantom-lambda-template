//# sourceURL=dynamicScript.js
$(document).ready(function() {
	var submissionGroups = $('.page.first');
	submissionGroups.each(function() {
		$(this).addClass('trial-page');
		splitIntoPages($(this));
	});
	$('[title]').removeAttr('title');
	$('[img]').each(function() {
		if ($(this).attr('img'))
			$(this).before(
				$(
					'<div class="page img-page" ' +
						($(this).attr('larger') === 'width' ? 'wider' : 'taller') +
						'><img src="' +
						$(this).attr('img') +
						'"></div>'
				)
			);
	});
	$('.page[id]').each(function() {
		var id = $(this).attr('id');
		var extraContent = getExtraContent(id);
		$(this).append('<div class="contributor-name">' + extraContent.name + '</div>');
		$(this).append('<div class="contributor-text">' + extraContent.text + '</div>');
		addTopMarginForSecondContent(id);
	});
});

function getExtraContent(id) {
	return getPageGroup(id).content[1];
}

function getPageGroup(id) {
	return pageGroups.reduce(function(prev, curr) {
		if (prev) return prev;
		else if (curr.id === id) {
			return curr;
		} else {
			return false;
		}
	}, false);
}

function splitIntoPages(el) {
	var text = el.find('.contributor-text:nth-child(2)').html();
	var pages = +el.attr('num-pages');
	if (pages > 1) {
		truncate(16, function(truncatedText) {
			recursiveTruncate(2, pages, truncatedText);
		});
	}
	generatePage();

	function recursiveTruncate(pageNum, pages) {
		if (pageNum > pages) return;
		var id = stealId();
		$('.last').after(
			'<div class="trial-page page" id="' + id + '"><div class="contributor-text">' + text + '</div></div>'
		);
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
				generatePage();
				cb(text);
			}
		});
	}

	function generatePage() {
		var truncatedText = $('.trial-page > .contributor-text').html();
		var remainingText = text.replace(truncatedText, '');
		if (remainingText) {
			truncatedText = mungeTruncatedText(truncatedText, remainingText);
			text = text.replace(truncatedText, '').trim();
			$('.trial-page > .contributor-text').html(truncatedText.trim());
		}
		$('.last').removeClass('last');
		$('.trial-page').removeClass('trial-page').addClass('last');
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

function stealId() {
	var id = $('.last[id]').attr('id');
	$('.last[id]').removeAttr('id');
	return id;
}

function addTopMarginForSecondContent(id) {
	var pageGroup = getPageGroup(id);
	var PIXELS_PER_LINE = 26;
	var remainingLines = getRemainingLines(pageGroup.content);
	var margin = Math.floor(remainingLines / 2) * PIXELS_PER_LINE;
	$('#' + id + ' > .contributor-name').last().css('margin-top', margin);
}

function getRemainingLines(content) {
	var linesFromHeader =
		content[0].stats.numPages === 1 || (content[0].stats.numPages === 2 && content[0].img) ? 2 : 0;
	var remainingLinesSansSecondContent = 18 - linesFromHeader - content[0].stats.linesOnLastPage;
	var linesFromSecondContent = content[1].stats.linesOnLastPage;
	return remainingLinesSansSecondContent - linesFromSecondContent;
}
