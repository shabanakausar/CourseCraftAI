"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Yes, Reset",
  cancelText = "Cancel",
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full max-w-md bg-card-dark border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden z-10 p-6 space-y-6"
          >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-pink/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-brand-pink/10 border border-brand-pink/20 rounded-xl text-brand-pink shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold font-sans tracking-tight text-white">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 border border-transparent hover:border-white/5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold transition-all cursor-pointer text-slate-300"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="bg-gradient-to-r from-brand-pink to-rose-600 hover:from-brand-pink hover:to-rose-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all text-xs cursor-pointer"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
