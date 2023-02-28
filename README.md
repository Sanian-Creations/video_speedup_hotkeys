# Video Speedup Hotkeys (User Script)
User script for speeding up videos on various video viewing platforms. Can be used with browser extensions such as Greasemonkey, Violentmonkey and Tampermonkey.

If you already have one of these extensions, you can install the script by clicking here: [video_speedup_hotkeys.user.js](https://github.com/Sanian-Creations/video_speedup_hotkeys/raw/main/video_speedup_hotkeys.user.js)

## Hotkeys
* A - Video speed +1 (hold shift for +0.25)
* D - Video speed -1 (hold shift for -0.25)
* S - Skip ahead by 1:27 seconds, for skipping past intros
* Shift + S - Toggle pitch preservation. Pitch preservation is on by defualt. (Example: with pitch preservation off, sped up videos will get higher pitched.)

## Versioning scheme
Versioning scheme is MAJOR.MINOR.PATCH.MATCH

* MAJOR version when existing hotkeys are changed to do something different than before.
* MINOR version when adding new hotkeys, but the old ones still do the same thing they did before.
* PATCH version when a bugfix has no effect on the hotkeys.
* MATCH version when the script has a new match added so it works on more sites, this is like a single line at the top of the file. (may also be used for code refactoring that changes absolutely no functionality i.e. moving functions around, variable renaming, comments, etc.)
