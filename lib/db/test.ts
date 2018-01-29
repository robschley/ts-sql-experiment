

import { Expression } from './expression'
import { Predicate } from './predicate'
import * as Op from './operation'
import * as Column from './column'
import { Table, TableLike, TableExpression } from './table'
import { Query } from './query'

namespace db {

  // Obviously not safe. Use DB driver escape.
  function escape(arg: any) {
    if (typeof arg === 'number') {
      return arg
    }
    else {
      return `"${arg}"`
    }
  }

  export class User extends Table {
    id = new Column.Number({ name: 'id' }) // Remove redundant name property through column registration.
    firstName = new Column.String({ name: 'firstName' })
    order = new Column.Number({ name: 'order' })
  }

  export class Avatar extends Table {
    id = new Column.Number({ name: 'id' })
    url = new Column.String({ name: 'url' })
    userId = new Column.Number({ name: 'userId' })
  }

  export class Content extends Table {
    id = new Column.Number({ name: 'id' })
    name = new Column.String({ name: 'name' })
    slug = new Column.String({ name: 'slug' })
    userId = new Column.Number({ name: 'userId' })
  }

  const Users = new User().as('u');
  const Avatars = new Avatar().as('a');
  const Contents = new Content().as('c');

  const NOW = new Op.Function('NOW')
  const UNIX_TIMESTAMP = new Op.Function('UNIX_TIMESTAMP')

  let q1 = Query
    .find(Users)
    .select((u) => [ u.id, u.firstName, NOW.as('now') ])
    .where((u) => u.id.gt(4))
  console.log(q1.toSql())

  let q2 = Query
    .find(Users, Avatars)
    .select((u, a) => [ u.firstName, a.url ])
    .where((u, a) => a.userId.eq(u.id))
  console.log(q2.toSql())

  let q3 = Query
    .find(Users, Avatars, Contents)
    .select((u, a, c) => [ u.firstName, a.url, c.name, c.slug ])
    .where((u, a, c) => a.userId.eq(u.id))
  console.log(q3.toSql())

  let q4 = Query.find(q2.toSubquery('b'), Contents).select((s, c) => [s.id, c.name, c.slug])
  // console.log(q4.toSql())
}
