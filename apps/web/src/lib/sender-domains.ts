import dns from "node:dns/promises";

export interface DnsCheckResult {
  spfOk: boolean;
  spfDetail: string;
  dmarcOk: boolean;
  dmarcDetail: string;
  dkimOk: boolean;
  dkimDetail: string;
  allOk: boolean;
}

export function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^\@/, "");
}

export function isValidDomain(domain: string): boolean {
  return /^(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,}$/.test(domain);
}

export function getRequiredDnsRecords(domain: string, brevoCode?: string) {
  const records: { type: string; host: string; value: string; purpose: string }[] = [
    {
      type: "TXT",
      host: domain,
      value: "v=spf1 include:spf.brevo.com mx ~all",
      purpose: "SPF — authorizes Brevo to send on behalf of this domain",
    },
    {
      type: "TXT",
      host: `_dmarc.${domain}`,
      value: "v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc@" + domain,
      purpose: "DMARC — tells receivers how to handle spoofed mail + where to send reports",
    },
  ];
  if (brevoCode) {
    records.push({
      type: "TXT",
      host: domain,
      value: `brevo-code:${brevoCode}`,
      purpose: "Brevo ownership verification code (from Brevo → Senders & Domains)",
    });
  }
  return records;
}

export function getBrevoDkimInstructions(domain: string): string {
  return (
    `Brevo generates unique DKIM keys per domain. In Brevo go to Settings → Senders & Domains → Add a domain → enter "${domain}", ` +
    `then add the 2 DKIM CNAME/TXT records Brevo shows you (typically under mail._domainkey.${domain}). ` +
    `Once added, click "Authenticate" in Brevo, then click "Verify" here.`
  );
}

async function resolveTxtSafe(name: string): Promise<string[]> {
  try {
    const records = await dns.resolveTxt(name);
    return records.map((r) => r.join(""));
  } catch {
    return [];
  }
}

export async function verifyDomainDns(domain: string): Promise<DnsCheckResult> {
  const [rootTxt, dmarcTxt, dkimMailTxt] = await Promise.all([
    resolveTxtSafe(domain),
    resolveTxtSafe(`_dmarc.${domain}`),
    resolveTxtSafe(`mail._domainkey.${domain}`),
  ]);

  const spfRecords = rootTxt.filter((t) => t.toLowerCase().startsWith("v=spf1"));
  const spfOk =
    spfRecords.length > 0 &&
    spfRecords.some((t) => {
      const lower = t.toLowerCase();
      return lower.includes("spf.brevo.com") || lower.includes("spf.sendinblue.com") || lower.includes("sendinblue.com");
    });
  const spfDetail =
    spfRecords.length === 0
      ? "No SPF TXT record found on the domain."
      : spfOk
        ? `SPF found and authorizes Brevo: ${spfRecords[0].slice(0, 160)}`
        : `SPF found but does not include Brevo (need include:spf.brevo.com): ${spfRecords[0].slice(0, 160)}`;

  const dmarcRecords = dmarcTxt.filter((t) => t.toUpperCase().includes("V=DMARC1"));
  const dmarcOk = dmarcRecords.length > 0;
  const dmarcDetail = dmarcOk
    ? `DMARC found: ${dmarcRecords[0].slice(0, 160)}`
    : "No DMARC TXT record found at _dmarc.<domain>.";

  let dkimOk = dkimMailTxt.length > 0;
  let dkimDetail = dkimOk
    ? `DKIM key found at mail._domainkey.${domain}.`
    : `No DKIM TXT found at mail._domainkey.${domain} — add the DKIM records Brevo generated for this domain (selector may differ; check Brevo dashboard).`;
  if (!dkimOk) {
    try {
      const cname = await dns.resolveCname(`mail._domainkey.${domain}`);
      if (cname.length > 0) {
        dkimOk = true;
        dkimDetail = `DKIM CNAME found at mail._domainkey.${domain} → ${cname[0]}.`;
      }
    } catch {
      // no CNAME — keep negative result
    }
  }

  return { spfOk, spfDetail, dmarcOk, dmarcDetail, dkimOk, dkimDetail, allOk: spfOk && dmarcOk && dkimOk };
}

export function extractDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}
