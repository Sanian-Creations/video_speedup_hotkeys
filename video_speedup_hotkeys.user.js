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
// @version     1.0.5.0
// @author      Sanian
// @description Allows speeding up of videos with A and D (hold Shift for more precision). Skip ahead by 1:30 with S.
// ==/UserScript==

const console_style = "color:#00ffff;";
const spd_elem = document.createElement('p');
let speed = 1;

spd_elem.style = 
`color: white;
position: absolute;
top: 0;
left: 0;
margin: 2px 5px;
z-index: 1000;
text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black, 0 0 5px black;
visibility: hidden;`;

print_title();

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
  
  // Initialization, only runs on the first call
  
  let vid_getter;
  let parent_getter;

  if (window.location.host === "www.youtube.com") {
    vid_getter    =    () => document.querySelector("#movie_player video");
    parent_getter = (vid) => document.querySelector("#movie_player");
  } else {
    vid_getter    =    () => document.querySelector("video");
    parent_getter = (vid) => vid.parentElement;
  }
  
  let vid    = {};
  let observer = new MutationObserver(ensure_video_speed);
  
  // End of initialization. On any subsequent call to this function, only this code will run:
  
  get_video = () => { 
    if (!vid.isConnected) {
      vid = vid_getter();
      console.log("%cVid gone, got the new one!", console_style);

      let parent = parent_getter();
      parent.prepend(spd_elem);

      observer.disconnect();
      observer.observe(parent, { childList: true, subtree: true });
      observer.observe(vid,    { attributes: true });
    }
    
    return vid;
  };
  
  return get_video();
}

function skip_intro() {
  const vid = get_video();
  // Skip ahead by 1:27 rather than 1:30 so that you dont miss a bit of the scene after skipping 
  vid.currentTime = min(vid.currentTime + 87, vid.duration - 1); // use -1 to not go past end of video
}

function speed_up(increment) {
  set_speed(max(1, speed + increment));
}

function set_speed(spd) {
  const vid = get_video();
  vid.playbackRate = spd;
  
  // Only show speedup text if there is a speedup to speak of. Having "1x" on screen is annoying.
  spd_elem.textContent = `${spd}x`;
  spd_elem.style.visibility = (spd === 1) ? "hidden" : ""; 
  
  speed = spd; // backing field
}

function ensure_video_speed(mutation_list, observer) {
  const vid = get_video();
  
  if (vid.playbackRate !== speed && speed !== 1) {
    console.log(`%cVideo speed was modified to ${vid.playbackRate},\n but the video is running at a custom speed right now.\nFlipping back to custom value ${speed}`, console_style);
    set_speed(speed);
  }
}

function max(a, b) {
  return (a > b) ? a : b;
}

function min(a, b) {
  return (a < b) ? a : b;
}

function print_title() {
  console.log("%cvideo speedup hotkeys", console_style + "font-size: 20px;");
}

function test(e) {
  const video = document.querySelector("video");
  const got_vid = get_video();

  print_title();
  console.log("%cwindow/iframe url:",    console_style, window.location.href);
  console.log("%cspdText",               console_style, spd_elem);
  console.log("%ckeydown event",         console_style, e);
  
  if (video !== got_vid) {
      console.log("%cmismatching elements:",            console_style + "color:#ff0000");
      console.log("%cdocument.querySelector('video'):", console_style, video);
      console.log("%cget_video():",                     console_style, got_vid);
  } else {
      console.log("%cvideo:", console_style, video);
  }
}
