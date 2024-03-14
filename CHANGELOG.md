# Changelog

## [Table of Contents]
- [Unreleased](#unreleased)
- [1.1.0](#110---2024-03-14)
- [1.0.0](#100---2024-02-28)

## [Unreleased][]
### Added
### Changed
### Removed
### Fixed

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

[Unreleased]: https://github.com/regorxxx/Wrapped-SMP/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/regorxxx/World-Map-SMP/compare/v1.0.0....v1.1.0
[1.0.0]: https://github.com/regorxxx/World-Map-SMP/compare/7d0ed7e....v1.0.0