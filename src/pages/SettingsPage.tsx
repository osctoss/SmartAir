import React, { useState, useRef } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useSettingsStore } from '@/state/useSettingsStore';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useUiStore } from '@/state/useUiStore';
import { ImportExportService, ImportValidationResult } from '@/services/import-service';
import { ScenarioSelectorModal } from '@/components/simulator/ScenarioSelectorModal';
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  HardDrive,
  Sparkles,
  Sliders,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    defaultSimulationSpeed,
    defaultVacancyDelaySeconds,
    defaultSmartCareThresholdKg,
    reduceMotion,
    theme,
    setDefaultSpeed,
    setDefaultVacancyDelay,
    setDefaultCareThreshold,
    setReduceMotion,
    setTheme,
  } = useSettingsStore();

  const { storageStatus, rooms, gateways, properties } = useWorkspaceStore();
  const { addToast } = useUiStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals & Dialogs state
  const [presetsModalOpen, setPresetsModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportValidationResult | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Scoped reset confirm dialogs
  const [confirmClearEventsOpen, setConfirmClearEventsOpen] = useState(false);
  const [confirmRestoreDemoOpen, setConfirmRestoreDemoOpen] = useState(false);
  const [confirmWipeOpen, setConfirmWipeOpen] = useState(false);

  const handleExportJson = () => {
    ImportExportService.exportWorkspaceAsJson();
    addToast({
      title: 'Workspace Exported',
      description: 'Downloaded full JSON backup file.',
      type: 'success',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = ImportExportService.validateWorkspaceJson(content);
      setImportPreview(result);
      setIsImportModalOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (importPreview?.workspace) {
      ImportExportService.applyWorkspace(importPreview.workspace);
      setIsImportModalOpen(false);
      setImportPreview(null);
      addToast({
        title: 'Workspace Restored',
        description: `Successfully imported ${importPreview.summary?.roomsCount} rooms and ${importPreview.summary?.gatewaysCount} gateways.`,
        type: 'success',
      });
    }
  };

  const handleClearActiveEvents = () => {
    ImportExportService.clearActiveEvents();
    setConfirmClearEventsOpen(false);
    addToast({
      title: 'Active Alerts Cleared',
      description: 'All active incidents resolved and building siren silenced.',
      type: 'info',
    });
  };

  const handleRestoreDemo = () => {
    ImportExportService.restoreDemoWorkspace();
    setConfirmRestoreDemoOpen(false);
    addToast({
      title: 'Demo Workspace Restored',
      description: 'Reverted dataset to pristine SmartAir Demo Hostel.',
      type: 'success',
    });
  };

  const handleWipeWorkspace = () => {
    ImportExportService.wipeWorkspace();
    setConfirmWipeOpen(false);
    addToast({
      title: 'Workspace Wiped',
      description: 'Reset to empty workspace.',
      type: 'warning',
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Settings & Workspace Data"
        subtitle="Manage simulation defaults, accessibility options, and full JSON workspace backup/restore."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Simulation Defaults */}
        <div className="p-6 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Simulation Defaults</h2>
              <p className="text-xs text-slate-400">Default parameters applied to newly initialized rooms</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Default Clock Speed Multiplier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([1, 5, 20] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setDefaultSpeed(spd)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      defaultSimulationSpeed === spd
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm'
                        : 'bg-[#131b26] border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}× Realtime
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Vacancy Auto-Off Delay (Seconds)
              </label>
              <select
                value={defaultVacancyDelaySeconds}
                onChange={(e) => setDefaultVacancyDelay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#131b26] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value={30}>30 Seconds (Fast Demo)</option>
                <option value={60}>60 Seconds (Default Standard)</option>
                <option value={120}>120 Seconds (2 Minutes)</option>
                <option value={300}>300 Seconds (5 Minutes Institutional)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Smart Care Trigger Threshold (kg)
              </label>
              <select
                value={defaultSmartCareThresholdKg}
                onChange={(e) => setDefaultCareThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#131b26] border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value={5}>5.0 kg (Sensitive)</option>
                <option value={8}>8.0 kg</option>
                <option value={10}>10.0 kg (Institutional Default)</option>
                <option value={12}>12.0 kg</option>
                <option value={15}>15.0 kg (High Tolerance)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Accessibility & Display */}
        <div className="p-6 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Accessibility & Visuals</h2>
              <p className="text-xs text-slate-400">Motion preferences and presentation theme</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#131b26] border border-slate-700/80">
              <div>
                <p className="text-xs font-medium text-slate-200">Reduce Motion</p>
                <p className="text-[11px] text-slate-400">
                  Disables fan blade rotation, packet dots, and alarm flashes. Transitions remain instant.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReduceMotion(!reduceMotion)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  reduceMotion ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={reduceMotion}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    reduceMotion ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Color Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                      theme === t
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm'
                        : 'bg-[#131b26] border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400">
              <span className="font-medium text-slate-300">Auditory preview: </span>
              Building siren audio is strictly user-opt-in on the Network page and does not autoplay.
            </div>
          </div>
        </div>

        {/* Section 3: Storage & Local Persistence Status */}
        <div className="p-6 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Storage & Repository Status</h2>
              <p className="text-xs text-slate-400">Client-side persistence repository health</p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#131b26] border border-slate-700/80">
              <span className="text-slate-400">Storage Engine</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {storageStatus.isInMemoryFallback ? 'In-Memory Fallback' : 'Browser LocalStorage'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#131b26] border border-slate-700/80">
              <span className="text-slate-400">Workspace Entities</span>
              <span className="font-semibold text-slate-200">
                {properties.length} Property • {rooms.length} Rooms • {gateways.length} Gateway
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#131b26] border border-slate-700/80">
              <span className="text-slate-400">Last Persisted</span>
              <span className="text-slate-300 font-mono text-[11px]">
                {storageStatus.lastSavedAt
                  ? new Date(storageStatus.lastSavedAt).toLocaleTimeString()
                  : 'Session Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Scenario Presets Launcher */}
        <div className="p-6 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-100">Scenario Presets Library</h2>
                <p className="text-xs text-slate-400">Deterministic showcase profiles for evaluations</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quickly configure deterministic multi-variable conditions: 5 Smart Home thermal profiles
              (monsoon, hot-afternoon, quiet call) and 6 Smart Care institutional profiles (detection, RF failure, gateway offline, warden audit flow).
            </p>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => setPresetsModalOpen(true)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Browse 11 Scenario Presets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 5: Full Workspace JSON Import / Export & Scoped Resets */}
      <div className="p-6 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-6">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Data Management & Workspace Resets</h2>
          <p className="text-xs text-slate-400">
            Export a versioned JSON backup, import validated state, or perform scoped resets
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center justify-center space-x-2 p-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Workspace JSON</span>
          </button>

          {/* Import JSON */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center space-x-2 p-3.5 rounded-xl bg-[#131b26] hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Import Workspace JSON</span>
            </button>
          </div>

          {/* Clear Active Alerts */}
          <button
            type="button"
            onClick={() => setConfirmClearEventsOpen(true)}
            className="flex items-center justify-center space-x-2 p-3.5 rounded-xl bg-[#131b26] hover:bg-amber-500/10 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Active Alerts</span>
          </button>

          {/* Restore Demo Hostel */}
          <button
            type="button"
            onClick={() => setConfirmRestoreDemoOpen(true)}
            className="flex items-center justify-center space-x-2 p-3.5 rounded-xl bg-[#131b26] hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Restore Demo Hostel</span>
          </button>
        </div>

        {/* Destructive Wipe Option */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-400">Wipe Entire Workspace</p>
            <p className="text-[11px] text-slate-400">
              Permanently purges all rooms, gateways, and incident history back to empty slate.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmWipeOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Workspace</span>
          </button>
        </div>
      </div>

      {/* Scenario Presets Modal */}
      <ScenarioSelectorModal
        isOpen={presetsModalOpen}
        onClose={() => setPresetsModalOpen(false)}
      />

      {/* Import Preview Modal */}
      {isImportModalOpen && importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0e141f] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2.5 rounded-xl ${
                  importPreview.isValid
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {importPreview.isValid ? (
                  <FileCheck className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  {importPreview.isValid ? 'Workspace Validation Succeeded' : 'Import Validation Failed'}
                </h3>
                <p className="text-xs text-slate-400">
                  {importPreview.isValid
                    ? 'Zod schema and foreign-key integrity checks passed.'
                    : 'File does not match the required SmartAir workspace schema.'}
                </p>
              </div>
            </div>

            {importPreview.isValid && importPreview.summary && (
              <div className="p-4 rounded-xl bg-[#131b26] border border-slate-700/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Properties:</span>
                  <span className="font-semibold text-slate-200">
                    {importPreview.summary.propertiesCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rooms:</span>
                  <span className="font-semibold text-slate-200">
                    {importPreview.summary.roomsCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gateways:</span>
                  <span className="font-semibold text-slate-200">
                    {importPreview.summary.gatewaysCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Care Events:</span>
                  <span className="font-semibold text-slate-200">
                    {importPreview.summary.eventsCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Schema Version:</span>
                  <span className="font-semibold text-slate-200">
                    v{importPreview.summary.schemaVersion}
                  </span>
                </div>
              </div>
            )}

            {!importPreview.isValid && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                {importPreview.errors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#131b26] border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              {importPreview.isValid && (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
                >
                  Confirm & Apply Workspace
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={confirmClearEventsOpen}
        onCancel={() => setConfirmClearEventsOpen(false)}
        onConfirm={handleClearActiveEvents}
        title="Clear Active Alerts?"
        message="This will resolve all unacknowledged care incidents and silence the building siren. Historical logs will be preserved."
        confirmLabel="Clear Alerts"
      />

      <ConfirmDialog
        isOpen={confirmRestoreDemoOpen}
        onCancel={() => setConfirmRestoreDemoOpen(false)}
        onConfirm={handleRestoreDemo}
        title="Restore Pristine Demo Hostel?"
        message="This will replace current room configurations and data with the default SmartAir Demo Hostel (Room A-204, Room B-102, Room H-301, and GW-01)."
        confirmLabel="Restore Demo"
      />

      <ConfirmDialog
        isOpen={confirmWipeOpen}
        onCancel={() => setConfirmWipeOpen(false)}
        onConfirm={handleWipeWorkspace}
        title="Wipe Entire Workspace?"
        message="WARNING: This will permanently remove all rooms, gateways, and incident records. This action cannot be undone unless you have exported a JSON backup."
        confirmLabel="Wipe Everything"
        isDestructive={true}
      />
    </div>
  );
};
