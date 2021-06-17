(function(WIN, DOC) {
	'use strict';

	// html.js-enabled 付与
	var docElm = DOC.documentElement;

	if (docElm && docElm.nodeType === 1) {
		docElm.classList.add('js-enabled');
	}
}(window, document));
