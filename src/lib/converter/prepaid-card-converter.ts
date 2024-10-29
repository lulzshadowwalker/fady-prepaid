import { DocumentSnapshot } from 'firebase/firestore';
import { PrepaidCard } from '@/lib/types';

export class PrepaidCardConverter {
  static fromFirestore(doc: DocumentSnapshot): PrepaidCard {
    const data = doc.data();

    return {
      id: doc.id,
      batchId: data?.batchId,
      templateId: data?.template_id,
      template: data?.template,
      redemptionCode: data?.redemptionCode,
      amount: data?.amount,
      price: data?.price,
      status: data?.status,
      createdAt: data?.created_at,
      seller: data?.seller,
    };
  }
}
