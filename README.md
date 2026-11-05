# bigjon.dev

Jon Roberts' personal site and blog. It's an [Eleventy 3](https://www.11ty.dev/) static site styled with
Tailwind CSS 4 and deployed to GitHub Pages.

## Development

Node.js and pnpm versions are pinned in `package.json` and managed with [Volta](https://volta.sh/):
install Volta, set `VOLTA_FEATURE_PNPM=1`, and the pinned versions are used automatically in this
directory. CI reads the same Node version from `package.json`.

```sh
make setup     # pnpm install
make dev       # dev server at http://localhost:8080, in the background
make shutdown  # stop the dev server
make build     # production build into _site/
make test      # build smoke test (node:test)
```

## Writing a post

Add a markdown file to `src/blog/`. The file name becomes the URL: `src/blog/my-post.md` is published
at `/blog/my-post/`.

```markdown
---
title: My post
description: One or two sentences, shown in post lists and the meta description.
date: 2026-11-04
tags: [eleventy, dotnet]
draft: true
---

Post body in markdown. Fenced code blocks get syntax highlighting.
```

- `draft: true` shows the post under `make dev` and leaves it out of `make build`, so it's never
  deployed. Remove the line (or set it to `false`) to publish.
- Tags get their own pages under `/tags/`.
- Posts are plain markdown: Nunjucks tags such as `{{ }}` are not processed, so code samples render as
  written.
- Put images in `src/_assets/images/` and reference them as `/_assets/images/<file>`.

## Layout

| Path | What |
| --- | --- |
| `eleventy.config.js` | Plugins, filters, collections, drafts, CSS build |
| `src/_data/site.js` | Site title, author, URL, nav links |
| `src/_layouts/` | `base.njk` page shell, `post.njk` post layout, shared partials |
| `src/_assets/css/main.css` | Tailwind entry point and syntax highlighting colors |
| `src/blog/` | Posts; `blog.11tydata.js` sets their layout, tag and URL |
| `src/blog.njk`, `src/tags.njk`, `src/tag.njk` | Blog index (10 per page) and tag pages |
| `tests/build.test.js` | Smoke test that builds the site and checks the output |

The Atom feed is generated at `/feed.xml`.

## Deployment

`.github/workflows/gh-pages.yml` tests and builds every push to `main` and publishes `_site` to the
`gh-pages` branch. Each pull request from this repo gets a preview at `/pr-preview/pr-<N>/` (built with
`PATH_PREFIX` and a `noindex` meta), which is removed when the PR closes. In the repository's Pages
settings, set the source to the `gh-pages` branch.
