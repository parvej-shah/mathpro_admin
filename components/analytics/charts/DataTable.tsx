"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface Column {
  field: string;
  header: string;
  align?: "left" | "right" | "center";
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
  data: Record<string, unknown>[];
  columns: Column[];
  noDataMessage?: string;
  containerStyles?: React.CSSProperties;
}

export function DataTable({
  data,
  columns,
  noDataMessage = "No data available",
  containerStyles,
}: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{noDataMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto mt-4" style={containerStyles}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left"
                }
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, colIndex) => (
                <TableCell
                  key={colIndex}
                  className={
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                        ? "text-center"
                        : "text-left"
                  }
                >
                  {column.render
                    ? column.render(row)
                    : String(row[column.field] || "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
