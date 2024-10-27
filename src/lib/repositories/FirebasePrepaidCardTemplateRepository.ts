import { addDoc, collection, doc, DocumentSnapshot, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import {
  CreatePrepaidCardTemplateParams,
  PrepaidCardTemplateRepository,
} from '@/lib/contracts/prepaid-card-template-repository';
import { PrepaidCardTemplate } from '../types';
import { firestore } from '@/lib/firebase';

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

    return this.templateFromDoc(await getDoc(ref));
  }

  async getAll(): Promise<PrepaidCardTemplate[]> {
    const snapshot = await getDocs(collection(firestore, this.collectionName));
    return snapshot.docs.map(this.templateFromDoc);
  }

  async update(template: PrepaidCardTemplate, updated: Partial<PrepaidCardTemplate>): Promise<PrepaidCardTemplate> {
    const ref = doc(firestore, this.collectionName, template.id);
    await updateDoc(ref, updated);

    return this.templateFromDoc(await getDoc(ref));
  }

  protected templateFromDoc(doc: DocumentSnapshot): PrepaidCardTemplate {
    const data = doc.data();

    return {
      id: doc.id,
      amount: data?.amount,
      price: data?.price,
      name: data?.name,
      status: data?.status,
      createdAt: data?.created_at,
    };
  }
}
