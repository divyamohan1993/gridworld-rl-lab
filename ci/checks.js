// Static checks run in CI:
//  1. the inline <script> parses without syntax errors
//  2. the page contains none of the writing tells we want to keep out
//     (em-dash, ellipsis character, checkmark). Plain ASCII only for those.
const fs = require("fs");
const vm = require("vm");
const html = fs.readFileSync("index.html", "utf8");
let failed = false;

const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error("no <script> block found in index.html"); process.exit(1); }
// vm.Script compiles (parses) the code without ever running it: a safe syntax check.
try { new vm.Script(m[1], { filename: "index.inline.js" }); }
catch (e) { console.error("JS syntax error:", e.message); failed = true; }

const tells = { "em-dash": "—", "ellipsis": "…", "checkmark": "✓" };
for (const [name, ch] of Object.entries(tells)) {
  if (html.includes(ch)) { console.error(`found ${name} (${ch}) in index.html`); failed = true; }
}

if (failed) process.exit(1);
console.log("checks passed: script parses, no em-dash / ellipsis / checkmark");
