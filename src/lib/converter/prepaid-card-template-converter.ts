import { DocumentSnapshot } from 'firebase/firestore';
import { PrepaidCardTemplate } from '../types';

export class PrepeaidCardTemplateConverter {
  static toFirestore(template: PrepaidCardTemplate): Record<string, string> {
    return {
      amount: template.amount,
      price: template.price,
      name: template.name,
      status: template.status,
      created_at: template.createdAt,
    };
  }

  static fromFirestore(doc: DocumentSnapshot): PrepaidCardTemplate {
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
