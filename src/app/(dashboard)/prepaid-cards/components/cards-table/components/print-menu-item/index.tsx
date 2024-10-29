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
  count: z.coerce.number({ message: 'Count must be a positive integer' }).int().positive(),
  seller: z.string(),
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
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10); // YYYY-MM-DD
      const formattedTime = date.toTimeString().slice(0, 5); // HH:MM

      exporter
        .filename(`${data.count}x${template.amount}JOD ${data.seller} ${formattedDate} ${formattedTime}.csv`)
        .export(cards);

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

  function handleOnOpenChange(open: boolean): void {
    setIsDialogOpen(open);
    form.reset();
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOnOpenChange}>
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
                    <Input placeholder='Enter seller’s name' {...field} required />
                  </FormControl>
                  <FormDescription>Specify the seller or distribution point for tracking purposes.</FormDescription>
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
                    <Input placeholder='e.g. 50' {...field} required />
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
