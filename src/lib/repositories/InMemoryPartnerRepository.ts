import { faker } from "@faker-js/faker";
import { Partner } from "../types";
import { PartnerRepository } from "../contracts/partner-repository";

export class InMemoryPartnerRepository implements PartnerRepository {
  private partners: Partner[] = [];

  constructor(initialCount: number = 8) {
    this.partners = this.factory(initialCount);
  }

  async getAll(): Promise<Partner[]> {
    return [...this.partners];
  }

  async create(data: Omit<Partner, "id">): Promise<Partner> {
    const partner: Partner = {
      id: faker.string.uuid(),
      ...data,
      createdAt: new Date().toString(),
    };
    this.partners.push(partner);
    return partner;
  }

  async update(
    id: string,
    updated: Partial<Omit<Partner, "id">>,
  ): Promise<Partner> {
    const partner = this.partners.find((p) => p.id === id);
    if (!partner) throw new Error("Partner not found");
    Object.assign(partner, updated);
    return partner;
  }

  async delete(id: string): Promise<void> {
    this.partners = this.partners.filter((p) => p.id !== id);
  }

  public factory(count: number = 1): Partner[] {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      nameEn: faker.company.name(),
      nameAr: faker.company.name() + " العربية",
      descriptionAr: faker.lorem.paragraph(),
      descriptionEn: faker.lorem.paragraph(),
      location: "https://maps.app.goo.gl/1GxsSpjqsfUcgB818",
      logo: faker.image.avatar(),
      createdAt: faker.date.anytime().toString(),
    }));
  }
}
