"use client";

import React, { useState } from "react";
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

interface CommonTableProps<T extends Record<string, any>> {
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onToggleActive?: (row: T, newValue: boolean) => void; // ✅ generic toggle callback
}

export default function CommonTable<T extends Record<string, any>>({
  data,
  onEdit,
  onDelete,
  onToggleActive,
}: CommonTableProps<T>) {
  if (!data || data.length === 0) return <p>No records found.</p>;

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSubOrder, setSelectedSubOrder] = useState<any | null>(null);

  const columns = Object.keys(data[0]);

  const handleChangePage = (_: unknown, value: number) => {
    setPage(value);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  return (
    <>
      <Paper className="shadow-lg rounded-lg p-3">
        <TableContainer>
          <MuiTable>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col}>
                    {col.replaceAll("_", " ").toUpperCase()}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && <TableCell>ACTIONS</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, idx) => (
                <TableRow key={idx} hover>
                  {columns.map((col) => {
                    const value = row[col];
                    return (
                      <TableCell key={col}>
                        {col === "sub_orders" && Array.isArray(value) ? (
                          <Stack direction="column" spacing={1}>
                            {value.map((sub: any, subIdx: number) => (
                              <Chip
                                key={subIdx}
                                label={sub.pending_suborder_code}
                                color="primary"
                                size="small"
                                clickable
                                onClick={() => setSelectedSubOrder(sub)}
                              />
                            ))}
                          </Stack>
                        ) : col === "order_created_at" || col === "pickup_date_time" ?  (
                          formatDate(value, true)
                        ) : typeof value === "boolean" ? (
                          onToggleActive ? (
                            <Switch
                              checked={value}
                              onChange={(e) =>
                                onToggleActive(row, e.target.checked)
                              }
                              color="primary"
                            />
                          ) : value ? (
                            <Chip
                              label="Active"
                              color="success"
                              variant="outlined"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="Inactive"
                              color="error"
                              variant="outlined"
                              size="small"
                            />
                          )
                        ) : value !== null && typeof value === "object" ? (
                          JSON.stringify(value)
                        ) : (
                          value
                        )}
                      </TableCell>
                    );
                  })}

                  {(onEdit || onDelete) && (
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {onEdit && (
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => onEdit(row)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => onDelete(row)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>

        {/* ✅ Pagination Footer */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2 }}
        >
          <Typography variant="body2">
            Showing page {page} of {Math.ceil(data.length / rowsPerPage)} (Total{" "}
            {data.length} entries)
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">Rows per page:</Typography>
            <Select<number>
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              size="small"
            >
              {[5, 10, 25, 50].map((opt) => (
                <MenuItem key={opt} value={opt}>
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

      {/* ✅ SubOrder Details Dialog */}
      <Dialog
        open={!!selectedSubOrder}
        onClose={() => setSelectedSubOrder(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>SubOrder Details</DialogTitle>
        <DialogContent>
          {selectedSubOrder ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              {Object.entries(selectedSubOrder).map(([key, val]) => (
                <Typography key={key}>
                  <b>{key.replaceAll("_", " ")}:</b>{" "}
                  {typeof val === "object" ? JSON.stringify(val) : String(val)}
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
