import { Metadata } from "next";
import { CashoutRequestsTable } from "./components/cashout-requests-table";

export const metadata: Metadata = { title: "Cashout Requests | Fady" };

export default function CashoutRequests() {
  return (
    <div>
      <section>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Cashout Requests
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Manage all your cashout requests in one place.
        </p>
      </section>

      <CashoutRequestsTable />
    </div>
  );
}
