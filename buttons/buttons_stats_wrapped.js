'use strict';
//09/12/24

/*
	Wrapped
	Provides global library statistics for a given period of time, similar to Spotify's wrapped
 */

/* global menu_panelProperties:readable */
include('..\\helpers\\helpers_xxx.js');
/* global globFonts:readable, MK_SHIFT:readable, VK_SHIFT:readable, globTags:readable */
include('..\\helpers\\buttons_xxx.js');
/* global getUniquePrefix:readable, buttonsBar:readable, addButton:readable, ThemedButton:readable */
include('..\\helpers\\helpers_xxx_input.js');
/* global Input:readable */
include('..\\helpers\\buttons_xxx_menu.js');
/* global settingsMenu:readable, MF_GRAYED:readable */
include('..\\helpers\\helpers_xxx_prototypes.js');
/* global isBoolean:readable, isStringWeak:readable, _p:readable, isJSON:readable, capitalizeAll:readable, _b:readable, isInt:readable */
include('..\\helpers\\helpers_xxx_UI.js');
/* global _gdiFont:readable, _gr:readable, _scale:readable, chars:readable */
include('..\\helpers\\helpers_xxx_properties.js');
/* global setProperties:readable, getPropertiesPairs:readable, overwriteProperties:readable */
include('..\\main\\main_menu\\main_menu_custom.js');
/* global bindDynamicMenus:readable, deleteMainMenuDynamic:readable */
include('helpers\\buttons_stats_wrapped_menu.js');
/* global wrappedMenu:readable */
include('..\\main\\playlist_manager\\playlist_manager_listenbrainz.js');
/* global ListenBrainz:readable */
include('..\\main\\spotify\\wrapped.js');
/* global wrapped:readable */

var prefix = 'wp'; // NOSONAR[global]
var version = '1.4.0'; // NOSONAR[global]

try { window.DefineScript('Wrapped button', { author: 'regorxxx', version, features: { drag_n_drop: false } }); } catch (e) {  /* May be loaded along other buttons */ }
prefix = getUniquePrefix(prefix, ''); // Puts new ID before '_'

var newButtonsProperties = { // NOSONAR[global]
	queryFilter: ['Library query filter', globTags.rating + ' MISSING OR ' + globTags.rating + ' GREATER 2', { func: isStringWeak }, globTags.rating + ' MISSING OR ' + globTags.rating + ' GREATER 2'],
	tags: ['Tags', JSON.stringify(wrapped.tags), { func: isJSON }, JSON.stringify(wrapped.tags)],
	bFilterGenresGraph: ['Filter genres with Graph exclusions', true, { func: isBoolean }, true],
	bOffline: ['Offline mode', false, { func: isBoolean }, false],
	bServicesListens: ['Use external listens', false, { func: isBoolean }, false],
	highBpmHalveFactor: ['% of high BPM tracks to halve', 30, { func: isInt, range: [[0, 100]] }, 30],
	lBrainzToken: ['ListenBrainz user token', '', { func: isStringWeak }, ''],
	lBrainzUser: ['ListenBrainz user', '', { func: isStringWeak }, ''],
	lBrainzEncrypt: ['Encrypt ListenBrainz user token', false, { func: isBoolean }, false],
	imageStubPath: ['Artists images stub path', '.\\yttm\\art_img\\$lower($cut(%1,1))\\%1\\', { func: isStringWeak }, false],
	latexCmd: ['LaTeX cmd for compiling into PDF', 'lualatex --enable-installer --interaction=nonstopmode --jobname=Wrapped_%4 --output-directory=%3 %1', { func: isStringWeak }, 'lualatex --enable-installer --interaction=nonstopmode --jobname=Wrapped_%4 --output-directory=%3 %1'],
	bDynamicMenus: ['Menus at  \'File\\Spider Monkey Panel\\...\'', false, { func: isBoolean }, false],
	bIconMode: ['Icon-only mode', false, { func: isBoolean }, false],
};
setProperties(newButtonsProperties, prefix, 0); //This sets all the panel properties at once
newButtonsProperties = getPropertiesPairs(newButtonsProperties, prefix, 0);
buttonsBar.list.push(newButtonsProperties);
// Create dynamic menus
if (newButtonsProperties.bDynamicMenus[1]) {
	bindDynamicMenus({
		menu: wrappedMenu.bind({ buttonsProperties: newButtonsProperties, prefix: '' }),
		parentName: 'Wrapped',
		entryCallback: (entry) => {
			const prefix = 'Wrapped';
			return prefix + entry.entryText.replace(/\t.*/, '').replace(/&&/g, '&');
		}
	});
}

addButton({
	'Wrapped': new ThemedButton({ x: 0, y: 0, w: _gr.CalcTextWidth('Wrapped', _gdiFont(globFonts.button.name, globFonts.button.size * buttonsBar.config.scale)) + 25 * _scale(1, false) / _scale(buttonsBar.config.scale), h: 22 }, 'Wrapped', function (mask) {
		if (mask === MK_SHIFT) {
			const menu = settingsMenu(
				this, true, ['buttons_stats_wrapped.js'],
				{
					bDynamicMenus:
						{ popup: 'Remember to set different panel names to every buttons toolbar, otherwise menus will not be properly associated to a single panel.\n\nShift + Win + R. Click -> Configure panel... (\'edit\' at top)' },
					bOffline:
						{ popup: 'On offline mode, no images will be downloaded from the web (but already existing images or local stub images will be used).' },
					bServicesListens:
						{ popup: 'Listens will be downloaded from server (ListenBrainz) and merged with local playback statistics. Don\'t forget to set the relevant tokens for those services.\n\nThese listens may also be used on offline mode as long as they have been downloaded at least once (and the associated user name has been set -token is not needed-).' },
					imageStubPath:
						{ input: 'Artists images stub path (.jpg or .png). If it starts with .\\, will be relative to foobar profile folder.\n\nEnter TF expression:\n(\'%1\' will be replaced internally with the artist name)' }
				},
				{
					bDynamicMenus:
						(value) => {
							if (value) {
								bindDynamicMenus({
									menu: wrappedMenu.bind(this),
									parentName: 'Wrapped',
									entryCallback: (entry) => {
										const prefix = 'Wrapped';
										return prefix + entry.entryText.replace(/\t.*/, '').replace(/&&/g, '&');
									}
								});
							} else { deleteMainMenuDynamic('Wrapped'); }
						},
					bServicesListens: (value) => {
						wrapped.settings.bServicesListens = value;
					},
					lBrainzToken: (value) => {
						if (!value || !this.buttonsProperties.lBrainzEncrypt[1]) {
							wrapped.settings.tokens.listenBrainz = value;
						}
					},
					lBrainzUser: (value) => {
						wrapped.settings.tokens.listenBrainzUser = value;
					}
				},
				(menu) => { // Append this menu entries to the config menu
					const menuName = menu.getMainMenuName();
					menu.newSeparator(menuName);
					const subMenuName = menu.newMenu('Tag remap...', menuName);
					menu.newEntry({ menuName: subMenuName, entryText: 'Tags used on report:', flags: MF_GRAYED });
					menu.newSeparator(subMenuName);
					const tags = JSON.parse(this.buttonsProperties.tags[1]);
					Object.keys(tags).forEach((key) => {
						menu.newEntry({
							menuName: subMenuName, entryText: capitalizeAll(key) + '\t' + _b(tags[key]), func: () => {
								const input = Input.string('string', tags[key], 'Enter tag(s):\n\nSingle tags may be written with/without %.\nEx.: ARTIST\n\nMultiple tags must be separated by \', \' and must include %.\nEx.: %GENRE%, %STYLE%', 'Wrapped', 'ALBUM ARTIST');
								if (input === null) { return; }
								tags[key] = input;
								this.buttonsProperties.tags[1] = JSON.stringify(tags);
								overwriteProperties(this.buttonsProperties);
							}
						});
					});
				}
			);
			menu.btn_up(this.currX, this.currY + this.currH);
		} else {
			wrappedMenu.bind(this)().btn_up(this.currX, this.currY + this.currH);
		}
	}, null, void (0), () => {
		const bShift = utils.IsKeyPressed(VK_SHIFT);
		const bInfo = typeof menu_panelProperties === 'undefined' || menu_panelProperties.bTooltipInfo[1];
		let info = '';
		if (wrapped.settings.bServicesListens) {
			if (!wrapped.settings.bOffline) {
				info += 'ListenBrainz Token:\t' + (wrapped.settings.tokens.listenBrainz ? 'Ok' : ' -missing token-');
				info += '\n';
			}
			info += 'ListenBrainz User:\t' + (wrapped.settings.tokens.listenBrainzUser || ' -missing user-');
			info += '\n';
		}
		info += wrapped.settings.bOffline
			? 'Offline mode'
			: '';
		if (bShift || bInfo) {
			info += '\n-----------------------------------------------------';
			info += '\n(Shift + L. Click to open config menu)';
		}
		return info;
	}, '', newButtonsProperties, chars.spotify, void (0),
	{
		lBrainzTokenListener: false
	},
	{
		on_notify_data: (parent, name, info) => {
			if (name === 'bio_imgChange' || name === 'biographyTags' || name === 'bio_chkTrackRev' || name === 'xxx-scripts: panel name reply' || name === 'precacheLibraryPaths') { return; }
			switch (name) {
				case 'xxx-scripts: lb token': {
					if (parent.buttonsProperties.lBrainzToken[1].length) { window.NotifyOthers('xxx-scripts: lb token reply', { lBrainzToken: parent.buttonsProperties.lBrainzToken[1], lBrainzEncrypt: parent.buttonsProperties.lBrainzEncrypt[1], name: window.Name + ' - ' + parent.name }); }
					break;
				}
				case 'xxx-scripts: lb token reply': {
					if (parent.lBrainzTokenListener) {
						console.log('lb token reply: using token from another instance.', window.Name + ' - ' + parent.name, _p('from ' + info.name));
						parent.buttonsProperties.lBrainzToken[1] = info.lBrainzToken;
						parent.buttonsProperties.lBrainzEncrypt[1] = info.lBrainzEncrypt;
						overwriteProperties(parent.buttonsProperties);
						ListenBrainz.cache.key = null;
						parent.lBrainzTokenListener = false;
					}
					break;
				}
			}
		},
	},
	(parent) => {
		// Retrieve token from other panels
		if (!parent.buttonsProperties.lBrainzToken[1].length) {
			parent.lBrainzTokenListener = true;
			setTimeout(() => window.NotifyOthers('xxx-scripts: lb token', null), 3000);
			setTimeout(() => { parent.lBrainzTokenListener = false; }, 6000);
			overwriteProperties(parent.buttonsProperties);
		}
		// Init relevant settings for tooltip
		['bOffline', 'bServicesListens']
			.forEach((key) => wrapped.settings[key] = parent.buttonsProperties[key][1]);
		// ListenBrainz token
		if (parent.buttonsProperties.lBrainzToken[1] && !parent.buttonsProperties.lBrainzEncrypt[1]) {
			wrapped.settings.tokens.listenBrainz = parent.buttonsProperties.lBrainzToken[1];
		}
		if (parent.buttonsProperties.lBrainzUser[1]) {
			wrapped.settings.tokens.listenBrainzUser = parent.buttonsProperties.lBrainzUser[1];
		}
	},
	{ scriptName: 'Wrapped-SMP', version }),
});