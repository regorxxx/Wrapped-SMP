# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [1.2.0](#120---2024-03-21)
- [1.1.0](#110---2024-03-14)
- [1.0.0](#100---2024-02-28)

## [Unreleased][]
### Added
### Changed
### Removed
### Fixed

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

[Unreleased]: https://github.com/regorxxx/Wrapped-SMP/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.1.0....v1.2.0
[1.1.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.0.0....v1.1.0
[1.0.0]: https://github.com/regorxxx/World-Map-SMP/compare/7d0ed7e....v1.0.0