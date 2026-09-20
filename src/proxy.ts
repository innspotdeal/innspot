import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, getSession } from "@/lib/admin-auth";
import { ERP_API_KEY_HEADER, ERP_CLIENT_HEADER, verifyErpKey } from "@/lib/erp-auth";

// المسارات المسموحة لدور "sales" بس — أي حاجة تانية تحت /admin أو /api/admin ممنوعة عليه
const SALES_ALLOWED_PREFIXES = ["/admin/bookings", "/api/admin/bookings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // بنمسح الهيدر ده من أي طلب جاي من برّه قبل أي حاجة، عشان محدش يزوّره
  // ويوهم الراوت إنه الـ ERP — إحنا بس اللي بنحطه بعد التحقق من المفتاح
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.delete(ERP_CLIENT_HEADER);
  const pass = () => NextResponse.next({ request: { headers: forwardedHeaders } });

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  if (isLoginPage || isLoginApi) {
    return pass();
  }

  const isApi = pathname.startsWith("/api/admin");

  // مصادقة الـ ERP بمفتاح API — على راوتس الـ API بس.
  // صفحات /admin نفسها بتفضل بالجلسة العادية (المفتاح مش بديل لتسجيل الدخول
  // في المتصفح، ولازمش يوصله أصلًا)
  if (isApi) {
    const erpClient = verifyErpKey(request.headers.get(ERP_API_KEY_HEADER));
    if (erpClient) {
      // الـ ERP بيتعامل بصلاحية أدمن كاملة — هو لوحة التحكم
      forwardedHeaders.set(ERP_CLIENT_HEADER, erpClient.name);
      return pass();
    }
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = getSession(token);

  if (!session) {
    if (isApi) {
      return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // حماية على مستوى السيرفر: مستخدم sales ممنوع من أي صفحة أدمن غير الحجوزات
  if (session.role === "sales") {
    const allowed = SALES_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (!allowed) {
      if (isApi) {
        return NextResponse.json({ ok: false, error: "غير مصرح لك بالوصول لده" }, { status: 403 });
      }
      const bookingsUrl = new URL("/admin/bookings", request.url);
      return NextResponse.redirect(bookingsUrl);
    }
  }

  return pass();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
