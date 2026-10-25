import { CareEvent } from '@/domain/types';

export const ExportService = {
  exportEventsToCsv(events: CareEvent[]): string {
    const headers = [
      'Event ID',
      'Status',
      'Room ID',
      'Device ID',
      'Virtual Load (kg)',
      'Threshold (kg)',
      'Sim Time (ms)',
      'Created ISO',
      'Radio Status',
      'Gateway Status',
      'Siren Status',
      'Acknowledged By',
      'Resolved By',
      'Resolution Note',
    ];

    const rows = events.map((e) => [
      `"${e.id}"`,
      `"${e.status}"`,
      `"${e.roomId}"`,
      `"${e.deviceId}"`,
      e.virtualLoadKg,
      e.thresholdKg,
      e.createdAtSimMs,
      `"${e.createdAtIso}"`,
      `"${e.radioStatus}"`,
      `"${e.gatewayStatus}"`,
      `"${e.sharedSirenStatus}"`,
      `"${e.acknowledgement?.acknowledgedByLabel || ''}"`,
      `"${e.resolution?.resolvedByLabel || ''}"`,
      `"${(e.resolution?.note || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  downloadFile(content: string, filename: string, mimeType: string): void {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
