import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Promocode, PromocodeRule } from "../types";
import { PromocodeRepository } from "../contracts/promocode-repository";

/**
 * Converter for PromocodeRule (de)serialization
 */
function serializeRule(rule: PromocodeRule): any {
  return { ...rule };
}

function deserializeRule(data: any): PromocodeRule {
  switch (data.type) {
    case "gender":
      return { type: "gender", gender: data.gender };
    case "expiration":
      return { type: "expiration", expiresAt: data.expiresAt };
    case "maxUses":
      return { type: "maxUses", maxUses: data.maxUses };
    case "maxUsesPerUser":
      return { type: "maxUsesPerUser", maxUses: data.maxUses };
    case "timeOfDay":
      return { type: "timeOfDay", from: data.from, to: data.to };
    default:
      throw new Error(`Unknown rule type: ${data.type}`);
  }
}

/**
 * Converter for Promocode (de)serialization
 */
export const PromocodeConverter = {
  fromFirestore(snap: QueryDocumentSnapshot | DocumentSnapshot): Promocode {
    const data = snap.data()!;
    return {
      id: snap.id,
      code: data.code,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      active: data.active,
      createdAt:
        typeof data.createdAt === "string"
          ? data.createdAt
          : (data.createdAt?.toDate?.() ?? new Date()).toISOString(),
      createdBy: data.createdBy,
      rules: Array.isArray(data.rules)
        ? data.rules.map(deserializeRule)
        : undefined,
      usageCount: data.usageCount ?? 0,
      usagePerUser: data.usagePerUser ?? undefined,
    };
  },
  toFirestore(
    promocode: Omit<
      Promocode,
      "id" | "createdAt" | "usageCount" | "usagePerUser"
    > &
      Partial<Pick<Promocode, "usageCount" | "usagePerUser">>,
  ) {
    const data: any = {
      code: promocode.code,
      description: promocode.description ?? "",
      discountType: promocode.discountType,
      discountValue: promocode.discountValue,
      active: promocode.active ?? true,
      createdAt: serverTimestamp(),
      rules: promocode.rules ? promocode.rules.map(serializeRule) : [],
      usageCount: promocode.usageCount ?? 0,
      usagePerUser: promocode.usagePerUser ?? {},
    };
    if (promocode.createdBy !== undefined) {
      data.createdBy = promocode.createdBy;
    }
    return data;
  },
};

export class FirebasePromocodeRepository implements PromocodeRepository {
  private collectionName = "promocodes";

  async list(): Promise<Promocode[]> {
    const collectionRef = collection(firestore, this.collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => PromocodeConverter.fromFirestore(doc));
  }

  async create(
    promocode: Omit<
      Promocode,
      "id" | "createdAt" | "usageCount" | "usagePerUser"
    >,
  ): Promise<Promocode> {
    const collectionRef = collection(firestore, this.collectionName);
    const docRef = await addDoc(
      collectionRef,
      PromocodeConverter.toFirestore(promocode),
    );
    const snap = await getDoc(docRef);
    return PromocodeConverter.fromFirestore(snap);
  }

  async update(
    id: string,
    updated: Partial<
      Omit<Promocode, "id" | "createdAt" | "usageCount" | "usagePerUser">
    >,
  ): Promise<Promocode> {
    const ref = doc(firestore, this.collectionName, id);
    // Prepare update object, serialize rules if present
    const updateObj: any = { ...updated };
    if (updateObj.rules) {
      updateObj.rules = updateObj.rules.map(serializeRule);
    }
    await updateDoc(ref, updateObj);
    const snap = await getDoc(ref);
    return PromocodeConverter.fromFirestore(snap);
  }

  async delete(id: string): Promise<void> {
    const ref = doc(firestore, this.collectionName, id);
    await deleteDoc(ref);
  }
}
