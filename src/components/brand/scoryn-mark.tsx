import { ScanSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScorynMark({ className = '', size = 36 }: { className?: string; size?: number }) {
  return <span
    className={cn(
      'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[28%] border border-magenta/30 bg-gradient-to-br from-[#6f0c42] via-[#a81560] to-[#d33a86] text-white shadow-[0_0_28px_rgba(197,29,111,.24)]',
      className
    )}
    style={{ width: size, height: size }}
    aria-label="Scoryn"
  >
    <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.16),transparent_28%)]"/>
    <ScanSearch className="relative h-[50%] w-[50%] drop-shadow-[0_0_8px_rgba(255,255,255,.18)]"/>
  </span>;
}
