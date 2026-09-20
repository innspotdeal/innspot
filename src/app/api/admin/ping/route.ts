import { NextResponse } from "next/server";
import { ERP_CLIENT_HEADER } from "@/lib/erp-auth";

// فحص اتصال بسيط للـ ERP: لو رجّع 200 يبقى المفتاح صح والسيرفر شغال،
// ولو رجّع 401 يبقى المفتاح ناقص أو غلط.
// الحماية كلها في proxy.ts — الراوت ده مش بيشوف طلب غير مصرح أصلًا
export async function GET(request: Request) {
  return NextResponse.json({
    ok: true,
    client: request.headers.get(ERP_CLIENT_HEADER),
    time: new Date().toISOString(),
  });
}
