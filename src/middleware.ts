import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { authenticate, logout, softLogout } from '@/actions/auth';
import { TokenExpired } from './lib/auth';

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const token = (await cookies()).get('fady-access-token')?.value;

  //  NOTE: Redirect the user to the home page if they're authenticated
  if (pathname.includes('auth')) {
    if (token) {
      return redirect(request, '/');
    }

    return NextResponse.next();
  }

  //  NOTE: Redirect the user to the login page if they're not authenticated
  try {
    await authenticate(token);
  } catch (e) {
    if (e instanceof TokenExpired) {
      await softLogout();
      return redirect(request, '/auth/login');
    }

    return redirect(request, '/auth/login');
  }

  //  NOTE: Since we only have a single page in this dashboard so far, we redirect the user to the prepaid cards page
  if (pathname === '/') {
    return redirect(request, '/prepaid-cards/templates');
  }

  return NextResponse.next();
}

/**
 * Redirects the user to a different page within the application preserving localization.
 *
 * @param {NextRequest} request - The incoming request object.
 * @param {string} pathname - The pathname to redirect to.
 * @return {NextResponse} The redirect response.
 */
function redirect(request: NextRequest, pathname: string): NextResponse {
  const nextUrl = request.nextUrl;
  nextUrl.pathname = pathname;

  return NextResponse.redirect(nextUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
