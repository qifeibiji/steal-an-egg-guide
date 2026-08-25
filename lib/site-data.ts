import rawPages from "@/content/site-pages.json";

export type Source = {
  name: string;
  url: string;
};

export type Section = {
  heading: string;
  paragraphs: string[];
  links: string[];
};

export type PageData = {
  path: string;
  topic: string;
  title: string;
  description: string;
  h1: string;
  answer: string;
  intro: string;
  checkedDate: string;
  sections: Section[];
  sources: Source[];
};

export const pages = rawPages as PageData[];

export function pageFor(path: string): PageData {
  const page = pages.find((entry) => entry.path === path);

  if (!page) {
    throw new Error(`No page data for ${path}`);
  }

  return page;
}

export function titleForPath(path: string): string {
  return pageFor(path).h1;
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
