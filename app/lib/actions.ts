'use server';

import { log } from 'console';
import { z } from 'zod';
import postgres from 'postgres';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    message: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    message: 'Please select an invoice status.',
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return `Something went wrong. ${error}`;
      }
    }
    throw error;
  }
}

export async function createInvoice(prevState: State, formData: FormData) {
  log({ formData: Object.fromEntries(formData.entries()) });
  const validatedFields = CreateInvoice.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const data = validatedFields.data;

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

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const data = validatedFields.data;
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
