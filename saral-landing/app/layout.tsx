import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saral (सरल) — Voice-first form filler for everyone",
  description:
    "Fill complex online forms by speaking in Hindi, English, or Hinglish instead of typing. Open source, private, and simple.",
  icons: {
    icon: "/icon/icon32.png",
    apple: "/icon/icon128.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full scroll-smooth antialiased">
      <body className="min-h-full flex flex-col bg-black text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
