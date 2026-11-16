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
  const match = outHash === sourceHash;

  console.log(`output: ${outputPath}`);
  console.log(`output bytes: ${outSize}`);
  console.log(`output sha256: ${outHash}`);
  console.log(`source sha256: ${sourceHash}`);
  console.log(`match: ${match}`);

  if (!match) {
    process.exitCode = 1;
  }
}

main();
