"use client";

import { useState, useRef, useEffect } from "react";
import { exportData, importData, getRestaurants, getMenuItems } from "@/lib/store";
import { AppData } from "@/lib/types";
import { showToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function DataSettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<AppData | null>(null);
  const [counts, setCounts] = useState({ restaurants: 0, menuItems: 0 });

  useEffect(() => {
    setCounts({ restaurants: getRestaurants().length, menuItems: getMenuItems().length });
  }, []);

  function handleExport() {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `food-knowledge-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported successfully");
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as AppData;
        if (!data.restaurants || !data.menuItems) {
          showToast("Invalid file format");
          return;
        }
        setPendingImport(data);
        setShowConfirm(true);
      } catch {
        showToast("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function confirmImport() {
    if (!pendingImport) return;
    importData(pendingImport, "merge");
    setCounts({ restaurants: getRestaurants().length, menuItems: getMenuItems().length });
    showToast(`Imported ${pendingImport.restaurants.length} restaurants and ${pendingImport.menuItems.length} menu items`);
    setPendingImport(null);
    setShowConfirm(false);
  }

  const estimatedSize = Math.round(JSON.stringify(exportData()).length / 1024);

  return (
    <div className="screen">
      <div className="page-header">
        <div className="page-title">Data Management</div>
        <div className="page-subtitle">Export, import, and manage your food knowledge base</div>
      </div>

      <div className="data-section">
        <div className="data-section-title">Export Database</div>
        <div className="data-section-desc">
          Download a complete copy of your food knowledge base as a JSON file. Includes all restaurants, menu items, ratings, notes, and tags.
        </div>
        <div className="info-box info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>Your export will contain {counts.restaurants} restaurants and {counts.menuItems} menu items. File size estimate: ~{estimatedSize} KB.</span>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={handleExport}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export as JSON
        </button>
      </div>

      <div className="data-section">
        <div className="data-section-title">Import Data</div>
        <div className="data-section-desc">
          Import a previously exported JSON file to restore or merge data into your knowledge base.
        </div>
        <div className="info-box warning">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>Importing will merge data with your existing database. Duplicate entries will be skipped. Consider exporting a backup first.</span>
        </div>
        <input type="file" ref={fileRef} accept=".json" onChange={handleFileSelect} style={{ display: "none" }} />
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => fileRef.current?.click()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Choose JSON File
        </button>
      </div>

      {showConfirm && pendingImport && (
        <ConfirmDialog
          title="Confirm Import"
          message={`This will merge ${pendingImport.restaurants.length} restaurants and ${pendingImport.menuItems.length} menu items into your database. Existing entries with the same ID will not be overwritten.`}
          confirmLabel="Import"
          onCancel={() => { setShowConfirm(false); setPendingImport(null); }}
          onConfirm={confirmImport}
        />
      )}
    </div>
  );
}
