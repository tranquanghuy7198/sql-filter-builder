export enum Operator {
  Eq = "eq",
  Neq = "neq",
  Gt = "gt",
  Lt = "lt",
  Lte = "lte",
  Gte = "gte",
  LikeCi = "like_ci",
  Like = "like",
  In = "in",
  NotIn = "not in",
  Contains = "contains",
  NotContains = "not contains",
  Overlap = "overlap",
  NotOverlap = "not overlap",
}

export const operator = (op: Operator): string => {
  switch (op) {
    case Operator.Eq:
      return "=";
    case Operator.Neq:
      return "!=";
    case Operator.Gt:
      return ">";
    case Operator.Lt:
      return "<";
    case Operator.Lte:
      return "<=";
    case Operator.Gte:
      return ">=";
    case Operator.Like:
      return "like";
    case Operator.LikeCi:
      return "like";
    case Operator.NotIn:
      return "not in";
    case Operator.In:
      return "in";
    default:
      return op;
  }
};

export enum AggregateOperator {
  Min = "min",
  Max = "max",
  Sum = "sum",
  Avg = "avg",
  Count = "count",
  CountDistinct = "count distinct",
}

export const aggOperator = (
  aggOperator: AggregateOperator,
  field: string,
  alias: string = ""
): string => {
  switch (aggOperator) {
    case AggregateOperator.Min:
      return `min(${alias}${field})`;
    case AggregateOperator.Max:
      return `max(${alias}${field})`;
    case AggregateOperator.Sum:
      return `sum(${alias}${field})`;
    case AggregateOperator.Avg:
      return `avg(${alias}${field})`;
    case AggregateOperator.Count:
      return `count(${alias}${field})`;
    case AggregateOperator.CountDistinct:
      return `count(distinct ${alias}${field})`;
    default:
      return aggOperator;
  }
};
