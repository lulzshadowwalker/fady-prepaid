import { Metadata } from "next";
import { CreatePartnerButton } from "./components/create-partner-button";
import { PartnersTable } from "./components/partners-table";
import { PartnerProvider } from "@/context/partner-context";

export const metadata: Metadata = { title: "Partners | Fady" };

export default function PartnersPage() {
  return (
    <PartnerProvider>
      <div>
        <section>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Partners
          </h1>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            Manage your partners. Add, update, and remove partners from your
            system.
          </p>
        </section>

        <CreatePartnerButton />

        <PartnersTable />
      </div>
    </PartnerProvider>
  );
}
