import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { pageFor } from "@/lib/site-data";

const page = pageFor("/");

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: page.path },
  openGraph: { title: page.title, description: page.description, url: page.path }
};

export default function Page() {
  return <HomePage page={page} />;
}
