#!/usr/bin/env node
"use strict";

// mobigen - generate valid E.164 mobile numbers for NL, BE, FR, DE
const { PhoneNumberUtil, PhoneNumberType } = require("google-libphonenumber");
const phoneUtil = PhoneNumberUtil.getInstance();

function randomDigits(n) {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

const SUPPORTED = ["NL", "FR", "BE", "DE"];

const COUNTRY_PATTERNS = {
  NL: () => `+316${randomDigits(8)}`, // Netherlands mobile
  FR: () => (Math.random() < 0.5 ? `+336` : `+337`) + randomDigits(8), // France mobile
  BE: () => `+324${randomDigits(8)}`, // Belgium mobile
  DE: () => {
    // Germany mobile prefixes: +4915 / +4916 / +4917
    const p = ["+4915", "+4916", "+4917"][Math.floor(Math.random() * 3)];
    // German mobile subscriber lengths vary; libphonenumber will validate
    const len = [7, 8, 9, 10][Math.floor(Math.random() * 4)];
    return p + randomDigits(len);
  }
};

function isMobile(number, region) {
  try {
    const parsed = phoneUtil.parse(number, region);
    if (!phoneUtil.isValidNumberForRegion(parsed, region)) return false;
    const t = phoneUtil.getNumberType(parsed);
    return t === PhoneNumberType.MOBILE;
  } catch {
    return false;
  }
}

function nextMobile(region) {
  if (!COUNTRY_PATTERNS[region]) {
    throw new Error(`Unsupported region: ${region}`);
  }
  // Loop until a candidate validates as MOBILE
  // This is fast; typically resolves in 1–3 attempts
  // For larger batches it's still quick.
  // You can add a guard if needed, but not necessary in practice.
  while (true) {
    const candidate = COUNTRY_PATTERNS[region]();
    if (isMobile(candidate, region)) return candidate;
  }
}

function printHelp() {
  console.log(`
mobigen — Generate valid E.164 mobile numbers (NL, BE, FR, DE)

Usage:
  mobigen <REGION> [COUNT]
  mobigen -c <REGION> -n <COUNT>
  mobigen --list
  mobigen -h | --help

Examples:
  mobigen FR           # one French mobile (default COUNT=1)
  mobigen FR 5         # five French mobiles
  mobigen -c DE -n 10  # ten German mobiles
  mobigen --list       # list supported regions

Regions:
  NL, BE, FR, DE
`.trim());
}

function printList() {
  console.log(SUPPORTED.join("\n"));
}

function parseArgs(argv) {
  // Defaults
  let region = null;
  let count = 1;

  let i = 0;
  while (i < argv.length) {
    const a = argv[i];

    if (a === "-h" || a === "--help") {
      return { help: true };
    }
    if (a === "--list") {
      return { list: true };
    }
    if (a === "-c" || a === "--country") {
      const next = argv[i + 1];
      if (!next) {
        throw new Error("Missing value for -c/--country");
      }
      region = next.toUpperCase();
      i += 2;
      continue;
    }
    if (a === "-n" || a === "--count") {
      const next = argv[i + 1];
      if (!next) {
        throw new Error("Missing value for -n/--count");
      }
      count = parseInt(next, 10);
      if (!Number.isFinite(count) || count < 1) {
        throw new Error("Count must be a positive integer");
      }
      i += 2;
      continue;
    }
    // Positional args: <REGION> [COUNT]
    if (!a.startsWith("-")) {
      if (!region) {
        region = a.toUpperCase();
      } else if (count === 1) {
        const parsed = parseInt(a, 10);
        if (!Number.isFinite(parsed) || parsed < 1) {
          throw new Error("COUNT must be a positive integer");
        }
        count = parsed;
      } else {
        // extra positional args ignored
      }
      i += 1;
      continue;
    }

    throw new Error(`Unknown option: ${a}`);
  }

  return { region, count };
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
      printHelp();
      process.exit(0);
    }
    if (args.list) {
      printList();
      process.exit(0);
    }

    const region = (args.region || "").toUpperCase();
    const count = args.count ?? 1;

    if (!region) {
      console.error("Error: REGION is required. Try: mobigen FR");
      console.error("Run 'mobigen --help' for usage.");
      process.exit(1);
    }
    if (!SUPPORTED.includes(region)) {
      console.error(`Error: Unsupported region '${region}'. Use one of: ${SUPPORTED.join(", ")}`);
      process.exit(1);
    }

    // Generate and print
    // Ensure uniqueness within a single run, just in case large counts are requested.
    const seen = new Set();
    let printed = 0;
    while (printed < count) {
      const n = nextMobile(region);
      if (!seen.has(n)) {
        seen.add(n);
        console.log(n);
        printed += 1;
      }
    }
  } catch (e) {
    console.error(e.message || String(e));
    process.exit(1);
  }
}

main();
