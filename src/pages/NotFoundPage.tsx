import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
        <Home className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold font-['Outfit'] text-white">404 — Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-md mt-2">
        The requested virtual room or administrative view does not exist in this simulated workspace.
      </p>
      <Link
        to="/overview"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-900/30 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Overview
      </Link>
    </div>
  );
};
