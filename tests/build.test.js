import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, '_site');

function build(env = {}) {
  const result = spawnSync('pnpm', ['build'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  assert.equal(result.status, 0, `pnpm build failed:\n${result.stdout}\n${result.stderr}`);
}

function page(rel) {
  const file = join(site, rel);
  assert.ok(existsSync(file), `missing ${rel}`);
  return readFileSync(file, 'utf8');
}

before(() => build());

test('home page lists the latest post', () => {
  assert.ok(page('index.html').includes('href="/blog/hello-world/"'));
});

test('markdown posts build under /blog/<file name>/ with the post layout', () => {
  const html = page('blog/hello-world/index.html');
  assert.ok(/<h1[^>]*>Hello, world<\/h1>/.test(html), 'post title should be the <h1>');
  assert.ok(html.includes('datetime="2026-11-04"'), 'post date should come from front matter');
  assert.ok(html.includes('<span class="token keyword">export</span>'), 'fenced code should be syntax highlighted');
  assert.ok(page('blog/index.html').includes('href="/blog/hello-world/"'), 'blog index should list the post');
});

test('tag index and per-tag pages are built, without the internal posts tag', () => {
  assert.ok(page('tags/index.html').includes('href="/tags/eleventy/"'));
  assert.ok(page('tags/eleventy/index.html').includes('href="/blog/hello-world/"'));
  assert.ok(!existsSync(join(site, 'tags', 'posts')), 'the posts collection tag should not get a page');
});

test('about page is built', () => {
  assert.ok(/<h1[^>]*>About<\/h1>/.test(page('about/index.html')));
});

test('atom feed has absolute post links', () => {
  assert.ok(page('feed.xml').includes('<link href="https://bigjon.dev/blog/hello-world/" />'));
});

test('custom 404 page is built at the root with root-relative links', () => {
  const html = page('404.html');
  assert.ok(html.includes('Page Not Found'));
  assert.ok(html.includes('href="/blog/"'));
});

test('pages load the Tailwind stylesheet with typography styles', () => {
  assert.ok(page('index.html').includes('href="/css/main.css"'));
  const css = page('css/main.css');
  for (const rule of ['.prose', '.text-primary', 'dark\\:prose-invert']) {
    assert.ok(css.includes(rule), `css/main.css should define ${rule}`);
  }
});

test('footer shows the build year in the copyright', () => {
  const year = String(new Date().getUTCFullYear());
  assert.ok(page('index.html').includes(`&copy; ${year} Jon Roberts`));
});

test('default build is indexable (no preview noindex) and keeps the custom domain', () => {
  assert.ok(!page('index.html').includes('noindex'));
  assert.equal(page('CNAME').trim(), 'bigjon.dev');
});

test('draft posts are left out of the build', () => {
  const draft = join(root, 'src', 'blog', 'zz-test-draft.md');
  writeFileSync(draft, '---\ntitle: Test Draft\ndate: 2026-01-01\ndraft: true\n---\nNot yet.\n');
  try {
    build();
    assert.ok(!existsSync(join(site, 'blog', 'zz-test-draft')), 'draft should not be built');
    assert.ok(!page('blog/index.html').includes('Test Draft'), 'draft should not be listed');
    assert.ok(!page('feed.xml').includes('Test Draft'), 'draft should not be in the feed');
  } finally {
    rmSync(draft);
    build();
  }
});
