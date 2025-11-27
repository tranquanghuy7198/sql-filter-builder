import { Filter, QueryFilter } from "./filter";
import { AggregateOperator } from "./operator";

export type Params = {
  page?: number;
  size?: number;
  filters?: Filter[];
  orders?: string[];
  breakdowns?: string[];
  totalAggregators?: Record<string, AggregateOperator>;
  includeTotal?: boolean;
  includeData?: boolean;
  cache?: boolean;
};

export class QueryParams {
  page: number = 1;
  size: number = 10;
  filters: QueryFilter[] = [];
  orders: string[] = [];
  breakdowns: string[] = [];
  totalAggregators: Record<string, AggregateOperator> = {};
  includeTotal: boolean = false;
  includeData: boolean = true;
  cache: boolean = false; // cache query result

  constructor(params: Params) {
    if (params.page) this.page = params.page;
    if (params.size) this.size = params.size;
    if (params.filters)
      this.filters = params.filters.map((filter) => new QueryFilter(filter));
    if (params.orders) this.orders = params.orders;
    if (params.breakdowns) this.breakdowns = params.breakdowns;
    if (params.totalAggregators)
      this.totalAggregators = params.totalAggregators;
    if (params.includeTotal) this.includeTotal = params.includeTotal;
    if (params.includeData) this.includeData = params.includeData;
    if (params.cache) this.cache = params.cache;
  }

  get filterKeys(): Set<string> {
    return new Set(this.filters.map((filter) => filter.key));
  }

  public withTotal(): QueryParams {
    this.includeTotal = true;
    return this;
  }

  public withoutTotal(): QueryParams {
    this.includeTotal = false;
    return this;
  }

  public withData(): QueryParams {
    this.includeData = true;
    return this;
  }

  public withoutData(): QueryParams {
    this.includeData = false;
    return this;
  }

  public withoutPagination(): QueryParams {
    this.size = -1;
    return this;
  }

  public withCache(): QueryParams {
    this.cache = true;
    return this;
  }

  public withoutCache(): QueryParams {
    this.cache = false;
    return this;
  }

  public withAllowedFilters(allowedKeys: Set<string>): QueryParams {
    this.filters = this.filters.filter((filter) => allowedKeys.has(filter.key));
    return this;
  }

  public containsFilters(keys: Set<string>): boolean {
    return Array.from(this.filterKeys).every((key) => keys.has(key));
  }

  public validateFilters(
    allowedFilters: Set<string>,
    defaultFilters: QueryFilter[] = []
  ) {
    if (!this.containsFilters(allowedFilters))
      throw new Error(
        `One of filters is not allowed. Allowed filters: ${Array.from(
          allowedFilters
        ).join(", ")}`
      );
    for (const filter of defaultFilters)
      if (!this.filterKeys.has(filter.key)) this.filters.push(filter);
  }

  public withAllowedOrders(allowedKeys: Set<string>): QueryParams {
    this.orders = this.orders.filter((order) => allowedKeys.has(order));
    return this;
  }

  public containsOrders(keys: Set<string>): boolean {
    return Array.from(this.orders).every((key) => keys.has(key));
  }

  public validateOrders(
    allowedOrders: Set<string>,
    defaultOrders: string[] = []
  ) {
    if (!this.containsOrders(allowedOrders))
      throw new Error(
        `One of orders is not allowed. Allowed orders: ${Array.from(
          allowedOrders
        ).join(", ")}`
      );
    if (this.orders.length === 0) this.orders = defaultOrders;
  }

  public rewriteOrders(rewriter: Record<string, string>) {
    for (const [index, order] of this.orders.entries())
      for (const [originField, rewriteField] of Object.entries(rewriter))
        if (order === originField) this.orders[index] = rewriteField;
  }

  public withoutOrders(): QueryParams {
    this.orders = [];
    return this;
  }

  public containsBreakdowns(keys: Set<string>): boolean {
    return Array.from(this.breakdowns).every((key) => keys.has(key));
  }

  public validateBreakdowns(
    allowedBreakdowns: Set<string>,
    defaultBreakdowns: string[] = []
  ) {
    this.breakdowns =
      this.breakdowns.length > 0 ? this.breakdowns : defaultBreakdowns;
    if (!this.containsBreakdowns(allowedBreakdowns))
      throw new Error(
        `One of breakdowns is not allowed. Allowed breakdowns: ${Array.from(
          allowedBreakdowns
        ).join(", ")}`
      );
  }

  public accept(key: string, value: any): boolean {
    return this.filters.every((filter) => filter.accept(key, value));
  }

  public excludeFilters(keys: string[]): QueryParams {
    const newParams = Object.assign(new QueryParams({}), this);
    newParams.filters = newParams.filters.filter(
      (filter) => !keys.includes(filter.key)
    );
    return newParams;
  }

  public replaceFilters(fromKey: string, toKey: string): QueryParams {
    const newParams = Object.assign(new QueryParams({}), this);
    for (const filter of newParams.filters)
      if (filter.key === fromKey) filter.key = toKey;
    return newParams;
  }

  public containsAggregatedFields(keys: Set<string>): boolean {
    return Array.from(Object.keys(this.totalAggregators)).every((key) =>
      keys.has(key)
    );
  }

  public validateAggregatedFields(allowedFields: Set<string>) {
    if (!this.containsAggregatedFields(allowedFields))
      throw new Error(
        `One of aggregated fields is not allowed. Allowed fields: ${Array.from(
          allowedFields
        ).join(", ")}`
      );
  }
}
