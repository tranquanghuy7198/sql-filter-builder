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
