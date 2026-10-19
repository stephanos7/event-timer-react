// Extract the teaching section from an actual source-file string.
// If markers are missing or misplaced, show the complete source.
export function getTeachingCode(source) {
  const startMarker = "// teaching:start";
  const endMarker = "// teaching:end";

  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);

  if (start === -1 || end <= start) {
    return source.trim();
  }

  const section = source.slice(start + startMarker.length, end);
  const lines = section
    .replace(/^\r?\n/, "")
    .trimEnd()
    .split(/\r?\n/);

  // Remove the shared indentation from nesting inside the component,
  // while preserving indentation within functions and conditionals.
  const nonEmptyLines = lines.filter((line) => line.trim() !== "");

  const indentation = Math.min(
    ...nonEmptyLines.map((line) => line.match(/^\s*/)[0].length)
  );

  if (nonEmptyLines.length === 0) {
    return "";
  }

  return lines.map((line) => line.slice(indentation)).join("\n");
}
