"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopUserData {
  first_name: string | null;
  last_name: string | null;
  acumulated_points: number | string | null;
  spent_points: number | string | null;
  total_points: number | string | null;
}

interface TopUsersTableProps {
  data: TopUserData[];
  limit?: number;
}

export function TopUsersTable({ data, limit = 5 }: TopUsersTableProps) {
  const topUsers = data.slice(0, limit);

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Top</TableHead>
            <TableHead className="text-center">Nombre de Usuario</TableHead>
            <TableHead className="text-center">Puntos Acumulados</TableHead>
            <TableHead className="text-center">Puntos canjeados</TableHead>
            <TableHead className="text-center">Puntos Totales</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topUsers.map((user, index) => (
            <TableRow key={index}>
              <TableCell className="text-center font-medium">{index + 1}</TableCell>
              <TableCell className="text-center">
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell className="text-center">{Number(user.acumulated_points).toLocaleString()}</TableCell>
              <TableCell className="text-center">{Number(user.spent_points).toLocaleString()}</TableCell>
              <TableCell className="text-center font-semibold">{Number(user.total_points).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
