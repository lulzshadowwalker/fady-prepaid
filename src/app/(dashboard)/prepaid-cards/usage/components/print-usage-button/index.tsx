"use client";

import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { usePrepaidCard } from "@/context/prepaid-card-context";
import { CsvExporter } from "@/lib/services/csv-exporter";

export function PrintUsageButton() {
  const cards = usePrepaidCard().cards;

  async function handlePrint() {
    try {
      const exporter = new CsvExporter();
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10); // YYYY-MM-DD
      const formattedTime = date.toTimeString().slice(0, 5); // HH:MM

      exporter
        .filename(
          `${cards.length}-prepaid-cards-${formattedDate}-${formattedTime}.csv`
        )
        .export(
          cards.map((card) => {
            const { template, ...rest } = card;
            return rest;
          })
        );

      toast({
        title: `${cards.length} prepaid cards exported successfully`,
        description: "You can now view the cards in your downloads folder.",
      });
    } catch (_) {
      toast({
        title: "Something went wrong",
        description:
          "Failed to export the prepaid card template. Please try again later.",
        variant: "destructive",
      });
    }
  }

  return (
    <Button className="mt-8 ms-auto flex max-sm:w-full" onClick={handlePrint}>
      Print
      <PrinterIcon />
    </Button>
  );
}
