'use server';

import { log } from 'console';
import { z } from 'zod';
import postgres from 'postgres';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  log(
    'Creating invoice with data:',
    typeof Object.fromEntries(formData.entries()),
  );

  const data = CreateInvoice.parse(Object.fromEntries(formData.entries()));

  const amountInCents = data.amount * 100;
  const date = new Date().toISOString().split('T')[0];
  log('Parsed invoice data:', data);
  log('amountInCents:', amountInCents);

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${data.customerId}, ${amountInCents}, ${data.status}, ${date})
  `;

  // revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}
