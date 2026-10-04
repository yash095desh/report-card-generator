/** "SOCIAL SCIENCE" → "Social Science", keeping EVS in capitals. */
export const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/(^|[\s(\-&/])([a-z])/g, (_, p: string, c: string) => p + c.toUpperCase())
    .replace(/\bEvs\b/, "EVS");
