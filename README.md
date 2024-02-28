# Wrapped-SMP
[![version][version_badge]][changelog]
[![CodeFactor][codefactor_badge]](https://www.codefactor.io/repository/github/regorxxx/wrapped-smp/overview/main)
[![Codacy Badge][codacy_badge]](https://www.codacy.com/gh/regorxxx/Wrapped-SMP/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=regorxxx/Wrapped-SMP&amp;utm_campaign=Badge_Grade)
![GitHub](https://img.shields.io/github/license/regorxxx/Wrapped-SMP)  
User listening statistics for [foobar2000](https://www.foobar2000.org), using [Spider Monkey Panel](https://theqwertiest.github.io/foo_spider_monkey_panel). Analyzes user listening habits and outputs a report similar to Spotify's wrapped and personalized playlists.

![Animation4](https://user-images.githubusercontent.com/83307074/116752367-002d9100-a9f5-11eb-8a03-0ee323634742.gif)

## Features

![Animation5](https://user-images.githubusercontent.com/83307074/116752374-01f75480-a9f5-11eb-9d30-a9958079b1ee.gif)

- Computes statistics from the library by:
	* Listening behavior
	* Genres/styles
		+ Total
		+ Top 5
		+ Suggested genres
	* Musical categories (chart)
	* Tracks
		+ Total
		+ Most played track
		+ Top 5
	* Listens
		+ Total (minutes/days)
		+ Day with most listens
	* Artists
		+ Total
		+ Top 5
		+ Months reels
		+ Most played artist (and track)
	* Regions
		+ Top 5
		+ Artist/Country with more listens
	* Sound town
		+ Top 3 artists from that city
	* Mood stats (chart)
	* BPM stats (chart)
	* Key stats (chart)

- Downloads artist and city images.
  (Offline mode may be set to skip image downloading)

- Retrieves album covers.

- Generates random backgrounds (which can be customized by user).

- Outputs a report in Latex format. Compilation in PDF.
  (skipped with Shift + L. Click)

- Playlists recommendations: 
  (skipped with Ctrl + L. Click)
	* Top Favourite Songs
	* Discovered Songs (during the year)
	* Top Artists
	* Top Genres
	* Top Countries
	* Suggested Genres (you may like) (ListenBrainz)
	  (0ffline mode may be set to only use queries)
	* Suggested Artists (you make like) (ListenBrainz)
	  (0ffline mode may be set to only use queries)

![Animation6](https://user-images.githubusercontent.com/83307074/116752378-03c11800-a9f5-11eb-9971-b3eff6e8d0fa.gif)

## Compatible with (toolbar)
1. [Search-by-Distance-SMP](https://github.com/regorxxx/Search-by-Distance-SMP): creates intelligent "spotify-like" playlist using high-level data from tracks and computing their similarity using genres/styles.
2. [Playlist-Tools-SMP](https://github.com/regorxxx/Playlist-Tools-SMP): Offers different pre-defefined examples for intelligent playlist creation.
3. [ListenBrainz-SMP](https://github.com/regorxxx/ListenBrainz-SMP): Integrates Listenbrainz's feedback and recommendations.
4. [Autobackup-SMP](https://github.com/regorxxx/Autobackup-SMP): Automatic saving and backup of configuration and other data in foobar2000.
5. [Device-Priority-SMP](https://github.com/regorxxx/Device-Priority-SMP): Automatic output device selection.
5. [Fingerprint-Tools-SMP](https://github.com/regorxxx/Fingerprint-Tools-SMP): ChromaPrint and FooId fingerprinting tools.

![Auto-device2](https://user-images.githubusercontent.com/83307074/125861102-9253716b-ded6-41d5-83b5-84664edeb17f.gif)

## Requirements
1. [Spider Monkey Panel](https://theqwertiest.github.io/foo_spider_monkey_panel): Component required to install this javaScript addon.
2. [Playback Statistics](https://www.foobar2000.org/components/view/foo_playcount): Component required to retrieve playback statistics.
3. [Enhanced Playback Statistics](https://www.foobar2000.org/components/view/foo_enhanced_playcount): Component required to retrieve playback statistics.
4. [LaTeX](https://miktex.org): Recommended LuaLaTeX via MiKTeX. Any version works. [For Win 7 (64 bit) use 22.7 version (or lower)](https://www.npackd.org/p/org.miktex.MiKTeX64/22.7). [For Win 7 / Wine (32 bit), use 21.6 version](https://www.npackd.org/p/org.miktex.MiKTeX/21.6).

## Optional
1. [World-Map-SMP](https://github.com/regorxxx/World-Map-SMP): Script required if region related statistics/playlists are desired.
2. [ListenBrainz token](https://listenbrainz.org/settings/import/): To get playlists suggestions, with it will be less probably to reach rate limits using the public API.
4. [ExifTool](https://exiftool.org): Binary used to clean all metadata from images used on report.
2. [Pingo](https://css-ig.net/pingo): Binary used to optimize images used on report (will greatly reduce file size).

##  Installation
See [_TIPS and INSTALLATION (txt)](https://github.com/regorxxx/Wrapped-SMP/blob/main/_TIPS%20and%20INSTALLATION.txt) and the [Wiki](https://github.com/regorxxx/Wrapped-SMP/wiki/Installation).
Not properly following the installation instructions will result in scripts not working as intended. Please don't report errors before checking this.

[changelog]: CHANGELOG.md
[version_badge]: https://img.shields.io/github/release/regorxxx/Wrapped-SMP.svg
[codacy_badge]: https://api.codacy.com/project/badge/Grade/d68ef528f77646bca546fd206d28e8a1
[codefactor_badge]: https://www.codefactor.io/repository/github/regorxxx/Wrapped-SMP/badge/main
