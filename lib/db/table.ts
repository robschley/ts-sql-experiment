

import { Expression } from './expression'
import { Predicate } from './predicate'
import * as Column from './column'


export function isTable(x: any): x is Table {
  return x instanceof Table
}

export interface Selectable {
  selections(): Expression[]
}

export abstract class TableLike {
  abstract getName(): string

  public as(alias: string): TableExpression<this> {
    return new TableExpression(this, alias)
  }
}

export class TableOptions {
  readonly name?: string
}

export class Table extends TableLike {
  private readonly _name: string
  private readonly _options: TableOptions

  constructor(options?: TableOptions) {
    super()
    options = options || {}
    this._name = options.name || this.constructor.name
    this._options = options
  }

  getName(): string {
    return this._name
  }

  protected register() {
    for (let k in this) {
      let kk: keyof this = k
      if (Column.isColumn(this[kk])) {
        this.registerColumn(this[kk], kk)
      }
    }
  }

  protected registerColumn<T>(column: Column.Column<T>, name: string) {
    column.name = name
    column.table = this
  }
}

export function isTableExpression<TK extends TableLike>(x: any): x is TableExpression<TK> {
  return x instanceof TableExpression
}

export class TableExpression<TK extends TableLike> extends Expression {
  readonly table: TK
  alias: string

  constructor(table: TK, alias?: string) {
    super()
    this.table = table
    this.alias = alias || table.constructor.name
  }

  toSql(): string {
    return this.table.getName() + ' AS ' + this.alias
  }
}
