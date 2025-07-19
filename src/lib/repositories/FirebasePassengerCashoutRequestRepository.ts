import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { injectable, inject } from "tsyringe";
import { firestore } from "@/lib/firebase";
import { PassengerCashoutRequest, Passenger } from "../types";
import { PassengerCashoutRequestRepository } from "../contracts/passenger-cashout-request-repository";
import { PassengerConverter } from "../converter/passenger-converter";
import type { PassengerWalletRepository } from "../contracts/passenger-wallet-repository";
import { PassengerCashoutRequestConverter } from "../converter/passenger-cashout-request-converter";

@injectable()
export class FirebasePassengerCashoutRequestRepository
  implements PassengerCashoutRequestRepository
{
  private collectionName = "passenger_cashout_requests";
  private passengersCollection = "customers_data";

  constructor(
    @inject("WALLET_REPOSITORY") private walletRepository: PassengerWalletRepository,
  ) {}

  async getAll(): Promise<PassengerCashoutRequest[]> {
    const collectionRef = collection(firestore, this.collectionName);
    const snapshot = await getDocs(collectionRef);
    const requests = snapshot.docs.map((doc) =>
      PassengerCashoutRequestConverter.fromFirestore(doc),
    );

    // Fetch all passengers for the requests
    const passengerUids = Array.from(new Set(requests.map((r) => r.passengerUid)));
    if (passengerUids.length === 0) return requests as PassengerCashoutRequest[];

    // Query passengers by uid (not by doc id)
    // Firestore 'in' queries are limited to 10, so chunk if needed
    const chunkSize = 10;
    const passengerChunks: string[][] = [];
    for (let i = 0; i < passengerUids.length; i += chunkSize) {
      passengerChunks.push(passengerUids.slice(i, i + chunkSize));
    }

    const passengerMap: Record<string, Passenger> = {};
    for (const chunk of passengerChunks) {
      const q = query(
        collection(firestore, this.passengersCollection),
        where("uid", "in", chunk),
      );
      const passengerSnap = await getDocs(q);
      for (const doc of passengerSnap.docs) {
        const passenger = PassengerConverter.fromFirestore(doc);
        const walletSummary = await this.walletRepository.getSummary(
          doc.data().uid,
        );
        console.log("Wallet Summary", walletSummary);
        passenger.walletSummary = walletSummary || {
          passengerUid: passenger.id,
          actualBalance: 0,
          addedBalance: 0,
          totalBalance: 0,
        };
        passengerMap[doc.data().uid] = passenger;
      }
    }

    // Attach passenger to each request
    return requests.map((req) => ({
      ...req,
      passenger: passengerMap[req.passengerUid],
    })) as PassengerCashoutRequest[];
  }

  async getById(id: string): Promise<PassengerCashoutRequest | undefined> {
    const ref = doc(firestore, this.collectionName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;
    const req = PassengerCashoutRequestConverter.fromFirestore(snap);

    // Query passenger by uid
    const q = query(
      collection(firestore, this.passengersCollection),
      where("uid", "==", req.passengerUid),
    );
    const passengerSnap = await getDocs(q);
    let passenger: Passenger | undefined = undefined;
    if (!passengerSnap.empty) {
      passenger = PassengerConverter.fromFirestore(passengerSnap.docs[0]);
      const walletSummary = await this.walletRepository.getSummary(
        req.passengerUid,
      );
      passenger.walletSummary = walletSummary || {
        passengerUid: passenger.id,
        actualBalance: 0,
        addedBalance: 0,
        totalBalance: 0,
      };
    }

    return {
      ...req,
      passenger,
    } as PassengerCashoutRequest;
  }

  async approve(id: string, actualAmount: number): Promise<void> {
    const ref = doc(firestore, this.collectionName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Request ${id} not found`);
    const data = snap.data();
    if (data.status !== "pending")
      throw new Error(`Cannot approve a request with status ${data.status}`);
    await updateDoc(ref, {
      status: "approved",
      amount: actualAmount,
      updatedAt: serverTimestamp(),
    });
  }

  async reject(id: string): Promise<void> {
    const ref = doc(firestore, this.collectionName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error(`Request ${id} not found`);
    const data = snap.data();
    if (data.status !== "pending")
      throw new Error(`Cannot reject a request with status ${data.status}`);
    await updateDoc(ref, {
      status: "rejected",
      updatedAt: serverTimestamp(),
    });
  }
}
