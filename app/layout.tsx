import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kindwell.com.au"),

  title: {
    default: "Kindwell Clinic | Your Wellness Journey Starts Today",
    template: "%s | Kindwell Clinic",
  },
  description:
    "Kindwell Clinic — your wellness journey starts today. Book consultations and trusted health services with our experienced care team.",

  keywords: [
    "Kindwell Clinic",
    "wellness clinic Australia",
    "health clinic booking",
    "telehealth Australia",
    "medical consultation booking",
  ],

  authors: [{ name: "Kindwell Clinic" }],
  creator: "Kindwell Clinic",
  publisher: "Kindwell Clinic",
  generator: "www.milkyano.com",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://kindwell.com.au",
    siteName: "Kindwell Clinic",
    title: "Kindwell Clinic | Your Wellness Journey Starts Today",
    description:
      "Kindwell Clinic — your wellness journey starts today. Book consultations and trusted health services with our experienced care team.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kindwell Clinic",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Kindwell Clinic | Your Wellness Journey Starts Today",
    description:
      "Kindwell Clinic — your wellness journey starts today. Book consultations and trusted health services with our experienced care team.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  category: "health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>

        <link rel="icon" href="/favicon.ico" type="image/webp" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>

      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}