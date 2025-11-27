import { Filter } from "./filter";
import { AggregateOperator } from "./operator";

export class Params {
  page: number = 1;
  size: number = 10;
  filters: Filter[] = [];
  orders: string[] = [];
  breakdowns: string[] = [];
  totalAggregators: Record<string, AggregateOperator> = {};
  includeTotal: boolean = false;
  includeData: boolean = true;
  cache: boolean = false; // cache query result

  constructor(params: {
    page?: number;
    size?: number;
    filters?: Filter[];
    orders?: string[];
    breakdowns?: string[];
    totalAggregators?: Record<string, AggregateOperator>;
    includeTotal?: boolean;
    includeData?: boolean;
    cache?: boolean;
  }) {
    if (params.page) this.page = params.page;
    if (params.size) this.size = params.size;
    if (params.filters) this.filters = params.filters;
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

  public withTotal(): Params {
    this.includeTotal = true;
    return this;
  }

  public withoutTotal(): Params {
    this.includeTotal = false;
    return this;
  }

  public withData(): Params {
    this.includeData = true;
    return this;
  }

  public withoutData(): Params {
    this.includeData = false;
    return this;
  }

  public withoutPagination(): Params {
    this.size = -1;
    return this;
  }

  public withCache(): Params {
    this.cache = true;
    return this;
  }

  public withoutCache(): Params {
    this.cache = false;
    return this;
  }

  public withAllowedFilters(allowedKeys: Set<string>): Params {
    this.filters = this.filters.filter((filter) => allowedKeys.has(filter.key));
    return this;
  }

  public containsFilters(keys: Set<string>): boolean {
    return Array.from(this.filterKeys).every((key) => keys.has(key));
  }

  public validateFilters(
    allowedFilters: Set<string>,
    defaultFilters: Filter[] = []
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

  public withAllowedOrders(allowedKeys: Set<string>): Params {
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

  public withoutOrders(): Params {
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

  public excludeFilters(keys: string[]): Params {
    const newParams = Object.assign(new Params({}), this);
    newParams.filters = newParams.filters.filter(
      (filter) => !keys.includes(filter.key)
    );
    return newParams;
  }

  public replaceFilters(fromKey: string, toKey: string): Params {
    const newParams = Object.assign(new Params({}), this);
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
