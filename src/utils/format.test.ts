import { describe, it, expect } from 'vitest';
import {
  formatRupiah,
  formatDateWITA,
  formatDateTimeWITA,
  normalizeWhatsapp,
  formatWhatsappDisplay,
  generateOrderNumber,
} from './format';

describe('format utilities', () => {
  it('formats Rupiah integers properly', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
    expect(formatRupiah(95000)).toBe('Rp 95.000');
    expect(formatRupiah(1250000)).toBe('Rp 1.250.000');
    // @ts-expect-error test fallback
    expect(formatRupiah(null)).toBe('Rp 0');
  });

  it('normalizes WhatsApp phone numbers', () => {
    expect(normalizeWhatsapp('082158739760')).toBe('6282158739760');
    expect(normalizeWhatsapp('62821-5873-9760')).toBe('6282158739760');
    expect(normalizeWhatsapp('+62 821 5873 9760')).toBe('6282158739760');
    expect(normalizeWhatsapp('82158739760')).toBe('6282158739760');
  });

  it('formats WhatsApp display for human reading', () => {
    expect(formatWhatsappDisplay('6282158739760')).toBe('0821-5873-9760');
  });

  it('generates unique order number BCC-YYMMDD-NNNN in WITA', () => {
    const testDate = new Date('2026-11-09T00:00:00.000Z');
    const orderNum = generateOrderNumber(1, testDate);
    expect(orderNum).toBe('BCC-261109-0001');
    expect(generateOrderNumber(42, testDate)).toBe('BCC-261109-0042');
  });

  it('formats WITA date and datetime properly', () => {
    // 2026-11-09T02:30:00.000Z -> WITA (+8) is 10:30 WITA
    const iso = '2026-11-09T02:30:00.000Z';
    expect(formatDateWITA(iso)).toBe('09/11/2026');
    expect(formatDateTimeWITA(iso)).toBe('09/11/2026, 10:30 WITA');
  });
});
