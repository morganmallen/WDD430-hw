import type { NextAuthConfig } from 'next-auth';

// Log environment variable presence for debugging
console.log('Auth Config - Environment Variables:');
console.log('- NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('- AUTH_SECRET exists:', !!process.env.AUTH_SECRET);
console.log('- NEXTAUTH_URL exists:', !!process.env.NEXTAUTH_URL);

// Get the secret from either environment variable
const getSecret = () => {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    console.error('Missing authentication secret! Please set NEXTAUTH_SECRET in your environment variables.');
  }
  return secret || 'INSECURE_DEFAULT_SECRET_DO_NOT_USE_IN_PRODUCTION';
};

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
  // Explicitly set the secret
  secret: getSecret(),
} satisfies NextAuthConfig;