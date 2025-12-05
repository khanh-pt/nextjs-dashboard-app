import Form from '@/app/learning/ui/invoices/edit-form';
import Breadcrumbs from '@/app/learning/ui/invoices/breadcrumbs';
import {
  fetchCustomerById,
  fetchCustomers,
  fetchInvoiceById,
} from '@/app/learning/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit   Invoice',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(1),
  ]);

  if (!invoice) {
    notFound();
  }

  const customer = await fetchCustomerById(invoice.customer_id);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/learning/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/learning/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form
        invoice={invoice}
        customers={customers}
        selectedCustomer={customer}
      />
    </main>
  );
}
