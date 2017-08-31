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
});

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
		$('.last').after('<div class="trial-page page"><div class="contributor-text">' + text + '</div></div>');
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
