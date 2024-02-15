'use strict';
//30/01/24

/* exported spotify */

include('..\\..\\helpers\\helpers_xxx.js');
/* global folders:readable */
include('..\\..\\helpers\\helpers_xxx_file.js');
/* global _isFile:readable, _jsonParseFile:readable, _runCmd:readable */
include('..\\..\\helpers\\helpers_xxx_web.js');
/* global send:readable */

const spotify = {
	tokenFile: folders.temp + 'spotify.json',
	curl: folders.xxx + 'helpers-external\\curl\\curl.exe',
	/**
	 * Retrieve a random short-lived access token from the Spotify API. Use {}.accessToken for the Bearer.
	 *
	 * @property
	 * @name getToken
	 * @kind method
	 * @memberof spotify
	 * @type {function}
	 * @returns {Object | null}
	*/
	getToken: function getToken() {
		_runCmd('CMD /C "' + this.curl + ' "https://open.spotify.com/get_access_token?reason=transport&productType=web_player">' + this.tokenFile + '"', true);
		return _isFile(this.tokenFile) ? _jsonParseFile(this.tokenFile) : null;
	},
	/**
	 * Returns information about an item from the Spotify API.
	 *
	 * @property
	 * @name searchArtistInfo
	 * @kind method
	 * @memberof spotify
	 * @type {function}
	 * @param {string} item - Item string
	 * @param {string} type - artist | track | playlist | album
	 * @returns {Object | null}
	*/
	search: function search(item, type) {
		const token = this.getToken();
		return !token
			? Promise.reject(new Error('No token retrieved.'))
			: send({
				method: 'GET',
				bypassCache: true,
				requestHeader: [
					['Authorization', 'Bearer ' + token.accessToken],
					['user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36']
				],
				URL: 'https://api.spotify.com/v1/search?type=' + type + '&q=' + encodeURIComponent(item) + '&decorate_restrictions=false&best_match=true&include_external=audio'
			}).then(
				(resolve) => {
					if (resolve) {
						const response = JSON.parse(resolve);
						return response;
					}
					return null;
				},
				(reject) => {
					console.log('search: ' + reject.status + ' ' + reject.responseText);
					return null;
				}
			).catch((error) => { fb.ShowPopupMessage(JSON.stringify(error)); });
	},
	/**
	 * Returns information about an artist from the Spotify API.
	 *
	 * @property
	 * @name searchArtistInfo
	 * @kind method
	 * @memberof spotify
	 * @type {function}
	 * @param {string} artist - Artist string
	 * @returns {Object | null}
	*/
	searchArtistInfo: function searchArtistInfo(artist) {
		return this.search(artist, 'artist');
	},
	/**
	 * Returns information about a track from the Spotify API.
	 *
	 * @property
	 * @name searchTrackInfo
	 * @kind method
	 * @memberof spotify
	 * @type {function}
	 * @param {string} track - Track string
	 * @returns {Object | null}
	*/
	searchTrackInfo: function searchTrackInfo(track) {
		return this.search(track, 'track');
	}
};