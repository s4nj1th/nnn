import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        accent: 'border-transparent bg-nnn-yellow/20 text-nnn-yellow',
        success: 'border-transparent bg-nnn-success/20 text-nnn-success',
        warning: 'border-transparent bg-nnn-warning/20 text-nnn-warning',
        input: 'border-transparent bg-blue-500/20 text-blue-400',
        hidden: 'border-transparent bg-nnn-yellow/20 text-nnn-yellow',
        output: 'border-transparent bg-nnn-success/20 text-nnn-success',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
