// ==UserScript==
// @name        Video Speedup Hotkeys
// @namespace   sanian_creations
// @match       https://v.vvid.cc/p/player.html
// @match       https://animixplay.to/*
// @match       https://mp4.sh/*
// @match       https://gogoplay.io/*
// @match       https://embed.meomeo.pw/*
// @match       https://mcloud.to/embed/*
// @match       https://vidstream.pro/*
// @match       https://plyr.link/*
// @match       https://www.dailymotion.com/embed/video/*
// @match       https://goload.pro/*
// @match       https://www.youtube.com/*
// @match       https://secretlink.xyz/*
// @grant       none
// @version     1.0.0.1
// @author      Sanian
// @description Allows speeding up of videos with A and D (hold Shift for more precision). Skip ahead by 1:30 with S.
// ==/UserScript==

let spd_elem = document.createElement('p');

spd_elem.style = 
`color: white;
position: absolute;
top: 0;
left: 0;
margin: 2px 5px;
z-index: 1000;
text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black, 0 0 5px black;
visibility: hidden;`;

document.addEventListener('keydown', (e) => {
  
  // ignore hotkeys if the user is typing
  if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
  
  switch (e.key) {
    case "a": speed_up(-1);    break;
    case "d": speed_up(1);     break;
    case "A": speed_up(-0.25); break;
    case "D": speed_up(0.25);  break;
    case "s": skip_intro();    break;
    case "h": {
      console.log("video",   get_video());
      console.log("spdText", spd_elem);
    } break;
  }
});


function get_video() {
  
  // overwrite this function with the correct getter, depending on the page.
  get_video = (() => {
    if (window.location.host === "www.youtube.com") {

      let vid = document.querySelector("#movie_player video");
      document.querySelector("#movie_player").prepend(spd_elem);

      // return the video element right away, but youtube sometimes replaces the 
      // video element, so we do need to check if the cached element is still on the page.
      return () => vid.isConnected 
        ? vid 
        : vid = document.querySelector("#movie_player video");

    } else {

      let vid = document.querySelector("video");
      vid.parentElement.prepend(spd_elem);

      // return the cached video element right away.
      return () => vid; 
    }
  })();
  
  return get_video();
}

function skip_intro() {
  let vid = get_video();
  // Skip ahead by 1:27 rather than 1:30 so that you dont miss a bit of the scene after skipping 
  vid.currentTime = min(vid.currentTime + 87, vid.duration - 1); // use -1 to not go past end of video
}

function speed_up(increment) {
  let vid = get_video();
  let spd = max(1, vid.playbackRate + increment);
  vid.playbackRate = spd;
  set_spd_txt(vid.playbackRate);
}

function set_spd(spd) {
  let vid = get_video();
  vid.playbackRate = spd;
  set_spd_text(vid.playbackRate);
}

function set_spd_txt(spd) {
  // Only show speedup text if there is a speedup to speak of. Having "1x" on screen is annoying.
  spd_elem.textContent = `${spd}x`;
  spd_elem.style.visibility = (spd === 1) ? "hidden" : ""; 
}

function max(a, b) {
  return (a > b) ? a : b;
}

function min(a, b) {
  return (a < b) ? a : b;
}
