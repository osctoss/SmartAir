import React, { useState } from 'react';
import { CareEvent } from '@/domain/types';
import { Check, ShieldCheck, X } from 'lucide-react';

interface AcknowledgeDialogProps {
  isOpen: boolean;
  event: CareEvent | null;
  onConfirm: (operatorLabel: string) => void;
  onCancel: () => void;
}

export const AcknowledgeEventDialog: React.FC<AcknowledgeDialogProps> = ({
  isOpen,
  event,
  onConfirm,
  onCancel,
}) => {
  const [operator, setOperator] = useState('Demo Hostel Warden');

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#131b26] border border-slate-700 max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-['Outfit'] text-white">Acknowledge Incident Alert</h3>
            <span className="text-xs text-cyan-400 font-mono block mt-0.5">{event.id}</span>
            <p className="text-xs text-slate-400 mt-2">
              Mark this event as inspected by an operator. Acknowledging verifies receipt but does not close the incident until physical room check is performed.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase">
            Responder / Operator Label
          </label>
          <input
            type="text"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full bg-[#0b0f17] border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(operator)}
            className="px-5 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-900/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Confirm Acknowledged</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ResolveDialogProps {
  isOpen: boolean;
  event: CareEvent | null;
  onConfirm: (operatorLabel: string, note: string) => void;
  onCancel: () => void;
}

export const ResolveEventDialog: React.FC<ResolveDialogProps> = ({
  isOpen,
  event,
  onConfirm,
  onCancel,
}) => {
  const [operator, setOperator] = useState('Demo Hostel Warden');
  const [note, setNote] = useState('Room inspected; accidental heavy item removed from ceiling fan assembly.');

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#131b26] border border-slate-700 max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h3 className="text-base font-bold font-['Outfit'] text-white">Resolve & Close Incident</h3>
            <span className="text-xs text-cyan-400 font-mono block mt-0.5">{event.id}</span>
            <p className="text-xs text-slate-400 mt-2">
              Closes this care incident, silences any active building sirens, and archives the resolution record in permanent audit history.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Resolving Operator
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full bg-[#0b0f17] border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Resolution Note (Non-Sensitive)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#0b0f17] border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(operator, note)}
            className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Confirm Resolution</span>
          </button>
        </div>
      </div>
    </div>
  );
};
