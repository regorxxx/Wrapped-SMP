'use strict';
//09/12/24

/* exported wrappedMenu */

include('..\\..\\helpers\\helpers_xxx.js');
/* global MF_GRAYED:readable, isEnhPlayCount:readable, isPlayCount:readable, isPlayCount2003:readable, MF_STRING:readable */
include('..\\..\\helpers\\menu_xxx.js');
/* global _menu:readable  */
include('..\\..\\helpers\\helpers_xxx_prototypes.js');
/* global range:readable */
include('..\\..\\helpers\\helpers_xxx_properties.js');
/* global overwriteProperties:readable */
include('..\\..\\helpers\\helpers_xxx_input.js');
/* global Input:readable */
include('..\\..\\main\\spotify\\wrapped.js');
/* global wrapped:readable */
include('..\\..\\main\\playlist_manager\\playlist_manager_listenbrainz.js');
/* global ListenBrainz:readable */

function wrappedMenu({ bSimulate = false } = {}) {
	if (bSimulate) { return wrappedMenu.bind({ buttonsProperties: this.buttonsProperties, prefix: this.prefix })(false); }
	// Settings
	['bFilterGenresGraph', 'bOffline', 'bServicesListens', 'highBpmHalveFactor', 'imageStubPath']
		.forEach((key) => wrapped.settings[key] = this.buttonsProperties[key][1]);
	Object.entries(JSON.parse(this.buttonsProperties.tags[1])).forEach((pair) => {
		if (pair[1]) { wrapped.tags[pair[0]] = pair[1]; }
	});
	// ListenBrainz token
	if (!wrapped.settings.tokens.listenBrainz && this.buttonsProperties.lBrainzToken[1]) {
		wrapped.settings.tokens.listenBrainz = ListenBrainz.decryptToken({ lBrainzToken: this.buttonsProperties.lBrainzToken[1], bEncrypted: this.buttonsProperties.lBrainzEncrypt[1] });
		ListenBrainz.retrieveUser(wrapped.settings.tokens.listenBrainz, false)
			.then((user) => {
				if (user) {
					wrapped.settings.tokens.listenBrainzUser = this.buttonsProperties.lBrainzUser[1] = user;
					overwriteProperties(this.buttonsProperties);
				}
			});
	}
	if (!wrapped.settings.tokens.listenBrainzUser) {
		if (this.buttonsProperties.lBrainzUser[1]) {
			wrapped.settings.tokens.listenBrainzUser = this.buttonsProperties.lBrainzUser[1];
		}
		if (wrapped.settings.tokens.listenBrainz) {
			ListenBrainz.retrieveUser(wrapped.settings.tokens.listenBrainz, false)
				.then((user) => {
					if (user) {
						wrapped.settings.tokens.listenBrainzUser = this.buttonsProperties.lBrainzUser[1] = user;
						overwriteProperties(this.buttonsProperties);
					}
				});
		}
	}
	// Globals
	const hasListens = isPlayCount && (isEnhPlayCount || isPlayCount2003);
	const runWrapped = (timePeriod, query = '', latexCmd = null, mode = 'all') => {
		this.switchAnimation('Wrapped stats retrieval', true);
		if (mode === 'report') { wrapped.settings.bSuggestions = false; }
		(
			mode === 'all' || mode === 'report'
				? wrapped.createPdfReport({ timePeriod, query, latexCmd })
				: wrapped.getData(timePeriod, query)
		)
			.then((bDone) => {
				this.switchAnimation('Wrapped stats retrieval', false);
				if (bDone && mode === 'all' || mode === 'recommendations') {
					this.switchAnimation('Wrapped playlists recommendations', true);
					wrapped.createPlaylists(timePeriod);
				}
			})
			.finally(() => {
				this.switchAnimation('Wrapped stats retrieval', false);
				this.switchAnimation('Wrapped playlists recommendations', false);
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
				if (mode === 'report') { wrapped.settings.bSuggestions = true; }
			});
	};
	// Menu
	const menu = new _menu();
	const currentYear = new Date().getFullYear();
	const years = range(currentYear - 4, currentYear, 1).reverse();
	[
		{menu: 'Wrapped & Recommendations', mode: 'all', descr: 'Outputs the report & playlists:'},
		{menu: 'Wrapped (only)', mode: 'report', descr: 'Outputs only the report:'},
		{menu: 'Recommendations (only)', mode: 'recommendations', descr: 'Outputs only the playlists:'},
	].forEach((opt) => {
		const menuName = menu.findOrNewMenu(opt.menu);
		menu.newEntry({ menuName, entryText: opt.descr, flags: MF_GRAYED });
		menu.newSeparator(menuName);
		years.forEach((year) => {
			menu.newEntry({
				menuName,
				entryText: 'From ' + year + (hasListens ? '' : '\t[missing plugin]'), func: () => {
					runWrapped(
						year,
						this.buttonsProperties.queryFilter[1] || '',
						this.buttonsProperties.latexCmd[1] || null,
						opt.mode
					);
				}
			});
		});
		menu.newSeparator(menuName);
		menu.newEntry({
			menuName,
			entryText: 'From year...' + (hasListens ? '' : '\t[missing plugin]'), func: () => {
				const input = Input.number('int', new Date().getFullYear(), 'Enter year:\n(requires listening story)', 'Wrapped', 2020, [(n) => n > 0]);
				if (input === null) { return; }
				runWrapped(
					input,
					this.buttonsProperties.queryFilter[1] || '',
					this.buttonsProperties.latexCmd[1] || null,
					opt.mode
				);
			}, flags: hasListens ? MF_STRING : MF_GRAYED
		});
		menu.newSeparator(menuName);
		menu.newEntry({
			menuName,
			entryText: 'Entire listening history' + (hasListens ? '' : '\t[missing plugin]'), func: () => {
				runWrapped(
					null,
					this.buttonsProperties.queryFilter[1] || '',
					this.buttonsProperties.latexCmd[1] || null,
					opt.mode
				);
			}, flags: hasListens ? MF_STRING : MF_GRAYED
		});
	});
	return menu;
}