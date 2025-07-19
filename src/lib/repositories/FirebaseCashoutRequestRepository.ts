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
import { CashoutRequest, Driver } from "../types";
import { CashoutRequestRepository } from "../contracts/cashout-request-repository";
import { DriverConverter } from "../converter/driver-converter";
import type { WalletRepository } from "../contracts/wallet-repository";
import { CashoutRequestConverter } from "../converter/cashout-request-converter";

@injectable()
export class FirebaseCashoutRequestRepository
  implements CashoutRequestRepository
{
  private collectionName = "cashout_requests";
  private driversCollection = "drivers_data";

  constructor(
    @inject("WALLET_REPOSITORY") private walletRepository: WalletRepository,
  ) {}

  async getAll(): Promise<CashoutRequest[]> {
    const collectionRef = collection(firestore, this.collectionName);
    const snapshot = await getDocs(collectionRef);
    const requests = snapshot.docs.map((doc) =>
      CashoutRequestConverter.fromFirestore(doc),
    );

    // Fetch all drivers for the requests
    const driverUids = Array.from(new Set(requests.map((r) => r.driverUid)));
    if (driverUids.length === 0) return requests as CashoutRequest[];

    // Query drivers by uid (not by doc id)
    // Firestore 'in' queries are limited to 10, so chunk if needed
    const chunkSize = 10;
    const driverChunks: string[][] = [];
    for (let i = 0; i < driverUids.length; i += chunkSize) {
      driverChunks.push(driverUids.slice(i, i + chunkSize));
    }

    const driverMap: Record<string, Driver> = {};
    for (const chunk of driverChunks) {
      const q = query(
        collection(firestore, this.driversCollection),
        where("uid", "in", chunk),
      );
      const driverSnap = await getDocs(q);
      for (const doc of driverSnap.docs) {
        const driver = DriverConverter.fromFirestore(doc);
        const walletSummary = await this.walletRepository.getSummary(
          doc.data().uid,
        );
        console.log("Wallet Summary", walletSummary);
        driver.walletSummary = walletSummary || {
          driverUid: driver.id,
          actualBalance: 0,
          addedBalance: 0,
          totalBalance: 0,
        };
        driverMap[doc.data().uid] = driver;
      }
    }

    // Attach driver to each request
    return requests.map((req) => ({
      ...req,
      driver: driverMap[req.driverUid],
    })) as CashoutRequest[];
  }

  async getById(id: string): Promise<CashoutRequest | undefined> {
    const ref = doc(firestore, this.collectionName, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;
    const req = CashoutRequestConverter.fromFirestore(snap);

    // Query driver by uid
    const q = query(
      collection(firestore, this.driversCollection),
      where("uid", "==", req.driverUid),
    );
    const driverSnap = await getDocs(q);
    let driver: Driver | undefined = undefined;
    if (!driverSnap.empty) {
      driver = DriverConverter.fromFirestore(driverSnap.docs[0]);
      const walletSummary = await this.walletRepository.getSummary(
        req.driverUid,
      );
      driver.walletSummary = walletSummary || {
        driverUid: driver.id,
        actualBalance: 0,
        addedBalance: 0,
        totalBalance: 0,
      };
    }

    return {
      ...req,
      driver,
    } as CashoutRequest;
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
