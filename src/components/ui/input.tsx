import * as React from 'react';
import { cn } from '@/lib/utils';
export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, ...props }, ref) => <input ref={ref} className={cn('h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/25 focus:ring-2 focus:ring-magenta/20', className)} {...props} />);
Input.displayName = 'Input';
