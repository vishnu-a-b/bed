//dataTable.tsx
"use client"
import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  SortingState,
  VisibilityState,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./DataTablePagination";
import { Trash2, UserPen } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  refreshTable,
  setUpdateId,
  setUpdateUrl,
} from "@/lib/slice/updateSlice";
import { Axios } from "@/utils/api/apiAuth";
import { useRouter } from "next/navigation";

export interface DataTableProps<TData, TValue> {
  url: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalRows: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  actions: any;
}

export function DataTable<TData, TValue>({
  url,
  columns,
  data,
  totalRows,
  pageIndex: initialPageIndex,
  pageSize: initialPageSize,
  onPageChange,
  onPageSizeChange,
  actions,
}: DataTableProps<any, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });
  const dispatch = useDispatch();
  const router = useRouter();
  const table = useReactTable({
    data,
    columns: [
      // Add the index column
      {
        id: "index",
        header: "No",
        cell: ({ row }) =>
          row.index + 1 + pagination.pageIndex * pagination.pageSize,
        enableSorting: false,
      },
      ...columns,
      ...(actions.edit || actions.delete
        ? [
            {
              id: "actions",
              header: "Actions",
              cell: ({ row }:any) => (
                <div className="flex space-x-2">
                  {actions.edit && (
                    <button
                      className="text-blue-500"
                      onClick={() => {
                        handleUpdate(row.original._id);
                      }}
                    >
                      <UserPen />
                    </button>
                  )}
                  {actions.delete && (
                    <button
                      onClick={() => handleDelete(row.original)}
                      className="text-red-500"
                    >
                      <Trash2 />
                    </button>
                  )}
                </div>
              ),
              enableSorting: false,
            },
          ]
        : []),
    ],
    pageCount: Math.ceil(totalRows / pagination.pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination, // Only update pagination state here
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true, // Enables server-side pagination
  });

  const handleUpdate = (value: any) => {
    dispatch(setUpdateUrl(url));
    dispatch(setUpdateId(value));
  };

  const handleDelete = async (value: any) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this data?"
      );
      if (confirmDelete) {
        const response = await Axios.delete(`/${url}/${value._id}`);
        if (url === "staff") {
          const response = await Axios.delete(`/user/${value.user._id}`);
        }
        console.log(response);
        dispatch(refreshTable());
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      dispatch(refreshTable());
    }
  };
  // Use effect to trigger onPageChange and onPageSizeChange only after pagination state updates
  useEffect(() => {
    onPageChange(pagination.pageIndex);
    onPageSizeChange(pagination.pageSize);
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    onPageChange,
    onPageSizeChange,
  ]);

  return (
    <div>
      <div className="rounded-md border">
        <Table className="w-full">
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
            {table.getRowModel()?.rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      { url!='supporter' && <DataTablePagination table={table} />}
    </div>
  );
}
