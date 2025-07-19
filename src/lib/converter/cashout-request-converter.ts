import { CashoutRequest } from "../types";

// Converter for mapping Firestore docs to CashoutRequest (without driver)
export class CashoutRequestConverter {
  static fromFirestore(
    snap:
      | import("firebase/firestore").QueryDocumentSnapshot
      | import("firebase/firestore").DocumentSnapshot,
  ): Omit<CashoutRequest, "driver"> {
    const data = snap.data()!;
    return {
      id: snap.id,
      driverUid: data.driverUid,
      amount: data.amount,
      status: data.status,
      transferMethod: data.transferMethod,
      iban: data.iban ?? undefined,
      cliq: data.cliq ?? undefined,
      createdAt: new Date(
        data.createdAt.seconds ? data.createdAt.seconds * 1000 : data.createdAt,
      ),
      updatedAt: new Date(
        data.updatedAt.seconds ? data.updatedAt.seconds * 1000 : data.updatedAt,
      ),
    };
  }
};
