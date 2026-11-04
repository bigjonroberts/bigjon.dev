// Defaults for every markdown post in src/blog/.
export default {
  layout: "post.njk",
  tags: ["posts"],
  permalink: "/blog/{{ page.fileSlug }}/",
  // Plain markdown only, so `{{ }}` and `{% %}` in code samples render as written.
  templateEngineOverride: "md",
};
