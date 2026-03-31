"use client";

import { useEffect, useRef } from "react";
import { Restaurant } from "@/lib/types";
import { RatingDisplay } from "./Rating";
import { LabelPill } from "./LabelPill";
import Link from "next/link";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RestaurantMapProps {
  restaurants: Restaurant[];
  itemCounts: Record<string, number>;
}

export function RestaurantMap({ restaurants, itemCounts }: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const mappable = restaurants.filter((r) => r.latitude != null && r.longitude != null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    if (mappable.length === 0) {
      map.setView([39.8283, -98.5795], 4); // Center of US
      return;
    }

    const markers: L.Marker[] = [];

    for (const r of mappable) {
      const ratingStars = r.overallRating
        ? `<span style="color:#B5882C;font-weight:600">${"★".repeat(r.overallRating)}${"☆".repeat(5 - r.overallRating)}</span>`
        : '<span style="color:#A9A49C">No rating</span>';

      const tags = [...r.cuisineTags, ...r.labels]
        .slice(0, 4)
        .map((t) => `<span style="display:inline-block;padding:1px 7px;background:#F7F6F3;border-radius:10px;font-size:11px;color:#7A756D;margin-right:3px">${t}</span>`)
        .join("");

      const count = itemCounts[r.id] || 0;

      const popup = `
        <div style="font-family:'Outfit',-apple-system,sans-serif;min-width:180px;max-width:240px">
          <a href="/restaurants/${r.id}" style="font-size:14px;font-weight:600;color:#1A1917;text-decoration:none;display:block;margin-bottom:4px">${r.name}</a>
          <div style="margin-bottom:5px">${ratingStars}</div>
          ${tags ? `<div style="margin-bottom:5px">${tags}</div>` : ""}
          <div style="font-size:11px;color:#7A756D">${count} item${count !== 1 ? "s" : ""} tracked${r.location ? ` · ${r.location}` : ""}</div>
        </div>
      `;

      const rating = r.overallRating ?? 0;
      const hue = rating >= 4 ? 36 : rating >= 3 ? 48 : 0;
      const sat = rating >= 4 ? "80%" : rating >= 3 ? "60%" : "0%";
      const light = rating >= 4 ? "45%" : rating >= 3 ? "55%" : "65%";

      const icon = L.divIcon({
        className: "restaurant-marker",
        html: `<div style="
          width:32px;height:32px;border-radius:50%;
          background:hsl(${hue},${sat},${light});
          border:3px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
          font-size:14px;cursor:pointer;
        ">🍽️</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([r.latitude!, r.longitude!], { icon }).addTo(map);
      marker.bindPopup(popup, { closeButton: false, maxWidth: 260 });
      markers.push(marker);
    }

    // Fit bounds to show all markers
    if (markers.length === 1) {
      map.setView(markers[0].getLatLng(), 14);
    } else {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.15));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mappable.map((r) => r.id).join(",")]);

  const unmappable = restaurants.filter((r) => r.latitude == null || r.longitude == null);

  return (
    <div className="restaurant-map-container">
      <div ref={mapRef} className="restaurant-map" />
      {unmappable.length > 0 && (
        <div className="map-unmappable-notice">
          {unmappable.length} restaurant{unmappable.length !== 1 ? "s" : ""} not shown (no coordinates):
          {" "}{unmappable.map((r) => r.name).join(", ")}
        </div>
      )}
    </div>
  );
}
