import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  display: "swap"
});

const themeBootScript = `
  (function() {
    var storageKey = "portfolio-theme";
    var root = document.documentElement;
    var stored = localStorage.getItem(storageKey);
    var preference = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var resolved = preference === "system" ? (media.matches ? "dark" : "light") : preference;
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-theme-preference", preference);
  })();
`;

export const metadata: Metadata = {
  title: "Dawwi | Cloud & DevOps Portfolio",
  description:
    "Landing page anak IT Informatika untuk menampilkan project, pengalaman kerja, dan karya yang dipublish dari Strapi CMS.",
  icons: {
    icon: "/portfolio.png",
    shortcut: "/portfolio.png",
    apple: "/portfolio.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {children}
      </body>
    </html>
  );
}
