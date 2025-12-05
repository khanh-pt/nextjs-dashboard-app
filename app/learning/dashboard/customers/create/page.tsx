import Form from '@/app/learning/ui/customers/create-form';
import Breadcrumbs from '@/app/learning/ui/invoices/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Customer',
};

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: '/learning/dashboard/customers' },
          {
            label: 'Create Customer',
            href: '/learning/dashboard/customers/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
