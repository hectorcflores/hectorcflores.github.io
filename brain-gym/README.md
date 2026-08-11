# Brain Gym

Spaced repetition over my Kindle highlights, at
[hectorcflores.github.io/brain-gym/](https://hectorcflores.github.io/brain-gym/).

The app opens straight into a review session — there is no browse view. Theme
pills at the top switch decks (Investing, Finance, Growth, Relationships,
Mindfulness) and show each deck's due count. Only highlights aligned with
their source book's core subject enter a deck; tangential ones are filtered
out upstream.

Static site, no build step, no backend. Add it to your home screen and it runs
offline as a standalone app.

## Files

| Path | What |
|------|------|
| `index.html` | The whole app: shadcn-zinc styling, SM-2 scheduler, review UI |
| `data.js` | The deck — `window.ANKI = { themes, books }` |
| `sw.js` | Service worker; network-first with an offline cache |
| `manifest.webmanifest`, `icon*` | Home-screen install metadata |
| `geist-*.woff2` | Self-hosted Geist, so nothing loads from a third party |

## How the review works

Each card is either **source recall** (a highlight on the front — which book
is this from, and why did you save it?) or **question recall** (a generated
question on the front, the highlight as the answer).

After revealing, grade it: **Again** repeats it this session, **Hard** nudges
the interval up and permanently lowers the card's ease, **Good** multiplies
by the ease (~2.5×), **Easy** jumps further and raises ease. The label under
each button shows exactly when that choice brings the card back.

Scheduling state lives in `localStorage` under `brain-gym.srs.v1` — per
browser, no account, no sync. New cards are capped at 20 per deck per day.

## Updating the deck

`data.js` is currently a hand-tagged sample: 17 books, ~100 cards drawn from
the real library. The production path is a classifier pass in
[my-readwise](https://github.com/hectorcflores/my-readwise) that tags every
highlight in `data/library.json` with a theme, an aligned/tangential verdict,
and a recall question, then regenerates this file. See `anki/README.md` there.

To ship a new deck: replace `data.js`, bump `CACHE` in `sw.js`, push. GitHub
Pages redeploys on push to `main`.

## Local preview

```bash
cd brain-gym && python3 -m http.server 8790
```
