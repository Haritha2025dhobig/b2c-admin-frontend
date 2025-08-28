"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface CustomDialogProps {
  open: boolean;
  title: string;
  children?: React.ReactNode; // Optional (not needed for delete confirm)
  onClose: () => void;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  confirmMessage?: string; // For confirmation (e.g. delete)
}

export default function CustomDialog({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitText = "Submit",
  cancelText = "Cancel",
  confirmMessage,
}: CustomDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Title with close icon */}
      <DialogTitle className="flex justify-between items-center">
        {title}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* If confirmMessage is provided, show it instead of children */}
      <DialogContent>
        {confirmMessage ? (
          <Typography variant="body1">{confirmMessage}</Typography>
        ) : (
          children
        )}
      </DialogContent>

      {/* Footer buttons */}
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {cancelText}
        </Button>
        {onSubmit && (
          <Button
            onClick={onSubmit}
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
          >
            {submitText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
