"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCities, setCitiesStore, subscribe } from "./store";

// Re-exported for backward compatibility; the canonical defaults live in appDoc.
export { DEFAULT_CITIES } from "./appDoc";

// Per-device view preference — which city is currently selected. This is a UI
// preference, not knowledge-base data, so it stays in localStorage.
const SELECTED_CITY_KEY = "food-knowledge-city";

interface CityContextType {
  cities: string[];
  selectedCity: string | null; // null = all cities
  setSelectedCity: (city: string | null) => void;
  addCity: (city: string) => void;
}

const CityContext = createContext<CityContextType>({
  cities: [],
  selectedCity: null,
  setSelectedCity: () => {},
  addCity: () => {},
});

export function CityProvider({ children }: { children: ReactNode }) {
  // The store is already hydrated by DataProvider before this mounts.
  const [cities, setCities] = useState<string[]>(() => getCities());
  const [selectedCity, setSelectedCityState] = useState<string | null>(null);

  useEffect(() => {
    const savedCity = localStorage.getItem(SELECTED_CITY_KEY);
    if (savedCity && savedCity !== "null") setSelectedCityState(savedCity);
    // Keep the city list in sync with store changes (e.g. data import).
    return subscribe(() => setCities([...getCities()]));
  }, []);

  function setSelectedCity(city: string | null) {
    setSelectedCityState(city);
    localStorage.setItem(SELECTED_CITY_KEY, city ?? "null");
  }

  function addCity(city: string) {
    const trimmed = city.trim();
    if (!trimmed || cities.includes(trimmed)) return;
    const updated = [...cities, trimmed];
    setCities(updated);
    setCitiesStore(updated);
  }

  return (
    <CityContext.Provider value={{ cities, selectedCity, setSelectedCity, addCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext() {
  return useContext(CityContext);
}
