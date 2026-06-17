// Email notifications are handled via Supabase Auth + in-app realtime alerts.
// This module is intentionally a no-op — no SMTP required.

export async function notifyAdminNewPayment(_opts: {
  planName: string;
  notes?: string | null;
  submittedAt: string;
}): Promise<void> {
  // In-app notification delivered via Supabase Realtime subscription on
  // payment_proofs table (see protected-layout.tsx AdminPaymentWatcher).
}
