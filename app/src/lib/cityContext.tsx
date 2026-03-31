"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export const DEFAULT_CITIES = ["Cleveland", "Chicago", "New York", "Los Angeles", "San Francisco"];

const CITIES_KEY = "food-knowledge-cities";
const SELECTED_CITY_KEY = "food-knowledge-city";

interface CityContextType {
  cities: string[];
  selectedCity: string | null; // null = all cities
  setSelectedCity: (city: string | null) => void;
  addCity: (city: string) => void;
}

const CityContext = createContext<CityContextType>({
  cities: DEFAULT_CITIES,
  selectedCity: null,
  setSelectedCity: () => {},
  addCity: () => {},
});

export function CityProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<string[]>(DEFAULT_CITIES);
  const [selectedCity, setSelectedCityState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedCities = localStorage.getItem(CITIES_KEY);
    const savedCity = localStorage.getItem(SELECTED_CITY_KEY);
    if (savedCities) {
      try { setCities(JSON.parse(savedCities)); } catch {}
    }
    if (savedCity && savedCity !== "null") {
      setSelectedCityState(savedCity);
    }
    setHydrated(true);
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
    localStorage.setItem(CITIES_KEY, JSON.stringify(updated));
  }

  if (!hydrated) return null;

  return (
    <CityContext.Provider value={{ cities, selectedCity, setSelectedCity, addCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCityContext() {
  return useContext(CityContext);
}
