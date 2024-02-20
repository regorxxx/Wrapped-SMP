'use strict';
//19/02/24

/* exported wrappedMenu */

include('..\\..\\helpers\\helpers_xxx.js');
/* global MF_GRAYED:readable, VK_SHIFT:readable */
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
	['bFilterGenresGraph', 'bOffline']
		.forEach((key) => wrapped.settings[key] = this.buttonsProperties[key][1]);
	Object.entries(JSON.parse(this.buttonsProperties.tags[1])).forEach((pair) => {
		if (pair[1]) {wrapped.tags[pair[0]] = pair[1];}
	});
	// Globals
	const runWrapped = (year, query = '', latexCmd = null) => {
		this.switchAnimation('Wrapped stats retrieval', true);
		(
			utils.IsKeyPressed(VK_SHIFT)
				? wrapped.getData(year, query)
				: wrapped.createPdfReport({ year, query, latexCmd })
		)
			.then((bDone) => {
				if (bDone) { wrapped.createPlaylists(year); }
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
			});
	};
	// Menu
	const menu = new _menu();
	menu.newEntry({ entryText: 'Shift + Click to skip report:', flags: MF_GRAYED });
	menu.newEntry({ entryText: 'sep' });
	const currentYear = new Date().getFullYear();
	const years = range(currentYear - 4, currentYear, 1).reverse();
	years.forEach((year) => {
		menu.newEntry({
			entryText: 'From ' + year, func: () => {
				runWrapped(year, this.buttonsProperties.queryFilter[1] || '', this.buttonsProperties.latexCmd[1] || null);
			}
		});
	});
	menu.newEntry({ entryText: 'sep' });
	menu.newEntry({
		entryText: 'From year...', func: () => {
			const input = Input.number('int', new Date().getFullYear(), 'Enter year:\n(requires listening story)', 'Wrapped', 2020, [(n) => n > 0]);
			if (input === null) { return; }
			runWrapped(input, this.buttonsProperties.queryFilter[1] || '', this.buttonsProperties.latexCmd[1] || null);
		}
	});
	return menu;
}