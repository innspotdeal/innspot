import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ERP_API_KEY_HEADER, ERP_CLIENT_HEADER, verifyErpKey } from "@/lib/erp-auth";

// لوحة التحكم الوحيدة هي الـ ERP: راوتس /api/admin بتتفتح بمفتاحه بس (X-API-Key).
// مفيش صفحات أدمن ولا تسجيل دخول على الموقع نفسه
export function proxy(request: NextRequest) {
  // بنمسح الهيدر ده من أي طلب جاي من برّه قبل أي حاجة، عشان محدش يزوّره
  // ويوهم الراوت إنه الـ ERP — إحنا بس اللي بنحطه بعد التحقق من المفتاح
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.delete(ERP_CLIENT_HEADER);

  const erpClient = verifyErpKey(request.headers.get(ERP_API_KEY_HEADER));
  if (!erpClient) {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });
  }

  forwardedHeaders.set(ERP_CLIENT_HEADER, erpClient.name);
  return NextResponse.next({ request: { headers: forwardedHeaders } });
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
