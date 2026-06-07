'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function BackButton({
  href,
  label = 'Back',
  className,
  size = 'sm',
}: BackButtonProps) {
  const router = useRouter();

  if (href) {
    return (
      <Link href={href}>
        <Button variant="ghost" size={size} className={cn('nnn-back-btn', className)}>
          <ArrowLeft className="h-4 w-4" />
          {label}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn('nnn-back-btn', className)}
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
