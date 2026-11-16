import { readFileSync, writeFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the directory that holds this file so entry.png is always
// looked up next to main.ts, regardless of the caller's working dir.
const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.png");
const outputPath = process.argv[2]
  ? resolve(process.argv[2])
  : join(here, "out.png");

function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function main(): void {
  const sourceBytes = readFileSync(sourcePath);
  const sourceHash = sha256Hex(sourceBytes);

  // Byte-for-byte copy: no re-encoding, no metadata, fully deterministic.
  writeFileSync(outputPath, sourceBytes);

  const outBytes = readFileSync(outputPath);
  const outHash = sha256Hex(outBytes);
  const outSize = statSync(outputPath).size;
  const sourceSize = statSync(sourcePath).size;
  const match = outHash === sourceHash;
  const sizeMatch = outSize === sourceSize && outBytes.length === sourceBytes.length;

  console.log(`source: ${sourcePath}`);
  console.log(`source bytes: ${sourceSize}`);
  console.log(`output: ${outputPath}`);
  console.log(`output bytes: ${outSize}`);
  console.log(`output sha256: ${outHash}`);
  console.log(`source sha256: ${sourceHash}`);
  console.log(`hash match: ${match}`);
  console.log(`size match: ${sizeMatch}`);
  console.log(
    match && sizeMatch
      ? "verified: output is an exact byte-for-byte copy of entry.png"
      : "verification FAILED: output differs from entry.png",
  );

  if (!match || !sizeMatch) {
    process.exitCode = 1;
  }
}

main();
