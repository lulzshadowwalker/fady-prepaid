"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreHorizontal, Trash2, Percent, DollarSign, CheckCircle2, XCircle } from "lucide-react";
import { usePromocode } from "@/context/promocode-context";
import { Promocode } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Promocode>[] = [
  {
    accessorKey: "code",
    header: () => <div className="text-start">Code</div>,
    cell: ({ row }) => (
      <span className="font-mono font-bold tracking-widest">{row.getValue("code")}</span>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: () => <div className="text-start">Description</div>,
    cell: ({ row }) => <div>{row.getValue("description")}</div>,
  },
  {
    accessorKey: "discountType",
    header: () => <div className="text-start">Type</div>,
    cell: ({ row }) =>
      row.getValue("discountType") === "percent" ? (
        <Badge variant="default">Percent</Badge>
      ) : (
        <Badge variant="secondary">Amount</Badge>
      ),
    enableSorting: true,
  },
  {
    accessorKey: "discountValue",
    header: () => <div className="text-start">Value</div>,
    cell: ({ row }) => (
      <span>
        {row.getValue("discountType") === "percent"
          ? `${row.getValue("discountValue")}%`
          : `JOD ${row.getValue("discountValue")}`}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "active",
    header: () => <div className="text-start">Status</div>,
    cell: ({ row }) =>
      row.getValue("active") ? (
        <Badge variant="default">Active</Badge>
      ) : (
        <Badge variant="destructive">Inactive</Badge>
      ),
    enableSorting: true,
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-start">Created At</div>,
    cell: ({ row }) => (
      <time>
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </time>
    ),
    enableSorting: true,
    defaultHidden: true,
  },
  {
    accessorKey: "usageCount",
    header: () => <div className="text-start">Uses</div>,
    cell: ({ row }) => <span>{row.getValue("usageCount")}</span>,
    enableSorting: true,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const promocode = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <PromocodeDeleteMenuItem promocode={promocode} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function PromocodesTable() {
  const { promocodes } = usePromocode();

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ createdAt: false });
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: promocodes,
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
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by code..."
          value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("code")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No promocodes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function PromocodeDeleteMenuItem({ promocode }: { promocode: Promocode }) {
  const { remove } = usePromocode();
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    try {
      setLoading(true);
      await remove(promocode.id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        handleDelete();
      }}
      className="text-destructive cursor-pointer"
      disabled={loading}
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </DropdownMenuItem>
  );
}