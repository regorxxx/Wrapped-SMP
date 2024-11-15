'use strict';
//22/07/24

/* exported wrappedMenu */

include('..\\..\\helpers\\helpers_xxx.js');
/* global MF_GRAYED:readable, VK_SHIFT:readable, VK_CONTROL:readable, isEnhPlayCount:readable, isPlayCount:readable, MF_STRING:readable */
include('..\\..\\helpers\\menu_xxx.js');
/* global _menu:readable  */
include('..\\..\\helpers\\helpers_xxx_prototypes.js');
/* global range:readable */
include('..\\..\\helpers\\helpers_xxx_input.js');
/* global Input:readable */
include('..\\..\\main\\spotify\\wrapped.js');
/* global wrapped:readable */
include('..\\..\\main\\playlist_manager\\playlist_manager_listenbrainz.js');
/* global listenBrainz:readable */

function wrappedMenu({ bSimulate = false } = {}) {
	if (bSimulate) { return wrappedMenu.bind({ buttonsProperties: this.buttonsProperties, prefix: this.prefix })(false); }
	// Settings
	if (!wrapped.settings.tokens.listenBrainz && this.buttonsProperties.lBrainzToken[1]) {
		wrapped.settings.tokens.listenBrainz = listenBrainz.decryptToken({ lBrainzToken: this.buttonsProperties.lBrainzToken[1], bEncrypted: this.buttonsProperties.lBrainzEncrypt[1] });
	}
	['bFilterGenresGraph', 'bOffline', 'highBpmHalveFactor']
		.forEach((key) => wrapped.settings[key] = this.buttonsProperties[key][1]);
	Object.entries(JSON.parse(this.buttonsProperties.tags[1])).forEach((pair) => {
		if (pair[1]) { wrapped.tags[pair[0]] = pair[1]; }
	});
	// Globals
	const runWrapped = (timePeriod, query = '', latexCmd = null) => {
		const bShift = utils.IsKeyPressed(VK_SHIFT);
		const bCtrl = utils.IsKeyPressed(VK_CONTROL);
		this.switchAnimation('Wrapped stats retrieval', true);
		if (bCtrl) { wrapped.settings.bSuggestions = false; }
		(
			bShift
				? wrapped.getData(timePeriod, query)
				: wrapped.createPdfReport({ timePeriod, query, latexCmd })
		)
			.then((bDone) => {
				if (bDone && !bCtrl) { wrapped.createPlaylists(timePeriod); }
			})
			.finally(() => {
				this.switchAnimation('Wrapped stats retrieval', false);
				if (wrapped.isWorking.length) {
					let last = wrapped.isWorking[0].name;
					this.switchAnimation(last, true);
					const id = setInterval(() => {
						if (!wrapped.isWorking.length) {
							this.switchAnimation(last, false);
							clearInterval(id);
						} else if (last !== wrapped.isWorking[0].name) {
							this.switchAnimation(last, false);
							last = wrapped.isWorking[0].name;
							this.switchAnimation(last, false);
						}
					}, 500);
				}
				if (bCtrl) { wrapped.settings.bSuggestions = true; }
			});
	};
	// Menu
	const menu = new _menu();
	menu.newEntry({ entryText: 'Shift/Ctrl skips report/playlists:', flags: MF_GRAYED });
	menu.newSeparator();
	const currentYear = new Date().getFullYear();
	const years = range(currentYear - 4, currentYear, 1).reverse();
	years.forEach((year) => {
		menu.newEntry({
			entryText: 'From ' + year + (isEnhPlayCount ? '' : '\t[missing plugin]'), func: () => {
				runWrapped(year, this.buttonsProperties.queryFilter[1] || '', this.buttonsProperties.latexCmd[1] || null);
			}
		});
	});
	menu.newSeparator();
	menu.newEntry({
		entryText: 'From year...' + (isEnhPlayCount ? '' : '\t[missing plugin]'), func: () => {
			const input = Input.number('int', new Date().getFullYear(), 'Enter year:\n(requires listening story)', 'Wrapped', 2020, [(n) => n > 0]);
			if (input === null) { return; }
			runWrapped(input, this.buttonsProperties.queryFilter[1] || '', this.buttonsProperties.latexCmd[1] || null);
		}, flags: isEnhPlayCount ? MF_STRING : MF_GRAYED
	});
	menu.newSeparator();
	menu.newEntry({
		entryText: 'Entire listening history' + (isPlayCount ? '' : '\t[missing plugin]'), func: () => {
			runWrapped(null, this.buttonsProperties.queryFilter[1] || '', this.buttonsProperties.latexCmd[1] || null);
		}
	});
	return menu;
}