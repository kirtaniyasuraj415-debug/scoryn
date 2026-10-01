import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: {
      default: 'bg-white text-black hover:bg-zinc-200',
      accent: 'bg-magenta text-white hover:brightness-110 shadow-[0_0_30px_rgba(197,29,111,.25)]',
      outline: 'border border-white/12 bg-white/[.03] text-white hover:bg-white/[.07]',
      ghost: 'text-zinc-300 hover:bg-white/[.06] hover:text-white'
    },
    size: { default: 'h-11 px-5', sm: 'h-9 px-4', lg: 'h-13 px-7 text-base' }
  },
  defaultVariants: { variant: 'default', size: 'default' }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});
Button.displayName = 'Button';
