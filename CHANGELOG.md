
# Change Log
All notable changes to this project will be documented in this file.

## [0.70] - 2023-12-13

### Added
- New tenor.com url format added
- Improved search with emoji alias
- Move the cursor when toggling emoji keyboard

### Changed
- Updated help tab
- Text fixes for GH
- Sponsors updated

### Removed
- buymeacoffee.com

## [0.69] - 2023-09-20

### Added
- Game icons based on the version of the game

### Changed
- Removed HH++ dependency

### Fixed
- Fixed /girl and /poses for games other than HH

## [0.68] - 2023-09-15

### Added
- Added Nutaku support (HH, CxH, PsH, GH)

### Changed
- Open sponsor profile in popup for current game

## [0.67] - 2023-09-06

### Added
- New emojis and new game icons
- The personal nickname color for sponsors is now invisible for players without the script
- The scrollbar has been beautified for Chrome, Edge and Opera (and probably more)

### Changed
- The emojis are now divided into two categories "Emojis" and "HH"

### Code contributions
- Many thanks for the code contributions xnh0x

## [0.66] - 2023-08-13

### Changed
- Updated sponsors and rewrote the code for the sponsors to support all games

## [0.64-0.65] - 2023-06-23

### Fixed
- Under certain circumstances an error occurred when the chat reconnected. This meant that the connection could not be successfully restored (chat remained offline)
- Minor compatibility issues of the chat tabs with different browsers (e.g. Google Chrome (Desktop))

## [0.62-0.63] - 2023-06-22

### Added
- Custom chat tabs (settings, help, information) adapted to the new tab system
- The two default tab buttons (chat and members) are replaced as they can move the window
- The active tab is highlighted with a pressed down tab button

## [0.61] - 2023-06-14

### Changed
- Kinkoid has changed the chat tabs system. The custom chat tabs have been temporarily disabled so that the chat can work again

## [0.60] - 2023-05-13

### Added
- Added support for GH

### Changed
- Sponsors updated
- Minor changes to enhance the user experience

## [0.55-0.59] - 2023-02-28 to 2023-04-14

### Changed
- Minor changes to enhance the user experience

## [0.53-0.54] - 2023-02-19

### Fixed
- KK bug fixed: Since the patch from Wednesday the chat does not work after logging in as long as you do not refresh the page. This is a bug from Kinkoid. I have now added a bugfix for it (GAME_FEATURE_CLUB)

## [0.52] - 2023-02-14

### Added
- Added @online / @offline to ping all online/offline club members

## [0.51] - 2023-02-08

### Changed
- Minor changes to enhance the user experience

## [0.49-0.50] - 2023-02-06

### Added
- Added sorting feature (move and swap) for custom gifs and emojis. Click the [⇔] button.

### Changed
- Minor changes to enhance the user experience

## [0.48] - 2023-02-02

### Fixed
- The problem that the pinned message lost its formatting after reconnection was fixed

## [0.46-0.47] - 2023-01-25

### Added
- Messages that reach the maximum length are now marked with "Max" (Max Message Size reached)

### Fixed
- KK bug fixed: Position of the exclamation mark

## [0.45] - 2023-01-21

### Changed
- Minor changes to enhance the user experience

## [0.44] - 2023-01-11

### Fixed
- The emoji server has been switched from maxcdn.com to cloudflare.com, as maxcdn.com has been shut down for good

## [0.43] - 2023-01-04

### Fixed
- The chat user interface has been fixed after KK's chat patch today

## [0.42] - 2022-12-28

### Fixed
- Fixed the offline "thank you" (dog) gif

## [0.41] - 2022-12-16

### Changed
- The sponsors have been updated
- Minor changes to enhance the user experience

## [0.40] - 2022-12-15

### Added
- The "Settings", "Help" and "Info" tabs have been added
- Nine different settings have been added
- Script information, sponsors and other script links added to the "Info" tab
- Added sound on new message / sound on new ping
- Added nickname color change for sponsors
- Chat log added to console to allow for longer chat history
- Open the hero page by clicking on the avatar in the chat
- Ping now also works with the members list
- Added new emojis

### Changed
- !hh and !poses commands changed to /girl and /poses
- !help command removed and moved to the "Help" tab

## [0.39] - 2022-11-14

### Added
- Added Ping Notification Feature to pinned message

### Fixed
- The pinned message was not parsed in some cases (final fix)

## [0.38] - 2022-11-11

### Added
- Added subdomains of giphy.com for custom emojis/gifs

## [0.37] - 2022-11-11

### Added
- Kinkoid's nickname change bug "fixed". Details: After a nickname change, the old nickname is displayed in the chat member list from time to time. This bug comes from the chat code of Kinkoid. I added a fix so that the affected player at least gets the ping notifications. The green ! (Invalid Ping) is still displayed in the chat if the name in the member list is incorrect

## [0.34-0.36] - 2022-11-09

### Added
- You can now add custom emojis/gifs

### Changed
- Minification to optimize performance
- Minor changes to enhance the user experience

## [0.33] - 2022-11-02

### Added
- The script was unlocked for CxH

## [0.32] - 2022-10-30

### Added
- Co-Leaders

## [0.31] - 2022-10-23

### Added
- The Dice Master was added to the /dice command to prevent deletion

## [0.30] - 2022-10-17

### Added
- Added the new command !script
- Added @match to include ? and # at the end of the url

### Changed
- Minor changes to enhance the user experience

## [0.28-0.29] - 2022-10-06

### Added
- The script was unlocked for PsH

## [0.26-0.27] - 2022-09-27

### Added
- The sponsors were added
- Image URLs not ending with .gif/.jpg/.png/.webp (e.g. https://www.domain.tld/image.jpg?width=200&height=150) will work now
- Added GIFs: !?
- Added Emojis: :tuturu: :louise_please: :happy_rin: :tada : :sadtada: :notlikethis:

### Changed
- Minor changes to enhance the user experience

## [0.25] - 2022-09-16

### Changed
- Minor changes to enhance the user experience

## [0.23-0.24] - 2022-09-11

### Changed
- Changed the sorting of custom emojis

### Fixed
- Emoji :shard: :shards: was missing due to copy-paste error

## [0.22] - 2022-09-10

### Added
- Added Emojis / GIFs Picker "EmojiKeyboard"
- "Random GIFs" can now be selected (in the picker or by adding _0, _1, _2, etc.)

## [0.20-0.21] - 2022-09-09

### Added
- Added GIFs: !25
- Added Emojis: :thx: :ty: :thanks:

### Changed
- Emojis are larger if the message contains nothing else
- Gif code can now be used anywhere in the text (Gif will still be displayed at the beginning of the message)
- Auto-Scroll is disabled when you scroll up 250 pixels instead of 300 pixels

## [0.19] - 2022-09-07

### Added
- Added GIFs: !headpat !ohmy
- Added some GIF aliases to !gz and !thx
- Added Emojis: :surprisedpika: :surprised: :bunny: :bunny_sad: :bunnys: :bunny_joy: :bunnyj: :bunny_realization: :bunnyr:

### Changed
- Minor changes to enhance the user experience

## [0.18] - 2022-08-31

### Fixed
- The pinned message was not parsed in some cases (experimental fix)

## [0.16-0.17] - 2022-08-29

### Changed
- Minor changes to enhance the user experience

### Fixed
- The ping notification did not disappear in some cases

## [0.15] - 2022-08-26

### Added
- Parsing pinned message with some restrictions (e.g. images or commands are not allowed)
- Added GIFs: !liar !? !rule !what !sleepy !proud / added some gifs to existing commands
- Added Emojis: :smug:

### Changed
- Minor changes to enhance the user experience

### Fixed
- Fixed the incompatibility with the new mute code in chat.js v66132017 (Kinkoid)

## [0.13-0.14] - 2022-08-18

### Added

- Added Emojis: :rip: :kanna_hi: :hi: :uwot: :wot: :kanna_nom: :kannanom: :kanna_headpat: :kannaheadpat: :thinky: :thonk:

### Changed

- Emojis work with text formatting characters

## [0.12] - 2022-07-25

### Changed

- Minor changes to enhance the user experience

## [0.11] - 2022-07-23

### Changed

- Your nickname is gold, the club leader is red and all members are blue

## [0.10] - 2022-07-22

### Added

- Added GIFs: !doubt !monster !clap
- Added Emojis: :potion_endurance: :potion_love: :potion_lust: :crystal:

### Changed

- Changed the commands !hh and !poses to make them language independent. Write the girl names in your language now

## [0.9] - 2022-07-20

### Added

- Added emoji :shard: / :shards:
- Added more shortforms of nicknames for club "Hērōēs Prāvī Forī [EN]"

### Changed

- !hh and !poses are ’´`' independent now

## [0.8] - 2022-07-14

### Added

- ArrowUp / ArrowDown Feature for message history

## [0.7] - 2022-07-14

### Changed

- HHCLUBCHATPLUSPLUS_INDICATOR changed to make it easier for non-script users to copy content without it
- Added temporary compatibility with HHCLUBCHATPLUSPLUS_INDICATOR v0.6 and lower

## [0.6] - 2022-07-08

### Changed

- !help text update
- Minor changes to enhance the user experience

## [0.5] - 2022-07-07

### Added

- "Forced Scroll Down" for emojis

### Fixed

- Added Underline for "Click Nickname to Ping"

## [0.4] - 2022-07-05

### Added

- "Click Nickname to Ping"
- Synchronization of CSS when changing desktop/mobile view

### Changed

- Detect desktop/mobile view the same way KK does it

## [0.1-0.3] - 2022-06-XX - 2022-07-04

Initial release only for beta testers
