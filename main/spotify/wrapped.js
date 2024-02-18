'use strict';
//18/02/24

/* exported wrapped */

include('..\\..\\helpers\\helpers_xxx.js');
/* global folders:readable, globQuery:readable, globTags:readable, soFeat:readable */
include('..\\..\\helpers\\helpers_xxx_prototypes.js');
/* global forEachNested:readable, _bt:readable, _q:readable, round:readable, _asciify:readable, _p:readable, _t:readable, isArrayEqual:readable, isPromise:readable */
include('..\\..\\helpers\\helpers_xxx_file.js');
/* global sanitizePath:readable, _isFolder:readable,, _isFile:readable, _createFolder:readable, getFiles:readable, _runCmd:readable, _copyFile:readable, _save:readable, _run:readable, _recycleFile:readable, _deleteFolder:readable */
include('..\\..\\helpers\\helpers_xxx_playlists.js');
/* global sendToPlaylist:readable */
include('..\\..\\helpers\\helpers_xxx_tags.js');
/* global queryCombinations:readable, queryJoin:readable, sanitizeQueryVal:readable, sanitizeTagIds:readable, sanitizeTagValIds:readable */
include('..\\..\\helpers\\helpers_xxx_web.js');
/* global send:readable */
include('..\\timeline\\timeline_helpers.js');
/* global getDataAsync:readable */
include('..\\search\\top_tracks_from_date.js');
/* global getPlayCount:readable */
include('spotify.js');
/* global spotify:readable */
include('..\\search_by_distance\\search_by_distance_genres.js');
/* global getNearestGenreStyles:readable, music_graph_descriptors:readable */
include('..\\search_by_distance\\search_by_distance_culture.js');
/* global getCountryISO:readable, getZoneArtistFilter:readable */
include('..\\music_graph\\music_graph_descriptors_xxx_node.js');
// music_graph_descriptors.nodeList:readable
include('..\\sort\\scatter_by_tags.js');
/* global shuffleByTags:readable */
include('..\\playlist_manager\\playlist_manager_youtube.js');
/* global youTube:readable */
include('..\\filter_and_query\\remove_duplicates.js');
/* global removeDuplicatesV2:readable */
include('..\\playlist_manager\\playlist_manager_listenbrainz.js');
/* global listenBrainz:readable */


const wrapped = {
	tokens: { listenBrainz: '' },
	isWorking: [],
	basePath: folders.temp + 'wrapped\\',
	tags: {
		artist: 'ALBUM ARTIST',
		genre: 'GENRE'
	},
	bOffline: false,
	bDebug: false,
	backgroundImgs: [],
	stats: {
		genres: {
			total: 0,
			/** @type {{genre:string, listens:number, score:number}[]} */
			byScore: [],
			/** @type {{name:string}[]} */
			similar: [],
			groups: {
				/** @type {{name:string, score: number}[]} */
				list: [],
				get main() {
					return { ...this.list.sort((a, b) => b.score - a.score)[0] }; // NOSONAR
				},
				get scores() {
					return [...this.list.sort((a, b) => b.score - a.score) // NOSONAR
						.map((char) => { return { name: char.name, score: char.score }; })
					];
				}
			}
		},
		tracks: { total: 0 },
		artists: {
			total: 0,
			top: {
				artist: '',
				tracks: 0,
				topTrack: { title: '', listens: 0, artist: '', handle: null, albumImg: null }
			},
			/** @type {{artist:string, month:number, listens:number, monthName:string}[]} */
			byMonth: []
		},
		albums: { total: 0 },
		countries: {
			total: 0,
			/** @type {{name:string, listens:number, iso:string}[]} */
			byISO: [],
			/** @type {{name:string, listens:number, iso:string, artist:string}[]} */
			byArtist: [],
		},
		cities: { total: 0 },
		listens: { total: 0 },
		skips: { total: 0 },
		time: { minutes: 0, days: 0, most: { date: new Date(), minutes: 0 } },
		character: {
			list: [
				{ name: 'Roboticist', score: 0, description: 'You like to hit play, kick back, and let the clever algorithms work their magic, track after track. Oh look, that rhymes.' },
				{ name: 'Hypnotist', score: 0, description: 'Your concentration is absolute, friend. You like to play albums all the way through, from the opening track to the final note.' },
				{ name: 'Collector', score: 0, description: 'Your taste is sublime. You listen mostly to your own playlists, and we totally get why. They\'re perfect, after all.' },
				{ name: 'Cyclops', score: 0, description: 'When it comes to your listening, you\'re loyal and devoted. You like to focus on one genre. Sometimes while wearing a monocle.' },
				{ name: 'Shapeshifter', score: 0, description: 'One moment you\'re head over heels for an artist. The next, you\'ve moved on. Some say it\'s erratic. We call it eclectic.' },
				{ name: 'Time traveler', score: 0, description: 'Have we met before? You travel back in time and listen to songs on repeat, again and again. The best tracks never get old.' },
				{ name: 'Vampire', score: 0, description: 'When it comes to your listening, you like to embrace a little... darkness. You listen to emotional, atmospheric music more than most.' },
				{ name: 'Hunter', score: 0, description: 'You\'re always searching for new favorites. You skip tracks more than other listeners. Maybe it\'s the thrill of the chase?' },
				{ name: 'Luminary', score: 0, description: 'There\'s a spark in you, and your listening shows it. You play light, upbeat music more than others. Bet you\'re fun at parties.' },
				{ name: 'Alchemist', score: 0, description: 'Listening is your laboratory. You create your own playlists more than other listeners do. Nice work, doc.' },
				{ name: 'Mastermind', score: 0, description: 'Knowledge is power, listener. Which makes you powerful indeed, as you like to study a wide range of different genres. Clever you.' },
				{ name: 'Fanatic', score: 0, description: 'Once you pick a favorite, you never let go. Your top artist makes up more than a third of your listening. Impressive.' }
			],
			get main() {
				return { ...this.list.sort((a, b) => b.score - a.score)[0] }; // NOSONAR
			},
			get scores() {
				return [...this.list.sort((a, b) => b.score - a.score) // NOSONAR
					.map((char) => { return { name: char.name, score: char.score }; })
				];
			}
		},
	},
	playlists: {
		top: new FbMetadbHandleList(),
		discover: new FbMetadbHandleList(),
		topArtists: new FbMetadbHandleList(),
		topGenres: new FbMetadbHandleList(),
		topCountries: new FbMetadbHandleList(),
		suggestions: {
			/** @type {Promise<(FbMetadbHandle|string)[]>} */
			genres: Promise.resolve([]),
			/** @type {Promise.<(FbMetadbHandle|string)[]>} */
			artists: Promise.resolve([]),
			library: new FbMetadbHandleList(),
			web: new FbMetadbHandleList()
		}
	},
	resetStats: function () {
		forEachNested(this.stats, (_, key, obj) => {
			if (key === 'list') {
				obj[key].forEach((char) => char.score = 0);
			} else if (!Object.getOwnPropertyDescriptor(obj, key)['get']) {
				if (key === 'date') {
					obj[key] = new Date();
				} else if (['byMonth', 'similar', 'byScore', 'byISO', 'byArtist'].includes(key)) {
					obj[key].length = 0;
				} else if (['artist', 'title'].includes(key)) {
					obj[key] = '';
				} else if (['albumImg', 'artistImg', 'handle'].includes(key)) {
					obj[key] = null;
				} else {
					obj[key] = 0;
				}
			}
		});
	},
	resetPlaylists: function () {
		forEachNested(this.playlists, (_, key, obj) => {
			if (['genres', 'artists'].includes(key)) {
				obj[key] = [];
			} else {
				obj[key] = new FbMetadbHandleList();
			}
		});
	},
	/**
	 * It takes a `year` parameter and returns a promise that resolves to an array of artist data.
	 *
	 * @name getArtistsData
	 * @kind method
	 * @memberof wrapped
	 * @param {number} year
	 * @returns {promise.<[{artist:string, listens:number}]>}
	*/
	getArtistsData: function (year, query) {
		return getDataAsync({
			option: 'playcount', optionArg: [year,],
			x: this.tags.artist,
			query: queryJoin(['%LAST_PLAYED_ENHANCED% SINCE ' + year + ' OR %LAST_PLAYED% SINCE ' + year, query || ''].filter(Boolean), 'AND'),
			sourceType: 'library',
			bRemoveDuplicates: true
		})
			.then((/** @type [array] */ data) => {
				data = data[0];
				// Process
				data.forEach((artist) => {
					artist.artistImg = this.basePath + 'img\\untitled.jpg';
					artist.artist = artist.x;
					artist.listens = artist.y;
					delete artist.x;
					delete artist.y;
				});
				data.sort((a, b) => b.listens - a.listens);
				// stats
				this.computeArtistsStats(data);
				// Playlists
				this.computeTopArtistsPlaylist(data);
				this.computeSuggestedArtistsPlaylist(data, year);
				return data;
			});
	},
	/**
	 * It takes a `year` parameter and returns a promise that resolves to an array of genre data.
	 *
	 * @name getGenresData
	 * @kind method
	 * @memberof wrapped
	 * @param {number} year
	 * @returns {promise.<[{genre:string, listens:number}]>}
	*/
	getGenresData: function (year, query) {
		return getDataAsync({
			option: 'playcount', optionArg: [year,],
			x: this.tags.genre,
			query: queryJoin(['%LAST_PLAYED_ENHANCED% SINCE ' + year + ' OR %LAST_PLAYED% SINCE ' + year, query || ''].filter(Boolean), 'AND'),
			sourceType: 'library',
			bRemoveDuplicates: true
		})
			.then((/** @type [array] */ data) => {
				data = data[0]; // There is only a single serie
				// Process
				data.forEach((genre) => {
					genre.genre = genre.x;
					genre.listens = genre.y;
					delete genre.x;
					delete genre.y;
				});
				data.sort((a, b) => b.listens - a.listens);
				// stats
				this.computeGenresStats(data);
				// Playlists
				this.computeTopGenresPlaylist(data);
				this.computeSuggestedGenresPlaylist(this.stats.genres.similar, year);
				return data;
			});
	},
	/**
	 * It takes a `year` parameter and returns a promise that resolves to an array of tracks data.
	 *
	 * @name getTracksData
	 * @kind method
	 * @memberof wrapped
	 * @param {number} year
	 * @returns {promise.<[{title:string, listens:number, handle:FbMetadbHandle[], artist:string}]>}
	*/
	getTracksData: function (year, query) {
		return getDataAsync({
			option: 'playcount', optionArg: [year,],
			x: 'TITLE',
			query: queryJoin(['%LAST_PLAYED_ENHANCED% SINCE ' + year + ' OR %LAST_PLAYED% SINCE ' + year, query || ''].filter(Boolean), 'AND'),
			sourceType: 'library',
			bRemoveDuplicates: true, bIncludeHandles: true
		})
			.then((/** @type [{title: string, listens: number, handle: [FbMetadbHandle]}] */ data) => {
				data = data[0]; // There is only a single serie
				// Process
				data.forEach((track) => {
					track.artist = fb.TitleFormat(_bt(this.tags.artist)).EvalWithMetadbs(new FbMetadbHandleList(track.handle))
						.flat(Infinity).join(', ');
					track.title = track.x;
					track.listens = track.y;
					delete track.x;
					delete track.y;
				});
				data.sort((a, b) => b.listens - a.listens);
				// Stats
				this.computeTracksStats(data, year);
				this.computeListensStats(data, year);
				// Playlist
				this.computeTopTracksPlaylist(data);
				this.computeDiscoverPlaylist(data, year);
				return data;
			});
	},
	/**
	 * It takes a `year` parameter and returns a promise that resolves to an array of albums data.
	 *
	 * @name getAlbumsData
	 * @kind method
	 * @memberof wrapped
	 * @param {number} year
	 * @returns {promise.<[{title:string, listens:number}]>}
	*/
	getAlbumsData: function (year, query) {
		return getDataAsync({
			option: 'playcount', optionArg: [year,],
			x: 'ALBUM',
			query: queryJoin(['%LAST_PLAYED_ENHANCED% SINCE ' + year + ' OR %LAST_PLAYED% SINCE ' + year, query || ''].filter(Boolean), 'AND'),
			sourceType: 'library',
			bRemoveDuplicates: true, bIncludeHandles: false
		})
			.then((/** @type [{album: string, listens: number */ data) => {
				data = data[0]; // There is only a single serie
				// Process
				data.forEach((album) => {
					album.title = album.x;
					album.listens = album.y;
					delete album.x;
					delete album.y;
				});
				data.sort((a, b) => b.listens - a.listens);
				// Stats
				this.computeAlbumsStats(data, year);
				return data;
			});
	},
	/**
	 * It takes a `year` parameter and returns a promise that resolves to an array of regions data.
	 *
	 * @name getCountriesData
	 * @kind method
	 * @memberof wrapped
	 * @param {number} year
	 * @returns {promise.<[{name:string, listens:number}]>}
	*/
	getCountriesData: function (year, query) {
		return getDataAsync({
			option: 'playcount wordlmap', optionArg: [year,],
			x: this.tags.artist,
			query: queryJoin(['%LAST_PLAYED_ENHANCED% SINCE ' + year + ' OR %LAST_PLAYED% SINCE ' + year, query || ''].filter(Boolean), 'AND'),
			sourceType: 'library',
			bRemoveDuplicates: true, bIncludeHandles: false
		})
			.then((/** @type [{country: string, listens: number */ data) => {
				data = data[0]; // There is only a single serie
				// Process
				data.forEach((country) => {
					country.name = country.x;
					country.listens = country.y;
					delete country.x;
					delete country.y;
				});
				data.sort((a, b) => b.listens - a.listens);
				// Stats
				this.computeCountriesStats(data, year);
				// Playlists
				this.computeTopCountriesPlaylist(data);
				return data;
			});
	},
	/**
	 * It takes a `year` parameter and returns a promise that resolves to an array of cities data.
	 *
	 * @name getCitiesData
	 * @kind method
	 * @memberof wrapped
	 * @param {number} year
	 * @returns {promise.<{city:string, listens:number, artists:{artist:string, listens:number}[]}[]>}
	*/
	getCitiesData: function (year, query) {
		return getDataAsync({
			option: 'playcount wordlmap city', optionArg: [year,],
			x: this.tags.artist,
			query: queryJoin(['%LAST_PLAYED_ENHANCED% SINCE ' + year + ' OR %LAST_PLAYED% SINCE ' + year, query || ''].filter(Boolean), 'AND'),
			sourceType: 'library',
			bRemoveDuplicates: true, bIncludeHandles: false
		})
			.then((/** @type [{name: string, listens: number */ data) => {
				data = data[0]; // There is only a single serie
				// Process
				data.forEach((city) => {
					city.name = city.x;
					city.listens = city.y;
					delete city.x;
					delete city.y;
				});
				data.sort((a, b) => b.listens - a.listens);
				// Stats
				this.computeCitiesStats(data);
				return data;
			});
	},
	/**
	 * Retrieves the genre group(s) for a given genre .
	 *
	 * @property
	 * @name getGenreGroups
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {string} genre
	 * @returns {string[]}
	*/
	getGenreGroups: function (genre) {
		const descr = music_graph_descriptors;
		const genreInfo = descr.nodeList.get(descr.getSubstitution(genre));
		return genreInfo ? genreInfo.cluster : [];
	},
	/**
	 * Calculate statistics for  artists, using data from {@link wrapped.getArtistsData}.
	 *
	 * @property
	 * @name computeArtistsStats
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{genre:string, listens:number}[]} artistsData
	 * @returns {{artists}}
	*/
	computeArtistsStats: function (artistsData) {
		this.stats.artists.total = artistsData.length;
		if (this.bDebug) { console.log('computeArtistsStats:', this.stats.artists); }
		return this.stats;
	},
	/**
	 * Calculate statistics for genres, using data from {@link wrapped.getGenresData}.
	 *
	 * @property
	 * @name computeGenresStats
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{genre:string, listens:number}[]} genresData
	 * @returns {{genres}}
	*/
	computeGenresStats: function (genresData) {
		this.stats.genres.total = genresData.length;
		const top = genresData.slice(0, 5);
		const topGenres = top.map((genre) => genre.genre);
		this.stats.genres.similar = [
			...new Set(getNearestGenreStyles(topGenres, 50)).difference(new Set(topGenres))
		];
		const totalListensTop = top.reduce((acc, genre) => acc + genre.listens, 0);
		top.forEach((genre) => {
			this.stats.genres.byScore.push({
				...genre,
				score: round(genre.listens / totalListensTop * 100, 0)
			});
		});
		const genreGroups = new Map();
		let listensTotal = 0;
		genresData.forEach((genre) => {
			const groups = this.getGenreGroups(genre.genre);
			groups.forEach((group) => {
				const node = genreGroups.get(group) || { name: group, score: 0 };
				node.score += genre.listens;
				listensTotal += genre.listens;
				genreGroups.set(group, node);
			});
		});
		genreGroups.forEach((node) => {
			node.score = round(node.score / listensTotal * 100);
			this.stats.genres.groups.list.push(node);
		});
		if (this.bDebug) { console.log('computeGenresStats:', this.stats.genres); }
		return this.stats;
	},
	/**
	 * Calculate statistics for tracks, using data from {@link wrapped.getTracksData}.
	 *
	 * @property
	 * @name computeTracksStats
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{title:string, listens:number, handle:FbMetadbHandle[]}[]} tracksData
	 * @param {number} year
	 * @returns {{tracks}}
	*/
	computeTracksStats: function (tracksData) {
		this.stats.tracks.total = tracksData.length;
		if (this.bDebug) { console.log('computeTracksStats:', this.stats.tracks); }
		return this.stats;
	},
	/**
	 * Calculate statistics for tracks, using data from {@link wrapped.getAlbumsData}.
	 *
	 * @property
	 * @name computeAlbumsStats
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{title:string, listens:number}[]} albumsData
	 * @param {number} year
	 * @returns {{tracks}}
	*/
	computeAlbumsStats: function (albumsData) {
		this.stats.albums.total = albumsData.length;
		if (this.bDebug) { console.log('computeAlbumsStats:', this.stats.albums); }
		return this.stats;
	},
	/**
	 * Calculate statistics for countries, using data from {@link wrapped.getCountriesData}.
	 *
	 * @property
	 * @name computeCountriesStats
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{name:string, listens:number}[]} countriesData
	 * @param {number} year
	 * @returns {{tracks}}
	*/
	computeCountriesStats: function (countriesData) {
		this.stats.countries.total = countriesData.length;
		countriesData.slice(0, 5).forEach((country) => {
			this.stats.countries.byISO.push({ ...country, iso: getCountryISO(country.name) });
		});
		if (this.bDebug) { console.log('computeCountriesStats:', this.stats.countries); }
		return this.stats;
	},
	/**
	 * Calculate statistics for countries, using data from {@link wrapped.getCountriesData}.
	 *
	 * @property
	 * @name computeCitiesStats
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{name:string, listens:number}[]} citiesData
	 * @returns {{tracks}}
	*/
	computeCitiesStats: function (citiesData) {
		this.stats.cities.total = citiesData.length;
		if (this.bDebug) { console.log('computeCitiesStats:', this.stats.cities); }
		return this.stats;
	},
	/**
	 * Calculate statistics for listens, using data from {@link wrapped.getTracksData}.
	 *
	 * @property
	 * @name computeListensStats
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{title:string, listens:number, handle:FbMetadbHandle[]}[]} tracksData
	 * @param {number} year
	 * @returns {{listens, time}}
	*/
	computeListensStats: function (tracksData, year) {
		// Time
		this.stats.time.minutes = round(tracksData.reduce((prev, track) => prev + track.handle[0].Length * track.listens, 0) / 60, 0);
		this.stats.time.days = round(this.stats.time.minutes / 60 / 24, 1);
		const listens = getPlayCount(new FbMetadbHandleList(tracksData.map((track) => track.handle[0])), year).map((track) => track.listens);
		const days = new Map();
		listens.forEach((listenArr, i) => {
			listenArr.forEach((listen) => {
				this.stats.listens.total++;
				const dateStr = listen.toString();
				const old = days.get(dateStr) || { date: listen, time: 0 };
				old.time += tracksData[i].handle[0].Length;
				days.set(dateStr, old);
			});
		});
		const max = [...days.values()].reduce((acc, curr) => curr.time > acc.time ? curr : acc, { time: 0 });
		this.stats.time.most.date = max.date;
		this.stats.time.most.minutes = round(max.time / 60, 0);
		if (this.bDebug) { console.log('computeListensStats:', this.stats.time); }
		return this.stats;
	},
	/**
	 * Calculate statistics for user listening habits.
	 *
	 * @property
	 * @name computeCharacterStats
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{ genres: {genre:string, listens:number}[]; tracks: {title:string, listens:number, handle:FbMetadbHandle[]}[]; artists: {artist:string, listens:number}[]; }} wrappedData
	 * @returns {{character}}
	*/
	computeCharacterStats: function (wrappedData) {
		const findChar = (name) => this.stats.character.list.find((char) => char.name.toLowerCase() === name) || {};
		if (this.stats.artists.total > 0) {
			// Fanatic: top artist listens > total listens / 3
			if (this.stats.listens.total > 0) {
				const topArtistWeight = wrappedData.artists[0].listens / wrappedData.artists.slice(0, 5).reduce((acc, artist) => acc + artist.listens, 0);
				const topArtistListenWeight = wrappedData.artists[0].listens / this.stats.listens.total;
				if (topArtistListenWeight > 1 / 5 || topArtistWeight > 1 / 5) {
					findChar('fanatic').score = (Math.min(topArtistListenWeight / (2 / 3), 100) + Math.min(topArtistWeight / (2 / 3), 100)) / 2;
				}
			}
			// Shapeshifter: listen too many different artists
			if (this.stats.artists.total > 350) {
				const meanListens = this.stats.listens.total / this.stats.artists.total;
				findChar('shapeshifter').score = wrappedData.artists
					.reduce((acc, artist) => (acc + (artist.listens >= meanListens ? 1 : 0)), 0) / this.stats.artists.total * 100;
			}
		}
		if (this.stats.genres.total > 0) {
			// Cyclops: focus on one genre
			if (this.stats.listens.total > 0) {
				const topGenreWeight = wrappedData.genres[0].listens / this.stats.listens.total;
				if (topGenreWeight > 1 / 3) {
					findChar('cyclops').score = Math.min(topGenreWeight / (2 / 3), 100);
				}
			}
			// Mastermind: listen too many different genres
			if (this.stats.genres.total > 10) {
				const meanListens = this.stats.listens.total / this.stats.genres.total;
				findChar('mastermind').score = wrappedData.genres
					.reduce((acc, genre) => acc + (genre.listens > meanListens ? 1 : 0), 0) / this.stats.genres.total * 100;
			}
		}
		// Alchemist: create many playlists
		// Luminary: many listens for tracks with high BPM
		// Hunter: many skips
		// TODO add statistics
		if (this.stats.listens.total > 0) {
			const skipWeight = this.stats.skips.total / this.stats.listens.total;
			if (this.stats.skips.total > 50 && skipWeight > 0.25) {
				findChar('hunter').score = Math.min(skipWeight / (1 / 2), 100);
			}
		}
		// Vampire: many listens for atmospheric/emotional tracks
		// Time traveler: listen to old tracks
		// Collector: listen to own playlists
		// Hypnotist: listen to entire albums without skip (low proportion of albums per track)
		if (this.stats.tracks.total) {
			const albumWeight = this.stats.albums.total / this.stats.tracks.total;
			if (albumWeight < 1 / 5) {
				findChar('hypnotist').score = Math.min((1 / 5 - albumWeight) / (1 / 5), 100);
			}
			// Roboticist: smart shuffle (every artist should have a similar proportion)
			const diffArtistsWeight = this.stats.artists.total / this.stats.tracks.total;
			if (this.stats.artists.total > 500 && diffArtistsWeight > 0.1) {
				const meanListens = this.stats.listens.total / this.stats.artists.total;
				findChar('roboticist').score = wrappedData.artists
					.reduce((acc, artist) => acc + (artist.listens > meanListens ? 1 : 0), 0) / this.stats.artists.total * 50 +
					Math.min(diffArtistsWeight / (1 / 5) * 25, 50);
			}
		}
		this.stats.character.list.forEach((character) => character.score = round(character.score, 2));
		if (this.bDebug) { console.log('computeCharacterStats:', this.stats.character.scores); }
		return this.stats;
	},
	/**
	 * Calculate statistics which require multiple data types
	 *
	 * @property
	 * @name computeGlobalStats
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{ genres: {genre:string, listens:number}[]; tracks: {title:string, listens:number, handle:FbMetadbHandle[], artist:string}[]; artists: {artist:string, listens:number}[]; }} wrappedData
	 * @param {number} year
	 * @returns {{character}}
	*/
	computeGlobalStats: function (wrappedData, year) {
		// Top artists
		if (wrappedData.artists.length && wrappedData.tracks.length) {
			// Top artist
			this.stats.artists.top.artist = wrappedData.artists[0].artist;
			this.stats.artists.top.tracks = wrappedData.tracks.reduce((acc, track) => acc + (track.artist === this.stats.artists.top.artist ? 1 : 0), 0);
			const topTrack = wrappedData.tracks.find((track) => track.artist === this.stats.artists.top.artist);
			if (topTrack) { this.stats.artists.top.topTrack = topTrack; }
			if (this.bDebug) { console.log('computeGlobalStats:', this.stats.artists.top); }
			// By month
			wrappedData.artists.slice(0, 5).forEach((artist) => {
				const listens = getPlayCount(
					new FbMetadbHandleList(
						wrappedData.tracks.filter((track) => track.artist === artist.artist)
							.map((track) => track.handle[0])
					), year
				).map((track) => track.listens);
				const months = new Map();
				listens.forEach((listenArr) => {
					listenArr.forEach((listen) => {
						const dateStr = listen.getMonth();
						months.set(dateStr, (months.get(dateStr) || 0) + 1);
					});
				});
				const max = [...months.entries()].sort((a, b) => b[1] - a[1])[0];
				const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
				this.stats.artists.byMonth.push({
					artist: artist.artist,
					month: max[0],
					listens: max[1],
					monthName: monthNames[max[0]]
				});
			});
			if (this.bDebug) { console.log('computeGlobalStats:', this.stats.artists.byMonth); }
		}
		// Top artist by Country
		if (wrappedData.countries.length && wrappedData.artists.length) {
			this.stats.countries.byISO.forEach((country) => {
				const filter = getZoneArtistFilter(country.iso, 'country');
				const topArtist = wrappedData.artists.find((artist) => filter.artists.includes(artist.artist));
				if (topArtist) {
					// Overwrites country's listens with artist's listens
					this.stats.countries.byArtist.push({ ...country, ...topArtist });
				}
			});
			if (this.bDebug) { console.log('computeGlobalStats:', this.stats.countries.byArtist); }
		}
		return this.stats;
	},
	/**
	 * Playlist of favourite tracks, using data from {@link wrapped.getTracksData}.
	 *
	 * @property
	 * @name computeTopTracksPlaylist
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{title:string, listens:number, handle:FbMetadbHandle[]}[]} tracksData
	 * @param {number} size
	 * @returns {FbMetadbHandleList}
	*/
	computeTopTracksPlaylist: function (tracksData, size = 100) {
		let handleList = new FbMetadbHandleList(tracksData.slice(0, size).map((track) => track.handle[0]));
		({ handleList } = shuffleByTags({ selItems: handleList, bSendToActivePls: false, bAdvancedShuffle: true, sortBias: 'rating' }) || { handleList: new FbMetadbHandleList() });
		this.playlists.top = handleList;
		return this.playlists.top;
	},
	/**
	 * Playlist of discovered tracks, using data from {@link wrapped.getTracksData}.
	 *
	 * @property
	 * @name computeDiscoverPlaylist
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{title:string, listens:number, handle:FbMetadbHandle[]}[]} tracksData
	 * @param {number} year
	 * @param {number} size
	 * @returns {FbMetadbHandleList}
	*/
	computeDiscoverPlaylist: function (tracksData, year, size = 100) {
		let handleList = new FbMetadbHandleList(tracksData.map((track) => track.handle[0]));
		const query = '%ADDED% DURING ' + year;
		if (this.bDebug) { console.log('computeDiscoverPlaylist: ' + query); }
		handleList = fb.GetQueryItemsCheck(handleList, query);
		if (handleList) {
			handleList = new FbMetadbHandleList(handleList.Convert().slice(0, size).shuffle());
			({ handleList } = shuffleByTags({ selItems: handleList, bSendToActivePls: false, bAdvancedShuffle: true, sortBias: 'rating' }) || { handleList: new FbMetadbHandleList() });
			this.playlists.discover = handleList;
		}
		return this.playlists.discover;
	},
	/**
	 * Playlist of top artists, using data from {@link wrapped.getArtistsData}.
	 *
	 * @property
	 * @name computeTopArtistsPlaylist
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{artist:string, listens:number}[]} artistsData
	 * @param {number} size
	 * @returns {FbMetadbHandleList}
	*/
	computeTopArtistsPlaylist: function (artistsData, size = 100) {
		const artists = artistsData.slice(0, 100).map((artist) => artist.artist).filter(Boolean);
		const query = queryJoin([
			'%RATING% MISSING OR %RATING% GREATER 2',
			queryCombinations(artists, _t(this.tags.artist), 'OR')
		], 'AND');
		if (this.bDebug) { console.log('computeTopArtistsPlaylist: ' + query); }
		/** @type {FbMetadbHandleList} */
		let handleList = fb.GetQueryItemsCheck(fb.GetLibraryItems(), query);
		if (handleList) {
			handleList = new FbMetadbHandleList(handleList.Convert().shuffle().slice(0, size));
			({ handleList } = shuffleByTags({ selItems: handleList, bSendToActivePls: false, bAdvancedShuffle: true, sortBias: 'rating' }) || { handleList: new FbMetadbHandleList() });
			this.playlists.topArtists = handleList;
		}
		return this.playlists.topArtists;
	},
	/**
	 * Playlist of top genres, using data from {@link wrapped.getGenresData}.
	 *
	 * @property
	 * @name computeTopGenresPlaylist
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{genre:string, listens:number}[]} genresData
	 * @param {number} size
	 * @returns {FbMetadbHandleList}
	*/
	computeTopGenresPlaylist: function (genresData, size = 100) {
		const genres = genresData.slice(0, 5).map((genre) => genre.genre).filter(Boolean);
		if (genres.length) {
			const query = queryJoin([
				'%RATING% MISSING OR %RATING% GREATER 2',
				queryJoin(queryCombinations(genres, ['GENRE', 'STYLE'], 'OR'), 'OR')
			], 'AND');
			if (this.bDebug) { console.log('computeTopGenresPlaylist: ' + query); }
			/** @type {FbMetadbHandleList} */
			let handleList = fb.GetQueryItemsCheck(fb.GetLibraryItems(), query);
			if (handleList) {
				handleList = new FbMetadbHandleList(handleList.Convert().shuffle().slice(0, size));
				({ handleList } = shuffleByTags({ selItems: handleList, bSendToActivePls: false, bAdvancedShuffle: true, sortBias: 'rating' }) || { handleList: new FbMetadbHandleList() });
				this.playlists.topGenres = handleList;
			}
		}
		return this.playlists.topGenres;
	},
	/**
	 * Playlist of top genres, using data from {@link wrapped.getCountriesData}.
	 *
	 * @property
	 * @name computeTopCountriesPlaylist
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{name:string, listens:number}[]} countriesData
	 * @param {number} size
	 * @returns {FbMetadbHandleList}
	*/
	computeTopCountriesPlaylist: function (countriesData, size = 100) {
		const ISO = this.stats.countries.byISO.map((country) => country.iso).filter(Boolean);
		if (ISO.length) {
			const filters = ISO.map((iso) => getZoneArtistFilter(iso, 'country')).filter(Boolean)
				.map((filter) => queryJoin(['%RATING% MISSING OR %RATING% GREATER 2', filter.query], 'AND'));
			const count = filters.length;
			if (count) {
				/** @type {FbMetadbHandleList} */
				let handleList = new FbMetadbHandleList();
				filters.forEach((query) => {
					let handleListCountry = fb.GetQueryItemsCheck(fb.GetLibraryItems(), query);
					if (this.bDebug) { console.log('computeTopCountriesPlaylist: ' + _p(handleListCountry.Count) + ' <- ' + query); }
					if (handleListCountry) {
						handleListCountry = new FbMetadbHandleList(handleListCountry.Convert().shuffle().slice(0, size / count));
						handleList.AddRange(handleListCountry);
					}
				});
				if (handleList.Count) {
					({ handleList } = shuffleByTags({ selItems: handleList, bSendToActivePls: false, bAdvancedShuffle: true, sortBias: 'rating' }) || { handleList: new FbMetadbHandleList() });
					this.playlists.topCountries = handleList;
				}
			}
		}
		return this.playlists.topCountries;
	},
	/**
	 * Playlist of similar genres to top genres, using data from {@link wrapped.stats.genres.similar}.
	 *
	 * @property
	 * @name computeSuggestedGenresPlaylist
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {string[]} genres
	 * @param {number} year
	 * @param {number} size
	 * @returns {(FbMetadbHandle|String)[]}
	*/
	computeSuggestedGenresPlaylist: function (genres, year, size = 100) {
		const mbids = [];
		const mbidsAlt = [];
		const tags = { TITLE: [], ARTIST: [] };
		const lb = listenBrainz;
		if (this.bOffline) {
			this.playlists.suggestions.genres = Promise.resolve((() => {
				const query = queryJoin([
					queryCombinations(genres, this.tags.genre, 'OR'),
					'%LAST_PLAYED_ENHANCED% SINCE ' + year + ' OR %LAST_PLAYED% SINCE ' + year
				], 'AND NOT');
				let handleList = fb.GetQueryItemsCheck(fb.GetLibraryItems(), query);
				if (this.bDebug) { console.log('computeSuggestedGenresPlaylist: ' + _p(handleList.Count) + ' <- ' + query); }
				if (handleList && handleList.Count) {
					({ handleList } = shuffleByTags({ selItems: handleList, bSendToActivePls: false, bAdvancedShuffle: true, sortBias: 'rating' }) || { handleList: new FbMetadbHandleList() });
					return handleList;
				}
				return [];
			})());
		} else {
			const workName = 'Computing suggested Genres playlists';
			this.isWorking.push({ name: workName });
			this.playlists.suggestions.genres = lb.getRecordingsByTag(genres, this.tokens.listenBrainz, size, 'or')
				.then((recommendations) => {
					recommendations.forEach((recording) => {
						mbids.push(recording.recording_mbid || '');
						mbidsAlt.push(['']);
						tags.TITLE.push('');
						tags.ARTIST.push('');
					});
					const count = mbids.length;
					// Retrieve title info
					return lb.lookupRecordingInfoByMBIDs(mbids.filter(Boolean), ['artist_credit_name', 'recording_mbid', 'recording_name', '[artist_credit_mbids]'], this.tokens.listenBrainz)
						.then((info) => {
							if (['artist_credit_name', 'recording_mbid', 'recording_name', '[artist_credit_mbids]'].every((tag) => Object.hasOwn(info, tag))) {
								for (let i = 0; i < count; i++) {
									if (mbids[i] === info.recording_mbid[i]) {
										if (info.recording_name[i]) { tags.TITLE[i] = info.recording_name[i]; }
										if (info.artist_credit_name[i]) { tags.ARTIST[i] = info.artist_credit_name[i]; }
										if (info['[artist_credit_mbids]'][i]) { mbidsAlt[i] = info['[artist_credit_mbids]'][i]; }
									}
								}
							}
						});
				}).then(() => {
					let libItems;
					if (globQuery.filter.length) {
						try { libItems = fb.GetQueryItems(fb.GetLibraryItems(), globQuery.filter); } // Sanity check
						catch (e) { libItems = fb.GetLibraryItems(); }
					} else { libItems = fb.GetLibraryItems(); }
					const notFound = [];
					let items = [];
					const queryArr = mbids.map((mbid, i) => {
						const tagArr = ['TITLE', 'ARTIST']
							.map((key) => { return { key, val: sanitizeQueryVal(_asciify(tags[key][i]).replace(/"/g, '')).toLowerCase() }; });
						const bMeta = tagArr.every((tag) => { return tag.val.length > 0; });
						const query = queryJoin(
							[
								bMeta ? tagArr.map((tag) => { return tag.key + ' IS ' + tag.val; }).join(' AND ') + ' AND NOT GENRE IS live AND NOT STYLE IS live' : '',
								'MUSICBRAINZ_TRACKID IS ' + mbid
							].filter(Boolean)
							, 'OR');
						return query;
					}).filter(Boolean);
					items = queryArr.map((query, i) => {
						let itemHandleList;
						try { itemHandleList = fb.GetQueryItems(libItems, query); } // Sanity check
						catch (e) { fb.ShowPopupMessage('Query not valid. Check query:\n' + query, 'ListenBrainz'); return; }
						// Filter
						if (itemHandleList.Count) {
							itemHandleList = removeDuplicatesV2({ handleList: itemHandleList, checkKeys: ['MUSICBRAINZ_TRACKID'], sortBias: globQuery.remDuplBias, bPreserveSort: false });
							itemHandleList = removeDuplicatesV2({ handleList: itemHandleList, checkKeys: [globTags.title, 'ARTIST'], bAdvTitle: true });
							return itemHandleList[0];
						}
						notFound.push({ creator: tags.ARTIST[i], title: tags.TITLE[i], tags: { MUSICBRAINZ_TRACKID: mbids[i], MUSICBRAINZ_ALBUMARTISTID: mbidsAlt[i][0], MUSICBRAINZ_ARTISTID: mbidsAlt[i] } });
						return null;
					});
					return { notFound, items };
				}).then(({ notFound, items }) => {
					if (notFound.length) {
						const search = notFound.filter((t) => t.title.length && t.creator.length);
						// Send request in parallel every x ms and process when all are done
						return Promise.parallel(search, youTube.searchForYoutubeTrack, 5).then((results) => {
							let j = 0;
							const itemsLen = items.length;
							results.forEach((result) => {
								for (void (0); j <= itemsLen; j++) {
									if (result.status !== 'fulfilled') { // Only code errors are output
										console.log('YouTube:', result.status, result.reason.message);
										break;
									}
									const link = result.value;
									if (!link || !link.length) { break; }
									if (!items[j]) {
										items[j] = link.url;
										break;
									}
								}
							});
							return items;
						});
					} else {
						return items;
					}
				}).then((items) => {
					items.shuffle();
					this.playlists.suggestions.genres = items;
					this.isWorking.splice(this.isWorking.findIndex((obj) => obj.name === workName), 1);
					return items;
				}).catch(() => {
					this.isWorking.splice(this.isWorking.findIndex((obj) => obj.name === workName), 1);
					this.playlists.suggestions.genres = [];
					return [];
				});
		}
		return this.playlists.suggestions.genres;
	},
	/**
		 * Playlist of similar artists to top Artists, using data from {@link wrapped.getArtistsData}.
		 *
		 * @property
		 * @name computeSuggestedArtistsPlaylist
		 * @kind method
		 * @memberof wrapped
		 * @type {function}
		 * @param {{artist:string, listens:number}[]} artistsData
		 * @param {number} year
		 * @param {number} size
		 * @returns {(FbMetadbHandle|String)[]}
		*/
	computeSuggestedArtistsPlaylist: function (artistsData, year, size = 100) {
		const artists = artistsData.slice(0, 5).map((artist) => artist.artist);
		const mbids = [];
		const mbidsAlt = [];
		const tags = { TITLE: [], ARTIST: [] };
		const lb = listenBrainz;
		if (this.bOffline) {
			this.playlists.suggestions.artists = Promise.resolve((() => {
				const query = queryJoin([
					queryCombinations(artists, _t(this.tags.artist), 'OR'),
					'%LAST_PLAYED_ENHANCED% SINCE ' + year + ' OR %LAST_PLAYED% SINCE ' + year
				], 'AND NOT');
				let handleList = fb.GetQueryItemsCheck(fb.GetLibraryItems(), query);
				if (this.bDebug) { console.log('computeSuggestedArtistsPlaylist: ' + _p(handleList.Count) + ' <- ' + query); }
				if (handleList && handleList.Count) {
					({ handleList } = shuffleByTags({ selItems: handleList, bSendToActivePls: false, bAdvancedShuffle: true, sortBias: 'rating' }) || { handleList: new FbMetadbHandleList() });
					return handleList;
				}
				return [];
			})());
		} else {
			const workName = 'Computing suggested Artists playlists';
			this.isWorking.push({ name: workName });
			this.playlists.suggestions.artists = lb.lookupArtistMBIDsByName(artists, true)
				.then((results) => {
					const mbids = results.filter(Boolean).map((d) => d.mbid);
					// [{artist_mbid, comment, gender, name, reference_mbid, score, type}, ...]
					return Promise.parallel(mbids, (mbid) => lb.retrieveSimilarArtists(mbid, this.tokens.listenBrainz), 15);
				})
				.then((results) => {
					return Promise.parallel(results, (result) => {
						if (result.status === 'fulfilled') {
							return Promise.resolve(result.value)
								.then((recommendations) => {
									recommendations.sort((a, b) => b.score - a.score);
									recommendations.slice(0, 5).forEach((artist) => {
										mbids.push(artist.artist_mbid || '');
										tags.ARTIST.push(artist.name);
										tags.TITLE.push('');
									});
									const count = mbids.length;
									// Retrieve some recordings from given artists
									return lb.getPopularRecordingsByArtist(mbids.filter(Boolean), this.tokens.listenBrainz, 5)
										.then((artistRecommendations) => { // [{artist_mbids, count, recording_mbid}, ...]
											let cache = '';
											const selection = [];
											artistRecommendations.forEach((recording) => {
												if (!isArrayEqual(cache, recording.artist_mbids)) {
													selection.push(recording);
													cache = recording.artist_mbids;
												} else { return; }
											});
											mbids.forEach((artist_mbid, i) => {
												const selLen = selection.length;
												mbidsAlt.push('');
												for (let j = 0; j < selLen; j++) {
													if (selection[j].artist_mbids.includes(artist_mbid)) {
														mbidsAlt[i] = selection.splice(j, 1)[0].recording_mbid;
														break;
													}
												}
											});
										})
										.then(() => { // Retrieve title info
											return lb.lookupRecordingInfoByMBIDs(mbidsAlt.filter(Boolean), ['recording_mbid', 'recording_name'], this.tokens.listenBrainz);
										})
										.then((info) => {
											if (['recording_mbid', 'recording_name'].every((tag) => Object.hasOwn(info, tag))) {
												for (let i = 0; i < count; i++) {
													if (mbidsAlt[i] === info.recording_mbid[i]) {
														if (info.recording_name[i]) { tags.TITLE[i] = info.recording_name[i]; }
													}
												}
											}
										});
								}).then(() => {
									let libItems;
									if (globQuery.filter.length) {
										try { libItems = fb.GetQueryItems(fb.GetLibraryItems(), globQuery.filter); } // Sanity check
										catch (e) { libItems = fb.GetLibraryItems(); }
									} else { libItems = fb.GetLibraryItems(); }
									const notFound = [];
									let items = [];
									const queryArr = mbids.map((mbid, i) => {
										const mbidAlt = mbidsAlt[i];
										const tagArr = ['ARTIST', 'TITLE']
											.map((key) => { return { key, val: sanitizeQueryVal(sanitizeTagValIds(tags[key][i])) }; });
										const bMeta = tagArr.every((tag) => { return tag.val.length > 0; });
										if (!tagArr[0].val.length > 0) { return; }
										if (mbidAlt) { // Get specific recordings
											const query = queryJoin(
												[
													(bMeta
														? tagArr.map((tag) => { return _q(sanitizeTagIds(_t(tag.key))) + ' IS ' + tag.val; }).join(' AND ')
														: tagArr.slice(0, 1).map((tag) => { return _q(sanitizeTagIds(_t(tag.key))) + ' IS ' + tag.val; }).join(' AND ')
													) + ' AND NOT GENRE IS live AND NOT STYLE IS live',
													'MUSICBRAINZ_TRACKID IS ' + mbidAlt
												].filter(Boolean)
												, 'OR'
											);
											return query;
										} else { // Or any track by such artist
											const query = queryJoin(
												[
													queryJoin(
														[
															tagArr.slice(0, 1).map((tag) => { return _q(sanitizeTagIds(_t(tag.key))) + ' IS ' + tag.val; }).join(' AND ') + ' AND NOT GENRE IS live AND NOT STYLE IS live',
															'MUSICBRAINZ_ARTISTID IS ' + mbid + ' OR MUSICBRAINZ_ALBUMARTISTID IS ' + mbid
														].filter(Boolean)
														, 'OR'
													),
													'NOT (%RATING% IS 1 OR %RATING% IS 2)'
												]
												, 'AND');
											return query;
										}
									}).filter(Boolean);
									items = queryArr.map((query, i) => {
										let itemHandleList;
										try { itemHandleList = fb.GetQueryItems(libItems, query); } // Sanity check
										catch (e) { fb.ShowPopupMessage('Query not valid. Check query:\n' + query, 'ListenBrainz'); return; }
										// Filter
										if (itemHandleList.Count) {
											itemHandleList = removeDuplicatesV2({ handleList: itemHandleList, checkKeys: ['MUSICBRAINZ_TRACKID'], sortBias: globQuery.remDuplBias, bPreserveSort: false });
											itemHandleList = removeDuplicatesV2({ handleList: itemHandleList, checkKeys: [globTags.title, 'ARTIST'], bAdvTitle: true });
											return itemHandleList[0];
										}
										if (tags.TITLE[i].length) {
											notFound.push({ creator: tags.ARTIST[i], title: tags.TITLE[i], tags: { MUSICBRAINZ_TRACKID: mbidsAlt[i], MUSICBRAINZ_ALBUMARTISTID: mbids[i], MUSICBRAINZ_ARTISTID: mbids[i] } });
										}
										return null;
									});
									// Add titles to report, since is a small amount, it's fine to iterate...
									const tfo = fb.TitleFormat('[%TITLE%]');
									items.forEach((handle, i) => {
										if (handle && tags.TITLE[i].length === 0) { tags.TITLE[i] = tfo.EvalWithMetadb(handle) || '  \u2715  '; }
									});
									return { notFound, items };
								}).then(({ notFound, items }) => {
									if (notFound.length) {
										const search = notFound.filter((t) => t.title.length && t.creator.length);
										// Send request in parallel every x ms and process when all are done
										return Promise.parallel(search, youTube.searchForYoutubeTrack, 5).then((results) => {
											let j = 0;
											const itemsLen = items.length;
											results.forEach((result) => {
												for (void (0); j <= itemsLen; j++) {
													if (result.status !== 'fulfilled') { // Only code errors are output
														console.log('YouTube:', result.status, result.reason.message);
														break;
													}
													const link = result.value;
													if (!link || !link.length) { break; }
													if (!items[j]) {
														items[j] = link.url;
														break;
													}
												}
											});
											return items;
										});
									} else {
										return items;
									}
								});
						} else {
							return null;
						}
					}, 15);
				})
				.then((results) => {
					return results.filter((r) => r.status === 'fulfilled').map((r) => r.value).flat(Infinity);
				})
				.then((items) => {
					items.shuffle();
					this.playlists.suggestions.artists = items.slice(0, size);
					this.isWorking.splice(this.isWorking.findIndex((obj) => obj.name === workName), 1);
					return items;
				}).catch(() => {
					this.isWorking.splice(this.isWorking.findIndex((obj) => obj.name === workName), 1);
					this.playlists.suggestions.artists = [];
					return [];
				});
		}
		return this.playlists.suggestions.artists;
	},
	/**
	 * It takes a `artist` parameter and returns a promise that resolves to an image.
	 *
	 * @name getArtistImg
	 * @kind method
	 * @memberof wrapped
	 * @param {string} artist
	 * @returns {string}
	*/
	getArtistImg: function (artist) {
		return this.bOffline
			? Promise.resolve(null)
			: spotify.searchArtistInfo(artist)
				.then((sData) => {
					let img = null;
					try { img = sData.best_match.items[0].images[0].url; } catch (e) { /* empty */ }
					return img;
				});
	},
	/**
	 * Takes the 'artistsData' from {@link wrapped.getArtistsData} or 'tracksData' from {@link wrapped.getTracksData} and mutates it to include an img property witht the URL.
	 *
	 * @name getArtistsImgs
	 * @kind method
	 * @memberof wrapped
	 * @param {{artist: string, listens: number}[]} dataArr
	 * @returns {promise.<{artist:string, listens:number, artistImg:string|null}[]>}
	*/
	getArtistsImgs: function (dataArr) {
		if (dataArr.length > 30) { throw new Error('getArtistsImgs: data is too large'); }
		return Promise.parallel(
			dataArr,
			(data) => this.getArtistImg(data.artist).then((img) => data.artistImg = img)
		).then(() => dataArr);
	},
	/**
	 * It takes a `track` parameter and returns a promise that resolves to an image.
	 *
	 * @name getTrackImg
	 * @kind method
	 * @memberof this
	 * @param {string} track
	 * @returns {string}
	*/
	getTrackImg: function (handle) {
		return utils.GetAlbumArtAsyncV2(void (0), handle);

	},
	/**
	 * Takes the 'tracksData' from {@link wrapped.getTracksData} and mutates it to include an img property with the URL.
	 *
	 * @name getTracksImgs
	 * @kind method
	 * @memberof wrapped
	 * @param {{title: string, listens: number}[]} tracksData
	 * @param {string} root - Path to save the images at '.\\img\\albums\\'
	 * @param {boolean} bRelative - Wether to use relative or absolute paths
	 * @param {boolean} bFormat - Use nconvert.exe to batch process DPI values
	 * @returns {promise.<{title:string, listens:number, albumImg:string|null}[]>}
	*/
	saveTracksImgs: function (tracksData, root = this.basePath, bRelative = true, bFormat = true) {
		if (tracksData.length > 30) { throw new Error('saveTracksImgs: tracksData is too large'); }
		const path = root + 'img\\albums\\';
		if (!_isFolder(path)) { _createFolder(path); }
		return Promise.parallel(
			tracksData,
			(track) => this.getTrackImg(track.handle[0]).then((artPromise) => {
				if (artPromise.image) {
					const imgPath = path + _asciify(sanitizePath(track.title)).replace(/ /, '').slice(0, 10) + '.jpg';
					artPromise.image.SaveAs(imgPath, 'image/jpeg');
					track.albumImg = bRelative ? imgPath.replace(root, '') : imgPath;
				} else { track.albumImg = (bRelative ? '' : root) + 'img\\fallback\\nocover.png'; }
				return Promise.resolve(track.albumImg);
			})
		).then(() => {
			if (bFormat) {
				console.log('Wrapped: processing track images with nconvert.exe');
				const nconvert = folders.xxx + 'helpers-external\\nconvert\\nconvert' + (soFeat.x64 ? '' : '_32') + '.exe';
				_runCmd('CMD /C ' + nconvert + ' -out jpeg -dpi 300 -resize 800 800 -overwrite -keepfiledate -ignore_errors "' + path + '*.jpg"', false);
			}
			return tracksData;
		});
	},
	/**
	 * Takes the 'artistsData' or 'tracksData' from {@link wrapped.getArtistsImgs}, downloads the images and and mutates it to change the img path.
	 *
	 * @name downloadArtistsImgs
	 * @kind method
	 * @memberof wrapped
	 * @param {{artist: string, listens: number, artistImg:string|null}[]} dataArr
	 * @param {string} root - Path to save the images at '.\\img\\artists\\'
	 * @param {boolean} bRelative - Wether to use relative or absolute paths
	 * @returns {promise.<{artist:string, listens:number, artistImg:string|null}[]>}
	*/
	downloadArtistsImgs: function (dataArr, root = this.basePath, bRelative = true) {
		const path = root + 'img\\artists\\';
		if (!_isFolder(path)) { _createFolder(path); }
		return Promise.parallel(
			dataArr,
			(data) => {
				if (data.artistImg && !this.bOffline) {
					const imgPath = path + _asciify(sanitizePath(data.artist)).replace(/ /, '').slice(0, 10) + '.jpg';
					_runCmd('CMD /C ' + folders.xxx + '\\helpers-external\\curl\\curl.exe --connect-timeout 5 --max-time 5 --retry 3 --retry-max-time 5 -L -o ' + _q(imgPath) + ' ' + data.artistImg, false);
					data.artistImg = bRelative ? imgPath.replace(root, '') : imgPath;
				} else {
					data.artistImg = (bRelative ? '' : root) + 'img\\fallback\\nocover.png';
				}
				return Promise.resolve(data.artistImg);
			}
		).then(() => dataArr);
	},
	/**
	 * Provides a path to a random background image found at root
	 *
	 * @name getRandomBackgroundImg
	 * @kind method
	 * @memberof wrapped
	 * @param {string} root - Path to save the images at '.\\img\\bg\\'
	 * @param {boolean} bRelative - Wether to use relative or absolute paths
	 * @returns {string}
	*/
	getRandomBackgroundImg: function (root = this.basePath, bRelative = true) {
		if (!this.backgroundImgs.length) {
			this.backgroundImgs = getFiles(root + 'img\\bg\\', new Set(['.jpg', '.jpeg', '.png']))
				.map((path) => path.replace(root, ''));
		}
		return (bRelative ? '' : root) + this.backgroundImgs.shuffle().splice(0)[0];
	},
	/**
	 * Provides a path to the character associated to the user
	 *
	 * @name getCharacterImg
	 * @kind method
	 * @memberof wrapped
	 * @param {string} root - Path to load the images at '.\\char\\'
	 * @param {boolean} bRelative - Wethere to use relative or absolute paths
	 * @returns {string}
	 */
	getCharacterImg: function (root = this.basePath, bRelative = true) {
		return (bRelative ? '' : root) + 'img\\char\\' + this.stats.character.main.name.toLowerCase().replace(/ /g, '') + '.jpg';
	},
	/**
	 * Provides a path to the character's background associated to the user, which must end with '_blur' prefix. Fallbacks to original image if not found
	 *
	 * @name getCharacterImgBlur
	 * @kind method
	 * @memberof wrapped
	 * @param {string} root - Path to load the images at '.\\char\\'
	 * @param {boolean} bRelative - Wether to use relative or absolute paths
	 * @returns {string}
	 */
	getCharacterImgBlur: function (root = this.basePath, bRelative = true) {
		const file = 'img\\char\\' + this.stats.character.main.name.toLowerCase().replace(/ /g, '') + '_blur.jpg';
		return (bRelative ? '' : root) +
			(_isFile(folders.xxx + 'images\\wrapped\\' + file) ? file : file.replace('_blur.jpg', '.jpg'));
	},
	/**
	 * Provides a path to the genre group image associated to an specific group
	 *
	 * @name getGenreGroupImg
	 * @kind method
	 * @memberof wrapped
	 * @param {string} group - Genre group from {@link wrapped.getGenreGroups} array
	 * @param {string} root - Path to load the images at '.\\genres\\'
	 * @param {boolean} bRelative - Wether to use relative or absolute paths
	 * @returns {string}
	 */
	getGenreGroupImg: function (group, root = this.basePath, bRelative = true) {
		group = group.toLowerCase();
		let fileName = '';
		switch (group) {
			case 'industrial_cluster':
			case 'metal_cluster':
			case 'rock_cluster':
			case 'pop_cluster':
			case 'country_cluster':
			case 'r&b_cluster':
			case 'blue_note_cluster':
			case 'jamaican_cluster':
			case 'rap_cluster':
			case 'Downtempo_cluster':
			case 'Folk_cluster':
				fileName = group.replace(/([_&])|(cluster)/g, '');
				break;
			case 'breakbeat dance_cluster':
				fileName = 'breakbeat';
				break;
			case 'four-to-the-floor dance_cluster':
				fileName = 'fourfloor';
				break;
			case 'classical music_cluster':
				fileName = 'classical';
				break;
			default:
				throw new Error('Wrapped.getGenreImg: group not recognized ' + group);
		}
		return (bRelative ? '' : root) + 'img\\genres\\' + fileName.replace(/ /g, '') + '.png';
	},
	/**
	 * Provides a path to the genre group image associated to the user.
	 *
	 * @name getMainGenreGroupImg
	 * @kind method
	 * @memberof wrapped
	 * @param {string} root - Path to load the images at '.\\genres\\'
	 * @param {boolean} bRelative - Wether to use relative or absolute paths
	 * @returns {string}
	 */
	getMainGenreGroupImg: function (root = this.basePath, bRelative = true) {
		return this.getGenreGroupImg(this.stats.genres.groups.main.name.toLowerCase(), root, bRelative);
	},
	/**
	 * Provides a path to the genre group image associated to an specific genre, calculating the group first.
	 *
	 * @name getGenreImg
	 * @kind method
	 * @memberof wrapped
	 * @param {string} genre - Genre string
	 * @param {string} root - Path to load the images at '.\\genres\\'
	 * @param {boolean} bRelative - Wether to use relative or absolute paths
	 * @returns {string|null}
	 */
	getGenreImg: function (genre, root = this.basePath, bRelative = true) {
		const group = this.getGenreGroups(genre)[0];
		return group ? this.getGenreGroupImg(group.toLowerCase(), root, bRelative) : null;
	},
	/**
	 * Retrieves a city image from wikimedia.org
	 *
	 @property
	 @name getCityImg
	 @kind method
	 @memberof wrapped
	 @type {function}
	 @param {{name:string, listens:number}} cityData
	 @returns {Promise<string>}
	*/
	getCityImg: function (cityData) {
		cityData.img = null;
		if (this.bOffline) { return Promise.resolve(null); }
		const url = 'https://commons.wikimedia.org/w/index.php?search=' + cityData.name + '&title=Special:MediaSearch&go=Go&type=image&filemime=jpeg&assessment=featured-image';
		return send({
			method: 'GET',
			bypassCache: true,
			requestHeader: [
				['user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36']
			],
			URL: url
		})
			.then((response) => {
				const match = (response.match(/href="([\w/:().%]*\.jpg)"/mi) || [null, null])[1];
				if (match) {
					return send({
						method: 'GET',
						bypassCache: true,
						requestHeader: [
							['user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36']
						],
						URL: match
					});
				}
				throw new Error('No image match');
			})
			.then((response) => {
				const match = (response.match(/<a href="([\w/:().%-]+?\.jpg)" class="mw-thumbnail-link">1,024/mi) || [null, null])[1];
				if (match) {
					cityData.img = match;
					return match;
				}
				throw new Error('No image source');
			})
			.catch(() => null);
	},
	/**
	 * Downloads a city image from
	 *
	 @property
	 @name downloadCityImg
	 @kind method
	 @memberof wrapped
	 @type {function}
	 @param {{name:string, listens:number, img:string}} cityData
	 @returns {Promise<string>}
	*/
	downloadCityImgs: function (citiesData, root = this.basePath, bRelative = true) {
		const path = root + 'img\\cities\\';
		if (!_isFolder(path)) { _createFolder(path); }
		return Promise.parallel(
			citiesData,
			(data) => {
				if (data.img && !this.bOffline) {
					const imgPath = path + _asciify(sanitizePath(data.name)).replace(/ /, '').slice(0, 10) + '.jpg';
					_runCmd('CMD /C ' + folders.xxx + '\\helpers-external\\curl\\curl.exe --connect-timeout 10 --max-time 10 --retry 3 --retry-max-time 10 -L -o ' + _q(imgPath) + ' ' + data.img, false);
					data.img = bRelative ? imgPath.replace(root, '') : imgPath;
				} else {
					data.img = (bRelative ? '' : root) + 'img\\fallback\\city.jpg';
				}
				return Promise.resolve(data.img);
			}
		).then(() => citiesData);
	},
	/**
	 * Retrieves all library statistics from {@link wrapped.getTracksData}, {@link wrapped.getArtistsData}, and {@link wrapped.getGenresData} for a given year
	 *
	 @property
	 @name getData
	 @kind method
	 @memberof wrapped
	 @type {function}
	 @param {number} year
	 @param {string} query - Recommended to use '%RATING% MISSING OR %RATING% GREATER 2'
	 @returns {Promise<{ genres: {genre:string, listens:number}[]; tracks: {title:string, listens:number, handle:FbMetadbHandle[]}[]; artists: {artist:string, listens:number}[]; }>}
	*/
	getData: function (year, query) {
		console.log('Wrapped: retrieving listening stats...');
		this.resetStats();
		this.resetPlaylists();
		return Promise.all([
			this.getGenresData(year, query),
			this.getTracksData(year, query),
			this.getArtistsData(year, query),
			this.getAlbumsData(year, query),
			this.getCountriesData(year, query),
			this.getCitiesData(year, query)
		])
			.then((data) => {
				data = { genres: data[0], tracks: data[1], artists: data[2], albums: data[3], countries: data[4], cities: data[5] };
				this.computeCharacterStats(data);
				this.computeGlobalStats(data, year);
				Object.keys(data).forEach((key) => {
					if (this.stats[key].total > 5) { data[key].length = 5; }
					if (this.bDebug) { console.log('getData[' + key + ']:', data[key]); }
				});
				return data;
			});
	},
	/**
	 * Retrieves and downloads all images from a given data object.
	 *
	 * @property
	 * @name getDataImages
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{ genres: {genre:string, listens:number}[]; tracks: {title:string, listens:number, handle:FbMetadbHandle[]}[]; artists: {artist:string, listens:number}[]; }} wrappedData
	 * @returns {Promise<{ genres: {genre:string, listens:number}[]; tracks: {title:string, listens:number, handle:FbMetadbHandle[], albumImg:string}[]; artists: {artist:string, listens:number, artistImg:string}[]; }>}
	*/
	getDataImages: function (wrappedData) {
		console.log('Wrapped: retrieving images...');
		return this.getArtistsImgs(wrappedData.artists)
			.then(() => this.getArtistsImgs(wrappedData.tracks))
			.then(() => this.getArtistsImgs(this.stats.countries.byArtist))
			.then(() => !!wrappedData.cities[0] && this.getArtistsImgs(wrappedData.cities[0].artists.slice(0, 3)))
			.then(() => this.downloadArtistsImgs(wrappedData.artists))
			.then(() => this.downloadArtistsImgs(wrappedData.tracks))
			.then(() => this.downloadArtistsImgs(this.stats.countries.byArtist))
			.then(() => !!wrappedData.cities[0] && this.downloadArtistsImgs(wrappedData.cities[0].artists.slice(0, 3)))
			.then(() => this.saveTracksImgs(wrappedData.tracks))
			.then(() => !!wrappedData.cities[0] && this.getCityImg(wrappedData.cities[0]))
			.then(() => this.downloadCityImgs(wrappedData.cities))
			.then(() => wrappedData);
	},
	createPlaylists: function (year) {
		if (this.playlists.top.Count) {
			sendToPlaylist(this.playlists.top, 'Top Favourite Songs ' + year);
		}
		if (this.playlists.discover.Count) {
			sendToPlaylist(this.playlists.discover, 'Discovered Songs ' + year);
		}
		if (this.playlists.topArtists.Count) {
			sendToPlaylist(this.playlists.topArtists, 'Top Artists ' + year);
		}
		if (this.playlists.topGenres.Count) {
			sendToPlaylist(this.playlists.topGenres, 'Top Genres ' + year);
		}
		if (this.playlists.topCountries.Count) {
			sendToPlaylist(this.playlists.topCountries, 'Top Countries ' + year);
		}
		(isPromise(this.playlists.suggestions.genres)
			? this.playlists.suggestions.genres
			: Promise.resolve(this.playlists.suggestions.genres)
		).then((pls) => {
			if (pls && (Array.isArray(pls) && pls.length || pls.Count)) {
				sendToPlaylist(pls, 'Suggested Genres ' + year);
			}
		});
		(isPromise(this.playlists.suggestions.artists)
			? this.playlists.suggestions.artists
			: Promise.resolve(this.playlists.suggestions.artists)
		).then((pls) => {
			if (pls && (Array.isArray(pls) && pls.length || pls.Count)) {
				sendToPlaylist(pls, 'Suggested Artists ' + year);
			}
		});
	},
	/**
	 * Used to generate a PDF report for a specific year. The "latexCmd" parameter is a. The "root" parameter is an .
	 *
	 * @property
	 * @name createPdfReport
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {{ year: number query: string latexCmd: string root?: string }} { year, query, latexCmd, root }
	 * @returns {any}
	*/
	createPdfReport: function ({ year, query = '', latexCmd, root = this.basePath }) {
		if (this.bOffline) { console.log('Wrapped: offline mode'); }
		this.cleanRoot(root);
		this.copyDependencies(root);
		return this.getData(year, query)
			.then((wrappedData) => this.getDataImages(wrappedData))
			.then((wrappedData) => {
				this.cleanExif();
				this.compressImgs();
				return this.formatLatexReport(wrappedData, year, root);
			})
			.then((report) => this.compileLatexReport(report, year, latexCmd, root));
	},
	/**
	 * Gives format in LaTeX to data retrieved {@link wrapped.getData} for a given year
	 *
	 * @property
	 * @name formatLatexReport
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {Promise<{ genres: {genre:string, listens:number}[]; tracks: {title:string, listens:number, handle:FbMetadbHandle[]}[]; artists: {artist:string, listens:number}[]; countries: {name:string, listens:number}[]; cities: {name:string, listens:number}[] }>} wrappedData - Data from {@link wrapped.getData}
	 * @param {number} year - Used for formatting purposes
	 * @param {?string} root - Optional parameter that specifies the root directory for the report
	 * @returns {string}
	*/
	formatLatexReport: function (wrappedData, year, root = this.basePath) {
		console.log('Wrapped: creating LaTeX report...');
		const latex = /[&#%$_^{}]/gi;
		for (const type in wrappedData) {
			wrappedData[type].forEach((item) => {
				['artist', 'title', 'genre', 'name'].forEach((key) => {
					if (Object.hasOwn(item, key)) {
						item[key] = item[key].replaceAll('\\', '/').replace(latex, '\\$&');
					}
				});
			});
		}
		// Helpers
		const topDay = this.stats.time.most.date
			? this.stats.time.most.date.toLocaleDateString('en-us', { month: 'long', day: 'numeric' })
			: '- no date -';
		const getUniqueLabel = (() => {
			const labels = new Set();
			return function (label) {
				label = label.replace(latex, '');
				while (labels.has(label)) { label += '_'; }
				labels.add(label);
				return label;
			};
		})();
		const getImage = (path) => (path || '').replaceAll('\\', '/');
		const getBgImg = (path) => this.getRandomBackgroundImg(path).replaceAll('\\', '/');
		const getCharImg = (path) => this.getCharacterImg(path).replaceAll('\\', '/');
		const getCharImgBlur = (path) => this.getCharacterImgBlur(path).replaceAll('\\', '/');
		const getMainGenreImg = (path) => this.getMainGenreGroupImg(path).replaceAll('\\', '/');
		const enumerate = (data, key) => {
			const subKey = ['artists', 'countries'].includes(key) ? 'artist' : 'title';
			const imgKey = (key === 'tracks' ? 'album' : subKey) + 'Img';
			(key === 'countries' ? data : data[key]).forEach((p, i) => {
				report += '\\begin{minipage}{0.05\\textwidth}\n';
				report += '\t{\\Large \\textbf{' + (i + 1) + '}}\n';
				report += '\\end{minipage}\n';
				report += '\\begin{minipage}{0.25\\textwidth}\n';
				report += '\t\\begin{figure}[H]\n';
				report += '\t\t\\centering\n';
				report += '\t\t\\includegraphics[width=100px,height=100px]{' + getImage(p[imgKey]) + '}\n';
				report += '\t\t\\label{fig:' + getUniqueLabel(p[subKey]) + '}\n';
				report += '\t\\end{figure}\n';
				report += '\\end{minipage}  \\hfill\n';
				report += '\\begin{minipage}{0.70\\textwidth}\n';
				report += subKey === 'title'
					? '\t\\textbf{\\textit{' + p[subKey].cut(20) + '}} by \\textbf{\\textit{' + p.artist.cut(20) + '}} with \\textit{' + p.listens + ' listens}.\n'
					: key === 'countries'
						? '\t{\\Large\\textbf{' + p.name.cut(20) + '}: \\textit{' + p[subKey].cut(20) + '}} with \\textit{' + p.listens + ' listens}.\n'
						: '\t{\\Large\\textbf{\\textit{' + p[subKey].cut(20) + '}} with \\textit{' + p.listens + ' listens}}.\n';
				report += '\\end{minipage}\n';
			});
		};
		// Report
		let report = '\\documentclass[12pt]{article}\n' +
			'\\usepackage[a4paper,left=1in,right=1in,top=0.75in,bottom=0in]{geometry} % margins\n' +
			'\\usepackage{graphicx} % figures\n' +
			'\\usepackage{float} % [H]\n' +
			'\\usepackage{xcolor} % Page color\n' +
			'\\usepackage{tikz} % Background Image\n' +
			'\\usetikzlibrary{shadows} % Shadows for nodes\n' +
			'\\usepackage{multicol} % Columns\n' +
			'\\usepackage[colorlinks=true,linkcolor=blue,urlcolor=black,bookmarksopen=true]{hyperref}\n' +
			'\\usepackage[open]{bookmark}\n' +
			'\\renewcommand{\\familydefault}{\\sfdefault}\n\n' +
			'\\newsavebox{\\picbox}\n' +
			'\\newcommand{\\cutpic}[3]{\n' +
			'\t\\savebox{\\picbox}{\\includegraphics[width=#2,height=#2]{#3}}\n' +
			'\t\\tikz\\node [draw, rounded corners=#1, line width=4pt,\n' +
			'\tcolor=orange, minimum width=\\wd\\picbox,\n' +
			'\tminimum height=\\ht\\picbox, path picture={\n' +
			'\t\t\\node at (path picture bounding box.center) {\n' +
			'\t\t\t\\usebox{\\picbox}};\n' +
			'\t}] {};}\n' +
			'\n\n' +
			'\\begin{document}\n';
		report += '\\pagecolor{pink}\n';
		report += '\\phantomsection\n';
		report += '\\addcontentsline{toc}{part}{Wrapped ' + year + '}\n';
		report += '\\clearpage \\vspace*{\\fill}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.4,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\begin{center}\n';
		report += '{\\fontsize{100}{80}\\selectfont Wrapped\\\\' + year + '}\n';
		report += '\\end{center}\n';
		report += '\\vfill %\n\n';
		report += '\n';
		// Me in year
		report += '\\pagebreak\n';
		report += '\\phantomsection\n';
		report += '\\addcontentsline{toc}{part}{User statistics}\n';
		report += '\\pagecolor{pink}\n';
		report += '\\clearpage \\vspace*{\\fill}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.4,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getCharImgBlur(root) + '}};\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\textwidth,height=24.4cm]{' + getCharImg(root) + '}};\n';
		report += '\\begin{center}\n';
		report += '\\tikz[baseline=0.6ex,overlay] \\fill [opacity=0.4,white] (-4,-1.6) rectangle (\\paperwidth,6ex);\n';
		report += '\\textbf{\\textit{\\Large ' + this.stats.character.main.description + '}}\n';
		report += '\\end{center}\n\n';
		report += '\n';
		// Burger genres
		report += '\\pagebreak\n';
		report += '\\phantomsection\n';
		report += '\\addcontentsline{toc}{part}{Genre statistics}\n';
		report += '\\pagecolor{lime}\n';
		report += '\\clearpage \\vspace*{\\fill}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\begin{figure}[H]\n';
		report += '\t\\centering\n';
		report += '\\begin{center}';
		report += '\t{\\Huge Your most listened genres}\\\\\n';
		report += '\t{\\large \u00D1am.}\n';
		report += '\\end{center}';
		report += '\\vspace{30mm}';
		{
			report += '\t\\setbox1=\\hbox{\\includegraphics[width=\\textwidth]{img/burguer/burguer}}\n';
			report += '\t\\begin{tikzpicture}\n';
			report += '\t\t\\filldraw [draw=lime, ultra thick] (0,0) rectangle ++(14cm,0);\n';
			let y = 9.5;
			const burguerColors = ['yellow!60', 'red!70', 'teal', 'orange!60', 'blue!60', 'purple!60'];
			this.stats.genres.byScore.forEach((genre, i) => {
				const iH = i === 0 ? 2.5 : round(6 * (genre.score + this.stats.genres.byScore[0].score / 4) / 100, 2);
				y -= iH;
				report += '\t\t\\filldraw [fill=' + burguerColors[i] + ', draw=' + burguerColors[i] + '] (-1,' + y + ') rectangle ++(14cm,' + iH + ');\n';
				report += '\t\t\\node[rectangle] (a) at (6,' + round(y + iH / 2, 1) + ') {\\Large \\textbf{' + genre.genre + '}};\n';
			});
			report += '\t\\end{tikzpicture}\\llap{\\includegraphics[width=\\textwidth]{img/burguer/burguer}}\n';
			report += '\\end{figure}\n';
		}
		report += '\\vfill %\n\n';
		// Total genres
		report += '\\pagebreak\n';
		report += '\\clearpage \\vspace*{\\fill}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\begin{center}\n';
		report += '{\\Huge ' + year + ' has been great...}\\\\\n';
		report += '\\vspace{15mm}\n';
		report += '{\\Large You have listened to \\textbf{\\textit{' + this.stats.genres.total + '}} genres.}\n';
		report += '\\end{center}\n';
		report += '\\vfill %\n\n';
		// Genre groups
		report += '\\pagebreak\n';
		report += '\\pagecolor{lime}\n';
		report += '\\clearpage \\vspace*{\\fill}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\phantomsection\n';
		report += '\\addcontentsline{toc}{section}{Top music categories}\n';
		report += '\\begin{center}\n';
		report += '\\textit{\\Huge Your listening habits are specially identified with the following musical groups...}\\\\\n';
		report += '\\end{center}\n';
		report += '\\vspace{15mm}\n';
		report += '\\begin{center}\n';
		report += '\\begin{tikzpicture}[node distance={22mm},minimum size=2cm,main/.style = {draw,circle,fill=blue!15,general shadow={fill=blue!60,shadow xshift=3pt,shadow yshift=-3pt}}]\n';
		this.stats.genres.groups.scores.slice(0, 4).forEach((group, i) => {
			const name = group.name.replace(/dance_cluster|music_cluster|cluster/gi, '')
				.replace(/[ _]/gi, ' ').replace(latex, '\\$&');
			report += '\t\\node[main,scale=' + Math.max((4 - i), 1) + ',align=center] (' + (i + 1) + ') ' +
				(i > 0 ? '[below right of=' + i + ']' : '') +
				'{' + name + '\\\\{\\scriptsize' + _p(group.score + '\\%') + '}};\n';
		});
		report += '\\end{tikzpicture}\n';
		report += '\\end{center}\n';
		report += '\\vspace{20mm}\n';
		report += '\\vfill %\n\n';
		// Genres
		report += '\\pagebreak\n';
		report += '\\pagecolor{lime}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\section[Your top 5 Genres]{Your top 5 Genres:}\n';
		report += '\\begin{enumerate}\n';
		wrappedData.genres.forEach((genre) => {
			report += '\t\\item \\textbf{\\textit{' + genre.genre + '}} with \\textit{' + genre.listens + ' listens}.\n';
		});
		report += '\\end{enumerate}\n';
		if (this.stats.genres.groups.main.name) {
			report += '\\begin{figure}[H]\n';
			report += '\t\\centering\n';
			report += '\t\\includegraphics[height=275px]{' + getMainGenreImg() + '}\n';
			report += '\t\\label{fig:screenshot001}\n';
			report += '\\end{figure}\n';
		}
		if (this.stats.genres.similar.length) {
			report += '\\subsection[Similar genres]{Other genres similar to your favourites you may like:}\n';
			report += '\\begin{multicols}{2}\n';
			report += '\t\\begin{itemize}\n';
			this.stats.genres.similar.slice(0, 16).forEach((genre) => {
				report += '\t\\item \\textbf{\\textit{' + genre.replace(latex, '\\$&') + '}}.\n';
			});
			report += '\t\\end{itemize}\n';
			report += '\\end{multicols}\n';
			report += '\n';
		}
		// Total tracks
		report += '\\pagebreak\n';
		report += '\\phantomsection\n';
		report += '\\addcontentsline{toc}{part}{Tracks statistics}\n';
		report += '\\pagecolor{purple}\n';
		report += '\\clearpage \\vspace*{\\fill}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\begin{center}\n';
		report += '{\\Huge You have listened to \\textbf{\\textit{' + this.stats.tracks.total + '}} tracks in ' + year + '.}\\\\\n';
		report += '\\vspace{15mm}\n';
		report += '{\\Large But there is one special track for you...}\n';
		report += '\\end{center}\n';
		report += '\\vfill %\n\n';
		// Top track
		if (this.stats.tracks.total > 0) {
			report += '\\pagebreak\n';
			report += '\\pagecolor{purple}\n';
			report += '\\clearpage \\vspace*{\\fill}\n';
			report += '\\tikz[remember picture,overlay] \\node[opacity=0.4,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getImage(wrappedData.tracks[0].artistImg) + '}};\n';
			report += '\\phantomsection\n';
			report += '\\addcontentsline{toc}{section}{Top Track}\n';
			report += '\\begin{center}\n';
			report += '{\\Huge The track you have listened the most has been \\textbf{\\textit{' + wrappedData.tracks[0].title + '}} by \\textbf{\\textit{' + wrappedData.tracks[0].artist.cut(20) + '}}.}\n\n';
			report += '\\begin{figure}[H]\n';
			report += '\t\\centering\n';
			report += '\t\\includegraphics[width=400px]{' + getImage(wrappedData.tracks[0].albumImg) + '}\n';
			report += '\t\\label{fig:' + getUniqueLabel(wrappedData.tracks[0].title) + '}\n';
			report += '\\end{figure}\n';
			report += '{\\Large You have played it \\textbf{\\textit{' + wrappedData.tracks[0].listens + '}} times this year.}\n\n';
			report += '\\end{center}\n';
			report += '\\vfill %\n\n';
		}
		// Tracks
		report += '\\pagebreak\n';
		report += '\\pagecolor{purple}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\section[Your top 5 Tracks]{Your top 5 Tracks:}\n';
		enumerate(wrappedData, 'tracks');
		report += '\n';
		// Total listening time
		report += '\\pagebreak\n';
		report += '\\phantomsection\n';
		report += '\\addcontentsline{toc}{part}{Listening statistics}\n';
		report += '\\pagecolor{red}\n';
		report += '\\clearpage \\vspace*{\\fill}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\begin{center}\n';
		report += '{\\Large In total, \\textbf{\\textit{' + this.stats.time.minutes + '}} minutes of music.}\\\\\n';
		report += '\\vspace{15mm}\n';
		report += '{\\Large That\'s \\textbf{\\textit{' + this.stats.time.days + '}} days non-stop.}\\\\\n';
		report += '\\end{center}\n';
		report += '\\vfill %\n\n';
		// Day with more listening time
		report += '\\pagebreak\n';
		report += '\\pagecolor{red}\n';
		report += '\\clearpage \\vspace*{\\fill}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\begin{center}\n';
		report += '{\\Large \\textbf{\\textit{' +
			topDay +
			'}} was a special day for you, listening during \\textbf{\\textit{' +
			this.stats.time.most.minutes +
			'}} minutes to your favourite music.}\\\\\n';
		report += '\\end{center}\n';
		report += '\\vfill %\n\n';
		// Artist by month
		report += '\\phantomsection\n';
		report += '\\addcontentsline{toc}{part}{Artists statistics}\n';
		wrappedData.artists.forEach((artist, i) => {
			const month = this.stats.artists.byMonth[i].month;
			const monthName = this.stats.artists.byMonth[i].monthName;
			report += '\\pagebreak\n';
			if (i === 0) { report += '\\phantomsection\n\\addcontentsline{toc}{section}{Artists by month}\n'; }
			report += '\\pagecolor{teal}\n';
			report += '\\clearpage \\vspace*{\\fill}\n';
			report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
			report += '\\begin{center}\n';
			report += '{\\Huge \\textbf{N\u00BA' + (i + 1) + '}}\\\\\n';
			report += '\\vspace{2mm}\n';
			report += '{\\Huge \\textbf{' + artist.artist.cut(20) + '}}\n';
			report += '\\begin{figure}[H]\n';
			report += '\t\\centering\n';
			report += '\t\\setbox1=\\hbox{\\includegraphics[width=400px]{' +
				getImage('img\\month\\' + month + '.png') + '}}\n	';
			report += '\t\\includegraphics[width=400px]{' +
				getImage('img\\month\\' + month + '.png') +
				'}\\llap{\\makebox[\\wd1][c]{\\raisebox{150px}{\\cutpic{10px}{100px}{' +
				getImage(wrappedData.artists[i].artistImg) +
				'}}}}\n';
			report += '\t\\label{fig:' + getUniqueLabel(wrappedData.artists[0].artist.cut(20)) + '}\n';
			report += '\\end{figure}\n';
			report += '{\\Large Month with more listens:\\\\\n';
			report += '\\textbf{' + monthName + '}}\n';
			report += '\\end{center}\n';
			report += '\\vfill %\n\n';
		});
		// Artists
		report += '\\pagebreak\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\section[Your top 5 Artists]{Your top 5 Artists:}\n';
		enumerate(wrappedData, 'artists');
		// Total artists
		report += '\\pagebreak\n';
		report += '\\clearpage \\vspace*{\\fill}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\begin{center}\n';
		report += '{\\Huge You didn\'t waste your time in ' + year + '...}\\\\\n';
		report += '\\vspace{15mm}\n';
		report += '{\\Large You have listened to \\textbf{\\textit{' + this.stats.artists.total + '}} artists.}\n';
		report += '\\end{center}\n';
		report += '\\vfill %\n\n';
		// Top artist
		if (this.stats.artists.total > 0) {
			report += '\\pagebreak\n';
			report += '\\phantomsection\n';
			report += '\\addcontentsline{toc}{section}{Top Artist}\n';
			report += '\\clearpage \\vspace*{\\fill}\n';
			report += '\\tikz[remember picture,overlay] \\node[opacity=0.4,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getImage(wrappedData.artists[0].artistImg) + '}};\n';
			report += '\\begin{figure}[H]\n';
			report += '\t\\centering\n';
			report += '\t\\includegraphics[width=400px,height=800px,keepaspectratio]{' + getImage(wrappedData.artists[0].artistImg) + '}\n';
			report += '\t\\label{fig:' + getUniqueLabel(wrappedData.artists[0].artist.cut(20)) + '}\n';
			report += '\\end{figure}\n';
			report += '\\vspace{5mm}\n';
			report += '\\begin{center}\n';
			report += '{\\Huge Your favourite artist has been \\textbf{\\textit{' + wrappedData.artists[0].artist.cut(20) + '}} with \\textbf{\\textit{' + wrappedData.artists[0].listens + '}} listens and \\textbf{\\textit{' + this.stats.artists.top.tracks + '}} different tracks played this year.}\n\n';
			report += '\\end{center}\n';
			report += '\\vfill %\n\n';
			// Top artist's track
			report += '\\pagebreak\n';
			report += '\\clearpage \\vspace*{\\fill}\n';
			report += '\\tikz[remember picture,overlay] \\node[opacity=0.4,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getImage(wrappedData.artists[0].artistImg) + '}};\n';
			report += '\\begin{figure}[H]\n';
			report += '\t\\centering\n';
			report += '\t\\includegraphics[width=320px,height=320px]{' + getImage(this.stats.artists.top.topTrack.albumImg) + '}\n';
			report += '\t\\label{fig:' + getUniqueLabel(this.stats.artists.top.topTrack.title) + '}\n';
			report += '\\end{figure}\n';
			report += '\\vspace{10mm}\n';
			report += '\\begin{center}\n';
			report += '{\\Large Their most loved track for you has been \\textbf{\\textit{' + this.stats.artists.top.topTrack.title.replace(latex, '\\$&') + '}} and you have played it \\textbf{\\textit{' + this.stats.artists.top.topTrack.listens + '}} times this year.}';
			if (this.stats.artists.top.topTrack === wrappedData.tracks[0]) {
				report += '\\\\\n';
				report += '\\vspace{5mm}\n';
				report += '\\textbf{\\textit{\\Large It\'s also your overall most listened track this year!}}\n';
			} else {
				report += '\n';
			}
			report += '\\end{center}\n';
			report += '\\vfill %\n\n';
		}
		// Regions
		report += '\\pagebreak\n';
		report += '\\phantomsection\n';
		report += '\\addcontentsline{toc}{part}{Region statistics}\n';
		report += '\\pagecolor{brown}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\section[Your listens around the world]{Your listens around the world:}\n';
		report += '\\begin{enumerate}\n';
		wrappedData.countries.forEach((country) => {
			report += '\t\\item \\textbf{\\textit{' + country.name.cut(20) + '}} with \\textit{' + country.listens + ' listens}.\n';
		});
		report += '\\end{enumerate}\n';
		report += '\\vspace{15mm}\n';
		report += '\\begin{figure}[H]\n';
		report += '\t\\centering\n';
		report += '\t\\setbox1=\\hbox{\\includegraphics[width=15cm]{img/map/worldmap_shapes}}\n';
		report += '\t\\includegraphics[width=15cm]{img/map/worldmap_shapes}';
		this.stats.countries.byISO.forEach((country) => {
			report += '\\llap{\\includegraphics[width=15cm]{img/map/' + country.iso + '}}';
		});
		report += '\n';
		report += '\\end{figure}\n';
		// Top Artist by Region
		report += '\\pagebreak\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\section[Top Artist from Country]{Top Artist from Country:}\n';
		enumerate(this.stats.countries.byArtist, 'countries');
		// Sound City
		report += '\\pagebreak\n';
		report += '\\phantomsection\n';
		report += '\\addcontentsline{toc}{section}{Sound Town}\n';
		report += '\\clearpage \\vspace*{\\fill}\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
		report += '\\tikz[remember picture,overlay] \\node[opacity=1,inner sep=0pt] at (current page.center){\\includegraphics[width=500px]{img/soundcity/travel}};\n';
		report += '\\tikz[remember picture,overlay] \\node at (current page.45){\\raisebox{-40mm}{\\fontencoding{T1}\\fontfamily{qzc}\\selectfont{\\Large ' +
			topDay + ' ' + year + '\\hspace{' + (78 + Math.max(topDay.length - 10, 0) * 2) + 'mm}}}};\n';
		report += '\\vspace{139mm}\n';
		report += '\\begin{center}\n';
		report += '{\\fontencoding{T1}\\fontfamily{qzc}\\selectfont\n';
		report += '\t{\\Large This year, your listening took you places...\\\\\n';
		report += '\tAnd one place listened just like you.}\n';
		report += '}\n';
		report += '\\end{center}\n';
		report += '\\vfill %\n\n';
		if (this.stats.countries.total > 0) {
			report += '\\pagebreak\n';
			report += '\\clearpage \\vspace*{\\fill}\n';
			report += '\\tikz[remember picture,overlay] \\node[opacity=0.1,inner sep=0pt] at (current page.center){\\includegraphics[width=\\paperwidth,height=\\paperheight]{' + getBgImg(root) + '}};\n';
			report += '\\begin{center}\n';
			report += '{\\Huge \\textbf{' + wrappedData.cities[0].name + ', ' + wrappedData.cities[0].country + '}}\\\\\n';
			report += '\\vspace{7mm}\n';
			report += '\\begin{figure}[H]\n';
			report += '\t\\centering\n';
			report += '\t\\cutpic{10px}{400px}{' + getImage(wrappedData.cities[0].img) + '}\n';
			const artistsCity = wrappedData.cities[0].artists.length;
			if (artistsCity > 0) {
				const layout = artistsCity === 3 ? ['l', 'c', 'r'] : artistsCity === 2 ? ['l', 'r'] : ['c'];
				layout.forEach((align, i) => {
					report += '\t\\llap{\\makebox[425px][' + align + ']{\\raisebox{-50px}{\\cutpic{10px}{100px}{' + getImage(wrappedData.cities[0].artists[i].artistImg) + '}}}}\n';
				});
			}
			report += '\\end{figure}\n';
			report += '\\vspace{7mm}\n';
			if (artistsCity > 0) {
				const topArtistCity = wrappedData.cities[0].artists.slice(0, 3)
					.map((data) => '\\textbf{\\textit{' + data.artist + '}}')
					.joinLast(', ', ' or ');
				report += '{\\Large Some of your favourite artists, like ' + topArtistCity + ', were born here.}\n';
			}
			report += '\\end{center}\n';
			report += '\\vfill %\n\n';
		}
		// End
		report += '\n';
		report += '\\end{document}';
		return report;
	},
	/**
	 * Compiles a report from {@link wrapped.formatLatexReport} into PDF.
	 *
	 * @property
	 * @name compileLatexReport
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {string} report - LaTeX formatted text from {@link wrapped.formatLatexReport}
	 * @param {number} year - Used for formatting purposes
	 * @param {string|null} latexCmd - Command used to convert LaTeX files to PDF format
	 * @param {?string} root - Optional parameter that specifies the root directory for the report
	 * @returns {boolean}
	 */
	compileLatexReport: function compileLatexReport(report, year, latexCmd, root = this.basePath) {
		console.log('Wrapped: compiling LaTeX report...');
		// Save report
		const fileName = 'Wrapped_' + year;
		const input = root + fileName + '.tex';
		const output = root + fileName + '.pdf';
		console.log('Wrapped: saving .tex file to\n\t' + input);
		_recycleFile(input);
		_save(input, report, false);
		// Parse cmd
		if (!latexCmd || !latexCmd.length) {
			latexCmd = 'lualatex --enable-installer --interaction=nonstopmode --jobname=Wrapped_%4 --output-directory=%3 %1';
		}
		latexCmd = latexCmd
			.replace(/%1/gi, _q(input))
			.replace(/%2/gi, _q(output))
			.replace(/%3/gi, _q(root.replace(/\\$/, '')))
			.replace(/%4/gi, year);
		console.log('Wrapped: processing latex\n\t' + latexCmd);
		if (latexCmd.indexOf('lualatex') !== -1) {
			console.log('Wrapped: double compilation required');
			_runCmd(latexCmd, true);
		}
		_runCmd(latexCmd, true);
		if (_isFile(output)) {
			_recycleFile(root + fileName + '.aux');
			_recycleFile(root + fileName + '.log');
			console.log('Wrapped: opening .pdf file at\n\t' + input);
			_run(output);
			return true;
		}
		return false;
	},
	/**
	 * Copies all dependencies required to create the report to temp folder
	 *
	 * @property
	 * @name copyDependencies
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {?string} root - Optional parameter that specifies the root directory for the report
	 */
	copyDependencies: function (root = this.basePath) {
		// Copy dependencies
		if (!_isFolder(root)) { _createFolder(root); }
		['bg', 'char', 'genres', 'month', 'burguer', 'soundcity', 'map', 'fallback'].forEach((folder) => {
			const path = root + 'img\\' + folder + '\\';
			if (!_isFolder(path)) {
				_createFolder(path);
				const files = getFiles(
					folders.xxx + (folder === 'map'
						? 'helpers-external\\countries-mercator\\'
						: 'images\\wrapped\\' + folder + '\\'
					), new Set(['.jpg', '.jpeg', '.png'])
				);
				files.forEach((file) => _copyFile(file, path + file.split('\\').slice(-1)[0], true));
			}
		});
	},
	/**
	 * Cleans temp folder (but not dependencies)
	 *
	 * @property
	 * @name cleanRoot
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {?string} root - Optional parameter that specifies the root directory for the report
	 */
	cleanRoot: function (root = this.basePath) {
		['img\\albums', 'img\\artists'].forEach((folder) => _deleteFolder(root + folder));
	},
	/**
	 * Cleans exif data from all images on temp folder, requires exiftool to be present at 'helpers-external\exiftool', otherwise it is skipped.
	 *
	 * See {@link https://exiftool.org}
	 *
	 * @property
	 * @name cleanExif
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {?string} root - Optional parameter that specifies the root directory for the report
	 */
	cleanExif: function (root = this.basePath) {
		const exifTool = folders.xxx + 'helpers-external\\exiftool\\exiftool.exe';
		if (_isFile(exifTool)) {
			console.log('Wrapped: processing images with exiftool.exe');
			_runCmd('CMD /C "' + exifTool + '" -overwrite_original -r -ext jpg -ext gif -ext png -EXIF= "' + root + 'img"', false);
		}
	},
	/**
	 * Compress all images on temp folder, requires pingo to be present at 'helpers-external\pingo', otherwise it is skipped.
	 *
	 * See {@link https://css-ig.net}
	 *
	 * @property
	 * @name compressImgs
	 * @kind method
	 * @memberof wrapped
	 * @type {function}
	 * @param {?string} root - Optional parameter that specifies the root directory for the report
	 */
	compressImgs: function (root = this.basePath) {
		const pingo = folders.xxx + 'helpers-external\\pingo\\pingo.exe';
		if (_isFile(pingo)) {
			console.log('Wrapped: processing images with pingo.exe');
			_runCmd('CMD /C "' + pingo + '" -quiet"' + root + 'img\\albums"', false);
			_runCmd('CMD /C "' + pingo + '" -quiet"' + root + 'img\\artists"', false);
			_runCmd('CMD /C "' + pingo + '" -quiet"' + root + 'img\\bg"', false);
			_runCmd('CMD /C "' + pingo + '" -quiet"' + root + 'img\\char"', false);
		}
	}
};