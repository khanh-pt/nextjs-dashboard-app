import { Suspense } from 'react';
import { Metadata } from 'next';
import LoginForm from '@/app/user/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <main className="h-screen flex items-center">
      <div className="mx-auto max-w-[400px]">
        <Suspense
          fallback={<div className="text-sm text-gray-500">Loading...</div>}
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
