
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Project
 * 
 */
export type Project = $Result.DefaultSelection<Prisma.$ProjectPayload>
/**
 * Model Section
 * 
 */
export type Section = $Result.DefaultSelection<Prisma.$SectionPayload>
/**
 * Model Beteckning
 * 
 */
export type Beteckning = $Result.DefaultSelection<Prisma.$BeteckningPayload>
/**
 * Model Employee
 * 
 */
export type Employee = $Result.DefaultSelection<Prisma.$EmployeePayload>
/**
 * Model Row
 * 
 */
export type Row = $Result.DefaultSelection<Prisma.$RowPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.project`: Exposes CRUD operations for the **Project** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Projects
    * const projects = await prisma.project.findMany()
    * ```
    */
  get project(): Prisma.ProjectDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.section`: Exposes CRUD operations for the **Section** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sections
    * const sections = await prisma.section.findMany()
    * ```
    */
  get section(): Prisma.SectionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.beteckning`: Exposes CRUD operations for the **Beteckning** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Betecknings
    * const betecknings = await prisma.beteckning.findMany()
    * ```
    */
  get beteckning(): Prisma.BeteckningDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.employee`: Exposes CRUD operations for the **Employee** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Employees
    * const employees = await prisma.employee.findMany()
    * ```
    */
  get employee(): Prisma.EmployeeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.row`: Exposes CRUD operations for the **Row** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Rows
    * const rows = await prisma.row.findMany()
    * ```
    */
  get row(): Prisma.RowDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.9.0
   * Query Engine version: 81e4af48011447c3cc503a190e86995b66d2a28e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Project: 'Project',
    Section: 'Section',
    Beteckning: 'Beteckning',
    Employee: 'Employee',
    Row: 'Row'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "project" | "section" | "beteckning" | "employee" | "row"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Project: {
        payload: Prisma.$ProjectPayload<ExtArgs>
        fields: Prisma.ProjectFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProjectFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProjectFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findFirst: {
            args: Prisma.ProjectFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProjectFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          findMany: {
            args: Prisma.ProjectFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          create: {
            args: Prisma.ProjectCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          createMany: {
            args: Prisma.ProjectCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProjectCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          delete: {
            args: Prisma.ProjectDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          update: {
            args: Prisma.ProjectUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          deleteMany: {
            args: Prisma.ProjectDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProjectUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProjectUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>[]
          }
          upsert: {
            args: Prisma.ProjectUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProjectPayload>
          }
          aggregate: {
            args: Prisma.ProjectAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProject>
          }
          groupBy: {
            args: Prisma.ProjectGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProjectGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProjectCountArgs<ExtArgs>
            result: $Utils.Optional<ProjectCountAggregateOutputType> | number
          }
        }
      }
      Section: {
        payload: Prisma.$SectionPayload<ExtArgs>
        fields: Prisma.SectionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SectionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SectionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionPayload>
          }
          findFirst: {
            args: Prisma.SectionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SectionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionPayload>
          }
          findMany: {
            args: Prisma.SectionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionPayload>[]
          }
          create: {
            args: Prisma.SectionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionPayload>
          }
          createMany: {
            args: Prisma.SectionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SectionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionPayload>[]
          }
          delete: {
            args: Prisma.SectionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionPayload>
          }
          update: {
            args: Prisma.SectionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionPayload>
          }
          deleteMany: {
            args: Prisma.SectionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SectionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SectionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionPayload>[]
          }
          upsert: {
            args: Prisma.SectionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SectionPayload>
          }
          aggregate: {
            args: Prisma.SectionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSection>
          }
          groupBy: {
            args: Prisma.SectionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SectionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SectionCountArgs<ExtArgs>
            result: $Utils.Optional<SectionCountAggregateOutputType> | number
          }
        }
      }
      Beteckning: {
        payload: Prisma.$BeteckningPayload<ExtArgs>
        fields: Prisma.BeteckningFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BeteckningFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BeteckningPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BeteckningFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BeteckningPayload>
          }
          findFirst: {
            args: Prisma.BeteckningFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BeteckningPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BeteckningFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BeteckningPayload>
          }
          findMany: {
            args: Prisma.BeteckningFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BeteckningPayload>[]
          }
          create: {
            args: Prisma.BeteckningCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BeteckningPayload>
          }
          createMany: {
            args: Prisma.BeteckningCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BeteckningCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BeteckningPayload>[]
          }
          delete: {
            args: Prisma.BeteckningDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BeteckningPayload>
          }
          update: {
            args: Prisma.BeteckningUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BeteckningPayload>
          }
          deleteMany: {
            args: Prisma.BeteckningDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BeteckningUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BeteckningUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BeteckningPayload>[]
          }
          upsert: {
            args: Prisma.BeteckningUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BeteckningPayload>
          }
          aggregate: {
            args: Prisma.BeteckningAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBeteckning>
          }
          groupBy: {
            args: Prisma.BeteckningGroupByArgs<ExtArgs>
            result: $Utils.Optional<BeteckningGroupByOutputType>[]
          }
          count: {
            args: Prisma.BeteckningCountArgs<ExtArgs>
            result: $Utils.Optional<BeteckningCountAggregateOutputType> | number
          }
        }
      }
      Employee: {
        payload: Prisma.$EmployeePayload<ExtArgs>
        fields: Prisma.EmployeeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmployeeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmployeeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          findFirst: {
            args: Prisma.EmployeeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmployeeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          findMany: {
            args: Prisma.EmployeeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>[]
          }
          create: {
            args: Prisma.EmployeeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          createMany: {
            args: Prisma.EmployeeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmployeeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>[]
          }
          delete: {
            args: Prisma.EmployeeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          update: {
            args: Prisma.EmployeeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          deleteMany: {
            args: Prisma.EmployeeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmployeeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EmployeeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>[]
          }
          upsert: {
            args: Prisma.EmployeeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          aggregate: {
            args: Prisma.EmployeeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmployee>
          }
          groupBy: {
            args: Prisma.EmployeeGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmployeeGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmployeeCountArgs<ExtArgs>
            result: $Utils.Optional<EmployeeCountAggregateOutputType> | number
          }
        }
      }
      Row: {
        payload: Prisma.$RowPayload<ExtArgs>
        fields: Prisma.RowFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RowFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RowPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RowFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RowPayload>
          }
          findFirst: {
            args: Prisma.RowFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RowPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RowFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RowPayload>
          }
          findMany: {
            args: Prisma.RowFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RowPayload>[]
          }
          create: {
            args: Prisma.RowCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RowPayload>
          }
          createMany: {
            args: Prisma.RowCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RowCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RowPayload>[]
          }
          delete: {
            args: Prisma.RowDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RowPayload>
          }
          update: {
            args: Prisma.RowUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RowPayload>
          }
          deleteMany: {
            args: Prisma.RowDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RowUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RowUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RowPayload>[]
          }
          upsert: {
            args: Prisma.RowUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RowPayload>
          }
          aggregate: {
            args: Prisma.RowAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRow>
          }
          groupBy: {
            args: Prisma.RowGroupByArgs<ExtArgs>
            result: $Utils.Optional<RowGroupByOutputType>[]
          }
          count: {
            args: Prisma.RowCountArgs<ExtArgs>
            result: $Utils.Optional<RowCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    project?: ProjectOmit
    section?: SectionOmit
    beteckning?: BeteckningOmit
    employee?: EmployeeOmit
    row?: RowOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    projects: number
    employees: number
    employerOf: number
    createdRows: number
    approvedRows: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    projects?: boolean | UserCountOutputTypeCountProjectsArgs
    employees?: boolean | UserCountOutputTypeCountEmployeesArgs
    employerOf?: boolean | UserCountOutputTypeCountEmployerOfArgs
    createdRows?: boolean | UserCountOutputTypeCountCreatedRowsArgs
    approvedRows?: boolean | UserCountOutputTypeCountApprovedRowsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountProjectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProjectWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountEmployeesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmployeeWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountEmployerOfArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmployeeWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCreatedRowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RowWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountApprovedRowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RowWhereInput
  }


  /**
   * Count Type ProjectCountOutputType
   */

  export type ProjectCountOutputType = {
    sections: number
    beteckningar: number
    tsmRows: number
  }

  export type ProjectCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sections?: boolean | ProjectCountOutputTypeCountSectionsArgs
    beteckningar?: boolean | ProjectCountOutputTypeCountBeteckningarArgs
    tsmRows?: boolean | ProjectCountOutputTypeCountTsmRowsArgs
  }

  // Custom InputTypes
  /**
   * ProjectCountOutputType without action
   */
  export type ProjectCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProjectCountOutputType
     */
    select?: ProjectCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProjectCountOutputType without action
   */
  export type ProjectCountOutputTypeCountSectionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SectionWhereInput
  }

  /**
   * ProjectCountOutputType without action
   */
  export type ProjectCountOutputTypeCountBeteckningarArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BeteckningWhereInput
  }

  /**
   * ProjectCountOutputType without action
   */
  export type ProjectCountOutputTypeCountTsmRowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RowWhereInput
  }


  /**
   * Count Type SectionCountOutputType
   */

  export type SectionCountOutputType = {
    rows: number
  }

  export type SectionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rows?: boolean | SectionCountOutputTypeCountRowsArgs
  }

  // Custom InputTypes
  /**
   * SectionCountOutputType without action
   */
  export type SectionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SectionCountOutputType
     */
    select?: SectionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SectionCountOutputType without action
   */
  export type SectionCountOutputTypeCountRowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RowWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    email: string | null
    password: string | null
    phone: string | null
    company: string | null
    role: string | null
    firstName: string | null
    lastName: string | null
    signature: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    email: string | null
    password: string | null
    phone: string | null
    company: string | null
    role: string | null
    firstName: string | null
    lastName: string | null
    signature: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    password: number
    phone: number
    company: number
    role: number
    firstName: number
    lastName: number
    signature: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    phone?: true
    company?: true
    role?: true
    firstName?: true
    lastName?: true
    signature?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    phone?: true
    company?: true
    role?: true
    firstName?: true
    lastName?: true
    signature?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    phone?: true
    company?: true
    role?: true
    firstName?: true
    lastName?: true
    signature?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    email: string
    password: string
    phone: string | null
    company: string | null
    role: string
    firstName: string | null
    lastName: string | null
    signature: string | null
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    phone?: boolean
    company?: boolean
    role?: boolean
    firstName?: boolean
    lastName?: boolean
    signature?: boolean
    projects?: boolean | User$projectsArgs<ExtArgs>
    employees?: boolean | User$employeesArgs<ExtArgs>
    employerOf?: boolean | User$employerOfArgs<ExtArgs>
    createdRows?: boolean | User$createdRowsArgs<ExtArgs>
    approvedRows?: boolean | User$approvedRowsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    phone?: boolean
    company?: boolean
    role?: boolean
    firstName?: boolean
    lastName?: boolean
    signature?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    phone?: boolean
    company?: boolean
    role?: boolean
    firstName?: boolean
    lastName?: boolean
    signature?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    phone?: boolean
    company?: boolean
    role?: boolean
    firstName?: boolean
    lastName?: boolean
    signature?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "password" | "phone" | "company" | "role" | "firstName" | "lastName" | "signature", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    projects?: boolean | User$projectsArgs<ExtArgs>
    employees?: boolean | User$employeesArgs<ExtArgs>
    employerOf?: boolean | User$employerOfArgs<ExtArgs>
    createdRows?: boolean | User$createdRowsArgs<ExtArgs>
    approvedRows?: boolean | User$approvedRowsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      projects: Prisma.$ProjectPayload<ExtArgs>[]
      employees: Prisma.$EmployeePayload<ExtArgs>[]
      employerOf: Prisma.$EmployeePayload<ExtArgs>[]
      createdRows: Prisma.$RowPayload<ExtArgs>[]
      approvedRows: Prisma.$RowPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      email: string
      password: string
      phone: string | null
      company: string | null
      role: string
      firstName: string | null
      lastName: string | null
      signature: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    projects<T extends User$projectsArgs<ExtArgs> = {}>(args?: Subset<T, User$projectsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    employees<T extends User$employeesArgs<ExtArgs> = {}>(args?: Subset<T, User$employeesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    employerOf<T extends User$employerOfArgs<ExtArgs> = {}>(args?: Subset<T, User$employerOfArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    createdRows<T extends User$createdRowsArgs<ExtArgs> = {}>(args?: Subset<T, User$createdRowsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    approvedRows<T extends User$approvedRowsArgs<ExtArgs> = {}>(args?: Subset<T, User$approvedRowsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly email: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly company: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly signature: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.projects
   */
  export type User$projectsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    where?: ProjectWhereInput
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    cursor?: ProjectWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * User.employees
   */
  export type User$employeesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    where?: EmployeeWhereInput
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    cursor?: EmployeeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }

  /**
   * User.employerOf
   */
  export type User$employerOfArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    where?: EmployeeWhereInput
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    cursor?: EmployeeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }

  /**
   * User.createdRows
   */
  export type User$createdRowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    where?: RowWhereInput
    orderBy?: RowOrderByWithRelationInput | RowOrderByWithRelationInput[]
    cursor?: RowWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RowScalarFieldEnum | RowScalarFieldEnum[]
  }

  /**
   * User.approvedRows
   */
  export type User$approvedRowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    where?: RowWhereInput
    orderBy?: RowOrderByWithRelationInput | RowOrderByWithRelationInput[]
    cursor?: RowWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RowScalarFieldEnum | RowScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Project
   */

  export type AggregateProject = {
    _count: ProjectCountAggregateOutputType | null
    _avg: ProjectAvgAggregateOutputType | null
    _sum: ProjectSumAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  export type ProjectAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type ProjectSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type ProjectMinAggregateOutputType = {
    id: number | null
    name: string | null
    userId: number | null
    createdAt: Date | null
    startDate: string | null
    startTime: string | null
    endDate: string | null
    endTime: string | null
    plats: string | null
    namn: string | null
    telefonnummer: string | null
  }

  export type ProjectMaxAggregateOutputType = {
    id: number | null
    name: string | null
    userId: number | null
    createdAt: Date | null
    startDate: string | null
    startTime: string | null
    endDate: string | null
    endTime: string | null
    plats: string | null
    namn: string | null
    telefonnummer: string | null
  }

  export type ProjectCountAggregateOutputType = {
    id: number
    name: number
    userId: number
    createdAt: number
    startDate: number
    startTime: number
    endDate: number
    endTime: number
    plats: number
    namn: number
    telefonnummer: number
    rows: number
    anteckningar: number
    _all: number
  }


  export type ProjectAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type ProjectSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type ProjectMinAggregateInputType = {
    id?: true
    name?: true
    userId?: true
    createdAt?: true
    startDate?: true
    startTime?: true
    endDate?: true
    endTime?: true
    plats?: true
    namn?: true
    telefonnummer?: true
  }

  export type ProjectMaxAggregateInputType = {
    id?: true
    name?: true
    userId?: true
    createdAt?: true
    startDate?: true
    startTime?: true
    endDate?: true
    endTime?: true
    plats?: true
    namn?: true
    telefonnummer?: true
  }

  export type ProjectCountAggregateInputType = {
    id?: true
    name?: true
    userId?: true
    createdAt?: true
    startDate?: true
    startTime?: true
    endDate?: true
    endTime?: true
    plats?: true
    namn?: true
    telefonnummer?: true
    rows?: true
    anteckningar?: true
    _all?: true
  }

  export type ProjectAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Project to aggregate.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Projects
    **/
    _count?: true | ProjectCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProjectAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProjectSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProjectMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProjectMaxAggregateInputType
  }

  export type GetProjectAggregateType<T extends ProjectAggregateArgs> = {
        [P in keyof T & keyof AggregateProject]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProject[P]>
      : GetScalarType<T[P], AggregateProject[P]>
  }




  export type ProjectGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProjectWhereInput
    orderBy?: ProjectOrderByWithAggregationInput | ProjectOrderByWithAggregationInput[]
    by: ProjectScalarFieldEnum[] | ProjectScalarFieldEnum
    having?: ProjectScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProjectCountAggregateInputType | true
    _avg?: ProjectAvgAggregateInputType
    _sum?: ProjectSumAggregateInputType
    _min?: ProjectMinAggregateInputType
    _max?: ProjectMaxAggregateInputType
  }

  export type ProjectGroupByOutputType = {
    id: number
    name: string
    userId: number | null
    createdAt: Date
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows: JsonValue | null
    anteckningar: JsonValue | null
    _count: ProjectCountAggregateOutputType | null
    _avg: ProjectAvgAggregateOutputType | null
    _sum: ProjectSumAggregateOutputType | null
    _min: ProjectMinAggregateOutputType | null
    _max: ProjectMaxAggregateOutputType | null
  }

  type GetProjectGroupByPayload<T extends ProjectGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProjectGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProjectGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProjectGroupByOutputType[P]>
            : GetScalarType<T[P], ProjectGroupByOutputType[P]>
        }
      >
    >


  export type ProjectSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    userId?: boolean
    createdAt?: boolean
    startDate?: boolean
    startTime?: boolean
    endDate?: boolean
    endTime?: boolean
    plats?: boolean
    namn?: boolean
    telefonnummer?: boolean
    rows?: boolean
    anteckningar?: boolean
    user?: boolean | Project$userArgs<ExtArgs>
    sections?: boolean | Project$sectionsArgs<ExtArgs>
    beteckningar?: boolean | Project$beteckningarArgs<ExtArgs>
    tsmRows?: boolean | Project$tsmRowsArgs<ExtArgs>
    _count?: boolean | ProjectCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    userId?: boolean
    createdAt?: boolean
    startDate?: boolean
    startTime?: boolean
    endDate?: boolean
    endTime?: boolean
    plats?: boolean
    namn?: boolean
    telefonnummer?: boolean
    rows?: boolean
    anteckningar?: boolean
    user?: boolean | Project$userArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    userId?: boolean
    createdAt?: boolean
    startDate?: boolean
    startTime?: boolean
    endDate?: boolean
    endTime?: boolean
    plats?: boolean
    namn?: boolean
    telefonnummer?: boolean
    rows?: boolean
    anteckningar?: boolean
    user?: boolean | Project$userArgs<ExtArgs>
  }, ExtArgs["result"]["project"]>

  export type ProjectSelectScalar = {
    id?: boolean
    name?: boolean
    userId?: boolean
    createdAt?: boolean
    startDate?: boolean
    startTime?: boolean
    endDate?: boolean
    endTime?: boolean
    plats?: boolean
    namn?: boolean
    telefonnummer?: boolean
    rows?: boolean
    anteckningar?: boolean
  }

  export type ProjectOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "userId" | "createdAt" | "startDate" | "startTime" | "endDate" | "endTime" | "plats" | "namn" | "telefonnummer" | "rows" | "anteckningar", ExtArgs["result"]["project"]>
  export type ProjectInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Project$userArgs<ExtArgs>
    sections?: boolean | Project$sectionsArgs<ExtArgs>
    beteckningar?: boolean | Project$beteckningarArgs<ExtArgs>
    tsmRows?: boolean | Project$tsmRowsArgs<ExtArgs>
    _count?: boolean | ProjectCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProjectIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Project$userArgs<ExtArgs>
  }
  export type ProjectIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | Project$userArgs<ExtArgs>
  }

  export type $ProjectPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Project"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
      sections: Prisma.$SectionPayload<ExtArgs>[]
      beteckningar: Prisma.$BeteckningPayload<ExtArgs>[]
      tsmRows: Prisma.$RowPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      userId: number | null
      createdAt: Date
      startDate: string
      startTime: string
      endDate: string
      endTime: string
      plats: string
      namn: string
      telefonnummer: string
      rows: Prisma.JsonValue | null
      anteckningar: Prisma.JsonValue | null
    }, ExtArgs["result"]["project"]>
    composites: {}
  }

  type ProjectGetPayload<S extends boolean | null | undefined | ProjectDefaultArgs> = $Result.GetResult<Prisma.$ProjectPayload, S>

  type ProjectCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProjectFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProjectCountAggregateInputType | true
    }

  export interface ProjectDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Project'], meta: { name: 'Project' } }
    /**
     * Find zero or one Project that matches the filter.
     * @param {ProjectFindUniqueArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProjectFindUniqueArgs>(args: SelectSubset<T, ProjectFindUniqueArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Project that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProjectFindUniqueOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProjectFindUniqueOrThrowArgs>(args: SelectSubset<T, ProjectFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProjectFindFirstArgs>(args?: SelectSubset<T, ProjectFindFirstArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Project that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindFirstOrThrowArgs} args - Arguments to find a Project
     * @example
     * // Get one Project
     * const project = await prisma.project.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProjectFindFirstOrThrowArgs>(args?: SelectSubset<T, ProjectFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Projects that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Projects
     * const projects = await prisma.project.findMany()
     * 
     * // Get first 10 Projects
     * const projects = await prisma.project.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const projectWithIdOnly = await prisma.project.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProjectFindManyArgs>(args?: SelectSubset<T, ProjectFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Project.
     * @param {ProjectCreateArgs} args - Arguments to create a Project.
     * @example
     * // Create one Project
     * const Project = await prisma.project.create({
     *   data: {
     *     // ... data to create a Project
     *   }
     * })
     * 
     */
    create<T extends ProjectCreateArgs>(args: SelectSubset<T, ProjectCreateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Projects.
     * @param {ProjectCreateManyArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProjectCreateManyArgs>(args?: SelectSubset<T, ProjectCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Projects and returns the data saved in the database.
     * @param {ProjectCreateManyAndReturnArgs} args - Arguments to create many Projects.
     * @example
     * // Create many Projects
     * const project = await prisma.project.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProjectCreateManyAndReturnArgs>(args?: SelectSubset<T, ProjectCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Project.
     * @param {ProjectDeleteArgs} args - Arguments to delete one Project.
     * @example
     * // Delete one Project
     * const Project = await prisma.project.delete({
     *   where: {
     *     // ... filter to delete one Project
     *   }
     * })
     * 
     */
    delete<T extends ProjectDeleteArgs>(args: SelectSubset<T, ProjectDeleteArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Project.
     * @param {ProjectUpdateArgs} args - Arguments to update one Project.
     * @example
     * // Update one Project
     * const project = await prisma.project.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProjectUpdateArgs>(args: SelectSubset<T, ProjectUpdateArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Projects.
     * @param {ProjectDeleteManyArgs} args - Arguments to filter Projects to delete.
     * @example
     * // Delete a few Projects
     * const { count } = await prisma.project.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProjectDeleteManyArgs>(args?: SelectSubset<T, ProjectDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProjectUpdateManyArgs>(args: SelectSubset<T, ProjectUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Projects and returns the data updated in the database.
     * @param {ProjectUpdateManyAndReturnArgs} args - Arguments to update many Projects.
     * @example
     * // Update many Projects
     * const project = await prisma.project.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Projects and only return the `id`
     * const projectWithIdOnly = await prisma.project.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProjectUpdateManyAndReturnArgs>(args: SelectSubset<T, ProjectUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Project.
     * @param {ProjectUpsertArgs} args - Arguments to update or create a Project.
     * @example
     * // Update or create a Project
     * const project = await prisma.project.upsert({
     *   create: {
     *     // ... data to create a Project
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Project we want to update
     *   }
     * })
     */
    upsert<T extends ProjectUpsertArgs>(args: SelectSubset<T, ProjectUpsertArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Projects.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectCountArgs} args - Arguments to filter Projects to count.
     * @example
     * // Count the number of Projects
     * const count = await prisma.project.count({
     *   where: {
     *     // ... the filter for the Projects we want to count
     *   }
     * })
    **/
    count<T extends ProjectCountArgs>(
      args?: Subset<T, ProjectCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProjectCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProjectAggregateArgs>(args: Subset<T, ProjectAggregateArgs>): Prisma.PrismaPromise<GetProjectAggregateType<T>>

    /**
     * Group by Project.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProjectGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProjectGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProjectGroupByArgs['orderBy'] }
        : { orderBy?: ProjectGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProjectGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProjectGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Project model
   */
  readonly fields: ProjectFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Project.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProjectClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends Project$userArgs<ExtArgs> = {}>(args?: Subset<T, Project$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    sections<T extends Project$sectionsArgs<ExtArgs> = {}>(args?: Subset<T, Project$sectionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    beteckningar<T extends Project$beteckningarArgs<ExtArgs> = {}>(args?: Subset<T, Project$beteckningarArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tsmRows<T extends Project$tsmRowsArgs<ExtArgs> = {}>(args?: Subset<T, Project$tsmRowsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Project model
   */
  interface ProjectFieldRefs {
    readonly id: FieldRef<"Project", 'Int'>
    readonly name: FieldRef<"Project", 'String'>
    readonly userId: FieldRef<"Project", 'Int'>
    readonly createdAt: FieldRef<"Project", 'DateTime'>
    readonly startDate: FieldRef<"Project", 'String'>
    readonly startTime: FieldRef<"Project", 'String'>
    readonly endDate: FieldRef<"Project", 'String'>
    readonly endTime: FieldRef<"Project", 'String'>
    readonly plats: FieldRef<"Project", 'String'>
    readonly namn: FieldRef<"Project", 'String'>
    readonly telefonnummer: FieldRef<"Project", 'String'>
    readonly rows: FieldRef<"Project", 'Json'>
    readonly anteckningar: FieldRef<"Project", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * Project findUnique
   */
  export type ProjectFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findUniqueOrThrow
   */
  export type ProjectFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project findFirst
   */
  export type ProjectFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findFirstOrThrow
   */
  export type ProjectFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Project to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Projects.
     */
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project findMany
   */
  export type ProjectFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter, which Projects to fetch.
     */
    where?: ProjectWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Projects to fetch.
     */
    orderBy?: ProjectOrderByWithRelationInput | ProjectOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Projects.
     */
    cursor?: ProjectWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Projects from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Projects.
     */
    skip?: number
    distinct?: ProjectScalarFieldEnum | ProjectScalarFieldEnum[]
  }

  /**
   * Project create
   */
  export type ProjectCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The data needed to create a Project.
     */
    data: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
  }

  /**
   * Project createMany
   */
  export type ProjectCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Project createManyAndReturn
   */
  export type ProjectCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to create many Projects.
     */
    data: ProjectCreateManyInput | ProjectCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Project update
   */
  export type ProjectUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The data needed to update a Project.
     */
    data: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
    /**
     * Choose, which Project to update.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project updateMany
   */
  export type ProjectUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
  }

  /**
   * Project updateManyAndReturn
   */
  export type ProjectUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * The data used to update Projects.
     */
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyInput>
    /**
     * Filter which Projects to update
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Project upsert
   */
  export type ProjectUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * The filter to search for the Project to update in case it exists.
     */
    where: ProjectWhereUniqueInput
    /**
     * In case the Project found by the `where` argument doesn't exist, create a new Project with this data.
     */
    create: XOR<ProjectCreateInput, ProjectUncheckedCreateInput>
    /**
     * In case the Project was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProjectUpdateInput, ProjectUncheckedUpdateInput>
  }

  /**
   * Project delete
   */
  export type ProjectDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
    /**
     * Filter which Project to delete.
     */
    where: ProjectWhereUniqueInput
  }

  /**
   * Project deleteMany
   */
  export type ProjectDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Projects to delete
     */
    where?: ProjectWhereInput
    /**
     * Limit how many Projects to delete.
     */
    limit?: number
  }

  /**
   * Project.user
   */
  export type Project$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Project.sections
   */
  export type Project$sectionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
    where?: SectionWhereInput
    orderBy?: SectionOrderByWithRelationInput | SectionOrderByWithRelationInput[]
    cursor?: SectionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SectionScalarFieldEnum | SectionScalarFieldEnum[]
  }

  /**
   * Project.beteckningar
   */
  export type Project$beteckningarArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningInclude<ExtArgs> | null
    where?: BeteckningWhereInput
    orderBy?: BeteckningOrderByWithRelationInput | BeteckningOrderByWithRelationInput[]
    cursor?: BeteckningWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BeteckningScalarFieldEnum | BeteckningScalarFieldEnum[]
  }

  /**
   * Project.tsmRows
   */
  export type Project$tsmRowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    where?: RowWhereInput
    orderBy?: RowOrderByWithRelationInput | RowOrderByWithRelationInput[]
    cursor?: RowWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RowScalarFieldEnum | RowScalarFieldEnum[]
  }

  /**
   * Project without action
   */
  export type ProjectDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Project
     */
    select?: ProjectSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Project
     */
    omit?: ProjectOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProjectInclude<ExtArgs> | null
  }


  /**
   * Model Section
   */

  export type AggregateSection = {
    _count: SectionCountAggregateOutputType | null
    _avg: SectionAvgAggregateOutputType | null
    _sum: SectionSumAggregateOutputType | null
    _min: SectionMinAggregateOutputType | null
    _max: SectionMaxAggregateOutputType | null
  }

  export type SectionAvgAggregateOutputType = {
    id: number | null
    projectId: number | null
  }

  export type SectionSumAggregateOutputType = {
    id: number | null
    projectId: number | null
  }

  export type SectionMinAggregateOutputType = {
    id: number | null
    name: string | null
    type: string | null
    projectId: number | null
  }

  export type SectionMaxAggregateOutputType = {
    id: number | null
    name: string | null
    type: string | null
    projectId: number | null
  }

  export type SectionCountAggregateOutputType = {
    id: number
    name: number
    type: number
    projectId: number
    _all: number
  }


  export type SectionAvgAggregateInputType = {
    id?: true
    projectId?: true
  }

  export type SectionSumAggregateInputType = {
    id?: true
    projectId?: true
  }

  export type SectionMinAggregateInputType = {
    id?: true
    name?: true
    type?: true
    projectId?: true
  }

  export type SectionMaxAggregateInputType = {
    id?: true
    name?: true
    type?: true
    projectId?: true
  }

  export type SectionCountAggregateInputType = {
    id?: true
    name?: true
    type?: true
    projectId?: true
    _all?: true
  }

  export type SectionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Section to aggregate.
     */
    where?: SectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sections to fetch.
     */
    orderBy?: SectionOrderByWithRelationInput | SectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sections
    **/
    _count?: true | SectionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SectionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SectionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SectionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SectionMaxAggregateInputType
  }

  export type GetSectionAggregateType<T extends SectionAggregateArgs> = {
        [P in keyof T & keyof AggregateSection]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSection[P]>
      : GetScalarType<T[P], AggregateSection[P]>
  }




  export type SectionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SectionWhereInput
    orderBy?: SectionOrderByWithAggregationInput | SectionOrderByWithAggregationInput[]
    by: SectionScalarFieldEnum[] | SectionScalarFieldEnum
    having?: SectionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SectionCountAggregateInputType | true
    _avg?: SectionAvgAggregateInputType
    _sum?: SectionSumAggregateInputType
    _min?: SectionMinAggregateInputType
    _max?: SectionMaxAggregateInputType
  }

  export type SectionGroupByOutputType = {
    id: number
    name: string
    type: string
    projectId: number
    _count: SectionCountAggregateOutputType | null
    _avg: SectionAvgAggregateOutputType | null
    _sum: SectionSumAggregateOutputType | null
    _min: SectionMinAggregateOutputType | null
    _max: SectionMaxAggregateOutputType | null
  }

  type GetSectionGroupByPayload<T extends SectionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SectionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SectionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SectionGroupByOutputType[P]>
            : GetScalarType<T[P], SectionGroupByOutputType[P]>
        }
      >
    >


  export type SectionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    projectId?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
    rows?: boolean | Section$rowsArgs<ExtArgs>
    _count?: boolean | SectionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["section"]>

  export type SectionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    projectId?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["section"]>

  export type SectionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    type?: boolean
    projectId?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["section"]>

  export type SectionSelectScalar = {
    id?: boolean
    name?: boolean
    type?: boolean
    projectId?: boolean
  }

  export type SectionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "type" | "projectId", ExtArgs["result"]["section"]>
  export type SectionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
    rows?: boolean | Section$rowsArgs<ExtArgs>
    _count?: boolean | SectionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SectionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }
  export type SectionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }

  export type $SectionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Section"
    objects: {
      project: Prisma.$ProjectPayload<ExtArgs>
      rows: Prisma.$RowPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      type: string
      projectId: number
    }, ExtArgs["result"]["section"]>
    composites: {}
  }

  type SectionGetPayload<S extends boolean | null | undefined | SectionDefaultArgs> = $Result.GetResult<Prisma.$SectionPayload, S>

  type SectionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SectionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SectionCountAggregateInputType | true
    }

  export interface SectionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Section'], meta: { name: 'Section' } }
    /**
     * Find zero or one Section that matches the filter.
     * @param {SectionFindUniqueArgs} args - Arguments to find a Section
     * @example
     * // Get one Section
     * const section = await prisma.section.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SectionFindUniqueArgs>(args: SelectSubset<T, SectionFindUniqueArgs<ExtArgs>>): Prisma__SectionClient<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Section that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SectionFindUniqueOrThrowArgs} args - Arguments to find a Section
     * @example
     * // Get one Section
     * const section = await prisma.section.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SectionFindUniqueOrThrowArgs>(args: SelectSubset<T, SectionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SectionClient<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Section that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionFindFirstArgs} args - Arguments to find a Section
     * @example
     * // Get one Section
     * const section = await prisma.section.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SectionFindFirstArgs>(args?: SelectSubset<T, SectionFindFirstArgs<ExtArgs>>): Prisma__SectionClient<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Section that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionFindFirstOrThrowArgs} args - Arguments to find a Section
     * @example
     * // Get one Section
     * const section = await prisma.section.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SectionFindFirstOrThrowArgs>(args?: SelectSubset<T, SectionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SectionClient<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sections that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sections
     * const sections = await prisma.section.findMany()
     * 
     * // Get first 10 Sections
     * const sections = await prisma.section.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sectionWithIdOnly = await prisma.section.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SectionFindManyArgs>(args?: SelectSubset<T, SectionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Section.
     * @param {SectionCreateArgs} args - Arguments to create a Section.
     * @example
     * // Create one Section
     * const Section = await prisma.section.create({
     *   data: {
     *     // ... data to create a Section
     *   }
     * })
     * 
     */
    create<T extends SectionCreateArgs>(args: SelectSubset<T, SectionCreateArgs<ExtArgs>>): Prisma__SectionClient<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sections.
     * @param {SectionCreateManyArgs} args - Arguments to create many Sections.
     * @example
     * // Create many Sections
     * const section = await prisma.section.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SectionCreateManyArgs>(args?: SelectSubset<T, SectionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sections and returns the data saved in the database.
     * @param {SectionCreateManyAndReturnArgs} args - Arguments to create many Sections.
     * @example
     * // Create many Sections
     * const section = await prisma.section.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sections and only return the `id`
     * const sectionWithIdOnly = await prisma.section.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SectionCreateManyAndReturnArgs>(args?: SelectSubset<T, SectionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Section.
     * @param {SectionDeleteArgs} args - Arguments to delete one Section.
     * @example
     * // Delete one Section
     * const Section = await prisma.section.delete({
     *   where: {
     *     // ... filter to delete one Section
     *   }
     * })
     * 
     */
    delete<T extends SectionDeleteArgs>(args: SelectSubset<T, SectionDeleteArgs<ExtArgs>>): Prisma__SectionClient<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Section.
     * @param {SectionUpdateArgs} args - Arguments to update one Section.
     * @example
     * // Update one Section
     * const section = await prisma.section.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SectionUpdateArgs>(args: SelectSubset<T, SectionUpdateArgs<ExtArgs>>): Prisma__SectionClient<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sections.
     * @param {SectionDeleteManyArgs} args - Arguments to filter Sections to delete.
     * @example
     * // Delete a few Sections
     * const { count } = await prisma.section.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SectionDeleteManyArgs>(args?: SelectSubset<T, SectionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sections
     * const section = await prisma.section.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SectionUpdateManyArgs>(args: SelectSubset<T, SectionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sections and returns the data updated in the database.
     * @param {SectionUpdateManyAndReturnArgs} args - Arguments to update many Sections.
     * @example
     * // Update many Sections
     * const section = await prisma.section.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sections and only return the `id`
     * const sectionWithIdOnly = await prisma.section.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SectionUpdateManyAndReturnArgs>(args: SelectSubset<T, SectionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Section.
     * @param {SectionUpsertArgs} args - Arguments to update or create a Section.
     * @example
     * // Update or create a Section
     * const section = await prisma.section.upsert({
     *   create: {
     *     // ... data to create a Section
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Section we want to update
     *   }
     * })
     */
    upsert<T extends SectionUpsertArgs>(args: SelectSubset<T, SectionUpsertArgs<ExtArgs>>): Prisma__SectionClient<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sections.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionCountArgs} args - Arguments to filter Sections to count.
     * @example
     * // Count the number of Sections
     * const count = await prisma.section.count({
     *   where: {
     *     // ... the filter for the Sections we want to count
     *   }
     * })
    **/
    count<T extends SectionCountArgs>(
      args?: Subset<T, SectionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SectionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Section.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SectionAggregateArgs>(args: Subset<T, SectionAggregateArgs>): Prisma.PrismaPromise<GetSectionAggregateType<T>>

    /**
     * Group by Section.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SectionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SectionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SectionGroupByArgs['orderBy'] }
        : { orderBy?: SectionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SectionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSectionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Section model
   */
  readonly fields: SectionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Section.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SectionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    project<T extends ProjectDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProjectDefaultArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    rows<T extends Section$rowsArgs<ExtArgs> = {}>(args?: Subset<T, Section$rowsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Section model
   */
  interface SectionFieldRefs {
    readonly id: FieldRef<"Section", 'Int'>
    readonly name: FieldRef<"Section", 'String'>
    readonly type: FieldRef<"Section", 'String'>
    readonly projectId: FieldRef<"Section", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Section findUnique
   */
  export type SectionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
    /**
     * Filter, which Section to fetch.
     */
    where: SectionWhereUniqueInput
  }

  /**
   * Section findUniqueOrThrow
   */
  export type SectionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
    /**
     * Filter, which Section to fetch.
     */
    where: SectionWhereUniqueInput
  }

  /**
   * Section findFirst
   */
  export type SectionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
    /**
     * Filter, which Section to fetch.
     */
    where?: SectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sections to fetch.
     */
    orderBy?: SectionOrderByWithRelationInput | SectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sections.
     */
    cursor?: SectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sections.
     */
    distinct?: SectionScalarFieldEnum | SectionScalarFieldEnum[]
  }

  /**
   * Section findFirstOrThrow
   */
  export type SectionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
    /**
     * Filter, which Section to fetch.
     */
    where?: SectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sections to fetch.
     */
    orderBy?: SectionOrderByWithRelationInput | SectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sections.
     */
    cursor?: SectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sections.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sections.
     */
    distinct?: SectionScalarFieldEnum | SectionScalarFieldEnum[]
  }

  /**
   * Section findMany
   */
  export type SectionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
    /**
     * Filter, which Sections to fetch.
     */
    where?: SectionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sections to fetch.
     */
    orderBy?: SectionOrderByWithRelationInput | SectionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sections.
     */
    cursor?: SectionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sections from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sections.
     */
    skip?: number
    distinct?: SectionScalarFieldEnum | SectionScalarFieldEnum[]
  }

  /**
   * Section create
   */
  export type SectionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
    /**
     * The data needed to create a Section.
     */
    data: XOR<SectionCreateInput, SectionUncheckedCreateInput>
  }

  /**
   * Section createMany
   */
  export type SectionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sections.
     */
    data: SectionCreateManyInput | SectionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Section createManyAndReturn
   */
  export type SectionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * The data used to create many Sections.
     */
    data: SectionCreateManyInput | SectionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Section update
   */
  export type SectionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
    /**
     * The data needed to update a Section.
     */
    data: XOR<SectionUpdateInput, SectionUncheckedUpdateInput>
    /**
     * Choose, which Section to update.
     */
    where: SectionWhereUniqueInput
  }

  /**
   * Section updateMany
   */
  export type SectionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sections.
     */
    data: XOR<SectionUpdateManyMutationInput, SectionUncheckedUpdateManyInput>
    /**
     * Filter which Sections to update
     */
    where?: SectionWhereInput
    /**
     * Limit how many Sections to update.
     */
    limit?: number
  }

  /**
   * Section updateManyAndReturn
   */
  export type SectionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * The data used to update Sections.
     */
    data: XOR<SectionUpdateManyMutationInput, SectionUncheckedUpdateManyInput>
    /**
     * Filter which Sections to update
     */
    where?: SectionWhereInput
    /**
     * Limit how many Sections to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Section upsert
   */
  export type SectionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
    /**
     * The filter to search for the Section to update in case it exists.
     */
    where: SectionWhereUniqueInput
    /**
     * In case the Section found by the `where` argument doesn't exist, create a new Section with this data.
     */
    create: XOR<SectionCreateInput, SectionUncheckedCreateInput>
    /**
     * In case the Section was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SectionUpdateInput, SectionUncheckedUpdateInput>
  }

  /**
   * Section delete
   */
  export type SectionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
    /**
     * Filter which Section to delete.
     */
    where: SectionWhereUniqueInput
  }

  /**
   * Section deleteMany
   */
  export type SectionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sections to delete
     */
    where?: SectionWhereInput
    /**
     * Limit how many Sections to delete.
     */
    limit?: number
  }

  /**
   * Section.rows
   */
  export type Section$rowsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    where?: RowWhereInput
    orderBy?: RowOrderByWithRelationInput | RowOrderByWithRelationInput[]
    cursor?: RowWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RowScalarFieldEnum | RowScalarFieldEnum[]
  }

  /**
   * Section without action
   */
  export type SectionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
  }


  /**
   * Model Beteckning
   */

  export type AggregateBeteckning = {
    _count: BeteckningCountAggregateOutputType | null
    _avg: BeteckningAvgAggregateOutputType | null
    _sum: BeteckningSumAggregateOutputType | null
    _min: BeteckningMinAggregateOutputType | null
    _max: BeteckningMaxAggregateOutputType | null
  }

  export type BeteckningAvgAggregateOutputType = {
    id: number | null
    projectId: number | null
  }

  export type BeteckningSumAggregateOutputType = {
    id: number | null
    projectId: number | null
  }

  export type BeteckningMinAggregateOutputType = {
    id: number | null
    label: string | null
    projectId: number | null
  }

  export type BeteckningMaxAggregateOutputType = {
    id: number | null
    label: string | null
    projectId: number | null
  }

  export type BeteckningCountAggregateOutputType = {
    id: number
    label: number
    projectId: number
    _all: number
  }


  export type BeteckningAvgAggregateInputType = {
    id?: true
    projectId?: true
  }

  export type BeteckningSumAggregateInputType = {
    id?: true
    projectId?: true
  }

  export type BeteckningMinAggregateInputType = {
    id?: true
    label?: true
    projectId?: true
  }

  export type BeteckningMaxAggregateInputType = {
    id?: true
    label?: true
    projectId?: true
  }

  export type BeteckningCountAggregateInputType = {
    id?: true
    label?: true
    projectId?: true
    _all?: true
  }

  export type BeteckningAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Beteckning to aggregate.
     */
    where?: BeteckningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Betecknings to fetch.
     */
    orderBy?: BeteckningOrderByWithRelationInput | BeteckningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BeteckningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Betecknings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Betecknings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Betecknings
    **/
    _count?: true | BeteckningCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BeteckningAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BeteckningSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BeteckningMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BeteckningMaxAggregateInputType
  }

  export type GetBeteckningAggregateType<T extends BeteckningAggregateArgs> = {
        [P in keyof T & keyof AggregateBeteckning]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBeteckning[P]>
      : GetScalarType<T[P], AggregateBeteckning[P]>
  }




  export type BeteckningGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BeteckningWhereInput
    orderBy?: BeteckningOrderByWithAggregationInput | BeteckningOrderByWithAggregationInput[]
    by: BeteckningScalarFieldEnum[] | BeteckningScalarFieldEnum
    having?: BeteckningScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BeteckningCountAggregateInputType | true
    _avg?: BeteckningAvgAggregateInputType
    _sum?: BeteckningSumAggregateInputType
    _min?: BeteckningMinAggregateInputType
    _max?: BeteckningMaxAggregateInputType
  }

  export type BeteckningGroupByOutputType = {
    id: number
    label: string
    projectId: number
    _count: BeteckningCountAggregateOutputType | null
    _avg: BeteckningAvgAggregateOutputType | null
    _sum: BeteckningSumAggregateOutputType | null
    _min: BeteckningMinAggregateOutputType | null
    _max: BeteckningMaxAggregateOutputType | null
  }

  type GetBeteckningGroupByPayload<T extends BeteckningGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BeteckningGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BeteckningGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BeteckningGroupByOutputType[P]>
            : GetScalarType<T[P], BeteckningGroupByOutputType[P]>
        }
      >
    >


  export type BeteckningSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    label?: boolean
    projectId?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["beteckning"]>

  export type BeteckningSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    label?: boolean
    projectId?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["beteckning"]>

  export type BeteckningSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    label?: boolean
    projectId?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["beteckning"]>

  export type BeteckningSelectScalar = {
    id?: boolean
    label?: boolean
    projectId?: boolean
  }

  export type BeteckningOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "label" | "projectId", ExtArgs["result"]["beteckning"]>
  export type BeteckningInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }
  export type BeteckningIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }
  export type BeteckningIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
  }

  export type $BeteckningPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Beteckning"
    objects: {
      project: Prisma.$ProjectPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      label: string
      projectId: number
    }, ExtArgs["result"]["beteckning"]>
    composites: {}
  }

  type BeteckningGetPayload<S extends boolean | null | undefined | BeteckningDefaultArgs> = $Result.GetResult<Prisma.$BeteckningPayload, S>

  type BeteckningCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BeteckningFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BeteckningCountAggregateInputType | true
    }

  export interface BeteckningDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Beteckning'], meta: { name: 'Beteckning' } }
    /**
     * Find zero or one Beteckning that matches the filter.
     * @param {BeteckningFindUniqueArgs} args - Arguments to find a Beteckning
     * @example
     * // Get one Beteckning
     * const beteckning = await prisma.beteckning.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BeteckningFindUniqueArgs>(args: SelectSubset<T, BeteckningFindUniqueArgs<ExtArgs>>): Prisma__BeteckningClient<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Beteckning that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BeteckningFindUniqueOrThrowArgs} args - Arguments to find a Beteckning
     * @example
     * // Get one Beteckning
     * const beteckning = await prisma.beteckning.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BeteckningFindUniqueOrThrowArgs>(args: SelectSubset<T, BeteckningFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BeteckningClient<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Beteckning that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BeteckningFindFirstArgs} args - Arguments to find a Beteckning
     * @example
     * // Get one Beteckning
     * const beteckning = await prisma.beteckning.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BeteckningFindFirstArgs>(args?: SelectSubset<T, BeteckningFindFirstArgs<ExtArgs>>): Prisma__BeteckningClient<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Beteckning that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BeteckningFindFirstOrThrowArgs} args - Arguments to find a Beteckning
     * @example
     * // Get one Beteckning
     * const beteckning = await prisma.beteckning.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BeteckningFindFirstOrThrowArgs>(args?: SelectSubset<T, BeteckningFindFirstOrThrowArgs<ExtArgs>>): Prisma__BeteckningClient<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Betecknings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BeteckningFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Betecknings
     * const betecknings = await prisma.beteckning.findMany()
     * 
     * // Get first 10 Betecknings
     * const betecknings = await prisma.beteckning.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const beteckningWithIdOnly = await prisma.beteckning.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BeteckningFindManyArgs>(args?: SelectSubset<T, BeteckningFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Beteckning.
     * @param {BeteckningCreateArgs} args - Arguments to create a Beteckning.
     * @example
     * // Create one Beteckning
     * const Beteckning = await prisma.beteckning.create({
     *   data: {
     *     // ... data to create a Beteckning
     *   }
     * })
     * 
     */
    create<T extends BeteckningCreateArgs>(args: SelectSubset<T, BeteckningCreateArgs<ExtArgs>>): Prisma__BeteckningClient<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Betecknings.
     * @param {BeteckningCreateManyArgs} args - Arguments to create many Betecknings.
     * @example
     * // Create many Betecknings
     * const beteckning = await prisma.beteckning.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BeteckningCreateManyArgs>(args?: SelectSubset<T, BeteckningCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Betecknings and returns the data saved in the database.
     * @param {BeteckningCreateManyAndReturnArgs} args - Arguments to create many Betecknings.
     * @example
     * // Create many Betecknings
     * const beteckning = await prisma.beteckning.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Betecknings and only return the `id`
     * const beteckningWithIdOnly = await prisma.beteckning.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BeteckningCreateManyAndReturnArgs>(args?: SelectSubset<T, BeteckningCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Beteckning.
     * @param {BeteckningDeleteArgs} args - Arguments to delete one Beteckning.
     * @example
     * // Delete one Beteckning
     * const Beteckning = await prisma.beteckning.delete({
     *   where: {
     *     // ... filter to delete one Beteckning
     *   }
     * })
     * 
     */
    delete<T extends BeteckningDeleteArgs>(args: SelectSubset<T, BeteckningDeleteArgs<ExtArgs>>): Prisma__BeteckningClient<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Beteckning.
     * @param {BeteckningUpdateArgs} args - Arguments to update one Beteckning.
     * @example
     * // Update one Beteckning
     * const beteckning = await prisma.beteckning.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BeteckningUpdateArgs>(args: SelectSubset<T, BeteckningUpdateArgs<ExtArgs>>): Prisma__BeteckningClient<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Betecknings.
     * @param {BeteckningDeleteManyArgs} args - Arguments to filter Betecknings to delete.
     * @example
     * // Delete a few Betecknings
     * const { count } = await prisma.beteckning.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BeteckningDeleteManyArgs>(args?: SelectSubset<T, BeteckningDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Betecknings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BeteckningUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Betecknings
     * const beteckning = await prisma.beteckning.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BeteckningUpdateManyArgs>(args: SelectSubset<T, BeteckningUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Betecknings and returns the data updated in the database.
     * @param {BeteckningUpdateManyAndReturnArgs} args - Arguments to update many Betecknings.
     * @example
     * // Update many Betecknings
     * const beteckning = await prisma.beteckning.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Betecknings and only return the `id`
     * const beteckningWithIdOnly = await prisma.beteckning.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BeteckningUpdateManyAndReturnArgs>(args: SelectSubset<T, BeteckningUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Beteckning.
     * @param {BeteckningUpsertArgs} args - Arguments to update or create a Beteckning.
     * @example
     * // Update or create a Beteckning
     * const beteckning = await prisma.beteckning.upsert({
     *   create: {
     *     // ... data to create a Beteckning
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Beteckning we want to update
     *   }
     * })
     */
    upsert<T extends BeteckningUpsertArgs>(args: SelectSubset<T, BeteckningUpsertArgs<ExtArgs>>): Prisma__BeteckningClient<$Result.GetResult<Prisma.$BeteckningPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Betecknings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BeteckningCountArgs} args - Arguments to filter Betecknings to count.
     * @example
     * // Count the number of Betecknings
     * const count = await prisma.beteckning.count({
     *   where: {
     *     // ... the filter for the Betecknings we want to count
     *   }
     * })
    **/
    count<T extends BeteckningCountArgs>(
      args?: Subset<T, BeteckningCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BeteckningCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Beteckning.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BeteckningAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BeteckningAggregateArgs>(args: Subset<T, BeteckningAggregateArgs>): Prisma.PrismaPromise<GetBeteckningAggregateType<T>>

    /**
     * Group by Beteckning.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BeteckningGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BeteckningGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BeteckningGroupByArgs['orderBy'] }
        : { orderBy?: BeteckningGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BeteckningGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBeteckningGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Beteckning model
   */
  readonly fields: BeteckningFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Beteckning.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BeteckningClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    project<T extends ProjectDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProjectDefaultArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Beteckning model
   */
  interface BeteckningFieldRefs {
    readonly id: FieldRef<"Beteckning", 'Int'>
    readonly label: FieldRef<"Beteckning", 'String'>
    readonly projectId: FieldRef<"Beteckning", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Beteckning findUnique
   */
  export type BeteckningFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningInclude<ExtArgs> | null
    /**
     * Filter, which Beteckning to fetch.
     */
    where: BeteckningWhereUniqueInput
  }

  /**
   * Beteckning findUniqueOrThrow
   */
  export type BeteckningFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningInclude<ExtArgs> | null
    /**
     * Filter, which Beteckning to fetch.
     */
    where: BeteckningWhereUniqueInput
  }

  /**
   * Beteckning findFirst
   */
  export type BeteckningFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningInclude<ExtArgs> | null
    /**
     * Filter, which Beteckning to fetch.
     */
    where?: BeteckningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Betecknings to fetch.
     */
    orderBy?: BeteckningOrderByWithRelationInput | BeteckningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Betecknings.
     */
    cursor?: BeteckningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Betecknings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Betecknings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Betecknings.
     */
    distinct?: BeteckningScalarFieldEnum | BeteckningScalarFieldEnum[]
  }

  /**
   * Beteckning findFirstOrThrow
   */
  export type BeteckningFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningInclude<ExtArgs> | null
    /**
     * Filter, which Beteckning to fetch.
     */
    where?: BeteckningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Betecknings to fetch.
     */
    orderBy?: BeteckningOrderByWithRelationInput | BeteckningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Betecknings.
     */
    cursor?: BeteckningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Betecknings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Betecknings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Betecknings.
     */
    distinct?: BeteckningScalarFieldEnum | BeteckningScalarFieldEnum[]
  }

  /**
   * Beteckning findMany
   */
  export type BeteckningFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningInclude<ExtArgs> | null
    /**
     * Filter, which Betecknings to fetch.
     */
    where?: BeteckningWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Betecknings to fetch.
     */
    orderBy?: BeteckningOrderByWithRelationInput | BeteckningOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Betecknings.
     */
    cursor?: BeteckningWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Betecknings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Betecknings.
     */
    skip?: number
    distinct?: BeteckningScalarFieldEnum | BeteckningScalarFieldEnum[]
  }

  /**
   * Beteckning create
   */
  export type BeteckningCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningInclude<ExtArgs> | null
    /**
     * The data needed to create a Beteckning.
     */
    data: XOR<BeteckningCreateInput, BeteckningUncheckedCreateInput>
  }

  /**
   * Beteckning createMany
   */
  export type BeteckningCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Betecknings.
     */
    data: BeteckningCreateManyInput | BeteckningCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Beteckning createManyAndReturn
   */
  export type BeteckningCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * The data used to create many Betecknings.
     */
    data: BeteckningCreateManyInput | BeteckningCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Beteckning update
   */
  export type BeteckningUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningInclude<ExtArgs> | null
    /**
     * The data needed to update a Beteckning.
     */
    data: XOR<BeteckningUpdateInput, BeteckningUncheckedUpdateInput>
    /**
     * Choose, which Beteckning to update.
     */
    where: BeteckningWhereUniqueInput
  }

  /**
   * Beteckning updateMany
   */
  export type BeteckningUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Betecknings.
     */
    data: XOR<BeteckningUpdateManyMutationInput, BeteckningUncheckedUpdateManyInput>
    /**
     * Filter which Betecknings to update
     */
    where?: BeteckningWhereInput
    /**
     * Limit how many Betecknings to update.
     */
    limit?: number
  }

  /**
   * Beteckning updateManyAndReturn
   */
  export type BeteckningUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * The data used to update Betecknings.
     */
    data: XOR<BeteckningUpdateManyMutationInput, BeteckningUncheckedUpdateManyInput>
    /**
     * Filter which Betecknings to update
     */
    where?: BeteckningWhereInput
    /**
     * Limit how many Betecknings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Beteckning upsert
   */
  export type BeteckningUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningInclude<ExtArgs> | null
    /**
     * The filter to search for the Beteckning to update in case it exists.
     */
    where: BeteckningWhereUniqueInput
    /**
     * In case the Beteckning found by the `where` argument doesn't exist, create a new Beteckning with this data.
     */
    create: XOR<BeteckningCreateInput, BeteckningUncheckedCreateInput>
    /**
     * In case the Beteckning was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BeteckningUpdateInput, BeteckningUncheckedUpdateInput>
  }

  /**
   * Beteckning delete
   */
  export type BeteckningDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningInclude<ExtArgs> | null
    /**
     * Filter which Beteckning to delete.
     */
    where: BeteckningWhereUniqueInput
  }

  /**
   * Beteckning deleteMany
   */
  export type BeteckningDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Betecknings to delete
     */
    where?: BeteckningWhereInput
    /**
     * Limit how many Betecknings to delete.
     */
    limit?: number
  }

  /**
   * Beteckning without action
   */
  export type BeteckningDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Beteckning
     */
    select?: BeteckningSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Beteckning
     */
    omit?: BeteckningOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BeteckningInclude<ExtArgs> | null
  }


  /**
   * Model Employee
   */

  export type AggregateEmployee = {
    _count: EmployeeCountAggregateOutputType | null
    _avg: EmployeeAvgAggregateOutputType | null
    _sum: EmployeeSumAggregateOutputType | null
    _min: EmployeeMinAggregateOutputType | null
    _max: EmployeeMaxAggregateOutputType | null
  }

  export type EmployeeAvgAggregateOutputType = {
    id: number | null
    employerId: number | null
    employeeId: number | null
  }

  export type EmployeeSumAggregateOutputType = {
    id: number | null
    employerId: number | null
    employeeId: number | null
  }

  export type EmployeeMinAggregateOutputType = {
    id: number | null
    employerId: number | null
    employeeId: number | null
  }

  export type EmployeeMaxAggregateOutputType = {
    id: number | null
    employerId: number | null
    employeeId: number | null
  }

  export type EmployeeCountAggregateOutputType = {
    id: number
    employerId: number
    employeeId: number
    _all: number
  }


  export type EmployeeAvgAggregateInputType = {
    id?: true
    employerId?: true
    employeeId?: true
  }

  export type EmployeeSumAggregateInputType = {
    id?: true
    employerId?: true
    employeeId?: true
  }

  export type EmployeeMinAggregateInputType = {
    id?: true
    employerId?: true
    employeeId?: true
  }

  export type EmployeeMaxAggregateInputType = {
    id?: true
    employerId?: true
    employeeId?: true
  }

  export type EmployeeCountAggregateInputType = {
    id?: true
    employerId?: true
    employeeId?: true
    _all?: true
  }

  export type EmployeeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Employee to aggregate.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Employees
    **/
    _count?: true | EmployeeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmployeeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmployeeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmployeeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmployeeMaxAggregateInputType
  }

  export type GetEmployeeAggregateType<T extends EmployeeAggregateArgs> = {
        [P in keyof T & keyof AggregateEmployee]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmployee[P]>
      : GetScalarType<T[P], AggregateEmployee[P]>
  }




  export type EmployeeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmployeeWhereInput
    orderBy?: EmployeeOrderByWithAggregationInput | EmployeeOrderByWithAggregationInput[]
    by: EmployeeScalarFieldEnum[] | EmployeeScalarFieldEnum
    having?: EmployeeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmployeeCountAggregateInputType | true
    _avg?: EmployeeAvgAggregateInputType
    _sum?: EmployeeSumAggregateInputType
    _min?: EmployeeMinAggregateInputType
    _max?: EmployeeMaxAggregateInputType
  }

  export type EmployeeGroupByOutputType = {
    id: number
    employerId: number
    employeeId: number
    _count: EmployeeCountAggregateOutputType | null
    _avg: EmployeeAvgAggregateOutputType | null
    _sum: EmployeeSumAggregateOutputType | null
    _min: EmployeeMinAggregateOutputType | null
    _max: EmployeeMaxAggregateOutputType | null
  }

  type GetEmployeeGroupByPayload<T extends EmployeeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmployeeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmployeeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmployeeGroupByOutputType[P]>
            : GetScalarType<T[P], EmployeeGroupByOutputType[P]>
        }
      >
    >


  export type EmployeeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employerId?: boolean
    employeeId?: boolean
    employer?: boolean | UserDefaultArgs<ExtArgs>
    employee?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["employee"]>

  export type EmployeeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employerId?: boolean
    employeeId?: boolean
    employer?: boolean | UserDefaultArgs<ExtArgs>
    employee?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["employee"]>

  export type EmployeeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employerId?: boolean
    employeeId?: boolean
    employer?: boolean | UserDefaultArgs<ExtArgs>
    employee?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["employee"]>

  export type EmployeeSelectScalar = {
    id?: boolean
    employerId?: boolean
    employeeId?: boolean
  }

  export type EmployeeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "employerId" | "employeeId", ExtArgs["result"]["employee"]>
  export type EmployeeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employer?: boolean | UserDefaultArgs<ExtArgs>
    employee?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type EmployeeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employer?: boolean | UserDefaultArgs<ExtArgs>
    employee?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type EmployeeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employer?: boolean | UserDefaultArgs<ExtArgs>
    employee?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $EmployeePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Employee"
    objects: {
      employer: Prisma.$UserPayload<ExtArgs>
      employee: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      employerId: number
      employeeId: number
    }, ExtArgs["result"]["employee"]>
    composites: {}
  }

  type EmployeeGetPayload<S extends boolean | null | undefined | EmployeeDefaultArgs> = $Result.GetResult<Prisma.$EmployeePayload, S>

  type EmployeeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EmployeeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmployeeCountAggregateInputType | true
    }

  export interface EmployeeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Employee'], meta: { name: 'Employee' } }
    /**
     * Find zero or one Employee that matches the filter.
     * @param {EmployeeFindUniqueArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmployeeFindUniqueArgs>(args: SelectSubset<T, EmployeeFindUniqueArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Employee that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmployeeFindUniqueOrThrowArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmployeeFindUniqueOrThrowArgs>(args: SelectSubset<T, EmployeeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Employee that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeFindFirstArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmployeeFindFirstArgs>(args?: SelectSubset<T, EmployeeFindFirstArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Employee that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeFindFirstOrThrowArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmployeeFindFirstOrThrowArgs>(args?: SelectSubset<T, EmployeeFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Employees that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Employees
     * const employees = await prisma.employee.findMany()
     * 
     * // Get first 10 Employees
     * const employees = await prisma.employee.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const employeeWithIdOnly = await prisma.employee.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmployeeFindManyArgs>(args?: SelectSubset<T, EmployeeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Employee.
     * @param {EmployeeCreateArgs} args - Arguments to create a Employee.
     * @example
     * // Create one Employee
     * const Employee = await prisma.employee.create({
     *   data: {
     *     // ... data to create a Employee
     *   }
     * })
     * 
     */
    create<T extends EmployeeCreateArgs>(args: SelectSubset<T, EmployeeCreateArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Employees.
     * @param {EmployeeCreateManyArgs} args - Arguments to create many Employees.
     * @example
     * // Create many Employees
     * const employee = await prisma.employee.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmployeeCreateManyArgs>(args?: SelectSubset<T, EmployeeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Employees and returns the data saved in the database.
     * @param {EmployeeCreateManyAndReturnArgs} args - Arguments to create many Employees.
     * @example
     * // Create many Employees
     * const employee = await prisma.employee.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Employees and only return the `id`
     * const employeeWithIdOnly = await prisma.employee.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmployeeCreateManyAndReturnArgs>(args?: SelectSubset<T, EmployeeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Employee.
     * @param {EmployeeDeleteArgs} args - Arguments to delete one Employee.
     * @example
     * // Delete one Employee
     * const Employee = await prisma.employee.delete({
     *   where: {
     *     // ... filter to delete one Employee
     *   }
     * })
     * 
     */
    delete<T extends EmployeeDeleteArgs>(args: SelectSubset<T, EmployeeDeleteArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Employee.
     * @param {EmployeeUpdateArgs} args - Arguments to update one Employee.
     * @example
     * // Update one Employee
     * const employee = await prisma.employee.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmployeeUpdateArgs>(args: SelectSubset<T, EmployeeUpdateArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Employees.
     * @param {EmployeeDeleteManyArgs} args - Arguments to filter Employees to delete.
     * @example
     * // Delete a few Employees
     * const { count } = await prisma.employee.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmployeeDeleteManyArgs>(args?: SelectSubset<T, EmployeeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Employees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Employees
     * const employee = await prisma.employee.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmployeeUpdateManyArgs>(args: SelectSubset<T, EmployeeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Employees and returns the data updated in the database.
     * @param {EmployeeUpdateManyAndReturnArgs} args - Arguments to update many Employees.
     * @example
     * // Update many Employees
     * const employee = await prisma.employee.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Employees and only return the `id`
     * const employeeWithIdOnly = await prisma.employee.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EmployeeUpdateManyAndReturnArgs>(args: SelectSubset<T, EmployeeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Employee.
     * @param {EmployeeUpsertArgs} args - Arguments to update or create a Employee.
     * @example
     * // Update or create a Employee
     * const employee = await prisma.employee.upsert({
     *   create: {
     *     // ... data to create a Employee
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Employee we want to update
     *   }
     * })
     */
    upsert<T extends EmployeeUpsertArgs>(args: SelectSubset<T, EmployeeUpsertArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Employees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeCountArgs} args - Arguments to filter Employees to count.
     * @example
     * // Count the number of Employees
     * const count = await prisma.employee.count({
     *   where: {
     *     // ... the filter for the Employees we want to count
     *   }
     * })
    **/
    count<T extends EmployeeCountArgs>(
      args?: Subset<T, EmployeeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmployeeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Employee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmployeeAggregateArgs>(args: Subset<T, EmployeeAggregateArgs>): Prisma.PrismaPromise<GetEmployeeAggregateType<T>>

    /**
     * Group by Employee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmployeeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmployeeGroupByArgs['orderBy'] }
        : { orderBy?: EmployeeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmployeeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmployeeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Employee model
   */
  readonly fields: EmployeeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Employee.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmployeeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    employer<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    employee<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Employee model
   */
  interface EmployeeFieldRefs {
    readonly id: FieldRef<"Employee", 'Int'>
    readonly employerId: FieldRef<"Employee", 'Int'>
    readonly employeeId: FieldRef<"Employee", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Employee findUnique
   */
  export type EmployeeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where: EmployeeWhereUniqueInput
  }

  /**
   * Employee findUniqueOrThrow
   */
  export type EmployeeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where: EmployeeWhereUniqueInput
  }

  /**
   * Employee findFirst
   */
  export type EmployeeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Employees.
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Employees.
     */
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }

  /**
   * Employee findFirstOrThrow
   */
  export type EmployeeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Employees.
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Employees.
     */
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }

  /**
   * Employee findMany
   */
  export type EmployeeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employees to fetch.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Employees.
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }

  /**
   * Employee create
   */
  export type EmployeeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * The data needed to create a Employee.
     */
    data: XOR<EmployeeCreateInput, EmployeeUncheckedCreateInput>
  }

  /**
   * Employee createMany
   */
  export type EmployeeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Employees.
     */
    data: EmployeeCreateManyInput | EmployeeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Employee createManyAndReturn
   */
  export type EmployeeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * The data used to create many Employees.
     */
    data: EmployeeCreateManyInput | EmployeeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Employee update
   */
  export type EmployeeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * The data needed to update a Employee.
     */
    data: XOR<EmployeeUpdateInput, EmployeeUncheckedUpdateInput>
    /**
     * Choose, which Employee to update.
     */
    where: EmployeeWhereUniqueInput
  }

  /**
   * Employee updateMany
   */
  export type EmployeeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Employees.
     */
    data: XOR<EmployeeUpdateManyMutationInput, EmployeeUncheckedUpdateManyInput>
    /**
     * Filter which Employees to update
     */
    where?: EmployeeWhereInput
    /**
     * Limit how many Employees to update.
     */
    limit?: number
  }

  /**
   * Employee updateManyAndReturn
   */
  export type EmployeeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * The data used to update Employees.
     */
    data: XOR<EmployeeUpdateManyMutationInput, EmployeeUncheckedUpdateManyInput>
    /**
     * Filter which Employees to update
     */
    where?: EmployeeWhereInput
    /**
     * Limit how many Employees to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Employee upsert
   */
  export type EmployeeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * The filter to search for the Employee to update in case it exists.
     */
    where: EmployeeWhereUniqueInput
    /**
     * In case the Employee found by the `where` argument doesn't exist, create a new Employee with this data.
     */
    create: XOR<EmployeeCreateInput, EmployeeUncheckedCreateInput>
    /**
     * In case the Employee was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmployeeUpdateInput, EmployeeUncheckedUpdateInput>
  }

  /**
   * Employee delete
   */
  export type EmployeeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter which Employee to delete.
     */
    where: EmployeeWhereUniqueInput
  }

  /**
   * Employee deleteMany
   */
  export type EmployeeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Employees to delete
     */
    where?: EmployeeWhereInput
    /**
     * Limit how many Employees to delete.
     */
    limit?: number
  }

  /**
   * Employee without action
   */
  export type EmployeeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
  }


  /**
   * Model Row
   */

  export type AggregateRow = {
    _count: RowCountAggregateOutputType | null
    _avg: RowAvgAggregateOutputType | null
    _sum: RowSumAggregateOutputType | null
    _min: RowMinAggregateOutputType | null
    _max: RowMaxAggregateOutputType | null
  }

  export type RowAvgAggregateOutputType = {
    id: number | null
    projectId: number | null
    userId: number | null
    sectionId: number | null
    approvedById: number | null
  }

  export type RowSumAggregateOutputType = {
    id: number | null
    projectId: number | null
    userId: number | null
    sectionId: number | null
    approvedById: number | null
  }

  export type RowMinAggregateOutputType = {
    id: number | null
    projectId: number | null
    userId: number | null
    sectionId: number | null
    datum: string | null
    isPending: boolean | null
    approvedById: number | null
    begard: string | null
    begardDatum: string | null
    anteckning: string | null
    namn: string | null
    telefon: string | null
    createdAt: Date | null
  }

  export type RowMaxAggregateOutputType = {
    id: number | null
    projectId: number | null
    userId: number | null
    sectionId: number | null
    datum: string | null
    isPending: boolean | null
    approvedById: number | null
    begard: string | null
    begardDatum: string | null
    anteckning: string | null
    namn: string | null
    telefon: string | null
    createdAt: Date | null
  }

  export type RowCountAggregateOutputType = {
    id: number
    projectId: number
    userId: number
    sectionId: number
    selections: number
    anordning: number
    datum: number
    isPending: number
    approvedById: number
    begard: number
    begardDatum: number
    anteckning: number
    namn: number
    telefon: number
    createdAt: number
    _all: number
  }


  export type RowAvgAggregateInputType = {
    id?: true
    projectId?: true
    userId?: true
    sectionId?: true
    approvedById?: true
  }

  export type RowSumAggregateInputType = {
    id?: true
    projectId?: true
    userId?: true
    sectionId?: true
    approvedById?: true
  }

  export type RowMinAggregateInputType = {
    id?: true
    projectId?: true
    userId?: true
    sectionId?: true
    datum?: true
    isPending?: true
    approvedById?: true
    begard?: true
    begardDatum?: true
    anteckning?: true
    namn?: true
    telefon?: true
    createdAt?: true
  }

  export type RowMaxAggregateInputType = {
    id?: true
    projectId?: true
    userId?: true
    sectionId?: true
    datum?: true
    isPending?: true
    approvedById?: true
    begard?: true
    begardDatum?: true
    anteckning?: true
    namn?: true
    telefon?: true
    createdAt?: true
  }

  export type RowCountAggregateInputType = {
    id?: true
    projectId?: true
    userId?: true
    sectionId?: true
    selections?: true
    anordning?: true
    datum?: true
    isPending?: true
    approvedById?: true
    begard?: true
    begardDatum?: true
    anteckning?: true
    namn?: true
    telefon?: true
    createdAt?: true
    _all?: true
  }

  export type RowAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Row to aggregate.
     */
    where?: RowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rows to fetch.
     */
    orderBy?: RowOrderByWithRelationInput | RowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Rows
    **/
    _count?: true | RowCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RowAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RowSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RowMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RowMaxAggregateInputType
  }

  export type GetRowAggregateType<T extends RowAggregateArgs> = {
        [P in keyof T & keyof AggregateRow]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRow[P]>
      : GetScalarType<T[P], AggregateRow[P]>
  }




  export type RowGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RowWhereInput
    orderBy?: RowOrderByWithAggregationInput | RowOrderByWithAggregationInput[]
    by: RowScalarFieldEnum[] | RowScalarFieldEnum
    having?: RowScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RowCountAggregateInputType | true
    _avg?: RowAvgAggregateInputType
    _sum?: RowSumAggregateInputType
    _min?: RowMinAggregateInputType
    _max?: RowMaxAggregateInputType
  }

  export type RowGroupByOutputType = {
    id: number
    projectId: number
    userId: number | null
    sectionId: number | null
    selections: JsonValue | null
    anordning: string[]
    datum: string | null
    isPending: boolean
    approvedById: number | null
    begard: string | null
    begardDatum: string | null
    anteckning: string | null
    namn: string | null
    telefon: string | null
    createdAt: Date
    _count: RowCountAggregateOutputType | null
    _avg: RowAvgAggregateOutputType | null
    _sum: RowSumAggregateOutputType | null
    _min: RowMinAggregateOutputType | null
    _max: RowMaxAggregateOutputType | null
  }

  type GetRowGroupByPayload<T extends RowGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RowGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RowGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RowGroupByOutputType[P]>
            : GetScalarType<T[P], RowGroupByOutputType[P]>
        }
      >
    >


  export type RowSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    userId?: boolean
    sectionId?: boolean
    selections?: boolean
    anordning?: boolean
    datum?: boolean
    isPending?: boolean
    approvedById?: boolean
    begard?: boolean
    begardDatum?: boolean
    anteckning?: boolean
    namn?: boolean
    telefon?: boolean
    createdAt?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
    user?: boolean | Row$userArgs<ExtArgs>
    section?: boolean | Row$sectionArgs<ExtArgs>
    approvedBy?: boolean | Row$approvedByArgs<ExtArgs>
  }, ExtArgs["result"]["row"]>

  export type RowSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    userId?: boolean
    sectionId?: boolean
    selections?: boolean
    anordning?: boolean
    datum?: boolean
    isPending?: boolean
    approvedById?: boolean
    begard?: boolean
    begardDatum?: boolean
    anteckning?: boolean
    namn?: boolean
    telefon?: boolean
    createdAt?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
    user?: boolean | Row$userArgs<ExtArgs>
    section?: boolean | Row$sectionArgs<ExtArgs>
    approvedBy?: boolean | Row$approvedByArgs<ExtArgs>
  }, ExtArgs["result"]["row"]>

  export type RowSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    projectId?: boolean
    userId?: boolean
    sectionId?: boolean
    selections?: boolean
    anordning?: boolean
    datum?: boolean
    isPending?: boolean
    approvedById?: boolean
    begard?: boolean
    begardDatum?: boolean
    anteckning?: boolean
    namn?: boolean
    telefon?: boolean
    createdAt?: boolean
    project?: boolean | ProjectDefaultArgs<ExtArgs>
    user?: boolean | Row$userArgs<ExtArgs>
    section?: boolean | Row$sectionArgs<ExtArgs>
    approvedBy?: boolean | Row$approvedByArgs<ExtArgs>
  }, ExtArgs["result"]["row"]>

  export type RowSelectScalar = {
    id?: boolean
    projectId?: boolean
    userId?: boolean
    sectionId?: boolean
    selections?: boolean
    anordning?: boolean
    datum?: boolean
    isPending?: boolean
    approvedById?: boolean
    begard?: boolean
    begardDatum?: boolean
    anteckning?: boolean
    namn?: boolean
    telefon?: boolean
    createdAt?: boolean
  }

  export type RowOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "projectId" | "userId" | "sectionId" | "selections" | "anordning" | "datum" | "isPending" | "approvedById" | "begard" | "begardDatum" | "anteckning" | "namn" | "telefon" | "createdAt", ExtArgs["result"]["row"]>
  export type RowInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
    user?: boolean | Row$userArgs<ExtArgs>
    section?: boolean | Row$sectionArgs<ExtArgs>
    approvedBy?: boolean | Row$approvedByArgs<ExtArgs>
  }
  export type RowIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
    user?: boolean | Row$userArgs<ExtArgs>
    section?: boolean | Row$sectionArgs<ExtArgs>
    approvedBy?: boolean | Row$approvedByArgs<ExtArgs>
  }
  export type RowIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    project?: boolean | ProjectDefaultArgs<ExtArgs>
    user?: boolean | Row$userArgs<ExtArgs>
    section?: boolean | Row$sectionArgs<ExtArgs>
    approvedBy?: boolean | Row$approvedByArgs<ExtArgs>
  }

  export type $RowPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Row"
    objects: {
      project: Prisma.$ProjectPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs> | null
      section: Prisma.$SectionPayload<ExtArgs> | null
      approvedBy: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      projectId: number
      userId: number | null
      sectionId: number | null
      selections: Prisma.JsonValue | null
      anordning: string[]
      datum: string | null
      isPending: boolean
      approvedById: number | null
      begard: string | null
      begardDatum: string | null
      anteckning: string | null
      namn: string | null
      telefon: string | null
      createdAt: Date
    }, ExtArgs["result"]["row"]>
    composites: {}
  }

  type RowGetPayload<S extends boolean | null | undefined | RowDefaultArgs> = $Result.GetResult<Prisma.$RowPayload, S>

  type RowCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RowFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RowCountAggregateInputType | true
    }

  export interface RowDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Row'], meta: { name: 'Row' } }
    /**
     * Find zero or one Row that matches the filter.
     * @param {RowFindUniqueArgs} args - Arguments to find a Row
     * @example
     * // Get one Row
     * const row = await prisma.row.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RowFindUniqueArgs>(args: SelectSubset<T, RowFindUniqueArgs<ExtArgs>>): Prisma__RowClient<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Row that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RowFindUniqueOrThrowArgs} args - Arguments to find a Row
     * @example
     * // Get one Row
     * const row = await prisma.row.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RowFindUniqueOrThrowArgs>(args: SelectSubset<T, RowFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RowClient<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Row that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RowFindFirstArgs} args - Arguments to find a Row
     * @example
     * // Get one Row
     * const row = await prisma.row.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RowFindFirstArgs>(args?: SelectSubset<T, RowFindFirstArgs<ExtArgs>>): Prisma__RowClient<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Row that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RowFindFirstOrThrowArgs} args - Arguments to find a Row
     * @example
     * // Get one Row
     * const row = await prisma.row.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RowFindFirstOrThrowArgs>(args?: SelectSubset<T, RowFindFirstOrThrowArgs<ExtArgs>>): Prisma__RowClient<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Rows that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RowFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rows
     * const rows = await prisma.row.findMany()
     * 
     * // Get first 10 Rows
     * const rows = await prisma.row.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rowWithIdOnly = await prisma.row.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RowFindManyArgs>(args?: SelectSubset<T, RowFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Row.
     * @param {RowCreateArgs} args - Arguments to create a Row.
     * @example
     * // Create one Row
     * const Row = await prisma.row.create({
     *   data: {
     *     // ... data to create a Row
     *   }
     * })
     * 
     */
    create<T extends RowCreateArgs>(args: SelectSubset<T, RowCreateArgs<ExtArgs>>): Prisma__RowClient<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Rows.
     * @param {RowCreateManyArgs} args - Arguments to create many Rows.
     * @example
     * // Create many Rows
     * const row = await prisma.row.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RowCreateManyArgs>(args?: SelectSubset<T, RowCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Rows and returns the data saved in the database.
     * @param {RowCreateManyAndReturnArgs} args - Arguments to create many Rows.
     * @example
     * // Create many Rows
     * const row = await prisma.row.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Rows and only return the `id`
     * const rowWithIdOnly = await prisma.row.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RowCreateManyAndReturnArgs>(args?: SelectSubset<T, RowCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Row.
     * @param {RowDeleteArgs} args - Arguments to delete one Row.
     * @example
     * // Delete one Row
     * const Row = await prisma.row.delete({
     *   where: {
     *     // ... filter to delete one Row
     *   }
     * })
     * 
     */
    delete<T extends RowDeleteArgs>(args: SelectSubset<T, RowDeleteArgs<ExtArgs>>): Prisma__RowClient<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Row.
     * @param {RowUpdateArgs} args - Arguments to update one Row.
     * @example
     * // Update one Row
     * const row = await prisma.row.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RowUpdateArgs>(args: SelectSubset<T, RowUpdateArgs<ExtArgs>>): Prisma__RowClient<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Rows.
     * @param {RowDeleteManyArgs} args - Arguments to filter Rows to delete.
     * @example
     * // Delete a few Rows
     * const { count } = await prisma.row.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RowDeleteManyArgs>(args?: SelectSubset<T, RowDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RowUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rows
     * const row = await prisma.row.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RowUpdateManyArgs>(args: SelectSubset<T, RowUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rows and returns the data updated in the database.
     * @param {RowUpdateManyAndReturnArgs} args - Arguments to update many Rows.
     * @example
     * // Update many Rows
     * const row = await prisma.row.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Rows and only return the `id`
     * const rowWithIdOnly = await prisma.row.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RowUpdateManyAndReturnArgs>(args: SelectSubset<T, RowUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Row.
     * @param {RowUpsertArgs} args - Arguments to update or create a Row.
     * @example
     * // Update or create a Row
     * const row = await prisma.row.upsert({
     *   create: {
     *     // ... data to create a Row
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Row we want to update
     *   }
     * })
     */
    upsert<T extends RowUpsertArgs>(args: SelectSubset<T, RowUpsertArgs<ExtArgs>>): Prisma__RowClient<$Result.GetResult<Prisma.$RowPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Rows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RowCountArgs} args - Arguments to filter Rows to count.
     * @example
     * // Count the number of Rows
     * const count = await prisma.row.count({
     *   where: {
     *     // ... the filter for the Rows we want to count
     *   }
     * })
    **/
    count<T extends RowCountArgs>(
      args?: Subset<T, RowCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RowCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Row.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RowAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RowAggregateArgs>(args: Subset<T, RowAggregateArgs>): Prisma.PrismaPromise<GetRowAggregateType<T>>

    /**
     * Group by Row.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RowGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RowGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RowGroupByArgs['orderBy'] }
        : { orderBy?: RowGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RowGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRowGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Row model
   */
  readonly fields: RowFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Row.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RowClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    project<T extends ProjectDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProjectDefaultArgs<ExtArgs>>): Prisma__ProjectClient<$Result.GetResult<Prisma.$ProjectPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends Row$userArgs<ExtArgs> = {}>(args?: Subset<T, Row$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    section<T extends Row$sectionArgs<ExtArgs> = {}>(args?: Subset<T, Row$sectionArgs<ExtArgs>>): Prisma__SectionClient<$Result.GetResult<Prisma.$SectionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    approvedBy<T extends Row$approvedByArgs<ExtArgs> = {}>(args?: Subset<T, Row$approvedByArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Row model
   */
  interface RowFieldRefs {
    readonly id: FieldRef<"Row", 'Int'>
    readonly projectId: FieldRef<"Row", 'Int'>
    readonly userId: FieldRef<"Row", 'Int'>
    readonly sectionId: FieldRef<"Row", 'Int'>
    readonly selections: FieldRef<"Row", 'Json'>
    readonly anordning: FieldRef<"Row", 'String[]'>
    readonly datum: FieldRef<"Row", 'String'>
    readonly isPending: FieldRef<"Row", 'Boolean'>
    readonly approvedById: FieldRef<"Row", 'Int'>
    readonly begard: FieldRef<"Row", 'String'>
    readonly begardDatum: FieldRef<"Row", 'String'>
    readonly anteckning: FieldRef<"Row", 'String'>
    readonly namn: FieldRef<"Row", 'String'>
    readonly telefon: FieldRef<"Row", 'String'>
    readonly createdAt: FieldRef<"Row", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Row findUnique
   */
  export type RowFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    /**
     * Filter, which Row to fetch.
     */
    where: RowWhereUniqueInput
  }

  /**
   * Row findUniqueOrThrow
   */
  export type RowFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    /**
     * Filter, which Row to fetch.
     */
    where: RowWhereUniqueInput
  }

  /**
   * Row findFirst
   */
  export type RowFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    /**
     * Filter, which Row to fetch.
     */
    where?: RowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rows to fetch.
     */
    orderBy?: RowOrderByWithRelationInput | RowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rows.
     */
    cursor?: RowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rows.
     */
    distinct?: RowScalarFieldEnum | RowScalarFieldEnum[]
  }

  /**
   * Row findFirstOrThrow
   */
  export type RowFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    /**
     * Filter, which Row to fetch.
     */
    where?: RowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rows to fetch.
     */
    orderBy?: RowOrderByWithRelationInput | RowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rows.
     */
    cursor?: RowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rows.
     */
    distinct?: RowScalarFieldEnum | RowScalarFieldEnum[]
  }

  /**
   * Row findMany
   */
  export type RowFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    /**
     * Filter, which Rows to fetch.
     */
    where?: RowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rows to fetch.
     */
    orderBy?: RowOrderByWithRelationInput | RowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Rows.
     */
    cursor?: RowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rows.
     */
    skip?: number
    distinct?: RowScalarFieldEnum | RowScalarFieldEnum[]
  }

  /**
   * Row create
   */
  export type RowCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    /**
     * The data needed to create a Row.
     */
    data: XOR<RowCreateInput, RowUncheckedCreateInput>
  }

  /**
   * Row createMany
   */
  export type RowCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Rows.
     */
    data: RowCreateManyInput | RowCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Row createManyAndReturn
   */
  export type RowCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * The data used to create many Rows.
     */
    data: RowCreateManyInput | RowCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Row update
   */
  export type RowUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    /**
     * The data needed to update a Row.
     */
    data: XOR<RowUpdateInput, RowUncheckedUpdateInput>
    /**
     * Choose, which Row to update.
     */
    where: RowWhereUniqueInput
  }

  /**
   * Row updateMany
   */
  export type RowUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Rows.
     */
    data: XOR<RowUpdateManyMutationInput, RowUncheckedUpdateManyInput>
    /**
     * Filter which Rows to update
     */
    where?: RowWhereInput
    /**
     * Limit how many Rows to update.
     */
    limit?: number
  }

  /**
   * Row updateManyAndReturn
   */
  export type RowUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * The data used to update Rows.
     */
    data: XOR<RowUpdateManyMutationInput, RowUncheckedUpdateManyInput>
    /**
     * Filter which Rows to update
     */
    where?: RowWhereInput
    /**
     * Limit how many Rows to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Row upsert
   */
  export type RowUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    /**
     * The filter to search for the Row to update in case it exists.
     */
    where: RowWhereUniqueInput
    /**
     * In case the Row found by the `where` argument doesn't exist, create a new Row with this data.
     */
    create: XOR<RowCreateInput, RowUncheckedCreateInput>
    /**
     * In case the Row was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RowUpdateInput, RowUncheckedUpdateInput>
  }

  /**
   * Row delete
   */
  export type RowDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
    /**
     * Filter which Row to delete.
     */
    where: RowWhereUniqueInput
  }

  /**
   * Row deleteMany
   */
  export type RowDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rows to delete
     */
    where?: RowWhereInput
    /**
     * Limit how many Rows to delete.
     */
    limit?: number
  }

  /**
   * Row.user
   */
  export type Row$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Row.section
   */
  export type Row$sectionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Section
     */
    select?: SectionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Section
     */
    omit?: SectionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SectionInclude<ExtArgs> | null
    where?: SectionWhereInput
  }

  /**
   * Row.approvedBy
   */
  export type Row$approvedByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Row without action
   */
  export type RowDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Row
     */
    select?: RowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Row
     */
    omit?: RowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RowInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    phone: 'phone',
    company: 'company',
    role: 'role',
    firstName: 'firstName',
    lastName: 'lastName',
    signature: 'signature'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ProjectScalarFieldEnum: {
    id: 'id',
    name: 'name',
    userId: 'userId',
    createdAt: 'createdAt',
    startDate: 'startDate',
    startTime: 'startTime',
    endDate: 'endDate',
    endTime: 'endTime',
    plats: 'plats',
    namn: 'namn',
    telefonnummer: 'telefonnummer',
    rows: 'rows',
    anteckningar: 'anteckningar'
  };

  export type ProjectScalarFieldEnum = (typeof ProjectScalarFieldEnum)[keyof typeof ProjectScalarFieldEnum]


  export const SectionScalarFieldEnum: {
    id: 'id',
    name: 'name',
    type: 'type',
    projectId: 'projectId'
  };

  export type SectionScalarFieldEnum = (typeof SectionScalarFieldEnum)[keyof typeof SectionScalarFieldEnum]


  export const BeteckningScalarFieldEnum: {
    id: 'id',
    label: 'label',
    projectId: 'projectId'
  };

  export type BeteckningScalarFieldEnum = (typeof BeteckningScalarFieldEnum)[keyof typeof BeteckningScalarFieldEnum]


  export const EmployeeScalarFieldEnum: {
    id: 'id',
    employerId: 'employerId',
    employeeId: 'employeeId'
  };

  export type EmployeeScalarFieldEnum = (typeof EmployeeScalarFieldEnum)[keyof typeof EmployeeScalarFieldEnum]


  export const RowScalarFieldEnum: {
    id: 'id',
    projectId: 'projectId',
    userId: 'userId',
    sectionId: 'sectionId',
    selections: 'selections',
    anordning: 'anordning',
    datum: 'datum',
    isPending: 'isPending',
    approvedById: 'approvedById',
    begard: 'begard',
    begardDatum: 'begardDatum',
    anteckning: 'anteckning',
    namn: 'namn',
    telefon: 'telefon',
    createdAt: 'createdAt'
  };

  export type RowScalarFieldEnum = (typeof RowScalarFieldEnum)[keyof typeof RowScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    email?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    company?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    firstName?: StringNullableFilter<"User"> | string | null
    lastName?: StringNullableFilter<"User"> | string | null
    signature?: StringNullableFilter<"User"> | string | null
    projects?: ProjectListRelationFilter
    employees?: EmployeeListRelationFilter
    employerOf?: EmployeeListRelationFilter
    createdRows?: RowListRelationFilter
    approvedRows?: RowListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    phone?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    role?: SortOrder
    firstName?: SortOrderInput | SortOrder
    lastName?: SortOrderInput | SortOrder
    signature?: SortOrderInput | SortOrder
    projects?: ProjectOrderByRelationAggregateInput
    employees?: EmployeeOrderByRelationAggregateInput
    employerOf?: EmployeeOrderByRelationAggregateInput
    createdRows?: RowOrderByRelationAggregateInput
    approvedRows?: RowOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    company?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    firstName?: StringNullableFilter<"User"> | string | null
    lastName?: StringNullableFilter<"User"> | string | null
    signature?: StringNullableFilter<"User"> | string | null
    projects?: ProjectListRelationFilter
    employees?: EmployeeListRelationFilter
    employerOf?: EmployeeListRelationFilter
    createdRows?: RowListRelationFilter
    approvedRows?: RowListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    phone?: SortOrderInput | SortOrder
    company?: SortOrderInput | SortOrder
    role?: SortOrder
    firstName?: SortOrderInput | SortOrder
    lastName?: SortOrderInput | SortOrder
    signature?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    email?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null
    company?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: StringWithAggregatesFilter<"User"> | string
    firstName?: StringNullableWithAggregatesFilter<"User"> | string | null
    lastName?: StringNullableWithAggregatesFilter<"User"> | string | null
    signature?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type ProjectWhereInput = {
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    id?: IntFilter<"Project"> | number
    name?: StringFilter<"Project"> | string
    userId?: IntNullableFilter<"Project"> | number | null
    createdAt?: DateTimeFilter<"Project"> | Date | string
    startDate?: StringFilter<"Project"> | string
    startTime?: StringFilter<"Project"> | string
    endDate?: StringFilter<"Project"> | string
    endTime?: StringFilter<"Project"> | string
    plats?: StringFilter<"Project"> | string
    namn?: StringFilter<"Project"> | string
    telefonnummer?: StringFilter<"Project"> | string
    rows?: JsonNullableFilter<"Project">
    anteckningar?: JsonNullableFilter<"Project">
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    sections?: SectionListRelationFilter
    beteckningar?: BeteckningListRelationFilter
    tsmRows?: RowListRelationFilter
  }

  export type ProjectOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    userId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    startDate?: SortOrder
    startTime?: SortOrder
    endDate?: SortOrder
    endTime?: SortOrder
    plats?: SortOrder
    namn?: SortOrder
    telefonnummer?: SortOrder
    rows?: SortOrderInput | SortOrder
    anteckningar?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    sections?: SectionOrderByRelationAggregateInput
    beteckningar?: BeteckningOrderByRelationAggregateInput
    tsmRows?: RowOrderByRelationAggregateInput
  }

  export type ProjectWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ProjectWhereInput | ProjectWhereInput[]
    OR?: ProjectWhereInput[]
    NOT?: ProjectWhereInput | ProjectWhereInput[]
    name?: StringFilter<"Project"> | string
    userId?: IntNullableFilter<"Project"> | number | null
    createdAt?: DateTimeFilter<"Project"> | Date | string
    startDate?: StringFilter<"Project"> | string
    startTime?: StringFilter<"Project"> | string
    endDate?: StringFilter<"Project"> | string
    endTime?: StringFilter<"Project"> | string
    plats?: StringFilter<"Project"> | string
    namn?: StringFilter<"Project"> | string
    telefonnummer?: StringFilter<"Project"> | string
    rows?: JsonNullableFilter<"Project">
    anteckningar?: JsonNullableFilter<"Project">
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    sections?: SectionListRelationFilter
    beteckningar?: BeteckningListRelationFilter
    tsmRows?: RowListRelationFilter
  }, "id">

  export type ProjectOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    userId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    startDate?: SortOrder
    startTime?: SortOrder
    endDate?: SortOrder
    endTime?: SortOrder
    plats?: SortOrder
    namn?: SortOrder
    telefonnummer?: SortOrder
    rows?: SortOrderInput | SortOrder
    anteckningar?: SortOrderInput | SortOrder
    _count?: ProjectCountOrderByAggregateInput
    _avg?: ProjectAvgOrderByAggregateInput
    _max?: ProjectMaxOrderByAggregateInput
    _min?: ProjectMinOrderByAggregateInput
    _sum?: ProjectSumOrderByAggregateInput
  }

  export type ProjectScalarWhereWithAggregatesInput = {
    AND?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    OR?: ProjectScalarWhereWithAggregatesInput[]
    NOT?: ProjectScalarWhereWithAggregatesInput | ProjectScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Project"> | number
    name?: StringWithAggregatesFilter<"Project"> | string
    userId?: IntNullableWithAggregatesFilter<"Project"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"Project"> | Date | string
    startDate?: StringWithAggregatesFilter<"Project"> | string
    startTime?: StringWithAggregatesFilter<"Project"> | string
    endDate?: StringWithAggregatesFilter<"Project"> | string
    endTime?: StringWithAggregatesFilter<"Project"> | string
    plats?: StringWithAggregatesFilter<"Project"> | string
    namn?: StringWithAggregatesFilter<"Project"> | string
    telefonnummer?: StringWithAggregatesFilter<"Project"> | string
    rows?: JsonNullableWithAggregatesFilter<"Project">
    anteckningar?: JsonNullableWithAggregatesFilter<"Project">
  }

  export type SectionWhereInput = {
    AND?: SectionWhereInput | SectionWhereInput[]
    OR?: SectionWhereInput[]
    NOT?: SectionWhereInput | SectionWhereInput[]
    id?: IntFilter<"Section"> | number
    name?: StringFilter<"Section"> | string
    type?: StringFilter<"Section"> | string
    projectId?: IntFilter<"Section"> | number
    project?: XOR<ProjectScalarRelationFilter, ProjectWhereInput>
    rows?: RowListRelationFilter
  }

  export type SectionOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    projectId?: SortOrder
    project?: ProjectOrderByWithRelationInput
    rows?: RowOrderByRelationAggregateInput
  }

  export type SectionWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SectionWhereInput | SectionWhereInput[]
    OR?: SectionWhereInput[]
    NOT?: SectionWhereInput | SectionWhereInput[]
    name?: StringFilter<"Section"> | string
    type?: StringFilter<"Section"> | string
    projectId?: IntFilter<"Section"> | number
    project?: XOR<ProjectScalarRelationFilter, ProjectWhereInput>
    rows?: RowListRelationFilter
  }, "id">

  export type SectionOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    projectId?: SortOrder
    _count?: SectionCountOrderByAggregateInput
    _avg?: SectionAvgOrderByAggregateInput
    _max?: SectionMaxOrderByAggregateInput
    _min?: SectionMinOrderByAggregateInput
    _sum?: SectionSumOrderByAggregateInput
  }

  export type SectionScalarWhereWithAggregatesInput = {
    AND?: SectionScalarWhereWithAggregatesInput | SectionScalarWhereWithAggregatesInput[]
    OR?: SectionScalarWhereWithAggregatesInput[]
    NOT?: SectionScalarWhereWithAggregatesInput | SectionScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Section"> | number
    name?: StringWithAggregatesFilter<"Section"> | string
    type?: StringWithAggregatesFilter<"Section"> | string
    projectId?: IntWithAggregatesFilter<"Section"> | number
  }

  export type BeteckningWhereInput = {
    AND?: BeteckningWhereInput | BeteckningWhereInput[]
    OR?: BeteckningWhereInput[]
    NOT?: BeteckningWhereInput | BeteckningWhereInput[]
    id?: IntFilter<"Beteckning"> | number
    label?: StringFilter<"Beteckning"> | string
    projectId?: IntFilter<"Beteckning"> | number
    project?: XOR<ProjectScalarRelationFilter, ProjectWhereInput>
  }

  export type BeteckningOrderByWithRelationInput = {
    id?: SortOrder
    label?: SortOrder
    projectId?: SortOrder
    project?: ProjectOrderByWithRelationInput
  }

  export type BeteckningWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: BeteckningWhereInput | BeteckningWhereInput[]
    OR?: BeteckningWhereInput[]
    NOT?: BeteckningWhereInput | BeteckningWhereInput[]
    label?: StringFilter<"Beteckning"> | string
    projectId?: IntFilter<"Beteckning"> | number
    project?: XOR<ProjectScalarRelationFilter, ProjectWhereInput>
  }, "id">

  export type BeteckningOrderByWithAggregationInput = {
    id?: SortOrder
    label?: SortOrder
    projectId?: SortOrder
    _count?: BeteckningCountOrderByAggregateInput
    _avg?: BeteckningAvgOrderByAggregateInput
    _max?: BeteckningMaxOrderByAggregateInput
    _min?: BeteckningMinOrderByAggregateInput
    _sum?: BeteckningSumOrderByAggregateInput
  }

  export type BeteckningScalarWhereWithAggregatesInput = {
    AND?: BeteckningScalarWhereWithAggregatesInput | BeteckningScalarWhereWithAggregatesInput[]
    OR?: BeteckningScalarWhereWithAggregatesInput[]
    NOT?: BeteckningScalarWhereWithAggregatesInput | BeteckningScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Beteckning"> | number
    label?: StringWithAggregatesFilter<"Beteckning"> | string
    projectId?: IntWithAggregatesFilter<"Beteckning"> | number
  }

  export type EmployeeWhereInput = {
    AND?: EmployeeWhereInput | EmployeeWhereInput[]
    OR?: EmployeeWhereInput[]
    NOT?: EmployeeWhereInput | EmployeeWhereInput[]
    id?: IntFilter<"Employee"> | number
    employerId?: IntFilter<"Employee"> | number
    employeeId?: IntFilter<"Employee"> | number
    employer?: XOR<UserScalarRelationFilter, UserWhereInput>
    employee?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type EmployeeOrderByWithRelationInput = {
    id?: SortOrder
    employerId?: SortOrder
    employeeId?: SortOrder
    employer?: UserOrderByWithRelationInput
    employee?: UserOrderByWithRelationInput
  }

  export type EmployeeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    employerId_employeeId?: EmployeeEmployerIdEmployeeIdCompoundUniqueInput
    AND?: EmployeeWhereInput | EmployeeWhereInput[]
    OR?: EmployeeWhereInput[]
    NOT?: EmployeeWhereInput | EmployeeWhereInput[]
    employerId?: IntFilter<"Employee"> | number
    employeeId?: IntFilter<"Employee"> | number
    employer?: XOR<UserScalarRelationFilter, UserWhereInput>
    employee?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "employerId_employeeId">

  export type EmployeeOrderByWithAggregationInput = {
    id?: SortOrder
    employerId?: SortOrder
    employeeId?: SortOrder
    _count?: EmployeeCountOrderByAggregateInput
    _avg?: EmployeeAvgOrderByAggregateInput
    _max?: EmployeeMaxOrderByAggregateInput
    _min?: EmployeeMinOrderByAggregateInput
    _sum?: EmployeeSumOrderByAggregateInput
  }

  export type EmployeeScalarWhereWithAggregatesInput = {
    AND?: EmployeeScalarWhereWithAggregatesInput | EmployeeScalarWhereWithAggregatesInput[]
    OR?: EmployeeScalarWhereWithAggregatesInput[]
    NOT?: EmployeeScalarWhereWithAggregatesInput | EmployeeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Employee"> | number
    employerId?: IntWithAggregatesFilter<"Employee"> | number
    employeeId?: IntWithAggregatesFilter<"Employee"> | number
  }

  export type RowWhereInput = {
    AND?: RowWhereInput | RowWhereInput[]
    OR?: RowWhereInput[]
    NOT?: RowWhereInput | RowWhereInput[]
    id?: IntFilter<"Row"> | number
    projectId?: IntFilter<"Row"> | number
    userId?: IntNullableFilter<"Row"> | number | null
    sectionId?: IntNullableFilter<"Row"> | number | null
    selections?: JsonNullableFilter<"Row">
    anordning?: StringNullableListFilter<"Row">
    datum?: StringNullableFilter<"Row"> | string | null
    isPending?: BoolFilter<"Row"> | boolean
    approvedById?: IntNullableFilter<"Row"> | number | null
    begard?: StringNullableFilter<"Row"> | string | null
    begardDatum?: StringNullableFilter<"Row"> | string | null
    anteckning?: StringNullableFilter<"Row"> | string | null
    namn?: StringNullableFilter<"Row"> | string | null
    telefon?: StringNullableFilter<"Row"> | string | null
    createdAt?: DateTimeFilter<"Row"> | Date | string
    project?: XOR<ProjectScalarRelationFilter, ProjectWhereInput>
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    section?: XOR<SectionNullableScalarRelationFilter, SectionWhereInput> | null
    approvedBy?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type RowOrderByWithRelationInput = {
    id?: SortOrder
    projectId?: SortOrder
    userId?: SortOrderInput | SortOrder
    sectionId?: SortOrderInput | SortOrder
    selections?: SortOrderInput | SortOrder
    anordning?: SortOrder
    datum?: SortOrderInput | SortOrder
    isPending?: SortOrder
    approvedById?: SortOrderInput | SortOrder
    begard?: SortOrderInput | SortOrder
    begardDatum?: SortOrderInput | SortOrder
    anteckning?: SortOrderInput | SortOrder
    namn?: SortOrderInput | SortOrder
    telefon?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    project?: ProjectOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
    section?: SectionOrderByWithRelationInput
    approvedBy?: UserOrderByWithRelationInput
  }

  export type RowWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: RowWhereInput | RowWhereInput[]
    OR?: RowWhereInput[]
    NOT?: RowWhereInput | RowWhereInput[]
    projectId?: IntFilter<"Row"> | number
    userId?: IntNullableFilter<"Row"> | number | null
    sectionId?: IntNullableFilter<"Row"> | number | null
    selections?: JsonNullableFilter<"Row">
    anordning?: StringNullableListFilter<"Row">
    datum?: StringNullableFilter<"Row"> | string | null
    isPending?: BoolFilter<"Row"> | boolean
    approvedById?: IntNullableFilter<"Row"> | number | null
    begard?: StringNullableFilter<"Row"> | string | null
    begardDatum?: StringNullableFilter<"Row"> | string | null
    anteckning?: StringNullableFilter<"Row"> | string | null
    namn?: StringNullableFilter<"Row"> | string | null
    telefon?: StringNullableFilter<"Row"> | string | null
    createdAt?: DateTimeFilter<"Row"> | Date | string
    project?: XOR<ProjectScalarRelationFilter, ProjectWhereInput>
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    section?: XOR<SectionNullableScalarRelationFilter, SectionWhereInput> | null
    approvedBy?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id">

  export type RowOrderByWithAggregationInput = {
    id?: SortOrder
    projectId?: SortOrder
    userId?: SortOrderInput | SortOrder
    sectionId?: SortOrderInput | SortOrder
    selections?: SortOrderInput | SortOrder
    anordning?: SortOrder
    datum?: SortOrderInput | SortOrder
    isPending?: SortOrder
    approvedById?: SortOrderInput | SortOrder
    begard?: SortOrderInput | SortOrder
    begardDatum?: SortOrderInput | SortOrder
    anteckning?: SortOrderInput | SortOrder
    namn?: SortOrderInput | SortOrder
    telefon?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: RowCountOrderByAggregateInput
    _avg?: RowAvgOrderByAggregateInput
    _max?: RowMaxOrderByAggregateInput
    _min?: RowMinOrderByAggregateInput
    _sum?: RowSumOrderByAggregateInput
  }

  export type RowScalarWhereWithAggregatesInput = {
    AND?: RowScalarWhereWithAggregatesInput | RowScalarWhereWithAggregatesInput[]
    OR?: RowScalarWhereWithAggregatesInput[]
    NOT?: RowScalarWhereWithAggregatesInput | RowScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Row"> | number
    projectId?: IntWithAggregatesFilter<"Row"> | number
    userId?: IntNullableWithAggregatesFilter<"Row"> | number | null
    sectionId?: IntNullableWithAggregatesFilter<"Row"> | number | null
    selections?: JsonNullableWithAggregatesFilter<"Row">
    anordning?: StringNullableListFilter<"Row">
    datum?: StringNullableWithAggregatesFilter<"Row"> | string | null
    isPending?: BoolWithAggregatesFilter<"Row"> | boolean
    approvedById?: IntNullableWithAggregatesFilter<"Row"> | number | null
    begard?: StringNullableWithAggregatesFilter<"Row"> | string | null
    begardDatum?: StringNullableWithAggregatesFilter<"Row"> | string | null
    anteckning?: StringNullableWithAggregatesFilter<"Row"> | string | null
    namn?: StringNullableWithAggregatesFilter<"Row"> | string | null
    telefon?: StringNullableWithAggregatesFilter<"Row"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Row"> | Date | string
  }

  export type UserCreateInput = {
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    projects?: ProjectCreateNestedManyWithoutUserInput
    employees?: EmployeeCreateNestedManyWithoutEmployerInput
    employerOf?: EmployeeCreateNestedManyWithoutEmployeeInput
    createdRows?: RowCreateNestedManyWithoutUserInput
    approvedRows?: RowCreateNestedManyWithoutApprovedByInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
    employees?: EmployeeUncheckedCreateNestedManyWithoutEmployerInput
    employerOf?: EmployeeUncheckedCreateNestedManyWithoutEmployeeInput
    createdRows?: RowUncheckedCreateNestedManyWithoutUserInput
    approvedRows?: RowUncheckedCreateNestedManyWithoutApprovedByInput
  }

  export type UserUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUpdateManyWithoutUserNestedInput
    employees?: EmployeeUpdateManyWithoutEmployerNestedInput
    employerOf?: EmployeeUpdateManyWithoutEmployeeNestedInput
    createdRows?: RowUpdateManyWithoutUserNestedInput
    approvedRows?: RowUpdateManyWithoutApprovedByNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
    employees?: EmployeeUncheckedUpdateManyWithoutEmployerNestedInput
    employerOf?: EmployeeUncheckedUpdateManyWithoutEmployeeNestedInput
    createdRows?: RowUncheckedUpdateManyWithoutUserNestedInput
    approvedRows?: RowUncheckedUpdateManyWithoutApprovedByNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
  }

  export type UserUpdateManyMutationInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProjectCreateInput = {
    name: string
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    user?: UserCreateNestedOneWithoutProjectsInput
    sections?: SectionCreateNestedManyWithoutProjectInput
    beteckningar?: BeteckningCreateNestedManyWithoutProjectInput
    tsmRows?: RowCreateNestedManyWithoutProjectInput
  }

  export type ProjectUncheckedCreateInput = {
    id?: number
    name: string
    userId?: number | null
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    sections?: SectionUncheckedCreateNestedManyWithoutProjectInput
    beteckningar?: BeteckningUncheckedCreateNestedManyWithoutProjectInput
    tsmRows?: RowUncheckedCreateNestedManyWithoutProjectInput
  }

  export type ProjectUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    user?: UserUpdateOneWithoutProjectsNestedInput
    sections?: SectionUpdateManyWithoutProjectNestedInput
    beteckningar?: BeteckningUpdateManyWithoutProjectNestedInput
    tsmRows?: RowUpdateManyWithoutProjectNestedInput
  }

  export type ProjectUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    sections?: SectionUncheckedUpdateManyWithoutProjectNestedInput
    beteckningar?: BeteckningUncheckedUpdateManyWithoutProjectNestedInput
    tsmRows?: RowUncheckedUpdateManyWithoutProjectNestedInput
  }

  export type ProjectCreateManyInput = {
    id?: number
    name: string
    userId?: number | null
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ProjectUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ProjectUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
  }

  export type SectionCreateInput = {
    name: string
    type: string
    project: ProjectCreateNestedOneWithoutSectionsInput
    rows?: RowCreateNestedManyWithoutSectionInput
  }

  export type SectionUncheckedCreateInput = {
    id?: number
    name: string
    type: string
    projectId: number
    rows?: RowUncheckedCreateNestedManyWithoutSectionInput
  }

  export type SectionUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    project?: ProjectUpdateOneRequiredWithoutSectionsNestedInput
    rows?: RowUpdateManyWithoutSectionNestedInput
  }

  export type SectionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    projectId?: IntFieldUpdateOperationsInput | number
    rows?: RowUncheckedUpdateManyWithoutSectionNestedInput
  }

  export type SectionCreateManyInput = {
    id?: number
    name: string
    type: string
    projectId: number
  }

  export type SectionUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
  }

  export type SectionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    projectId?: IntFieldUpdateOperationsInput | number
  }

  export type BeteckningCreateInput = {
    label: string
    project: ProjectCreateNestedOneWithoutBeteckningarInput
  }

  export type BeteckningUncheckedCreateInput = {
    id?: number
    label: string
    projectId: number
  }

  export type BeteckningUpdateInput = {
    label?: StringFieldUpdateOperationsInput | string
    project?: ProjectUpdateOneRequiredWithoutBeteckningarNestedInput
  }

  export type BeteckningUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    label?: StringFieldUpdateOperationsInput | string
    projectId?: IntFieldUpdateOperationsInput | number
  }

  export type BeteckningCreateManyInput = {
    id?: number
    label: string
    projectId: number
  }

  export type BeteckningUpdateManyMutationInput = {
    label?: StringFieldUpdateOperationsInput | string
  }

  export type BeteckningUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    label?: StringFieldUpdateOperationsInput | string
    projectId?: IntFieldUpdateOperationsInput | number
  }

  export type EmployeeCreateInput = {
    employer: UserCreateNestedOneWithoutEmployeesInput
    employee: UserCreateNestedOneWithoutEmployerOfInput
  }

  export type EmployeeUncheckedCreateInput = {
    id?: number
    employerId: number
    employeeId: number
  }

  export type EmployeeUpdateInput = {
    employer?: UserUpdateOneRequiredWithoutEmployeesNestedInput
    employee?: UserUpdateOneRequiredWithoutEmployerOfNestedInput
  }

  export type EmployeeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    employerId?: IntFieldUpdateOperationsInput | number
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type EmployeeCreateManyInput = {
    id?: number
    employerId: number
    employeeId: number
  }

  export type EmployeeUpdateManyMutationInput = {

  }

  export type EmployeeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    employerId?: IntFieldUpdateOperationsInput | number
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type RowCreateInput = {
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
    project: ProjectCreateNestedOneWithoutTsmRowsInput
    user?: UserCreateNestedOneWithoutCreatedRowsInput
    section?: SectionCreateNestedOneWithoutRowsInput
    approvedBy?: UserCreateNestedOneWithoutApprovedRowsInput
  }

  export type RowUncheckedCreateInput = {
    id?: number
    projectId: number
    userId?: number | null
    sectionId?: number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    approvedById?: number | null
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
  }

  export type RowUpdateInput = {
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: ProjectUpdateOneRequiredWithoutTsmRowsNestedInput
    user?: UserUpdateOneWithoutCreatedRowsNestedInput
    section?: SectionUpdateOneWithoutRowsNestedInput
    approvedBy?: UserUpdateOneWithoutApprovedRowsNestedInput
  }

  export type RowUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    projectId?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    sectionId?: NullableIntFieldUpdateOperationsInput | number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    approvedById?: NullableIntFieldUpdateOperationsInput | number | null
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RowCreateManyInput = {
    id?: number
    projectId: number
    userId?: number | null
    sectionId?: number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    approvedById?: number | null
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
  }

  export type RowUpdateManyMutationInput = {
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RowUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    projectId?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    sectionId?: NullableIntFieldUpdateOperationsInput | number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    approvedById?: NullableIntFieldUpdateOperationsInput | number | null
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type ProjectListRelationFilter = {
    every?: ProjectWhereInput
    some?: ProjectWhereInput
    none?: ProjectWhereInput
  }

  export type EmployeeListRelationFilter = {
    every?: EmployeeWhereInput
    some?: EmployeeWhereInput
    none?: EmployeeWhereInput
  }

  export type RowListRelationFilter = {
    every?: RowWhereInput
    some?: RowWhereInput
    none?: RowWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ProjectOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmployeeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RowOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    phone?: SortOrder
    company?: SortOrder
    role?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    signature?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    phone?: SortOrder
    company?: SortOrder
    role?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    signature?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    phone?: SortOrder
    company?: SortOrder
    role?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    signature?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type SectionListRelationFilter = {
    every?: SectionWhereInput
    some?: SectionWhereInput
    none?: SectionWhereInput
  }

  export type BeteckningListRelationFilter = {
    every?: BeteckningWhereInput
    some?: BeteckningWhereInput
    none?: BeteckningWhereInput
  }

  export type SectionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BeteckningOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProjectCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    startDate?: SortOrder
    startTime?: SortOrder
    endDate?: SortOrder
    endTime?: SortOrder
    plats?: SortOrder
    namn?: SortOrder
    telefonnummer?: SortOrder
    rows?: SortOrder
    anteckningar?: SortOrder
  }

  export type ProjectAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type ProjectMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    startDate?: SortOrder
    startTime?: SortOrder
    endDate?: SortOrder
    endTime?: SortOrder
    plats?: SortOrder
    namn?: SortOrder
    telefonnummer?: SortOrder
  }

  export type ProjectMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    startDate?: SortOrder
    startTime?: SortOrder
    endDate?: SortOrder
    endTime?: SortOrder
    plats?: SortOrder
    namn?: SortOrder
    telefonnummer?: SortOrder
  }

  export type ProjectSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type ProjectScalarRelationFilter = {
    is?: ProjectWhereInput
    isNot?: ProjectWhereInput
  }

  export type SectionCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    projectId?: SortOrder
  }

  export type SectionAvgOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
  }

  export type SectionMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    projectId?: SortOrder
  }

  export type SectionMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    type?: SortOrder
    projectId?: SortOrder
  }

  export type SectionSumOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
  }

  export type BeteckningCountOrderByAggregateInput = {
    id?: SortOrder
    label?: SortOrder
    projectId?: SortOrder
  }

  export type BeteckningAvgOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
  }

  export type BeteckningMaxOrderByAggregateInput = {
    id?: SortOrder
    label?: SortOrder
    projectId?: SortOrder
  }

  export type BeteckningMinOrderByAggregateInput = {
    id?: SortOrder
    label?: SortOrder
    projectId?: SortOrder
  }

  export type BeteckningSumOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type EmployeeEmployerIdEmployeeIdCompoundUniqueInput = {
    employerId: number
    employeeId: number
  }

  export type EmployeeCountOrderByAggregateInput = {
    id?: SortOrder
    employerId?: SortOrder
    employeeId?: SortOrder
  }

  export type EmployeeAvgOrderByAggregateInput = {
    id?: SortOrder
    employerId?: SortOrder
    employeeId?: SortOrder
  }

  export type EmployeeMaxOrderByAggregateInput = {
    id?: SortOrder
    employerId?: SortOrder
    employeeId?: SortOrder
  }

  export type EmployeeMinOrderByAggregateInput = {
    id?: SortOrder
    employerId?: SortOrder
    employeeId?: SortOrder
  }

  export type EmployeeSumOrderByAggregateInput = {
    id?: SortOrder
    employerId?: SortOrder
    employeeId?: SortOrder
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type SectionNullableScalarRelationFilter = {
    is?: SectionWhereInput | null
    isNot?: SectionWhereInput | null
  }

  export type RowCountOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    userId?: SortOrder
    sectionId?: SortOrder
    selections?: SortOrder
    anordning?: SortOrder
    datum?: SortOrder
    isPending?: SortOrder
    approvedById?: SortOrder
    begard?: SortOrder
    begardDatum?: SortOrder
    anteckning?: SortOrder
    namn?: SortOrder
    telefon?: SortOrder
    createdAt?: SortOrder
  }

  export type RowAvgOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    userId?: SortOrder
    sectionId?: SortOrder
    approvedById?: SortOrder
  }

  export type RowMaxOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    userId?: SortOrder
    sectionId?: SortOrder
    datum?: SortOrder
    isPending?: SortOrder
    approvedById?: SortOrder
    begard?: SortOrder
    begardDatum?: SortOrder
    anteckning?: SortOrder
    namn?: SortOrder
    telefon?: SortOrder
    createdAt?: SortOrder
  }

  export type RowMinOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    userId?: SortOrder
    sectionId?: SortOrder
    datum?: SortOrder
    isPending?: SortOrder
    approvedById?: SortOrder
    begard?: SortOrder
    begardDatum?: SortOrder
    anteckning?: SortOrder
    namn?: SortOrder
    telefon?: SortOrder
    createdAt?: SortOrder
  }

  export type RowSumOrderByAggregateInput = {
    id?: SortOrder
    projectId?: SortOrder
    userId?: SortOrder
    sectionId?: SortOrder
    approvedById?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ProjectCreateNestedManyWithoutUserInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
  }

  export type EmployeeCreateNestedManyWithoutEmployerInput = {
    create?: XOR<EmployeeCreateWithoutEmployerInput, EmployeeUncheckedCreateWithoutEmployerInput> | EmployeeCreateWithoutEmployerInput[] | EmployeeUncheckedCreateWithoutEmployerInput[]
    connectOrCreate?: EmployeeCreateOrConnectWithoutEmployerInput | EmployeeCreateOrConnectWithoutEmployerInput[]
    createMany?: EmployeeCreateManyEmployerInputEnvelope
    connect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
  }

  export type EmployeeCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<EmployeeCreateWithoutEmployeeInput, EmployeeUncheckedCreateWithoutEmployeeInput> | EmployeeCreateWithoutEmployeeInput[] | EmployeeUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: EmployeeCreateOrConnectWithoutEmployeeInput | EmployeeCreateOrConnectWithoutEmployeeInput[]
    createMany?: EmployeeCreateManyEmployeeInputEnvelope
    connect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
  }

  export type RowCreateNestedManyWithoutUserInput = {
    create?: XOR<RowCreateWithoutUserInput, RowUncheckedCreateWithoutUserInput> | RowCreateWithoutUserInput[] | RowUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RowCreateOrConnectWithoutUserInput | RowCreateOrConnectWithoutUserInput[]
    createMany?: RowCreateManyUserInputEnvelope
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
  }

  export type RowCreateNestedManyWithoutApprovedByInput = {
    create?: XOR<RowCreateWithoutApprovedByInput, RowUncheckedCreateWithoutApprovedByInput> | RowCreateWithoutApprovedByInput[] | RowUncheckedCreateWithoutApprovedByInput[]
    connectOrCreate?: RowCreateOrConnectWithoutApprovedByInput | RowCreateOrConnectWithoutApprovedByInput[]
    createMany?: RowCreateManyApprovedByInputEnvelope
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
  }

  export type ProjectUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
  }

  export type EmployeeUncheckedCreateNestedManyWithoutEmployerInput = {
    create?: XOR<EmployeeCreateWithoutEmployerInput, EmployeeUncheckedCreateWithoutEmployerInput> | EmployeeCreateWithoutEmployerInput[] | EmployeeUncheckedCreateWithoutEmployerInput[]
    connectOrCreate?: EmployeeCreateOrConnectWithoutEmployerInput | EmployeeCreateOrConnectWithoutEmployerInput[]
    createMany?: EmployeeCreateManyEmployerInputEnvelope
    connect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
  }

  export type EmployeeUncheckedCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<EmployeeCreateWithoutEmployeeInput, EmployeeUncheckedCreateWithoutEmployeeInput> | EmployeeCreateWithoutEmployeeInput[] | EmployeeUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: EmployeeCreateOrConnectWithoutEmployeeInput | EmployeeCreateOrConnectWithoutEmployeeInput[]
    createMany?: EmployeeCreateManyEmployeeInputEnvelope
    connect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
  }

  export type RowUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<RowCreateWithoutUserInput, RowUncheckedCreateWithoutUserInput> | RowCreateWithoutUserInput[] | RowUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RowCreateOrConnectWithoutUserInput | RowCreateOrConnectWithoutUserInput[]
    createMany?: RowCreateManyUserInputEnvelope
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
  }

  export type RowUncheckedCreateNestedManyWithoutApprovedByInput = {
    create?: XOR<RowCreateWithoutApprovedByInput, RowUncheckedCreateWithoutApprovedByInput> | RowCreateWithoutApprovedByInput[] | RowUncheckedCreateWithoutApprovedByInput[]
    connectOrCreate?: RowCreateOrConnectWithoutApprovedByInput | RowCreateOrConnectWithoutApprovedByInput[]
    createMany?: RowCreateManyApprovedByInputEnvelope
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type ProjectUpdateManyWithoutUserNestedInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    upsert?: ProjectUpsertWithWhereUniqueWithoutUserInput | ProjectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    set?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    disconnect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    delete?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    update?: ProjectUpdateWithWhereUniqueWithoutUserInput | ProjectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ProjectUpdateManyWithWhereWithoutUserInput | ProjectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
  }

  export type EmployeeUpdateManyWithoutEmployerNestedInput = {
    create?: XOR<EmployeeCreateWithoutEmployerInput, EmployeeUncheckedCreateWithoutEmployerInput> | EmployeeCreateWithoutEmployerInput[] | EmployeeUncheckedCreateWithoutEmployerInput[]
    connectOrCreate?: EmployeeCreateOrConnectWithoutEmployerInput | EmployeeCreateOrConnectWithoutEmployerInput[]
    upsert?: EmployeeUpsertWithWhereUniqueWithoutEmployerInput | EmployeeUpsertWithWhereUniqueWithoutEmployerInput[]
    createMany?: EmployeeCreateManyEmployerInputEnvelope
    set?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    disconnect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    delete?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    connect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    update?: EmployeeUpdateWithWhereUniqueWithoutEmployerInput | EmployeeUpdateWithWhereUniqueWithoutEmployerInput[]
    updateMany?: EmployeeUpdateManyWithWhereWithoutEmployerInput | EmployeeUpdateManyWithWhereWithoutEmployerInput[]
    deleteMany?: EmployeeScalarWhereInput | EmployeeScalarWhereInput[]
  }

  export type EmployeeUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<EmployeeCreateWithoutEmployeeInput, EmployeeUncheckedCreateWithoutEmployeeInput> | EmployeeCreateWithoutEmployeeInput[] | EmployeeUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: EmployeeCreateOrConnectWithoutEmployeeInput | EmployeeCreateOrConnectWithoutEmployeeInput[]
    upsert?: EmployeeUpsertWithWhereUniqueWithoutEmployeeInput | EmployeeUpsertWithWhereUniqueWithoutEmployeeInput[]
    createMany?: EmployeeCreateManyEmployeeInputEnvelope
    set?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    disconnect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    delete?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    connect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    update?: EmployeeUpdateWithWhereUniqueWithoutEmployeeInput | EmployeeUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: EmployeeUpdateManyWithWhereWithoutEmployeeInput | EmployeeUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: EmployeeScalarWhereInput | EmployeeScalarWhereInput[]
  }

  export type RowUpdateManyWithoutUserNestedInput = {
    create?: XOR<RowCreateWithoutUserInput, RowUncheckedCreateWithoutUserInput> | RowCreateWithoutUserInput[] | RowUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RowCreateOrConnectWithoutUserInput | RowCreateOrConnectWithoutUserInput[]
    upsert?: RowUpsertWithWhereUniqueWithoutUserInput | RowUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RowCreateManyUserInputEnvelope
    set?: RowWhereUniqueInput | RowWhereUniqueInput[]
    disconnect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    delete?: RowWhereUniqueInput | RowWhereUniqueInput[]
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    update?: RowUpdateWithWhereUniqueWithoutUserInput | RowUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RowUpdateManyWithWhereWithoutUserInput | RowUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RowScalarWhereInput | RowScalarWhereInput[]
  }

  export type RowUpdateManyWithoutApprovedByNestedInput = {
    create?: XOR<RowCreateWithoutApprovedByInput, RowUncheckedCreateWithoutApprovedByInput> | RowCreateWithoutApprovedByInput[] | RowUncheckedCreateWithoutApprovedByInput[]
    connectOrCreate?: RowCreateOrConnectWithoutApprovedByInput | RowCreateOrConnectWithoutApprovedByInput[]
    upsert?: RowUpsertWithWhereUniqueWithoutApprovedByInput | RowUpsertWithWhereUniqueWithoutApprovedByInput[]
    createMany?: RowCreateManyApprovedByInputEnvelope
    set?: RowWhereUniqueInput | RowWhereUniqueInput[]
    disconnect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    delete?: RowWhereUniqueInput | RowWhereUniqueInput[]
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    update?: RowUpdateWithWhereUniqueWithoutApprovedByInput | RowUpdateWithWhereUniqueWithoutApprovedByInput[]
    updateMany?: RowUpdateManyWithWhereWithoutApprovedByInput | RowUpdateManyWithWhereWithoutApprovedByInput[]
    deleteMany?: RowScalarWhereInput | RowScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ProjectUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput> | ProjectCreateWithoutUserInput[] | ProjectUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ProjectCreateOrConnectWithoutUserInput | ProjectCreateOrConnectWithoutUserInput[]
    upsert?: ProjectUpsertWithWhereUniqueWithoutUserInput | ProjectUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ProjectCreateManyUserInputEnvelope
    set?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    disconnect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    delete?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    connect?: ProjectWhereUniqueInput | ProjectWhereUniqueInput[]
    update?: ProjectUpdateWithWhereUniqueWithoutUserInput | ProjectUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ProjectUpdateManyWithWhereWithoutUserInput | ProjectUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
  }

  export type EmployeeUncheckedUpdateManyWithoutEmployerNestedInput = {
    create?: XOR<EmployeeCreateWithoutEmployerInput, EmployeeUncheckedCreateWithoutEmployerInput> | EmployeeCreateWithoutEmployerInput[] | EmployeeUncheckedCreateWithoutEmployerInput[]
    connectOrCreate?: EmployeeCreateOrConnectWithoutEmployerInput | EmployeeCreateOrConnectWithoutEmployerInput[]
    upsert?: EmployeeUpsertWithWhereUniqueWithoutEmployerInput | EmployeeUpsertWithWhereUniqueWithoutEmployerInput[]
    createMany?: EmployeeCreateManyEmployerInputEnvelope
    set?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    disconnect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    delete?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    connect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    update?: EmployeeUpdateWithWhereUniqueWithoutEmployerInput | EmployeeUpdateWithWhereUniqueWithoutEmployerInput[]
    updateMany?: EmployeeUpdateManyWithWhereWithoutEmployerInput | EmployeeUpdateManyWithWhereWithoutEmployerInput[]
    deleteMany?: EmployeeScalarWhereInput | EmployeeScalarWhereInput[]
  }

  export type EmployeeUncheckedUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<EmployeeCreateWithoutEmployeeInput, EmployeeUncheckedCreateWithoutEmployeeInput> | EmployeeCreateWithoutEmployeeInput[] | EmployeeUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: EmployeeCreateOrConnectWithoutEmployeeInput | EmployeeCreateOrConnectWithoutEmployeeInput[]
    upsert?: EmployeeUpsertWithWhereUniqueWithoutEmployeeInput | EmployeeUpsertWithWhereUniqueWithoutEmployeeInput[]
    createMany?: EmployeeCreateManyEmployeeInputEnvelope
    set?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    disconnect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    delete?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    connect?: EmployeeWhereUniqueInput | EmployeeWhereUniqueInput[]
    update?: EmployeeUpdateWithWhereUniqueWithoutEmployeeInput | EmployeeUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: EmployeeUpdateManyWithWhereWithoutEmployeeInput | EmployeeUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: EmployeeScalarWhereInput | EmployeeScalarWhereInput[]
  }

  export type RowUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<RowCreateWithoutUserInput, RowUncheckedCreateWithoutUserInput> | RowCreateWithoutUserInput[] | RowUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RowCreateOrConnectWithoutUserInput | RowCreateOrConnectWithoutUserInput[]
    upsert?: RowUpsertWithWhereUniqueWithoutUserInput | RowUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RowCreateManyUserInputEnvelope
    set?: RowWhereUniqueInput | RowWhereUniqueInput[]
    disconnect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    delete?: RowWhereUniqueInput | RowWhereUniqueInput[]
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    update?: RowUpdateWithWhereUniqueWithoutUserInput | RowUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RowUpdateManyWithWhereWithoutUserInput | RowUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RowScalarWhereInput | RowScalarWhereInput[]
  }

  export type RowUncheckedUpdateManyWithoutApprovedByNestedInput = {
    create?: XOR<RowCreateWithoutApprovedByInput, RowUncheckedCreateWithoutApprovedByInput> | RowCreateWithoutApprovedByInput[] | RowUncheckedCreateWithoutApprovedByInput[]
    connectOrCreate?: RowCreateOrConnectWithoutApprovedByInput | RowCreateOrConnectWithoutApprovedByInput[]
    upsert?: RowUpsertWithWhereUniqueWithoutApprovedByInput | RowUpsertWithWhereUniqueWithoutApprovedByInput[]
    createMany?: RowCreateManyApprovedByInputEnvelope
    set?: RowWhereUniqueInput | RowWhereUniqueInput[]
    disconnect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    delete?: RowWhereUniqueInput | RowWhereUniqueInput[]
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    update?: RowUpdateWithWhereUniqueWithoutApprovedByInput | RowUpdateWithWhereUniqueWithoutApprovedByInput[]
    updateMany?: RowUpdateManyWithWhereWithoutApprovedByInput | RowUpdateManyWithWhereWithoutApprovedByInput[]
    deleteMany?: RowScalarWhereInput | RowScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutProjectsInput = {
    create?: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProjectsInput
    connect?: UserWhereUniqueInput
  }

  export type SectionCreateNestedManyWithoutProjectInput = {
    create?: XOR<SectionCreateWithoutProjectInput, SectionUncheckedCreateWithoutProjectInput> | SectionCreateWithoutProjectInput[] | SectionUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: SectionCreateOrConnectWithoutProjectInput | SectionCreateOrConnectWithoutProjectInput[]
    createMany?: SectionCreateManyProjectInputEnvelope
    connect?: SectionWhereUniqueInput | SectionWhereUniqueInput[]
  }

  export type BeteckningCreateNestedManyWithoutProjectInput = {
    create?: XOR<BeteckningCreateWithoutProjectInput, BeteckningUncheckedCreateWithoutProjectInput> | BeteckningCreateWithoutProjectInput[] | BeteckningUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: BeteckningCreateOrConnectWithoutProjectInput | BeteckningCreateOrConnectWithoutProjectInput[]
    createMany?: BeteckningCreateManyProjectInputEnvelope
    connect?: BeteckningWhereUniqueInput | BeteckningWhereUniqueInput[]
  }

  export type RowCreateNestedManyWithoutProjectInput = {
    create?: XOR<RowCreateWithoutProjectInput, RowUncheckedCreateWithoutProjectInput> | RowCreateWithoutProjectInput[] | RowUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: RowCreateOrConnectWithoutProjectInput | RowCreateOrConnectWithoutProjectInput[]
    createMany?: RowCreateManyProjectInputEnvelope
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
  }

  export type SectionUncheckedCreateNestedManyWithoutProjectInput = {
    create?: XOR<SectionCreateWithoutProjectInput, SectionUncheckedCreateWithoutProjectInput> | SectionCreateWithoutProjectInput[] | SectionUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: SectionCreateOrConnectWithoutProjectInput | SectionCreateOrConnectWithoutProjectInput[]
    createMany?: SectionCreateManyProjectInputEnvelope
    connect?: SectionWhereUniqueInput | SectionWhereUniqueInput[]
  }

  export type BeteckningUncheckedCreateNestedManyWithoutProjectInput = {
    create?: XOR<BeteckningCreateWithoutProjectInput, BeteckningUncheckedCreateWithoutProjectInput> | BeteckningCreateWithoutProjectInput[] | BeteckningUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: BeteckningCreateOrConnectWithoutProjectInput | BeteckningCreateOrConnectWithoutProjectInput[]
    createMany?: BeteckningCreateManyProjectInputEnvelope
    connect?: BeteckningWhereUniqueInput | BeteckningWhereUniqueInput[]
  }

  export type RowUncheckedCreateNestedManyWithoutProjectInput = {
    create?: XOR<RowCreateWithoutProjectInput, RowUncheckedCreateWithoutProjectInput> | RowCreateWithoutProjectInput[] | RowUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: RowCreateOrConnectWithoutProjectInput | RowCreateOrConnectWithoutProjectInput[]
    createMany?: RowCreateManyProjectInputEnvelope
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneWithoutProjectsNestedInput = {
    create?: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    connectOrCreate?: UserCreateOrConnectWithoutProjectsInput
    upsert?: UserUpsertWithoutProjectsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProjectsInput, UserUpdateWithoutProjectsInput>, UserUncheckedUpdateWithoutProjectsInput>
  }

  export type SectionUpdateManyWithoutProjectNestedInput = {
    create?: XOR<SectionCreateWithoutProjectInput, SectionUncheckedCreateWithoutProjectInput> | SectionCreateWithoutProjectInput[] | SectionUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: SectionCreateOrConnectWithoutProjectInput | SectionCreateOrConnectWithoutProjectInput[]
    upsert?: SectionUpsertWithWhereUniqueWithoutProjectInput | SectionUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: SectionCreateManyProjectInputEnvelope
    set?: SectionWhereUniqueInput | SectionWhereUniqueInput[]
    disconnect?: SectionWhereUniqueInput | SectionWhereUniqueInput[]
    delete?: SectionWhereUniqueInput | SectionWhereUniqueInput[]
    connect?: SectionWhereUniqueInput | SectionWhereUniqueInput[]
    update?: SectionUpdateWithWhereUniqueWithoutProjectInput | SectionUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: SectionUpdateManyWithWhereWithoutProjectInput | SectionUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: SectionScalarWhereInput | SectionScalarWhereInput[]
  }

  export type BeteckningUpdateManyWithoutProjectNestedInput = {
    create?: XOR<BeteckningCreateWithoutProjectInput, BeteckningUncheckedCreateWithoutProjectInput> | BeteckningCreateWithoutProjectInput[] | BeteckningUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: BeteckningCreateOrConnectWithoutProjectInput | BeteckningCreateOrConnectWithoutProjectInput[]
    upsert?: BeteckningUpsertWithWhereUniqueWithoutProjectInput | BeteckningUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: BeteckningCreateManyProjectInputEnvelope
    set?: BeteckningWhereUniqueInput | BeteckningWhereUniqueInput[]
    disconnect?: BeteckningWhereUniqueInput | BeteckningWhereUniqueInput[]
    delete?: BeteckningWhereUniqueInput | BeteckningWhereUniqueInput[]
    connect?: BeteckningWhereUniqueInput | BeteckningWhereUniqueInput[]
    update?: BeteckningUpdateWithWhereUniqueWithoutProjectInput | BeteckningUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: BeteckningUpdateManyWithWhereWithoutProjectInput | BeteckningUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: BeteckningScalarWhereInput | BeteckningScalarWhereInput[]
  }

  export type RowUpdateManyWithoutProjectNestedInput = {
    create?: XOR<RowCreateWithoutProjectInput, RowUncheckedCreateWithoutProjectInput> | RowCreateWithoutProjectInput[] | RowUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: RowCreateOrConnectWithoutProjectInput | RowCreateOrConnectWithoutProjectInput[]
    upsert?: RowUpsertWithWhereUniqueWithoutProjectInput | RowUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: RowCreateManyProjectInputEnvelope
    set?: RowWhereUniqueInput | RowWhereUniqueInput[]
    disconnect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    delete?: RowWhereUniqueInput | RowWhereUniqueInput[]
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    update?: RowUpdateWithWhereUniqueWithoutProjectInput | RowUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: RowUpdateManyWithWhereWithoutProjectInput | RowUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: RowScalarWhereInput | RowScalarWhereInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SectionUncheckedUpdateManyWithoutProjectNestedInput = {
    create?: XOR<SectionCreateWithoutProjectInput, SectionUncheckedCreateWithoutProjectInput> | SectionCreateWithoutProjectInput[] | SectionUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: SectionCreateOrConnectWithoutProjectInput | SectionCreateOrConnectWithoutProjectInput[]
    upsert?: SectionUpsertWithWhereUniqueWithoutProjectInput | SectionUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: SectionCreateManyProjectInputEnvelope
    set?: SectionWhereUniqueInput | SectionWhereUniqueInput[]
    disconnect?: SectionWhereUniqueInput | SectionWhereUniqueInput[]
    delete?: SectionWhereUniqueInput | SectionWhereUniqueInput[]
    connect?: SectionWhereUniqueInput | SectionWhereUniqueInput[]
    update?: SectionUpdateWithWhereUniqueWithoutProjectInput | SectionUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: SectionUpdateManyWithWhereWithoutProjectInput | SectionUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: SectionScalarWhereInput | SectionScalarWhereInput[]
  }

  export type BeteckningUncheckedUpdateManyWithoutProjectNestedInput = {
    create?: XOR<BeteckningCreateWithoutProjectInput, BeteckningUncheckedCreateWithoutProjectInput> | BeteckningCreateWithoutProjectInput[] | BeteckningUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: BeteckningCreateOrConnectWithoutProjectInput | BeteckningCreateOrConnectWithoutProjectInput[]
    upsert?: BeteckningUpsertWithWhereUniqueWithoutProjectInput | BeteckningUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: BeteckningCreateManyProjectInputEnvelope
    set?: BeteckningWhereUniqueInput | BeteckningWhereUniqueInput[]
    disconnect?: BeteckningWhereUniqueInput | BeteckningWhereUniqueInput[]
    delete?: BeteckningWhereUniqueInput | BeteckningWhereUniqueInput[]
    connect?: BeteckningWhereUniqueInput | BeteckningWhereUniqueInput[]
    update?: BeteckningUpdateWithWhereUniqueWithoutProjectInput | BeteckningUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: BeteckningUpdateManyWithWhereWithoutProjectInput | BeteckningUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: BeteckningScalarWhereInput | BeteckningScalarWhereInput[]
  }

  export type RowUncheckedUpdateManyWithoutProjectNestedInput = {
    create?: XOR<RowCreateWithoutProjectInput, RowUncheckedCreateWithoutProjectInput> | RowCreateWithoutProjectInput[] | RowUncheckedCreateWithoutProjectInput[]
    connectOrCreate?: RowCreateOrConnectWithoutProjectInput | RowCreateOrConnectWithoutProjectInput[]
    upsert?: RowUpsertWithWhereUniqueWithoutProjectInput | RowUpsertWithWhereUniqueWithoutProjectInput[]
    createMany?: RowCreateManyProjectInputEnvelope
    set?: RowWhereUniqueInput | RowWhereUniqueInput[]
    disconnect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    delete?: RowWhereUniqueInput | RowWhereUniqueInput[]
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    update?: RowUpdateWithWhereUniqueWithoutProjectInput | RowUpdateWithWhereUniqueWithoutProjectInput[]
    updateMany?: RowUpdateManyWithWhereWithoutProjectInput | RowUpdateManyWithWhereWithoutProjectInput[]
    deleteMany?: RowScalarWhereInput | RowScalarWhereInput[]
  }

  export type ProjectCreateNestedOneWithoutSectionsInput = {
    create?: XOR<ProjectCreateWithoutSectionsInput, ProjectUncheckedCreateWithoutSectionsInput>
    connectOrCreate?: ProjectCreateOrConnectWithoutSectionsInput
    connect?: ProjectWhereUniqueInput
  }

  export type RowCreateNestedManyWithoutSectionInput = {
    create?: XOR<RowCreateWithoutSectionInput, RowUncheckedCreateWithoutSectionInput> | RowCreateWithoutSectionInput[] | RowUncheckedCreateWithoutSectionInput[]
    connectOrCreate?: RowCreateOrConnectWithoutSectionInput | RowCreateOrConnectWithoutSectionInput[]
    createMany?: RowCreateManySectionInputEnvelope
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
  }

  export type RowUncheckedCreateNestedManyWithoutSectionInput = {
    create?: XOR<RowCreateWithoutSectionInput, RowUncheckedCreateWithoutSectionInput> | RowCreateWithoutSectionInput[] | RowUncheckedCreateWithoutSectionInput[]
    connectOrCreate?: RowCreateOrConnectWithoutSectionInput | RowCreateOrConnectWithoutSectionInput[]
    createMany?: RowCreateManySectionInputEnvelope
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
  }

  export type ProjectUpdateOneRequiredWithoutSectionsNestedInput = {
    create?: XOR<ProjectCreateWithoutSectionsInput, ProjectUncheckedCreateWithoutSectionsInput>
    connectOrCreate?: ProjectCreateOrConnectWithoutSectionsInput
    upsert?: ProjectUpsertWithoutSectionsInput
    connect?: ProjectWhereUniqueInput
    update?: XOR<XOR<ProjectUpdateToOneWithWhereWithoutSectionsInput, ProjectUpdateWithoutSectionsInput>, ProjectUncheckedUpdateWithoutSectionsInput>
  }

  export type RowUpdateManyWithoutSectionNestedInput = {
    create?: XOR<RowCreateWithoutSectionInput, RowUncheckedCreateWithoutSectionInput> | RowCreateWithoutSectionInput[] | RowUncheckedCreateWithoutSectionInput[]
    connectOrCreate?: RowCreateOrConnectWithoutSectionInput | RowCreateOrConnectWithoutSectionInput[]
    upsert?: RowUpsertWithWhereUniqueWithoutSectionInput | RowUpsertWithWhereUniqueWithoutSectionInput[]
    createMany?: RowCreateManySectionInputEnvelope
    set?: RowWhereUniqueInput | RowWhereUniqueInput[]
    disconnect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    delete?: RowWhereUniqueInput | RowWhereUniqueInput[]
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    update?: RowUpdateWithWhereUniqueWithoutSectionInput | RowUpdateWithWhereUniqueWithoutSectionInput[]
    updateMany?: RowUpdateManyWithWhereWithoutSectionInput | RowUpdateManyWithWhereWithoutSectionInput[]
    deleteMany?: RowScalarWhereInput | RowScalarWhereInput[]
  }

  export type RowUncheckedUpdateManyWithoutSectionNestedInput = {
    create?: XOR<RowCreateWithoutSectionInput, RowUncheckedCreateWithoutSectionInput> | RowCreateWithoutSectionInput[] | RowUncheckedCreateWithoutSectionInput[]
    connectOrCreate?: RowCreateOrConnectWithoutSectionInput | RowCreateOrConnectWithoutSectionInput[]
    upsert?: RowUpsertWithWhereUniqueWithoutSectionInput | RowUpsertWithWhereUniqueWithoutSectionInput[]
    createMany?: RowCreateManySectionInputEnvelope
    set?: RowWhereUniqueInput | RowWhereUniqueInput[]
    disconnect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    delete?: RowWhereUniqueInput | RowWhereUniqueInput[]
    connect?: RowWhereUniqueInput | RowWhereUniqueInput[]
    update?: RowUpdateWithWhereUniqueWithoutSectionInput | RowUpdateWithWhereUniqueWithoutSectionInput[]
    updateMany?: RowUpdateManyWithWhereWithoutSectionInput | RowUpdateManyWithWhereWithoutSectionInput[]
    deleteMany?: RowScalarWhereInput | RowScalarWhereInput[]
  }

  export type ProjectCreateNestedOneWithoutBeteckningarInput = {
    create?: XOR<ProjectCreateWithoutBeteckningarInput, ProjectUncheckedCreateWithoutBeteckningarInput>
    connectOrCreate?: ProjectCreateOrConnectWithoutBeteckningarInput
    connect?: ProjectWhereUniqueInput
  }

  export type ProjectUpdateOneRequiredWithoutBeteckningarNestedInput = {
    create?: XOR<ProjectCreateWithoutBeteckningarInput, ProjectUncheckedCreateWithoutBeteckningarInput>
    connectOrCreate?: ProjectCreateOrConnectWithoutBeteckningarInput
    upsert?: ProjectUpsertWithoutBeteckningarInput
    connect?: ProjectWhereUniqueInput
    update?: XOR<XOR<ProjectUpdateToOneWithWhereWithoutBeteckningarInput, ProjectUpdateWithoutBeteckningarInput>, ProjectUncheckedUpdateWithoutBeteckningarInput>
  }

  export type UserCreateNestedOneWithoutEmployeesInput = {
    create?: XOR<UserCreateWithoutEmployeesInput, UserUncheckedCreateWithoutEmployeesInput>
    connectOrCreate?: UserCreateOrConnectWithoutEmployeesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutEmployerOfInput = {
    create?: XOR<UserCreateWithoutEmployerOfInput, UserUncheckedCreateWithoutEmployerOfInput>
    connectOrCreate?: UserCreateOrConnectWithoutEmployerOfInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutEmployeesNestedInput = {
    create?: XOR<UserCreateWithoutEmployeesInput, UserUncheckedCreateWithoutEmployeesInput>
    connectOrCreate?: UserCreateOrConnectWithoutEmployeesInput
    upsert?: UserUpsertWithoutEmployeesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutEmployeesInput, UserUpdateWithoutEmployeesInput>, UserUncheckedUpdateWithoutEmployeesInput>
  }

  export type UserUpdateOneRequiredWithoutEmployerOfNestedInput = {
    create?: XOR<UserCreateWithoutEmployerOfInput, UserUncheckedCreateWithoutEmployerOfInput>
    connectOrCreate?: UserCreateOrConnectWithoutEmployerOfInput
    upsert?: UserUpsertWithoutEmployerOfInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutEmployerOfInput, UserUpdateWithoutEmployerOfInput>, UserUncheckedUpdateWithoutEmployerOfInput>
  }

  export type RowCreateanordningInput = {
    set: string[]
  }

  export type ProjectCreateNestedOneWithoutTsmRowsInput = {
    create?: XOR<ProjectCreateWithoutTsmRowsInput, ProjectUncheckedCreateWithoutTsmRowsInput>
    connectOrCreate?: ProjectCreateOrConnectWithoutTsmRowsInput
    connect?: ProjectWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutCreatedRowsInput = {
    create?: XOR<UserCreateWithoutCreatedRowsInput, UserUncheckedCreateWithoutCreatedRowsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedRowsInput
    connect?: UserWhereUniqueInput
  }

  export type SectionCreateNestedOneWithoutRowsInput = {
    create?: XOR<SectionCreateWithoutRowsInput, SectionUncheckedCreateWithoutRowsInput>
    connectOrCreate?: SectionCreateOrConnectWithoutRowsInput
    connect?: SectionWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutApprovedRowsInput = {
    create?: XOR<UserCreateWithoutApprovedRowsInput, UserUncheckedCreateWithoutApprovedRowsInput>
    connectOrCreate?: UserCreateOrConnectWithoutApprovedRowsInput
    connect?: UserWhereUniqueInput
  }

  export type RowUpdateanordningInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ProjectUpdateOneRequiredWithoutTsmRowsNestedInput = {
    create?: XOR<ProjectCreateWithoutTsmRowsInput, ProjectUncheckedCreateWithoutTsmRowsInput>
    connectOrCreate?: ProjectCreateOrConnectWithoutTsmRowsInput
    upsert?: ProjectUpsertWithoutTsmRowsInput
    connect?: ProjectWhereUniqueInput
    update?: XOR<XOR<ProjectUpdateToOneWithWhereWithoutTsmRowsInput, ProjectUpdateWithoutTsmRowsInput>, ProjectUncheckedUpdateWithoutTsmRowsInput>
  }

  export type UserUpdateOneWithoutCreatedRowsNestedInput = {
    create?: XOR<UserCreateWithoutCreatedRowsInput, UserUncheckedCreateWithoutCreatedRowsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCreatedRowsInput
    upsert?: UserUpsertWithoutCreatedRowsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCreatedRowsInput, UserUpdateWithoutCreatedRowsInput>, UserUncheckedUpdateWithoutCreatedRowsInput>
  }

  export type SectionUpdateOneWithoutRowsNestedInput = {
    create?: XOR<SectionCreateWithoutRowsInput, SectionUncheckedCreateWithoutRowsInput>
    connectOrCreate?: SectionCreateOrConnectWithoutRowsInput
    upsert?: SectionUpsertWithoutRowsInput
    disconnect?: SectionWhereInput | boolean
    delete?: SectionWhereInput | boolean
    connect?: SectionWhereUniqueInput
    update?: XOR<XOR<SectionUpdateToOneWithWhereWithoutRowsInput, SectionUpdateWithoutRowsInput>, SectionUncheckedUpdateWithoutRowsInput>
  }

  export type UserUpdateOneWithoutApprovedRowsNestedInput = {
    create?: XOR<UserCreateWithoutApprovedRowsInput, UserUncheckedCreateWithoutApprovedRowsInput>
    connectOrCreate?: UserCreateOrConnectWithoutApprovedRowsInput
    upsert?: UserUpsertWithoutApprovedRowsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutApprovedRowsInput, UserUpdateWithoutApprovedRowsInput>, UserUncheckedUpdateWithoutApprovedRowsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ProjectCreateWithoutUserInput = {
    name: string
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    sections?: SectionCreateNestedManyWithoutProjectInput
    beteckningar?: BeteckningCreateNestedManyWithoutProjectInput
    tsmRows?: RowCreateNestedManyWithoutProjectInput
  }

  export type ProjectUncheckedCreateWithoutUserInput = {
    id?: number
    name: string
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    sections?: SectionUncheckedCreateNestedManyWithoutProjectInput
    beteckningar?: BeteckningUncheckedCreateNestedManyWithoutProjectInput
    tsmRows?: RowUncheckedCreateNestedManyWithoutProjectInput
  }

  export type ProjectCreateOrConnectWithoutUserInput = {
    where: ProjectWhereUniqueInput
    create: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput>
  }

  export type ProjectCreateManyUserInputEnvelope = {
    data: ProjectCreateManyUserInput | ProjectCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type EmployeeCreateWithoutEmployerInput = {
    employee: UserCreateNestedOneWithoutEmployerOfInput
  }

  export type EmployeeUncheckedCreateWithoutEmployerInput = {
    id?: number
    employeeId: number
  }

  export type EmployeeCreateOrConnectWithoutEmployerInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutEmployerInput, EmployeeUncheckedCreateWithoutEmployerInput>
  }

  export type EmployeeCreateManyEmployerInputEnvelope = {
    data: EmployeeCreateManyEmployerInput | EmployeeCreateManyEmployerInput[]
    skipDuplicates?: boolean
  }

  export type EmployeeCreateWithoutEmployeeInput = {
    employer: UserCreateNestedOneWithoutEmployeesInput
  }

  export type EmployeeUncheckedCreateWithoutEmployeeInput = {
    id?: number
    employerId: number
  }

  export type EmployeeCreateOrConnectWithoutEmployeeInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutEmployeeInput, EmployeeUncheckedCreateWithoutEmployeeInput>
  }

  export type EmployeeCreateManyEmployeeInputEnvelope = {
    data: EmployeeCreateManyEmployeeInput | EmployeeCreateManyEmployeeInput[]
    skipDuplicates?: boolean
  }

  export type RowCreateWithoutUserInput = {
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
    project: ProjectCreateNestedOneWithoutTsmRowsInput
    section?: SectionCreateNestedOneWithoutRowsInput
    approvedBy?: UserCreateNestedOneWithoutApprovedRowsInput
  }

  export type RowUncheckedCreateWithoutUserInput = {
    id?: number
    projectId: number
    sectionId?: number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    approvedById?: number | null
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
  }

  export type RowCreateOrConnectWithoutUserInput = {
    where: RowWhereUniqueInput
    create: XOR<RowCreateWithoutUserInput, RowUncheckedCreateWithoutUserInput>
  }

  export type RowCreateManyUserInputEnvelope = {
    data: RowCreateManyUserInput | RowCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type RowCreateWithoutApprovedByInput = {
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
    project: ProjectCreateNestedOneWithoutTsmRowsInput
    user?: UserCreateNestedOneWithoutCreatedRowsInput
    section?: SectionCreateNestedOneWithoutRowsInput
  }

  export type RowUncheckedCreateWithoutApprovedByInput = {
    id?: number
    projectId: number
    userId?: number | null
    sectionId?: number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
  }

  export type RowCreateOrConnectWithoutApprovedByInput = {
    where: RowWhereUniqueInput
    create: XOR<RowCreateWithoutApprovedByInput, RowUncheckedCreateWithoutApprovedByInput>
  }

  export type RowCreateManyApprovedByInputEnvelope = {
    data: RowCreateManyApprovedByInput | RowCreateManyApprovedByInput[]
    skipDuplicates?: boolean
  }

  export type ProjectUpsertWithWhereUniqueWithoutUserInput = {
    where: ProjectWhereUniqueInput
    update: XOR<ProjectUpdateWithoutUserInput, ProjectUncheckedUpdateWithoutUserInput>
    create: XOR<ProjectCreateWithoutUserInput, ProjectUncheckedCreateWithoutUserInput>
  }

  export type ProjectUpdateWithWhereUniqueWithoutUserInput = {
    where: ProjectWhereUniqueInput
    data: XOR<ProjectUpdateWithoutUserInput, ProjectUncheckedUpdateWithoutUserInput>
  }

  export type ProjectUpdateManyWithWhereWithoutUserInput = {
    where: ProjectScalarWhereInput
    data: XOR<ProjectUpdateManyMutationInput, ProjectUncheckedUpdateManyWithoutUserInput>
  }

  export type ProjectScalarWhereInput = {
    AND?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
    OR?: ProjectScalarWhereInput[]
    NOT?: ProjectScalarWhereInput | ProjectScalarWhereInput[]
    id?: IntFilter<"Project"> | number
    name?: StringFilter<"Project"> | string
    userId?: IntNullableFilter<"Project"> | number | null
    createdAt?: DateTimeFilter<"Project"> | Date | string
    startDate?: StringFilter<"Project"> | string
    startTime?: StringFilter<"Project"> | string
    endDate?: StringFilter<"Project"> | string
    endTime?: StringFilter<"Project"> | string
    plats?: StringFilter<"Project"> | string
    namn?: StringFilter<"Project"> | string
    telefonnummer?: StringFilter<"Project"> | string
    rows?: JsonNullableFilter<"Project">
    anteckningar?: JsonNullableFilter<"Project">
  }

  export type EmployeeUpsertWithWhereUniqueWithoutEmployerInput = {
    where: EmployeeWhereUniqueInput
    update: XOR<EmployeeUpdateWithoutEmployerInput, EmployeeUncheckedUpdateWithoutEmployerInput>
    create: XOR<EmployeeCreateWithoutEmployerInput, EmployeeUncheckedCreateWithoutEmployerInput>
  }

  export type EmployeeUpdateWithWhereUniqueWithoutEmployerInput = {
    where: EmployeeWhereUniqueInput
    data: XOR<EmployeeUpdateWithoutEmployerInput, EmployeeUncheckedUpdateWithoutEmployerInput>
  }

  export type EmployeeUpdateManyWithWhereWithoutEmployerInput = {
    where: EmployeeScalarWhereInput
    data: XOR<EmployeeUpdateManyMutationInput, EmployeeUncheckedUpdateManyWithoutEmployerInput>
  }

  export type EmployeeScalarWhereInput = {
    AND?: EmployeeScalarWhereInput | EmployeeScalarWhereInput[]
    OR?: EmployeeScalarWhereInput[]
    NOT?: EmployeeScalarWhereInput | EmployeeScalarWhereInput[]
    id?: IntFilter<"Employee"> | number
    employerId?: IntFilter<"Employee"> | number
    employeeId?: IntFilter<"Employee"> | number
  }

  export type EmployeeUpsertWithWhereUniqueWithoutEmployeeInput = {
    where: EmployeeWhereUniqueInput
    update: XOR<EmployeeUpdateWithoutEmployeeInput, EmployeeUncheckedUpdateWithoutEmployeeInput>
    create: XOR<EmployeeCreateWithoutEmployeeInput, EmployeeUncheckedCreateWithoutEmployeeInput>
  }

  export type EmployeeUpdateWithWhereUniqueWithoutEmployeeInput = {
    where: EmployeeWhereUniqueInput
    data: XOR<EmployeeUpdateWithoutEmployeeInput, EmployeeUncheckedUpdateWithoutEmployeeInput>
  }

  export type EmployeeUpdateManyWithWhereWithoutEmployeeInput = {
    where: EmployeeScalarWhereInput
    data: XOR<EmployeeUpdateManyMutationInput, EmployeeUncheckedUpdateManyWithoutEmployeeInput>
  }

  export type RowUpsertWithWhereUniqueWithoutUserInput = {
    where: RowWhereUniqueInput
    update: XOR<RowUpdateWithoutUserInput, RowUncheckedUpdateWithoutUserInput>
    create: XOR<RowCreateWithoutUserInput, RowUncheckedCreateWithoutUserInput>
  }

  export type RowUpdateWithWhereUniqueWithoutUserInput = {
    where: RowWhereUniqueInput
    data: XOR<RowUpdateWithoutUserInput, RowUncheckedUpdateWithoutUserInput>
  }

  export type RowUpdateManyWithWhereWithoutUserInput = {
    where: RowScalarWhereInput
    data: XOR<RowUpdateManyMutationInput, RowUncheckedUpdateManyWithoutUserInput>
  }

  export type RowScalarWhereInput = {
    AND?: RowScalarWhereInput | RowScalarWhereInput[]
    OR?: RowScalarWhereInput[]
    NOT?: RowScalarWhereInput | RowScalarWhereInput[]
    id?: IntFilter<"Row"> | number
    projectId?: IntFilter<"Row"> | number
    userId?: IntNullableFilter<"Row"> | number | null
    sectionId?: IntNullableFilter<"Row"> | number | null
    selections?: JsonNullableFilter<"Row">
    anordning?: StringNullableListFilter<"Row">
    datum?: StringNullableFilter<"Row"> | string | null
    isPending?: BoolFilter<"Row"> | boolean
    approvedById?: IntNullableFilter<"Row"> | number | null
    begard?: StringNullableFilter<"Row"> | string | null
    begardDatum?: StringNullableFilter<"Row"> | string | null
    anteckning?: StringNullableFilter<"Row"> | string | null
    namn?: StringNullableFilter<"Row"> | string | null
    telefon?: StringNullableFilter<"Row"> | string | null
    createdAt?: DateTimeFilter<"Row"> | Date | string
  }

  export type RowUpsertWithWhereUniqueWithoutApprovedByInput = {
    where: RowWhereUniqueInput
    update: XOR<RowUpdateWithoutApprovedByInput, RowUncheckedUpdateWithoutApprovedByInput>
    create: XOR<RowCreateWithoutApprovedByInput, RowUncheckedCreateWithoutApprovedByInput>
  }

  export type RowUpdateWithWhereUniqueWithoutApprovedByInput = {
    where: RowWhereUniqueInput
    data: XOR<RowUpdateWithoutApprovedByInput, RowUncheckedUpdateWithoutApprovedByInput>
  }

  export type RowUpdateManyWithWhereWithoutApprovedByInput = {
    where: RowScalarWhereInput
    data: XOR<RowUpdateManyMutationInput, RowUncheckedUpdateManyWithoutApprovedByInput>
  }

  export type UserCreateWithoutProjectsInput = {
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    employees?: EmployeeCreateNestedManyWithoutEmployerInput
    employerOf?: EmployeeCreateNestedManyWithoutEmployeeInput
    createdRows?: RowCreateNestedManyWithoutUserInput
    approvedRows?: RowCreateNestedManyWithoutApprovedByInput
  }

  export type UserUncheckedCreateWithoutProjectsInput = {
    id?: number
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    employees?: EmployeeUncheckedCreateNestedManyWithoutEmployerInput
    employerOf?: EmployeeUncheckedCreateNestedManyWithoutEmployeeInput
    createdRows?: RowUncheckedCreateNestedManyWithoutUserInput
    approvedRows?: RowUncheckedCreateNestedManyWithoutApprovedByInput
  }

  export type UserCreateOrConnectWithoutProjectsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
  }

  export type SectionCreateWithoutProjectInput = {
    name: string
    type: string
    rows?: RowCreateNestedManyWithoutSectionInput
  }

  export type SectionUncheckedCreateWithoutProjectInput = {
    id?: number
    name: string
    type: string
    rows?: RowUncheckedCreateNestedManyWithoutSectionInput
  }

  export type SectionCreateOrConnectWithoutProjectInput = {
    where: SectionWhereUniqueInput
    create: XOR<SectionCreateWithoutProjectInput, SectionUncheckedCreateWithoutProjectInput>
  }

  export type SectionCreateManyProjectInputEnvelope = {
    data: SectionCreateManyProjectInput | SectionCreateManyProjectInput[]
    skipDuplicates?: boolean
  }

  export type BeteckningCreateWithoutProjectInput = {
    label: string
  }

  export type BeteckningUncheckedCreateWithoutProjectInput = {
    id?: number
    label: string
  }

  export type BeteckningCreateOrConnectWithoutProjectInput = {
    where: BeteckningWhereUniqueInput
    create: XOR<BeteckningCreateWithoutProjectInput, BeteckningUncheckedCreateWithoutProjectInput>
  }

  export type BeteckningCreateManyProjectInputEnvelope = {
    data: BeteckningCreateManyProjectInput | BeteckningCreateManyProjectInput[]
    skipDuplicates?: boolean
  }

  export type RowCreateWithoutProjectInput = {
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
    user?: UserCreateNestedOneWithoutCreatedRowsInput
    section?: SectionCreateNestedOneWithoutRowsInput
    approvedBy?: UserCreateNestedOneWithoutApprovedRowsInput
  }

  export type RowUncheckedCreateWithoutProjectInput = {
    id?: number
    userId?: number | null
    sectionId?: number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    approvedById?: number | null
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
  }

  export type RowCreateOrConnectWithoutProjectInput = {
    where: RowWhereUniqueInput
    create: XOR<RowCreateWithoutProjectInput, RowUncheckedCreateWithoutProjectInput>
  }

  export type RowCreateManyProjectInputEnvelope = {
    data: RowCreateManyProjectInput | RowCreateManyProjectInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutProjectsInput = {
    update: XOR<UserUpdateWithoutProjectsInput, UserUncheckedUpdateWithoutProjectsInput>
    create: XOR<UserCreateWithoutProjectsInput, UserUncheckedCreateWithoutProjectsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProjectsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProjectsInput, UserUncheckedUpdateWithoutProjectsInput>
  }

  export type UserUpdateWithoutProjectsInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    employees?: EmployeeUpdateManyWithoutEmployerNestedInput
    employerOf?: EmployeeUpdateManyWithoutEmployeeNestedInput
    createdRows?: RowUpdateManyWithoutUserNestedInput
    approvedRows?: RowUpdateManyWithoutApprovedByNestedInput
  }

  export type UserUncheckedUpdateWithoutProjectsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    employees?: EmployeeUncheckedUpdateManyWithoutEmployerNestedInput
    employerOf?: EmployeeUncheckedUpdateManyWithoutEmployeeNestedInput
    createdRows?: RowUncheckedUpdateManyWithoutUserNestedInput
    approvedRows?: RowUncheckedUpdateManyWithoutApprovedByNestedInput
  }

  export type SectionUpsertWithWhereUniqueWithoutProjectInput = {
    where: SectionWhereUniqueInput
    update: XOR<SectionUpdateWithoutProjectInput, SectionUncheckedUpdateWithoutProjectInput>
    create: XOR<SectionCreateWithoutProjectInput, SectionUncheckedCreateWithoutProjectInput>
  }

  export type SectionUpdateWithWhereUniqueWithoutProjectInput = {
    where: SectionWhereUniqueInput
    data: XOR<SectionUpdateWithoutProjectInput, SectionUncheckedUpdateWithoutProjectInput>
  }

  export type SectionUpdateManyWithWhereWithoutProjectInput = {
    where: SectionScalarWhereInput
    data: XOR<SectionUpdateManyMutationInput, SectionUncheckedUpdateManyWithoutProjectInput>
  }

  export type SectionScalarWhereInput = {
    AND?: SectionScalarWhereInput | SectionScalarWhereInput[]
    OR?: SectionScalarWhereInput[]
    NOT?: SectionScalarWhereInput | SectionScalarWhereInput[]
    id?: IntFilter<"Section"> | number
    name?: StringFilter<"Section"> | string
    type?: StringFilter<"Section"> | string
    projectId?: IntFilter<"Section"> | number
  }

  export type BeteckningUpsertWithWhereUniqueWithoutProjectInput = {
    where: BeteckningWhereUniqueInput
    update: XOR<BeteckningUpdateWithoutProjectInput, BeteckningUncheckedUpdateWithoutProjectInput>
    create: XOR<BeteckningCreateWithoutProjectInput, BeteckningUncheckedCreateWithoutProjectInput>
  }

  export type BeteckningUpdateWithWhereUniqueWithoutProjectInput = {
    where: BeteckningWhereUniqueInput
    data: XOR<BeteckningUpdateWithoutProjectInput, BeteckningUncheckedUpdateWithoutProjectInput>
  }

  export type BeteckningUpdateManyWithWhereWithoutProjectInput = {
    where: BeteckningScalarWhereInput
    data: XOR<BeteckningUpdateManyMutationInput, BeteckningUncheckedUpdateManyWithoutProjectInput>
  }

  export type BeteckningScalarWhereInput = {
    AND?: BeteckningScalarWhereInput | BeteckningScalarWhereInput[]
    OR?: BeteckningScalarWhereInput[]
    NOT?: BeteckningScalarWhereInput | BeteckningScalarWhereInput[]
    id?: IntFilter<"Beteckning"> | number
    label?: StringFilter<"Beteckning"> | string
    projectId?: IntFilter<"Beteckning"> | number
  }

  export type RowUpsertWithWhereUniqueWithoutProjectInput = {
    where: RowWhereUniqueInput
    update: XOR<RowUpdateWithoutProjectInput, RowUncheckedUpdateWithoutProjectInput>
    create: XOR<RowCreateWithoutProjectInput, RowUncheckedCreateWithoutProjectInput>
  }

  export type RowUpdateWithWhereUniqueWithoutProjectInput = {
    where: RowWhereUniqueInput
    data: XOR<RowUpdateWithoutProjectInput, RowUncheckedUpdateWithoutProjectInput>
  }

  export type RowUpdateManyWithWhereWithoutProjectInput = {
    where: RowScalarWhereInput
    data: XOR<RowUpdateManyMutationInput, RowUncheckedUpdateManyWithoutProjectInput>
  }

  export type ProjectCreateWithoutSectionsInput = {
    name: string
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    user?: UserCreateNestedOneWithoutProjectsInput
    beteckningar?: BeteckningCreateNestedManyWithoutProjectInput
    tsmRows?: RowCreateNestedManyWithoutProjectInput
  }

  export type ProjectUncheckedCreateWithoutSectionsInput = {
    id?: number
    name: string
    userId?: number | null
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    beteckningar?: BeteckningUncheckedCreateNestedManyWithoutProjectInput
    tsmRows?: RowUncheckedCreateNestedManyWithoutProjectInput
  }

  export type ProjectCreateOrConnectWithoutSectionsInput = {
    where: ProjectWhereUniqueInput
    create: XOR<ProjectCreateWithoutSectionsInput, ProjectUncheckedCreateWithoutSectionsInput>
  }

  export type RowCreateWithoutSectionInput = {
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
    project: ProjectCreateNestedOneWithoutTsmRowsInput
    user?: UserCreateNestedOneWithoutCreatedRowsInput
    approvedBy?: UserCreateNestedOneWithoutApprovedRowsInput
  }

  export type RowUncheckedCreateWithoutSectionInput = {
    id?: number
    projectId: number
    userId?: number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    approvedById?: number | null
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
  }

  export type RowCreateOrConnectWithoutSectionInput = {
    where: RowWhereUniqueInput
    create: XOR<RowCreateWithoutSectionInput, RowUncheckedCreateWithoutSectionInput>
  }

  export type RowCreateManySectionInputEnvelope = {
    data: RowCreateManySectionInput | RowCreateManySectionInput[]
    skipDuplicates?: boolean
  }

  export type ProjectUpsertWithoutSectionsInput = {
    update: XOR<ProjectUpdateWithoutSectionsInput, ProjectUncheckedUpdateWithoutSectionsInput>
    create: XOR<ProjectCreateWithoutSectionsInput, ProjectUncheckedCreateWithoutSectionsInput>
    where?: ProjectWhereInput
  }

  export type ProjectUpdateToOneWithWhereWithoutSectionsInput = {
    where?: ProjectWhereInput
    data: XOR<ProjectUpdateWithoutSectionsInput, ProjectUncheckedUpdateWithoutSectionsInput>
  }

  export type ProjectUpdateWithoutSectionsInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    user?: UserUpdateOneWithoutProjectsNestedInput
    beteckningar?: BeteckningUpdateManyWithoutProjectNestedInput
    tsmRows?: RowUpdateManyWithoutProjectNestedInput
  }

  export type ProjectUncheckedUpdateWithoutSectionsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    beteckningar?: BeteckningUncheckedUpdateManyWithoutProjectNestedInput
    tsmRows?: RowUncheckedUpdateManyWithoutProjectNestedInput
  }

  export type RowUpsertWithWhereUniqueWithoutSectionInput = {
    where: RowWhereUniqueInput
    update: XOR<RowUpdateWithoutSectionInput, RowUncheckedUpdateWithoutSectionInput>
    create: XOR<RowCreateWithoutSectionInput, RowUncheckedCreateWithoutSectionInput>
  }

  export type RowUpdateWithWhereUniqueWithoutSectionInput = {
    where: RowWhereUniqueInput
    data: XOR<RowUpdateWithoutSectionInput, RowUncheckedUpdateWithoutSectionInput>
  }

  export type RowUpdateManyWithWhereWithoutSectionInput = {
    where: RowScalarWhereInput
    data: XOR<RowUpdateManyMutationInput, RowUncheckedUpdateManyWithoutSectionInput>
  }

  export type ProjectCreateWithoutBeteckningarInput = {
    name: string
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    user?: UserCreateNestedOneWithoutProjectsInput
    sections?: SectionCreateNestedManyWithoutProjectInput
    tsmRows?: RowCreateNestedManyWithoutProjectInput
  }

  export type ProjectUncheckedCreateWithoutBeteckningarInput = {
    id?: number
    name: string
    userId?: number | null
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    sections?: SectionUncheckedCreateNestedManyWithoutProjectInput
    tsmRows?: RowUncheckedCreateNestedManyWithoutProjectInput
  }

  export type ProjectCreateOrConnectWithoutBeteckningarInput = {
    where: ProjectWhereUniqueInput
    create: XOR<ProjectCreateWithoutBeteckningarInput, ProjectUncheckedCreateWithoutBeteckningarInput>
  }

  export type ProjectUpsertWithoutBeteckningarInput = {
    update: XOR<ProjectUpdateWithoutBeteckningarInput, ProjectUncheckedUpdateWithoutBeteckningarInput>
    create: XOR<ProjectCreateWithoutBeteckningarInput, ProjectUncheckedCreateWithoutBeteckningarInput>
    where?: ProjectWhereInput
  }

  export type ProjectUpdateToOneWithWhereWithoutBeteckningarInput = {
    where?: ProjectWhereInput
    data: XOR<ProjectUpdateWithoutBeteckningarInput, ProjectUncheckedUpdateWithoutBeteckningarInput>
  }

  export type ProjectUpdateWithoutBeteckningarInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    user?: UserUpdateOneWithoutProjectsNestedInput
    sections?: SectionUpdateManyWithoutProjectNestedInput
    tsmRows?: RowUpdateManyWithoutProjectNestedInput
  }

  export type ProjectUncheckedUpdateWithoutBeteckningarInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    sections?: SectionUncheckedUpdateManyWithoutProjectNestedInput
    tsmRows?: RowUncheckedUpdateManyWithoutProjectNestedInput
  }

  export type UserCreateWithoutEmployeesInput = {
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    projects?: ProjectCreateNestedManyWithoutUserInput
    employerOf?: EmployeeCreateNestedManyWithoutEmployeeInput
    createdRows?: RowCreateNestedManyWithoutUserInput
    approvedRows?: RowCreateNestedManyWithoutApprovedByInput
  }

  export type UserUncheckedCreateWithoutEmployeesInput = {
    id?: number
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
    employerOf?: EmployeeUncheckedCreateNestedManyWithoutEmployeeInput
    createdRows?: RowUncheckedCreateNestedManyWithoutUserInput
    approvedRows?: RowUncheckedCreateNestedManyWithoutApprovedByInput
  }

  export type UserCreateOrConnectWithoutEmployeesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutEmployeesInput, UserUncheckedCreateWithoutEmployeesInput>
  }

  export type UserCreateWithoutEmployerOfInput = {
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    projects?: ProjectCreateNestedManyWithoutUserInput
    employees?: EmployeeCreateNestedManyWithoutEmployerInput
    createdRows?: RowCreateNestedManyWithoutUserInput
    approvedRows?: RowCreateNestedManyWithoutApprovedByInput
  }

  export type UserUncheckedCreateWithoutEmployerOfInput = {
    id?: number
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
    employees?: EmployeeUncheckedCreateNestedManyWithoutEmployerInput
    createdRows?: RowUncheckedCreateNestedManyWithoutUserInput
    approvedRows?: RowUncheckedCreateNestedManyWithoutApprovedByInput
  }

  export type UserCreateOrConnectWithoutEmployerOfInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutEmployerOfInput, UserUncheckedCreateWithoutEmployerOfInput>
  }

  export type UserUpsertWithoutEmployeesInput = {
    update: XOR<UserUpdateWithoutEmployeesInput, UserUncheckedUpdateWithoutEmployeesInput>
    create: XOR<UserCreateWithoutEmployeesInput, UserUncheckedCreateWithoutEmployeesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutEmployeesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutEmployeesInput, UserUncheckedUpdateWithoutEmployeesInput>
  }

  export type UserUpdateWithoutEmployeesInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUpdateManyWithoutUserNestedInput
    employerOf?: EmployeeUpdateManyWithoutEmployeeNestedInput
    createdRows?: RowUpdateManyWithoutUserNestedInput
    approvedRows?: RowUpdateManyWithoutApprovedByNestedInput
  }

  export type UserUncheckedUpdateWithoutEmployeesInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
    employerOf?: EmployeeUncheckedUpdateManyWithoutEmployeeNestedInput
    createdRows?: RowUncheckedUpdateManyWithoutUserNestedInput
    approvedRows?: RowUncheckedUpdateManyWithoutApprovedByNestedInput
  }

  export type UserUpsertWithoutEmployerOfInput = {
    update: XOR<UserUpdateWithoutEmployerOfInput, UserUncheckedUpdateWithoutEmployerOfInput>
    create: XOR<UserCreateWithoutEmployerOfInput, UserUncheckedCreateWithoutEmployerOfInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutEmployerOfInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutEmployerOfInput, UserUncheckedUpdateWithoutEmployerOfInput>
  }

  export type UserUpdateWithoutEmployerOfInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUpdateManyWithoutUserNestedInput
    employees?: EmployeeUpdateManyWithoutEmployerNestedInput
    createdRows?: RowUpdateManyWithoutUserNestedInput
    approvedRows?: RowUpdateManyWithoutApprovedByNestedInput
  }

  export type UserUncheckedUpdateWithoutEmployerOfInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
    employees?: EmployeeUncheckedUpdateManyWithoutEmployerNestedInput
    createdRows?: RowUncheckedUpdateManyWithoutUserNestedInput
    approvedRows?: RowUncheckedUpdateManyWithoutApprovedByNestedInput
  }

  export type ProjectCreateWithoutTsmRowsInput = {
    name: string
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    user?: UserCreateNestedOneWithoutProjectsInput
    sections?: SectionCreateNestedManyWithoutProjectInput
    beteckningar?: BeteckningCreateNestedManyWithoutProjectInput
  }

  export type ProjectUncheckedCreateWithoutTsmRowsInput = {
    id?: number
    name: string
    userId?: number | null
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    sections?: SectionUncheckedCreateNestedManyWithoutProjectInput
    beteckningar?: BeteckningUncheckedCreateNestedManyWithoutProjectInput
  }

  export type ProjectCreateOrConnectWithoutTsmRowsInput = {
    where: ProjectWhereUniqueInput
    create: XOR<ProjectCreateWithoutTsmRowsInput, ProjectUncheckedCreateWithoutTsmRowsInput>
  }

  export type UserCreateWithoutCreatedRowsInput = {
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    projects?: ProjectCreateNestedManyWithoutUserInput
    employees?: EmployeeCreateNestedManyWithoutEmployerInput
    employerOf?: EmployeeCreateNestedManyWithoutEmployeeInput
    approvedRows?: RowCreateNestedManyWithoutApprovedByInput
  }

  export type UserUncheckedCreateWithoutCreatedRowsInput = {
    id?: number
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
    employees?: EmployeeUncheckedCreateNestedManyWithoutEmployerInput
    employerOf?: EmployeeUncheckedCreateNestedManyWithoutEmployeeInput
    approvedRows?: RowUncheckedCreateNestedManyWithoutApprovedByInput
  }

  export type UserCreateOrConnectWithoutCreatedRowsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCreatedRowsInput, UserUncheckedCreateWithoutCreatedRowsInput>
  }

  export type SectionCreateWithoutRowsInput = {
    name: string
    type: string
    project: ProjectCreateNestedOneWithoutSectionsInput
  }

  export type SectionUncheckedCreateWithoutRowsInput = {
    id?: number
    name: string
    type: string
    projectId: number
  }

  export type SectionCreateOrConnectWithoutRowsInput = {
    where: SectionWhereUniqueInput
    create: XOR<SectionCreateWithoutRowsInput, SectionUncheckedCreateWithoutRowsInput>
  }

  export type UserCreateWithoutApprovedRowsInput = {
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    projects?: ProjectCreateNestedManyWithoutUserInput
    employees?: EmployeeCreateNestedManyWithoutEmployerInput
    employerOf?: EmployeeCreateNestedManyWithoutEmployeeInput
    createdRows?: RowCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutApprovedRowsInput = {
    id?: number
    email: string
    password: string
    phone?: string | null
    company?: string | null
    role?: string
    firstName?: string | null
    lastName?: string | null
    signature?: string | null
    projects?: ProjectUncheckedCreateNestedManyWithoutUserInput
    employees?: EmployeeUncheckedCreateNestedManyWithoutEmployerInput
    employerOf?: EmployeeUncheckedCreateNestedManyWithoutEmployeeInput
    createdRows?: RowUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutApprovedRowsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutApprovedRowsInput, UserUncheckedCreateWithoutApprovedRowsInput>
  }

  export type ProjectUpsertWithoutTsmRowsInput = {
    update: XOR<ProjectUpdateWithoutTsmRowsInput, ProjectUncheckedUpdateWithoutTsmRowsInput>
    create: XOR<ProjectCreateWithoutTsmRowsInput, ProjectUncheckedCreateWithoutTsmRowsInput>
    where?: ProjectWhereInput
  }

  export type ProjectUpdateToOneWithWhereWithoutTsmRowsInput = {
    where?: ProjectWhereInput
    data: XOR<ProjectUpdateWithoutTsmRowsInput, ProjectUncheckedUpdateWithoutTsmRowsInput>
  }

  export type ProjectUpdateWithoutTsmRowsInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    user?: UserUpdateOneWithoutProjectsNestedInput
    sections?: SectionUpdateManyWithoutProjectNestedInput
    beteckningar?: BeteckningUpdateManyWithoutProjectNestedInput
  }

  export type ProjectUncheckedUpdateWithoutTsmRowsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    sections?: SectionUncheckedUpdateManyWithoutProjectNestedInput
    beteckningar?: BeteckningUncheckedUpdateManyWithoutProjectNestedInput
  }

  export type UserUpsertWithoutCreatedRowsInput = {
    update: XOR<UserUpdateWithoutCreatedRowsInput, UserUncheckedUpdateWithoutCreatedRowsInput>
    create: XOR<UserCreateWithoutCreatedRowsInput, UserUncheckedCreateWithoutCreatedRowsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCreatedRowsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCreatedRowsInput, UserUncheckedUpdateWithoutCreatedRowsInput>
  }

  export type UserUpdateWithoutCreatedRowsInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUpdateManyWithoutUserNestedInput
    employees?: EmployeeUpdateManyWithoutEmployerNestedInput
    employerOf?: EmployeeUpdateManyWithoutEmployeeNestedInput
    approvedRows?: RowUpdateManyWithoutApprovedByNestedInput
  }

  export type UserUncheckedUpdateWithoutCreatedRowsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
    employees?: EmployeeUncheckedUpdateManyWithoutEmployerNestedInput
    employerOf?: EmployeeUncheckedUpdateManyWithoutEmployeeNestedInput
    approvedRows?: RowUncheckedUpdateManyWithoutApprovedByNestedInput
  }

  export type SectionUpsertWithoutRowsInput = {
    update: XOR<SectionUpdateWithoutRowsInput, SectionUncheckedUpdateWithoutRowsInput>
    create: XOR<SectionCreateWithoutRowsInput, SectionUncheckedCreateWithoutRowsInput>
    where?: SectionWhereInput
  }

  export type SectionUpdateToOneWithWhereWithoutRowsInput = {
    where?: SectionWhereInput
    data: XOR<SectionUpdateWithoutRowsInput, SectionUncheckedUpdateWithoutRowsInput>
  }

  export type SectionUpdateWithoutRowsInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    project?: ProjectUpdateOneRequiredWithoutSectionsNestedInput
  }

  export type SectionUncheckedUpdateWithoutRowsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    projectId?: IntFieldUpdateOperationsInput | number
  }

  export type UserUpsertWithoutApprovedRowsInput = {
    update: XOR<UserUpdateWithoutApprovedRowsInput, UserUncheckedUpdateWithoutApprovedRowsInput>
    create: XOR<UserCreateWithoutApprovedRowsInput, UserUncheckedCreateWithoutApprovedRowsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutApprovedRowsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutApprovedRowsInput, UserUncheckedUpdateWithoutApprovedRowsInput>
  }

  export type UserUpdateWithoutApprovedRowsInput = {
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUpdateManyWithoutUserNestedInput
    employees?: EmployeeUpdateManyWithoutEmployerNestedInput
    employerOf?: EmployeeUpdateManyWithoutEmployeeNestedInput
    createdRows?: RowUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutApprovedRowsInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    company?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    firstName?: NullableStringFieldUpdateOperationsInput | string | null
    lastName?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    projects?: ProjectUncheckedUpdateManyWithoutUserNestedInput
    employees?: EmployeeUncheckedUpdateManyWithoutEmployerNestedInput
    employerOf?: EmployeeUncheckedUpdateManyWithoutEmployeeNestedInput
    createdRows?: RowUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ProjectCreateManyUserInput = {
    id?: number
    name: string
    createdAt?: Date | string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    plats: string
    namn: string
    telefonnummer: string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
  }

  export type EmployeeCreateManyEmployerInput = {
    id?: number
    employeeId: number
  }

  export type EmployeeCreateManyEmployeeInput = {
    id?: number
    employerId: number
  }

  export type RowCreateManyUserInput = {
    id?: number
    projectId: number
    sectionId?: number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    approvedById?: number | null
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
  }

  export type RowCreateManyApprovedByInput = {
    id?: number
    projectId: number
    userId?: number | null
    sectionId?: number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
  }

  export type ProjectUpdateWithoutUserInput = {
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    sections?: SectionUpdateManyWithoutProjectNestedInput
    beteckningar?: BeteckningUpdateManyWithoutProjectNestedInput
    tsmRows?: RowUpdateManyWithoutProjectNestedInput
  }

  export type ProjectUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
    sections?: SectionUncheckedUpdateManyWithoutProjectNestedInput
    beteckningar?: BeteckningUncheckedUpdateManyWithoutProjectNestedInput
    tsmRows?: RowUncheckedUpdateManyWithoutProjectNestedInput
  }

  export type ProjectUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    startDate?: StringFieldUpdateOperationsInput | string
    startTime?: StringFieldUpdateOperationsInput | string
    endDate?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    plats?: StringFieldUpdateOperationsInput | string
    namn?: StringFieldUpdateOperationsInput | string
    telefonnummer?: StringFieldUpdateOperationsInput | string
    rows?: NullableJsonNullValueInput | InputJsonValue
    anteckningar?: NullableJsonNullValueInput | InputJsonValue
  }

  export type EmployeeUpdateWithoutEmployerInput = {
    employee?: UserUpdateOneRequiredWithoutEmployerOfNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutEmployerInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type EmployeeUncheckedUpdateManyWithoutEmployerInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type EmployeeUpdateWithoutEmployeeInput = {
    employer?: UserUpdateOneRequiredWithoutEmployeesNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutEmployeeInput = {
    id?: IntFieldUpdateOperationsInput | number
    employerId?: IntFieldUpdateOperationsInput | number
  }

  export type EmployeeUncheckedUpdateManyWithoutEmployeeInput = {
    id?: IntFieldUpdateOperationsInput | number
    employerId?: IntFieldUpdateOperationsInput | number
  }

  export type RowUpdateWithoutUserInput = {
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: ProjectUpdateOneRequiredWithoutTsmRowsNestedInput
    section?: SectionUpdateOneWithoutRowsNestedInput
    approvedBy?: UserUpdateOneWithoutApprovedRowsNestedInput
  }

  export type RowUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    projectId?: IntFieldUpdateOperationsInput | number
    sectionId?: NullableIntFieldUpdateOperationsInput | number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    approvedById?: NullableIntFieldUpdateOperationsInput | number | null
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RowUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    projectId?: IntFieldUpdateOperationsInput | number
    sectionId?: NullableIntFieldUpdateOperationsInput | number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    approvedById?: NullableIntFieldUpdateOperationsInput | number | null
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RowUpdateWithoutApprovedByInput = {
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: ProjectUpdateOneRequiredWithoutTsmRowsNestedInput
    user?: UserUpdateOneWithoutCreatedRowsNestedInput
    section?: SectionUpdateOneWithoutRowsNestedInput
  }

  export type RowUncheckedUpdateWithoutApprovedByInput = {
    id?: IntFieldUpdateOperationsInput | number
    projectId?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    sectionId?: NullableIntFieldUpdateOperationsInput | number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RowUncheckedUpdateManyWithoutApprovedByInput = {
    id?: IntFieldUpdateOperationsInput | number
    projectId?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    sectionId?: NullableIntFieldUpdateOperationsInput | number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SectionCreateManyProjectInput = {
    id?: number
    name: string
    type: string
  }

  export type BeteckningCreateManyProjectInput = {
    id?: number
    label: string
  }

  export type RowCreateManyProjectInput = {
    id?: number
    userId?: number | null
    sectionId?: number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    approvedById?: number | null
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
  }

  export type SectionUpdateWithoutProjectInput = {
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    rows?: RowUpdateManyWithoutSectionNestedInput
  }

  export type SectionUncheckedUpdateWithoutProjectInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    rows?: RowUncheckedUpdateManyWithoutSectionNestedInput
  }

  export type SectionUncheckedUpdateManyWithoutProjectInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
  }

  export type BeteckningUpdateWithoutProjectInput = {
    label?: StringFieldUpdateOperationsInput | string
  }

  export type BeteckningUncheckedUpdateWithoutProjectInput = {
    id?: IntFieldUpdateOperationsInput | number
    label?: StringFieldUpdateOperationsInput | string
  }

  export type BeteckningUncheckedUpdateManyWithoutProjectInput = {
    id?: IntFieldUpdateOperationsInput | number
    label?: StringFieldUpdateOperationsInput | string
  }

  export type RowUpdateWithoutProjectInput = {
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneWithoutCreatedRowsNestedInput
    section?: SectionUpdateOneWithoutRowsNestedInput
    approvedBy?: UserUpdateOneWithoutApprovedRowsNestedInput
  }

  export type RowUncheckedUpdateWithoutProjectInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    sectionId?: NullableIntFieldUpdateOperationsInput | number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    approvedById?: NullableIntFieldUpdateOperationsInput | number | null
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RowUncheckedUpdateManyWithoutProjectInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    sectionId?: NullableIntFieldUpdateOperationsInput | number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    approvedById?: NullableIntFieldUpdateOperationsInput | number | null
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RowCreateManySectionInput = {
    id?: number
    projectId: number
    userId?: number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowCreateanordningInput | string[]
    datum?: string | null
    isPending?: boolean
    approvedById?: number | null
    begard?: string | null
    begardDatum?: string | null
    anteckning?: string | null
    namn?: string | null
    telefon?: string | null
    createdAt?: Date | string
  }

  export type RowUpdateWithoutSectionInput = {
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    project?: ProjectUpdateOneRequiredWithoutTsmRowsNestedInput
    user?: UserUpdateOneWithoutCreatedRowsNestedInput
    approvedBy?: UserUpdateOneWithoutApprovedRowsNestedInput
  }

  export type RowUncheckedUpdateWithoutSectionInput = {
    id?: IntFieldUpdateOperationsInput | number
    projectId?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    approvedById?: NullableIntFieldUpdateOperationsInput | number | null
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RowUncheckedUpdateManyWithoutSectionInput = {
    id?: IntFieldUpdateOperationsInput | number
    projectId?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    selections?: NullableJsonNullValueInput | InputJsonValue
    anordning?: RowUpdateanordningInput | string[]
    datum?: NullableStringFieldUpdateOperationsInput | string | null
    isPending?: BoolFieldUpdateOperationsInput | boolean
    approvedById?: NullableIntFieldUpdateOperationsInput | number | null
    begard?: NullableStringFieldUpdateOperationsInput | string | null
    begardDatum?: NullableStringFieldUpdateOperationsInput | string | null
    anteckning?: NullableStringFieldUpdateOperationsInput | string | null
    namn?: NullableStringFieldUpdateOperationsInput | string | null
    telefon?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}