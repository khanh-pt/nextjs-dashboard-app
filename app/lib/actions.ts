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
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const data = CreateInvoice.parse(Object.fromEntries(formData.entries()));
  const amountInCents = data.amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${data.customerId}, ${amountInCents}, ${data.status}, ${date})
    `;
  } catch (error) {
    log('Error inserting invoice:', error);
    throw new Error(`Database Error: ${error}`);
  }

  // revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const data = UpdateInvoice.parse(Object.fromEntries(formData.entries()));
  const amountInCents = data.amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${data.customerId},
          amount = ${amountInCents},
          status = ${data.status}
      WHERE id = ${id}
    `;
  } catch (error) {
    log('Error updating invoice:', error);
    throw new Error(`Database Error: ${error}`);
  }

  // revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    log('Error deleting invoice:', error);
    throw new Error(`Database Error: ${error}`);
  }

  revalidatePath('/dashboard/invoices');
}
