// middleware.ts  (place at project root, same level as app/)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const token = request.cookies.get("token")?.value;
	const { pathname } = request.nextUrl;

	const isAuthPage =
		pathname === "/login" ||
		pathname === "/register" ||
		pathname.startsWith("/login/") ||
		pathname.startsWith("/register/");

	const isDashboardPage = pathname.startsWith("/dashboard");

	// Unauthenticated user trying to access dashboard
	if (isDashboardPage && !token) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("from", pathname); // preserve original destination
		return NextResponse.redirect(loginUrl);
	}

	// Authenticated user trying to access login/register
	if (isAuthPage && token) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/login", "/register"],
};
