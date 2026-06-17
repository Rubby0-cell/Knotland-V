import { ProtectedLayout } from "@/components/layout/protected-layout";
import { useProtectedRoute } from "@/hooks/use-protected-route";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 13.772l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.958.787z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.014.04.031.052a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

const COMMUNITIES = [
  {
    id: "telegram",
    name: "Telegram",
    handle: "@knotland",
    description:
      "Our most active channel. Get real-time announcements, exclusive drops, private discussion threads, and direct access to the Knot Land inner circle.",
    cta: "Join Channel",
    href: "https://t.me/+Sgj4-pjVnys1OWFk",
    Icon: TelegramIcon,
    accent: "from-[#229ED9]/10 to-transparent",
    border: "hover:border-[#229ED9]/30",
    iconColor: "text-[#229ED9]",
    badge: "Most Active",
  },
  {
    id: "discord",
    name: "Discord",
    handle: "discord.gg/knotland",
    description:
      "The private members' server. Separate channels for each membership tier, live events, AMA sessions, and a members-only lounge for VIP conversations.",
    cta: "Join Server",
    href: "https://discord.gg/",
    Icon: DiscordIcon,
    accent: "from-[#5865F2]/10 to-transparent",
    border: "hover:border-[#5865F2]/30",
    iconColor: "text-[#5865F2]",
    badge: "Members Lounge",
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    handle: "@knotland",
    description:
      "Follow for curated content previews, cultural commentary, and public-facing announcements. The official voice of Knot Land to the outside world.",
    cta: "Follow Now",
    href: "https://x.com/maxwelsaithtech",
    Icon: XIcon,
    accent: "from-white/5 to-transparent",
    border: "hover:border-white/20",
    iconColor: "text-white",
    badge: "Official",
  },
];

export default function CommunityPage() {
  return <ProtectedLayout><CommunityContent /></ProtectedLayout>;
}

function CommunityContent() {
  useProtectedRoute();

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="pb-8 border-b border-white/5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-2 font-sans">Members Only</p>
        <h1 className="font-serif text-4xl font-bold text-white">Community Hub</h1>
        <p className="text-white/30 mt-2 text-sm max-w-xl">
          As a Knot Land member you have access to our private communities. Join the conversation, connect with fellow members, and stay ahead of every drop.
        </p>
      </div>

      {/* Community Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {COMMUNITIES.map((c) => (
          <div
            key={c.id}
            className={`relative glass rounded-sm overflow-hidden border border-transparent ${c.border} transition-all duration-300 group flex flex-col`}
          >
            {/* Gradient accent */}
            <div className={`absolute inset-0 bg-gradient-to-br ${c.accent} pointer-events-none`} />

            <div className="relative p-7 flex flex-col flex-1 gap-5">
              {/* Icon + Badge */}
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-sm border border-white/5 flex items-center justify-center bg-white/3 group-hover:bg-white/6 transition-colors`}>
                  <c.Icon className={`w-6 h-6 ${c.iconColor}`} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-sans border border-white/8 rounded-sm px-2 py-0.5">
                  {c.badge}
                </span>
              </div>

              {/* Name + Handle */}
              <div>
                <h2 className="font-serif text-xl text-white mb-0.5">{c.name}</h2>
                <p className="text-xs text-white/25 font-sans tracking-widest">{c.handle}</p>
              </div>

              {/* Description */}
              <p className="text-sm text-white/40 leading-relaxed flex-1">{c.description}</p>

              {/* CTA */}
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto"
              >
                <button className="w-full text-xs uppercase tracking-[0.2em] font-sans font-semibold border border-white/10 text-white/50 hover:text-white hover:border-white/25 hover:bg-white/4 transition-all duration-200 rounded-sm py-3 px-4">
                  {c.cta} →
                </button>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Community Guidelines */}
      <div className="glass rounded-sm p-8 border border-white/5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/50 mb-4 font-sans">Community Standards</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { title: "Discretion", body: "Everything shared within our communities is strictly confidential. What happens in the vault, stays in the vault." },
            { title: "Respect", body: "All members are here by invitation or verified membership. Treat fellow members with the respect befitting this space." },
            { title: "Exclusivity", body: "Our communities are private. Do not share invite links or channel content with non-members." },
          ].map((item) => (
            <div key={item.title}>
              <p className="font-serif text-sm text-white/70 mb-2">{item.title}</p>
              <p className="text-xs text-white/30 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
