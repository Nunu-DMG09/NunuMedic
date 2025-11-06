
import React from 'react';

export default function Modal({ children, onClose, title }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
     
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      
      <div
        className="relative z-10 w-full h-full sm:h-auto max-w-full sm:max-w-4xl bg-white rounded-none sm:rounded-2xl shadow-2xl border border-slate-200/50 overflow-y-auto"
        role="document"
        aria-label={title || 'Modal'}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 px-4 sm:px-8 py-4 sm:py-6 relative">
         
          <div className="hidden sm:block absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-white">{title || 'Modal'}</h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">Complete la información requerida</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="group p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-md transition-all duration-200 hover:scale-105"
              title="Cerrar modal"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-slate-200 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

       
        <div className="p-4 sm:p-8 bg-gradient-to-b from-white to-slate-50 max-h-[80vh] sm:max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
