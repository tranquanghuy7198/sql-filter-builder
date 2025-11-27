```ts
import { Sequelize } from "sequelize";
import { buildDataQuery, Filter, Operator } from "sql-filter-builder";

// Initialize
const sequelize = new Sequelize(/* your configs */);

// Prepare SQL and params
const baseSql = "select colA, colB from tableX";
const params = { filters: [new Filter("colC", Operator.Eq, "some-value")] };

// Build customize query
const [querySql, queryParams] = buildDataQuery(baseSql, params);

// Execute
const results = await sequelize.query(querySql, {
  replacements: queryParams,
  type: QueryTypes.SELECT,
});
```
