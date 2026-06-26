"use client";

import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="screen">
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-subtitle">Preferences and configuration</div>
      </div>

      <div className="settings-hub">
        <Link href="/settings/tags" className="settings-hub-card">
          <div className="settings-hub-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <div className="settings-hub-content">
            <div className="settings-hub-title">Manage Tags</div>
            <div className="settings-hub-desc">Cuisine styles, restaurant labels, and menu item tags</div>
          </div>
          <svg className="settings-hub-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>

        <Link href="/settings/data" className="settings-hub-card">
          <div className="settings-hub-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div className="settings-hub-content">
            <div className="settings-hub-title">Data Management</div>
            <div className="settings-hub-desc">Export, import, and manage your food knowledge base</div>
          </div>
          <svg className="settings-hub-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
      </div>
    </div>
  );
}
