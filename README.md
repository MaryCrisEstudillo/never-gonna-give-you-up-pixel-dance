# Never Gonna Give You Up — Pixel Dance

A tiny, self-contained pixel-art web animation: a stylized figure does the
signature side-to-side arm-swing / two-step on a loop, in a warm 80s
music-video setting with a CRT-styled screen. Inspired by the classic offline
mini-games you get when your connection drops.

**Press `SPACE` (or tap the screen)** to make him throw the classic point-to-the-sky move.

## Run it

No build step, no dependencies. Just open the page:

```bash
# any static server works, e.g.
python3 -m http.server 8000
# then visit http://localhost:8000
```

Or simply open `index.html` in a browser.

## Files

| File | What it does |
|------|--------------|
| `index.html` | Page shell, canvas, title, credits |
| `style.css` | Retro 80s styling + CRT scanlines |
| `dance.js` | The pixel sprite and the dance loop |

## How the animation works

The figure is drawn on a coarse pixel grid (`UNIT` = 6 backing pixels per
"pixel") so everything stays chunky and crisp when scaled up. Poses are stored
as small lists of rectangles; the left-swing pose is authored by hand and the
right-swing pose is derived by mirroring it across the body's center line. The
loop steps through neutral → swing-left → neutral → swing-right while the torso
bobs and leans and the feet stay planted.

`prefers-reduced-motion` is respected — the figure holds a calm neutral pose
instead of dancing.

## Notes on scope

This is an original pixel-art **homage**, not a likeness of any real person. It
intentionally contains **no song lyrics and no audio**. The song title is used
only as the page heading. If you want music, add your own file that you have the
rights to use and wire up an `<audio>` element.

## License

Code is MIT (see `LICENSE`). "Never Gonna Give You Up" is a song by Rick Astley;
this project is an unaffiliated fan tribute and claims no rights to the song.
