
import { Expression } from './expression'
import { Predicate } from './predicate'
import * as Column from './column'
import { Table, TableLike, TableExpression } from './table'

// Mapped type
type TableQuery<TK extends TableLike> = {
  [P in keyof TK]: Column.ColumnExpression<TK, TK[P]['base'], TK[P]>
}

function query<TK extends TableLike>(te: TableExpression<TK>): TableQuery<TK> {
  let result = {} as TableQuery<TK>
  let table = te.table
  for (const k in table) {
    result[k] = new Column.ColumnExpression(te, table[k])
  }
  return result
}

export abstract class QueryOptions {
  where: Predicate[] = []
  limit?: number
  offset?: number
}

export class SelectQueryOptions extends QueryOptions {
  select: Expression[] = []
}

export abstract class Query {
  _where: Predicate[] = []
  _limit?: number
  _offset?: number

  abstract toSql(): string

  static find<TK1 extends TableLike, TK2 extends TableLike, TK3 extends TableLike>(t1: TableExpression<TK1>, t2: TableExpression<TK2>, t3: TableExpression<TK3>): SelectQuery3<TK1, TK2, TK3>;
  static find<TK1 extends TableLike, TK2 extends TableLike>(t1: TableExpression<TK1>, t2: TableExpression<TK2>): SelectQuery2<TK1, TK2>;
  static find<TK1 extends TableLike>(t1: TableExpression<TK1>): SelectQuery1<TK1>;
  static find(...t: any[]): Query {
    switch (t.length) {
      case 3: return new SelectQuery3(t[0], t[1], t[2])
      case 2: return new SelectQuery2(t[0], t[1])
      case 1:
      default: return new SelectQuery1(t[0])
    }
  }
}

export abstract class Query1<TK1 extends TableLike> extends Query {
  t1: TableExpression<TK1>
  tq1: TableQuery<TK1>

  constructor(t1: TableExpression<TK1>) {
    super()
    this.t1 = t1, this.tq1 = query(t1)
  }

  where(fn: (t1: TableQuery<TK1>) => Predicate): this {
    this._where.push(fn(this.tq1))
    return this
  }
}

export abstract class Query2<TK1 extends TableLike, TK2 extends TableLike> extends Query {
  t1: TableExpression<TK1>
  t2: TableExpression<TK2>

  tq1: TableQuery<TK1>
  tq2: TableQuery<TK2>

  constructor(t1: TableExpression<TK1>, t2: TableExpression<TK2>) {
    super()
    this.t1 = t1, this.tq1 = query(t1)
    this.t2 = t2, this.tq2 = query(t2)
  }

  where(fn: (t1: TableQuery<TK1>, t2: TableQuery<TK2>) => Predicate): this {
    this._where.push(fn(this.tq1, this.tq2))
    return this
  }
}

export abstract class Query3<TK1 extends TableLike, TK2 extends TableLike, TK3 extends TableLike> extends Query {
  t1: TableExpression<TK1>
  t2: TableExpression<TK2>
  t3: TableExpression<TK3>

  tq1: TableQuery<TK1>
  tq2: TableQuery<TK2>
  tq3: TableQuery<TK3>

  constructor(t1: TableExpression<TK1>, t2: TableExpression<TK2>, t3: TableExpression<TK3>) {
    super()
    this.t1 = t1, this.tq1 = query(t1)
    this.t2 = t2, this.tq2 = query(t2)
    this.t3 = t3, this.tq3 = query(t3)
  }

  where(fn: (t1: TableQuery<TK1>, t2: TableQuery<TK2>, t3: TableQuery<TK3>) => Predicate): this {
    this._where.push(fn(this.tq1, this.tq2, this.tq3))
    return this
  }
}

export class SelectQuery1<TK1 extends TableLike> extends Query1<TK1> {

  _select: Expression[] = []

  constructor(t1: TableExpression<TK1>) {
    super(t1)
  }

  select(fn: (t1: TableQuery<TK1>) => Expression[]): this {
    this._select = this._select.concat(fn(this.tq1))
    return this
  }

  // Maybe use a helper or mixin to not duplicate this code?
  toSql(): string {
    let parts = [ 'SELECT' ]
    parts.push(this._select.map(s => s.toSql()).join(', '))
    parts.push('FROM')
    parts.push(this.t1.toSql())
    if (this._where.length) {
      parts.push('WHERE')
      parts.push(this._where.map(s => s.toSql()).join(' AND '))
    }
    return parts.join(' ')
  }
}

export class SelectQuery2<TK1 extends TableLike, TK2 extends TableLike> extends Query2<TK1, TK2> {

  _select: Expression[] = []

  constructor(t1: TableExpression<TK1>, t2: TableExpression<TK2>) {
    super(t1, t2)
  }

  select(fn: (t1: TableQuery<TK1>, t2: TableQuery<TK2>) => Expression[]): this {
    this._select = this._select.concat(fn(this.tq1, this.tq2))
    return this
  }

  toSubquery(alias: string): TableExpression<TK1 & TK2> {
    let result = <TK1 & TK2>{};
    for (let id in this.t1.table) {
      if (id.substr(0, 1) === '_') {
        continue;
      }
      (<any>result)[id] = (<any>this.t1.table)[id];
    }
    for (let id in this.t2.table) {
      if (id.substr(0, 1) === '_') {
        continue;
      }
      if (!result.hasOwnProperty(id)) {
        (<any>result)[id] = (<any>this.t2.table)[id];
      }
    }
    return new TableExpression(result, alias);
  }

  // Maybe use a helper or mixin to not duplicate this code?
  toSql(): string {
    let parts = [ 'SELECT' ]
    parts.push(this._select.map(s => s.toSql()).join(', '))
    parts.push('FROM')
    parts.push(this.t1.toSql())
    if (this._where.length) {
      parts.push('WHERE')
      parts.push(this._where.map(s => s.toSql()).join(' AND '))
    }
    return parts.join(' ')
  }
}

export class SelectQuery3<TK1 extends TableLike, TK2 extends TableLike, TK3 extends TableLike> extends Query3<TK1, TK2, TK3> {

  _select: Expression[] = []

  constructor(t1: TableExpression<TK1>, t2: TableExpression<TK2>, t3: TableExpression<TK3>) {
    super(t1, t2, t3)
  }

  select(fn: (t1: TableQuery<TK1>, t2: TableQuery<TK2>, t3: TableQuery<TK3>) => Expression[]): this {
    this._select = this._select.concat(fn(this.tq1, this.tq2, this.tq3))
    return this
  }

  // Maybe use a helper or mixin to not duplicate this code?
  toSql(): string {
    let parts = [ 'SELECT' ]
    parts.push(this._select.map(s => s.toSql()).join(', '))
    parts.push('FROM')
    parts.push(this.t1.toSql())
    if (this._where.length) {
      parts.push('WHERE')
      parts.push(this._where.map(s => s.toSql()).join(' AND '))
    }
    return parts.join(' ')
  }
}
