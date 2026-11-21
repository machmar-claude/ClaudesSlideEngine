# Ember theme

Made for the Ember talk (KTE Project 5a): a slim black tie with 3,699 red LEDs on a flex PCB behind the fabric,
driven as a 1/16-scan LED matrix, that switches to a calm breathing glow when someone stands close.
Demo: [`demo/Ember-demo/deck.html`](../../demo/Ember-demo/deck.html).

| name | kind | what it does |
|---|---|---|
| `scan-mux` | transition | The screen is cut into thin rows; the next slide is written scan line by scan line like a multiplexed LED matrix: every 16th row lights at once, flashes while it is driven and leaves an afterglow. Going back runs the scan lines in reverse order. |
| `tie-drop` | transition | The next slide grows out of the top centre in the shape of a necktie (knot, then blade and tip) with a glowing seam along its edge, until the tie covers the screen. Going back, the slide shrinks back into the knot. |
| `spark` | effect (`data-fx`) | A glowing spark runs once round the element; the element lights up behind it and settles. Good for KPI cards. |
| `embers` | ambient (`data-ambient`) | Glowing sparks drifting slowly up a dark slide, flickering. Title and closing slides. |
| `stitch-dots` | dots (`data-dots`) | Progress as slanted stitches along a seam; seen stitches in the accent, the current one glows. |

Colour: everything glows in the accent (`data-accent`, the theme's own is `#FF4A2E`). Option on `<body>`:
`data-ember-rows="64"`: rows of the `scan-mux` wipe, rounded to a multiple of 16.

Mixes well with `pixelpine` (LED wipes) and `scope` (`trace` for SVG diagrams).
