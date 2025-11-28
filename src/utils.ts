export function excludeNull<T>(value: T[]): Exclude<T, null>[];
export function excludeNull<T extends Record<string, any>>(
  value: T
): {
  [K in keyof T]: Exclude<T[K], null>;
};

export function excludeNull(value: any): any {
  if (Array.isArray(value)) return value.filter((item) => item !== null);
  if (typeof value === "object" && value !== null)
    return Object.keys(value).reduce((acc: Record<string, any>, key) => {
      if (value[key] !== null) acc[key] = value[key];
      return acc;
    }, {});
  return value;
}

export function normalizeSqlArray(value: any[]): string {
  const normalized: string[] = [];
  for (const item of value)
    try {
      normalized.push(JSON.parse(item).toString());
    } catch {
      normalized.push(JSON.stringify(item));
    }
  return `{${normalized.join(",")}}`;
}

export const camelToSnake = (str: string): string => {
  if (str.includes("_")) return str;
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z0-9])/g, "$1_$2")
    .toLowerCase();
};
