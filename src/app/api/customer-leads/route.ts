import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CustomerLeadPayload = {
  name: string;
  phone: string;
  email: string;
  address: string;
  fullAddress: string;
  additionalNotes: string;
};

type GoogleSheetResponse = {
  success?: boolean;
  message?: string;
};

function cleanText(
  value: unknown,
  maxLength: number
) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function parseLead(
  body: unknown
): CustomerLeadPayload | null {
  if (
    !body ||
    typeof body !== "object"
  ) {
    return null;
  }

  const record =
    body as Record<string, unknown>;

  const lead: CustomerLeadPayload = {
    name: cleanText(
      record.name,
      120
    ),
    phone: cleanText(
      record.phone,
      40
    ),
    email: cleanText(
      record.email,
      160
    ),
    address: cleanText(
      record.address,
      160
    ),
    fullAddress: cleanText(
      record.fullAddress,
      500
    ),
    additionalNotes: cleanText(
      record.additionalNotes,
      1000
    ),
  };

  if (
    !lead.name ||
    !lead.phone ||
    !lead.address
  ) {
    return null;
  }

  return lead;
}

async function saveLeadToGoogleSheet(
  lead: CustomerLeadPayload
) {
  const webAppUrl =
    process.env
      .GOOGLE_SHEETS_WEB_APP_URL;

  const secret =
    process.env
      .GOOGLE_SHEETS_LEAD_SECRET;

  if (
    !webAppUrl ||
    !secret
  ) {
    throw new Error(
      "GOOGLE_SHEETS_CONFIGURATION_MISSING"
    );
  }

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      12000
    );

  try {
    const response = await fetch(
      webAppUrl,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          secret,
          ...lead,
        }),
        cache: "no-store",
        redirect: "follow",
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(
        "GOOGLE_SHEETS_HTTP_ERROR"
      );
    }

    let result:
      | GoogleSheetResponse
      | null = null;

    try {
      result =
        (await response.json()) as
          GoogleSheetResponse;
    } catch {
      throw new Error(
        "GOOGLE_SHEETS_INVALID_RESPONSE"
      );
    }

    if (!result?.success) {
      throw new Error(
        "GOOGLE_SHEETS_SAVE_REJECTED"
      );
    }
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const lead =
      parseLead(body);

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_CUSTOMER_DATA",
          message:
            "Required customer information is missing.",
        },
        {
          status: 400,
        }
      );
    }

    await saveLeadToGoogleSheet(
      lead
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "GOOGLE_SHEETS_TIMEOUT",
          message:
            "Google Sheets took too long to respond.",
        },
        {
          status: 504,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "GOOGLE_SHEETS_CONFIGURATION_MISSING"
    ) {
      return NextResponse.json(
        {
          success: false,
          code:
            "GOOGLE_SHEETS_CONFIGURATION_MISSING",
          message:
            "Google Sheets integration is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: "GOOGLE_SHEETS_SAVE_FAILED",
        message:
          "Could not save customer information.",
      },
      {
        status: 502,
      }
    );
  }
}
