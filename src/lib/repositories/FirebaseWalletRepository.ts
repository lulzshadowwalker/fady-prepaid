import {
  collection,
  doc,
  getDocs,
  query,
  where,
  or,
} from "firebase/firestore";
import { injectable } from "tsyringe";
import { firestore } from "@/lib/firebase";
import { WalletSummary } from "../types";
import { WalletRepository } from "../contracts/wallet-repository";

interface WalletTopUp {
  id: string;
  createdAt: Date;
  cardValue: number;
  cardPrice: number;
  balanceBefore: number;
  balanceAfter: number;
  prepaidCardId?: string;
  batchId?: string;
  redemptionCode?: string;
  description?: string;
  isDiscounted: boolean;
}

interface Transfer {
  id: string;
  driverUid?: string;
  isDiscounted: boolean;
  senderUid?: string;
  senderFullName?: string;
  senderEmail?: string;
  senderPhoneNumber?: string;
  senderWalletTotalBeforeSending?: number;
  senderWalletTotalAfterSending?: number;
  receiverUid?: string;
  receiverFullName?: string;
  receiverEmail?: string;
  receiverPhoneNumber?: string;
  receiverWalletTotalBeforeReceiving?: number;
  receiverWalletTotalAfterReceiving?: number;
  reason?: string;
  walletValue: number;
  createdAt: Date;
}

@injectable()
export class FirebaseWalletRepository implements WalletRepository {
  private driversCollection = "drivers_data";
  private transfersCollection = "driver_wallet_money_move";

  async getSummary(driverUid: string): Promise<WalletSummary | undefined> {
    try {
      // 1. Get driver document and total balance
      const driverQuery = query(
        collection(firestore, this.driversCollection),
        where("uid", "==", driverUid)
      );
      const driverSnapshot = await getDocs(driverQuery);
      
      if (driverSnapshot.empty) {
        return undefined;
      }

      const driverDoc = driverSnapshot.docs[0];
      const driverData = driverDoc.data();
      const totalBalance = Number(driverData.driver_wallet_value || 0);

      // 2. Get wallet topups
      const topUps = await this.getWalletTopUps(driverDoc.id);
      
      // 3. Get transfers
      const transfers = await this.getTransfers(driverUid);

      // Calculate actual and added balances
      const { actualBalance, addedBalance } = this.calculateBalances(
        topUps,
        transfers,
        totalBalance,
        driverUid
      );

      return {
        driverUid,
        actualBalance,
        addedBalance,
        totalBalance,
      };
    } catch (error) {
      console.error("Error getting wallet summary:", error);
      return undefined;
    }
  }

  private async getWalletTopUps(driverDocId: string): Promise<WalletTopUp[]> {
    try {
      const topUpsRef = collection(
        firestore,
        this.driversCollection,
        driverDocId,
        "wallet_topups"
      );
      const snapshot = await getDocs(topUpsRef);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          cardValue: Number(data.cardValue || 0),
          cardPrice: Number(data.cardPrice || 0),
          balanceBefore: Number(data.balanceBefore || 0),
          balanceAfter: Number(data.balanceAfter || 0),
          prepaidCardId: data.prepaidCardId,
          batchId: data.batchId,
          redemptionCode: data.redemptionCode,
          description: data.description,
          isDiscounted: Boolean(data.isDiscounted),
        };
      });
    } catch (error) {
      console.error("Error fetching wallet topups:", error);
      return [];
    }
  }

  private async getTransfers(driverUid: string): Promise<Transfer[]> {
    try {
      // Query transfers where the driver is either sender or receiver
      const transfersQuery = query(
        collection(firestore, this.transfersCollection),
        or(
          where("sender_uid", "==", driverUid),
          where("receiver_uid", "==", driverUid)
        )
      );
      
      const snapshot = await getDocs(transfersQuery);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          driverUid: data.driver_uid,
          isDiscounted: Boolean(data.is_discounted),
          senderUid: data.sender_uid,
          senderFullName: data.sender_full_name,
          senderEmail: data.sender_email,
          senderPhoneNumber: data.sender_phone_number,
          senderWalletTotalBeforeSending: Number(data.sender_wallet_total_before_sending || 0),
          senderWalletTotalAfterSending: Number(data.sender_wallet_total_after_sending || 0),
          receiverUid: data.receiver_uid,
          receiverFullName: data.receiver_full_name,
          receiverEmail: data.receiver_email,
          receiverPhoneNumber: data.receiver_phone_number,
          receiverWalletTotalBeforeReceiving: Number(data.receiver_wallet_total_before_receiving || 0),
          receiverWalletTotalAfterReceiving: Number(data.receiver_wallet_total_after_receiving || 0),
          reason: data.value_reason,
          walletValue: Number(data.wallet_value || 0),
          createdAt: data.created_at?.toDate() || new Date(),
        };
      });
    } catch (error) {
      console.error("Error fetching transfers:", error);
      return [];
    }
  }

  private calculateBalances(
    topUps: WalletTopUp[],
    transfers: Transfer[],
    totalBalance: number,
    driverUid: string
  ): { actualBalance: number; addedBalance: number } {
    let rawActualBalance = 0;
    let rawAddedBalance = 0;

    // Calculate balance from topups
    for (const topUp of topUps) {
      const value = topUp.cardValue;
      if (topUp.isDiscounted) {
        rawAddedBalance += value;
      } else {
        rawActualBalance += value;
      }
    }

    // Calculate balance from transfers
    for (const transfer of transfers) {
      const value = transfer.walletValue;
      
      // If this driver received money
      if (transfer.receiverUid === driverUid) {
        if (transfer.isDiscounted) {
          rawAddedBalance += value;
        } else {
          rawActualBalance += value;
        }
      }
      // If this driver sent money (subtract from balance)
      else if (transfer.senderUid === driverUid) {
        if (transfer.isDiscounted) {
          rawAddedBalance -= value;
        } else {
          rawActualBalance -= value;
        }
      }
    }

    // Prevent negative raw balances
    rawActualBalance = Math.max(0, rawActualBalance);
    rawAddedBalance = Math.max(0, rawAddedBalance);

    const calculatedTotal = rawActualBalance + rawAddedBalance;
    
    // Log discrepancies for debugging
    if (Math.abs(calculatedTotal - totalBalance) > 0.01) {
      console.warn(`Wallet balance discrepancy for driver ${driverUid}:`, {
        calculated: calculatedTotal,
        stored: totalBalance,
        rawActual: rawActualBalance,
        rawAdded: rawAddedBalance,
        topUpsCount: topUps.length,
        transfersCount: transfers.length
      });
    }

    let actualBalance: number;
    let addedBalance: number;

    // If calculated total exceeds stored total, we're missing deductions
    // Proportionally reduce both balances to match the authoritative total
    if (calculatedTotal > totalBalance && calculatedTotal > 0) {
      const scaleFactor = totalBalance / calculatedTotal;
      actualBalance = rawActualBalance * scaleFactor;
      addedBalance = rawAddedBalance * scaleFactor;
    }
    // If calculated total is less than stored total, there might be missing credits
    else if (calculatedTotal < totalBalance) {
      // Add the difference to actual balance (assume it's real money)
      actualBalance = rawActualBalance + (totalBalance - calculatedTotal);
      addedBalance = rawAddedBalance;
    }
    // If they match closely, use calculated values
    else {
      actualBalance = rawActualBalance;
      addedBalance = rawAddedBalance;
    }

    // Final safety checks - totalBalance is authoritative
    actualBalance = Math.min(actualBalance, totalBalance);
    addedBalance = Math.min(addedBalance, totalBalance - actualBalance);
    
    // Ensure no negative values
    actualBalance = Math.max(0, actualBalance);
    addedBalance = Math.max(0, addedBalance);

    return {
      actualBalance: Math.round(actualBalance * 100) / 100,
      addedBalance: Math.round(addedBalance * 100) / 100,
    };
  }
}