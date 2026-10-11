# Cimelium

The Cimelium home page, live at https://cimelium.com

It's a small static site that GitHub Pages builds with Jekyll, so there's no build step to run yourself. Push to `main` and the site updates in a minute or two.

## Editing the words

All the copy lives in **[`_data/home.yml`](_data/home.yml)**: headings, paragraphs, the six roles, the "Your data" points, button labels and links, and the footer email. Open it on GitHub, click the pencil, change the text between the quotes, and commit.

A few things to know:

- Keep the indentation as it is. YAML uses it to know what belongs where.
- If a line contains a colon or starts with a quote, keep the whole value wrapped in `"double quotes"`.
- Roles, pillars and data points are lists, so you can add, remove or reorder items. Numbering (01, 02 …) and the stacking cards follow automatically.
- To change an image, put the file in `assets/img/` and put its file name in the YAML.

## Where the rest lives

| File | What it is |
| --- | --- |
| `_data/home.yml` | All the content |
| `index.html` | Page structure (pulls everything from the YAML) |
| `assets/css/site.css` | Layout, type and colours |
| `assets/js/site.js` | Scroll motion: hero parallax, stacking cards, drapery drift |
| `assets/img/` | Paintings and logos |

## Running it locally

```bash
gem install bundler jekyll
jekyll serve
```

Then open http://localhost:4000/
