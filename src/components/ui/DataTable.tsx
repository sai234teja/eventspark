"use client";

import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchKey?: keyof T | ((item: T) => string);
  filterOptions?: {
    key: keyof T | string;
    label: string;
    options: { label: string; value: string }[];
    filterFn: (item: T, value: string) => boolean;
  };
  emptyMessage?: string;
  itemsPerPage?: number;
}

export function DataTable<T>({ 
  data, 
  columns, 
  loading = false, 
  searchable = false, 
  searchKey,
  filterOptions,
  emptyMessage = "No results found.",
  itemsPerPage = 10
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    let result = data;

    if (searchable && searchQuery && searchKey) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => {
        let val = "";
        if (typeof searchKey === 'function') {
          val = searchKey(item);
        } else {
          val = String(item[searchKey] || "");
        }
        return val.toLowerCase().includes(lowerQuery);
      });
    }

    if (filterOptions && filterValue !== "all") {
      result = result.filter(item => filterOptions.filterFn(item, filterValue));
    }

    return result;
  }, [data, searchable, searchQuery, searchKey, filterOptions, filterValue]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset page on filter/search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterValue]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {searchable && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-slate-950 border-slate-800 text-white"
            />
          </div>
        )}
        
        {filterOptions && (
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="w-full sm:w-48 bg-slate-950 border-slate-800 text-white">
              <SelectValue placeholder={filterOptions.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filterOptions.label}</SelectItem>
              {filterOptions.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="rounded-md border border-slate-800 overflow-hidden bg-slate-900/50">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800 hover:bg-slate-950">
              {columns.map((col, i) => (
                <TableHead key={i} className="text-slate-400 font-medium">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-400">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, rowIndex) => (
                <TableRow key={rowIndex} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className="py-3">
                      {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] || "") : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center px-2 font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
