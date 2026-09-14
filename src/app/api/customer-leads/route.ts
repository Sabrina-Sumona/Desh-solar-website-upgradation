import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createHmac } from "node:crypto";

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
  duplicate?: boolean;
  code?: string;
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

function getClientIdentifier(
  request: NextRequest
) {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for"
    );

  const forwardedIp =
    forwardedFor
      ?.split(",")[0]
      ?.trim();

  const realIp =
    request.headers
      .get("x-real-ip")
      ?.trim();

  return (
    forwardedIp ||
    realIp ||
    "local-development"
  );
}

function createRateKey(
  clientIdentifier: string,
  secret: string
) {
  return createHmac(
    "sha256",
    secret
  )
    .update(clientIdentifier)
    .digest("hex")
    .slice(0, 32);
}

function createSubmissionKey(
  lead: CustomerLeadPayload,
  secret: string
) {
  const canonicalLead = [
    lead.name.toLowerCase(),
    lead.phone.toLowerCase(),
    lead.email.toLowerCase(),
    lead.address.toLowerCase(),
    lead.fullAddress.toLowerCase(),
    lead.additionalNotes.toLowerCase(),
  ].join("|");

  return createHmac(
    "sha256",
    secret
  )
    .update(canonicalLead)
    .digest("hex")
    .slice(0, 40);
}

async function saveLeadToGoogleSheet(
  lead: CustomerLeadPayload,
  clientIdentifier: string
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

  const rateKey =
    createRateKey(
      clientIdentifier,
      secret
    );

  const submissionKey =
    createSubmissionKey(
      lead,
      secret
    );

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
          rateKey,
          submissionKey,
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

    if (
      !result?.success &&
      result?.code === "RATE_LIMITED"
    ) {
      throw new Error(
        "RATE_LIMITED"
      );
    }

    if (!result?.success) {
      throw new Error(
        "GOOGLE_SHEETS_SAVE_REJECTED"
      );
    }

    return {
      duplicate:
        result.duplicate === true,
    };
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

    /*
     * Honeypot:
     * real users never see or fill the hidden Website field.
     * Bots that automatically populate it are silently ignored.
     */
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
          code: "INVALID_CUSTOMER_DATA",
          message:
            "Required customer information is missing.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await saveLeadToGoogleSheet(
        lead,
        getClientIdentifier(request)
      );

    return NextResponse.json({
      success: true,
      duplicate:
        result.duplicate,
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

    if (
      error instanceof Error &&
      error.message ===
        "RATE_LIMITED"
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "RATE_LIMITED",
          message:
            "Too many order requests. Please wait a few minutes and try again.",
        },
        {
          status: 429,
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
