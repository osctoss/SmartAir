import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { EditionSelector } from '@/components/forms/EditionSelector';
import { RoomIdentityForm, RoomIdentityData } from '@/components/forms/RoomIdentityForm';
import { RoomConfigForm, RoomConfigFormData } from '@/components/forms/RoomConfigForm';
import { RoomConfigReview } from '@/components/forms/RoomConfigReview';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useUiStore } from '@/state/useUiStore';
import { Edition, Room } from '@/domain/types';
import { generateDeviceId } from '@/domain/ids';
import { DEFAULT_FAN_POWER_WATTS, DEFAULT_AC_POWER_WATTS } from '@/domain/constants';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

type WizardStep = 'identity' | 'edition' | 'config' | 'review';

export const AddRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { properties, gateways, createRoom } = useWorkspaceStore();
  const { addToast } = useUiStore();

  const [currentStep, setCurrentStep] = useState<WizardStep>('identity');
  const [edition, setEdition] = useState<Edition>('smart-home');

  const defaultProp = properties[0]?.name || 'Demo Property';
  const defaultGw = gateways[0]?.id || 'gw-demo-01';

  const [identity, setIdentity] = useState<RoomIdentityData>({
    name: '',
    id: '',
    propertyName: defaultProp,
    block: 'Block A',
    floor: '2nd Floor',
    notes: '',
  });

  const [config, setConfig] = useState<RoomConfigFormData>({
    initialIndoorTempC: 28,
    outdoorTempC: 38,
    relativeHumidityPct: 45,
    occupancy: 'present',
    climateProfile: 'balanced',
    coolingType: 'ac',
    setpointC: 26,
    quietMode: false,
    assignedGatewayId: defaultGw,
    thresholdKg: 10,
    localAlarmEnabled: false,
    sharedSirenEnabled: true,
    acInstalled: true,
    coolerInstalled: false,
    coolerThresholdPct: 65,
    pcInstalled: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const generatedFanId = generateDeviceId('FAN', identity.id || 'ROOM');

  const steps: { key: WizardStep; label: string; number: number }[] = [
    { key: 'identity', label: 'Identity', number: 1 },
    { key: 'edition', label: 'Edition', number: 2 },
    { key: 'config', label: 'Configuration', number: 3 },
    { key: 'review', label: 'Review & Create', number: 4 },
  ];

  const handleNext = () => {
    if (currentStep === 'identity') {
      const newErrors: Record<string, string> = {};
      if (!identity.name.trim()) newErrors.name = 'Room name is required.';
      if (!identity.id.trim()) newErrors.id = 'Room ID is required.';
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setCurrentStep('edition');
    } else if (currentStep === 'edition') {
      // Set edition-specific default devices
      if (edition === 'smart-care') {
        setConfig((prev) => ({
          ...prev,
          acInstalled: false,
          pcInstalled: false,
        }));
      } else {
        setConfig((prev) => ({
          ...prev,
          acInstalled: true,
          pcInstalled: true,
        }));
      }
      setCurrentStep('config');
    } else if (currentStep === 'config') {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'edition') setCurrentStep('identity');
    else if (currentStep === 'config') setCurrentStep('edition');
    else if (currentStep === 'review') setCurrentStep('config');
  };

  const handleCreate = () => {
    const propertyId = properties[0]?.id || 'prop-default';
    const now = new Date().toISOString();
    const isSmartHome = edition === 'smart-home';

    const deviceIds = [generatedFanId];
    if (config.acInstalled) deviceIds.push(`AC-${identity.id}`);
    if (config.coolerInstalled) deviceIds.push(`COOLER-${identity.id}`);

    const newRoom: Room = {
      id: identity.id,
      propertyId,
      name: identity.name,
      block: identity.block,
      floor: identity.floor,
      notes: identity.notes,
      edition,
      deviceIds,
      gatewayId: edition === 'smart-care' ? config.assignedGatewayId : undefined,
      config: {
        initialIndoorTempC: config.initialIndoorTempC,
        outdoorTempC: config.outdoorTempC,
        relativeHumidityPct: config.relativeHumidityPct,
        occupancy: config.occupancy,
        occupancyCount: config.occupancy === 'present' ? 1 : 0,
        climateProfile: config.climateProfile,
        fanDeviceId: generatedFanId,
        acInstalled: config.acInstalled,
        coolerInstalled: config.coolerInstalled,
        pcInstalled: config.pcInstalled,
        fanConfig: {
          speed: isSmartHome ? 'low' : 'off',
          autoMode: isSmartHome,
          quietMode: config.quietMode,
          quietSpeedLimit: 'low',
          powerWattsBySpeed: DEFAULT_FAN_POWER_WATTS,
        },
        coolingConfig: config.acInstalled
          ? {
              type: 'ac',
              enabled: true,
              setpointC: config.setpointC,
              compressorState: 'resting',
              powerWattsByState: DEFAULT_AC_POWER_WATTS,
            }
          : undefined,
        coolerConfig: config.coolerInstalled
          ? {
              enabled: false,
              highHumidityThresholdPct: config.coolerThresholdPct || 65,
            }
          : undefined,
        smartCareConfig:
          edition === 'smart-care'
            ? {
                illustrativeThresholdKg: config.thresholdKg,
                loadKg: 0,
                loadPlacedOnFan: false,
                radioOnline: true,
                localAlarmEnabled: config.localAlarmEnabled,
                localAlarmAvailable: true,
                sharedSirenEnabled: config.sharedSirenEnabled,
                assignedGatewayId: config.assignedGatewayId,
              }
            : undefined,
      },
      createdAt: now,
      updatedAt: now,
    };

    createRoom(newRoom);
    addToast({
      title: 'Room Created Successfully',
      description: `Entered simulator for ${newRoom.name} (${newRoom.edition}).`,
      type: 'success',
    });
    navigate(`/rooms/${newRoom.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <PageHeader
        title="Add Virtual Room"
        subtitle="Step-by-step configuration wizard for SmartAir digital-twin room deployment."
        actions={
          <button
            onClick={() => navigate('/rooms')}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        }
      />

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between relative pb-6 border-b border-slate-800">
        {steps.map((st, idx) => {
          const isActive = st.key === currentStep;
          const isDone =
            (st.key === 'identity' && currentStep !== 'identity') ||
            (st.key === 'edition' && (currentStep === 'config' || currentStep === 'review')) ||
            (st.key === 'config' && currentStep === 'review');

          return (
            <div key={st.key} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isDone
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-950'
                    : isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500 ring-2 ring-cyan-500/20'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : st.number}
              </div>
              <span
                className={`text-sm font-semibold hidden sm:inline ${
                  isActive ? 'text-white' : isDone ? 'text-cyan-400' : 'text-slate-500'
                }`}
              >
                {st.label}
              </span>
              {idx < steps.length - 1 && (
                <div className="w-8 sm:w-16 h-0.5 bg-slate-800 ml-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[360px]">
        {currentStep === 'identity' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-['Outfit'] text-white">Step 1 — Room Identity</h3>
            <p className="text-sm text-slate-400">
              Provide a human-readable display name and unique immutable room identifier.
            </p>
            <div className="pt-2">
              <RoomIdentityForm
                data={identity}
                onChange={(up) => setIdentity((prev) => ({ ...prev, ...up }))}
                errors={errors}
              />
            </div>
          </div>
        )}

        {currentStep === 'edition' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-['Outfit'] text-white">Step 2 — Select Edition</h3>
            <p className="text-sm text-slate-400">
              Each room operates under one distinct commercial edition with tailored simulation models.
            </p>
            <div className="pt-2">
              <EditionSelector selectedEdition={edition} onSelectEdition={setEdition} />
            </div>
          </div>
        )}

        {currentStep === 'config' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-['Outfit'] text-white">
              Step 3 — {edition === 'smart-home' ? 'Smart Home' : 'Smart Care'} Parameters
            </h3>
            <p className="text-sm text-slate-400">
              Set starting environmental conditions and edition-specific policies or routing.
            </p>
            <div className="pt-2">
              <RoomConfigForm
                edition={edition}
                data={config}
                onChange={(up) => setConfig((prev) => ({ ...prev, ...up }))}
              />
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-['Outfit'] text-white">Step 4 — Review & Deploy</h3>
            <p className="text-sm text-slate-400">
              Verify room parameters before registering into the virtual workspace.
            </p>
            <div className="pt-2">
              <RoomConfigReview
                edition={edition}
                identity={identity}
                config={config}
                generatedFanId={generatedFanId}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={handleBack}
          disabled={currentStep === 'identity'}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            currentStep === 'identity'
              ? 'opacity-0 pointer-events-none'
              : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {currentStep !== 'review' ? (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Create Room & Enter Simulator</span>
          </button>
        )}
      </div>
    </div>
  );
};
