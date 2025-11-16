"use client"

import React from "react";
import{ Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


interface Column {
    header: string; //Header de la tabla
    accessorKey: string; //Clave del valor
}

interface TableProps {
    columns: Column[]; //Columnas de la tabla
    data: Record<string, string | number>[]; //Datos de la tabla
}

export const CustomTable: React.FC<TableProps> = ({ columns, data }) => {
  return (
    <div className="rounded-lg bg-green-50 max-h-96 overflow-y-auto overflow-x-auto">
      <Table className="bg-green-50">
        <TableHeader className="sticky top-0 bg-green-100 z-10">
          <TableRow className="hover:bg-green-100">
            {columns.map((col, index) => (
              <TableHead
                key={index}
                className="bg-green-50 border-b border-gray-300"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="bg-green-50 hover:bg-green-100">
              {columns.map((col, colIndex) => (
                <TableCell key={colIndex} className="border-b border-gray-300">
                  {row[col.accessorKey]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};