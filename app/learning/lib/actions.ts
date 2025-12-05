'use server';

import { log } from 'console';
import { z } from 'zod';
import postgres from 'postgres';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, {
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
  formData: {
    customerId?: string;
    amount?: number;
    status?: 'pending' | 'paid';
  };
  errors: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const DeleteInvoice = FormSchema.pick({
  id: true,
});

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
      formData: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    } as State;
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

  redirect('/learning/dashboard/invoices');
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
      formData: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    } as State;
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

  redirect('/learning/dashboard/invoices');
}

export async function deleteInvoice(prevState: State, formData: FormData) {
  const validatedFields = DeleteInvoice.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return {
      formData: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Delete Invoice.',
    } as State;
  }

  const data = validatedFields.data;
  const invoiceId = data.id;

  try {
    await sql`DELETE FROM invoices WHERE id = ${invoiceId}`;
  } catch (error) {
    log('Error deleting invoice:', error);
    throw new Error(`Database Error: ${error}`);
  }

  redirect('/learning/dashboard/invoices');
}

// customers
const CustomerFormSchema = z.object({
  id: z.string(),
  // length name must be at least 1 character
  name: z.string().min(1, { message: 'Please enter a name.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  image_key: z.string().optional(),
});

export type CustomerState = {
  formData: {
    name?: string;
    email?: string;
    image_key?: string;
  };
  errors: {
    name?: string[];
    email?: string[];
    image_key?: string[];
  };
  message: string | null;
};

const CreateCustomer = CustomerFormSchema.omit({ id: true });
const DeleteCustomer = CustomerFormSchema.pick({ id: true });

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData,
) {
  log({ formData: Object.fromEntries(formData.entries()) });
  const validatedFields = CreateCustomer.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return {
      formData: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Customer.',
    } as CustomerState;
  }

  const data = validatedFields.data;

  try {
    console.log('Inserting customer:', data);
    // Store the image_key in the image_url column
    // If no image_key provided, use default
    const imageUrl = data.image_key || '/customers/evil-rabbit.png';
    await sql`
      INSERT INTO customers (name, email, image_url)
        VALUES (${data.name}, ${data.email}, ${imageUrl})
    `;
  } catch (error) {
    log('Error inserting customer:', error);
    throw new Error(`Database Error: ${error}`);
  }

  redirect('/learning/dashboard/customers');
}

export async function deleteCustomer(prevState: State, formData: FormData) {
  const validatedFields = DeleteCustomer.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!validatedFields.success) {
    return {
      formData: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Delete Customer.',
    } as State;
  }

  const data = validatedFields.data;

  try {
    await sql`DELETE FROM customers WHERE id = ${data.id}`;
  } catch (error) {
    log('Error deleting customer:', error);
    throw new Error(`Database Error: ${error}`);
  }

  redirect('/learning/dashboard/customers');
}
