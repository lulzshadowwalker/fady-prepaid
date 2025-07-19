import { DocumentSnapshot } from "firebase/firestore";
import { Passenger } from "@/lib/types";

export class PassengerConverter {
  static fromFirestore(doc: DocumentSnapshot): Passenger {
    const data = doc.data()!;

    return {
      id: doc.id,
      name: `${data.customer_first_name} ${data.customer_last_name}`,
    };
  }
}
