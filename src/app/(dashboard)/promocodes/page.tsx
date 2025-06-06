import { Metadata } from "next";
import { PromocodeProvider } from "@/context/promocode-context";
import { CreatePromocodeButton } from "./components/create-promocode-button";
import { PromocodesTable } from "./components/promocodes-table";

export const metadata: Metadata = { title: "Promocodes | Fady" };

export default function PromocodesPage() {
  return (
    <PromocodeProvider>
      <div>
        <section>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Promocodes
          </h1>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            Manage your promocodes. Add, update, and remove promocodes from your system.
          </p>
        </section>

        <CreatePromocodeButton />

        <PromocodesTable />
      </div>
    </PromocodeProvider>
  );
}