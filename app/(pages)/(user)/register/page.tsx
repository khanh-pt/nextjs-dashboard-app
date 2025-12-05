import RegisterForm from '@/app/user/components/auth/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
};

export default function RegisterPage() {
  return (
    <main className="h-screen flex items-center">
      <div className="mx-auto max-w-[400px]">
        <RegisterForm />
      </div>
    </main>
  );
}
