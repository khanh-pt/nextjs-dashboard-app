import LoginForm from '@/app/user/components/auth/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
  return (
    <main className="h-screen flex items-center">
      <div className="mx-auto max-w-[400px]">
        <LoginForm />
      </div>
    </main>
  );
}
