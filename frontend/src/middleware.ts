import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that don't require authentication
const publicPaths = ['/login', '/register'];

// List of paths that require authentication
const protectedPaths = [
    '/dashboard',
    '/crm',
    '/sales',
    '/marketing',
    '/support',
    '/workflows',
    '/settings',
];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Check if the path is public
    if (publicPaths.includes(pathname)) {
        // If user is already authenticated and tries to access login/register, redirect to dashboard
        if (token && (pathname === '/login' || pathname === '/register')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Check if the path requires authentication
    if (protectedPaths.some((path) => pathname.startsWith(path))) {
        // If no token is present, redirect to login
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}; 