import { DocumentSnapshot } from "firebase/firestore";
import { Driver } from "@/lib/types";

export class DriverConverter {
  static fromFirestore(doc: DocumentSnapshot): Driver {
    const data = doc.data()!;

    return {
      id: doc.id,
      name: `${data.driver_first_name} ${data.driver_last_name}`,
      phone: data.driver_phone_number,
      location: data.location
        ? {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
          }
        : undefined,
      avatar: data.driver_image_url,
      status: this.mapStatus(data.status),
    };
  }

  protected static mapStatus(status: string): Driver["status"] {
    switch (status) {
      case "idle":
      case "searching":
      case "working":
        return status;
      default:
        return "idle"; // fallback
    }
  }
}
