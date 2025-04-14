import { Metadata } from "next";
import { CardsTable } from "./components/cards-table";
import { PrintUsageButton } from "./components/print-usage-button";

export const metadata: Metadata = { title: "Card Usage | Fady" };

export default function Usage() {
  return (
    <div>
      <section>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Card Usage
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Manage your prepaid card usage with ease. Track and manage the usage
          of your prepaid cards with just a few clicks.
        </p>
      </section>

      <PrintUsageButton />

      <CardsTable />
    </div>
  );
}
