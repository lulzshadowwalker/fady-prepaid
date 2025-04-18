'use client';

import { DriverSearch } from "./components/driver-search";
import dynamic from "next/dynamic";

const DriverLocationTracking = dynamic(() => import('./components/driver-location-tracking'), { ssr: false })

export default function DriverTracking() {
  return (
    <main>
      <section>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Driver Tracking
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          View the location and status of your drivers (no real-time support is available).
        </p>
      </section>

      <DriverSearch />
      <DriverLocationTracking />
    </main>
  )
}
