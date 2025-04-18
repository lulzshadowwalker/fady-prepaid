"use client";

import {
  getDrivers,
} from "@/actions/drivers";
import { Driver } from "@/lib/types";
import { createContext, useContext, useEffect, useState } from "react";

type State = {
  drivers: Driver[];
  filter: string;
};

type Actions = {
  search: (query: string) => void;
};

const DriverContext = createContext<(State & Actions) | null>(null);

export function DriverProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filtered, setFiltered] = useState<Driver[]>([]);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    getDrivers().then((drivers) => {
      setDrivers(drivers);
      setFiltered(drivers);
    });
  }, []);

  function search(query: string) {
    setFilter(query);

    if (query.length === 0) {
      setFiltered(drivers);
      return;
    }

    const filtered = drivers.filter((driver) => {
      return driver.name.toLowerCase().includes(query.toLowerCase()) || 
        driver.phone.includes(query);
    });

    setFiltered(filtered);
  }

  return (
    <DriverContext.Provider value={{ drivers: filtered, filter, search }}>
      {children}
    </DriverContext.Provider>
  );
}

export function useDriver(): State & Actions {
  const context = useContext(DriverContext);

  if (!context) {
    throw new Error("useDriver must be used within a DriverProvider");
  }

  return context;
}
