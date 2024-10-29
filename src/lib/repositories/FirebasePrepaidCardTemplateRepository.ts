import { addDoc, collection, doc, DocumentSnapshot, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import {
  CreatePrepaidCardTemplateParams,
  PrepaidCardTemplateRepository,
} from '@/lib/contracts/prepaid-card-template-repository';
import { PrepaidCardTemplate } from '@/lib/types';
import { firestore } from '@/lib/firebase';
import { PrepeaidCardTemplateConverter } from '../converter/prepaid-card-template-converter';

export class FirebasePrepaidCardTemplateRepository implements PrepaidCardTemplateRepository {
  private collectionName = 'prepaid_card_templates';

  async create(template: CreatePrepaidCardTemplateParams): Promise<PrepaidCardTemplate> {
    const ref = await addDoc(collection(firestore, this.collectionName), {
      amount: template.amount,
      price: template.price,
      name: template.name,
      status: 'active',
      created_at: new Date().toISOString(),
    });

    return PrepeaidCardTemplateConverter.fromFirestore(await getDoc(ref));
  }

  async getAll(): Promise<PrepaidCardTemplate[]> {
    const snapshot = await getDocs(collection(firestore, this.collectionName));
    return snapshot.docs.map(PrepeaidCardTemplateConverter.fromFirestore);
  }

  async update(template: PrepaidCardTemplate, updated: Partial<PrepaidCardTemplate>): Promise<PrepaidCardTemplate> {
    const ref = doc(firestore, this.collectionName, template.id);
    await updateDoc(ref, updated);

    return PrepeaidCardTemplateConverter.fromFirestore(await getDoc(ref));
  }
}
