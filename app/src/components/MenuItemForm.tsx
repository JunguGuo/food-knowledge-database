"use client";

import { useState, useEffect } from "react";
import { MenuItem, MenuItemStatus } from "@/lib/types";
import { useTagContext } from "@/lib/tagContext";
import { RatingInput } from "./Rating";
import { TagInput } from "./TagInput";

interface MenuItemFormProps {
  item?: MenuItem;
  onSave: (data: {
    name: string;
    category: string;
    rating: number | null;
    status: MenuItemStatus;
    tags: string[];
    notes: string;
    price: number | null;
  }) => void;
  onClose: () => void;
}

export function MenuItemForm({ item, onSave, onClose }: MenuItemFormProps) {
  const { menuItemTags: tagOptions } = useTagContext();
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [rating, setRating] = useState<number | null>(item?.rating ?? null);
  const [status, setStatus] = useState<MenuItemStatus>(item?.status ?? "neutral");
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [priceStr, setPriceStr] = useState(item?.price != null ? item.price.toString() : "");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const price = priceStr ? parseFloat(priceStr) : null;
    onSave({ name: name.trim(), category, rating, status, tags, notes, price: price !== null && isNaN(price) ? null : price });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{item ? "Edit Menu Item" : "Add Menu Item"}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dry Pot Lamb" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Main, Appetizer, Side" />
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input className="form-input" value={priceStr} onChange={(e) => setPriceStr(e.target.value)} placeholder="e.g. 14.50" type="number" step="0.01" min="0" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Rating</label>
                <RatingInput value={rating} onChange={setRating} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value as MenuItemStatus)}>
                  <option value="favorite">Favorite</option>
                  <option value="liked">Liked</option>
                  <option value="neutral">Neutral</option>
                  <option value="avoid">Avoid</option>
                  <option value="want_to_try">Want to Try</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <TagInput value={tags} onChange={setTags} suggestions={tagOptions} placeholder="e.g. Spicy, Comfort" />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tasting notes, reorder advice..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{item ? "Save Changes" : "Add Item"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
