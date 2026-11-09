# AK9I student business session

A self-contained slide deck for the live classroom session on **Friday, November 13, 2026**, at American K-9 Interdiction. Jonathan Holman of Accel Analysis teaches AK9I detection-dog graduates how to start with one service, confirm the rules, test demand, and plan cash.

The deck follows the **AK9I Student Business Resource Packet, October 2026.1**. It is static HTML, CSS, and JavaScript. There is no build step and no CDN. Activities run in the browser and do not send data anywhere.

Expected public URL, after Pages is enabled:

**https://accelanalysis.github.io/K9Startup/**

## Enable GitHub Pages

This repository does not change its own settings. In the GitHub repo settings, turn Pages on with:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

The workflow `.github/workflows/pages.yml` deploys the deck from the `main` branch. The first deploy runs after that setting is on and a commit reaches `main`.

## Present

Open the URL above, or open `index.html` from a local copy. Use a recent desktop browser. For the classroom, put the audience window on the projector and the speaker window on your laptop.

| Key | Action |
| --- | --- |
| Right, Down, Space, Page Down | Next slide |
| Left, Up, Page Up | Previous slide |
| Home / End | First / last slide |
| S | Open the speaker view in a new window |
| T | Start or pause the 2-hour timer |
| A | Agenda |
| O or N | Slide list |
| B | Blank the screen (Escape brings it back) |
| F | Fullscreen |
| ? | This help |

The header also has Prev, Next, Agenda, Notes, and Help. On a phone, swipe left or right outside a form field.

The timer counts a 120-minute session. On-screen cues suggest a break at 48:00 and a resume at 58:00. Reset if you started the clock early. Those cues are planning aids in `js/deck.js` (`SESSION_MS` and `CUES`), not part of the packet.

### Speaker notes

Press **S** or **Notes**. A second window opens with the current slide, the notes, the next slide’s notes, and the same timer. The projector window does not show the notes.

Notes stay out of the audience view. Do not press **N** expecting a hidden notes drawer on the projector; **N** opens the slide list. Use the separate speaker window.

Advance either window. They stay on the same slide through this browser’s local storage.

## What students do on screen

Everything is client-side. Answers are stored in `localStorage` on that device under keys beginning `ak9i.k9startup.`. Nothing is uploaded.

- Niche picker
- Buyer-interview question builder, with a tally toward 10 conversations and 3 alternatives
- One-page plan prompts
- Break-even calculator, seeded with the packet’s hypothetical illustration
- 13-week cash forecast with a stress-test toggle
- 90-day action list with download and print
- Readiness checklist
- State directory, including Virginia
- Knowledge checks with revealed answers

The break-even seed is the packet’s teaching illustration: $400 average job revenue, $140 variable cost, $2,600 monthly fixed costs, and a $3,900 owner-compensation target (10 jobs to cover fixed costs, 25 jobs if owner pay is added). Those figures are hypothetical teaching inputs, not AK9I prices and not an earnings claim.

Do not add a price for AK9I’s continuing-education platform. The deck says pricing and launch details will be announced by AK9I.

## Edit the content

Slides live in `index.html`. Each slide is a `<section class="slide">`.

- `data-module` groups the progress bar. The first slide of a module sets the module name with `data-agenda` and `data-time`.
- The visible title is the `<h1>` or `<h2>`.
- Speaker notes are the `<aside class="notes">` inside that section. The audience does not see that block.
- Keep the footer text as written: `AK9I Student Business Session, Nov 13, 2026. Presented with Accel Analysis`.
- Write **Accel Analysis** in full.

Interactive behavior is in `js/tools.js`. Navigation, timer, and speaker view are in `js/deck.js`. State links from the packet are in `js/directory.js`. Styles are in `css/deck.css`. Images are in `assets/`. The logo is the AK9I seal; do not stretch it. The cover photo is credited to Willians Huerta / Pexels and is illustrative only.

To preview an edit, refresh `index.html`. No compiler, package install, or bundler is required.

## Accuracy

Use the October 2026.1 packet as the source of facts. The deck keeps the packet’s limits: a canine alert is not proof, certification is not a license, graduation is not authority to handle regulated aids, GI Bill benefits are not startup capital, and SBA support is not automatic approval.
