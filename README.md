# mobigen — Generate valid E.164 mobile numbers (NL, BE, FR, DE)

## Why?

After validation SMS rules aligned with national numbering plans (NTC), our dev/test flows can no longer use loosely formatted, invalid, or landline numbers. We need a reliable source of valid, mobile-only phone numbers that pass strict provider checks without sending any SMS.

This CLI generates endless, valid-format mobile numbers for:
- Netherlands (NL): +316…
- France (FR): +336/+337…
- Belgium (BE): +324…
- Germany (DE): +4915/+4916/+4917…

Each number is validated with libphonenumber and filtered to MOBILE type.

## How to run

Prerequisites
- Node.js 18+ installed

Local development (recommended)
1) Install dependencies:
```
npm install
```
2) Link globally (so you can run the command “mobigen”):
```
npm link
```
3) Usage:
```
mobigen <REGION> [COUNT]
mobigen -c <REGION> -n <COUNT>
mobigen --list
mobigen -h
```

Examples
- One number (default count = 1):
```
mobigen FR
mobigen NL
```
- Multiple numbers:
```
mobigen BE 5
mobigen -c DE -n 10
```
- List supported regions:
```
mobigen --list
```

Without linking (run directly)
```
node bin/mobigen.js FR
node bin/mobigen.js -c DE -n 3
```

Notes
- Output is E.164 format (e.g., +336XXXXXXXX).
- No SMS is sent; numbers are generated and validated locally.

Feel free to make input — add regions, tweak prefixes, suggest flags (JSON/CSV), or improve the docs. 