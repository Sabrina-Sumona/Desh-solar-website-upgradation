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
  code?: string;
  message?: string;
  debug?: string;
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

function normalizeBangladeshPhone(
  value: unknown
) {
  if (typeof value !== "string") {
    return null;
  }

  const digits =
    value.replace(/\D/g, "");

  if (
    /^01[3-9]\d{8}$/.test(
      digits
    )
  ) {
    return `+88${digits}`;
  }

  if (
    /^8801[3-9]\d{8}$/.test(
      digits
    )
  ) {
    return `+${digits}`;
  }

  return null;
}

function normalizeOptionalEmail(
  value: unknown
) {
  if (typeof value !== "string") {
    return "";
  }

  const email =
    value
      .trim()
      .toLowerCase()
      .slice(0, 160);

  if (!email) {
    return "";
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    return null;
  }

  return email;
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

  const phone =
    normalizeBangladeshPhone(
      record.phone
    );

  const email =
    normalizeOptionalEmail(
      record.email
    );

  if (email === null) {
    return null;
  }

  const lead: CustomerLeadPayload = {
    name: cleanText(
      record.name,
      120
    ),
    phone: phone || "",
    email,
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

function hasHoneypotValue(
  body: unknown
) {
  if (
    !body ||
    typeof body !== "object"
  ) {
    return false;
  }

  const record =
    body as Record<string, unknown>;

  return Boolean(
    cleanText(
      record.website,
      200
    )
  );
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
    return {
      success: false,
      code:
        "GOOGLE_SHEETS_CONFIGURATION_MISSING",
      message:
        "Google Sheets integration is not configured.",
    } satisfies GoogleSheetResponse;
  }

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      25000
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
          environment:
            process.env.NODE_ENV ===
            "development"
              ? "development"
              : "production",
          ...lead,
        }),
        cache: "no-store",
        redirect: "follow",
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      return {
        success: false,
        code:
          "GOOGLE_SHEETS_HTTP_ERROR",
        message:
          "Google Sheets service returned an HTTP error.",
      } satisfies GoogleSheetResponse;
    }

    const rawResponse =
      await response.text();

    try {
      return JSON.parse(
        rawResponse
      ) as GoogleSheetResponse;
    } catch {
      /*
       * Google Apps Script ContentService responses can be
       * delivered through Google's HTML/redirect layer even
       * after doPost() has already completed successfully.
       *
       * We only reach this block after an HTTP-success response.
       * In our integration the Sheet row is already written at
       * this point, so a non-JSON success response must not turn
       * a successful order confirmation into a customer-facing
       * error.
       */
      return {
        success: true,
      } satisfies GoogleSheetResponse;
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

    if (hasHoneypotValue(body)) {
      return NextResponse.json({
        success: true,
      });
    }

    const lead =
      parseLead(body);

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          code:
            "INVALID_CUSTOMER_DATA",
          message:
            "Required customer information is missing or invalid.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await saveLeadToGoogleSheet(
        lead
      );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          code:
            result.code ||
            "GOOGLE_SHEETS_SAVE_FAILED",
          message:
            result.message ||
            "Could not save customer information.",
          ...(process.env.NODE_ENV ===
            "development" &&
          result.debug
            ? {
                debug:
                  result.debug,
              }
            : {}),
        },
        {
          status: 502,
        }
      );
    }

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
          code:
            "GOOGLE_SHEETS_TIMEOUT",
          message:
            "Google Sheets took too long to respond.",
        },
        {
          status: 504,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        code:
          "GOOGLE_SHEETS_SAVE_FAILED",
        message:
          "Could not save customer information.",
      },
      {
        status: 502,
      }
    );
  }
}
