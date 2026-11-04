import { execSync } from "child_process";
import { HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import site from "./src/_data/site.js";

/**
 * @param {import("@11ty/eleventy").UserConfig} eleventyConfig
 * @returns {ReturnType<import("@11ty/eleventy").configFunction>}
 */
export default function(eleventyConfig) {
  // Applies PATH_PREFIX to root-relative href/src (gh-pages.yml sets it for PR previews).
  eleventyConfig.addPlugin(HtmlBasePlugin);
  // Prism classes on fenced code blocks; the token colors live in main.css.
  eleventyConfig.addPlugin(syntaxHighlight);
  // Atom feed of the blog at /feed.xml.
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 20 },
    metadata: {
      language: site.language,
      title: site.title,
      subtitle: site.description,
      base: site.url,
      author: { name: site.author },
    },
  });

  // Set only by gh-pages.yml's preview build; adds a noindex meta to every page.
  eleventyConfig.addGlobalData("preview", process.env.PREVIEW === "true");
  // Footer copyright year, fixed at build time (UTC).
  eleventyConfig.addGlobalData("currentYear", new Date().getUTCFullYear());

  // Posts with `draft: true` show up under `pnpm start` but are left out of `pnpm build`.
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  // Process CSS with PostCSS
  eleventyConfig.on("eleventy.before", async () => {
    execSync("pnpm exec postcss src/_assets/css/main.css -o _site/css/main.css");
  });
  eleventyConfig.addWatchTarget("src/_assets/css/");

  // Add date filter
  eleventyConfig.addFilter("date", function(date, format) {
    if (!date) return "";
    const dateObj = new Date(date);

    // Format in UTC so a front matter date like 2026-11-04 doesn't shift a
    // day depending on the build machine's timezone.
    if (format === "YYYY-MM-DD") {
      return dateObj.toISOString().slice(0, 10);
    } else if (format === "MMMM D, YYYY") {
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
      });
    }

    return dateObj.toLocaleDateString("en-US", { timeZone: "UTC" });
  });

  // Tags that only group content, not ones a reader would browse by.
  eleventyConfig.addFilter("filterTagList", function(tags) {
    return (tags || []).filter(tag => !["all", "posts"].includes(tag));
  });

  // Every tag used on a post, sorted, for /tags/ and the per-tag pages.
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tags = new Set();
    for (const post of collectionApi.getFilteredByTag("posts")) {
      for (const tag of post.data.tags || []) {
        if (!["all", "posts"].includes(tag)) tags.add(tag);
      }
    }
    return [...tags].sort((a, b) => a.localeCompare(b));
  });

  eleventyConfig.addPassthroughCopy("src/_assets/favicons");
  eleventyConfig.addPassthroughCopy("src/_assets/images");
  // Keeps the custom domain when the site is deployed to the gh-pages branch.
  eleventyConfig.addPassthroughCopy("src/CNAME");

  return {
    pathPrefix: process.env.PATH_PREFIX || "/",

    dir: {
      input: "src",
      output: "_site",
      includes: "_layouts",
      layouts: "_layouts",
      data: "_data"
    },

    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
