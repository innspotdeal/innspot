// ============================================================
// منطق ومولّد HTML إيصال الحجز — منقول حرفيًا من أداة innspot-receipt-builder.html
// (جداول HTML + inline styles، مُوجَّه لبرامج البريد — ممنوع يتحول لـ Tailwind/flexbox)
// أي تعديل تصميمي على الإيصال لازم يتم هنا فقط، وبنفس الأسلوب (inline styles)
// ============================================================

import {
  RECEIPT_BOTTOM_NOTES,
  RECEIPT_CANCELLATION_RULES,
  RECEIPT_CANCELLATION_TITLE,
  RECEIPT_DAMAGES_TEXT,
  RECEIPT_DAMAGES_TITLE,
  RECEIPT_DEFAULT_LOGO_URL,
  RECEIPT_DOCUMENTS_ITEMS,
  RECEIPT_DOCUMENTS_NOTE,
  RECEIPT_DOCUMENTS_TITLE,
  RECEIPT_FOOTER_NOTE,
  RECEIPT_HERO_INTRO,
  RECEIPT_NEED_CHANGE_NOTE,
  RECEIPT_POLICIES_TITLE,
} from "@/data/booking-policies";

export type ReceiptData = {
  reference: string;
  guestName: string;
  property: string;
  location: string;
  checkIn: string;
  checkInTime: string;
  checkOut: string;
  checkOutTime: string;
  guests: string;
  nights: string;
  accommodation: number;
  extraLabel: string;
  extraAmount: number;
  paid: number;
  paidMethod: string;
  senderName: string;
  senderTitle: string;
  domain: string;
  logoUrl: string;
  whatsapp: string;
};

export function formatMoney(n: number): string {
  return n.toLocaleString("en-US");
}

// total = قيمة الإقامة + البند الإضافي · remaining = الإجمالي - المدفوع
export function computeBookingTotals(input: {
  accommodation: number;
  extraAmount: number;
  paid: number;
}): { total: number; remaining: number } {
  const total = input.accommodation + input.extraAmount;
  const remaining = total - input.paid;
  return { total, remaining };
}

// رقم مرجع تلقائي بصيغة INS-DDMM-XXXX (قابل للتعديل يدويًا بعد كده)
export function generateBookingReference(date: Date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `INS-${dd}${mm}-${rand}`;
}

function escapeHtml(value: string): string {
  return String(value).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
}

// صف اختياري في جدول تفاصيل الحجز — بيختفي تمامًا لو القيمة فاضية
function optionalRow(label: string, value: string, opts?: { boldValue?: boolean; firstColWidth?: string }) {
  if (!value.trim()) return "";
  const labelStyle = `padding:9px 0;color:#8A857D;${opts?.firstColWidth ? `width:${opts.firstColWidth};` : ""}`;
  const valueStyle = `padding:9px 0;color:#1F1F1F;${opts?.boldValue ? "font-weight:bold;" : ""}`;
  return `
          <tr><td style="${labelStyle}">${label}</td>
              <td style="${valueStyle}" align="right">${value}</td></tr>`;
}

export function buildReceiptHtml(raw: ReceiptData): string {
  const { total, remaining } = computeBookingTotals(raw);

  const d = {
    REF: escapeHtml(raw.reference),
    GUEST: escapeHtml(raw.guestName || "there"),
    PROPERTY: escapeHtml(raw.property),
    LOCATION: escapeHtml(raw.location),
    CHECKIN: escapeHtml(raw.checkIn),
    CHECKOUT: escapeHtml(raw.checkOut),
    CI_T: escapeHtml(raw.checkInTime),
    CO_T: escapeHtml(raw.checkOutTime),
    GUESTS: escapeHtml(raw.guests),
    NIGHTS: escapeHtml(raw.nights),
    EXTRA_LABEL: escapeHtml(raw.extraLabel),
    PAID_METHOD: escapeHtml(raw.paidMethod),
    SENDER_NAME: escapeHtml(raw.senderName),
    SENDER_TITLE: escapeHtml(raw.senderTitle),
    DOMAIN: escapeHtml(raw.domain),
    LOGO: escapeHtml(raw.logoUrl || RECEIPT_DEFAULT_LOGO_URL),
    WA: escapeHtml(raw.whatsapp),
    SUB: formatMoney(raw.accommodation),
    EX: formatMoney(raw.extraAmount),
    TOTAL: formatMoney(total),
    PAID: formatMoney(raw.paid),
    REM: formatMoney(remaining),
  };

  const propertyRow = optionalRow("Property", d.PROPERTY, { boldValue: true, firstColWidth: "44%" });
  const locationRow = optionalRow("Location", d.LOCATION);
  const checkInRow = raw.checkIn.trim()
    ? `
          <tr><td style="padding:9px 0;color:#8A857D;">Check-in</td>
              <td style="padding:9px 0;color:#1F1F1F;" align="right">${d.CHECKIN} · from ${d.CI_T}</td></tr>`
    : "";
  const checkOutRow = raw.checkOut.trim()
    ? `
          <tr><td style="padding:9px 0;color:#8A857D;">Check-out</td>
              <td style="padding:9px 0;color:#1F1F1F;" align="right">${d.CHECKOUT} · by ${d.CO_T}</td></tr>`
    : "";
  const guestsRow = optionalRow("Guests", d.GUESTS);
  const nightsRow = optionalRow("Nights", d.NIGHTS);

  const bookingRowsHtml = [propertyRow, locationRow, checkInRow, checkOutRow, guestsRow, nightsRow]
    .filter(Boolean)
    .join("");

  const extraRow =
    raw.extraAmount > 0 && raw.extraLabel.trim()
      ? `
          <tr>
            <td style="padding:8px 0;color:#8A857D;">${d.EXTRA_LABEL}</td>
            <td style="padding:8px 0;color:#1F1F1F;" align="right">${d.EX} EGP</td>
          </tr>`
      : "";

  const documentsItemsHtml = RECEIPT_DOCUMENTS_ITEMS.map(
    (item) => `&bull;&nbsp; <strong>${item.strong}</strong> ${item.text}<br>`
  ).join("\n            ");

  const cancellationRowsHtml = RECEIPT_CANCELLATION_RULES.map(
    (rule) => `
              <tr><td valign="top" style="padding:0 0 8px 0;color:${rule.color};font-weight:bold;width:150px;">${rule.when}</td>
                  <td valign="top" style="padding:0 0 8px 0;color:#4A463F;">${rule.text}</td></tr>`
  ).join("");

  const bottomNotesHtml = RECEIPT_BOTTOM_NOTES.map((note) => `&bull; ${note}<br>`).join("\n        ");

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F1EFEA;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;" dir="ltr">

  <tr><td align="center" style="padding:8px 0 20px 0;">
    <img src="${d.LOGO}" alt="InnSpot Tourism Agency" width="180" style="display:block;border:0;">
  </td></tr>
  <tr><td align="center" style="padding:0 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8A857D;">
    Need help? <a href="https://wa.me/${d.WA}" style="color:#F15A25;text-decoration:none;font-weight:bold;">Chat with us</a>
    &nbsp;·&nbsp; Booking Ref: <span style="color:#2B2B2B;">${d.REF}</span>
  </td></tr>

  <tr><td style="background-color:#FFFFFF;border-radius:14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

      <tr><td style="background-color:#F15A25;height:4px;line-height:4px;font-size:0;border-radius:14px 14px 0 0;">&nbsp;</td></tr>

      <tr><td style="padding:36px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#F15A25;font-weight:bold;padding-bottom:14px;">Booking Confirmed</div>
        <div style="font-size:26px;line-height:34px;color:#1F1F1F;font-weight:bold;">You're all set, ${d.GUEST}.</div>
        <div style="font-size:15px;line-height:24px;color:#6B665F;padding-top:12px;">
          ${RECEIPT_HERO_INTRO}
        </div>
      </td></tr>

      <tr><td style="padding:28px 40px 0 40px;"><div style="height:1px;background-color:#E6E3DD;font-size:0;line-height:0;">&nbsp;</div></td></tr>

      <tr><td style="padding:24px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;">${bookingRowsHtml}
        </table>
      </td></tr>

      <tr><td style="padding:20px 40px 0 40px;"><div style="height:1px;background-color:#E6E3DD;font-size:0;line-height:0;">&nbsp;</div></td></tr>

      <tr><td style="padding:24px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;">
          <tr><td style="padding:8px 0;color:#8A857D;">Accommodation (${d.NIGHTS})</td>
              <td style="padding:8px 0;color:#1F1F1F;" align="right">${d.SUB} EGP</td></tr>
          ${extraRow}
          <tr><td colspan="2" style="padding:10px 0 0 0;"><div style="height:1px;background-color:#E6E3DD;font-size:0;line-height:0;">&nbsp;</div></td></tr>
          <tr><td style="padding:14px 0 8px 0;color:#1F1F1F;font-size:15px;font-weight:bold;">Total</td>
              <td style="padding:14px 0 8px 0;color:#1F1F1F;font-size:15px;font-weight:bold;" align="right">${d.TOTAL} EGP</td></tr>
          <tr><td style="padding:8px 0;color:#8A857D;">Paid (${d.PAID_METHOD})</td>
              <td style="padding:8px 0;color:#2E7D4F;" align="right">✓ ${d.PAID} EGP</td></tr>
          <tr><td colspan="2" style="padding:10px 0 0 0;"><div style="height:1px;background-color:#E6E3DD;font-size:0;line-height:0;">&nbsp;</div></td></tr>
          <tr><td style="padding:16px 0 0 0;color:#1F1F1F;font-size:16px;font-weight:bold;">Remaining — due on arrival</td>
              <td style="padding:16px 0 0 0;color:#F15A25;font-size:22px;font-weight:bold;" align="right">${d.REM} EGP</td></tr>
        </table>
      </td></tr>

      <tr><td align="center" style="padding:32px 40px 0 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td align="center" bgcolor="#F15A25" style="border-radius:8px;">
            <a href="https://wa.me/${d.WA}" style="display:inline-block;padding:15px 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:8px;">Message us on WhatsApp →</a>
          </td></tr></table>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8A857D;padding-top:12px;">${RECEIPT_NEED_CHANGE_NOTE}</div>
      </td></tr>

      <tr><td style="padding:32px 40px 0 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF6F1;border-radius:10px;border-left:3px solid #F15A25;"><tr>
          <td style="padding:20px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:22px;color:#4A463F;">
            <div style="font-weight:bold;color:#1F1F1F;font-size:14px;padding-bottom:10px;">${RECEIPT_DOCUMENTS_TITLE}</div>
            ${documentsItemsHtml}
            <div style="padding-top:10px;color:#6B665F;">${RECEIPT_DOCUMENTS_NOTE}</div>
          </td></tr></table>
      </td></tr>

      <tr><td style="padding:16px 40px 0 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F7F5F1;border-radius:10px;"><tr>
          <td style="padding:20px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:22px;color:#4A463F;">
            <div style="font-weight:bold;color:#1F1F1F;font-size:14px;padding-bottom:10px;">${RECEIPT_POLICIES_TITLE}</div>
            <div style="font-size:12px;color:#8A857D;font-weight:bold;letter-spacing:.5px;padding-bottom:6px;">${RECEIPT_CANCELLATION_TITLE}</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;line-height:20px;">${cancellationRowsHtml}
            </table>
            <div style="padding-top:6px;color:#6B665F;font-size:12px;">Days are counted from your check-in date, ${d.CHECKIN}.</div>
            <div style="padding-top:16px;font-size:12px;color:#8A857D;font-weight:bold;letter-spacing:.5px;padding-bottom:6px;">${RECEIPT_DAMAGES_TITLE}</div>
            <div style="color:#4A463F;">${RECEIPT_DAMAGES_TEXT}</div>
          </td></tr></table>
      </td></tr>

      <tr><td style="padding:16px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:22px;color:#6B665F;">
        ${bottomNotesHtml}
      </td></tr>

      <tr><td style="padding:28px 40px 36px 40px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#6B665F;">
        See you soon,<br>
        <span style="color:#0149AF;font-weight:bold;">${d.SENDER_NAME}</span><br>
        <span style="font-size:13px;">${d.SENDER_TITLE} · InnSpot</span>
      </td></tr>

    </table>
  </td></tr>

  <tr><td align="center" style="padding:26px 20px 10px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#9A948B;">
    InnSpot Tourism Agency · Fayoum, Egypt<br>
    <a href="https://wa.me/${d.WA}" style="color:#9A948B;text-decoration:underline;">+20 106 184 0111</a>
    &nbsp;·&nbsp; <a href="mailto:reservations@${d.DOMAIN}" style="color:#9A948B;text-decoration:underline;">reservations@${d.DOMAIN}</a>
    &nbsp;·&nbsp; <a href="https://${d.DOMAIN}" style="color:#9A948B;text-decoration:underline;">${d.DOMAIN}</a>
  </td></tr>
  <tr><td align="center" style="padding:0 20px 30px 20px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#B5AFA5;">
    ${RECEIPT_FOOTER_NOTE}
  </td></tr>

</table>
</td></tr></table>`;
}
