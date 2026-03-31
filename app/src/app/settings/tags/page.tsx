"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  useTagContext,
  DEFAULT_CUISINE_TAGS,
  DEFAULT_RESTAURANT_LABELS,
  DEFAULT_MENU_ITEM_TAGS,
} from "@/lib/tagContext";
import { renameTagInRestaurants, renameTagInMenuItems } from "@/lib/store";
import { showToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

function TagListManager({
  title,
  description,
  tags,
  onUpdate,
  onRename,
  defaults,
}: {
  title: string;
  description: string;
  tags: string[];
  onUpdate: (tags: string[]) => void;
  onRename: (oldTag: string, newTag: string) => number;
  defaults: string[];
}) {
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTag && editRef.current) editRef.current.focus();
  }, [editingTag]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newTag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onUpdate([...tags, trimmed]);
    setNewTag("");
    showToast(`Added "${trimmed}"`);
  }

  function handleDelete(tag: string) {
    onUpdate(tags.filter((t) => t !== tag));
    showToast(`Removed "${tag}"`);
  }

  function startEdit(tag: string) {
    setEditingTag(tag);
    setEditValue(tag);
  }

  function commitEdit(old: string) {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === old) { setEditingTag(null); return; }
    if (tags.includes(trimmed)) { showToast("Tag already exists"); setEditingTag(null); return; }
    onUpdate(tags.map((t) => (t === old ? trimmed : t)));
    const affected = onRename(old, trimmed);
    setEditingTag(null);
    if (affected > 0) {
      showToast(`Renamed "${old}" → "${trimmed}" (updated ${affected} item${affected > 1 ? "s" : ""})`);
    } else {
      showToast(`Renamed "${old}" → "${trimmed}"`);
    }
  }

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <div>
          <div className="settings-section-title">{title}</div>
          <div className="settings-section-desc">{description}</div>
        </div>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 11.5, flexShrink: 0 }}
          onClick={() => setConfirmReset(true)}
        >
          Reset to defaults
        </button>
      </div>

      <div className="settings-tag-chips">
        {tags.length === 0 && (
          <span style={{ color: "var(--text-tertiary)", fontSize: 12.5 }}>No tags yet.</span>
        )}
        {tags.map((tag) =>
          editingTag === tag ? (
            <form
              key={tag}
              className="settings-chip-edit"
              onSubmit={(e) => { e.preventDefault(); commitEdit(tag); }}
            >
              <input
                ref={editRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitEdit(tag)}
                onKeyDown={(e) => { if (e.key === "Escape") setEditingTag(null); }}
              />
            </form>
          ) : (
            <span key={tag} className="settings-chip" onClick={() => startEdit(tag)}>
              {tag}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDelete(tag); }}
              >
                &times;
              </button>
            </span>
          )
        )}
      </div>

      <form onSubmit={handleAdd} className="settings-add-row">
        <input
          className="form-input"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a new tag…"
        />
        <button type="submit" className="btn btn-secondary" disabled={!newTag.trim()}>
          Add
        </button>
      </form>

      {confirmReset && (
        <ConfirmDialog
          title={`Reset ${title}?`}
          message={`This will replace your current list with the defaults. Custom tags will be lost.`}
          confirmLabel="Reset"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            onUpdate(defaults);
            setConfirmReset(false);
            showToast("Reset to defaults");
          }}
        />
      )}
    </div>
  );
}

export default function ManageTagsPage() {
  const {
    cuisineTags,
    restaurantLabels,
    menuItemTags,
    setCuisineTags,
    setRestaurantLabels,
    setMenuItemTags,
  } = useTagContext();

  return (
    <div className="screen">
      <div style={{ marginBottom: 16 }}>
        <Link href="/settings" style={{ fontSize: 13, color: "var(--text-tertiary)", textDecoration: "none" }}>
          ← Back to Settings
        </Link>
      </div>

      <div className="page-header">
        <div className="page-title">Manage Tags</div>
        <div className="page-subtitle">Edit tag presets used as suggestions in forms. Click a tag to rename it.</div>
      </div>

      <TagListManager
        title="Cuisine Tags"
        description="Suggested when adding a restaurant's cuisine style."
        tags={cuisineTags}
        onUpdate={setCuisineTags}
        onRename={(old, next) => renameTagInRestaurants("cuisineTags", old, next)}
        defaults={DEFAULT_CUISINE_TAGS}
      />
      <TagListManager
        title="Restaurant Labels"
        description="Suggested when labelling restaurants (e.g. Reliable, Date Night)."
        tags={restaurantLabels}
        onUpdate={setRestaurantLabels}
        onRename={(old, next) => renameTagInRestaurants("labels", old, next)}
        defaults={DEFAULT_RESTAURANT_LABELS}
      />
      <TagListManager
        title="Menu Item Tags"
        description="Suggested when tagging menu items (e.g. Spicy, Comfort)."
        tags={menuItemTags}
        onUpdate={setMenuItemTags}
        onRename={(old, next) => renameTagInMenuItems(old, next)}
        defaults={DEFAULT_MENU_ITEM_TAGS}
      />
    </div>
  );
}
