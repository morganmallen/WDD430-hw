import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import type { User } from "@/app/lib/definitions";
import bcrypt from "bcrypt";
import postgres from "postgres";

// Improve database connection with better error handling
async function getPostgresClient() {
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error("POSTGRES_URL environment variable is not defined");
    }
    return postgres(process.env.POSTGRES_URL, { ssl: "require" });
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    throw new Error("Failed to connect to database");
  }
}

async function getUser(email: string): Promise<User | undefined> {
  let sql;
  try {
    sql = await getPostgresClient();
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  } finally {
    // Close the connection to prevent connection leaks
    if (sql) {
      await sql.end().catch(console.error);
    }
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
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
          
          console.log("Invalid credentials");
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  // Handle both AUTH_SECRET and NEXTAUTH_SECRET for flexibility
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  // Enable debugging to help identify issues
  debug: true,
});