import NextAuth, { NextAuthConfig } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials'; 
import { z } from 'zod';
import { User } from './app/lib/definitions';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * from USERS where email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const nextAuthConfig: NextAuthConfig = {
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
 
          if (passwordsMatch) return user;
        }
  
        return null;
      },
    })
  ],
}

export const handler = NextAuth(nextAuthConfig);

export const { auth, signIn, signOut } = handler;