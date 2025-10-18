import React from 'react';

export default function Modal({ children, onClose, title }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {/* backdrop: semitransparente + blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* modal card */}
      <div
        className="relative z-10 w-full max-w-3xl mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-black/5 p-6"
        role="document"
        aria-label={title || 'Modal'}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title || 'Modal'}</h3>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>

        <div className="text-slate-700 dark:text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}