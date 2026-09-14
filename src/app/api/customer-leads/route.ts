import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const EXCEL_FILE = path.join(DATA_DIRECTORY, "customer-leads.xlsx");
const SHEET_NAME = "Customers";

const STATUS_OPTIONS = [
  "New Entry",
  "Contacted",
  "Not Confirmed",
  "Confirmed",
  "Sale Complete",
] as const;

const DEFAULT_STATUS = STATUS_OPTIONS[0];

type CustomerLead = {
  name: string;
  phone: string;
  email: string;
  address: string;
  fullAddress: string;
  additionalNotes: string;
  status: string;
};

let writeQueue: Promise<void> = Promise.resolve();

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function parseLead(body: unknown): CustomerLead | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;

  const lead: CustomerLead = {
    name: cleanText(record.name, 120),
    phone: cleanText(record.phone, 40),
    email: cleanText(record.email, 160),
    address: cleanText(record.address, 160),
    fullAddress: cleanText(record.fullAddress, 500),
    additionalNotes: cleanText(record.additionalNotes, 1000),
    status: DEFAULT_STATUS,
  };

  if (!lead.name || !lead.phone || !lead.address) {
    return null;
  }

  return lead;
}

function configureWorksheet(worksheet: ExcelJS.Worksheet) {
  worksheet.columns = [
    { header: "Name", key: "name", width: 28 },
    { header: "Phone", key: "phone", width: 20 },
    { header: "Email", key: "email", width: 34 },
    { header: "Address", key: "address", width: 24 },
    { header: "Full Address", key: "fullAddress", width: 45 },
    { header: "Additional Notes", key: "additionalNotes", width: 50 },
    { header: "Status", key: "status", width: 20 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: "middle" };

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = { from: "A1", to: "G1" };

  const statusFormula = `"${STATUS_OPTIONS.join(",")}"`;

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const cell = worksheet.getCell(`G${rowNumber}`);

    if (!cell.value) {
      cell.value = DEFAULT_STATUS;
    }

    cell.dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [statusFormula],
      showErrorMessage: true,
      errorTitle: "Invalid Status",
      error: "Select a status from the dropdown list.",
    };
  }
}

async function appendLead(lead: CustomerLead) {
  await fs.promises.mkdir(DATA_DIRECTORY, { recursive: true });

  const workbook = new ExcelJS.Workbook();

  if (fs.existsSync(EXCEL_FILE)) {
    await workbook.xlsx.readFile(EXCEL_FILE);
  }

  let worksheet = workbook.getWorksheet(SHEET_NAME);

  if (!worksheet) {
    worksheet = workbook.addWorksheet(SHEET_NAME);
  }

  configureWorksheet(worksheet);

  const row = worksheet.addRow({
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    address: lead.address,
    fullAddress: lead.fullAddress,
    additionalNotes: lead.additionalNotes,
    status: lead.status,
  });

  row.alignment = {
    vertical: "top",
    wrapText: true,
  };

  worksheet.getCell(`G${row.number}`).dataValidation = {
    type: "list",
    allowBlank: false,
    formulae: [`"${STATUS_OPTIONS.join(",")}"`],
    showErrorMessage: true,
    errorTitle: "Invalid Status",
    error: "Select a status from the dropdown list.",
  };

  await workbook.xlsx.writeFile(EXCEL_FILE);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lead = parseLead(body);

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid customer information.",
        },
        { status: 400 }
      );
    }

    writeQueue = writeQueue
      .catch(() => undefined)
      .then(() => appendLead(lead));

    await writeQueue;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    const fileError =
      error as NodeJS.ErrnoException;

    if (
      fileError?.code === "EBUSY" ||
      fileError?.code === "EPERM" ||
      fileError?.code === "EACCES"
    ) {
      return NextResponse.json(
        {
          success: false,
          code: "EXCEL_FILE_LOCKED",
          message:
            "The Excel file is currently open or locked.",
        },
        {
          status: 423,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: "EXCEL_SAVE_FAILED",
        message:
          "Could not save customer information.",
      },
      {
        status: 500,
      }
    );
  }
}
