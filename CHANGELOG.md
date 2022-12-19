## [0.0.21] - 2022-12-15

### Added
* `rech.batch.snippetsType` - Snippets configuration that can change the source of snippets. There are two options:
  * ***Rech Internal*** - Focused on people who work at Rech (*Portuguese*).
  * ***Community*** - Focused on community (*English*).
* `rech.batch.initialTabAligment` - Initial tab aligment configuration that can set the first tab size.

### Changed
* Tab sizes became dynamic according to `editor.tabSize` configuration.

### Removed
* Fixed ruler removed. To continue using the previous configuration, the user should add this line of code at the settings.json file:
  > "editor.rulers": [120]
