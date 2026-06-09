import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
}

export default function SEO({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogType = "website"
}: SEOProps) {
  useEffect(() => {
    // Set document title
    document.title = title ? `${title} | StudyRoom` : "StudyRoom - Empowering Collaborative Learning";

    // Helper to set or update meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute("content", content);
      } else {
        element = document.createElement("meta");
        if (isProperty) {
          element.setAttribute("property", name);
        } else {
          element.setAttribute("name", name);
        }
        element.setAttribute("content", content);
        document.head.appendChild(element);
      }
    };

    // Set meta description
    if (description) {
      setMetaTag("description", description);
    }

    // Set keywords
    if (keywords) {
      setMetaTag("keywords", keywords);
    }

    // Set Open Graph tags
    setMetaTag("og:title", ogTitle || title || "StudyRoom", true);
    setMetaTag("og:description", ogDescription || description || "", true);
    setMetaTag("og:type", ogType, true);
    setMetaTag("og:url", window.location.href, true);

    // Set Twitter tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", ogTitle || title || "StudyRoom");
    setMetaTag("twitter:description", ogDescription || description || "");

  }, [title, description, keywords, ogTitle, ogDescription, ogType]);

  return null;
}
