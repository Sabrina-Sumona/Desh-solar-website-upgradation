import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutLeadPayload = {
  recordType: "checkout_lead";
  name: string;
  phone: string;
  email: string;
  address: string;
  fullAddress: string;
  additionalNotes: string;
};

type ContactRequestPayload = {
  recordType: "contact_request";
  reference: string;
  requestType: string;
  contactRoute: string;
  name: string;
  phone: string;
  email: string;
  districtCity: string;
  projectProperty: string;
  projectGoal: string;
  monthlyElectricityBill: string;
  backupHours: string;
  electricalPhase: string;
  preferredConsultation: string;
  productCategory: string;
  productModel: string;
  quantity: string;
  inquiryType: string;
  preferredDate: string;
  preferredTime: string;
  visitPurpose: string;
  messageNotes: string;
  attachmentNames: string;
  whatsappNumber: string;
  additionalNotes: string;
};

type GoogleSheetPayload =
  | CheckoutLeadPayload
  | ContactRequestPayload;

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

function parseCheckoutLead(
  record: Record<string, unknown>
): CheckoutLeadPayload | null {
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

  const lead: CheckoutLeadPayload = {
    recordType: "checkout_lead",
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

function parseContactRequest(
  record: Record<string, unknown>
): ContactRequestPayload | null {
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

  const request: ContactRequestPayload = {
    recordType: "contact_request",
    reference: cleanText(
      record.reference,
      80
    ),
    requestType: cleanText(
      record.requestType,
      120
    ),
    contactRoute: cleanText(
      record.contactRoute,
      40
    ),
    name: cleanText(
      record.name,
      120
    ),
    phone: phone || "",
    email,
    districtCity: cleanText(
      record.districtCity,
      160
    ),
    projectProperty: cleanText(
      record.projectProperty,
      100
    ),
    projectGoal: cleanText(
      record.projectGoal,
      120
    ),
    monthlyElectricityBill: cleanText(
      record.monthlyElectricityBill,
      80
    ),
    backupHours: cleanText(
      record.backupHours,
      80
    ),
    electricalPhase: cleanText(
      record.electricalPhase,
      80
    ),
    preferredConsultation: cleanText(
      record.preferredConsultation,
      120
    ),
    productCategory: cleanText(
      record.productCategory,
      100
    ),
    productModel: cleanText(
      record.productModel,
      160
    ),
    quantity: cleanText(
      record.quantity,
      40
    ),
    inquiryType: cleanText(
      record.inquiryType,
      120
    ),
    preferredDate: cleanText(
      record.preferredDate,
      40
    ),
    preferredTime: cleanText(
      record.preferredTime,
      80
    ),
    visitPurpose: cleanText(
      record.visitPurpose,
      160
    ),
    messageNotes: cleanText(
      record.messageNotes,
      1500
    ),
    attachmentNames: cleanText(
      record.attachmentNames,
      1000
    ),
    whatsappNumber: cleanText(
      record.whatsappNumber,
      40
    ),
    additionalNotes: cleanText(
      record.additionalNotes,
      2000
    ),
  };

  if (
    !request.reference ||
    !request.requestType ||
    !request.name ||
    !request.phone
  ) {
    return null;
  }

  return request;
}

function parsePayload(
  body: unknown
): GoogleSheetPayload | null {
  if (
    !body ||
    typeof body !== "object"
  ) {
    return null;
  }

  const record =
    body as Record<string, unknown>;

  const recordType = cleanText(
    record.recordType,
    40
  ).toLowerCase();

  if (
    recordType ===
    "contact_request"
  ) {
    return parseContactRequest(
      record
    );
  }

  // Backwards compatibility: the existing checkout page does not need
  // to send recordType. Any non-contact payload follows the original
  // checkout/customer-lead validation and goes to the existing sheet.
  return parseCheckoutLead(
    record
  );
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

function toCustomerDirectoryPayload(
  payload: GoogleSheetPayload
): CheckoutLeadPayload {
  if (payload.recordType === "contact_request") {
    return {
      recordType: "checkout_lead",
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      address: payload.districtCity,
      fullAddress: "",
      additionalNotes: payload.messageNotes,
    };
  }

  return payload;
}

async function saveToGoogleSheet(
  payload: CheckoutLeadPayload
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
          ...payload,
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
       * a successful submission into a customer-facing error.
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

    const payload =
      parsePayload(body);

    if (!payload) {
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

    // Both Checkout and Contact requests are intentionally stored in the
    // same existing Customer_Directory table. Contact requests are converted
    // to the original checkout/customer payload before they reach Apps Script.
    // This guarantees:
    // - Address = District / City
    // - Full Address = blank
    // - Additional Notes = only the customer-written Project / Product / Visit Notes
    // and prevents older Apps Script deployments from expanding contact metadata.
    const sheetPayload =
      toCustomerDirectoryPayload(
        payload
      );

    const result =
      await saveToGoogleSheet(
        sheetPayload
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
      recordType:
        payload.recordType,
      destination: "Customer_Directory",
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
