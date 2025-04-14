import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  CreatePreapidCardParams,
  PrepaidCardRepository,
} from "../contracts/prepaid-card-repository";
import { Batch, PrepaidCard } from "@/lib/types";
import { firestore } from "@/lib/firebase";
import { generateRedemptionCode } from "../utils";
import { PrepeaidCardTemplateConverter } from "../converter/prepaid-card-template-converter";
import { v4 as uuidv4 } from "uuid";
import { PrepaidCardConverter } from "../converter/prepaid-card-converter";

export class FirebasePrepaidCardRepository implements PrepaidCardRepository {
  private collectionName = "prepaid_cards";

  async getAll(): Promise<PrepaidCard[]> {
    const collectionRef = collection(firestore, this.collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => PrepaidCardConverter.fromFirestore(doc));
  }

  async getBatches(): Promise<Batch[]> {
    const collectionRef = collection(firestore, this.collectionName);
    const snapshot = await getDocs(collectionRef);
    const cards = snapshot.docs.map((doc) =>
      PrepaidCardConverter.fromFirestore(doc)
    );

    // Group cards by batchId
    const batchMap: Record<string, Batch> = {};

    cards.forEach((card) => {
      if (!batchMap[card.batchId]) {
        batchMap[card.batchId] = {
          id: card.batchId,
          templateId: card.templateId,
          template: card.template,
          createdAt: card.createdAt,
          seller: card.seller!,
          cards: [card],
        };
      } else {
        batchMap[card.batchId].cards.push(card);
      }
    });

    return Object.values(batchMap);
  }

  async createMany(data: CreatePreapidCardParams): Promise<PrepaidCard[]> {
    const batch = writeBatch(firestore);
    const batchId = uuidv4();

    // Collect the generated document ids to query later
    const generatedIds: string[] = [];
    for (let i = 0; i < data.count; i++) {
      const ref = doc(collection(firestore, this.collectionName));
      generatedIds.push(ref.id);

      batch.set(ref, {
        batchId,
        template_id: data.template.id,
        template: PrepeaidCardTemplateConverter.toFirestore(data.template),
        seller: data.seller,
        redemptionCode: generateRedemptionCode(),
        amount: data.template.amount,
        price: data.template.price,
        status: "active",
        created_at: new Date().toISOString(),
      });
    }

    await batch.commit();

    // Retrieve the created documents via query
    const q = query(
      collection(firestore, this.collectionName),
      where("__name__", "in", generatedIds)
    );
    const docs = await getDocs(q);
    return docs.docs.map(PrepaidCardConverter.fromFirestore);
  }
}
