

export function isExpression(x: any): x is Expression {
  return x instanceof Expression
}

export abstract class Expression {
  abstract toSql(): string
}
