# DUMB — desserts & coffee (Surat)

Website for [@getdumbbbb](https://www.instagram.com/getdumbbbb/). Plain HTML/CSS/JS, no build step.

## run it

```bash
python -m http.server 5173
```

then open http://localhost:5173. (Double-clicking `index.html` mostly works too, but a local server is safer for the 3D bits.)

## what's where

- `index.html`: all the sections
- `css/style.css`: brand colours live at the top in `:root`
- `js/data.js`: **edit this one**: menu, prices, hours, the instagram posts
- `js/main.js`: loader, scroll animations, menu tabs, slot machine, live open/closed + molten countdown (IST)
- `js/mascots.js`: the dumb gang (heart, yoga, shy, peek, wave) redrawn from their logo as an inline SVG sprite. use one with `<svg class="mascot"><use href="#m-heart"/></svg>`, colour comes from CSS `color`
- "pack a dumb box" section: markup in `index.html` (`#box`), cookie looks + logic in `js/main.js` (`looks`), cookies come from `js/data.js`
- hero photo pile: markup in `index.html` (`#heroPile`), shuffle + mouse lean in `js/main.js`
- `assets/ig/`: photos pulled from their instagram

## before handing it over

- **prices + most menu items are placeholders.** only the viral molten cookie, scoopable cookie, brownie + gelato and the 5 categories come from their posts. swap in the real menu in `js/data.js`.
- **no street address** was public. "open in maps" just searches "Dumb Desserts Surat". drop the real address / maps link into the visit section.
- instagram images are 640px thumbnails. ask the cafe for originals for a sharper look.
- deploy anywhere static: Netlify, Vercel, GitHub Pages, or just upload the folder.

## easter eggs

- tap the photo pile in the hero to shuffle it (it talks back)
- type `dumb` anywhere on the page
