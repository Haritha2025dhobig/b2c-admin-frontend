"use client";

import React, { useMemo, useState } from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Typography,
  Pagination,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Switch,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { formatDate } from "@/utils/date";

/**
 * Strongly-typed, highly-configurable data table that adapts to any page.
 * - No `any` types
 * - Works with arbitrary row shapes via generics
 * - Optional column config for ordering/labels/custom renderers/visibility
 * - Optional row identifier extractor
 * - Built-in helpers for dates/booleans
 * - Optional actions (edit/delete/toggle)
 * - Pagination with controllable page-size options
 */

export type CellRenderer<T> = (
  row: T,
  value: unknown,
  ctx: { columnKey: keyof T | string; rowIndex: number }
) => React.ReactNode;

export interface ColumnDef<T> {
  /** Key in the row (or a virtual key for custom value/getter) */
  key: keyof T | string;
  /** Column header label (defaults to key transformed) */
  header?: string;
  /** Compute the value to render for this column */
  value?: (row: T) => unknown;
  /** Custom renderer for the cell */
  render?: CellRenderer<T>;
  /** Hide this column */
  hide?: boolean;
  /** Treat as date; uses provided dateFormat or default formatDate */
  isDate?: boolean;
  /** Treat as boolean; if onToggleActive provided, it will render a Switch */
  isBoolean?: boolean;
}

export interface CommonTableProps<T extends object> {
  data: T[];

  // Columns: if omitted, columns are inferred from the first row's keys
  columns?: Array<ColumnDef<T>>;

  // Row identity (for stable keys)
  getRowId?: (row: T, index: number) => React.Key;

  // Built-in actions
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onToggleActive?: (row: T, newValue: boolean) => void;

  // Optional row click
  onRowClick?: (row: T) => void;

  // Pagination controls
  rowsPerPageOptions?: number[]; // default [5, 10, 25, 50]
  initialRowsPerPage?: number;   // default 10

  // Misc
  emptyMessage?: string; // default "No records found."
  titleCaseHeaders?: boolean; // default true
  dateFormat?: (value: unknown) => React.ReactNode; // default uses formatDate
}

// Helper type for the SubOrder dialog content
 type SubOrder = Record<string, unknown>;

export default function CommonTable<T extends object>({
  data,
  columns,
  getRowId,
  onEdit,
  onDelete,
  onToggleActive,
  onRowClick,
  rowsPerPageOptions = [5, 10, 25, 50],
  initialRowsPerPage = 10,
  emptyMessage = "No records found.",
  titleCaseHeaders = true,
  dateFormat,
}: CommonTableProps<T>) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [selectedSubOrder, setSelectedSubOrder] = useState<SubOrder | null>(
    null
  );

  const inferredColumns = useMemo(() => {
    if (!data || data.length === 0) return [] as Array<keyof T>;
    return Object.keys(data[0]) as Array<keyof T>;
  }, [data]);

  const activeColumns: Array<ColumnDef<T>> = useMemo(() => {
    if (columns && columns.length) return columns.filter((c) => !c.hide);
    // fallback: infer columns directly from data
    return inferredColumns.map((k) => ({ key: k })) as Array<ColumnDef<T>>;
  }, [columns, inferredColumns]);

  const hasActions = Boolean(onEdit || onDelete);

  const handleChangePage = (_: unknown, value: number) => setPage(value);

  const handleChangeRowsPerPage = (event: SelectChangeEvent) => {
    const next = parseInt(String(event.target.value), 10);
    setRowsPerPage(Number.isNaN(next) ? initialRowsPerPage : next);
    setPage(1);
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const defaultHeader = (key: keyof T | string) => {
    const txt = String(key).replaceAll("_", " ");
    return titleCaseHeaders ? txt.toUpperCase() : txt;
  };

  const defaultDateRender = (val: unknown) => {
    if (typeof val === "string" || val instanceof Date) {
      try {
        return formatDate(val as string, true);
      } catch {
        return String(val);
      }
    }
    return String(val ?? "");
  };

  const renderCell = (col: ColumnDef<T>, row: T, rowIndex: number) => {
    const rawValue = col.value ? col.value(row) : (row as Record<string, unknown>)[
      col.key as keyof T as unknown as string
    ];

    // Special-case: sub_orders array as clickable chips (convention)
    if (String(col.key) === "sub_orders" && Array.isArray(rawValue)) {
      const arr = rawValue as unknown[];
      return (
        <Stack direction="column" spacing={1}>
          {arr.map((sub, idx) => {
            const subObj = (sub ?? {}) as SubOrder;
            const label =
              (subObj["confirm_suborder_code"] as string | undefined) ||
              `SubOrder-${idx + 1}`;
            return (
              <Chip
                key={idx}
                label={label}
                color="primary"
                size="small"
                clickable
                onClick={() => setSelectedSubOrder(subObj)}
              />
            );
          })}
        </Stack>
      );
    }

    // Date rendering
    if (col.isDate) {
      const fmt = dateFormat ?? defaultDateRender;
      return fmt(rawValue);
    }

    // Boolean rendering (optionally toggleable)
    if (col.isBoolean && typeof rawValue === "boolean") {
      if (onToggleActive) {
        return (
          <Switch
            checked={rawValue}
            onChange={(e) => onToggleActive(row, e.target.checked)}
            color="primary"
          />
        );
      }
      return rawValue ? (
        <Chip label="Active" color="success" variant="outlined" size="small" />
      ) : (
        <Chip label="Inactive" color="error" variant="outlined" size="small" />
      );
    }

    // Custom renderer override
    if (col.render) return col.render(row, rawValue, { columnKey: col.key, rowIndex });

    // Objects -> stringify (safe)
    if (rawValue !== null && typeof rawValue === "object") {
      try { return JSON.stringify(rawValue); } catch { return "[object]"; }
    }

    return (rawValue as React.ReactNode) ?? "";
  };

  if (!data || data.length === 0) {
    return <Typography variant="body2">{emptyMessage}</Typography>;
  }

  return (
    <>
      <Paper className="shadow-lg rounded-lg p-3">
        <TableContainer>
          <MuiTable size="small">
            <TableHead>
              <TableRow>
                {activeColumns.map((col) => (
                  <TableCell key={String(col.key)}>
                    {col.header ?? defaultHeader(col.key)}
                  </TableCell>
                ))}
                {hasActions && <TableCell>ACTIONS</TableCell>}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((row, idx) => {
                const rowKey = getRowId ? getRowId(row, startIndex + idx) : startIndex + idx;
                return (
                  <TableRow
                    key={String(rowKey)}
                    hover
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    style={{ cursor: onRowClick ? "pointer" : undefined }}
                  >
                    {activeColumns.map((col) => (
                      <TableCell key={String(col.key)}>{renderCell(col, row, startIndex + idx)}</TableCell>
                    ))}

                    {hasActions && (
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {onEdit && (
                            <Tooltip title="Edit">
                              <IconButton color="primary" onClick={() => onEdit(row)}>
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Delete">
                              <IconButton color="error" onClick={() => onDelete(row)}>
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </MuiTable>
        </TableContainer>

        {/* Pagination Footer */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
          <Typography variant="body2">
            Showing page {page} of {Math.ceil(data.length / rowsPerPage)} (Total {data.length} entries)
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">Rows per page:</Typography>
            <Select value={String(rowsPerPage)} onChange={handleChangeRowsPerPage} size="small">
              {rowsPerPageOptions.map((opt) => (
                <MenuItem key={opt} value={String(opt)}>
                  {opt}
                </MenuItem>
              ))}
            </Select>

            <Pagination
              count={Math.ceil(data.length / rowsPerPage)}
              page={page}
              onChange={handleChangePage}
              siblingCount={1}
              boundaryCount={1}
              color="primary"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* SubOrder Details Dialog */}
      <Dialog open={!!selectedSubOrder} onClose={() => setSelectedSubOrder(null)} fullWidth maxWidth="sm">
        <DialogTitle>SubOrder Details</DialogTitle>
        <DialogContent>
          {selectedSubOrder ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              {Object.entries(selectedSubOrder).map(([key, val]) => (
                <Typography key={key}>
                  <b>{key.replaceAll("_", " ")}: </b>
                  {typeof val === "object" && val !== null ? JSON.stringify(val) : String(val)}
                </Typography>
              ))}
            </Stack>
          ) : null}
          <Button onClick={() => setSelectedSubOrder(null)} sx={{ mt: 2 }}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Helper: create a typed table component once and reuse without repeatedly
 * specifying generics at call sites.
 *
 * Example:
 *   const PickupTable = asTableOf<Pickup>();
 *   <PickupTable data={pickups} onEdit={(row) => ...} />
 */
export const asTableOf = <T extends object>() => {
  const TypedTable = (props: CommonTableProps<T>) => <CommonTable<T> {...props} />;
  TypedTable.displayName = "TypedCommonTable";
  return TypedTable;
};

