import { PlusCircle } from "lucide-react";
import { CardsTable } from "./components/cards-table";
import { Button } from "@/components/ui/button";

export default function PrepaidCards() {
  return <div>
    <section>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Prepaid Cards
      </h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Manage your prepaid cards with ease. Create, print and manage your prepaid cards with just a few clicks.
      </p>
    </section>

    <Button className="mt-8 ms-auto flex max-sm:w-full">Create <PlusCircle /></Button>

    <CardsTable />
  </div>
}
