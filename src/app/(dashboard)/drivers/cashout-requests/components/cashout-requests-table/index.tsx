"use client";

import "reflect-metadata";
import { formatDistanceToNow, format } from "date-fns";
import React from "react";
import { Copy } from "lucide-react";
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
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  Eye,
  MoreHorizontal,
  XCircle,
} from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn, formatAmount } from "@/lib/utils";
import { Label } from "@/components/ui/label";
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
          const balance = row.original.driver.walletSummary!.actualBalance;
          return (
            <div className="text-start font-medium">
              {formatAmount(balance)}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.driver.walletSummary!.addedBalance,
        id: "addedBalance",
        header: () => <div className="text-start">Added Balance</div>,
        cell: ({ row }) => {
          const balance = row.original.driver.walletSummary!.addedBalance;
          return (
            <div className="text-start font-medium">
              {formatAmount(balance)}
            </div>
          );
        },
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-start">Requested Amount</div>,
        cell: ({ row }) => {
          const amount = row.getValue<number>("amount");
          return (
            <div className="text-start font-medium">{formatAmount(amount)}</div>
          );
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
          const status = row.getValue<CashoutRequest["status"]>("status");
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: "createdAt",
        header: () => <div className="text-start">Date Created</div>,
        cell: ({ row }) => (
          <time className="text-start">
            {formatDistanceToNow(row.original.createdAt as Date, {
              addSuffix: true,
            })}
          </time>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const {
            id,
            status,
            amount,
            driver,
            transferMethod,
            cliq,
            iban,
            createdAt,
          } = row.original;
          return (
            <>
              <Sheet>
                <SheetTrigger>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">View Details</span>
                    <Eye className="h-4 w-4" />
                  </Button>
                </SheetTrigger>

                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{driver.name} Cashout Request</SheetTitle>

                    <SheetDescription>
                      Review {driver.name} request from{" "}
                      <time className="text-start">
                        {formatDistanceToNow(createdAt as Date, {
                          addSuffix: true,
                        })}{" "}
                        — {format(new Date(createdAt), "yyyy-MM-dd HH:mm")}.
                      </time>
                      <br />
                      <StatusBadge status={status} className="my-4" />
                    </SheetDescription>
                  </SheetHeader>

                  <div className="grid flex-1 auto-rows-min gap-6">
                    <div>
                      <div className="tracking-wide text-neutral-600 font-medium">
                        Driver
                      </div>
                      <div className="text-sm">{driver.name}</div>
                    </div>

                    <div>
                      <div className="tracking-wide text-neutral-600 font-medium">
                        Actual Balance
                      </div>
                      <div className="text-sm">
                        {driver.walletSummary!.actualBalance}
                      </div>
                    </div>

                    <div>
                      <div className="tracking-wide text-neutral-600 font-medium">
                        Added Balance
                      </div>
                      <div className="text-sm">
                        {driver.walletSummary!.addedBalance}
                      </div>
                    </div>

                    <div>
                      <div className="tracking-wide text-neutral-600 font-medium">
                        Requested Amount
                      </div>
                      <div className="text-sm">{formatAmount(amount)}</div>
                    </div>

                    <div>
                      <div className="tracking-wide text-neutral-600 font-medium">
                        Added Balance
                      </div>
                      <div className="text-sm">
                        {driver.walletSummary!.addedBalance}
                      </div>
                    </div>

                    <div>
                      <div className="tracking-wide text-neutral-600 font-medium">
                        Transfer Method
                      </div>
                      <Badge>
                        {transferMethod === "iban" ? "IBAN" : "CliQ"}
                      </Badge>
                    </div>

                    {transferMethod === "iban" ? (
                      <div>
                        <div className="tracking-wide text-neutral-600 font-medium">
                          IBAN
                        </div>
                        <div className="flex items-center gap-2 tracking-widest">
                          {iban}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(iban!);
                                toast({
                                  title: "Copied!",
                                  description: "IBAN copied to clipboard.",
                                });
                              } catch {
                                toast({
                                  title: "Copy failed",
                                  description:
                                    "Could not copy IBAN. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="ms-auto"
                            aria-label="Copy IBAN"
                          >
                            <Copy className="w-1 h-1" />
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {transferMethod === "cliq" ? (
                      <div>
                        <div className="tracking-wide text-neutral-600 font-medium">
                          {cliq!.alias ? "Alias" : "Phone Number"}
                        </div>
                        <div className="flex items-center gap-2 tracking-widest">
                          {cliq!.alias ? cliq!.alias : cliq!.phone}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="ms-auto"
                            onClick={async () => {
                              const value = cliq!.alias
                                ? cliq!.alias
                                : cliq!.phone;
                              try {
                                await navigator.clipboard.writeText(value!);
                                toast({
                                  title: "Copied!",
                                  description: "Copied to clipboard.",
                                });
                              } catch {
                                toast({
                                  title: "Copy failed",
                                  description:
                                    "Could not copy CliQ alias or phone number. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            aria-label="Copy value"
                          >
                            <Copy className="w-1 h-1" />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <SheetFooter>
                    <div className="flex flex-col items-stetch gap-2 w-full mt-8">
                      <ApproveDialog
                        id={id}
                        requestedAmount={amount}
                        disabled={status !== "pending"}
                        trigger={
                          <Button
                            disabled={status !== "pending"}
                            onSelect={(e) => e.preventDefault()}
                          >
                            <CheckCircle /> Approve
                          </Button>
                        }
                      />

                      <Button
                        disabled={status !== "pending"}
                        variant="destructive"
                        onSelect={(e) => {
                          e.preventDefault();
                          rejectRequest(id);
                        }}
                      >
                        <XCircle /> Reject
                      </Button>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <ApproveDialog
                    id={id}
                    requestedAmount={amount}
                    disabled={status !== "pending"}
                    trigger={
                      <DropdownMenuItem
                        disabled={status !== "pending"}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <CheckCircle /> Approve
                      </DropdownMenuItem>
                    }
                  />
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
            </>
          );
        },
      },
    ],
    [approveRequest, rejectRequest],
  );

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
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
          onChange={(e) =>
            table.getColumn("driverName")?.setFilterValue(e.target.value)
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
              .filter((col) => col.getCanHide())
              .map((col) => (
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
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
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
                  No results.
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

/**
 * Dialog for approving a cashout request with actual amount entry.
 */
function ApproveDialog({
  id,
  requestedAmount,
  disabled,
  trigger,
}: {
  id: string;
  requestedAmount: number;
  disabled?: boolean;
  trigger: React.ReactNode;
}) {
  const { approveRequest } = useCashoutRequest();
  const [open, setOpen] = React.useState(false);
  const [actualAmount, setActualAmount] = React.useState(requestedAmount);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleApprove = async () => {
    setError(null);
    if (actualAmount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    if (actualAmount > requestedAmount) {
      setError("Amount cannot be greater than requested.");
      return;
    }
    setLoading(true);
    try {
      await approveRequest(id, actualAmount);
      setOpen(false);
    } catch (e) {
      setError("Failed to approve request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Cashout Request</DialogTitle>
          <DialogDescription>
            Enter the actual amount sent to the driver. It must be less than or
            equal to the requested amount.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div>
            <span className="font-medium">Requested Amount: </span>
            <span>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "JOD",
              }).format(requestedAmount)}
            </span>
          </div>
          <label className="flex flex-col gap-1">
            <span>Actual Amount Sent</span>
            <Input
              type="number"
              min={0}
              max={requestedAmount}
              step="0.01"
              value={actualAmount}
              onChange={(e) => setActualAmount(Number(e.target.value))}
              disabled={loading}
            />
          </label>
          {error && <div className="text-destructive text-sm">{error}</div>}
        </div>
        <DialogFooter>
          <Button
            onClick={handleApprove}
            disabled={
              loading || actualAmount <= 0 || actualAmount > requestedAmount
            }
          >
            {loading ? "Approving..." : "Approve"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  let variant: "default" | "secondary" | "destructive" = "secondary";
  if (status === "approved") variant = "default";
  if (status === "rejected") variant = "destructive";

  return (
    <Badge className={cn("capitalize text-start", className)} variant={variant}>
      {status}
    </Badge>
  );
}
