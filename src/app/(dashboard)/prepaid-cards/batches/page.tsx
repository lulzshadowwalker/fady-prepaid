import { Metadata } from "next";
import { BatchesTable } from "./components/batches-table";

export const metadata: Metadata = { title: "Batches | Fady" };

export default function PrepaidCards() {
  return (
    <div>
      <section>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Batches
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          View the prepaid card batches that have been issued from the
          dashboard.
        </p>
      </section>

      <BatchesTable />
    </div>
  );
}
