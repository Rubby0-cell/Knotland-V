import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getAdminGetPaymentsQueryKey, getAdminGetStatsQueryKey } from "@workspace/api-client-react";

/**
 * Subscribes to Supabase Realtime inserts on payment_proofs.
 * When a new payment arrives, invalidates the admin payments/stats cache
 * and calls onNewPayment so the caller can show a toast.
 *
 * Only mount this hook for admin users.
 */
export function useAdminPaymentWatch(onNewPayment: (planName?: string) => void) {
  const queryClient = useQueryClient();
  const cbRef = useRef(onNewPayment);
  cbRef.current = onNewPayment;

  useEffect(() => {
    const channel = supabase
      .channel("admin-payment-watch")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "payment_proofs",
        },
        (payload) => {
          // Invalidate cached queries so UI updates instantly
          queryClient.invalidateQueries({ queryKey: getAdminGetPaymentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
          cbRef.current((payload.new as { notes?: string })?.notes ?? undefined);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
