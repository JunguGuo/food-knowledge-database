import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { CityProvider } from "@/lib/cityContext";
import { TagProvider } from "@/lib/tagContext";

export const metadata: Metadata = {
  title: "Food Knowledge Database",
  description: "Personal food intelligence system for tracking restaurants and dishes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CityProvider>
        <TagProvider>
          <div className="app-shell">
            <Sidebar />
            <div className="main-area">
              <div className="content-area">
                {children}
              </div>
            </div>
          </div>
          <ToastProvider />
        </TagProvider>
        </CityProvider>
      </body>
    </html>
  );
}
