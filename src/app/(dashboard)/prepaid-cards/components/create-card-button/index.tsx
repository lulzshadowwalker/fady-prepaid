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
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePrepaidCardTemplate } from '@/context/prepaid-card-template-context';
import { useState } from 'react';

const FormSchema = z.object({
  name: z.string(),
  amount: z.coerce.number().int().positive(),
  price: z.coerce.number().int().positive(),
});

export function CreateCardButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {},
  });

  const createTemplate = usePrepaidCardTemplate().create;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await createTemplate({
        name: data.name ?? 'None',
        amount: data.amount.toString(),
        price: data.price.toString(),
      });

      toast({
        title: 'Prepaid card template created successfully',
        description: 'You can now print this card and use it to add money to your account.',
      });

      setIsDialogOpen(false);
    } catch (_) {
      toast({
        title: 'Something went wrong',
        description: 'Failed to create the prepaid card template. Please try again later.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className='mt-8 ms-auto flex max-sm:w-full'>
          Create <PlusCircle />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <DialogHeader>
            <DialogTitle>New Prepaid Card</DialogTitle>
            <DialogDescription>Fill out the form below to create a new prepaid card.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Friendly name' {...field} required />
                  </FormControl>
                  <FormDescription>A friendly name to help you identify this card.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder='55 JOD' {...field} />
                  </FormControl>
                  <FormDescription>The amount of money to add to this card</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder='50 JOD' {...field} />
                  </FormControl>
                  <FormDescription>The retail price the customer will pay</FormDescription>
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
