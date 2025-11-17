"use client"

import React from "react";
import{ Table, 
        TableBody, 
        TableCell, 
        TableHead, 
        TableHeader, 
        TableRow } from "@/components/ui/table";


interface Column {
    header: string; //Header de la tabla
    accessorKey: string; //Clave del valor
}

interface TableProps {
    columns: Column[]; //Columnas de la tabla
    data: Record<string, string | number>[]; //Datos de la tabla
}

export const CustomTable: React.FC<TableProps> = ({ columns, data }) => {
  const getStatusStyles = (value: string | number) => {
    const valueLower = String(value).toLowerCase();
    switch (valueLower) {
      case 'completado':
        return 'bg-green-100 text-green-800 border-green-600';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-600';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-600';
    }
  };

  return (
    <div className="bg-green-50 max-h-96 overflow-y-auto overflow-x-auto">
      <Table className="bg-green-50">
        <TableHeader className="sticksy top-0 bg-green-100 z-10">
          <TableRow className="hover:bg-green-100">
            {columns.map((col, index) => (
              <TableHead
                key={index}
                className="bg-green-50 border-b border-gray-300 text-center"
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
                <TableCell key={colIndex} className="border-b border-gray-300 text-center">
                  {colIndex === columns.length - 1 ? (
                    <span className={`inline-block px-3 py-1 rounded-full border-2 font-medium ${getStatusStyles(row[col.accessorKey])}`}>
                      {row[col.accessorKey]}
                    </span>
                  ) : (
                    row[col.accessorKey]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};