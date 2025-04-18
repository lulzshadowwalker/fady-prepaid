"use client";

import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useDriver } from "@/context/driver-context";
import { Driver, DriverStatus } from "@/lib/types";
import Image from "next/image";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const createCustomIcon = (status: DriverStatus) => {
  const colorMap: Record<Driver["status"], string> = {
    idle: "bg-red-400",
    searching: "bg-yellow-400",
    working: "bg-green-400",
  };
  const color = colorMap[status];
  return new L.DivIcon({
    html: `
  <div class="relative w-6 h-6 flex items-center justify-center">
  ${
    status !== "idle"
      ? `<span class="absolute ${color} w-4 h-4 rounded-full opacity-50 animate-[ping_2s_ease-out_infinite]"></span>`
      : ""
  }
     <span class="relative ${color} w-3 h-3 rounded-full"></span>
  </div>
`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function CenterOnDrivers({ drivers }: { drivers: Driver[] }) {
  const map = useMap();
  const first = drivers.find((d) => d.location);
  if (first)
    map.setView([first.location!.latitude, first.location!.longitude], 5);
  return null;
}

export default function DriverLocationTracking() {
  const drivers = useDriver().drivers;

  return (
    <Card className="mt-5">
      <MapContainer
        style={{ height: "70vh", width: "100%" }}
        center={[32.561, 36.0067]} //  NOTE: Ramtha city lat, lng
        zoom={13}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CenterOnDrivers drivers={drivers} />

        {drivers
          .filter((d) => d.location)
          .map((driver, i) => {
            const name = driver.name
              .trim()
              .toLowerCase()
              .replace(/[^a-zA-Z0-9]/g, "+");
            const fallback = `https://ui-avatars.com/api/?name=${name}`;

            return (
              <Marker
                key={i}
                position={[driver.location!.latitude, driver.location!.longitude]}
                icon={createCustomIcon(driver.status)}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                          <Image
                            src={driver.avatar ?? fallback}
                            alt=""
                            fill
                            sizes="100%"
                            className="object-cover" />
                        </div>

                        <div className="flex flex-col">
                          <span className="text-base">{driver.name}</span>
                          <span className="text-sm font-light text-neutral-400">
                            {driver.phone}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Tooltip>
              </Marker>
            );
          })}
      </MapContainer>
    </Card>
  );
}
