import {
  collection,
  getDocs,
  query, where,
  documentId,
} from "firebase/firestore";
import {
  getDatabase,
  ref as rtdbRef,
  get as rtdbGet,
} from "firebase/database";
import { Driver } from "@/lib/types";
import { firestore } from "@/lib/firebase";
import { DriverRepository } from "../contracts/driver-repository";
import { DriverConverter } from "../converter/driver-converter";

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export class FirebaseDriverRepository implements DriverRepository {
  private collectionName = "drivers_data";
  private rtdbPath       = "/drivers/locations";

  async getAll(opts: { withLocations?: boolean } = { withLocations: true }): Promise<Driver[]> {
    // 1️⃣ Pull all RTDB locations
    const db      = getDatabase();
    const locSnap = await rtdbGet(rtdbRef(db, this.rtdbPath));
    const locs: Record<string, [number, number, any]> = 
      locSnap.exists() ? (locSnap.val() as any) : {};

    // 2️⃣ Find which doc‑IDs actually have a location array
    const idsWithLoc = Object.keys(locs).filter((id) => {
      const arr = locs[id];
      return Array.isArray(arr) && arr.length >= 2;
    });

    // 3️⃣ If they only want drivers _with_ locations, query by documentId()
    if (opts?.withLocations) {
      if (idsWithLoc.length === 0) return [];

      const result: Driver[] = [];
      const chunks = chunkArray(idsWithLoc, 10);  // Firestore in‑query max = 10
      for (const chunk of chunks) {
        const q = query(
          collection(firestore, this.collectionName),
          where(documentId(), "in", chunk)      // ← use doc ID here
        );
        const snap = await getDocs(q);
        snap.docs.forEach(doc => {
          const d = DriverConverter.fromFirestore(doc);
          // merge in the RTDB location
          const [lat, lng] = locs[doc.id];
          d.location = { latitude: Number(lat), longitude: Number(lng) };
          result.push(d);
        });
      }
      return result;
    }

    // 4️⃣ Otherwise load ALL drivers and merge locations as before
    const allSnap = await getDocs(
      collection(firestore, this.collectionName)
    );
    return allSnap.docs.map(doc => {
      const d = DriverConverter.fromFirestore(doc);
      const arr = locs[doc.id];
      if (Array.isArray(arr)) {
        d.location = { latitude: Number(arr[0]), longitude: Number(arr[1]) };
      }
      return d;
    });
  }
}
