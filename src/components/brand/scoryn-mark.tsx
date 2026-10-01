import { cn } from '@/lib/utils';

export function ScorynMark({ className = '', size = 36 }: { className?: string; size?: number }) {
  return <span
    className={cn('relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[28%] border border-magenta/30 bg-[#120b0f] shadow-[0_0_30px_rgba(197,29,111,.24)]', className)}
    style={{ width: size, height: size }}
    aria-label="Scoryn"
  >
    <span className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(240,164,207,.45),transparent_32%),linear-gradient(145deg,#35101f_0%,#8e1550_45%,#d63a86_100%)]" />
    <svg className="relative h-[62%] w-[62%] drop-shadow-[0_0_8px_rgba(255,255,255,.2)]" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M47.5 17.5C41 11.5 29.5 10.5 22 15.5C15 20.2 14.4 28.2 21.8 31.5C26.2 33.5 31.2 33.2 36 34.5C41.8 36 43 41.5 38.5 45.3C33.5 49.5 24.2 48 18.5 42.5" stroke="white" strokeWidth="6" strokeLinecap="round"/>
      <path d="M49 15L45.5 24.5L36 21" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity=".85"/>
    </svg>
  </span>;
}
