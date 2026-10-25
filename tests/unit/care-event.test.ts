import { describe, it, expect } from 'vitest';
import { evaluateLoadCrossing } from '@/simulation/smart-care/load-event';

describe('Smart Care Abnormal-Load Event Logic (Phase 9)', () => {
  const baseParams = {
    simTimeMs: 1000,
    currentLoadKg: 8.0,
    thresholdKg: 10.0,
    isPlacedOnFan: true,
    wasPreviouslyAboveThreshold: false,
    propertyId: 'prop-demo',
    roomId: 'room-care-a204',
    fanDeviceId: 'SA-CARE-A204',
    assignedGatewayId: 'gw-demo-01',
    localAlarmEnabled: true,
    localAlarmAvailable: true,
    radioOnline: true,
  };

  it('does not trigger event when load is below or equal to threshold', () => {
    // 8 kg <= 10 kg
    const resBelow = evaluateLoadCrossing(baseParams);
    expect(resBelow.isEventTriggered).toBe(false);
    expect(resBelow.careEvent).toBeNull();

    // Exactly 10 kg (boundary: loadKg > thresholdKg)
    const resEqual = evaluateLoadCrossing({ ...baseParams, currentLoadKg: 10.0 });
    expect(resEqual.isEventTriggered).toBe(false);
    expect(resEqual.careEvent).toBeNull();
  });

  it('triggers exactly one event when load crosses above threshold', () => {
    // 12 kg > 10 kg
    const resCrossed = evaluateLoadCrossing({ ...baseParams, currentLoadKg: 12.0 });
    expect(resCrossed.isEventTriggered).toBe(true);
    expect(resCrossed.isNowAboveThreshold).toBe(true);
    expect(resCrossed.careEvent).not.toBeNull();
    expect(resCrossed.careEvent?.virtualLoadKg).toBe(12.0);
    expect(resCrossed.careEvent?.thresholdKg).toBe(10.0);
    expect(resCrossed.careEvent?.status).toBe('active');
    expect(resCrossed.localAlarmActive).toBe(true);
  });

  it('prevents event flooding: does not duplicate events on subsequent ticks', () => {
    // Second tick: wasPreviouslyAboveThreshold is now TRUE
    const resSubsequent = evaluateLoadCrossing({
      ...baseParams,
      currentLoadKg: 12.0,
      wasPreviouslyAboveThreshold: true,
    });
    expect(resSubsequent.isEventTriggered).toBe(false);
    expect(resSubsequent.careEvent).toBeNull();
    expect(resSubsequent.isNowAboveThreshold).toBe(true);
  });

  it('resets latch when load is removed, allowing subsequent re-arm event', () => {
    // Weight removed from fan
    const resRemoved = evaluateLoadCrossing({
      ...baseParams,
      isPlacedOnFan: false,
      wasPreviouslyAboveThreshold: true,
    });
    expect(resRemoved.isNowAboveThreshold).toBe(false);

    // Re-placed weight above threshold triggers new event
    const resReplaced = evaluateLoadCrossing({
      ...baseParams,
      currentLoadKg: 15.0,
      isPlacedOnFan: true,
      wasPreviouslyAboveThreshold: false,
    });
    expect(resReplaced.isEventTriggered).toBe(true);
    expect(resReplaced.careEvent?.virtualLoadKg).toBe(15.0);
  });

  it('handles radio offline path properly without blocking local detection', () => {
    const resRadioOffline = evaluateLoadCrossing({
      ...baseParams,
      currentLoadKg: 14.0,
      radioOnline: false, // Radio faulted
    });

    expect(resRadioOffline.isEventTriggered).toBe(true);
    expect(resRadioOffline.careEvent?.stages.find((s) => s.id === 'detection')?.status).toBe('success');
    expect(resRadioOffline.careEvent?.stages.find((s) => s.id === 'radio-transmission')?.status).toBe('failed');
    expect(resRadioOffline.radioStatus).toBe('failed');
    // Local alarm still succeeds
    expect(resRadioOffline.localAlarmActive).toBe(true);
  });
});
