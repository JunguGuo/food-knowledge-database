import { Sidebar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { CityProvider } from "@/lib/cityContext";
import { TagProvider } from "@/lib/tagContext";
import { DataProvider } from "@/lib/dataClient";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <CityProvider>
        <TagProvider>
          <div className="app-shell">
            <Sidebar />
            <div className="main-area">
              <div className="content-area">{children}</div>
            </div>
          </div>
          <ToastProvider />
        </TagProvider>
      </CityProvider>
    </DataProvider>
  );
}
