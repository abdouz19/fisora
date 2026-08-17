import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "تأكيد الحذف" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md flex flex-col glass-card rounded-3xl border border-gray-200 shadow-2xl relative bg-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-rose-500/10">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-black">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all bg-gray-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-sm leading-relaxed text-right">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 font-bold text-sm transition-colors hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-gray-900 font-bold text-sm shadow-lg shadow-rose-900/50 transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
