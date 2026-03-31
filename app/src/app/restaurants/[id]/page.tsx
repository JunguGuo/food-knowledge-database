"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getRestaurantById, getMenuItemsByRestaurant,
  updateRestaurant, deleteRestaurant,
  createMenuItem, updateMenuItem, deleteMenuItem,
} from "@/lib/store";
import { Restaurant, MenuItem, MenuItemStatus } from "@/lib/types";
import { RatingDisplay } from "@/components/Rating";
import { StatusBadge } from "@/components/StatusBadge";
import { LabelPill } from "@/components/LabelPill";
import { RestaurantForm } from "@/components/RestaurantForm";
import { MenuItemForm } from "@/components/MenuItemForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { showToast } from "@/components/Toast";

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showEditRestaurant, setShowEditRestaurant] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "restaurant" | "item"; id: string } | null>(null);

  const reload = useCallback(() => {
    const r = getRestaurantById(id);
    if (!r) { router.push("/restaurants"); return; }
    setRestaurant(r);
    setItems(getMenuItemsByRestaurant(id));
  }, [id, router]);

  useEffect(() => { reload(); }, [reload]);

  if (!restaurant) return null;

  const filteredItems = statusFilter === "All"
    ? items
    : items.filter((m) => {
        if (statusFilter === "Favorites") return m.status === "favorite";
        if (statusFilter === "Avoid") return m.status === "avoid";
        return true;
      });

  return (
    <div className="screen">
      <div style={{ marginBottom: 16 }}>
        <Link href="/restaurants" style={{ fontSize: 13, color: "var(--text-tertiary)", textDecoration: "none" }}>
          ← Back to Restaurants
        </Link>
      </div>

      <div className="detail-header">
        <div>
          <div className="detail-title">{restaurant.name}</div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-secondary" onClick={() => setShowEditRestaurant(true)}>Edit Restaurant</button>
          <button className="btn btn-danger" onClick={() => setConfirmDelete({ type: "restaurant", id: restaurant.id })}>Delete</button>
          <button className="btn btn-primary" onClick={() => setShowAddItem(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Menu Item
          </button>
        </div>
      </div>

      <div className="detail-meta">
        <RatingDisplay value={restaurant.overallRating} showValue />
        {restaurant.city && <span className="city-badge">📍 {restaurant.city}</span>}
        {restaurant.cuisineTags.map((t) => <span key={t} className="tag">{t}</span>)}
        {restaurant.labels.map((l) => <LabelPill key={l} label={l} />)}
        {restaurant.location && <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{restaurant.location}</span>}
      </div>

      <div className="detail-notes">
        <div className="detail-notes-title">Notes</div>
        <p>{restaurant.notes || "No notes yet."}</p>
      </div>

      <div className="menu-items-header">
        <div className="menu-items-title">
          Menu Items <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 14, color: "var(--text-secondary)" }}>· {items.length} tracked</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "Favorites", "Avoid"].map((f) => (
            <div key={f} className={`chip${statusFilter === f ? " active" : ""}`} style={{ padding: "3px 10px", fontSize: "11.5px" }} onClick={() => setStatusFilter(f)}>{f}</div>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">{statusFilter !== "All" ? "No matching items" : "No menu items yet"}</div>
          <div className="empty-state-desc">{statusFilter !== "All" ? "Try a different filter" : "Track your first dish from this restaurant"}</div>
          {statusFilter === "All" && <button className="btn btn-primary" onClick={() => setShowAddItem(true)}>Add Menu Item</button>}
        </div>
      ) : (
        <table className="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Tags</th>
              <th>Note</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((m) => (
              <tr key={m.id}>
                <td className="item-name-cell">{m.name}</td>
                <td>{m.category && <span className="tag">{m.category}</span>}</td>
                <td><RatingDisplay value={m.rating} /></td>
                <td><StatusBadge status={m.status} /></td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {m.tags.map((t) => <LabelPill key={t} label={t} />)}
                  </div>
                </td>
                <td className="item-note-cell">{m.notes}</td>
                <td className="item-price">{m.price != null ? `$${m.price.toFixed(2)}` : ""}</td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => setEditingItem(m)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12, color: "var(--status-avoid)" }} onClick={() => setConfirmDelete({ type: "item", id: m.id })}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showEditRestaurant && (
        <RestaurantForm
          restaurant={restaurant}
          onClose={() => setShowEditRestaurant(false)}
          onSave={(data) => {
            updateRestaurant(restaurant.id, data);
            reload();
            setShowEditRestaurant(false);
            showToast("Restaurant updated");
          }}
        />
      )}

      {(showAddItem || editingItem) && (
        <MenuItemForm
          item={editingItem ?? undefined}
          onClose={() => { setShowAddItem(false); setEditingItem(null); }}
          onSave={(data) => {
            if (editingItem) {
              updateMenuItem(editingItem.id, data);
              showToast("Item updated");
            } else {
              createMenuItem({ ...data, restaurantId: id });
              showToast("Item added");
            }
            reload();
            setShowAddItem(false);
            setEditingItem(null);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={confirmDelete.type === "restaurant" ? "Delete Restaurant?" : "Delete Menu Item?"}
          message={confirmDelete.type === "restaurant"
            ? "This will permanently delete this restaurant and all its menu items. This cannot be undone."
            : "This will permanently delete this menu item. This cannot be undone."}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.type === "restaurant") {
              deleteRestaurant(confirmDelete.id);
              showToast("Restaurant deleted");
              router.push("/restaurants");
            } else {
              deleteMenuItem(confirmDelete.id);
              showToast("Item deleted");
              reload();
            }
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}
