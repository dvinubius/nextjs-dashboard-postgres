'use server';

import { sql } from "@vercel/postgres";
import { CreateInvoice, InvoiceSchema, UpdateInvoice } from "./definitions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { z } from "zod";
import bcrypt from 'bcrypt';
import { getUser } from "./data";

// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or Invalid Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create invoice.');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    }
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or Invalid Fields. Failed to Update Invoice.',
    };
  }
    
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
    
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update invoice.');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete invoice.');
  }
  
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
  } catch (error) {
    if ((error as Error).message.includes('CredentialsSignin')) {
      return 'CredentialSignin';
    }
    throw error;
  }
}

export async function signup(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const credentials = Object.fromEntries(formData);

    const parsedCredentials = z
      .object({ email: z.string().email(), password: z.string().min(6), name: z.string().min(3) })
      .safeParse(credentials);
    
    if (parsedCredentials.success) {
      const { email, password, name } = parsedCredentials.data;

      const user = await getUser(email);
      if (user) {
        throw new Error('CredentialsSignup: User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await sql`
        INSERT INTO users (email, password, name)
        VALUES (${email}, ${hashedPassword}, ${name})
      `;
    } else {
      throw new Error('CredentialsSignup: Invalid Credentials');
    }

    // authenticate user
    await signIn('credentials', credentials);
    redirect('/dashboard');
  } catch (error) {
    if ((error as Error).message.includes('CredentialsSignup')) {
      return 'CredentialsSignup';
    }
    throw error;
  }
}