import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { CreatePreapidCardParams, PrepaidCardRepository } from '../contracts/prepaid-card-repository';
import { PrepaidCard } from '@/lib/types';
import { firestore } from '@/lib/firebase';
import { generateRedemptionCode } from '../utils';
import { PrepeaidCardTemplateConverter } from '../converter/prepaid-card-template-converter';
import { v4 as uuidv4 } from 'uuid';
import { PrepaidCardConverter } from '../converter/prepaid-card-converter';

export class FirebasePrepaidCardRepository implements PrepaidCardRepository {
  private collectionName = 'prepaid_cards';

  async createMany(data: CreatePreapidCardParams): Promise<PrepaidCard[]> {
    const batch = writeBatch(firestore);

    const batchId = uuidv4();

    //  NOTE: generated ids of the documents in the batch
    const generatedIds = [];
    for (let i = 0; i < data.count; i++) {
      const ref = doc(collection(firestore, this.collectionName));

      generatedIds.push(ref.id);

      batch.set(ref, {
        batchId: batchId,
        template_id: data.template.id,
        template: PrepeaidCardTemplateConverter.toFirestore(data.template),
        seller: data.seller,
        redemptionCode: generateRedemptionCode(),
        amount: data.template.amount,
        price: data.template.price,
        status: 'active',
        created_at: new Date().toISOString(),
      });
    }

    await batch.commit();

    const q = query(collection(firestore, this.collectionName), where('__name__', 'in', generatedIds));
    const docs = await getDocs(q);

    return docs.docs.map(PrepaidCardConverter.fromFirestore);
  }
}
