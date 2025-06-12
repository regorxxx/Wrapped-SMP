# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [1.4.0](#140---2024-10-09)
- [1.3.2](#132---2024-08-13)
- [1.3.1](#131---2024-07-30)
- [1.3.0](#130---2024-07-24)
- [1.2.0](#120---2024-03-21)
- [1.1.0](#110---2024-03-14)
- [1.0.0](#100---2024-02-28)

## [Unreleased][]
### Added
- Data: added support for [foo_playcount_2003](https://marc2k3.github.io/component/playcount-2003/) tags to check if a source needs to be auto-updated. i.e. '%2003_LAST_PLAYED%', '%2003_PLAYCOUNT%','%2003_LAST_PLAYED_AGO%' and '%2003_LAST_PLAYED_AGO2%'.
- Listens: added ListenBrainz listens retrieval support, which are merged and deduplicated with local listens (from foo_enhanced_playcount, foo_playcount_2003 and foo_playcount). It also works on offline mode.
- UI: toolbar tooltip now shows 'Shift + Win + R. Click' shortcut to open SMP/JSpliter panel menu (which works globally on any script and panel, at any position).
- UI: tooltip now shows the most relevant settings.
- Suggestions: suggested similar genres are now filtered to minimize showing genres already known (by listening period), but all alternative terms are still internally used to find more matches (i.e. trap, latin trap, ...). Algorithm has also been finetuned to provide more relevant results.
- Report: general layout improvements.
- Report: added listens per day and minutes per day stats.
- Report: added album stats; top 5 albums and most listened album info.
- Report: added album art for the most listened track on the day with most listens.
- Report: added rating statistics to tracks and albums (average).
- Report: added loved statistics to tracks and albums (at least 20% loved tracks).
- Report: added listens by month.
- Post-Processing: added support for [ghostscript](https://ghostscript.com/) post-processing to optimize the pdf size. Executable (gswin64c.exe or gswin32c.exe) and DLL (gsdll64.dll or gsdll32.dll) must be placed at '.'.\xxx-scripts\helpers-external\ghostscript\'.
- Post-Processing: added support for configurable CMD commands which are applied to output pdf.
- Installation: new panel menu, accessed through 'Ctrl + Win + R. Click' (which works globally on any script and panel, at any position), used to export/import panel settings and any other associated data. These entries may be used to fully backup the panel data, help when moving between different JS components (JSplitter <-> SMP) or even foobar2000 installations,, without needing to manually backup the panel properties or other external files (like .json, etc.).
- Readmes: Ctrl + L. Click on any entry within 'Add button' submenu on toolbar now opens directly their associated readme (without actually adding the button).
### Changed
- Installation: added support for foobar v2.25+ file-relative protocols.
- Installation: added popup warnings when scripts are installed outside foobar2000 profile folder. These checks can be tweaked at globSettings.json.
- Installation: script may now be installed at any path within the foobar profile folder, no longer limited to '[FOOBAR PROFILE FOLDER]\scripts\SMP\xxx-scripts\' folder. Obviously it may still be installed at such place, which may be preferred if updating an older version.
- Installation: multiple improvements to path handling for portable and non-portable installations. By default scripts will always try to use only relative paths to the profile folder, so scripts will work without any change when exporting the profile to any other installation. This change obviously doesn't apply to already existing installations unless restoring defaults.
- Configuration: 'Filter genres with Graph exclusions' has been changed to 'Filter genres with Graph descriptors' and now will remove any genre/style not found at the Graph (not only the exclusions).
- [JSplitter (SMP)](https://foobar2000.ru/forum/viewtopic.php?t=6378&start=360) support for locked playlists.
- Images: it uses now Biography images found at '.foobarProfilePath\yttm\art_img\$lower($cut(artist),1))\artist\' before trying to download them from Spotify. TF is configurable.
- Report: differentiates now between [different] tracks and listens.
- Report: suggested similar genres are now filtered to minimize showing genres already known (by listening period) and also deduplicated (i.e. no alternative terms shown). Algorithm has also been finetuned to provide more relevant results. The list is also shuffled so in case there are more than 16 suggestions, random ones are picked instead of only those from first genres (this only applies to the report and not the playlist generation).
- UI: unified script updates settings across all my scripts, look for 'Updates' submenu.
- UI: modified layout of all menu entries, now split to make usage easier. Added configuration submenu and readme entries.
- Readme: revised the entire readme with more detailed instructions, requisites, features and tips.
- Helpers: updated helpers.
- Helpers: general code cleanup on menus internal code. Please report any bug on extra separators or menu entries not working as expected.
### Removed
### Fixed
- ListenBrainz: wrong encoding of special chars '; , / ? : @ & = + $ #' for artist lookups.
- SMP Dynamic menu: fixed multiple errors on dynamic menus (un)registering.
- Images: workaround for some images not being fully processed in some cases by nconvert when creating the pdf (images appeared corrupted).
- Report: multiple layout fixes and improvements according to latex engine used.
- UI: '&' being displayed as '_' on tooltips.
- UI: multiple workarounds for rounded rectangles not being painted properly or producing crashes (SMP limitation).

## [1.4.0] - 2024-10-09
### Added
### Changed
- [JSplitter (SMP)](https://foobar2000.ru/forum/viewtopic.php?t=6378&start=360) support and ES2021 compatibility.
- Helpers: in case saving a file throws an error due to long paths (+255 chars) a warning popup will be shown.
- Helpers: updated helpers.
### Removed
### Fixed

## [1.3.2] - 2024-08-13
### Added
### Changed
- Helpers: updated helpers.
### Removed
### Fixed
- API: updated with latest ListenBrainz API changes.

## [1.3.1] - 2024-07-30
### Added
### Changed
- Helpers: updated helpers.
### Removed
### Fixed
- Auto-update: update checking not working.

## [1.3.0] - 2024-07-24
### Added
- Tags: added a correction for high BPM tracks count, set to 30% by default, to account for tracks which are reported with double the real BPM. i.e. X% of tracks over a threshold (currently 130 BPM) will be counted as if they had half BPM value. This correction may require tweaking for different music libraries (or if the user manually added BPM tags to every track), so adjust accordingly. For ex. if you create a playlist with 100 random high BPM tracks and 1/4 of them have double BPM, set the correction to 25% (we expect the proportion is uniform across all library).
- Readmes: added readme for global settings found at 'foobar2000\js_data\presets\global' .json files.
- Configuration: expanded user configurable file at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\globSettings.json' with a new setting for console logging to file. Disabled by default. Now this is a change from the previous behavior, where console was always logged to 'console.log' file at the [FOOBAR PROFILE FOLDER]. It can now be switched, but since it's probably not useful for most users is disabled by default.
### Changed
- Configuration: changed the remove duplicates bias to prefer lossless tracks with 16 bits per sample, 44.1 Khz sample rate and greater %DYNAMIC RANGE% values.
- Configuration: changed the remove duplicates bias to prefer tracks containing 'BEST' within a 'TRACKDSP' tag.
- Helpers: json button files are now saved with Windows EOL for compatibility improvements with Windows text editors.
- Helpers: improved performance of duplicates removal in multiple places.
- Helpers: updated helpers.
- Improved compatibility when running foobar2000 on drives without recycle bin.
### Removed
### Fixed
- ListenBrainz: updated with latest ListenBrainz API changes (for recommendations).
- Tags: removed workaround for [foo_skipcount's](https://hydrogenaud.io/index.php/topic,124742) tag retrieval bug added at [1.1.0](#110---2024-03-14), since it is not longer needed with newer versions. Note versions previous to 2.0.4c-beta will crash, so update the component as soon as possible.

## [1.2.0] - 2024-03-21
### Added
- Report: new report based on entire listening history. Works for tracks being played before [Enhanced Playback Statistics](https://www.foobar2000.org/components/view/foo_enhanced_playcount) was installed too, therefore is not a requisite for this single report type (still a requisite for the rest). Any time specific stat is skipped on this report though.
### Changed
- Tags: skip count now uses tags from [foo_skip](https://www.foobar2000.org/components/view/foo_skip) from [foo_skipcount](https://hydrogenaud.io/index.php/topic,124742), i.e. the greater one, for total skip counts. For time specific skips, only the latest.
- UI: menu entries now warn when a required plugin is missing.
- Helpers: updated helpers.
### Removed
### Fixed
- Tags: workaround for a tag retrieval bug introduced on later versions by [foo_skipcount](https://hydrogenaud.io/index.php/topic,124742).
- UI: readme not working at first init.
- Configuration: .json files at 'foobar2000\js_data\presets\global' not being saved with the calculated properties based on user values from other files.
- Fixed possible crash handling web request while closing foobar2000. See [this](https://hydrogenaud.io/index.php/topic,121047.msg1044579.html#msg1044579), although current methods don't use 'WinHttp.WinHttpRequest.5.1' but 'Microsoft.XMLHTTP' which hasn't given any problems yet.

## [1.1.0] - 2024-03-14
### Added
- Configuration: expanded user configurable file at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\globSettings.json' with a new setting for panel repaint debugging purpose. Disabled by default.
- Configuration: expanded user configurable file at '[FOOBAR PROFILE FOLDER]\js_data\presets\global\globSettings.json' with a new setting to check OS features on every panel startup. Enabled by default. This has been the default behavior since OS' features check was implemented, but it can now be disabled to improve init performance a bit, specially at foobar2000 startup (since it seems to hang in some cases when running it on slow HDDs or systems).
### Changed
- UI: Improved panel repaint routines to minimize resources usage.
- Helpers: updated helpers.
### Removed
### Fixed
- Crash at init due to wrong file name (buttons_stats_wrapped_menu.js).

## [1.0.0] - 2024-02-28
### Added
- First release.
### Changed
### Removed
### Fixed

[Unreleased]: https://github.com/regorxxx/Wrapped-SMP/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.3.2....v1.4.0
[1.3.2]: https://github.com/regorxxx/World-Map-SMP/compare/v1.3.1....v1.3.2
[1.3.1]: https://github.com/regorxxx/World-Map-SMP/compare/v1.3.0....v1.3.1
[1.3.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.2.0....v1.3.0
[1.2.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.1.0....v1.2.0
[1.1.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.0.0....v1.1.0
[1.0.0]: https://github.com/regorxxx/World-Map-SMP/compare/7d0ed7e....v1.0.0