import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, getSession } from "@/lib/admin-auth";

// المسارات المسموحة لدور "sales" بس — أي حاجة تانية تحت /admin أو /api/admin ممنوعة عليه
const SALES_ALLOWED_PREFIXES = ["/admin/bookings", "/api/admin/bookings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = getSession(token);

  if (!session) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // حماية على مستوى السيرفر: مستخدم sales ممنوع من أي صفحة أدمن غير الحجوزات
  if (session.role === "sales") {
    const allowed = SALES_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (!allowed) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ ok: false, error: "غير مصرح لك بالوصول لده" }, { status: 403 });
      }
      const bookingsUrl = new URL("/admin/bookings", request.url);
      return NextResponse.redirect(bookingsUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
