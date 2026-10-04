import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (value: unknown, max = 1000) =>
  typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, max)
    : "";

function normalizePhone(value: unknown) {
  const digits = clean(value, 40).replace(/\D/g, "");

  if (/^01[3-9]\d{8}$/.test(digits)) {
    return `+88${digits}`;
  }

  if (/^8801[3-9]\d{8}$/.test(digits)) {
    return `+${digits}`;
  }

  return "";
}

function getContactSource(route: string) {
  switch (route.trim().toLowerCase()) {
    case "project":
      return "Contact - Solar Planning";
    case "product":
      return "Contact - Product Inquiry";
    case "support":
      return "Customer Support";
    case "visit":
      return "Contact - Head Office Visit";
    case "review":
      return "Contact - Customer Review";
    default:
      return "Contact - Other";
  }
}

type AppsScriptResponse = {
  success?: boolean;
  message?: string;
  code?: string;
  savedSource?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypot field.
    if (clean(body.website, 200)) {
      return NextResponse.json({ success: true });
    }

    const isContact =
      clean(body.recordType, 40).toLowerCase() === "contact_request";

    const source = isContact
      ? getContactSource(clean(body.contactRoute, 40))
      : "Checkout";

    const payload = {
      name: clean(body.name, 120),
      phone: normalizePhone(body.phone),
      email: clean(body.email, 160).toLowerCase(),

      // Contact form only supplies District / City.
      address: isContact
        ? clean(body.districtCity, 160) || "N/A"
        : clean(body.address, 160),

      source,
    };

    if (
      !payload.name ||
      !payload.phone ||
      (!isContact && !payload.address)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required customer information is missing or invalid.",
        },
        { status: 400 },
      );
    }

    const webAppUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;
    const secret = process.env.GOOGLE_SHEETS_LEAD_SECRET;

    if (!webAppUrl || !secret) {
      return NextResponse.json(
        {
          success: false,
          message: "Google Sheets integration is not configured.",
        },
        { status: 500 },
      );
    }

    const response = await fetch(webAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret,
        recordType: "customer_entry",
        environment:
          process.env.NODE_ENV === "development"
            ? "development"
            : "production",
        ...payload,
      }),
      cache: "no-store",
      redirect: "follow",
    });

    const responseText = await response.text();

    let appsScriptResult: AppsScriptResponse = {};

    try {
      appsScriptResult = JSON.parse(responseText) as AppsScriptResponse;
    } catch {
      // Leave as an empty object; handled below.
    }

    if (!response.ok || appsScriptResult.success === false) {
      return NextResponse.json(
        {
          success: false,
          message:
            appsScriptResult.message ||
            "Google Sheets service could not save the customer entry.",
        },
        { status: 502 },
      );
    }

    // Important diagnostic:
    // an old Apps Script deployment can save the row but silently ignore Source.
    if (appsScriptResult.savedSource !== source) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The live Google Apps Script is outdated and did not confirm the Source field. Redeploy the latest Apps Script version.",
          expectedSource: source,
          savedSource: appsScriptResult.savedSource || null,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      source,
      destination: "Customers",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Could not save customer information.",
      },
      { status: 502 },
    );
  }
}
