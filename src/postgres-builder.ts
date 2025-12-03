import format from "string-template";
import { QueryFilter } from "./filter";
import { aggOperator, AggregateOperator, operator, Operator } from "./operator";
import { excludeNull, normalizeSqlArray } from "./utils";
import { Params, QueryParams } from "./params";

// We need index to distinguish multiple filters associated with the same column
const buildFilter = (
  filter: QueryFilter,
  index: number
): [string, Record<string, any>] => {
  const paramKey = `${filter.key}_${index}`;
  switch (filter.operator) {
    case Operator.Eq:
      return [
        format("{key} {operator} :{paramKey}", {
          key: filter.key,
          operator: filter.value !== null ? operator(filter.operator) : "IS",
          paramKey: paramKey,
        }),
        { [paramKey]: filter.value },
      ];
    case Operator.Neq:
      return [
        format("{key} {operator} :{paramKey}", {
          key: filter.key,
          operator:
            filter.value !== null ? operator(filter.operator) : "IS NOT",
          paramKey: paramKey,
        }),
        { [paramKey]: filter.value },
      ];
    case Operator.Like:
      return [
        format("{key} {operator} :{paramKey}", {
          key: filter.key,
          operator: operator(filter.operator),
          paramKey: paramKey,
        }),
        { [paramKey]: `%${filter.value}%` },
      ];
    case Operator.LikeCi:
      return [
        format("LOWER({key}) {operator} LOWER(:{paramKey})", {
          key: filter.key,
          operator: operator(filter.operator),
          paramKey: paramKey,
        }),
        { [paramKey]: `%${filter.value}%` },
      ];
    case Operator.In:
      if (Array.isArray(filter.value)) {
        if (filter.value.length === 0) return ["FALSE", {}];
        if (filter.value.some((item) => item === null)) {
          const [query, params] = buildFilter(
            new QueryFilter({
              key: filter.key,
              operator: filter.operator,
              value: excludeNull(filter.value),
            }),
            index
          );
          return [`${filter.key} IS NULL OR ${query}`, params];
        }
      }
      return [
        format("{key} IN (:{paramKey})", {
          key: filter.key,
          paramKey: paramKey,
        }),
        { [paramKey]: filter.value },
      ];
    case Operator.NotIn:
      if (Array.isArray(filter.value) && filter.value.length === 0)
        return ["TRUE", {}];
      return [
        format("{key} NOT IN (:{paramKey})", {
          key: filter.key,
          paramKey: paramKey,
        }),
        { [paramKey]: filter.value },
      ];
    case Operator.Contains:
      if (Array.isArray(filter.value) && filter.value.length === 0)
        return ["TRUE", {}];
      return [
        format("{key} @> :{paramKey}", {
          key: filter.key,
          paramKey: paramKey,
        }),
        {
          [paramKey]: normalizeSqlArray(
            Array.isArray(filter.value) ? filter.value : [filter.value]
          ),
        },
      ];
    case Operator.NotContains:
      if (Array.isArray(filter.value) && filter.value.length === 0)
        return ["FALSE", {}];
      return [
        format("NOT {key} @> :{paramKey}", {
          key: filter.key,
          paramKey: paramKey,
        }),
        {
          [paramKey]: normalizeSqlArray(
            Array.isArray(filter.value) ? filter.value : [filter.value]
          ),
        },
      ];
    case Operator.Overlap:
      if (Array.isArray(filter.value) && filter.value.length === 0)
        return ["FALSE", {}];
      return [
        format("{key} && :{paramKey}", {
          key: filter.key,
          paramKey: paramKey,
        }),
        {
          [paramKey]: normalizeSqlArray(
            Array.isArray(filter.value) ? filter.value : [filter.value]
          ),
        },
      ];
    case Operator.NotOverlap:
      if (Array.isArray(filter.value) && filter.value.length === 0)
        return ["TRUE", {}];
      return [
        format("NOT {key} && :{paramKey}", {
          key: filter.key,
          paramKey: paramKey,
        }),
        {
          [paramKey]: normalizeSqlArray(
            Array.isArray(filter.value) ? filter.value : [filter.value]
          ),
        },
      ];
    default:
      return [
        format("{key} {operator} :{paramKey}", {
          key: filter.key,
          operator: operator(filter.operator),
          paramKey: paramKey,
        }),
        { [paramKey]: filter.value },
      ];
  }
};

const buildFilters = (
  filters: QueryFilter[]
): [string, Record<string, any>] => {
  const queries: string[] = [];
  const params: Record<string, any> = {};
  filters.forEach((filter, index) => {
    const [query, param] = buildFilter(filter, index);
    queries.push(query);
    Object.assign(params, param);
  });
  queries.push("1=1");
  return [`(${queries.join(") AND (")})`, params];
};

const buildOrders = (orders: string[]): string => {
  const orderStatements: string[] = [];
  for (const order of orders) {
    let orderKey = order;
    if (orderKey.startsWith("-"))
      orderKey = `${orderKey.slice(1)} DESC NULLS LAST`;
    else orderKey = `${orderKey} ASC NULLS FIRST`;
    orderStatements.push(orderKey);
  }
  return orderStatements.join(", ");
};

const buildAggregators = (
  aggregators: Record<string, AggregateOperator>
): string => {
  const statements: string[] = [];
  for (const [field, operator] of Object.entries(aggregators)) {
    const fieldAlias = field !== "*" ? field : "total";
    statements.push(`${aggOperator(operator, field)} as ${fieldAlias}`);
  }
  return statements.join(", ");
};

export const buildTotalQuery = (
  baseSql: string,
  rawParams: Params
): [string, Record<string, any>, QueryParams] => {
  const params = new QueryParams(rawParams);
  const [querySql, queryParams] = buildFilters(params.filters);
  if (!("*" in params.totalAggregators))
    params.totalAggregators["*"] = AggregateOperator.Count;
  const aggregatorSql = buildAggregators(params.totalAggregators);
  const sqlCount = `
    with result as (
      ${baseSql}
    )
    select ${aggregatorSql}
    from result
    where ${querySql}
  `;
  return [sqlCount, queryParams, params];
};

export const buildDataQuery = (
  baseSql: string,
  rawParams: Params
): [string, Record<string, any>, QueryParams] => {
  const params = new QueryParams(rawParams);
  const [querySql, queryParams] = buildFilters(params.filters);
  const orderSql = buildOrders(params.orders);
  let sqlSelect = `
    with result as (
      ${baseSql}
    )
    select * from result
    where ${querySql}
  `;
  if (orderSql) sqlSelect = `${sqlSelect} order by ${orderSql}`;
  if (params.size > 0)
    sqlSelect = `
      ${sqlSelect}
      offset ${(params.page - 1) * params.size}
      limit ${params.size}
    `;
  return [sqlSelect, queryParams, params];
};
