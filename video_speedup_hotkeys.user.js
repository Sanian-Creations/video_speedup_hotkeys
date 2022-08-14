// ==UserScript==
// @name        Video Speedup Hotkeys
// @namespace   sanian_creations
// @match       https://v.vvid.cc/p/player.html
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
// @match       https://mega.nz/embed/*
// @match       https://soap2day.to/*
// @match       https://www.mp4upload.com/embed*
// @match       https://static.crunchyroll.com/*
// @grant       none
// @version     1.0.4.2
// @author      Sanian
// @description Allows speeding up of videos with A and D (hold Shift for more precision). Skip ahead by 1:30 with S.
// ==/UserScript==

const spd_elem = document.createElement('p');

spd_elem.style = 
`color: white;
position: absolute;
top: 0;
left: 0;
margin: 2px 5px;
z-index: 1000;
text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black, 0 0 5px black;
visibility: hidden;`;

document.addEventListener("keydown", (e) => {
  
  // ignore hotkeys if the user is typing
  if (e.target.isContentEditable || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  
  switch (e.key) {
    case "a": speed_up(-1);    break;
    case "d": speed_up(1);     break;
    case "A": speed_up(-0.25); break;
    case "D": speed_up(0.25);  break;
    case "s": skip_intro();    break;
    case "t": test(e);         break;
  }
});

function get_video() {
  
  let getter;
  let init_spd_elem;

  if (window.location.host === "www.youtube.com") {
    getter        = () => document.querySelector("#movie_player video");
    init_spd_elem = () => document.querySelector("#movie_player").prepend(spd_elem);
  } else {
    getter        = () => document.querySelector("video");
    init_spd_elem = (vid) => vid.parentElement.prepend(spd_elem);
  }
  
  let vid = getter();
  init_spd_elem(vid);
  
  // only this code will run on any subsequent call to this function.
  get_video = () => ( vid.isConnected ? vid : vid = getter() );
  
  return get_video();
}

function skip_intro() {
  const vid = get_video();
  // Skip ahead by 1:27 rather than 1:30 so that you dont miss a bit of the scene after skipping 
  vid.currentTime = min(vid.currentTime + 87, vid.duration - 1); // use -1 to not go past end of video
}

function speed_up(increment) {
  const vid = get_video();
  const spd = max(1, vid.playbackRate + increment);
  vid.playbackRate = spd;
  set_spd_txt(vid.playbackRate);
}

function set_spd(spd) {
  const vid = get_video();
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

function test(e) {
  const style = "color:#00ffff;";
  const video = document.querySelector("video");
  const got_vid = get_video();

  console.log("%cvideo speedup hotkeys", style + "font-size: 20px;") 
  console.log("%cwindow/iframe url:",    style, window.location.href);
  console.log("%cspdText",               style, spd_elem);
  console.log("%ckeydown event",         style, e);
  
  if (video !== got_vid) {
      console.log("%cmismatching elements:",            style + "color:#ff0000");
      console.log("%cdocument.querySelector('video'):", style, video);
      console.log("%cget_video():",                     style, got_vid);
  } else {
      console.log("%cvideo:", style, video);
  }
}
