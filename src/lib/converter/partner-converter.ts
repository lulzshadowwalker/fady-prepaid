import { DocumentSnapshot } from "firebase/firestore";
import { Partner } from "@/lib/types";

export class PartnerConverter {
  static fromFirestore(doc: DocumentSnapshot): Partner {
    const data = doc.data()!;

    return {
      id: doc.id,
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      logo: data.logo,
      createdAt: data.createdAt,
    };
  }
}
