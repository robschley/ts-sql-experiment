
export abstract class Driver {
  abstract escape<I, O>(I): O
  abstract quote(any): string
}
