export type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Lowercase<T>}${CamelToSnake<U>}`
    : `${Lowercase<T>}_${CamelToSnake<U>}`
  : S;

export type SnakeToCamel<S extends string> = S extends `${infer H}_${infer R}`
  ? `${H}${Capitalize<SnakeToCamel<R>>}`
  : S;

export type Snake<T> = {
  [K in keyof T as CamelToSnake<K & string>]: T[K];
};

export type DeepSnake<T> =
  T extends Array<infer U>
    ? Array<DeepSnake<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepSnake<U>>
      : T extends Date | RegExp | Function
        ? T
        : T extends string | number | boolean | null | undefined
          ? T
          : T extends object
            ? {
                [K in keyof T as K extends string
                  ? CamelToSnake<K>
                  : K]: DeepSnake<T[K]>;
              }
            : T;

export type DeepCamel<T> =
  T extends Array<infer U>
    ? Array<DeepCamel<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepCamel<U>>
      : T extends Date | RegExp | Function
        ? T
        : T extends string | number | boolean | null | undefined
          ? T
          : T extends object
            ? {
                [K in keyof T as K extends string
                  ? SnakeToCamel<K>
                  : K]: DeepCamel<T[K]>;
              }
            : T;

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function deepCamelize<T>(
  input: T,
  ignoreKeys: string[] = [],
): DeepCamel<T> {
  if (Array.isArray(input))
    return input.map((v) => deepCamelize(v, ignoreKeys)) as any;
  if (input instanceof Date) return input as any;
  if (input !== null && typeof input === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(input)) {
      const camelKey = ignoreKeys.includes(key) ? key : snakeToCamel(key);
      result[camelKey] = ignoreKeys.includes(key)
        ? value
        : deepCamelize(value, ignoreKeys);
    }
    return result;
  }
  return input as any;
}
