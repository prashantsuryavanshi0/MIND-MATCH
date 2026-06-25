import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme: 'dark' | 'light';
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  theme,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        {/* Animated Dialog Container */}
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 15, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className={`relative w-full max-w-md rounded-2xl border p-5 md:p-6 shadow-2xl backdrop-blur-md overflow-hidden ${
            theme === 'dark'
              ? 'bg-slate-900/95 border-white/5 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
              : 'bg-white/95 border-slate-200 text-slate-800 shadow-xl shadow-slate-200/50'
          }`}
        >
          {/* Header Glow decoration */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="flex gap-4">
            <div className="flex-shrink-0 p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/10 h-fit">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg tracking-tight mb-1.5">
                {title}
              </h3>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 mt-6 justify-end">
            <button
              onClick={onCancel}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1.5 text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 shadow-md shadow-red-600/10`}
            >
              <Check className="w-3.5 h-3.5" />
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
