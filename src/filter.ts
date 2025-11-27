import * as minimatch from "minimatch";
import { Operator } from "./operator";

export type Filter = {
  key: string;
  operator: Operator;
  value: any;
};

export class QueryFilter {
  key: string;
  operator: Operator;
  value: any;

  constructor(filter: Filter) {
    this.key = filter.key;
    this.operator = filter.operator;
    this.value = filter.value;
  }

  public accept(key: string, value: any): boolean {
    if (key !== this.key) return true;
    if (this.operator === Operator.Eq && value !== this.value) return false;
    if (this.operator === Operator.Neq && value === this.value) return false;
    if (this.operator === Operator.Gt && value <= this.value) return false;
    if (this.operator === Operator.Lt && value >= this.value) return false;
    if (this.operator === Operator.Lte && value > this.value) return false;
    if (this.operator === Operator.Gte && value < this.value) return false;
    if (
      this.operator === Operator.In &&
      (!Array.isArray(this.value) || this.value.every((item) => item !== value))
    )
      return false;
    if (
      this.operator === Operator.NotIn &&
      Array.isArray(this.value) &&
      this.value.some((item) => item === value)
    )
      return false;
    if (
      this.operator === Operator.Contains &&
      (!Array.isArray(value) || value.every((item) => item !== this.value))
    )
      return false;
    if (
      this.operator === Operator.NotContains &&
      Array.isArray(value) &&
      value.some((item) => item === this.value)
    )
      return false;
    if (
      this.operator === Operator.Like &&
      (typeof value !== "string" ||
        typeof this.value !== "string" ||
        !minimatch.minimatch(
          value,
          this.value.replace(/%/g, "*").replace(/_/g, "?")
        ))
    )
      return false;
    if (
      this.operator === Operator.LikeCi &&
      (typeof value !== "string" ||
        typeof this.value !== "string" ||
        !minimatch.minimatch(
          value.toLowerCase(),
          this.value.toLowerCase().replace(/%/g, "*").replace(/_/g, "?")
        ))
    )
      return false;
    return true;
  }
}
