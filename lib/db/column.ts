
import { Expression } from './expression'
import { Predicate } from './predicate'
import * as Op from './operation'
import { Table, TableLike, TableExpression } from './table'

export function isColumn<T>(x: any): x is Column<T> {
  return x instanceof Column
}

export type ColumnDefaultGenerator<T> = () => T

export class ColumnOptions<T> {
  name?: string
  defaultValue?: T | ColumnDefaultGenerator<T>
  nullable?: boolean = false
  comment?: string
}

export class Column<T> {
  name?: string
  table?: TableLike
  readonly base: T
  readonly defaultValue?: T | ColumnDefaultGenerator<T>
  readonly nullable: boolean = false
  readonly comment?: string

  constructor(options: ColumnOptions<T> = { nullable: false }) {
    this.name = options.name
    this.defaultValue = options.defaultValue
    this.nullable = options.nullable !== undefined ? options.nullable : false
    this.comment = options.comment
  }
}

export class String extends Column<string> {}
export class Number extends Column<number> {}

export class ColumnExpression<TK extends TableLike, CT, CK extends Column<CT>> extends Expression {
  readonly table: TableExpression<TK>
  readonly column: CK
  alias?: string

  constructor(table: TableExpression<TK>, column: CK, alias?: string) {
    super()
    this.table = table
    this.column = column
    this.alias = alias
  }

  eq(arg: CT | Expression): ColumnPredicate<TK, CT, CK> {
    return new ColumnPredicate(this, new Op.Equal(arg))
  }

  ne(arg: CT | Expression): ColumnPredicate<TK, CT, CK> {
    return new ColumnPredicate(this, new Op.NotEqual(arg))
  }

  gt(arg: CT | Expression): ColumnPredicate<TK, CT, CK> {
    return new ColumnPredicate(this, new Op.GreaterThan(arg))
  }

  gte(arg: CT | Expression): ColumnPredicate<TK, CT, CK> {
    return new ColumnPredicate(this, new Op.GreaterThanOrEqual(arg))
  }

  lt(arg: CT | Expression): ColumnPredicate<TK, CT, CK> {
    return new ColumnPredicate(this, new Op.LessThan(arg))
  }

  lte(arg: CT | Expression): ColumnPredicate<TK, CT, CK> {
    return new ColumnPredicate(this, new Op.LessThanOrEqual(arg))
  }

  isNull(): ColumnPredicate<TK, CT, CK> {
    return new ColumnPredicate(this, new Op.IsNull())
  }

  toSql(): string {
    let str = `${this.table.alias}.${this.column.name}`
    if (this.alias) {
      str += ` AS ${this.alias}`
    }
    return str
  }
}

export class ColumnPredicate<TK extends TableLike, CT, CK extends Column<CT>> extends Predicate {
  readonly column: ColumnExpression<TK, CT, CK>
  readonly operation: Op.Operation

  constructor(column: ColumnExpression<TK, CT, CK>, operation: Op.Operation) {
    super()
    this.column = column
    this.operation = operation
  }

  toSql(): string {
    return `${this.column.toSql()} ${this.operation.toSql()}`
  }
}
