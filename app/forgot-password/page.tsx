'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaticPageLayout } from '@/components/layout/static-page-layout';
import { createClient } from '@/lib/supabase/client';
import { useUIStore } from '@/store/ui-store';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { addToast } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        setError('root', { message: error.message });
        return;
      }

      setSent(true);
      addToast({
        type: 'success',
        title: 'Reset link sent',
        description: 'Check your email for password reset instructions.',
      });
    } catch {
      setError('root', { message: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StaticPageLayout
      title="Reset Password"
      backHref="/login"
      backLabel="Sign in"
      headerAction={null}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm"
      >
        {sent ? (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              If an account exists for that email, we&apos;ve sent a password reset link.
              Check your inbox and spam folder.
            </p>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="you@example.com"
                error={errors.email?.message}
                autoComplete="email"
                autoFocus
              />

              {errors.root && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2" role="alert">
                  {errors.root.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="accent"
                size="lg"
                isLoading={isLoading}
              >
                {!isLoading && (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </StaticPageLayout>
  );
}
