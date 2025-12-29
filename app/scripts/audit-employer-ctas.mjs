import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src");
const TARGETS = [
  path.join(ROOT, "app", "employer"),
  path.join(ROOT, "components", "employer"),
];

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listFiles(p));
    else if (ent.isFile() && (p.endsWith(".tsx") || p.endsWith(".ts"))) out.push(p);
  }
  return out;
}

function auditFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const lines = src.split(/\r?\n/);
  const issues = [];

  // Very light static audit:
  // - <Button ...> must have asChild OR onClick OR type="submit" OR disabled
  // - <button ...> must have onClick OR type="submit" OR disabled
  // - no href="#"
  const buttonTag = /<Button\b([^>]*)>/g;
  const nativeButton = /<button\b([^>]*)>/g;

  let m;
  while ((m = buttonTag.exec(src))) {
    const attrs = m[1] ?? "";
    const ok =
      /asChild\b/.test(attrs) ||
      /onClick=/.test(attrs) ||
      /type="submit"/.test(attrs) ||
      /disabled\b/.test(attrs);
    if (!ok) issues.push({ kind: "Button", snippet: m[0] });
  }

  while ((m = nativeButton.exec(src))) {
    const attrs = m[1] ?? "";
    const ok =
      /onClick=/.test(attrs) ||
      /type="submit"/.test(attrs) ||
      /disabled\b/.test(attrs);
    if (!ok) issues.push({ kind: "button", snippet: m[0] });
  }

  if (src.includes('href="#"')) issues.push({ kind: "href", snippet: 'href="#"' });

  // Find a line number for better output
  for (const issue of issues) {
    const idx = lines.findIndex((l) => l.includes(issue.snippet.replace(/\s+/g, " ").trim().slice(0, 20)));
    issue.line = idx >= 0 ? idx + 1 : null;
  }

  return issues;
}

const files = TARGETS.flatMap(listFiles);
const allIssues = [];

for (const f of files) {
  const issues = auditFile(f);
  for (const i of issues) allIssues.push({ file: path.relative(process.cwd(), f), ...i });
}

if (allIssues.length === 0) {
  console.log("✅ Employer CTA audit passed (no obviously-dead Buttons/CTAs found).");
  process.exit(0);
}

console.log("❌ Employer CTA audit found potential issues:\n");
for (const i of allIssues) {
  console.log(`- ${i.file}${i.line ? `:${i.line}` : ""} — ${i.kind}: ${i.snippet}`);
}
process.exit(1);







