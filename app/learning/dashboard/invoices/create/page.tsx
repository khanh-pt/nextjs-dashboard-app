import Form from '@/app/learning/ui/invoices/create-form';
import Breadcrumbs from '@/app/learning/ui/invoices/breadcrumbs';
import { fetchCustomers } from '@/app/learning/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Invoice',
};

export default async function Page() {
  const customers = await fetchCustomers(1);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/learning/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/learning/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      <Form initCustomers={customers} />
    </main>
  );
}
