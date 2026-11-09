/* Slide navigation, session timer, agenda, and speaker view.
   Edit cue times here if the room runs long or short. */
(function () {
  "use strict";

  var SESSION_MS = 120 * 60 * 1000;
  var CUES = [
    { at: 48 * 60 * 1000, label: "Break" },
    { at: 58 * 60 * 1000, label: "Resume" },
    { at: 120 * 60 * 1000, label: "End" }
  ];
  var NAV_KEY = "ak9i.k9startup.nav";
  var TIMER_KEY = "ak9i.k9startup.timer";
  var BLANK_KEY = "ak9i.k9startup.blank";

  var params = new URLSearchParams(location.search);
  var view = params.get("view") || "present";
  document.body.dataset.view = view;

  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var index = 0;
  var applyingRemote = false;

  function clamp(n) {
    if (n < 0) return 0;
    if (n > slides.length - 1) return slides.length - 1;
    return n;
  }

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* private mode */ }
  }

  function slideTitle(slide) {
    var heading = slide.querySelector("h1, h2");
    return heading ? heading.textContent.trim() : "Slide";
  }

  function readHash() {
    var match = (location.hash || "").match(/^#\/(\d+)$/);
    if (!match) return null;
    return clamp(parseInt(match[1], 10) - 1);
  }

  function readStoredIndex() {
    try {
      var parsed = JSON.parse(storageGet(NAV_KEY) || "null");
      if (parsed && isFinite(parsed.index)) return clamp(parsed.index);
    } catch (err) { /* ignore */ }
    return null;
  }

  function publishNav() {
    if (applyingRemote || view === "preview") return;
    storageSet(NAV_KEY, JSON.stringify({ index: index, at: Date.now() }));
  }

  function show(next, options) {
    options = options || {};
    index = clamp(next);
    slides.forEach(function (slide, i) {
      var active = i === index;
      slide.classList.toggle("is-active", active);
      slide.hidden = !active;
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      if ("inert" in slide) slide.inert = !active;
    });
    if (view === "present") {
      var url = "#/" + (index + 1);
      if (location.hash !== url) history.replaceState(null, "", url);
    }
    updateChrome();
    updatePresenter();
    if (!options.silent) publishNav();
    if (options.focus && view !== "preview") {
      var activeSlide = slides[index];
      if (activeSlide && document.activeElement && document.activeElement.closest && document.activeElement.closest("dialog")) return;
      activeSlide.setAttribute("tabindex", "-1");
      activeSlide.focus({ preventScroll: true });
    }
  }

  function updateChrome() {
    var slide = slides[index];
    var label = document.getElementById("progress-label");
    var count = document.getElementById("slide-count");
    var moduleName = "";
    if (slide) {
      var ownAgenda = slide.getAttribute("data-agenda");
      if (ownAgenda === "Break") {
        moduleName = "Break";
      } else {
        slides.forEach(function (candidate) {
          if (moduleName) return;
          if (candidate.getAttribute("data-module") !== slide.getAttribute("data-module")) return;
          var agenda = candidate.getAttribute("data-agenda");
          if (agenda && agenda !== "Break") moduleName = agenda;
        });
        moduleName = moduleName || ownAgenda || slide.getAttribute("data-module") || "";
      }
    }
    if (label) label.textContent = moduleName;
    if (count) count.textContent = (index + 1) + " of " + slides.length;
    document.title = (index + 1) + ". " + slideTitle(slide) + " · AK9I business session";
    var live = document.getElementById("slide-live");
    if (live) live.textContent = "Slide " + (index + 1) + " of " + slides.length + ", " + slideTitle(slide);
    var segments = document.querySelectorAll(".segments button");
    var currentModule = slide ? slide.getAttribute("data-module") : "";
    var seenCurrent = false;
    segments.forEach(function (button) {
      var mod = button.getAttribute("data-module");
      var isCurrent = mod === currentModule;
      button.setAttribute("aria-current", isCurrent ? "true" : "false");
      button.classList.toggle("is-done", !isCurrent && !seenCurrent);
      if (isCurrent) seenCurrent = true;
    });
  }

  function buildSegments() {
    var list = document.getElementById("module-segments");
    if (!list) return;
    var seen = {};
    slides.forEach(function (slide, i) {
      var mod = slide.getAttribute("data-module");
      if (!mod || seen[mod]) return;
      seen[mod] = true;
      var label = slide.getAttribute("data-agenda") || mod;
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-module", mod);
      button.setAttribute("aria-label", label);
      button.title = label;
      button.addEventListener("click", function () { show(i, { focus: true }); });
      li.appendChild(button);
      list.appendChild(li);
    });
  }

  function buildAgenda() {
    var list = document.getElementById("agenda-list");
    if (!list) return;
    slides.forEach(function (slide, i) {
      if (!slide.hasAttribute("data-agenda")) return;
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      var time = slide.getAttribute("data-time") || "";
      button.textContent = slide.getAttribute("data-agenda") + (time ? " — " + time : "");
      button.addEventListener("click", function () {
        show(i, { focus: true });
        closeDialog("agenda-dialog");
      });
      li.appendChild(button);
      list.appendChild(li);
    });
  }

  function buildOverview() {
    var list = document.getElementById("overview-list");
    if (!list) return;
    slides.forEach(function (slide, i) {
      var li = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = (i + 1) + ". " + slideTitle(slide);
      button.addEventListener("click", function () {
        show(i, { focus: true });
        closeDialog("overview-dialog");
      });
      li.appendChild(button);
      list.appendChild(li);
    });
  }

  function openDialog(id) {
    var dialog = document.getElementById(id);
    if (dialog && typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  }

  function closeDialog(id) {
    var dialog = document.getElementById(id);
    if (dialog && dialog.open) dialog.close();
  }

  function notesHtml(slide) {
    if (!slide) return "";
    var notes = slide.querySelector(".notes");
    return notes ? notes.innerHTML : "<p>No speaker notes on this slide.</p>";
  }

  function updatePresenter() {
    if (view !== "notes") return;
    var current = document.getElementById("presenter-notes");
    var heading = document.getElementById("presenter-heading");
    var next = document.getElementById("presenter-next");
    var slide = slides[index];
    var following = slides[index + 1];
    if (heading) heading.textContent = (index + 1) + " / " + slides.length + " · " + slideTitle(slide);
    if (current) current.innerHTML = notesHtml(slide);
    if (next) {
      next.innerHTML = following
        ? "<h3>Next: " + slideTitle(following) + "</h3>" + notesHtml(following)
        : "<p>This is the last slide.</p>";
    }
  }

  function scalePreview() {
    var slot = document.getElementById("preview-slot");
    var frame = slot ? slot.querySelector("iframe") : null;
    if (!slot || !frame) return;
    var scale = slot.clientWidth / 1600;
    frame.style.transform = "scale(" + scale + ")";
  }

  function setupPreview() {
    if (view !== "notes") return;
    var slot = document.getElementById("preview-slot");
    if (!slot || slot.querySelector("iframe")) return;
    var frame = document.createElement("iframe");
    frame.src = "index.html?view=preview#/" + (index + 1);
    frame.title = "Audience screen preview";
    slot.appendChild(frame);
    frame.addEventListener("load", scalePreview);
    window.addEventListener("resize", scalePreview);
  }

  function timerState() {
    try {
      return JSON.parse(storageGet(TIMER_KEY) || "null") || { running: false, elapsed: 0, startedAt: 0 };
    } catch (err) {
      return { running: false, elapsed: 0, startedAt: 0 };
    }
  }

  function elapsedMs(state) {
    if (!state) return 0;
    if (state.running) return Math.max(0, Date.now() - state.startedAt);
    return Math.max(0, state.elapsed || 0);
  }

  function format(ms) {
    var total = Math.floor(ms / 1000);
    var sign = "";
    if (total < 0) { sign = "−"; total = Math.abs(total); }
    var m = Math.floor(total / 60);
    var s = total % 60;
    return sign + String(m) + ":" + (s < 10 ? "0" : "") + s;
  }

  function nextCue(ms) {
    for (var i = 0; i < CUES.length; i += 1) {
      if (ms < CUES[i].at) return CUES[i];
    }
    return null;
  }

  function renderTimer() {
    var state = timerState();
    var elapsed = elapsedMs(state);
    var remaining = SESSION_MS - elapsed;
    var text = format(elapsed);
    document.querySelectorAll("[data-timer-elapsed]").forEach(function (node) {
      node.textContent = text;
    });
    document.querySelectorAll("[data-timer-remaining]").forEach(function (node) {
      node.textContent = remaining >= 0 ? format(remaining) + " left" : format(-remaining) + " over";
    });
    var cue = nextCue(elapsed);
    document.querySelectorAll("[data-timer-cue]").forEach(function (node) {
      node.textContent = cue ? cue.label + " at " + format(cue.at) : "Time";
    });
    document.querySelectorAll("[data-timer-toggle]").forEach(function (button) {
      button.textContent = state.running ? "Pause" : "Start";
      button.setAttribute("aria-pressed", state.running ? "true" : "false");
    });
  }

  function setTimer(next) {
    storageSet(TIMER_KEY, JSON.stringify(next));
    renderTimer();
  }

  function toggleTimer() {
    var state = timerState();
    if (state.running) {
      setTimer({ running: false, elapsed: elapsedMs(state), startedAt: 0 });
    } else {
      var base = state.elapsed || 0;
      setTimer({ running: true, elapsed: base, startedAt: Date.now() - base });
    }
  }

  function resetTimer() {
    setTimer({ running: false, elapsed: 0, startedAt: 0 });
  }

  function setBlank(on) {
    document.body.classList.toggle("is-blank", !!on);
    if (view !== "preview") storageSet(BLANK_KEY, on ? "1" : "0");
  }

  function isTyping(target) {
    if (!target) return false;
    var tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
  }

  function onKey(event) {
    if (view === "preview") return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    var dialogOpen = document.querySelector("dialog[open]");
    if (event.key === "Escape") {
      if (document.body.classList.contains("is-blank")) {
        setBlank(false);
        event.preventDefault();
      }
      return;
    }
    if (dialogOpen) return;
    if (isTyping(event.target) && event.key !== "F1") return;
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      show(index + 1, { focus: true });
    } else if (event.key === "ArrowLeft" || event.key === "PageUp" || event.key === "Backspace") {
      event.preventDefault();
      show(index - 1, { focus: true });
    } else if (event.key === "Home") {
      event.preventDefault();
      show(0, { focus: true });
    } else if (event.key === "End") {
      event.preventDefault();
      show(slides.length - 1, { focus: true });
    } else if (event.key === "s" || event.key === "S") {
      event.preventDefault();
      openNotes();
    } else if (event.key === "n" || event.key === "N" || event.key === "o" || event.key === "O") {
      event.preventDefault();
      openDialog("overview-dialog");
    } else if (event.key === "a" || event.key === "A") {
      event.preventDefault();
      openDialog("agenda-dialog");
    } else if (event.key === "t" || event.key === "T") {
      event.preventDefault();
      toggleTimer();
    } else if (event.key === "b" || event.key === "B") {
      event.preventDefault();
      setBlank(!document.body.classList.contains("is-blank"));
    } else if (event.key === "?" || event.key === "F1") {
      event.preventDefault();
      openDialog("help-dialog");
    } else if (event.key === "f" || event.key === "F") {
      event.preventDefault();
      toggleFullscreen();
    }
  }

  function openNotes() {
    if (view === "notes") return;
    window.open("index.html?view=notes#/" + (index + 1), "ak9i-notes", "width=1200,height=800");
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      var root = document.documentElement;
      if (root.requestFullscreen) root.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  function bindClick(id, handler) {
    var node = document.getElementById(id);
    if (node) node.addEventListener("click", handler);
  }

  window.addEventListener("storage", function (event) {
    if (event.key === NAV_KEY && event.newValue) {
      try {
        var parsed = JSON.parse(event.newValue);
        if (isFinite(parsed.index) && parsed.index !== index) {
          applyingRemote = true;
          show(parsed.index, { silent: true });
          applyingRemote = false;
        }
      } catch (err) { /* ignore */ }
    }
    if (event.key === TIMER_KEY) renderTimer();
    if (event.key === BLANK_KEY) document.body.classList.toggle("is-blank", event.newValue === "1");
  });

  document.addEventListener("keydown", onKey);
  buildSegments();
  buildAgenda();
  buildOverview();

  var startIndex = 0;
  if (view === "present") {
    var hashed = readHash();
    startIndex = hashed == null ? (readStoredIndex() || 0) : hashed;
  } else {
    var stored = readStoredIndex();
    startIndex = stored == null ? (readHash() || 0) : stored;
  }
  show(startIndex, { silent: view !== "present" });
  if (view === "present") publishNav();

  bindClick("prev-slide", function () { show(index - 1, { focus: true }); });
  bindClick("next-slide", function () { show(index + 1, { focus: true }); });
  bindClick("open-agenda", function () { openDialog("agenda-dialog"); });
  bindClick("open-overview", function () { openDialog("overview-dialog"); });
  bindClick("open-help", function () { openDialog("help-dialog"); });
  bindClick("open-notes", openNotes);
  bindClick("notes-prev", function () { show(index - 1); });
  bindClick("notes-next", function () { show(index + 1); });
  bindClick("notes-overview", function () { openDialog("overview-dialog"); });
  document.querySelectorAll("[data-timer-toggle]").forEach(function (button) {
    button.addEventListener("click", toggleTimer);
  });
  document.querySelectorAll("[data-timer-reset]").forEach(function (button) {
    button.addEventListener("click", resetTimer);
  });

  if (window.AK9ITools) window.AK9ITools.init(document);

  setupPreview();
  renderTimer();
  setInterval(renderTimer, 500);
  if (storageGet(BLANK_KEY) === "1" && view !== "present") setBlank(true);

  var deck = document.getElementById("deck");
  var touchX = null;
  if (deck && view !== "notes") {
    deck.addEventListener("touchstart", function (event) {
      if (!event.changedTouches || !event.changedTouches[0]) return;
      touchX = event.changedTouches[0].clientX;
    }, { passive: true });
    deck.addEventListener("touchend", function (event) {
      if (touchX == null || !event.changedTouches || !event.changedTouches[0]) return;
      var target = event.target;
      if (target && target.closest && target.closest("input, textarea, select, button, a, label")) {
        touchX = null;
        return;
      }
      var dx = event.changedTouches[0].clientX - touchX;
      if (dx < -70) show(index + 1);
      else if (dx > 70) show(index - 1);
      touchX = null;
    }, { passive: true });
  }
})();
