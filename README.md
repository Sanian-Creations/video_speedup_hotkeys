# Video Speedup Hotkeys (User Script)
User script for speeding up videos on various video viewing platforms. Can be used with browser extensions such as Greasemonkey, Violentmonkey and Tampermonkey.

If you already have one of these extensions, you can install the script by clicking here: [video_speedup_hotkeys.user.js](https://github.com/Sanian-Creations/video_speedup_hotkeys/raw/main/video_speedup_hotkeys.user.js)

## Hotkeys
* A - Video speed +1 (hold shift for +0.25)
* D - Video speed -1 (hold shift for -0.25)
* S - Skip ahead by 1:27 seconds, for skipping past intros

## Versioning scheme
Versioning scheme is MAJOR.MINOR.PATCH.MATCH

* Major means the API changed (in this case, I suppose rebinding hotkeys or something?)
* Minor means adding to the API in backwards compatible thing (so adding hotkeys, but the old ones still work the same)
* Path means bugfix that has no effect on the API
* Match means the script has a new match added so it works on more sites, this is like a single line at the top of the file.
