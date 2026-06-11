import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  return lines.map(parseCSVLine);
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getField(row: string[], headers: string[], names: string[]): string | undefined {
  for (const name of names) {
    const idx = headers.findIndex((h) => normalizeHeader(h) === normalizeHeader(name));
    if (idx !== -1) {
      const val = row[idx]?.trim();
      if (val && val.length > 0) return val;
    }
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;

  try {
    const { workspaceId, csvText } = await req.json();

    if (!workspaceId || !csvText || typeof csvText !== "string") {
      return NextResponse.json(
        { error: "workspaceId and csvText are required" },
        { status: 400 }
      );
    }

    const rows = parseCSV(csvText);
    if (rows.length < 2) {
      return NextResponse.json(
        { error: "CSV must contain a header row and at least one data row" },
        { status: 400 }
      );
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Pre-fetch accounts for company matching
    const accounts = await prisma.account.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    });
    const accountMap = new Map<string, string>();
    for (const a of accounts) {
      accountMap.set(a.name.toLowerCase().trim(), a.id);
    }

    const created: any[] = [];
    const skipped: { row: number; reason: string }[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2; // 1-based, +1 for header

      const firstName = getField(row, headers, ["first name", "firstname", "first_name", "first"]) || "";
      const lastName = getField(row, headers, ["last name", "lastname", "last_name", "last", "surname"]) || "";

      if (!firstName && !lastName) {
        skipped.push({ row: rowNum, reason: "Missing first and last name" });
        continue;
      }

      const email = getField(row, headers, ["email", "e-mail", "email address", "emailaddress"]);
      const phone = getField(row, headers, ["phone", "phone number", "phonenumber", "phone_number", "mobile", "tel"]);
      const title = getField(row, headers, ["position", "title", "job title", "jobtitle", "role"]);
      const department = getField(row, headers, ["department", "dept", "division"]);
      const linkedin = getField(row, headers, ["linkedin", "linkedin url", "linkedinurl"]);
      const company = getField(row, headers, ["company", "company name", "companyname", "organization", "org", "account"]);
      const website = getField(row, headers, ["website", "web", "site", "url", "domain"]);

      // Try to match company to an existing account
      let accountId: string | undefined;
      const customFields: Record<string, any> = {};
      if (company) {
        const match = accountMap.get(company.toLowerCase().trim());
        if (match) {
          accountId = match;
        } else {
          customFields.company = company;
        }
      }
      if (website) customFields.website = website;

      // Check for duplicate email within this workspace
      if (email) {
        const existing = await prisma.contact.findFirst({
          where: { workspaceId, email },
          select: { id: true },
        });
        if (existing) {
          skipped.push({ row: rowNum, reason: `Email "${email}" already exists` });
          continue;
        }
      }

      const contact = await prisma.contact.create({
        data: {
          workspaceId,
          accountId,
          firstName,
          lastName,
          email,
          phone,
          title,
          department,
          linkedin,
          customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
        },
      });

      created.push({ id: contact.id, firstName: contact.firstName, lastName: contact.lastName, email: contact.email });
    }

    return NextResponse.json({ created: created.length, skipped, contacts: created }, { status: 201 });
  } catch (err: any) {
    console.error("Contact import error:", err);
    return NextResponse.json({ error: err.message || "Import failed" }, { status: 500 });
  }
}
