// Formatting utilities for Bintang Cake & Cookies (PRD §1, §12.4, SCHEMA.md §1)

/**
 * Format integer to Indonesian Rupiah representation: "Rp 95.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  const rounded = Math.round(amount);
  return 'Rp ' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Format ISO 8601 UTC date string into WITA (UTC+8) date: "DD/MM/YYYY"
 */
export function formatDateWITA(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    // Shift to WITA (UTC+8)
    const witaDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));
    const day = String(witaDate.getUTCDate()).padStart(2, '0');
    const month = String(witaDate.getUTCMonth() + 1).padStart(2, '0');
    const year = witaDate.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
}

/**
 * Format ISO 8601 UTC date string into WITA (UTC+8) date and time: "DD/MM/YYYY, HH:mm WITA"
 */
export function formatDateTimeWITA(isoString: string): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    const witaDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));
    const day = String(witaDate.getUTCDate()).padStart(2, '0');
    const month = String(witaDate.getUTCMonth() + 1).padStart(2, '0');
    const year = witaDate.getUTCFullYear();
    const hours = String(witaDate.getUTCHours()).padStart(2, '0');
    const mins = String(witaDate.getUTCMinutes()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${mins} WITA`;
  } catch {
    return '-';
  }
}

/**
 * Normalize phone number to Indonesian format: 628xxxxxxxxxx
 */
export function normalizeWhatsapp(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Format WhatsApp for human display: "0821-5873-9760"
 */
export function formatWhatsappDisplay(phone: string): string {
  const normalized = normalizeWhatsapp(phone);
  if (!normalized.startsWith('62')) return phone;
  const local = '0' + normalized.slice(2);
  if (local.length >= 10) {
    return `${local.slice(0, 4)}-${local.slice(4, 8)}-${local.slice(8)}`;
  }
  return local;
}

/**
 * Generate unique order number in format BCC-YYMMDD-NNNN (WITA timezone)
 */
export function generateOrderNumber(sequence: number, date: Date = new Date()): string {
  const witaDate = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  const yy = String(witaDate.getUTCFullYear()).slice(-2);
  const mm = String(witaDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(witaDate.getUTCDate()).padStart(2, '0');
  const nnnn = String(sequence).padStart(4, '0');
  return `BCC-${yy}${mm}${dd}-${nnnn}`;
}
