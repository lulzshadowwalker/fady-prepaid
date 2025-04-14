"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Batch } from "@/lib/types";
import { PrinterIcon } from "lucide-react";
import { CsvExporter } from "@/lib/services/csv-exporter";

type Props = {
  batch: Batch;
  disabled?: boolean;
};

export function PrintMenuItem({ batch, disabled }: Props) {
  async function onSubmit() {
    try {
      const exporter = new CsvExporter();

      exporter
        .filename(`${batch.template.name}-${batch.seller}-${batch.id}.csv`)
        .export(
          batch.cards.map((card) => {
            const { template, ...rest } = card;
            return rest;
          })
        );

      toast({
        title: `Batch exported successfully`,
        description: "You can now view the batch in your downloads folder.",
      });
    } catch (_) {
      toast({
        title: "Something went wrong",
        description: "Failed to export batch. Please try again later.",
        variant: "destructive",
      });
    }
  }

  return (
    <DropdownMenuItem
      disabled={disabled}
      onSelect={(e) => {
        e.preventDefault();

        onSubmit();
      }}
    >
      <PrinterIcon /> Print
    </DropdownMenuItem>
  );
}
