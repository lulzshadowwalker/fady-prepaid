import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref as storageRef,
  uploadString,
  deleteObject,
} from "firebase/storage";
import { firestore, storage } from "@/lib/firebase";
import { Partner } from "../types";
import { PartnerRepository } from "../contracts/partner-repository";
import { v4 as uuidv4 } from "uuid";
import { PartnerConverter } from "../converter/partner-converter";

export class FirebasePartnerRepository implements PartnerRepository {
  private collectionName = "partners";
  private logoFolder = "partners/logos";

  async getAll(): Promise<Partner[]> {
    const snapshot = await getDocs(collection(firestore, this.collectionName));
    return snapshot.docs.map((doc) => PartnerConverter.fromFirestore(doc));
  }

  async create(data: Omit<Partner, "id">): Promise<Partner> {
    let logoUrl = data.logo;
    if (this.isDataUrl(data.logo)) {
      logoUrl = await this.uploadLogo(data.logo);
    }
    const docRef = await addDoc(collection(firestore, this.collectionName), {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      logo: logoUrl,
      createdAt: data.createdAt ?? new Date().toISOString(),
    });
    const snap = await getDoc(docRef);
    return PartnerConverter.fromFirestore(snap);
  }

  async update(
    id: string,
    updated: Partial<Omit<Partner, "id">>,
  ): Promise<Partner> {
    const ref = doc(firestore, this.collectionName, id);
    const prevSnap = await getDoc(ref);
    if (!prevSnap.exists()) throw new Error("Partner not found");
    const prev = PartnerConverter.fromFirestore(prevSnap);

    let logoUrl = updated.logo ?? prev.logo;
    if (updated.logo && this.isDataUrl(updated.logo)) {
      // Optionally delete old logo if it was a storage URL
      if (prev.logo && this.isStorageUrl(prev.logo)) {
        await this.deleteLogoByUrl(prev.logo);
      }
      logoUrl = await this.uploadLogo(updated.logo);
    }

    await updateDoc(ref, {
      ...updated,
      logo: logoUrl,
    });

    const snap = await getDoc(ref);
    return PartnerConverter.fromFirestore(snap);
  }

  async delete(id: string): Promise<void> {
    const ref = doc(firestore, this.collectionName, id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const partner = PartnerConverter.fromFirestore(snap);
      if (partner.logo && this.isStorageUrl(partner.logo)) {
        await this.deleteLogoByUrl(partner.logo);
      }
    }
    await deleteDoc(ref);
  }

  private isDataUrl(str: string): boolean {
    return /^data:image\/[a-zA-Z]+;base64,/.test(str);
  }

  private isStorageUrl(url: string): boolean {
    // crude check for Firebase Storage URLs
    return (
      url.startsWith("https://") &&
      url.includes("firebasestorage.googleapis.com")
    );
  }

  private async uploadLogo(dataUrl: string): Promise<string> {
    const id = uuidv4();
    const refPath = `${this.logoFolder}/${id}.png`;
    const refObj = storageRef(storage, refPath);
    await uploadString(refObj, dataUrl, "data_url");
    return await getDownloadURL(refObj);
  }

  private async deleteLogoByUrl(url: string): Promise<void> {
    try {
      // Extract the path from the URL
      const matches = url.match(/\/o\/(.*?)\?alt=media/);
      if (matches && matches[1]) {
        const path = decodeURIComponent(matches[1]);
        const refObj = storageRef(storage, path);
        await deleteObject(refObj);
      }
    } catch (e) {
      // Ignore errors (file may not exist)
    }
  }
}
