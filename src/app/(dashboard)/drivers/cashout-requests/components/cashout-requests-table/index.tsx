"use client";

import "reflect-metadata";
import { formatDistanceToNow } from "date-fns";
import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, CheckCircle, ChevronDown, MoreHorizontal, PrinterIcon, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { CashoutRequest } from "@/lib/types";
import { useCashoutRequest } from "@/context/cashout-request-context";
import { toast } from "@/hooks/use-toast";

export function CashoutRequestsTable() {
  const { requests, approveRequest, rejectRequest } = useCashoutRequest();

  const columns = React.useMemo<ColumnDef<CashoutRequest>[]>(
    () => [
      {
        accessorFn: (row) => row.driver.name,
        id: "driverName",
        header: () => <div className="text-start">Driver</div>,
        cell: ({ row }) => (
          <div className="lowercase text-start">{row.original.driver.name}</div>
        ),
      },
      {
        accessorFn: (row) => row.driver.walletSummary!.actualBalance,
        id: "actualBalance",
        header: () => <div className="text-start">Actual Balance</div>,
        cell: ({ row }) => {
          const bal = row.original.driver.walletSummary!.actualBalance;
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "JOD",
          }).format(bal);
          return <div className="text-start font-medium">{formatted}</div>;
        },
      },
      {
        accessorFn: (row) => row.driver.walletSummary!.addedBalance,
        id: "addedBalance",
        header: () => <div className="text-start">Added Balance</div>,
        cell: ({ row }) => {
          const bal = row.original.driver.walletSummary!.addedBalance;
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "JOD",
          }).format(bal);
          return <div className="text-start font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-start">Request Amount</div>,
        cell: ({ row }) => {
          const amt = row.getValue<number>("amount");
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "JOD",
          }).format(amt);
          return <div className="text-start font-medium">{formatted}</div>;
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <div
            className="cursor-pointer flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            {column.getIsSorted() &&
              (column.getNextSortingOrder() === "asc" ? (
                <ArrowDown size={12} />
              ) : (
                <ArrowUp size={12} />
              ))}
          </div>
        ),
        cell: ({ row }) => {
          const status = row.getValue<CashoutRequest['status']>("status");
          let variant: "default" | "secondary" | "destructive" = "secondary";
          if (status === "approved") variant = "default";
          if (status === "rejected") variant = "destructive";
          return (
            <Badge className="capitalize text-start" variant={variant}>
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => <div className="text-start">Date Created</div>,
        cell: ({ row }) => (
          <time className="text-start">
            {formatDistanceToNow((row.original.createdAt as Date), {
              addSuffix: true,
            })}
          </time>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const { id, status } = row.original;
          return <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={status !== "pending"}
                onSelect={(e) => {
                  e.preventDefault();
                  approveRequest(id);
                }}
              >
                <CheckCircle /> Approve
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={status !== "pending"}
                onSelect={(e) => {
                  e.preventDefault();
                  rejectRequest(id);
                }}
              >
                <XCircle /> Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          return (
            <div className="flex gap-2 justify-end">
              {status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => approveRequest(id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => rejectRequest(id)}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [approveRequest, rejectRequest]
  );

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: requests,
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
          placeholder="Filter driver names..."
          value={
            (table.getColumn("driverName")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) => table.getColumn("driverName")?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().
              filter((col) => col.getCanHide()).
              map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(val) => col.toggleVisibility(!!val)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
