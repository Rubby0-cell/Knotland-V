import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPlans } from "@workspace/api-client-react";
import { Crown } from "lucide-react";

export default function PlansPage() {
  const { data: plans, isLoading } = useGetPlans();

  return (
    <PublicLayout>
      <div className="flex-1 relative pt-40 pb-32 px-4">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(196,26,26,0.12),transparent_60%)]" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/70 mb-5 font-sans">Choose Your Access</p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6">Membership Tiers</h1>
            <p className="font-display italic text-white/40 text-xl max-w-lg mx-auto">Each tier reveals a deeper layer of the vault. Ascend when you're ready.</p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[500px] rounded-sm bg-white/4" />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {plans?.map((plan) => {
                const isPopular = plan.tier === "vip";
                return (
                  <div
                    key={plan.id}
                    data-testid={`card-plan-${plan.id}`}
                    className={`relative rounded-sm flex flex-col transition-all duration-500 hover:-translate-y-1 ${isPopular ? "glass-red border border-primary/30 glow-red" : "glass border border-white/5 hover:border-white/10"}`}
                  >
                    {isPopular && <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />}
                    {isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="text-xs uppercase tracking-[0.3em] bg-primary text-white px-4 py-1 font-sans font-semibold flex items-center gap-1.5">
                          <Crown className="w-3 h-3" /> Most Popular
                        </span>
                      </div>
                    )}
                    <div className="p-8 flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-primary/70 mb-2 font-sans">{plan.tier} tier</p>
                      <h3 className="font-serif text-2xl text-white mb-6">{plan.name}</h3>
                      <div className="flex items-end gap-1 mb-6">
                        <span className="text-5xl font-bold text-white font-serif">${plan.price_usd}</span>
                        <span className="text-white/30 text-sm mb-2 font-sans">{plan.duration_days ? "/mo" : " once"}</span>
                      </div>
                      <p className="text-white/40 text-sm leading-relaxed mb-8">{plan.description}</p>
                      <ul className="space-y-4">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-3 text-sm">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                            <span className="text-white/50">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-8 pt-0">
                      <Link href="/register">
                        <Button
                          data-testid={`button-plan-${plan.id}`}
                          className={`w-full h-12 text-xs uppercase tracking-[0.3em] font-sans font-semibold ${isPopular ? "bg-primary hover:bg-primary/90 text-white border-0 animate-pulse-glow" : "bg-transparent border border-white/15 text-white/60 hover:bg-white/5 hover:border-white/30 hover:text-white"}`}
                          variant={isPopular ? "default" : "outline"}
                        >
                          Get {plan.name}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-16 text-center">
            <p className="text-white/25 text-sm mb-4">Already a member? Submit your payment proof to activate your plan.</p>
            <Link href="/submit-payment">
              <Button variant="outline" className="text-xs uppercase tracking-[0.2em] border-white/15 text-white/50 hover:bg-white/5 hover:border-white/30 hover:text-white/80 bg-transparent">
                Submit Payment Proof
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
