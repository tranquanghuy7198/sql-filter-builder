# 📦 sql-filter-builder

A lightweight, type-safe SQL filter/query builder for Node.js + TypeScript

`sql-filter-builder` allows you to:

- Build SQL queries with dynamic filters
- Keep your code clean, secure, and parameterized
- Avoid manually concatenating SQL fragments
- Use a simple, expressive API similar to ORM query builders
- Work perfectly with Sequelize, Postgres, MySQL, SQLite, etc.

## ✨ Features

- ✔️ Easy to use
- ✔️ Fully type-safe (written in TypeScript)
- ✔️ Prevents SQL injection by using parameter bindings
- ✔️ Zero dependencies
- ✔️ Flexible enough for any SQL stack

## 🚀 Installation

```sh
npm install sql-filter-builder

# or

yarn add sql-filter-builder

# or

pnpm add sql-filter-builder
```

## 🧠 Basic Usage

```ts
import { buildDataQuery, Filter, Operator, Params } from "sql-filter-builder";

const baseSql = "select colA, colB from tableX";

const params = {
  filters: [{ key: "colC", operator: Operator.Eq, value: "some-value" }],
};

const [sql, values] = buildDataQuery(baseSql, params);

console.log(sql); // SELECT colA, colB FROM tableX WHERE colC = :colC
console.log(values); // { colC: "some-value" }
```

## 🧩 Using with Sequelize

This is the most common use case:

```ts
import { Sequelize, QueryTypes } from "sequelize";
import { Filter, Operator, Params, buildDataQuery } from "sql-filter-builder";

// Initialize
const sequelize = new Sequelize(/* your configs */);

// Prepare SQL and params
const baseSql = "select colA, colB from tableX";
const params = {
  filters: [{ key: "colC", operator: Operator.Eq, value: "some-value" }],
};

// Build customized query
const [querySql, queryParams] = buildDataQuery(baseSql, params);

// Execute
const results = await sequelize.query(querySql, {
  replacements: queryParams,
  type: QueryTypes.SELECT,
});
console.log(results);
```

## Advanced Usage

Beside filters, `sql-filter-builder` supports orders and aggregators as well. How can freely filter, sort and page the results based on customized requests. The `Params` and `Filter` types are provided to make it convenient to communicate between frontend and backend.
