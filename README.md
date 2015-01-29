# Parser for .csv files

Lukkari parse application running on [atom-shell](https://github.com/atom/atom-shell). Select calendar files and post schedule entries to the server.

## Prerequisites

[Lukkari server](https://github.com/zaynetro/lukkari) should be up and running.

## TODO

- [x] Implement storage lib (saves app state)
- [x] Open browserWindow only for the first time (when dir is not set)
- [x] When new directory is selected update state
- [x] Watch files in selected directory (not in browserWindow)
- [x] Run csv-parse for changed files
- [ ] Store parsed data in log
- [ ] Show log in browserWindow
- [x] Show saved watch dir in browserWindow
- [x] Think of handling abbreviations in schedule files

### License

MIT
