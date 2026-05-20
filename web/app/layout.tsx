import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeScript } from "@/components/ThemeScript";
import { siteConfig } from "@/lib/site-config";

// The OG image is what social platforms (Twitter, LinkedIn, Slack, iMessage,
// etc.) show as the thumbnail when this link is shared. Put a 1200x630 PNG
// at /static/og-image.png and the metadata below will reference it on every
// page that doesn't override `openGraph.images` itself.
const OG_IMAGE = "/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ellemouton.com"),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [OG_IMAGE],
  },
  // RSS feed autodiscovery — emits <link rel="alternate" type="application/rss+xml">
  // so feed readers and browser extensions surface a subscribe affordance.
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/index.xml", title: siteConfig.title }],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="main mx-auto w-full flex-1 p-(--gap)">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
