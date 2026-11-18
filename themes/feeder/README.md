# feeder theme

A bird-feeder look, made for a talk about a smart bird feeder that weighs and recognises garden birds (KTE Project4,
Lookout): a flock of small birds sweeps the next slide in, seed pours down and piles up into the next slide, cards fly
in and land like a bird on a perch, a snowy winter dusk with birds on the twigs runs behind dark slides, and the
progress dots become a perch rail with a bird hopping along it.

Demo: [Lookout-demo](../../demo/Lookout-demo/deck.html) (Czech) and the
[showcase](../../demo/showcase/deck.html).

```html
<script src="themes/feeder/theme.js" defer></script>   <!-- before engine.js -->
```

| name | kind | what it does |
|---|---|---|
| `flock` | transition | about forty birds (flapping, bobbing, different sizes) fly across from the left; the new slide opens behind the middle of the flock, the old one dims (going back the flock flies the other way) |
| `seed-fall` | transition | sunflower seed, millet and oats pour from the top and pile up; the new slide shows below the wavy top of the rising pile (going back, the pile drains down and uncovers the earlier slide) |
| `perch` | effect | the element flies in on an arc from above and from its own side of the slide, then lands: a damped squash at its bottom edge, like a bird settling on a perch. Numbers inside count up after the landing. Good on cards with a weight or a price |
| `snowfall` | ambient | bare branches grow from the lower-left and upper-right corners (always the same shape), snow falls and drifts, and up to four birds sit on the flatter twigs and hop and turn now and then; for dark title and closing slides |
| `perch-dots` | dot style | a wooden perch rail; a small bird hops along it to the current slide (turning round when going back); every slide already seen leaves a seed on the rail |

Options on `<body>`: `data-feeder-bird="#back,#head"` = the birds' back and head colours (default `#6B7F4E,#1B1E1C`,
a great tit). The birds' bellies are the accent colour (`data-accent`); the talk it was made for uses `#F2B632`
(great-tit yellow). The ambient draws only the branches, the birds and the snow, so the slide's own background is the
sky: a dark green-grey such as `#13221B` works.
