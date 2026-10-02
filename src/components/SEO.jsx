import { useEffect } from "react";

// Sets the tab title and the meta tags search engines and social shares read.
// The defaults live in index.html; this overrides them per page.
export default function SEO({ title, description }) {
  useEffect(() => {
    const upsert = (querySelector, key, value) => {
      let el = document.head.querySelector(querySelector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(key[0], key[1]);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };
    if (title) {
      document.title = title;
      upsert('meta[property="og:title"]', ["property", "og:title"], title);
      upsert('meta[name="twitter:title"]', ["name", "twitter:title"], title);
    }
    if (description) {
      upsert('meta[name="description"]', ["name", "description"], description);
      upsert('meta[property="og:description"]', ["property", "og:description"], description);
      upsert('meta[name="twitter:description"]', ["name", "twitter:description"], description);
    }
  }, [title, description]);
  return null;
}