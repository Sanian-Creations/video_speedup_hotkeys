// ==UserScript==
// @name        Video Speedup Hotkeys
// @namespace   sanian_creations
// @match       https://9anime.*/*
// @match       https://a9bfed0818.*/*
// @match       https://allanime.day/*
// @match       https://anihdplay.com/*
// @match       https://animixplay.to/player.html
// @match       https://anix.sh/*
// @match       https://dokicloud.one/*
// @match       https://embed.meomeo.pw/*
// @match       https://embed.su/*
// @match       https://filemoon.sx/*
// @match       https://fswsh2024.online/*
// @match       https://gogoplay.io/*
// @match       https://goload.*/*
// @match       https://goone.*/*
// @match       https://kerapoxy.*/*
// @match       https://krussdomi.com/*
// @match       https://kwik.si/*
// @match       https://omegadthree.com/*
// @match       https://player.mangafrenzy.*/*
// @match       https://mcloud.*/*
// @match       https://mega.nz/embed/*
// @match       https://megacloud.*/*
// @match       https://megaf.cc/*
// @match       https://mp4.sh/*
// @match       https://peertube.nodja.com/*
// @match       https://player.vimeo.com/video/*
// @match       https://plyr.in/*
// @match       https://plyr.link/*
// @match       https://rabbitstream.net/*
// @match       https://s3taku.*/*
// @match       https://secretlink.xyz/*
// @match       https://soap2day.*/*
// @match       https://static.crunchyroll.com/*
// @match       https://vid142.*/*
// @match       https://vid1a52.*/*
// @match       https://vid2a41.*/*
// @match       https://vidco.pro/*
// @match       https://vidplay.*/*
// @match       https://vidstream.pro/*
// @match       https://vizcloud.co/e/*
// @match       https://www.dailymotion.com/embed/video/*
// @match       https://www.miruro.tv/*
// @match       https://www.mp4upload.com/embed*
// @match       https://www.twitch.tv/*
// @match       https://www.youtube.com/*
// @match       https://www.youtube-nocookie.com/*
// @match       https://ynowfnga.xyz/*
// @match       https://yugen.to/e/*
// @grant       none
// @version     1.5.6
// @author      Sanian
// @description Allows speeding up of videos with A and D (hold Shift for more precision). Skip ahead by 1:30 with S.
// ==/UserScript==

const _HTML = `
<p id="speed_display">&nbsp;</p>
<div id="menu">
  <label>Fine grain control<br>
    <input type="range" min="-0.25" max="0.25" step="0.01" id="fine_control_slider">
  </label>
  <label><input type="checkbox" id="pitch_checkbox">Preserve pitch <span id="pitch_details"></span></label>
  <div id="frame_buttons">
    <button id="prev_frame_btn">Prev frame</button>
    <button id="next_frame_btn">Next frame</button>
  </div>
  <label><button id="measure_fps_btn">Start/Stop Measuring</button> FPS: <span id="fps_details"></span></label>
  <p></p>
  <button id="cross">X</button>
</div>
`;

const _CSS = `
:host {
  position: absolute;
  z-index: 10000;

  color: white;
  text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black, 0 0 5px black;
  font-size: 11.8px;
  font-family: fantasy;
  top: 0;
  left: 0;
}
p { margin: 0; }
#speed_display {
  margin: 2px 5px;
}
#menu {
  padding: 5px;
  gap: 5px;
  background: #fff4;
  border: solid rgba(0,0,0,.35) 1px;
  border-radius: 5px;
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
}
#frame_buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 4px;
}
#fps_details {
  display: inline-block;
  min-width: 35px;
}

#pitch_details::before { content: "(smooth)"; }
#pitch_checkbox:checked ~
#pitch_details::before { content: "(possible artifacts)"; }
`;

const is_yt = window.location.host === "www.youtube.com";
const _get_vid = is_yt
  ? (() => document.querySelector("#movie_player video"))
  : (() => document.querySelector("video"));

let _vid;
let _observer = new MutationObserver(ensure_settings);
function ensure_vid_connected() {
  if ( ! (_vid?.isConnected) ) { // null, undefined or not connected
    _vid = _get_vid();
    console.log("%cVid gone, got the new one!", console_style, _vid);

    const parent = _vid.parentElement;
    parent.prepend(overlay);

    _observer.disconnect();
    _observer.observe(parent,  { childList: true, subtree: true });
    _observer.observe(_vid,    { attributes: true });
  }
}

function get_video() {
  ensure_vid_connected();
  return _vid;
}

const console_style = "color:#00ffff;";
let speed = 1;
let preserve_pitch = true;

class Overlay extends HTMLElement {
  menu;
  menu_is_open;
  speed_display;
  stylesheet;
  fine_control_slider;
  pitch_checkbox;
  next_frame_btn;
  prev_frame_btn;
  measure_fps_btn;
  fps_details;
  cross;

  constructor() {
    super();
    this.attachShadow({mode:"open"});
    this.shadowRoot.innerHTML = _HTML;

    // Set style
    this.stylesheet = new CSSStyleSheet();
    this.stylesheet.replace(_CSS);
    this.shadowRoot.adoptedStyleSheets.push(this.stylesheet);

    // Store important elements
    const qs = a => this.shadowRoot.querySelector(a);
    this.menu = qs("#menu");
    this.speed_display = qs("#speed_display");
    this.fine_control_slider = qs("#fine_control_slider");
    this.pitch_checkbox = qs("#pitch_checkbox");
    this.cross = qs("#cross");

    this.next_frame_btn = qs("#next_frame_btn");
    this.prev_frame_btn = qs("#prev_frame_btn");
    this.fps_details = qs("#fps_details");
    this.measure_fps_btn = qs("#measure_fps_btn");


    // Block outgoing events
    const blocked_events = [
      "auxclick", "click", "dblclick", "contextmenu", // contextmenu == right click
      "drag", "dragend", "dragenter", "dragexit", "dragleave", "dragover", "dragstart",
      "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup",
      "keydown", "keyup", "keypress"];
    for_each(blocked_events, event => this.addEventListener(event, e => e.stopPropagation()));
    for_each(["drag", "dragend", "dragenter", "dragexit", "dragleave", "dragover", "dragstart"], event => this.addEventListener(event, e => e.preventDefault()));

    this.close_menu(); // initial state is hidden.

    { // Init Fine Control Slider
      let inputting = false;
      let initial_speed = 1;
      this.fine_control_slider.oninput = e => {
        if (!inputting) {
          initial_speed = speed;
          inputting = true;
        }
        const offset = e.target.valueAsNumber;
        set_speed(get_video(), round2(initial_speed + offset));
      }
      this.fine_control_slider.onchange = e => { // after mouse releases
        inputting = false;
        e.target.valueAsNumber = 0; // does not re-trigger the oninput or onchange events, no infinite loops here.
      }
    }

    { // Init Preserve Pitch Checkbox
      this.update_preserve_pitch(preserve_pitch);
      this.pitch_checkbox.oninput = e => {
        set_preserve_pitch(get_video(), e.target.checked);
        e.stopPropagation();
      }
    }

    { // Init Frame measuring mechanism
      let measuring = false;
      let interval_id;
      let frames_passed;
      let ms_passed;

      this.measure_fps_btn.onclick = e => {
        const vid = get_video();
        const start_vpq = vid.getVideoPlaybackQuality();
        if (!measuring) {
          interval_id = setInterval(() => {
            const now = vid.getVideoPlaybackQuality();
            frames_passed = now.totalVideoFrames - start_vpq.totalVideoFrames;
             ms_passed = now.creationTime - start_vpq.creationTime;
            this.fps_details.innerText = round2(frames_passed / (ms_passed/1000));
          }, 50);
        } else {
          clearInterval(interval_id);
        }
        measuring = !measuring;
      };

      this.next_frame_btn.onclick = e => {
        const vid = get_video();
        const seconds_per_frame = (ms_passed/1000)/frames_passed;
        vid.currentTime += seconds_per_frame;
      };
      this.prev_frame_btn.onclick = e => {
        const vid = get_video();
        const seconds_per_frame = (ms_passed/1000)/frames_passed;
        vid.currentTime -= seconds_per_frame;
      };
    }

    // Init Cross
    this.cross.onclick = () => {
      this.close_menu();
      get_video().focus();
    }
  }

  connectedCallback() { }

  open_menu() {
    this.menu_is_open = true;
    this.menu.style.removeProperty("display"); // remove the inline style so that the one specified in css is used.
    while (is_obstructed(this))
      this.parentElement.parentElement.prepend(this);
  }
  close_menu() {
    this.menu_is_open = false;
    this.menu.style.display = "none";
  }

  update_preserve_pitch(value) {
    this.pitch_checkbox.checked = value;
  }
  update_speed(spd) {
    // Only show speedup text if there is a speedup to speak of. Having "1x" on screen is annoying.
    this.speed_display.textContent = `${round3(spd)}x`;
    this.speed_display.style.visibility = (spd === 1) ? "hidden" : "visible";
  }
}
window.customElements.define("vshk-overlay", Overlay);

const overlay = new Overlay();
document.addEventListener("click", e => {
  if (!e.ctrlKey) return;
  ensure_vid_connected(); // this ensures proper placement of overlay.
  console.log(e.target);
  console.log(overlay.parentElement);
  const clicked_vid = overlay.parentElement.contains(e.target);
  if (!clicked_vid) return;
  overlay.open_menu();
});

print_title();

const key_func = (e) => {
  // ignore hotkeys if the user is typing
  if (e.target.isContentEditable || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  switch (e.key) {
    case "a": speed_up(get_video(), -1); break;
    case "d": speed_up(get_video(),  1); break;

    case "A": {
      (speed > 0.25)
        ? speed_up(get_video(), -0.25, 0.25)
        : multiply_speed(get_video(), 0.5);
    } break;

    case "D": {
      (speed >= 0.25)
        ? speed_up(get_video(), 0.25, 0.25)
        : multiply_speed(get_video(), 2);
    } break;

    case "s": skip_intro(get_video()); break;
    case "S": set_preserve_pitch(get_video(), !preserve_pitch); break;
    case "t": test(e);      break;
  }
};

document.addEventListener("keydown", key_func);
overlay .addEventListener("keydown", key_func); // since we're stopping events leaving the overlay, we have to catch them separately there.


function skip_intro(vid) {
  // Skip ahead by 1:27 rather than 1:30 so that you dont miss a bit of the scene after skipping
  vid.currentTime = Math.min(vid.currentTime + 87, vid.duration - 1); // use -1 to not go past end of video
}

function speed_up(vid, increment, lower_bound) {
  lower_bound ||= 1;
  set_speed(vid, Math.max(lower_bound, speed + increment));
}

function multiply_speed(vid, multiplier) {
  set_speed(vid, speed * multiplier);
}

function set_speed(vid, spd) {
  spd = clamp(spd, 0.0625, 16);
  vid.playbackRate = spd;
  // playbackRate *can* be set to values outside of this range, but the browser does not
  // support actually playing videos at other speeds, it just plays as slow or fast as it can
  // without giving any indication whether or not the value is supported. Therefore, we're
  // clamping the value manually so that the speed we display isn't misleading, by for
  // instance displaying 20x when in reality it cannot go faster than 16x

  overlay.update_speed(spd);

  speed = spd; // backing field
}

function ensure_settings(mutation_list, observer) {
  const vid = get_video();

  // detect if a custom value is set, and overwrite video's value if it is not the custom value.
  // if our values are the default value, then we allow a different value on the video player because the user probably just used the default video controls.
  if (speed !== 1 && vid.playbackRate !== speed) {
    console.log(`%cVideo speed was modified to ${vid.playbackRate},\n but the video is running at a custom speed right now.\nFlipping back to custom value ${speed}`, console_style);
    set_speed(vid, speed);
  }
  if (preserve_pitch !== true && vid.preservesPitch !== preserve_pitch) {
    console.log(`%cVideo pitch preservation was turned back on,\n but we explicitly have it turned off.\nFlipping it back off again.`, console_style);
  }
}

function set_preserve_pitch(vid, value) {
  preserve_pitch = value;
  vid.preservesPitch = value;
  overlay.update_preserve_pitch(value);
}

function clamp(num, min, max) { return Math.min(Math.max(num, min), max); }

function round2(x) { return Math.round(x * 100) / 100; }
function round3(x) { return Math.round(x * 1000) / 1000; }

function for_each(list, func, data) {
  for (let i = 0; i < list.length; i++) {
    func(list[i], data);
  }
}

function is_obstructed(element) {
  // https://stackoverflow.com/questions/49751396/determine-if-element-is-behind-another
  const rect = element.getBoundingClientRect();
  // adjust with +/-1 to get more accurate results
  const left = rect.left + 1;
  const right = rect.right - 1;
  const top = rect.top + 1;
  const bottom = rect.bottom - 1;

  // If the element at a point is not within *this* element, then that element is in front.
  return !element.contains(document.elementFromPoint(left, top)) ||
    !element.contains(document.elementFromPoint(right, top));
}

function print_title() {
  console.log("%cvideo speedup hotkeys", console_style + "font-size: 20px;");
}

function test(e) {
  const video = document.querySelector("video");
  const got_vid = get_video();

  print_title();
  console.log("%cwindow/iframe url:",    console_style, window.location.href);
  console.log("%cspdText",               console_style, overlay.speed_display);
  console.log("%ckeydown event",         console_style, e);

  if (video !== got_vid) {
      console.log("%cmismatching elements:",            console_style + "color:#ff0000");
      console.log("%cdocument.querySelector('video'):", console_style, video);
      console.log("%cget_video():",                     console_style, got_vid);
  } else {
      console.log("%cvideo:", console_style, video);
  }
}
