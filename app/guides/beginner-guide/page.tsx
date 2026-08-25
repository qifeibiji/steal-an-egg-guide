import type { Metadata } from "next";
import { GuidePage } from "@/components/guide-page";
import { pageFor } from "@/lib/site-data";

const page = pageFor("/guides/beginner-guide/");

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: page.path },
  openGraph: { title: page.title, description: page.description, url: page.path }
};

export default function Page() {
  return <GuidePage page={page} />;
}
