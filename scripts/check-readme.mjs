// Offline check that README.md matches the live server facts it states.
// Run: node scripts/check-readme.mjs
// Live source: GET https://cardealscore.com/api/health reports rubric_version.
import { readFileSync } from "node:fs";

const RUBRIC = "score_v2";
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const failures = [];

if (!readme.includes(`\`${RUBRIC}\``)) failures.push(`README must name the live rubric ${RUBRIC}`);
for (const [label, pattern] of [
  ["an old rubric version", /score_v(?!2\b)\d+/],
  ["the old Vercel host", /dealscore-xi\.vercel\.app/i],
  ["an em or en dash", /[\u2013\u2014]/],
]) {
  const hit = readme.match(pattern);
  if (hit) failures.push(`README contains ${label}: ${JSON.stringify(hit[0])}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("README check passed.");
