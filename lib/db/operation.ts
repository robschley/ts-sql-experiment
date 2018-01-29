
import { isExpression, Expression } from './expression'

export abstract class Operation extends Expression {
  abstract toSql(): string
  abstract toStatement(): string
  toArguments(): Array<any> {
    return []
  }
}

export class Function<T> extends Operation {
  name: string
  args: Array<T>

  constructor(name: string, ...args: Array<T>) {
    super()
    this.name = name
    this.args = args || []
  }

  as(alias: string): FunctionExpression<T> {
    return new FunctionExpression(this, alias)
  }

  toSql(): string {
    return this.name + '(' + this.args.join(', ') + ')'
  }

  toStatement(): string {
    return this.name + '(' + this.args.map(() => '?').join(',') + ')'
  }

  toArguments(): Array<any> {
    return this.args
  }
}

export class FunctionExpression<T> extends Expression {

  fn: Function<T>
  alias: string

  constructor(fn: Function<T>, alias: string) {
    super()
    this.fn = fn
    this.alias = alias
  }

  toSql(): string {
    return `${this.fn.toSql()} AS ${this.alias}`
  }
}


// TODO: Needs to handle expressions correctly, lots of issues in here.
export abstract class Operator extends Operation {}

export abstract class ScalarOperator<T> extends Operator {
  arg: T | Expression
  constructor(arg: T | Expression) {
    super()
    this.arg = arg
  }
  toArguments(): Array<any> {
    return [ this.arg ]
  }
}

export abstract class ArrayOperator<T> extends Operator {
  args: Array<T>
  constructor(args: Array<T>) {
    super()
    this.args = args
  }
  toArguments(): Array<any> {
    return this.args
  }
}

export class Equal<T> extends ScalarOperator<T> {
  toSql(): string {
    return isExpression(this.arg) ? `= ${this.arg.toSql()}` : `= ${this.arg}`
  }
  toStatement(): string {
    return '= ?'
  }
}

export class NotEqual<T> extends ScalarOperator<T> {
  toSql(): string {
    return isExpression(this.arg) ? `!= ${this.arg.toSql()}` : `!= ${this.arg}`
  }
  toStatement(): string {
    return '!= ?'
  }
}

export class GreaterThan<T> extends ScalarOperator<T> {
  toSql(): string {
    return isExpression(this.arg) ? `> ${this.arg.toSql()}` : `> ${this.arg}`
  }
  toStatement(): string {
    return '> ?'
  }
}

export class GreaterThanOrEqual<T> extends ScalarOperator<T> {
  toSql(): string {
    return isExpression(this.arg) ? `>= ${this.arg.toSql()}` : `>= ${this.arg}`
  }
  toStatement(): string {
    return '>= ?'
  }
}

export class LessThan<T> extends ScalarOperator<T> {
  toSql(): string {
    return isExpression(this.arg) ? `< ${this.arg.toSql()}` : `< ${this.arg}`
  }
  toStatement(): string {
    return '< ?'
  }
}

export class LessThanOrEqual<T> extends ScalarOperator<T> {
  toSql(): string {
    return isExpression(this.arg) ? `<= ${this.arg.toSql()}` : `<= ${this.arg}`
  }
  toStatement(): string {
    return '<= ?'
  }
}

export class In<T> extends ArrayOperator<T> {
  toSql(): string {
    return 'IN(' + this.args.join(', ') + ')'
  }
  toStatement(): string {
    return 'IN(' + this.args.map(() => '?').join(',') + ')'
  }
}

export class NotIn<T> extends ArrayOperator<T> {
  toSql(): string {
    return 'NOT IN(' + this.args.join(', ') + ')'
  }
  toStatement(): string {
    return 'NOT IN(' + this.args.map(() => '?').join(',') + ')'
  }
}

// export class Between extends Operator {
// }

export class Like extends ScalarOperator<string> {
  arg: string

  toSql(): string {
    return isExpression(this.arg) ? `LIKE ${this.arg.toSql()}` : `LIKE ${this.arg}`
  }
  toStatement(): string {
    return 'LIKE ?'
  }
}

export class IsNull extends Operator {
  toSql(): string {
    return 'IS NULL'
  }
  toStatement(): string {
    return 'IS NULL'
  }
}

export class IsNotNull extends Operator {
  toSql(): string {
    return 'IS NOT NULL'
  }
  toStatement(): string {
    return 'IS NOT NULL'
  }
}
