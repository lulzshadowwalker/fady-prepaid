'use client';

import 'reflect-metadata';
import { formatDistanceToNow } from 'date-fns';
import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CheckCircle, ChevronDown, EyeIcon, MoreHorizontal, PrinterIcon, XCircle } from 'lucide-react';
import { PrintMenuItem } from './components/print-menu-item';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PrepaidCardTemplate } from '@/lib/types';
import { usePrepaidCardTemplate } from '@/context/prepaid-card-template-context';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<PrepaidCardTemplate>[] = [
  {
    accessorKey: 'name',
    header: () => <div className='text-start'>Name</div>,
    cell: ({ row }) => <div className='lowercase'>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'amount',
    header: () => <div className='text-start'>Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));

      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'JOD',
      }).format(amount);

      return <div className='text-start font-medium'>{formatted}</div>;
    },
  },
  {
    accessorKey: 'price',
    header: () => <div className='text-start'>Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));

      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'JOD',
      }).format(price);

      return <div className='text-start font-medium'>{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge className='capitalize' variant={row.getValue('status') === 'active' ? 'default' : 'secondary'}>
        {row.getValue('status')}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date Created',
    cell: ({ row }) => <time>{formatDistanceToNow(row.getValue('createdAt'), { addSuffix: true })}</time>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const template = row.original;
      const isActive = row.getValue('status') === 'active';

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <PrintMenuItem disabled={!isActive} template={template} />
            <DropdownMenuSeparator />

            {isActive ?
              <DeactivateMenuItem template={template} />
            : <ActivateMenuItem template={template} />}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function CardsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const templates = usePrepaidCardTemplate().templates;

  const table = useReactTable({
    data: templates,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className='w-full'>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Filter names...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              Columns <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ?
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            : <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant='outline' size='sm' onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActivateMenuItem({ template }: { template: PrepaidCardTemplate }) {
  const activate = usePrepaidCardTemplate().activate;

  return (
    <DropdownMenuItem onClick={() => activate(template)}>
      <CheckCircle /> Activate
    </DropdownMenuItem>
  );
}

function DeactivateMenuItem({ template }: { template: PrepaidCardTemplate }) {
  const deactivate = usePrepaidCardTemplate().deactivate;

  return (
    <DropdownMenuItem onClick={() => deactivate(template)} className='min-w-fitt'>
      <XCircle /> Deactivate
    </DropdownMenuItem>
  );
}
