'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { PrepaidCardTemplate } from '@/lib/types';
import { PrinterIcon } from 'lucide-react';
import { usePrepaidCard } from '@/context/prepaid-card-context';
import { CsvExporter } from '@/lib/services/csv-exporter';

type Props = {
  template: PrepaidCardTemplate;
  disabled?: boolean;
};

const FormSchema = z.object({
  count: z.coerce.number().int().positive(),
  seller: z.string().optional(),
});

export function PrintMenuItem({ template, disabled }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {},
  });

  const createMany = usePrepaidCard().createMany;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const cards = await createMany({
        seller: data.seller,
        count: data.count,
        template,
      });

      const exporter = new CsvExporter();
      exporter.filename(`${template.amount} JOD - ${data.seller ?? 'cards'} - ${now()}`).export(cards);

      toast({
        title: `${data.count} prepaid cards created successfully`,
        description: 'You can now print these cards and distribute them to your customers.',
      });

      setIsDialogOpen(false);
    } catch (_) {
      toast({
        title: 'Something went wrong',
        description: 'Failed to create prepaid cards. Please try again later.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem disabled={disabled} onSelect={(e) => e.preventDefault()}>
          <PrinterIcon /> Print
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <DialogHeader>
            <DialogTitle>Print Prepaid Cards</DialogTitle>
            <DialogDescription>
              Fill out the form below to generate multiple prepaid cards based on a selected template. Each card will
              have a unique redemption code and will be ready for distribution.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <FormField
              control={form.control}
              name='seller'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seller</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter seller’s name' {...field} />
                  </FormControl>
                  <FormDescription>
                    Specify the seller or distribution point for tracking purposes. (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='count'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Cards to Generate</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. 50' {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the number of cards you want to generate. Each card will have a unique redemption code.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
          <DialogFooter>
            <Button type='submit'>Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function now(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
