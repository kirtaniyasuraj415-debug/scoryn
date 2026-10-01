import { cn } from '@/lib/utils';
export function Badge({ className, children }: { className?: string; children: React.ReactNode }) { return <span className={cn('inline-flex rounded-full border border-white/10 bg-white/[.04] px-2.5 py-1 text-[11px] font-medium text-zinc-300', className)}>{children}</span>; }
