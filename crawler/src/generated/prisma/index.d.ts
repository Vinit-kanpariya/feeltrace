
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Job
 * 
 */
export type Job = $Result.DefaultSelection<Prisma.$JobPayload>
/**
 * Model Result
 * 
 */
export type Result = $Result.DefaultSelection<Prisma.$ResultPayload>
/**
 * Model Issue
 * 
 */
export type Issue = $Result.DefaultSelection<Prisma.$IssuePayload>
/**
 * Model CausalEdge
 * 
 */
export type CausalEdge = $Result.DefaultSelection<Prisma.$CausalEdgePayload>
/**
 * Model CrawledPage
 * 
 */
export type CrawledPage = $Result.DefaultSelection<Prisma.$CrawledPagePayload>
/**
 * Model CrawledPageIssue
 * 
 */
export type CrawledPageIssue = $Result.DefaultSelection<Prisma.$CrawledPageIssuePayload>
/**
 * Model CrawledPageEdge
 * 
 */
export type CrawledPageEdge = $Result.DefaultSelection<Prisma.$CrawledPageEdgePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const JobStatus: {
  pending: 'pending',
  crawling: 'crawling',
  extracting: 'extracting',
  analyzing: 'analyzing',
  complete: 'complete',
  failed: 'failed'
};

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]

}

export type JobStatus = $Enums.JobStatus

export const JobStatus: typeof $Enums.JobStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Jobs
 * const jobs = await prisma.job.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Jobs
   * const jobs = await prisma.job.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
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
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
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
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
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
   * Read more in our [docs](https://pris.ly/d/raw-queries).
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
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.job`: Exposes CRUD operations for the **Job** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Jobs
    * const jobs = await prisma.job.findMany()
    * ```
    */
  get job(): Prisma.JobDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.result`: Exposes CRUD operations for the **Result** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Results
    * const results = await prisma.result.findMany()
    * ```
    */
  get result(): Prisma.ResultDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.issue`: Exposes CRUD operations for the **Issue** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Issues
    * const issues = await prisma.issue.findMany()
    * ```
    */
  get issue(): Prisma.IssueDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.causalEdge`: Exposes CRUD operations for the **CausalEdge** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CausalEdges
    * const causalEdges = await prisma.causalEdge.findMany()
    * ```
    */
  get causalEdge(): Prisma.CausalEdgeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.crawledPage`: Exposes CRUD operations for the **CrawledPage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CrawledPages
    * const crawledPages = await prisma.crawledPage.findMany()
    * ```
    */
  get crawledPage(): Prisma.CrawledPageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.crawledPageIssue`: Exposes CRUD operations for the **CrawledPageIssue** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CrawledPageIssues
    * const crawledPageIssues = await prisma.crawledPageIssue.findMany()
    * ```
    */
  get crawledPageIssue(): Prisma.CrawledPageIssueDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.crawledPageEdge`: Exposes CRUD operations for the **CrawledPageEdge** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CrawledPageEdges
    * const crawledPageEdges = await prisma.crawledPageEdge.findMany()
    * ```
    */
  get crawledPageEdge(): Prisma.CrawledPageEdgeDelegate<ExtArgs, ClientOptions>;
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
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.8.0
   * Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
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
    Job: 'Job',
    Result: 'Result',
    Issue: 'Issue',
    CausalEdge: 'CausalEdge',
    CrawledPage: 'CrawledPage',
    CrawledPageIssue: 'CrawledPageIssue',
    CrawledPageEdge: 'CrawledPageEdge'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "job" | "result" | "issue" | "causalEdge" | "crawledPage" | "crawledPageIssue" | "crawledPageEdge"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Job: {
        payload: Prisma.$JobPayload<ExtArgs>
        fields: Prisma.JobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.JobFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.JobFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          findFirst: {
            args: Prisma.JobFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.JobFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          findMany: {
            args: Prisma.JobFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>[]
          }
          create: {
            args: Prisma.JobCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          createMany: {
            args: Prisma.JobCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.JobCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>[]
          }
          delete: {
            args: Prisma.JobDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          update: {
            args: Prisma.JobUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          deleteMany: {
            args: Prisma.JobDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.JobUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.JobUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>[]
          }
          upsert: {
            args: Prisma.JobUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          aggregate: {
            args: Prisma.JobAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJob>
          }
          groupBy: {
            args: Prisma.JobGroupByArgs<ExtArgs>
            result: $Utils.Optional<JobGroupByOutputType>[]
          }
          count: {
            args: Prisma.JobCountArgs<ExtArgs>
            result: $Utils.Optional<JobCountAggregateOutputType> | number
          }
        }
      }
      Result: {
        payload: Prisma.$ResultPayload<ExtArgs>
        fields: Prisma.ResultFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ResultFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResultPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ResultFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResultPayload>
          }
          findFirst: {
            args: Prisma.ResultFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResultPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ResultFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResultPayload>
          }
          findMany: {
            args: Prisma.ResultFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResultPayload>[]
          }
          create: {
            args: Prisma.ResultCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResultPayload>
          }
          createMany: {
            args: Prisma.ResultCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ResultCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResultPayload>[]
          }
          delete: {
            args: Prisma.ResultDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResultPayload>
          }
          update: {
            args: Prisma.ResultUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResultPayload>
          }
          deleteMany: {
            args: Prisma.ResultDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ResultUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ResultUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResultPayload>[]
          }
          upsert: {
            args: Prisma.ResultUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ResultPayload>
          }
          aggregate: {
            args: Prisma.ResultAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateResult>
          }
          groupBy: {
            args: Prisma.ResultGroupByArgs<ExtArgs>
            result: $Utils.Optional<ResultGroupByOutputType>[]
          }
          count: {
            args: Prisma.ResultCountArgs<ExtArgs>
            result: $Utils.Optional<ResultCountAggregateOutputType> | number
          }
        }
      }
      Issue: {
        payload: Prisma.$IssuePayload<ExtArgs>
        fields: Prisma.IssueFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IssueFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IssuePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IssueFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IssuePayload>
          }
          findFirst: {
            args: Prisma.IssueFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IssuePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IssueFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IssuePayload>
          }
          findMany: {
            args: Prisma.IssueFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IssuePayload>[]
          }
          create: {
            args: Prisma.IssueCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IssuePayload>
          }
          createMany: {
            args: Prisma.IssueCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IssueCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IssuePayload>[]
          }
          delete: {
            args: Prisma.IssueDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IssuePayload>
          }
          update: {
            args: Prisma.IssueUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IssuePayload>
          }
          deleteMany: {
            args: Prisma.IssueDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IssueUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IssueUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IssuePayload>[]
          }
          upsert: {
            args: Prisma.IssueUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IssuePayload>
          }
          aggregate: {
            args: Prisma.IssueAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIssue>
          }
          groupBy: {
            args: Prisma.IssueGroupByArgs<ExtArgs>
            result: $Utils.Optional<IssueGroupByOutputType>[]
          }
          count: {
            args: Prisma.IssueCountArgs<ExtArgs>
            result: $Utils.Optional<IssueCountAggregateOutputType> | number
          }
        }
      }
      CausalEdge: {
        payload: Prisma.$CausalEdgePayload<ExtArgs>
        fields: Prisma.CausalEdgeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CausalEdgeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CausalEdgePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CausalEdgeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CausalEdgePayload>
          }
          findFirst: {
            args: Prisma.CausalEdgeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CausalEdgePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CausalEdgeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CausalEdgePayload>
          }
          findMany: {
            args: Prisma.CausalEdgeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CausalEdgePayload>[]
          }
          create: {
            args: Prisma.CausalEdgeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CausalEdgePayload>
          }
          createMany: {
            args: Prisma.CausalEdgeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CausalEdgeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CausalEdgePayload>[]
          }
          delete: {
            args: Prisma.CausalEdgeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CausalEdgePayload>
          }
          update: {
            args: Prisma.CausalEdgeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CausalEdgePayload>
          }
          deleteMany: {
            args: Prisma.CausalEdgeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CausalEdgeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CausalEdgeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CausalEdgePayload>[]
          }
          upsert: {
            args: Prisma.CausalEdgeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CausalEdgePayload>
          }
          aggregate: {
            args: Prisma.CausalEdgeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCausalEdge>
          }
          groupBy: {
            args: Prisma.CausalEdgeGroupByArgs<ExtArgs>
            result: $Utils.Optional<CausalEdgeGroupByOutputType>[]
          }
          count: {
            args: Prisma.CausalEdgeCountArgs<ExtArgs>
            result: $Utils.Optional<CausalEdgeCountAggregateOutputType> | number
          }
        }
      }
      CrawledPage: {
        payload: Prisma.$CrawledPagePayload<ExtArgs>
        fields: Prisma.CrawledPageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CrawledPageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CrawledPageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPagePayload>
          }
          findFirst: {
            args: Prisma.CrawledPageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CrawledPageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPagePayload>
          }
          findMany: {
            args: Prisma.CrawledPageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPagePayload>[]
          }
          create: {
            args: Prisma.CrawledPageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPagePayload>
          }
          createMany: {
            args: Prisma.CrawledPageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CrawledPageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPagePayload>[]
          }
          delete: {
            args: Prisma.CrawledPageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPagePayload>
          }
          update: {
            args: Prisma.CrawledPageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPagePayload>
          }
          deleteMany: {
            args: Prisma.CrawledPageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CrawledPageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CrawledPageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPagePayload>[]
          }
          upsert: {
            args: Prisma.CrawledPageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPagePayload>
          }
          aggregate: {
            args: Prisma.CrawledPageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCrawledPage>
          }
          groupBy: {
            args: Prisma.CrawledPageGroupByArgs<ExtArgs>
            result: $Utils.Optional<CrawledPageGroupByOutputType>[]
          }
          count: {
            args: Prisma.CrawledPageCountArgs<ExtArgs>
            result: $Utils.Optional<CrawledPageCountAggregateOutputType> | number
          }
        }
      }
      CrawledPageIssue: {
        payload: Prisma.$CrawledPageIssuePayload<ExtArgs>
        fields: Prisma.CrawledPageIssueFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CrawledPageIssueFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageIssuePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CrawledPageIssueFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageIssuePayload>
          }
          findFirst: {
            args: Prisma.CrawledPageIssueFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageIssuePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CrawledPageIssueFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageIssuePayload>
          }
          findMany: {
            args: Prisma.CrawledPageIssueFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageIssuePayload>[]
          }
          create: {
            args: Prisma.CrawledPageIssueCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageIssuePayload>
          }
          createMany: {
            args: Prisma.CrawledPageIssueCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CrawledPageIssueCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageIssuePayload>[]
          }
          delete: {
            args: Prisma.CrawledPageIssueDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageIssuePayload>
          }
          update: {
            args: Prisma.CrawledPageIssueUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageIssuePayload>
          }
          deleteMany: {
            args: Prisma.CrawledPageIssueDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CrawledPageIssueUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CrawledPageIssueUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageIssuePayload>[]
          }
          upsert: {
            args: Prisma.CrawledPageIssueUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageIssuePayload>
          }
          aggregate: {
            args: Prisma.CrawledPageIssueAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCrawledPageIssue>
          }
          groupBy: {
            args: Prisma.CrawledPageIssueGroupByArgs<ExtArgs>
            result: $Utils.Optional<CrawledPageIssueGroupByOutputType>[]
          }
          count: {
            args: Prisma.CrawledPageIssueCountArgs<ExtArgs>
            result: $Utils.Optional<CrawledPageIssueCountAggregateOutputType> | number
          }
        }
      }
      CrawledPageEdge: {
        payload: Prisma.$CrawledPageEdgePayload<ExtArgs>
        fields: Prisma.CrawledPageEdgeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CrawledPageEdgeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageEdgePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CrawledPageEdgeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageEdgePayload>
          }
          findFirst: {
            args: Prisma.CrawledPageEdgeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageEdgePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CrawledPageEdgeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageEdgePayload>
          }
          findMany: {
            args: Prisma.CrawledPageEdgeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageEdgePayload>[]
          }
          create: {
            args: Prisma.CrawledPageEdgeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageEdgePayload>
          }
          createMany: {
            args: Prisma.CrawledPageEdgeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CrawledPageEdgeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageEdgePayload>[]
          }
          delete: {
            args: Prisma.CrawledPageEdgeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageEdgePayload>
          }
          update: {
            args: Prisma.CrawledPageEdgeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageEdgePayload>
          }
          deleteMany: {
            args: Prisma.CrawledPageEdgeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CrawledPageEdgeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CrawledPageEdgeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageEdgePayload>[]
          }
          upsert: {
            args: Prisma.CrawledPageEdgeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CrawledPageEdgePayload>
          }
          aggregate: {
            args: Prisma.CrawledPageEdgeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCrawledPageEdge>
          }
          groupBy: {
            args: Prisma.CrawledPageEdgeGroupByArgs<ExtArgs>
            result: $Utils.Optional<CrawledPageEdgeGroupByOutputType>[]
          }
          count: {
            args: Prisma.CrawledPageEdgeCountArgs<ExtArgs>
            result: $Utils.Optional<CrawledPageEdgeCountAggregateOutputType> | number
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
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
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
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
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
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    job?: JobOmit
    result?: ResultOmit
    issue?: IssueOmit
    causalEdge?: CausalEdgeOmit
    crawledPage?: CrawledPageOmit
    crawledPageIssue?: CrawledPageIssueOmit
    crawledPageEdge?: CrawledPageEdgeOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

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
   * Count Type ResultCountOutputType
   */

  export type ResultCountOutputType = {
    issues: number
    edges: number
    crawledPages: number
  }

  export type ResultCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    issues?: boolean | ResultCountOutputTypeCountIssuesArgs
    edges?: boolean | ResultCountOutputTypeCountEdgesArgs
    crawledPages?: boolean | ResultCountOutputTypeCountCrawledPagesArgs
  }

  // Custom InputTypes
  /**
   * ResultCountOutputType without action
   */
  export type ResultCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ResultCountOutputType
     */
    select?: ResultCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ResultCountOutputType without action
   */
  export type ResultCountOutputTypeCountIssuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IssueWhereInput
  }

  /**
   * ResultCountOutputType without action
   */
  export type ResultCountOutputTypeCountEdgesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CausalEdgeWhereInput
  }

  /**
   * ResultCountOutputType without action
   */
  export type ResultCountOutputTypeCountCrawledPagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CrawledPageWhereInput
  }


  /**
   * Count Type IssueCountOutputType
   */

  export type IssueCountOutputType = {
    causedBy: number
    causes: number
  }

  export type IssueCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    causedBy?: boolean | IssueCountOutputTypeCountCausedByArgs
    causes?: boolean | IssueCountOutputTypeCountCausesArgs
  }

  // Custom InputTypes
  /**
   * IssueCountOutputType without action
   */
  export type IssueCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IssueCountOutputType
     */
    select?: IssueCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * IssueCountOutputType without action
   */
  export type IssueCountOutputTypeCountCausedByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CausalEdgeWhereInput
  }

  /**
   * IssueCountOutputType without action
   */
  export type IssueCountOutputTypeCountCausesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CausalEdgeWhereInput
  }


  /**
   * Count Type CrawledPageCountOutputType
   */

  export type CrawledPageCountOutputType = {
    issues: number
    edges: number
  }

  export type CrawledPageCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    issues?: boolean | CrawledPageCountOutputTypeCountIssuesArgs
    edges?: boolean | CrawledPageCountOutputTypeCountEdgesArgs
  }

  // Custom InputTypes
  /**
   * CrawledPageCountOutputType without action
   */
  export type CrawledPageCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageCountOutputType
     */
    select?: CrawledPageCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CrawledPageCountOutputType without action
   */
  export type CrawledPageCountOutputTypeCountIssuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CrawledPageIssueWhereInput
  }

  /**
   * CrawledPageCountOutputType without action
   */
  export type CrawledPageCountOutputTypeCountEdgesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CrawledPageEdgeWhereInput
  }


  /**
   * Count Type CrawledPageIssueCountOutputType
   */

  export type CrawledPageIssueCountOutputType = {
    causedBy: number
    causes: number
  }

  export type CrawledPageIssueCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    causedBy?: boolean | CrawledPageIssueCountOutputTypeCountCausedByArgs
    causes?: boolean | CrawledPageIssueCountOutputTypeCountCausesArgs
  }

  // Custom InputTypes
  /**
   * CrawledPageIssueCountOutputType without action
   */
  export type CrawledPageIssueCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssueCountOutputType
     */
    select?: CrawledPageIssueCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CrawledPageIssueCountOutputType without action
   */
  export type CrawledPageIssueCountOutputTypeCountCausedByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CrawledPageEdgeWhereInput
  }

  /**
   * CrawledPageIssueCountOutputType without action
   */
  export type CrawledPageIssueCountOutputTypeCountCausesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CrawledPageEdgeWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Job
   */

  export type AggregateJob = {
    _count: JobCountAggregateOutputType | null
    _min: JobMinAggregateOutputType | null
    _max: JobMaxAggregateOutputType | null
  }

  export type JobMinAggregateOutputType = {
    id: string | null
    url: string | null
    status: $Enums.JobStatus | null
    error_message: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type JobMaxAggregateOutputType = {
    id: string | null
    url: string | null
    status: $Enums.JobStatus | null
    error_message: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type JobCountAggregateOutputType = {
    id: number
    url: number
    status: number
    error_message: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type JobMinAggregateInputType = {
    id?: true
    url?: true
    status?: true
    error_message?: true
    created_at?: true
    updated_at?: true
  }

  export type JobMaxAggregateInputType = {
    id?: true
    url?: true
    status?: true
    error_message?: true
    created_at?: true
    updated_at?: true
  }

  export type JobCountAggregateInputType = {
    id?: true
    url?: true
    status?: true
    error_message?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type JobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Job to aggregate.
     */
    where?: JobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jobs to fetch.
     */
    orderBy?: JobOrderByWithRelationInput | JobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: JobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Jobs
    **/
    _count?: true | JobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JobMaxAggregateInputType
  }

  export type GetJobAggregateType<T extends JobAggregateArgs> = {
        [P in keyof T & keyof AggregateJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJob[P]>
      : GetScalarType<T[P], AggregateJob[P]>
  }




  export type JobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JobWhereInput
    orderBy?: JobOrderByWithAggregationInput | JobOrderByWithAggregationInput[]
    by: JobScalarFieldEnum[] | JobScalarFieldEnum
    having?: JobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JobCountAggregateInputType | true
    _min?: JobMinAggregateInputType
    _max?: JobMaxAggregateInputType
  }

  export type JobGroupByOutputType = {
    id: string
    url: string
    status: $Enums.JobStatus
    error_message: string | null
    created_at: Date
    updated_at: Date
    _count: JobCountAggregateOutputType | null
    _min: JobMinAggregateOutputType | null
    _max: JobMaxAggregateOutputType | null
  }

  type GetJobGroupByPayload<T extends JobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JobGroupByOutputType[P]>
            : GetScalarType<T[P], JobGroupByOutputType[P]>
        }
      >
    >


  export type JobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    status?: boolean
    error_message?: boolean
    created_at?: boolean
    updated_at?: boolean
    result?: boolean | Job$resultArgs<ExtArgs>
  }, ExtArgs["result"]["job"]>

  export type JobSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    status?: boolean
    error_message?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["job"]>

  export type JobSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    url?: boolean
    status?: boolean
    error_message?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["job"]>

  export type JobSelectScalar = {
    id?: boolean
    url?: boolean
    status?: boolean
    error_message?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type JobOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "url" | "status" | "error_message" | "created_at" | "updated_at", ExtArgs["result"]["job"]>
  export type JobInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    result?: boolean | Job$resultArgs<ExtArgs>
  }
  export type JobIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type JobIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $JobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Job"
    objects: {
      result: Prisma.$ResultPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      url: string
      status: $Enums.JobStatus
      error_message: string | null
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["job"]>
    composites: {}
  }

  type JobGetPayload<S extends boolean | null | undefined | JobDefaultArgs> = $Result.GetResult<Prisma.$JobPayload, S>

  type JobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<JobFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: JobCountAggregateInputType | true
    }

  export interface JobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Job'], meta: { name: 'Job' } }
    /**
     * Find zero or one Job that matches the filter.
     * @param {JobFindUniqueArgs} args - Arguments to find a Job
     * @example
     * // Get one Job
     * const job = await prisma.job.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends JobFindUniqueArgs>(args: SelectSubset<T, JobFindUniqueArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Job that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {JobFindUniqueOrThrowArgs} args - Arguments to find a Job
     * @example
     * // Get one Job
     * const job = await prisma.job.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends JobFindUniqueOrThrowArgs>(args: SelectSubset<T, JobFindUniqueOrThrowArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Job that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobFindFirstArgs} args - Arguments to find a Job
     * @example
     * // Get one Job
     * const job = await prisma.job.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends JobFindFirstArgs>(args?: SelectSubset<T, JobFindFirstArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Job that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobFindFirstOrThrowArgs} args - Arguments to find a Job
     * @example
     * // Get one Job
     * const job = await prisma.job.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends JobFindFirstOrThrowArgs>(args?: SelectSubset<T, JobFindFirstOrThrowArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Jobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Jobs
     * const jobs = await prisma.job.findMany()
     * 
     * // Get first 10 Jobs
     * const jobs = await prisma.job.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const jobWithIdOnly = await prisma.job.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends JobFindManyArgs>(args?: SelectSubset<T, JobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Job.
     * @param {JobCreateArgs} args - Arguments to create a Job.
     * @example
     * // Create one Job
     * const Job = await prisma.job.create({
     *   data: {
     *     // ... data to create a Job
     *   }
     * })
     * 
     */
    create<T extends JobCreateArgs>(args: SelectSubset<T, JobCreateArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Jobs.
     * @param {JobCreateManyArgs} args - Arguments to create many Jobs.
     * @example
     * // Create many Jobs
     * const job = await prisma.job.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends JobCreateManyArgs>(args?: SelectSubset<T, JobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Jobs and returns the data saved in the database.
     * @param {JobCreateManyAndReturnArgs} args - Arguments to create many Jobs.
     * @example
     * // Create many Jobs
     * const job = await prisma.job.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Jobs and only return the `id`
     * const jobWithIdOnly = await prisma.job.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends JobCreateManyAndReturnArgs>(args?: SelectSubset<T, JobCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Job.
     * @param {JobDeleteArgs} args - Arguments to delete one Job.
     * @example
     * // Delete one Job
     * const Job = await prisma.job.delete({
     *   where: {
     *     // ... filter to delete one Job
     *   }
     * })
     * 
     */
    delete<T extends JobDeleteArgs>(args: SelectSubset<T, JobDeleteArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Job.
     * @param {JobUpdateArgs} args - Arguments to update one Job.
     * @example
     * // Update one Job
     * const job = await prisma.job.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends JobUpdateArgs>(args: SelectSubset<T, JobUpdateArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Jobs.
     * @param {JobDeleteManyArgs} args - Arguments to filter Jobs to delete.
     * @example
     * // Delete a few Jobs
     * const { count } = await prisma.job.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends JobDeleteManyArgs>(args?: SelectSubset<T, JobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Jobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Jobs
     * const job = await prisma.job.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends JobUpdateManyArgs>(args: SelectSubset<T, JobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Jobs and returns the data updated in the database.
     * @param {JobUpdateManyAndReturnArgs} args - Arguments to update many Jobs.
     * @example
     * // Update many Jobs
     * const job = await prisma.job.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Jobs and only return the `id`
     * const jobWithIdOnly = await prisma.job.updateManyAndReturn({
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
    updateManyAndReturn<T extends JobUpdateManyAndReturnArgs>(args: SelectSubset<T, JobUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Job.
     * @param {JobUpsertArgs} args - Arguments to update or create a Job.
     * @example
     * // Update or create a Job
     * const job = await prisma.job.upsert({
     *   create: {
     *     // ... data to create a Job
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Job we want to update
     *   }
     * })
     */
    upsert<T extends JobUpsertArgs>(args: SelectSubset<T, JobUpsertArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Jobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobCountArgs} args - Arguments to filter Jobs to count.
     * @example
     * // Count the number of Jobs
     * const count = await prisma.job.count({
     *   where: {
     *     // ... the filter for the Jobs we want to count
     *   }
     * })
    **/
    count<T extends JobCountArgs>(
      args?: Subset<T, JobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Job.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends JobAggregateArgs>(args: Subset<T, JobAggregateArgs>): Prisma.PrismaPromise<GetJobAggregateType<T>>

    /**
     * Group by Job.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobGroupByArgs} args - Group by arguments.
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
      T extends JobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: JobGroupByArgs['orderBy'] }
        : { orderBy?: JobGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, JobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Job model
   */
  readonly fields: JobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Job.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__JobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    result<T extends Job$resultArgs<ExtArgs> = {}>(args?: Subset<T, Job$resultArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Job model
   */
  interface JobFieldRefs {
    readonly id: FieldRef<"Job", 'String'>
    readonly url: FieldRef<"Job", 'String'>
    readonly status: FieldRef<"Job", 'JobStatus'>
    readonly error_message: FieldRef<"Job", 'String'>
    readonly created_at: FieldRef<"Job", 'DateTime'>
    readonly updated_at: FieldRef<"Job", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Job findUnique
   */
  export type JobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobInclude<ExtArgs> | null
    /**
     * Filter, which Job to fetch.
     */
    where: JobWhereUniqueInput
  }

  /**
   * Job findUniqueOrThrow
   */
  export type JobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobInclude<ExtArgs> | null
    /**
     * Filter, which Job to fetch.
     */
    where: JobWhereUniqueInput
  }

  /**
   * Job findFirst
   */
  export type JobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobInclude<ExtArgs> | null
    /**
     * Filter, which Job to fetch.
     */
    where?: JobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jobs to fetch.
     */
    orderBy?: JobOrderByWithRelationInput | JobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Jobs.
     */
    cursor?: JobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Jobs.
     */
    distinct?: JobScalarFieldEnum | JobScalarFieldEnum[]
  }

  /**
   * Job findFirstOrThrow
   */
  export type JobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobInclude<ExtArgs> | null
    /**
     * Filter, which Job to fetch.
     */
    where?: JobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jobs to fetch.
     */
    orderBy?: JobOrderByWithRelationInput | JobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Jobs.
     */
    cursor?: JobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Jobs.
     */
    distinct?: JobScalarFieldEnum | JobScalarFieldEnum[]
  }

  /**
   * Job findMany
   */
  export type JobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobInclude<ExtArgs> | null
    /**
     * Filter, which Jobs to fetch.
     */
    where?: JobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jobs to fetch.
     */
    orderBy?: JobOrderByWithRelationInput | JobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Jobs.
     */
    cursor?: JobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Jobs.
     */
    distinct?: JobScalarFieldEnum | JobScalarFieldEnum[]
  }

  /**
   * Job create
   */
  export type JobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobInclude<ExtArgs> | null
    /**
     * The data needed to create a Job.
     */
    data: XOR<JobCreateInput, JobUncheckedCreateInput>
  }

  /**
   * Job createMany
   */
  export type JobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Jobs.
     */
    data: JobCreateManyInput | JobCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Job createManyAndReturn
   */
  export type JobCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * The data used to create many Jobs.
     */
    data: JobCreateManyInput | JobCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Job update
   */
  export type JobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobInclude<ExtArgs> | null
    /**
     * The data needed to update a Job.
     */
    data: XOR<JobUpdateInput, JobUncheckedUpdateInput>
    /**
     * Choose, which Job to update.
     */
    where: JobWhereUniqueInput
  }

  /**
   * Job updateMany
   */
  export type JobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Jobs.
     */
    data: XOR<JobUpdateManyMutationInput, JobUncheckedUpdateManyInput>
    /**
     * Filter which Jobs to update
     */
    where?: JobWhereInput
    /**
     * Limit how many Jobs to update.
     */
    limit?: number
  }

  /**
   * Job updateManyAndReturn
   */
  export type JobUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * The data used to update Jobs.
     */
    data: XOR<JobUpdateManyMutationInput, JobUncheckedUpdateManyInput>
    /**
     * Filter which Jobs to update
     */
    where?: JobWhereInput
    /**
     * Limit how many Jobs to update.
     */
    limit?: number
  }

  /**
   * Job upsert
   */
  export type JobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobInclude<ExtArgs> | null
    /**
     * The filter to search for the Job to update in case it exists.
     */
    where: JobWhereUniqueInput
    /**
     * In case the Job found by the `where` argument doesn't exist, create a new Job with this data.
     */
    create: XOR<JobCreateInput, JobUncheckedCreateInput>
    /**
     * In case the Job was found with the provided `where` argument, update it with this data.
     */
    update: XOR<JobUpdateInput, JobUncheckedUpdateInput>
  }

  /**
   * Job delete
   */
  export type JobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobInclude<ExtArgs> | null
    /**
     * Filter which Job to delete.
     */
    where: JobWhereUniqueInput
  }

  /**
   * Job deleteMany
   */
  export type JobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Jobs to delete
     */
    where?: JobWhereInput
    /**
     * Limit how many Jobs to delete.
     */
    limit?: number
  }

  /**
   * Job.result
   */
  export type Job$resultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultInclude<ExtArgs> | null
    where?: ResultWhereInput
  }

  /**
   * Job without action
   */
  export type JobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: JobInclude<ExtArgs> | null
  }


  /**
   * Model Result
   */

  export type AggregateResult = {
    _count: ResultCountAggregateOutputType | null
    _min: ResultMinAggregateOutputType | null
    _max: ResultMaxAggregateOutputType | null
  }

  export type ResultMinAggregateOutputType = {
    id: string | null
    jobId: string | null
    screenshot_url: string | null
    created_at: Date | null
  }

  export type ResultMaxAggregateOutputType = {
    id: string | null
    jobId: string | null
    screenshot_url: string | null
    created_at: Date | null
  }

  export type ResultCountAggregateOutputType = {
    id: number
    jobId: number
    narrative: number
    screenshot_url: number
    tech_stack: number
    cross_page_patterns: number
    created_at: number
    _all: number
  }


  export type ResultMinAggregateInputType = {
    id?: true
    jobId?: true
    screenshot_url?: true
    created_at?: true
  }

  export type ResultMaxAggregateInputType = {
    id?: true
    jobId?: true
    screenshot_url?: true
    created_at?: true
  }

  export type ResultCountAggregateInputType = {
    id?: true
    jobId?: true
    narrative?: true
    screenshot_url?: true
    tech_stack?: true
    cross_page_patterns?: true
    created_at?: true
    _all?: true
  }

  export type ResultAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Result to aggregate.
     */
    where?: ResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Results to fetch.
     */
    orderBy?: ResultOrderByWithRelationInput | ResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Results from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Results.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Results
    **/
    _count?: true | ResultCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ResultMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ResultMaxAggregateInputType
  }

  export type GetResultAggregateType<T extends ResultAggregateArgs> = {
        [P in keyof T & keyof AggregateResult]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateResult[P]>
      : GetScalarType<T[P], AggregateResult[P]>
  }




  export type ResultGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ResultWhereInput
    orderBy?: ResultOrderByWithAggregationInput | ResultOrderByWithAggregationInput[]
    by: ResultScalarFieldEnum[] | ResultScalarFieldEnum
    having?: ResultScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ResultCountAggregateInputType | true
    _min?: ResultMinAggregateInputType
    _max?: ResultMaxAggregateInputType
  }

  export type ResultGroupByOutputType = {
    id: string
    jobId: string
    narrative: JsonValue
    screenshot_url: string | null
    tech_stack: JsonValue | null
    cross_page_patterns: JsonValue | null
    created_at: Date
    _count: ResultCountAggregateOutputType | null
    _min: ResultMinAggregateOutputType | null
    _max: ResultMaxAggregateOutputType | null
  }

  type GetResultGroupByPayload<T extends ResultGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ResultGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ResultGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ResultGroupByOutputType[P]>
            : GetScalarType<T[P], ResultGroupByOutputType[P]>
        }
      >
    >


  export type ResultSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    narrative?: boolean
    screenshot_url?: boolean
    tech_stack?: boolean
    cross_page_patterns?: boolean
    created_at?: boolean
    job?: boolean | JobDefaultArgs<ExtArgs>
    issues?: boolean | Result$issuesArgs<ExtArgs>
    edges?: boolean | Result$edgesArgs<ExtArgs>
    crawledPages?: boolean | Result$crawledPagesArgs<ExtArgs>
    _count?: boolean | ResultCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["result"]>

  export type ResultSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    narrative?: boolean
    screenshot_url?: boolean
    tech_stack?: boolean
    cross_page_patterns?: boolean
    created_at?: boolean
    job?: boolean | JobDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["result"]>

  export type ResultSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    narrative?: boolean
    screenshot_url?: boolean
    tech_stack?: boolean
    cross_page_patterns?: boolean
    created_at?: boolean
    job?: boolean | JobDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["result"]>

  export type ResultSelectScalar = {
    id?: boolean
    jobId?: boolean
    narrative?: boolean
    screenshot_url?: boolean
    tech_stack?: boolean
    cross_page_patterns?: boolean
    created_at?: boolean
  }

  export type ResultOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "jobId" | "narrative" | "screenshot_url" | "tech_stack" | "cross_page_patterns" | "created_at", ExtArgs["result"]["result"]>
  export type ResultInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    job?: boolean | JobDefaultArgs<ExtArgs>
    issues?: boolean | Result$issuesArgs<ExtArgs>
    edges?: boolean | Result$edgesArgs<ExtArgs>
    crawledPages?: boolean | Result$crawledPagesArgs<ExtArgs>
    _count?: boolean | ResultCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ResultIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    job?: boolean | JobDefaultArgs<ExtArgs>
  }
  export type ResultIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    job?: boolean | JobDefaultArgs<ExtArgs>
  }

  export type $ResultPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Result"
    objects: {
      job: Prisma.$JobPayload<ExtArgs>
      issues: Prisma.$IssuePayload<ExtArgs>[]
      edges: Prisma.$CausalEdgePayload<ExtArgs>[]
      crawledPages: Prisma.$CrawledPagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      jobId: string
      narrative: Prisma.JsonValue
      screenshot_url: string | null
      tech_stack: Prisma.JsonValue | null
      cross_page_patterns: Prisma.JsonValue | null
      created_at: Date
    }, ExtArgs["result"]["result"]>
    composites: {}
  }

  type ResultGetPayload<S extends boolean | null | undefined | ResultDefaultArgs> = $Result.GetResult<Prisma.$ResultPayload, S>

  type ResultCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ResultFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ResultCountAggregateInputType | true
    }

  export interface ResultDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Result'], meta: { name: 'Result' } }
    /**
     * Find zero or one Result that matches the filter.
     * @param {ResultFindUniqueArgs} args - Arguments to find a Result
     * @example
     * // Get one Result
     * const result = await prisma.result.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ResultFindUniqueArgs>(args: SelectSubset<T, ResultFindUniqueArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Result that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ResultFindUniqueOrThrowArgs} args - Arguments to find a Result
     * @example
     * // Get one Result
     * const result = await prisma.result.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ResultFindUniqueOrThrowArgs>(args: SelectSubset<T, ResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Result that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResultFindFirstArgs} args - Arguments to find a Result
     * @example
     * // Get one Result
     * const result = await prisma.result.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ResultFindFirstArgs>(args?: SelectSubset<T, ResultFindFirstArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Result that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResultFindFirstOrThrowArgs} args - Arguments to find a Result
     * @example
     * // Get one Result
     * const result = await prisma.result.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ResultFindFirstOrThrowArgs>(args?: SelectSubset<T, ResultFindFirstOrThrowArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Results that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResultFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Results
     * const results = await prisma.result.findMany()
     * 
     * // Get first 10 Results
     * const results = await prisma.result.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const resultWithIdOnly = await prisma.result.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ResultFindManyArgs>(args?: SelectSubset<T, ResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Result.
     * @param {ResultCreateArgs} args - Arguments to create a Result.
     * @example
     * // Create one Result
     * const Result = await prisma.result.create({
     *   data: {
     *     // ... data to create a Result
     *   }
     * })
     * 
     */
    create<T extends ResultCreateArgs>(args: SelectSubset<T, ResultCreateArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Results.
     * @param {ResultCreateManyArgs} args - Arguments to create many Results.
     * @example
     * // Create many Results
     * const result = await prisma.result.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ResultCreateManyArgs>(args?: SelectSubset<T, ResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Results and returns the data saved in the database.
     * @param {ResultCreateManyAndReturnArgs} args - Arguments to create many Results.
     * @example
     * // Create many Results
     * const result = await prisma.result.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Results and only return the `id`
     * const resultWithIdOnly = await prisma.result.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ResultCreateManyAndReturnArgs>(args?: SelectSubset<T, ResultCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Result.
     * @param {ResultDeleteArgs} args - Arguments to delete one Result.
     * @example
     * // Delete one Result
     * const Result = await prisma.result.delete({
     *   where: {
     *     // ... filter to delete one Result
     *   }
     * })
     * 
     */
    delete<T extends ResultDeleteArgs>(args: SelectSubset<T, ResultDeleteArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Result.
     * @param {ResultUpdateArgs} args - Arguments to update one Result.
     * @example
     * // Update one Result
     * const result = await prisma.result.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ResultUpdateArgs>(args: SelectSubset<T, ResultUpdateArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Results.
     * @param {ResultDeleteManyArgs} args - Arguments to filter Results to delete.
     * @example
     * // Delete a few Results
     * const { count } = await prisma.result.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ResultDeleteManyArgs>(args?: SelectSubset<T, ResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Results.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResultUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Results
     * const result = await prisma.result.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ResultUpdateManyArgs>(args: SelectSubset<T, ResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Results and returns the data updated in the database.
     * @param {ResultUpdateManyAndReturnArgs} args - Arguments to update many Results.
     * @example
     * // Update many Results
     * const result = await prisma.result.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Results and only return the `id`
     * const resultWithIdOnly = await prisma.result.updateManyAndReturn({
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
    updateManyAndReturn<T extends ResultUpdateManyAndReturnArgs>(args: SelectSubset<T, ResultUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Result.
     * @param {ResultUpsertArgs} args - Arguments to update or create a Result.
     * @example
     * // Update or create a Result
     * const result = await prisma.result.upsert({
     *   create: {
     *     // ... data to create a Result
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Result we want to update
     *   }
     * })
     */
    upsert<T extends ResultUpsertArgs>(args: SelectSubset<T, ResultUpsertArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Results.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResultCountArgs} args - Arguments to filter Results to count.
     * @example
     * // Count the number of Results
     * const count = await prisma.result.count({
     *   where: {
     *     // ... the filter for the Results we want to count
     *   }
     * })
    **/
    count<T extends ResultCountArgs>(
      args?: Subset<T, ResultCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ResultCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Result.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResultAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ResultAggregateArgs>(args: Subset<T, ResultAggregateArgs>): Prisma.PrismaPromise<GetResultAggregateType<T>>

    /**
     * Group by Result.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResultGroupByArgs} args - Group by arguments.
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
      T extends ResultGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ResultGroupByArgs['orderBy'] }
        : { orderBy?: ResultGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Result model
   */
  readonly fields: ResultFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Result.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ResultClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    job<T extends JobDefaultArgs<ExtArgs> = {}>(args?: Subset<T, JobDefaultArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    issues<T extends Result$issuesArgs<ExtArgs> = {}>(args?: Subset<T, Result$issuesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    edges<T extends Result$edgesArgs<ExtArgs> = {}>(args?: Subset<T, Result$edgesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    crawledPages<T extends Result$crawledPagesArgs<ExtArgs> = {}>(args?: Subset<T, Result$crawledPagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Result model
   */
  interface ResultFieldRefs {
    readonly id: FieldRef<"Result", 'String'>
    readonly jobId: FieldRef<"Result", 'String'>
    readonly narrative: FieldRef<"Result", 'Json'>
    readonly screenshot_url: FieldRef<"Result", 'String'>
    readonly tech_stack: FieldRef<"Result", 'Json'>
    readonly cross_page_patterns: FieldRef<"Result", 'Json'>
    readonly created_at: FieldRef<"Result", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Result findUnique
   */
  export type ResultFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultInclude<ExtArgs> | null
    /**
     * Filter, which Result to fetch.
     */
    where: ResultWhereUniqueInput
  }

  /**
   * Result findUniqueOrThrow
   */
  export type ResultFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultInclude<ExtArgs> | null
    /**
     * Filter, which Result to fetch.
     */
    where: ResultWhereUniqueInput
  }

  /**
   * Result findFirst
   */
  export type ResultFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultInclude<ExtArgs> | null
    /**
     * Filter, which Result to fetch.
     */
    where?: ResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Results to fetch.
     */
    orderBy?: ResultOrderByWithRelationInput | ResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Results.
     */
    cursor?: ResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Results from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Results.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Results.
     */
    distinct?: ResultScalarFieldEnum | ResultScalarFieldEnum[]
  }

  /**
   * Result findFirstOrThrow
   */
  export type ResultFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultInclude<ExtArgs> | null
    /**
     * Filter, which Result to fetch.
     */
    where?: ResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Results to fetch.
     */
    orderBy?: ResultOrderByWithRelationInput | ResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Results.
     */
    cursor?: ResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Results from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Results.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Results.
     */
    distinct?: ResultScalarFieldEnum | ResultScalarFieldEnum[]
  }

  /**
   * Result findMany
   */
  export type ResultFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultInclude<ExtArgs> | null
    /**
     * Filter, which Results to fetch.
     */
    where?: ResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Results to fetch.
     */
    orderBy?: ResultOrderByWithRelationInput | ResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Results.
     */
    cursor?: ResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Results from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Results.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Results.
     */
    distinct?: ResultScalarFieldEnum | ResultScalarFieldEnum[]
  }

  /**
   * Result create
   */
  export type ResultCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultInclude<ExtArgs> | null
    /**
     * The data needed to create a Result.
     */
    data: XOR<ResultCreateInput, ResultUncheckedCreateInput>
  }

  /**
   * Result createMany
   */
  export type ResultCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Results.
     */
    data: ResultCreateManyInput | ResultCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Result createManyAndReturn
   */
  export type ResultCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * The data used to create many Results.
     */
    data: ResultCreateManyInput | ResultCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Result update
   */
  export type ResultUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultInclude<ExtArgs> | null
    /**
     * The data needed to update a Result.
     */
    data: XOR<ResultUpdateInput, ResultUncheckedUpdateInput>
    /**
     * Choose, which Result to update.
     */
    where: ResultWhereUniqueInput
  }

  /**
   * Result updateMany
   */
  export type ResultUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Results.
     */
    data: XOR<ResultUpdateManyMutationInput, ResultUncheckedUpdateManyInput>
    /**
     * Filter which Results to update
     */
    where?: ResultWhereInput
    /**
     * Limit how many Results to update.
     */
    limit?: number
  }

  /**
   * Result updateManyAndReturn
   */
  export type ResultUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * The data used to update Results.
     */
    data: XOR<ResultUpdateManyMutationInput, ResultUncheckedUpdateManyInput>
    /**
     * Filter which Results to update
     */
    where?: ResultWhereInput
    /**
     * Limit how many Results to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Result upsert
   */
  export type ResultUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultInclude<ExtArgs> | null
    /**
     * The filter to search for the Result to update in case it exists.
     */
    where: ResultWhereUniqueInput
    /**
     * In case the Result found by the `where` argument doesn't exist, create a new Result with this data.
     */
    create: XOR<ResultCreateInput, ResultUncheckedCreateInput>
    /**
     * In case the Result was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ResultUpdateInput, ResultUncheckedUpdateInput>
  }

  /**
   * Result delete
   */
  export type ResultDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultInclude<ExtArgs> | null
    /**
     * Filter which Result to delete.
     */
    where: ResultWhereUniqueInput
  }

  /**
   * Result deleteMany
   */
  export type ResultDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Results to delete
     */
    where?: ResultWhereInput
    /**
     * Limit how many Results to delete.
     */
    limit?: number
  }

  /**
   * Result.issues
   */
  export type Result$issuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueInclude<ExtArgs> | null
    where?: IssueWhereInput
    orderBy?: IssueOrderByWithRelationInput | IssueOrderByWithRelationInput[]
    cursor?: IssueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IssueScalarFieldEnum | IssueScalarFieldEnum[]
  }

  /**
   * Result.edges
   */
  export type Result$edgesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    where?: CausalEdgeWhereInput
    orderBy?: CausalEdgeOrderByWithRelationInput | CausalEdgeOrderByWithRelationInput[]
    cursor?: CausalEdgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CausalEdgeScalarFieldEnum | CausalEdgeScalarFieldEnum[]
  }

  /**
   * Result.crawledPages
   */
  export type Result$crawledPagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageInclude<ExtArgs> | null
    where?: CrawledPageWhereInput
    orderBy?: CrawledPageOrderByWithRelationInput | CrawledPageOrderByWithRelationInput[]
    cursor?: CrawledPageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CrawledPageScalarFieldEnum | CrawledPageScalarFieldEnum[]
  }

  /**
   * Result without action
   */
  export type ResultDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Result
     */
    select?: ResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Result
     */
    omit?: ResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ResultInclude<ExtArgs> | null
  }


  /**
   * Model Issue
   */

  export type AggregateIssue = {
    _count: IssueCountAggregateOutputType | null
    _avg: IssueAvgAggregateOutputType | null
    _sum: IssueSumAggregateOutputType | null
    _min: IssueMinAggregateOutputType | null
    _max: IssueMaxAggregateOutputType | null
  }

  export type IssueAvgAggregateOutputType = {
    severity: number | null
  }

  export type IssueSumAggregateOutputType = {
    severity: number | null
  }

  export type IssueMinAggregateOutputType = {
    id: string | null
    resultId: string | null
    category: string | null
    signal_source: string | null
    severity: number | null
    raw_evidence: string | null
    technical_description: string | null
    fix_suggestion: string | null
    severity_justification: string | null
  }

  export type IssueMaxAggregateOutputType = {
    id: string | null
    resultId: string | null
    category: string | null
    signal_source: string | null
    severity: number | null
    raw_evidence: string | null
    technical_description: string | null
    fix_suggestion: string | null
    severity_justification: string | null
  }

  export type IssueCountAggregateOutputType = {
    id: number
    resultId: number
    category: number
    signal_source: number
    severity: number
    raw_evidence: number
    technical_description: number
    fix_suggestion: number
    severity_justification: number
    _all: number
  }


  export type IssueAvgAggregateInputType = {
    severity?: true
  }

  export type IssueSumAggregateInputType = {
    severity?: true
  }

  export type IssueMinAggregateInputType = {
    id?: true
    resultId?: true
    category?: true
    signal_source?: true
    severity?: true
    raw_evidence?: true
    technical_description?: true
    fix_suggestion?: true
    severity_justification?: true
  }

  export type IssueMaxAggregateInputType = {
    id?: true
    resultId?: true
    category?: true
    signal_source?: true
    severity?: true
    raw_evidence?: true
    technical_description?: true
    fix_suggestion?: true
    severity_justification?: true
  }

  export type IssueCountAggregateInputType = {
    id?: true
    resultId?: true
    category?: true
    signal_source?: true
    severity?: true
    raw_evidence?: true
    technical_description?: true
    fix_suggestion?: true
    severity_justification?: true
    _all?: true
  }

  export type IssueAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Issue to aggregate.
     */
    where?: IssueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Issues to fetch.
     */
    orderBy?: IssueOrderByWithRelationInput | IssueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IssueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Issues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Issues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Issues
    **/
    _count?: true | IssueCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IssueAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IssueSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IssueMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IssueMaxAggregateInputType
  }

  export type GetIssueAggregateType<T extends IssueAggregateArgs> = {
        [P in keyof T & keyof AggregateIssue]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIssue[P]>
      : GetScalarType<T[P], AggregateIssue[P]>
  }




  export type IssueGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IssueWhereInput
    orderBy?: IssueOrderByWithAggregationInput | IssueOrderByWithAggregationInput[]
    by: IssueScalarFieldEnum[] | IssueScalarFieldEnum
    having?: IssueScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IssueCountAggregateInputType | true
    _avg?: IssueAvgAggregateInputType
    _sum?: IssueSumAggregateInputType
    _min?: IssueMinAggregateInputType
    _max?: IssueMaxAggregateInputType
  }

  export type IssueGroupByOutputType = {
    id: string
    resultId: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion: string
    severity_justification: string
    _count: IssueCountAggregateOutputType | null
    _avg: IssueAvgAggregateOutputType | null
    _sum: IssueSumAggregateOutputType | null
    _min: IssueMinAggregateOutputType | null
    _max: IssueMaxAggregateOutputType | null
  }

  type GetIssueGroupByPayload<T extends IssueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IssueGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IssueGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IssueGroupByOutputType[P]>
            : GetScalarType<T[P], IssueGroupByOutputType[P]>
        }
      >
    >


  export type IssueSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    resultId?: boolean
    category?: boolean
    signal_source?: boolean
    severity?: boolean
    raw_evidence?: boolean
    technical_description?: boolean
    fix_suggestion?: boolean
    severity_justification?: boolean
    result?: boolean | ResultDefaultArgs<ExtArgs>
    causedBy?: boolean | Issue$causedByArgs<ExtArgs>
    causes?: boolean | Issue$causesArgs<ExtArgs>
    _count?: boolean | IssueCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["issue"]>

  export type IssueSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    resultId?: boolean
    category?: boolean
    signal_source?: boolean
    severity?: boolean
    raw_evidence?: boolean
    technical_description?: boolean
    fix_suggestion?: boolean
    severity_justification?: boolean
    result?: boolean | ResultDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["issue"]>

  export type IssueSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    resultId?: boolean
    category?: boolean
    signal_source?: boolean
    severity?: boolean
    raw_evidence?: boolean
    technical_description?: boolean
    fix_suggestion?: boolean
    severity_justification?: boolean
    result?: boolean | ResultDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["issue"]>

  export type IssueSelectScalar = {
    id?: boolean
    resultId?: boolean
    category?: boolean
    signal_source?: boolean
    severity?: boolean
    raw_evidence?: boolean
    technical_description?: boolean
    fix_suggestion?: boolean
    severity_justification?: boolean
  }

  export type IssueOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "resultId" | "category" | "signal_source" | "severity" | "raw_evidence" | "technical_description" | "fix_suggestion" | "severity_justification", ExtArgs["result"]["issue"]>
  export type IssueInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    result?: boolean | ResultDefaultArgs<ExtArgs>
    causedBy?: boolean | Issue$causedByArgs<ExtArgs>
    causes?: boolean | Issue$causesArgs<ExtArgs>
    _count?: boolean | IssueCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type IssueIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    result?: boolean | ResultDefaultArgs<ExtArgs>
  }
  export type IssueIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    result?: boolean | ResultDefaultArgs<ExtArgs>
  }

  export type $IssuePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Issue"
    objects: {
      result: Prisma.$ResultPayload<ExtArgs>
      causedBy: Prisma.$CausalEdgePayload<ExtArgs>[]
      causes: Prisma.$CausalEdgePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      resultId: string
      category: string
      signal_source: string
      severity: number
      raw_evidence: string
      technical_description: string
      fix_suggestion: string
      severity_justification: string
    }, ExtArgs["result"]["issue"]>
    composites: {}
  }

  type IssueGetPayload<S extends boolean | null | undefined | IssueDefaultArgs> = $Result.GetResult<Prisma.$IssuePayload, S>

  type IssueCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IssueFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IssueCountAggregateInputType | true
    }

  export interface IssueDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Issue'], meta: { name: 'Issue' } }
    /**
     * Find zero or one Issue that matches the filter.
     * @param {IssueFindUniqueArgs} args - Arguments to find a Issue
     * @example
     * // Get one Issue
     * const issue = await prisma.issue.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IssueFindUniqueArgs>(args: SelectSubset<T, IssueFindUniqueArgs<ExtArgs>>): Prisma__IssueClient<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Issue that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IssueFindUniqueOrThrowArgs} args - Arguments to find a Issue
     * @example
     * // Get one Issue
     * const issue = await prisma.issue.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IssueFindUniqueOrThrowArgs>(args: SelectSubset<T, IssueFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IssueClient<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Issue that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IssueFindFirstArgs} args - Arguments to find a Issue
     * @example
     * // Get one Issue
     * const issue = await prisma.issue.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IssueFindFirstArgs>(args?: SelectSubset<T, IssueFindFirstArgs<ExtArgs>>): Prisma__IssueClient<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Issue that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IssueFindFirstOrThrowArgs} args - Arguments to find a Issue
     * @example
     * // Get one Issue
     * const issue = await prisma.issue.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IssueFindFirstOrThrowArgs>(args?: SelectSubset<T, IssueFindFirstOrThrowArgs<ExtArgs>>): Prisma__IssueClient<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Issues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IssueFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Issues
     * const issues = await prisma.issue.findMany()
     * 
     * // Get first 10 Issues
     * const issues = await prisma.issue.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const issueWithIdOnly = await prisma.issue.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IssueFindManyArgs>(args?: SelectSubset<T, IssueFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Issue.
     * @param {IssueCreateArgs} args - Arguments to create a Issue.
     * @example
     * // Create one Issue
     * const Issue = await prisma.issue.create({
     *   data: {
     *     // ... data to create a Issue
     *   }
     * })
     * 
     */
    create<T extends IssueCreateArgs>(args: SelectSubset<T, IssueCreateArgs<ExtArgs>>): Prisma__IssueClient<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Issues.
     * @param {IssueCreateManyArgs} args - Arguments to create many Issues.
     * @example
     * // Create many Issues
     * const issue = await prisma.issue.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IssueCreateManyArgs>(args?: SelectSubset<T, IssueCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Issues and returns the data saved in the database.
     * @param {IssueCreateManyAndReturnArgs} args - Arguments to create many Issues.
     * @example
     * // Create many Issues
     * const issue = await prisma.issue.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Issues and only return the `id`
     * const issueWithIdOnly = await prisma.issue.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IssueCreateManyAndReturnArgs>(args?: SelectSubset<T, IssueCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Issue.
     * @param {IssueDeleteArgs} args - Arguments to delete one Issue.
     * @example
     * // Delete one Issue
     * const Issue = await prisma.issue.delete({
     *   where: {
     *     // ... filter to delete one Issue
     *   }
     * })
     * 
     */
    delete<T extends IssueDeleteArgs>(args: SelectSubset<T, IssueDeleteArgs<ExtArgs>>): Prisma__IssueClient<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Issue.
     * @param {IssueUpdateArgs} args - Arguments to update one Issue.
     * @example
     * // Update one Issue
     * const issue = await prisma.issue.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IssueUpdateArgs>(args: SelectSubset<T, IssueUpdateArgs<ExtArgs>>): Prisma__IssueClient<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Issues.
     * @param {IssueDeleteManyArgs} args - Arguments to filter Issues to delete.
     * @example
     * // Delete a few Issues
     * const { count } = await prisma.issue.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IssueDeleteManyArgs>(args?: SelectSubset<T, IssueDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Issues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IssueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Issues
     * const issue = await prisma.issue.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IssueUpdateManyArgs>(args: SelectSubset<T, IssueUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Issues and returns the data updated in the database.
     * @param {IssueUpdateManyAndReturnArgs} args - Arguments to update many Issues.
     * @example
     * // Update many Issues
     * const issue = await prisma.issue.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Issues and only return the `id`
     * const issueWithIdOnly = await prisma.issue.updateManyAndReturn({
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
    updateManyAndReturn<T extends IssueUpdateManyAndReturnArgs>(args: SelectSubset<T, IssueUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Issue.
     * @param {IssueUpsertArgs} args - Arguments to update or create a Issue.
     * @example
     * // Update or create a Issue
     * const issue = await prisma.issue.upsert({
     *   create: {
     *     // ... data to create a Issue
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Issue we want to update
     *   }
     * })
     */
    upsert<T extends IssueUpsertArgs>(args: SelectSubset<T, IssueUpsertArgs<ExtArgs>>): Prisma__IssueClient<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Issues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IssueCountArgs} args - Arguments to filter Issues to count.
     * @example
     * // Count the number of Issues
     * const count = await prisma.issue.count({
     *   where: {
     *     // ... the filter for the Issues we want to count
     *   }
     * })
    **/
    count<T extends IssueCountArgs>(
      args?: Subset<T, IssueCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IssueCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Issue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IssueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends IssueAggregateArgs>(args: Subset<T, IssueAggregateArgs>): Prisma.PrismaPromise<GetIssueAggregateType<T>>

    /**
     * Group by Issue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IssueGroupByArgs} args - Group by arguments.
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
      T extends IssueGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IssueGroupByArgs['orderBy'] }
        : { orderBy?: IssueGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, IssueGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIssueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Issue model
   */
  readonly fields: IssueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Issue.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IssueClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    result<T extends ResultDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ResultDefaultArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    causedBy<T extends Issue$causedByArgs<ExtArgs> = {}>(args?: Subset<T, Issue$causedByArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    causes<T extends Issue$causesArgs<ExtArgs> = {}>(args?: Subset<T, Issue$causesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Issue model
   */
  interface IssueFieldRefs {
    readonly id: FieldRef<"Issue", 'String'>
    readonly resultId: FieldRef<"Issue", 'String'>
    readonly category: FieldRef<"Issue", 'String'>
    readonly signal_source: FieldRef<"Issue", 'String'>
    readonly severity: FieldRef<"Issue", 'Int'>
    readonly raw_evidence: FieldRef<"Issue", 'String'>
    readonly technical_description: FieldRef<"Issue", 'String'>
    readonly fix_suggestion: FieldRef<"Issue", 'String'>
    readonly severity_justification: FieldRef<"Issue", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Issue findUnique
   */
  export type IssueFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueInclude<ExtArgs> | null
    /**
     * Filter, which Issue to fetch.
     */
    where: IssueWhereUniqueInput
  }

  /**
   * Issue findUniqueOrThrow
   */
  export type IssueFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueInclude<ExtArgs> | null
    /**
     * Filter, which Issue to fetch.
     */
    where: IssueWhereUniqueInput
  }

  /**
   * Issue findFirst
   */
  export type IssueFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueInclude<ExtArgs> | null
    /**
     * Filter, which Issue to fetch.
     */
    where?: IssueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Issues to fetch.
     */
    orderBy?: IssueOrderByWithRelationInput | IssueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Issues.
     */
    cursor?: IssueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Issues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Issues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Issues.
     */
    distinct?: IssueScalarFieldEnum | IssueScalarFieldEnum[]
  }

  /**
   * Issue findFirstOrThrow
   */
  export type IssueFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueInclude<ExtArgs> | null
    /**
     * Filter, which Issue to fetch.
     */
    where?: IssueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Issues to fetch.
     */
    orderBy?: IssueOrderByWithRelationInput | IssueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Issues.
     */
    cursor?: IssueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Issues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Issues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Issues.
     */
    distinct?: IssueScalarFieldEnum | IssueScalarFieldEnum[]
  }

  /**
   * Issue findMany
   */
  export type IssueFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueInclude<ExtArgs> | null
    /**
     * Filter, which Issues to fetch.
     */
    where?: IssueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Issues to fetch.
     */
    orderBy?: IssueOrderByWithRelationInput | IssueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Issues.
     */
    cursor?: IssueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Issues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Issues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Issues.
     */
    distinct?: IssueScalarFieldEnum | IssueScalarFieldEnum[]
  }

  /**
   * Issue create
   */
  export type IssueCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueInclude<ExtArgs> | null
    /**
     * The data needed to create a Issue.
     */
    data: XOR<IssueCreateInput, IssueUncheckedCreateInput>
  }

  /**
   * Issue createMany
   */
  export type IssueCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Issues.
     */
    data: IssueCreateManyInput | IssueCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Issue createManyAndReturn
   */
  export type IssueCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * The data used to create many Issues.
     */
    data: IssueCreateManyInput | IssueCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Issue update
   */
  export type IssueUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueInclude<ExtArgs> | null
    /**
     * The data needed to update a Issue.
     */
    data: XOR<IssueUpdateInput, IssueUncheckedUpdateInput>
    /**
     * Choose, which Issue to update.
     */
    where: IssueWhereUniqueInput
  }

  /**
   * Issue updateMany
   */
  export type IssueUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Issues.
     */
    data: XOR<IssueUpdateManyMutationInput, IssueUncheckedUpdateManyInput>
    /**
     * Filter which Issues to update
     */
    where?: IssueWhereInput
    /**
     * Limit how many Issues to update.
     */
    limit?: number
  }

  /**
   * Issue updateManyAndReturn
   */
  export type IssueUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * The data used to update Issues.
     */
    data: XOR<IssueUpdateManyMutationInput, IssueUncheckedUpdateManyInput>
    /**
     * Filter which Issues to update
     */
    where?: IssueWhereInput
    /**
     * Limit how many Issues to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Issue upsert
   */
  export type IssueUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueInclude<ExtArgs> | null
    /**
     * The filter to search for the Issue to update in case it exists.
     */
    where: IssueWhereUniqueInput
    /**
     * In case the Issue found by the `where` argument doesn't exist, create a new Issue with this data.
     */
    create: XOR<IssueCreateInput, IssueUncheckedCreateInput>
    /**
     * In case the Issue was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IssueUpdateInput, IssueUncheckedUpdateInput>
  }

  /**
   * Issue delete
   */
  export type IssueDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueInclude<ExtArgs> | null
    /**
     * Filter which Issue to delete.
     */
    where: IssueWhereUniqueInput
  }

  /**
   * Issue deleteMany
   */
  export type IssueDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Issues to delete
     */
    where?: IssueWhereInput
    /**
     * Limit how many Issues to delete.
     */
    limit?: number
  }

  /**
   * Issue.causedBy
   */
  export type Issue$causedByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    where?: CausalEdgeWhereInput
    orderBy?: CausalEdgeOrderByWithRelationInput | CausalEdgeOrderByWithRelationInput[]
    cursor?: CausalEdgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CausalEdgeScalarFieldEnum | CausalEdgeScalarFieldEnum[]
  }

  /**
   * Issue.causes
   */
  export type Issue$causesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    where?: CausalEdgeWhereInput
    orderBy?: CausalEdgeOrderByWithRelationInput | CausalEdgeOrderByWithRelationInput[]
    cursor?: CausalEdgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CausalEdgeScalarFieldEnum | CausalEdgeScalarFieldEnum[]
  }

  /**
   * Issue without action
   */
  export type IssueDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Issue
     */
    select?: IssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Issue
     */
    omit?: IssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IssueInclude<ExtArgs> | null
  }


  /**
   * Model CausalEdge
   */

  export type AggregateCausalEdge = {
    _count: CausalEdgeCountAggregateOutputType | null
    _min: CausalEdgeMinAggregateOutputType | null
    _max: CausalEdgeMaxAggregateOutputType | null
  }

  export type CausalEdgeMinAggregateOutputType = {
    id: string | null
    resultId: string | null
    fromIssueId: string | null
    toIssueId: string | null
    relationship: string | null
    confidence: string | null
    mechanism: string | null
    explanation: string | null
  }

  export type CausalEdgeMaxAggregateOutputType = {
    id: string | null
    resultId: string | null
    fromIssueId: string | null
    toIssueId: string | null
    relationship: string | null
    confidence: string | null
    mechanism: string | null
    explanation: string | null
  }

  export type CausalEdgeCountAggregateOutputType = {
    id: number
    resultId: number
    fromIssueId: number
    toIssueId: number
    relationship: number
    confidence: number
    mechanism: number
    explanation: number
    _all: number
  }


  export type CausalEdgeMinAggregateInputType = {
    id?: true
    resultId?: true
    fromIssueId?: true
    toIssueId?: true
    relationship?: true
    confidence?: true
    mechanism?: true
    explanation?: true
  }

  export type CausalEdgeMaxAggregateInputType = {
    id?: true
    resultId?: true
    fromIssueId?: true
    toIssueId?: true
    relationship?: true
    confidence?: true
    mechanism?: true
    explanation?: true
  }

  export type CausalEdgeCountAggregateInputType = {
    id?: true
    resultId?: true
    fromIssueId?: true
    toIssueId?: true
    relationship?: true
    confidence?: true
    mechanism?: true
    explanation?: true
    _all?: true
  }

  export type CausalEdgeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CausalEdge to aggregate.
     */
    where?: CausalEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CausalEdges to fetch.
     */
    orderBy?: CausalEdgeOrderByWithRelationInput | CausalEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CausalEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CausalEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CausalEdges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CausalEdges
    **/
    _count?: true | CausalEdgeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CausalEdgeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CausalEdgeMaxAggregateInputType
  }

  export type GetCausalEdgeAggregateType<T extends CausalEdgeAggregateArgs> = {
        [P in keyof T & keyof AggregateCausalEdge]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCausalEdge[P]>
      : GetScalarType<T[P], AggregateCausalEdge[P]>
  }




  export type CausalEdgeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CausalEdgeWhereInput
    orderBy?: CausalEdgeOrderByWithAggregationInput | CausalEdgeOrderByWithAggregationInput[]
    by: CausalEdgeScalarFieldEnum[] | CausalEdgeScalarFieldEnum
    having?: CausalEdgeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CausalEdgeCountAggregateInputType | true
    _min?: CausalEdgeMinAggregateInputType
    _max?: CausalEdgeMaxAggregateInputType
  }

  export type CausalEdgeGroupByOutputType = {
    id: string
    resultId: string
    fromIssueId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
    _count: CausalEdgeCountAggregateOutputType | null
    _min: CausalEdgeMinAggregateOutputType | null
    _max: CausalEdgeMaxAggregateOutputType | null
  }

  type GetCausalEdgeGroupByPayload<T extends CausalEdgeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CausalEdgeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CausalEdgeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CausalEdgeGroupByOutputType[P]>
            : GetScalarType<T[P], CausalEdgeGroupByOutputType[P]>
        }
      >
    >


  export type CausalEdgeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    resultId?: boolean
    fromIssueId?: boolean
    toIssueId?: boolean
    relationship?: boolean
    confidence?: boolean
    mechanism?: boolean
    explanation?: boolean
    result?: boolean | ResultDefaultArgs<ExtArgs>
    fromIssue?: boolean | IssueDefaultArgs<ExtArgs>
    toIssue?: boolean | IssueDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["causalEdge"]>

  export type CausalEdgeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    resultId?: boolean
    fromIssueId?: boolean
    toIssueId?: boolean
    relationship?: boolean
    confidence?: boolean
    mechanism?: boolean
    explanation?: boolean
    result?: boolean | ResultDefaultArgs<ExtArgs>
    fromIssue?: boolean | IssueDefaultArgs<ExtArgs>
    toIssue?: boolean | IssueDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["causalEdge"]>

  export type CausalEdgeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    resultId?: boolean
    fromIssueId?: boolean
    toIssueId?: boolean
    relationship?: boolean
    confidence?: boolean
    mechanism?: boolean
    explanation?: boolean
    result?: boolean | ResultDefaultArgs<ExtArgs>
    fromIssue?: boolean | IssueDefaultArgs<ExtArgs>
    toIssue?: boolean | IssueDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["causalEdge"]>

  export type CausalEdgeSelectScalar = {
    id?: boolean
    resultId?: boolean
    fromIssueId?: boolean
    toIssueId?: boolean
    relationship?: boolean
    confidence?: boolean
    mechanism?: boolean
    explanation?: boolean
  }

  export type CausalEdgeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "resultId" | "fromIssueId" | "toIssueId" | "relationship" | "confidence" | "mechanism" | "explanation", ExtArgs["result"]["causalEdge"]>
  export type CausalEdgeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    result?: boolean | ResultDefaultArgs<ExtArgs>
    fromIssue?: boolean | IssueDefaultArgs<ExtArgs>
    toIssue?: boolean | IssueDefaultArgs<ExtArgs>
  }
  export type CausalEdgeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    result?: boolean | ResultDefaultArgs<ExtArgs>
    fromIssue?: boolean | IssueDefaultArgs<ExtArgs>
    toIssue?: boolean | IssueDefaultArgs<ExtArgs>
  }
  export type CausalEdgeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    result?: boolean | ResultDefaultArgs<ExtArgs>
    fromIssue?: boolean | IssueDefaultArgs<ExtArgs>
    toIssue?: boolean | IssueDefaultArgs<ExtArgs>
  }

  export type $CausalEdgePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CausalEdge"
    objects: {
      result: Prisma.$ResultPayload<ExtArgs>
      fromIssue: Prisma.$IssuePayload<ExtArgs>
      toIssue: Prisma.$IssuePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      resultId: string
      fromIssueId: string
      toIssueId: string
      relationship: string
      confidence: string
      mechanism: string
      explanation: string
    }, ExtArgs["result"]["causalEdge"]>
    composites: {}
  }

  type CausalEdgeGetPayload<S extends boolean | null | undefined | CausalEdgeDefaultArgs> = $Result.GetResult<Prisma.$CausalEdgePayload, S>

  type CausalEdgeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CausalEdgeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CausalEdgeCountAggregateInputType | true
    }

  export interface CausalEdgeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CausalEdge'], meta: { name: 'CausalEdge' } }
    /**
     * Find zero or one CausalEdge that matches the filter.
     * @param {CausalEdgeFindUniqueArgs} args - Arguments to find a CausalEdge
     * @example
     * // Get one CausalEdge
     * const causalEdge = await prisma.causalEdge.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CausalEdgeFindUniqueArgs>(args: SelectSubset<T, CausalEdgeFindUniqueArgs<ExtArgs>>): Prisma__CausalEdgeClient<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CausalEdge that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CausalEdgeFindUniqueOrThrowArgs} args - Arguments to find a CausalEdge
     * @example
     * // Get one CausalEdge
     * const causalEdge = await prisma.causalEdge.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CausalEdgeFindUniqueOrThrowArgs>(args: SelectSubset<T, CausalEdgeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CausalEdgeClient<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CausalEdge that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CausalEdgeFindFirstArgs} args - Arguments to find a CausalEdge
     * @example
     * // Get one CausalEdge
     * const causalEdge = await prisma.causalEdge.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CausalEdgeFindFirstArgs>(args?: SelectSubset<T, CausalEdgeFindFirstArgs<ExtArgs>>): Prisma__CausalEdgeClient<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CausalEdge that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CausalEdgeFindFirstOrThrowArgs} args - Arguments to find a CausalEdge
     * @example
     * // Get one CausalEdge
     * const causalEdge = await prisma.causalEdge.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CausalEdgeFindFirstOrThrowArgs>(args?: SelectSubset<T, CausalEdgeFindFirstOrThrowArgs<ExtArgs>>): Prisma__CausalEdgeClient<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CausalEdges that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CausalEdgeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CausalEdges
     * const causalEdges = await prisma.causalEdge.findMany()
     * 
     * // Get first 10 CausalEdges
     * const causalEdges = await prisma.causalEdge.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const causalEdgeWithIdOnly = await prisma.causalEdge.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CausalEdgeFindManyArgs>(args?: SelectSubset<T, CausalEdgeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CausalEdge.
     * @param {CausalEdgeCreateArgs} args - Arguments to create a CausalEdge.
     * @example
     * // Create one CausalEdge
     * const CausalEdge = await prisma.causalEdge.create({
     *   data: {
     *     // ... data to create a CausalEdge
     *   }
     * })
     * 
     */
    create<T extends CausalEdgeCreateArgs>(args: SelectSubset<T, CausalEdgeCreateArgs<ExtArgs>>): Prisma__CausalEdgeClient<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CausalEdges.
     * @param {CausalEdgeCreateManyArgs} args - Arguments to create many CausalEdges.
     * @example
     * // Create many CausalEdges
     * const causalEdge = await prisma.causalEdge.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CausalEdgeCreateManyArgs>(args?: SelectSubset<T, CausalEdgeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CausalEdges and returns the data saved in the database.
     * @param {CausalEdgeCreateManyAndReturnArgs} args - Arguments to create many CausalEdges.
     * @example
     * // Create many CausalEdges
     * const causalEdge = await prisma.causalEdge.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CausalEdges and only return the `id`
     * const causalEdgeWithIdOnly = await prisma.causalEdge.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CausalEdgeCreateManyAndReturnArgs>(args?: SelectSubset<T, CausalEdgeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CausalEdge.
     * @param {CausalEdgeDeleteArgs} args - Arguments to delete one CausalEdge.
     * @example
     * // Delete one CausalEdge
     * const CausalEdge = await prisma.causalEdge.delete({
     *   where: {
     *     // ... filter to delete one CausalEdge
     *   }
     * })
     * 
     */
    delete<T extends CausalEdgeDeleteArgs>(args: SelectSubset<T, CausalEdgeDeleteArgs<ExtArgs>>): Prisma__CausalEdgeClient<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CausalEdge.
     * @param {CausalEdgeUpdateArgs} args - Arguments to update one CausalEdge.
     * @example
     * // Update one CausalEdge
     * const causalEdge = await prisma.causalEdge.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CausalEdgeUpdateArgs>(args: SelectSubset<T, CausalEdgeUpdateArgs<ExtArgs>>): Prisma__CausalEdgeClient<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CausalEdges.
     * @param {CausalEdgeDeleteManyArgs} args - Arguments to filter CausalEdges to delete.
     * @example
     * // Delete a few CausalEdges
     * const { count } = await prisma.causalEdge.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CausalEdgeDeleteManyArgs>(args?: SelectSubset<T, CausalEdgeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CausalEdges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CausalEdgeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CausalEdges
     * const causalEdge = await prisma.causalEdge.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CausalEdgeUpdateManyArgs>(args: SelectSubset<T, CausalEdgeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CausalEdges and returns the data updated in the database.
     * @param {CausalEdgeUpdateManyAndReturnArgs} args - Arguments to update many CausalEdges.
     * @example
     * // Update many CausalEdges
     * const causalEdge = await prisma.causalEdge.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CausalEdges and only return the `id`
     * const causalEdgeWithIdOnly = await prisma.causalEdge.updateManyAndReturn({
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
    updateManyAndReturn<T extends CausalEdgeUpdateManyAndReturnArgs>(args: SelectSubset<T, CausalEdgeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CausalEdge.
     * @param {CausalEdgeUpsertArgs} args - Arguments to update or create a CausalEdge.
     * @example
     * // Update or create a CausalEdge
     * const causalEdge = await prisma.causalEdge.upsert({
     *   create: {
     *     // ... data to create a CausalEdge
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CausalEdge we want to update
     *   }
     * })
     */
    upsert<T extends CausalEdgeUpsertArgs>(args: SelectSubset<T, CausalEdgeUpsertArgs<ExtArgs>>): Prisma__CausalEdgeClient<$Result.GetResult<Prisma.$CausalEdgePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CausalEdges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CausalEdgeCountArgs} args - Arguments to filter CausalEdges to count.
     * @example
     * // Count the number of CausalEdges
     * const count = await prisma.causalEdge.count({
     *   where: {
     *     // ... the filter for the CausalEdges we want to count
     *   }
     * })
    **/
    count<T extends CausalEdgeCountArgs>(
      args?: Subset<T, CausalEdgeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CausalEdgeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CausalEdge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CausalEdgeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CausalEdgeAggregateArgs>(args: Subset<T, CausalEdgeAggregateArgs>): Prisma.PrismaPromise<GetCausalEdgeAggregateType<T>>

    /**
     * Group by CausalEdge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CausalEdgeGroupByArgs} args - Group by arguments.
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
      T extends CausalEdgeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CausalEdgeGroupByArgs['orderBy'] }
        : { orderBy?: CausalEdgeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CausalEdgeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCausalEdgeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CausalEdge model
   */
  readonly fields: CausalEdgeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CausalEdge.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CausalEdgeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    result<T extends ResultDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ResultDefaultArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    fromIssue<T extends IssueDefaultArgs<ExtArgs> = {}>(args?: Subset<T, IssueDefaultArgs<ExtArgs>>): Prisma__IssueClient<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    toIssue<T extends IssueDefaultArgs<ExtArgs> = {}>(args?: Subset<T, IssueDefaultArgs<ExtArgs>>): Prisma__IssueClient<$Result.GetResult<Prisma.$IssuePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the CausalEdge model
   */
  interface CausalEdgeFieldRefs {
    readonly id: FieldRef<"CausalEdge", 'String'>
    readonly resultId: FieldRef<"CausalEdge", 'String'>
    readonly fromIssueId: FieldRef<"CausalEdge", 'String'>
    readonly toIssueId: FieldRef<"CausalEdge", 'String'>
    readonly relationship: FieldRef<"CausalEdge", 'String'>
    readonly confidence: FieldRef<"CausalEdge", 'String'>
    readonly mechanism: FieldRef<"CausalEdge", 'String'>
    readonly explanation: FieldRef<"CausalEdge", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CausalEdge findUnique
   */
  export type CausalEdgeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    /**
     * Filter, which CausalEdge to fetch.
     */
    where: CausalEdgeWhereUniqueInput
  }

  /**
   * CausalEdge findUniqueOrThrow
   */
  export type CausalEdgeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    /**
     * Filter, which CausalEdge to fetch.
     */
    where: CausalEdgeWhereUniqueInput
  }

  /**
   * CausalEdge findFirst
   */
  export type CausalEdgeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    /**
     * Filter, which CausalEdge to fetch.
     */
    where?: CausalEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CausalEdges to fetch.
     */
    orderBy?: CausalEdgeOrderByWithRelationInput | CausalEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CausalEdges.
     */
    cursor?: CausalEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CausalEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CausalEdges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CausalEdges.
     */
    distinct?: CausalEdgeScalarFieldEnum | CausalEdgeScalarFieldEnum[]
  }

  /**
   * CausalEdge findFirstOrThrow
   */
  export type CausalEdgeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    /**
     * Filter, which CausalEdge to fetch.
     */
    where?: CausalEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CausalEdges to fetch.
     */
    orderBy?: CausalEdgeOrderByWithRelationInput | CausalEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CausalEdges.
     */
    cursor?: CausalEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CausalEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CausalEdges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CausalEdges.
     */
    distinct?: CausalEdgeScalarFieldEnum | CausalEdgeScalarFieldEnum[]
  }

  /**
   * CausalEdge findMany
   */
  export type CausalEdgeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    /**
     * Filter, which CausalEdges to fetch.
     */
    where?: CausalEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CausalEdges to fetch.
     */
    orderBy?: CausalEdgeOrderByWithRelationInput | CausalEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CausalEdges.
     */
    cursor?: CausalEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CausalEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CausalEdges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CausalEdges.
     */
    distinct?: CausalEdgeScalarFieldEnum | CausalEdgeScalarFieldEnum[]
  }

  /**
   * CausalEdge create
   */
  export type CausalEdgeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    /**
     * The data needed to create a CausalEdge.
     */
    data: XOR<CausalEdgeCreateInput, CausalEdgeUncheckedCreateInput>
  }

  /**
   * CausalEdge createMany
   */
  export type CausalEdgeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CausalEdges.
     */
    data: CausalEdgeCreateManyInput | CausalEdgeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CausalEdge createManyAndReturn
   */
  export type CausalEdgeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * The data used to create many CausalEdges.
     */
    data: CausalEdgeCreateManyInput | CausalEdgeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CausalEdge update
   */
  export type CausalEdgeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    /**
     * The data needed to update a CausalEdge.
     */
    data: XOR<CausalEdgeUpdateInput, CausalEdgeUncheckedUpdateInput>
    /**
     * Choose, which CausalEdge to update.
     */
    where: CausalEdgeWhereUniqueInput
  }

  /**
   * CausalEdge updateMany
   */
  export type CausalEdgeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CausalEdges.
     */
    data: XOR<CausalEdgeUpdateManyMutationInput, CausalEdgeUncheckedUpdateManyInput>
    /**
     * Filter which CausalEdges to update
     */
    where?: CausalEdgeWhereInput
    /**
     * Limit how many CausalEdges to update.
     */
    limit?: number
  }

  /**
   * CausalEdge updateManyAndReturn
   */
  export type CausalEdgeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * The data used to update CausalEdges.
     */
    data: XOR<CausalEdgeUpdateManyMutationInput, CausalEdgeUncheckedUpdateManyInput>
    /**
     * Filter which CausalEdges to update
     */
    where?: CausalEdgeWhereInput
    /**
     * Limit how many CausalEdges to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CausalEdge upsert
   */
  export type CausalEdgeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    /**
     * The filter to search for the CausalEdge to update in case it exists.
     */
    where: CausalEdgeWhereUniqueInput
    /**
     * In case the CausalEdge found by the `where` argument doesn't exist, create a new CausalEdge with this data.
     */
    create: XOR<CausalEdgeCreateInput, CausalEdgeUncheckedCreateInput>
    /**
     * In case the CausalEdge was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CausalEdgeUpdateInput, CausalEdgeUncheckedUpdateInput>
  }

  /**
   * CausalEdge delete
   */
  export type CausalEdgeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
    /**
     * Filter which CausalEdge to delete.
     */
    where: CausalEdgeWhereUniqueInput
  }

  /**
   * CausalEdge deleteMany
   */
  export type CausalEdgeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CausalEdges to delete
     */
    where?: CausalEdgeWhereInput
    /**
     * Limit how many CausalEdges to delete.
     */
    limit?: number
  }

  /**
   * CausalEdge without action
   */
  export type CausalEdgeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CausalEdge
     */
    select?: CausalEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CausalEdge
     */
    omit?: CausalEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CausalEdgeInclude<ExtArgs> | null
  }


  /**
   * Model CrawledPage
   */

  export type AggregateCrawledPage = {
    _count: CrawledPageCountAggregateOutputType | null
    _avg: CrawledPageAvgAggregateOutputType | null
    _sum: CrawledPageSumAggregateOutputType | null
    _min: CrawledPageMinAggregateOutputType | null
    _max: CrawledPageMaxAggregateOutputType | null
  }

  export type CrawledPageAvgAggregateOutputType = {
    page_index: number | null
  }

  export type CrawledPageSumAggregateOutputType = {
    page_index: number | null
  }

  export type CrawledPageMinAggregateOutputType = {
    id: string | null
    resultId: string | null
    url: string | null
    page_index: number | null
    screenshot_url: string | null
    created_at: Date | null
  }

  export type CrawledPageMaxAggregateOutputType = {
    id: string | null
    resultId: string | null
    url: string | null
    page_index: number | null
    screenshot_url: string | null
    created_at: Date | null
  }

  export type CrawledPageCountAggregateOutputType = {
    id: number
    resultId: number
    url: number
    page_index: number
    narrative: number
    screenshot_url: number
    tech_stack: number
    created_at: number
    _all: number
  }


  export type CrawledPageAvgAggregateInputType = {
    page_index?: true
  }

  export type CrawledPageSumAggregateInputType = {
    page_index?: true
  }

  export type CrawledPageMinAggregateInputType = {
    id?: true
    resultId?: true
    url?: true
    page_index?: true
    screenshot_url?: true
    created_at?: true
  }

  export type CrawledPageMaxAggregateInputType = {
    id?: true
    resultId?: true
    url?: true
    page_index?: true
    screenshot_url?: true
    created_at?: true
  }

  export type CrawledPageCountAggregateInputType = {
    id?: true
    resultId?: true
    url?: true
    page_index?: true
    narrative?: true
    screenshot_url?: true
    tech_stack?: true
    created_at?: true
    _all?: true
  }

  export type CrawledPageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CrawledPage to aggregate.
     */
    where?: CrawledPageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPages to fetch.
     */
    orderBy?: CrawledPageOrderByWithRelationInput | CrawledPageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CrawledPageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CrawledPages
    **/
    _count?: true | CrawledPageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CrawledPageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CrawledPageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CrawledPageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CrawledPageMaxAggregateInputType
  }

  export type GetCrawledPageAggregateType<T extends CrawledPageAggregateArgs> = {
        [P in keyof T & keyof AggregateCrawledPage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCrawledPage[P]>
      : GetScalarType<T[P], AggregateCrawledPage[P]>
  }




  export type CrawledPageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CrawledPageWhereInput
    orderBy?: CrawledPageOrderByWithAggregationInput | CrawledPageOrderByWithAggregationInput[]
    by: CrawledPageScalarFieldEnum[] | CrawledPageScalarFieldEnum
    having?: CrawledPageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CrawledPageCountAggregateInputType | true
    _avg?: CrawledPageAvgAggregateInputType
    _sum?: CrawledPageSumAggregateInputType
    _min?: CrawledPageMinAggregateInputType
    _max?: CrawledPageMaxAggregateInputType
  }

  export type CrawledPageGroupByOutputType = {
    id: string
    resultId: string
    url: string
    page_index: number
    narrative: JsonValue
    screenshot_url: string | null
    tech_stack: JsonValue | null
    created_at: Date
    _count: CrawledPageCountAggregateOutputType | null
    _avg: CrawledPageAvgAggregateOutputType | null
    _sum: CrawledPageSumAggregateOutputType | null
    _min: CrawledPageMinAggregateOutputType | null
    _max: CrawledPageMaxAggregateOutputType | null
  }

  type GetCrawledPageGroupByPayload<T extends CrawledPageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CrawledPageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CrawledPageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CrawledPageGroupByOutputType[P]>
            : GetScalarType<T[P], CrawledPageGroupByOutputType[P]>
        }
      >
    >


  export type CrawledPageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    resultId?: boolean
    url?: boolean
    page_index?: boolean
    narrative?: boolean
    screenshot_url?: boolean
    tech_stack?: boolean
    created_at?: boolean
    result?: boolean | ResultDefaultArgs<ExtArgs>
    issues?: boolean | CrawledPage$issuesArgs<ExtArgs>
    edges?: boolean | CrawledPage$edgesArgs<ExtArgs>
    _count?: boolean | CrawledPageCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["crawledPage"]>

  export type CrawledPageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    resultId?: boolean
    url?: boolean
    page_index?: boolean
    narrative?: boolean
    screenshot_url?: boolean
    tech_stack?: boolean
    created_at?: boolean
    result?: boolean | ResultDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["crawledPage"]>

  export type CrawledPageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    resultId?: boolean
    url?: boolean
    page_index?: boolean
    narrative?: boolean
    screenshot_url?: boolean
    tech_stack?: boolean
    created_at?: boolean
    result?: boolean | ResultDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["crawledPage"]>

  export type CrawledPageSelectScalar = {
    id?: boolean
    resultId?: boolean
    url?: boolean
    page_index?: boolean
    narrative?: boolean
    screenshot_url?: boolean
    tech_stack?: boolean
    created_at?: boolean
  }

  export type CrawledPageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "resultId" | "url" | "page_index" | "narrative" | "screenshot_url" | "tech_stack" | "created_at", ExtArgs["result"]["crawledPage"]>
  export type CrawledPageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    result?: boolean | ResultDefaultArgs<ExtArgs>
    issues?: boolean | CrawledPage$issuesArgs<ExtArgs>
    edges?: boolean | CrawledPage$edgesArgs<ExtArgs>
    _count?: boolean | CrawledPageCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CrawledPageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    result?: boolean | ResultDefaultArgs<ExtArgs>
  }
  export type CrawledPageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    result?: boolean | ResultDefaultArgs<ExtArgs>
  }

  export type $CrawledPagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CrawledPage"
    objects: {
      result: Prisma.$ResultPayload<ExtArgs>
      issues: Prisma.$CrawledPageIssuePayload<ExtArgs>[]
      edges: Prisma.$CrawledPageEdgePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      resultId: string
      url: string
      page_index: number
      narrative: Prisma.JsonValue
      screenshot_url: string | null
      tech_stack: Prisma.JsonValue | null
      created_at: Date
    }, ExtArgs["result"]["crawledPage"]>
    composites: {}
  }

  type CrawledPageGetPayload<S extends boolean | null | undefined | CrawledPageDefaultArgs> = $Result.GetResult<Prisma.$CrawledPagePayload, S>

  type CrawledPageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CrawledPageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CrawledPageCountAggregateInputType | true
    }

  export interface CrawledPageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CrawledPage'], meta: { name: 'CrawledPage' } }
    /**
     * Find zero or one CrawledPage that matches the filter.
     * @param {CrawledPageFindUniqueArgs} args - Arguments to find a CrawledPage
     * @example
     * // Get one CrawledPage
     * const crawledPage = await prisma.crawledPage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CrawledPageFindUniqueArgs>(args: SelectSubset<T, CrawledPageFindUniqueArgs<ExtArgs>>): Prisma__CrawledPageClient<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CrawledPage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CrawledPageFindUniqueOrThrowArgs} args - Arguments to find a CrawledPage
     * @example
     * // Get one CrawledPage
     * const crawledPage = await prisma.crawledPage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CrawledPageFindUniqueOrThrowArgs>(args: SelectSubset<T, CrawledPageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CrawledPageClient<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CrawledPage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageFindFirstArgs} args - Arguments to find a CrawledPage
     * @example
     * // Get one CrawledPage
     * const crawledPage = await prisma.crawledPage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CrawledPageFindFirstArgs>(args?: SelectSubset<T, CrawledPageFindFirstArgs<ExtArgs>>): Prisma__CrawledPageClient<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CrawledPage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageFindFirstOrThrowArgs} args - Arguments to find a CrawledPage
     * @example
     * // Get one CrawledPage
     * const crawledPage = await prisma.crawledPage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CrawledPageFindFirstOrThrowArgs>(args?: SelectSubset<T, CrawledPageFindFirstOrThrowArgs<ExtArgs>>): Prisma__CrawledPageClient<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CrawledPages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CrawledPages
     * const crawledPages = await prisma.crawledPage.findMany()
     * 
     * // Get first 10 CrawledPages
     * const crawledPages = await prisma.crawledPage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const crawledPageWithIdOnly = await prisma.crawledPage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CrawledPageFindManyArgs>(args?: SelectSubset<T, CrawledPageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CrawledPage.
     * @param {CrawledPageCreateArgs} args - Arguments to create a CrawledPage.
     * @example
     * // Create one CrawledPage
     * const CrawledPage = await prisma.crawledPage.create({
     *   data: {
     *     // ... data to create a CrawledPage
     *   }
     * })
     * 
     */
    create<T extends CrawledPageCreateArgs>(args: SelectSubset<T, CrawledPageCreateArgs<ExtArgs>>): Prisma__CrawledPageClient<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CrawledPages.
     * @param {CrawledPageCreateManyArgs} args - Arguments to create many CrawledPages.
     * @example
     * // Create many CrawledPages
     * const crawledPage = await prisma.crawledPage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CrawledPageCreateManyArgs>(args?: SelectSubset<T, CrawledPageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CrawledPages and returns the data saved in the database.
     * @param {CrawledPageCreateManyAndReturnArgs} args - Arguments to create many CrawledPages.
     * @example
     * // Create many CrawledPages
     * const crawledPage = await prisma.crawledPage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CrawledPages and only return the `id`
     * const crawledPageWithIdOnly = await prisma.crawledPage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CrawledPageCreateManyAndReturnArgs>(args?: SelectSubset<T, CrawledPageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CrawledPage.
     * @param {CrawledPageDeleteArgs} args - Arguments to delete one CrawledPage.
     * @example
     * // Delete one CrawledPage
     * const CrawledPage = await prisma.crawledPage.delete({
     *   where: {
     *     // ... filter to delete one CrawledPage
     *   }
     * })
     * 
     */
    delete<T extends CrawledPageDeleteArgs>(args: SelectSubset<T, CrawledPageDeleteArgs<ExtArgs>>): Prisma__CrawledPageClient<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CrawledPage.
     * @param {CrawledPageUpdateArgs} args - Arguments to update one CrawledPage.
     * @example
     * // Update one CrawledPage
     * const crawledPage = await prisma.crawledPage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CrawledPageUpdateArgs>(args: SelectSubset<T, CrawledPageUpdateArgs<ExtArgs>>): Prisma__CrawledPageClient<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CrawledPages.
     * @param {CrawledPageDeleteManyArgs} args - Arguments to filter CrawledPages to delete.
     * @example
     * // Delete a few CrawledPages
     * const { count } = await prisma.crawledPage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CrawledPageDeleteManyArgs>(args?: SelectSubset<T, CrawledPageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CrawledPages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CrawledPages
     * const crawledPage = await prisma.crawledPage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CrawledPageUpdateManyArgs>(args: SelectSubset<T, CrawledPageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CrawledPages and returns the data updated in the database.
     * @param {CrawledPageUpdateManyAndReturnArgs} args - Arguments to update many CrawledPages.
     * @example
     * // Update many CrawledPages
     * const crawledPage = await prisma.crawledPage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CrawledPages and only return the `id`
     * const crawledPageWithIdOnly = await prisma.crawledPage.updateManyAndReturn({
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
    updateManyAndReturn<T extends CrawledPageUpdateManyAndReturnArgs>(args: SelectSubset<T, CrawledPageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CrawledPage.
     * @param {CrawledPageUpsertArgs} args - Arguments to update or create a CrawledPage.
     * @example
     * // Update or create a CrawledPage
     * const crawledPage = await prisma.crawledPage.upsert({
     *   create: {
     *     // ... data to create a CrawledPage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CrawledPage we want to update
     *   }
     * })
     */
    upsert<T extends CrawledPageUpsertArgs>(args: SelectSubset<T, CrawledPageUpsertArgs<ExtArgs>>): Prisma__CrawledPageClient<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CrawledPages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageCountArgs} args - Arguments to filter CrawledPages to count.
     * @example
     * // Count the number of CrawledPages
     * const count = await prisma.crawledPage.count({
     *   where: {
     *     // ... the filter for the CrawledPages we want to count
     *   }
     * })
    **/
    count<T extends CrawledPageCountArgs>(
      args?: Subset<T, CrawledPageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CrawledPageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CrawledPage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CrawledPageAggregateArgs>(args: Subset<T, CrawledPageAggregateArgs>): Prisma.PrismaPromise<GetCrawledPageAggregateType<T>>

    /**
     * Group by CrawledPage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageGroupByArgs} args - Group by arguments.
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
      T extends CrawledPageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CrawledPageGroupByArgs['orderBy'] }
        : { orderBy?: CrawledPageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CrawledPageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCrawledPageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CrawledPage model
   */
  readonly fields: CrawledPageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CrawledPage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CrawledPageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    result<T extends ResultDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ResultDefaultArgs<ExtArgs>>): Prisma__ResultClient<$Result.GetResult<Prisma.$ResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    issues<T extends CrawledPage$issuesArgs<ExtArgs> = {}>(args?: Subset<T, CrawledPage$issuesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    edges<T extends CrawledPage$edgesArgs<ExtArgs> = {}>(args?: Subset<T, CrawledPage$edgesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the CrawledPage model
   */
  interface CrawledPageFieldRefs {
    readonly id: FieldRef<"CrawledPage", 'String'>
    readonly resultId: FieldRef<"CrawledPage", 'String'>
    readonly url: FieldRef<"CrawledPage", 'String'>
    readonly page_index: FieldRef<"CrawledPage", 'Int'>
    readonly narrative: FieldRef<"CrawledPage", 'Json'>
    readonly screenshot_url: FieldRef<"CrawledPage", 'String'>
    readonly tech_stack: FieldRef<"CrawledPage", 'Json'>
    readonly created_at: FieldRef<"CrawledPage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CrawledPage findUnique
   */
  export type CrawledPageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPage to fetch.
     */
    where: CrawledPageWhereUniqueInput
  }

  /**
   * CrawledPage findUniqueOrThrow
   */
  export type CrawledPageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPage to fetch.
     */
    where: CrawledPageWhereUniqueInput
  }

  /**
   * CrawledPage findFirst
   */
  export type CrawledPageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPage to fetch.
     */
    where?: CrawledPageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPages to fetch.
     */
    orderBy?: CrawledPageOrderByWithRelationInput | CrawledPageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CrawledPages.
     */
    cursor?: CrawledPageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CrawledPages.
     */
    distinct?: CrawledPageScalarFieldEnum | CrawledPageScalarFieldEnum[]
  }

  /**
   * CrawledPage findFirstOrThrow
   */
  export type CrawledPageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPage to fetch.
     */
    where?: CrawledPageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPages to fetch.
     */
    orderBy?: CrawledPageOrderByWithRelationInput | CrawledPageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CrawledPages.
     */
    cursor?: CrawledPageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CrawledPages.
     */
    distinct?: CrawledPageScalarFieldEnum | CrawledPageScalarFieldEnum[]
  }

  /**
   * CrawledPage findMany
   */
  export type CrawledPageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPages to fetch.
     */
    where?: CrawledPageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPages to fetch.
     */
    orderBy?: CrawledPageOrderByWithRelationInput | CrawledPageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CrawledPages.
     */
    cursor?: CrawledPageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CrawledPages.
     */
    distinct?: CrawledPageScalarFieldEnum | CrawledPageScalarFieldEnum[]
  }

  /**
   * CrawledPage create
   */
  export type CrawledPageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageInclude<ExtArgs> | null
    /**
     * The data needed to create a CrawledPage.
     */
    data: XOR<CrawledPageCreateInput, CrawledPageUncheckedCreateInput>
  }

  /**
   * CrawledPage createMany
   */
  export type CrawledPageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CrawledPages.
     */
    data: CrawledPageCreateManyInput | CrawledPageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CrawledPage createManyAndReturn
   */
  export type CrawledPageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * The data used to create many CrawledPages.
     */
    data: CrawledPageCreateManyInput | CrawledPageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CrawledPage update
   */
  export type CrawledPageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageInclude<ExtArgs> | null
    /**
     * The data needed to update a CrawledPage.
     */
    data: XOR<CrawledPageUpdateInput, CrawledPageUncheckedUpdateInput>
    /**
     * Choose, which CrawledPage to update.
     */
    where: CrawledPageWhereUniqueInput
  }

  /**
   * CrawledPage updateMany
   */
  export type CrawledPageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CrawledPages.
     */
    data: XOR<CrawledPageUpdateManyMutationInput, CrawledPageUncheckedUpdateManyInput>
    /**
     * Filter which CrawledPages to update
     */
    where?: CrawledPageWhereInput
    /**
     * Limit how many CrawledPages to update.
     */
    limit?: number
  }

  /**
   * CrawledPage updateManyAndReturn
   */
  export type CrawledPageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * The data used to update CrawledPages.
     */
    data: XOR<CrawledPageUpdateManyMutationInput, CrawledPageUncheckedUpdateManyInput>
    /**
     * Filter which CrawledPages to update
     */
    where?: CrawledPageWhereInput
    /**
     * Limit how many CrawledPages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CrawledPage upsert
   */
  export type CrawledPageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageInclude<ExtArgs> | null
    /**
     * The filter to search for the CrawledPage to update in case it exists.
     */
    where: CrawledPageWhereUniqueInput
    /**
     * In case the CrawledPage found by the `where` argument doesn't exist, create a new CrawledPage with this data.
     */
    create: XOR<CrawledPageCreateInput, CrawledPageUncheckedCreateInput>
    /**
     * In case the CrawledPage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CrawledPageUpdateInput, CrawledPageUncheckedUpdateInput>
  }

  /**
   * CrawledPage delete
   */
  export type CrawledPageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageInclude<ExtArgs> | null
    /**
     * Filter which CrawledPage to delete.
     */
    where: CrawledPageWhereUniqueInput
  }

  /**
   * CrawledPage deleteMany
   */
  export type CrawledPageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CrawledPages to delete
     */
    where?: CrawledPageWhereInput
    /**
     * Limit how many CrawledPages to delete.
     */
    limit?: number
  }

  /**
   * CrawledPage.issues
   */
  export type CrawledPage$issuesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueInclude<ExtArgs> | null
    where?: CrawledPageIssueWhereInput
    orderBy?: CrawledPageIssueOrderByWithRelationInput | CrawledPageIssueOrderByWithRelationInput[]
    cursor?: CrawledPageIssueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CrawledPageIssueScalarFieldEnum | CrawledPageIssueScalarFieldEnum[]
  }

  /**
   * CrawledPage.edges
   */
  export type CrawledPage$edgesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    where?: CrawledPageEdgeWhereInput
    orderBy?: CrawledPageEdgeOrderByWithRelationInput | CrawledPageEdgeOrderByWithRelationInput[]
    cursor?: CrawledPageEdgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CrawledPageEdgeScalarFieldEnum | CrawledPageEdgeScalarFieldEnum[]
  }

  /**
   * CrawledPage without action
   */
  export type CrawledPageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPage
     */
    select?: CrawledPageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPage
     */
    omit?: CrawledPageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageInclude<ExtArgs> | null
  }


  /**
   * Model CrawledPageIssue
   */

  export type AggregateCrawledPageIssue = {
    _count: CrawledPageIssueCountAggregateOutputType | null
    _avg: CrawledPageIssueAvgAggregateOutputType | null
    _sum: CrawledPageIssueSumAggregateOutputType | null
    _min: CrawledPageIssueMinAggregateOutputType | null
    _max: CrawledPageIssueMaxAggregateOutputType | null
  }

  export type CrawledPageIssueAvgAggregateOutputType = {
    severity: number | null
  }

  export type CrawledPageIssueSumAggregateOutputType = {
    severity: number | null
  }

  export type CrawledPageIssueMinAggregateOutputType = {
    id: string | null
    crawledPageId: string | null
    category: string | null
    signal_source: string | null
    severity: number | null
    raw_evidence: string | null
    technical_description: string | null
    fix_suggestion: string | null
    severity_justification: string | null
  }

  export type CrawledPageIssueMaxAggregateOutputType = {
    id: string | null
    crawledPageId: string | null
    category: string | null
    signal_source: string | null
    severity: number | null
    raw_evidence: string | null
    technical_description: string | null
    fix_suggestion: string | null
    severity_justification: string | null
  }

  export type CrawledPageIssueCountAggregateOutputType = {
    id: number
    crawledPageId: number
    category: number
    signal_source: number
    severity: number
    raw_evidence: number
    technical_description: number
    fix_suggestion: number
    severity_justification: number
    _all: number
  }


  export type CrawledPageIssueAvgAggregateInputType = {
    severity?: true
  }

  export type CrawledPageIssueSumAggregateInputType = {
    severity?: true
  }

  export type CrawledPageIssueMinAggregateInputType = {
    id?: true
    crawledPageId?: true
    category?: true
    signal_source?: true
    severity?: true
    raw_evidence?: true
    technical_description?: true
    fix_suggestion?: true
    severity_justification?: true
  }

  export type CrawledPageIssueMaxAggregateInputType = {
    id?: true
    crawledPageId?: true
    category?: true
    signal_source?: true
    severity?: true
    raw_evidence?: true
    technical_description?: true
    fix_suggestion?: true
    severity_justification?: true
  }

  export type CrawledPageIssueCountAggregateInputType = {
    id?: true
    crawledPageId?: true
    category?: true
    signal_source?: true
    severity?: true
    raw_evidence?: true
    technical_description?: true
    fix_suggestion?: true
    severity_justification?: true
    _all?: true
  }

  export type CrawledPageIssueAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CrawledPageIssue to aggregate.
     */
    where?: CrawledPageIssueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPageIssues to fetch.
     */
    orderBy?: CrawledPageIssueOrderByWithRelationInput | CrawledPageIssueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CrawledPageIssueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPageIssues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPageIssues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CrawledPageIssues
    **/
    _count?: true | CrawledPageIssueCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CrawledPageIssueAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CrawledPageIssueSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CrawledPageIssueMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CrawledPageIssueMaxAggregateInputType
  }

  export type GetCrawledPageIssueAggregateType<T extends CrawledPageIssueAggregateArgs> = {
        [P in keyof T & keyof AggregateCrawledPageIssue]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCrawledPageIssue[P]>
      : GetScalarType<T[P], AggregateCrawledPageIssue[P]>
  }




  export type CrawledPageIssueGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CrawledPageIssueWhereInput
    orderBy?: CrawledPageIssueOrderByWithAggregationInput | CrawledPageIssueOrderByWithAggregationInput[]
    by: CrawledPageIssueScalarFieldEnum[] | CrawledPageIssueScalarFieldEnum
    having?: CrawledPageIssueScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CrawledPageIssueCountAggregateInputType | true
    _avg?: CrawledPageIssueAvgAggregateInputType
    _sum?: CrawledPageIssueSumAggregateInputType
    _min?: CrawledPageIssueMinAggregateInputType
    _max?: CrawledPageIssueMaxAggregateInputType
  }

  export type CrawledPageIssueGroupByOutputType = {
    id: string
    crawledPageId: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion: string
    severity_justification: string
    _count: CrawledPageIssueCountAggregateOutputType | null
    _avg: CrawledPageIssueAvgAggregateOutputType | null
    _sum: CrawledPageIssueSumAggregateOutputType | null
    _min: CrawledPageIssueMinAggregateOutputType | null
    _max: CrawledPageIssueMaxAggregateOutputType | null
  }

  type GetCrawledPageIssueGroupByPayload<T extends CrawledPageIssueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CrawledPageIssueGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CrawledPageIssueGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CrawledPageIssueGroupByOutputType[P]>
            : GetScalarType<T[P], CrawledPageIssueGroupByOutputType[P]>
        }
      >
    >


  export type CrawledPageIssueSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    crawledPageId?: boolean
    category?: boolean
    signal_source?: boolean
    severity?: boolean
    raw_evidence?: boolean
    technical_description?: boolean
    fix_suggestion?: boolean
    severity_justification?: boolean
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
    causedBy?: boolean | CrawledPageIssue$causedByArgs<ExtArgs>
    causes?: boolean | CrawledPageIssue$causesArgs<ExtArgs>
    _count?: boolean | CrawledPageIssueCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["crawledPageIssue"]>

  export type CrawledPageIssueSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    crawledPageId?: boolean
    category?: boolean
    signal_source?: boolean
    severity?: boolean
    raw_evidence?: boolean
    technical_description?: boolean
    fix_suggestion?: boolean
    severity_justification?: boolean
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["crawledPageIssue"]>

  export type CrawledPageIssueSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    crawledPageId?: boolean
    category?: boolean
    signal_source?: boolean
    severity?: boolean
    raw_evidence?: boolean
    technical_description?: boolean
    fix_suggestion?: boolean
    severity_justification?: boolean
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["crawledPageIssue"]>

  export type CrawledPageIssueSelectScalar = {
    id?: boolean
    crawledPageId?: boolean
    category?: boolean
    signal_source?: boolean
    severity?: boolean
    raw_evidence?: boolean
    technical_description?: boolean
    fix_suggestion?: boolean
    severity_justification?: boolean
  }

  export type CrawledPageIssueOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "crawledPageId" | "category" | "signal_source" | "severity" | "raw_evidence" | "technical_description" | "fix_suggestion" | "severity_justification", ExtArgs["result"]["crawledPageIssue"]>
  export type CrawledPageIssueInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
    causedBy?: boolean | CrawledPageIssue$causedByArgs<ExtArgs>
    causes?: boolean | CrawledPageIssue$causesArgs<ExtArgs>
    _count?: boolean | CrawledPageIssueCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CrawledPageIssueIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
  }
  export type CrawledPageIssueIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
  }

  export type $CrawledPageIssuePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CrawledPageIssue"
    objects: {
      crawledPage: Prisma.$CrawledPagePayload<ExtArgs>
      causedBy: Prisma.$CrawledPageEdgePayload<ExtArgs>[]
      causes: Prisma.$CrawledPageEdgePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      crawledPageId: string
      category: string
      signal_source: string
      severity: number
      raw_evidence: string
      technical_description: string
      fix_suggestion: string
      severity_justification: string
    }, ExtArgs["result"]["crawledPageIssue"]>
    composites: {}
  }

  type CrawledPageIssueGetPayload<S extends boolean | null | undefined | CrawledPageIssueDefaultArgs> = $Result.GetResult<Prisma.$CrawledPageIssuePayload, S>

  type CrawledPageIssueCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CrawledPageIssueFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CrawledPageIssueCountAggregateInputType | true
    }

  export interface CrawledPageIssueDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CrawledPageIssue'], meta: { name: 'CrawledPageIssue' } }
    /**
     * Find zero or one CrawledPageIssue that matches the filter.
     * @param {CrawledPageIssueFindUniqueArgs} args - Arguments to find a CrawledPageIssue
     * @example
     * // Get one CrawledPageIssue
     * const crawledPageIssue = await prisma.crawledPageIssue.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CrawledPageIssueFindUniqueArgs>(args: SelectSubset<T, CrawledPageIssueFindUniqueArgs<ExtArgs>>): Prisma__CrawledPageIssueClient<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CrawledPageIssue that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CrawledPageIssueFindUniqueOrThrowArgs} args - Arguments to find a CrawledPageIssue
     * @example
     * // Get one CrawledPageIssue
     * const crawledPageIssue = await prisma.crawledPageIssue.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CrawledPageIssueFindUniqueOrThrowArgs>(args: SelectSubset<T, CrawledPageIssueFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CrawledPageIssueClient<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CrawledPageIssue that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageIssueFindFirstArgs} args - Arguments to find a CrawledPageIssue
     * @example
     * // Get one CrawledPageIssue
     * const crawledPageIssue = await prisma.crawledPageIssue.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CrawledPageIssueFindFirstArgs>(args?: SelectSubset<T, CrawledPageIssueFindFirstArgs<ExtArgs>>): Prisma__CrawledPageIssueClient<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CrawledPageIssue that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageIssueFindFirstOrThrowArgs} args - Arguments to find a CrawledPageIssue
     * @example
     * // Get one CrawledPageIssue
     * const crawledPageIssue = await prisma.crawledPageIssue.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CrawledPageIssueFindFirstOrThrowArgs>(args?: SelectSubset<T, CrawledPageIssueFindFirstOrThrowArgs<ExtArgs>>): Prisma__CrawledPageIssueClient<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CrawledPageIssues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageIssueFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CrawledPageIssues
     * const crawledPageIssues = await prisma.crawledPageIssue.findMany()
     * 
     * // Get first 10 CrawledPageIssues
     * const crawledPageIssues = await prisma.crawledPageIssue.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const crawledPageIssueWithIdOnly = await prisma.crawledPageIssue.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CrawledPageIssueFindManyArgs>(args?: SelectSubset<T, CrawledPageIssueFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CrawledPageIssue.
     * @param {CrawledPageIssueCreateArgs} args - Arguments to create a CrawledPageIssue.
     * @example
     * // Create one CrawledPageIssue
     * const CrawledPageIssue = await prisma.crawledPageIssue.create({
     *   data: {
     *     // ... data to create a CrawledPageIssue
     *   }
     * })
     * 
     */
    create<T extends CrawledPageIssueCreateArgs>(args: SelectSubset<T, CrawledPageIssueCreateArgs<ExtArgs>>): Prisma__CrawledPageIssueClient<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CrawledPageIssues.
     * @param {CrawledPageIssueCreateManyArgs} args - Arguments to create many CrawledPageIssues.
     * @example
     * // Create many CrawledPageIssues
     * const crawledPageIssue = await prisma.crawledPageIssue.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CrawledPageIssueCreateManyArgs>(args?: SelectSubset<T, CrawledPageIssueCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CrawledPageIssues and returns the data saved in the database.
     * @param {CrawledPageIssueCreateManyAndReturnArgs} args - Arguments to create many CrawledPageIssues.
     * @example
     * // Create many CrawledPageIssues
     * const crawledPageIssue = await prisma.crawledPageIssue.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CrawledPageIssues and only return the `id`
     * const crawledPageIssueWithIdOnly = await prisma.crawledPageIssue.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CrawledPageIssueCreateManyAndReturnArgs>(args?: SelectSubset<T, CrawledPageIssueCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CrawledPageIssue.
     * @param {CrawledPageIssueDeleteArgs} args - Arguments to delete one CrawledPageIssue.
     * @example
     * // Delete one CrawledPageIssue
     * const CrawledPageIssue = await prisma.crawledPageIssue.delete({
     *   where: {
     *     // ... filter to delete one CrawledPageIssue
     *   }
     * })
     * 
     */
    delete<T extends CrawledPageIssueDeleteArgs>(args: SelectSubset<T, CrawledPageIssueDeleteArgs<ExtArgs>>): Prisma__CrawledPageIssueClient<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CrawledPageIssue.
     * @param {CrawledPageIssueUpdateArgs} args - Arguments to update one CrawledPageIssue.
     * @example
     * // Update one CrawledPageIssue
     * const crawledPageIssue = await prisma.crawledPageIssue.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CrawledPageIssueUpdateArgs>(args: SelectSubset<T, CrawledPageIssueUpdateArgs<ExtArgs>>): Prisma__CrawledPageIssueClient<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CrawledPageIssues.
     * @param {CrawledPageIssueDeleteManyArgs} args - Arguments to filter CrawledPageIssues to delete.
     * @example
     * // Delete a few CrawledPageIssues
     * const { count } = await prisma.crawledPageIssue.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CrawledPageIssueDeleteManyArgs>(args?: SelectSubset<T, CrawledPageIssueDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CrawledPageIssues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageIssueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CrawledPageIssues
     * const crawledPageIssue = await prisma.crawledPageIssue.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CrawledPageIssueUpdateManyArgs>(args: SelectSubset<T, CrawledPageIssueUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CrawledPageIssues and returns the data updated in the database.
     * @param {CrawledPageIssueUpdateManyAndReturnArgs} args - Arguments to update many CrawledPageIssues.
     * @example
     * // Update many CrawledPageIssues
     * const crawledPageIssue = await prisma.crawledPageIssue.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CrawledPageIssues and only return the `id`
     * const crawledPageIssueWithIdOnly = await prisma.crawledPageIssue.updateManyAndReturn({
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
    updateManyAndReturn<T extends CrawledPageIssueUpdateManyAndReturnArgs>(args: SelectSubset<T, CrawledPageIssueUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CrawledPageIssue.
     * @param {CrawledPageIssueUpsertArgs} args - Arguments to update or create a CrawledPageIssue.
     * @example
     * // Update or create a CrawledPageIssue
     * const crawledPageIssue = await prisma.crawledPageIssue.upsert({
     *   create: {
     *     // ... data to create a CrawledPageIssue
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CrawledPageIssue we want to update
     *   }
     * })
     */
    upsert<T extends CrawledPageIssueUpsertArgs>(args: SelectSubset<T, CrawledPageIssueUpsertArgs<ExtArgs>>): Prisma__CrawledPageIssueClient<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CrawledPageIssues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageIssueCountArgs} args - Arguments to filter CrawledPageIssues to count.
     * @example
     * // Count the number of CrawledPageIssues
     * const count = await prisma.crawledPageIssue.count({
     *   where: {
     *     // ... the filter for the CrawledPageIssues we want to count
     *   }
     * })
    **/
    count<T extends CrawledPageIssueCountArgs>(
      args?: Subset<T, CrawledPageIssueCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CrawledPageIssueCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CrawledPageIssue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageIssueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CrawledPageIssueAggregateArgs>(args: Subset<T, CrawledPageIssueAggregateArgs>): Prisma.PrismaPromise<GetCrawledPageIssueAggregateType<T>>

    /**
     * Group by CrawledPageIssue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageIssueGroupByArgs} args - Group by arguments.
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
      T extends CrawledPageIssueGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CrawledPageIssueGroupByArgs['orderBy'] }
        : { orderBy?: CrawledPageIssueGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CrawledPageIssueGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCrawledPageIssueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CrawledPageIssue model
   */
  readonly fields: CrawledPageIssueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CrawledPageIssue.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CrawledPageIssueClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    crawledPage<T extends CrawledPageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CrawledPageDefaultArgs<ExtArgs>>): Prisma__CrawledPageClient<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    causedBy<T extends CrawledPageIssue$causedByArgs<ExtArgs> = {}>(args?: Subset<T, CrawledPageIssue$causedByArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    causes<T extends CrawledPageIssue$causesArgs<ExtArgs> = {}>(args?: Subset<T, CrawledPageIssue$causesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the CrawledPageIssue model
   */
  interface CrawledPageIssueFieldRefs {
    readonly id: FieldRef<"CrawledPageIssue", 'String'>
    readonly crawledPageId: FieldRef<"CrawledPageIssue", 'String'>
    readonly category: FieldRef<"CrawledPageIssue", 'String'>
    readonly signal_source: FieldRef<"CrawledPageIssue", 'String'>
    readonly severity: FieldRef<"CrawledPageIssue", 'Int'>
    readonly raw_evidence: FieldRef<"CrawledPageIssue", 'String'>
    readonly technical_description: FieldRef<"CrawledPageIssue", 'String'>
    readonly fix_suggestion: FieldRef<"CrawledPageIssue", 'String'>
    readonly severity_justification: FieldRef<"CrawledPageIssue", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CrawledPageIssue findUnique
   */
  export type CrawledPageIssueFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPageIssue to fetch.
     */
    where: CrawledPageIssueWhereUniqueInput
  }

  /**
   * CrawledPageIssue findUniqueOrThrow
   */
  export type CrawledPageIssueFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPageIssue to fetch.
     */
    where: CrawledPageIssueWhereUniqueInput
  }

  /**
   * CrawledPageIssue findFirst
   */
  export type CrawledPageIssueFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPageIssue to fetch.
     */
    where?: CrawledPageIssueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPageIssues to fetch.
     */
    orderBy?: CrawledPageIssueOrderByWithRelationInput | CrawledPageIssueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CrawledPageIssues.
     */
    cursor?: CrawledPageIssueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPageIssues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPageIssues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CrawledPageIssues.
     */
    distinct?: CrawledPageIssueScalarFieldEnum | CrawledPageIssueScalarFieldEnum[]
  }

  /**
   * CrawledPageIssue findFirstOrThrow
   */
  export type CrawledPageIssueFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPageIssue to fetch.
     */
    where?: CrawledPageIssueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPageIssues to fetch.
     */
    orderBy?: CrawledPageIssueOrderByWithRelationInput | CrawledPageIssueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CrawledPageIssues.
     */
    cursor?: CrawledPageIssueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPageIssues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPageIssues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CrawledPageIssues.
     */
    distinct?: CrawledPageIssueScalarFieldEnum | CrawledPageIssueScalarFieldEnum[]
  }

  /**
   * CrawledPageIssue findMany
   */
  export type CrawledPageIssueFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPageIssues to fetch.
     */
    where?: CrawledPageIssueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPageIssues to fetch.
     */
    orderBy?: CrawledPageIssueOrderByWithRelationInput | CrawledPageIssueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CrawledPageIssues.
     */
    cursor?: CrawledPageIssueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPageIssues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPageIssues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CrawledPageIssues.
     */
    distinct?: CrawledPageIssueScalarFieldEnum | CrawledPageIssueScalarFieldEnum[]
  }

  /**
   * CrawledPageIssue create
   */
  export type CrawledPageIssueCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueInclude<ExtArgs> | null
    /**
     * The data needed to create a CrawledPageIssue.
     */
    data: XOR<CrawledPageIssueCreateInput, CrawledPageIssueUncheckedCreateInput>
  }

  /**
   * CrawledPageIssue createMany
   */
  export type CrawledPageIssueCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CrawledPageIssues.
     */
    data: CrawledPageIssueCreateManyInput | CrawledPageIssueCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CrawledPageIssue createManyAndReturn
   */
  export type CrawledPageIssueCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * The data used to create many CrawledPageIssues.
     */
    data: CrawledPageIssueCreateManyInput | CrawledPageIssueCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CrawledPageIssue update
   */
  export type CrawledPageIssueUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueInclude<ExtArgs> | null
    /**
     * The data needed to update a CrawledPageIssue.
     */
    data: XOR<CrawledPageIssueUpdateInput, CrawledPageIssueUncheckedUpdateInput>
    /**
     * Choose, which CrawledPageIssue to update.
     */
    where: CrawledPageIssueWhereUniqueInput
  }

  /**
   * CrawledPageIssue updateMany
   */
  export type CrawledPageIssueUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CrawledPageIssues.
     */
    data: XOR<CrawledPageIssueUpdateManyMutationInput, CrawledPageIssueUncheckedUpdateManyInput>
    /**
     * Filter which CrawledPageIssues to update
     */
    where?: CrawledPageIssueWhereInput
    /**
     * Limit how many CrawledPageIssues to update.
     */
    limit?: number
  }

  /**
   * CrawledPageIssue updateManyAndReturn
   */
  export type CrawledPageIssueUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * The data used to update CrawledPageIssues.
     */
    data: XOR<CrawledPageIssueUpdateManyMutationInput, CrawledPageIssueUncheckedUpdateManyInput>
    /**
     * Filter which CrawledPageIssues to update
     */
    where?: CrawledPageIssueWhereInput
    /**
     * Limit how many CrawledPageIssues to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CrawledPageIssue upsert
   */
  export type CrawledPageIssueUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueInclude<ExtArgs> | null
    /**
     * The filter to search for the CrawledPageIssue to update in case it exists.
     */
    where: CrawledPageIssueWhereUniqueInput
    /**
     * In case the CrawledPageIssue found by the `where` argument doesn't exist, create a new CrawledPageIssue with this data.
     */
    create: XOR<CrawledPageIssueCreateInput, CrawledPageIssueUncheckedCreateInput>
    /**
     * In case the CrawledPageIssue was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CrawledPageIssueUpdateInput, CrawledPageIssueUncheckedUpdateInput>
  }

  /**
   * CrawledPageIssue delete
   */
  export type CrawledPageIssueDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueInclude<ExtArgs> | null
    /**
     * Filter which CrawledPageIssue to delete.
     */
    where: CrawledPageIssueWhereUniqueInput
  }

  /**
   * CrawledPageIssue deleteMany
   */
  export type CrawledPageIssueDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CrawledPageIssues to delete
     */
    where?: CrawledPageIssueWhereInput
    /**
     * Limit how many CrawledPageIssues to delete.
     */
    limit?: number
  }

  /**
   * CrawledPageIssue.causedBy
   */
  export type CrawledPageIssue$causedByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    where?: CrawledPageEdgeWhereInput
    orderBy?: CrawledPageEdgeOrderByWithRelationInput | CrawledPageEdgeOrderByWithRelationInput[]
    cursor?: CrawledPageEdgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CrawledPageEdgeScalarFieldEnum | CrawledPageEdgeScalarFieldEnum[]
  }

  /**
   * CrawledPageIssue.causes
   */
  export type CrawledPageIssue$causesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    where?: CrawledPageEdgeWhereInput
    orderBy?: CrawledPageEdgeOrderByWithRelationInput | CrawledPageEdgeOrderByWithRelationInput[]
    cursor?: CrawledPageEdgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CrawledPageEdgeScalarFieldEnum | CrawledPageEdgeScalarFieldEnum[]
  }

  /**
   * CrawledPageIssue without action
   */
  export type CrawledPageIssueDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageIssue
     */
    select?: CrawledPageIssueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageIssue
     */
    omit?: CrawledPageIssueOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageIssueInclude<ExtArgs> | null
  }


  /**
   * Model CrawledPageEdge
   */

  export type AggregateCrawledPageEdge = {
    _count: CrawledPageEdgeCountAggregateOutputType | null
    _min: CrawledPageEdgeMinAggregateOutputType | null
    _max: CrawledPageEdgeMaxAggregateOutputType | null
  }

  export type CrawledPageEdgeMinAggregateOutputType = {
    id: string | null
    crawledPageId: string | null
    fromIssueId: string | null
    toIssueId: string | null
    relationship: string | null
    confidence: string | null
    mechanism: string | null
    explanation: string | null
  }

  export type CrawledPageEdgeMaxAggregateOutputType = {
    id: string | null
    crawledPageId: string | null
    fromIssueId: string | null
    toIssueId: string | null
    relationship: string | null
    confidence: string | null
    mechanism: string | null
    explanation: string | null
  }

  export type CrawledPageEdgeCountAggregateOutputType = {
    id: number
    crawledPageId: number
    fromIssueId: number
    toIssueId: number
    relationship: number
    confidence: number
    mechanism: number
    explanation: number
    _all: number
  }


  export type CrawledPageEdgeMinAggregateInputType = {
    id?: true
    crawledPageId?: true
    fromIssueId?: true
    toIssueId?: true
    relationship?: true
    confidence?: true
    mechanism?: true
    explanation?: true
  }

  export type CrawledPageEdgeMaxAggregateInputType = {
    id?: true
    crawledPageId?: true
    fromIssueId?: true
    toIssueId?: true
    relationship?: true
    confidence?: true
    mechanism?: true
    explanation?: true
  }

  export type CrawledPageEdgeCountAggregateInputType = {
    id?: true
    crawledPageId?: true
    fromIssueId?: true
    toIssueId?: true
    relationship?: true
    confidence?: true
    mechanism?: true
    explanation?: true
    _all?: true
  }

  export type CrawledPageEdgeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CrawledPageEdge to aggregate.
     */
    where?: CrawledPageEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPageEdges to fetch.
     */
    orderBy?: CrawledPageEdgeOrderByWithRelationInput | CrawledPageEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CrawledPageEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPageEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPageEdges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CrawledPageEdges
    **/
    _count?: true | CrawledPageEdgeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CrawledPageEdgeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CrawledPageEdgeMaxAggregateInputType
  }

  export type GetCrawledPageEdgeAggregateType<T extends CrawledPageEdgeAggregateArgs> = {
        [P in keyof T & keyof AggregateCrawledPageEdge]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCrawledPageEdge[P]>
      : GetScalarType<T[P], AggregateCrawledPageEdge[P]>
  }




  export type CrawledPageEdgeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CrawledPageEdgeWhereInput
    orderBy?: CrawledPageEdgeOrderByWithAggregationInput | CrawledPageEdgeOrderByWithAggregationInput[]
    by: CrawledPageEdgeScalarFieldEnum[] | CrawledPageEdgeScalarFieldEnum
    having?: CrawledPageEdgeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CrawledPageEdgeCountAggregateInputType | true
    _min?: CrawledPageEdgeMinAggregateInputType
    _max?: CrawledPageEdgeMaxAggregateInputType
  }

  export type CrawledPageEdgeGroupByOutputType = {
    id: string
    crawledPageId: string
    fromIssueId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
    _count: CrawledPageEdgeCountAggregateOutputType | null
    _min: CrawledPageEdgeMinAggregateOutputType | null
    _max: CrawledPageEdgeMaxAggregateOutputType | null
  }

  type GetCrawledPageEdgeGroupByPayload<T extends CrawledPageEdgeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CrawledPageEdgeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CrawledPageEdgeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CrawledPageEdgeGroupByOutputType[P]>
            : GetScalarType<T[P], CrawledPageEdgeGroupByOutputType[P]>
        }
      >
    >


  export type CrawledPageEdgeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    crawledPageId?: boolean
    fromIssueId?: boolean
    toIssueId?: boolean
    relationship?: boolean
    confidence?: boolean
    mechanism?: boolean
    explanation?: boolean
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
    fromIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
    toIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["crawledPageEdge"]>

  export type CrawledPageEdgeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    crawledPageId?: boolean
    fromIssueId?: boolean
    toIssueId?: boolean
    relationship?: boolean
    confidence?: boolean
    mechanism?: boolean
    explanation?: boolean
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
    fromIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
    toIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["crawledPageEdge"]>

  export type CrawledPageEdgeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    crawledPageId?: boolean
    fromIssueId?: boolean
    toIssueId?: boolean
    relationship?: boolean
    confidence?: boolean
    mechanism?: boolean
    explanation?: boolean
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
    fromIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
    toIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["crawledPageEdge"]>

  export type CrawledPageEdgeSelectScalar = {
    id?: boolean
    crawledPageId?: boolean
    fromIssueId?: boolean
    toIssueId?: boolean
    relationship?: boolean
    confidence?: boolean
    mechanism?: boolean
    explanation?: boolean
  }

  export type CrawledPageEdgeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "crawledPageId" | "fromIssueId" | "toIssueId" | "relationship" | "confidence" | "mechanism" | "explanation", ExtArgs["result"]["crawledPageEdge"]>
  export type CrawledPageEdgeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
    fromIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
    toIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
  }
  export type CrawledPageEdgeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
    fromIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
    toIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
  }
  export type CrawledPageEdgeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    crawledPage?: boolean | CrawledPageDefaultArgs<ExtArgs>
    fromIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
    toIssue?: boolean | CrawledPageIssueDefaultArgs<ExtArgs>
  }

  export type $CrawledPageEdgePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CrawledPageEdge"
    objects: {
      crawledPage: Prisma.$CrawledPagePayload<ExtArgs>
      fromIssue: Prisma.$CrawledPageIssuePayload<ExtArgs>
      toIssue: Prisma.$CrawledPageIssuePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      crawledPageId: string
      fromIssueId: string
      toIssueId: string
      relationship: string
      confidence: string
      mechanism: string
      explanation: string
    }, ExtArgs["result"]["crawledPageEdge"]>
    composites: {}
  }

  type CrawledPageEdgeGetPayload<S extends boolean | null | undefined | CrawledPageEdgeDefaultArgs> = $Result.GetResult<Prisma.$CrawledPageEdgePayload, S>

  type CrawledPageEdgeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CrawledPageEdgeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CrawledPageEdgeCountAggregateInputType | true
    }

  export interface CrawledPageEdgeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CrawledPageEdge'], meta: { name: 'CrawledPageEdge' } }
    /**
     * Find zero or one CrawledPageEdge that matches the filter.
     * @param {CrawledPageEdgeFindUniqueArgs} args - Arguments to find a CrawledPageEdge
     * @example
     * // Get one CrawledPageEdge
     * const crawledPageEdge = await prisma.crawledPageEdge.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CrawledPageEdgeFindUniqueArgs>(args: SelectSubset<T, CrawledPageEdgeFindUniqueArgs<ExtArgs>>): Prisma__CrawledPageEdgeClient<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CrawledPageEdge that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CrawledPageEdgeFindUniqueOrThrowArgs} args - Arguments to find a CrawledPageEdge
     * @example
     * // Get one CrawledPageEdge
     * const crawledPageEdge = await prisma.crawledPageEdge.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CrawledPageEdgeFindUniqueOrThrowArgs>(args: SelectSubset<T, CrawledPageEdgeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CrawledPageEdgeClient<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CrawledPageEdge that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageEdgeFindFirstArgs} args - Arguments to find a CrawledPageEdge
     * @example
     * // Get one CrawledPageEdge
     * const crawledPageEdge = await prisma.crawledPageEdge.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CrawledPageEdgeFindFirstArgs>(args?: SelectSubset<T, CrawledPageEdgeFindFirstArgs<ExtArgs>>): Prisma__CrawledPageEdgeClient<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CrawledPageEdge that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageEdgeFindFirstOrThrowArgs} args - Arguments to find a CrawledPageEdge
     * @example
     * // Get one CrawledPageEdge
     * const crawledPageEdge = await prisma.crawledPageEdge.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CrawledPageEdgeFindFirstOrThrowArgs>(args?: SelectSubset<T, CrawledPageEdgeFindFirstOrThrowArgs<ExtArgs>>): Prisma__CrawledPageEdgeClient<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CrawledPageEdges that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageEdgeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CrawledPageEdges
     * const crawledPageEdges = await prisma.crawledPageEdge.findMany()
     * 
     * // Get first 10 CrawledPageEdges
     * const crawledPageEdges = await prisma.crawledPageEdge.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const crawledPageEdgeWithIdOnly = await prisma.crawledPageEdge.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CrawledPageEdgeFindManyArgs>(args?: SelectSubset<T, CrawledPageEdgeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CrawledPageEdge.
     * @param {CrawledPageEdgeCreateArgs} args - Arguments to create a CrawledPageEdge.
     * @example
     * // Create one CrawledPageEdge
     * const CrawledPageEdge = await prisma.crawledPageEdge.create({
     *   data: {
     *     // ... data to create a CrawledPageEdge
     *   }
     * })
     * 
     */
    create<T extends CrawledPageEdgeCreateArgs>(args: SelectSubset<T, CrawledPageEdgeCreateArgs<ExtArgs>>): Prisma__CrawledPageEdgeClient<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CrawledPageEdges.
     * @param {CrawledPageEdgeCreateManyArgs} args - Arguments to create many CrawledPageEdges.
     * @example
     * // Create many CrawledPageEdges
     * const crawledPageEdge = await prisma.crawledPageEdge.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CrawledPageEdgeCreateManyArgs>(args?: SelectSubset<T, CrawledPageEdgeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CrawledPageEdges and returns the data saved in the database.
     * @param {CrawledPageEdgeCreateManyAndReturnArgs} args - Arguments to create many CrawledPageEdges.
     * @example
     * // Create many CrawledPageEdges
     * const crawledPageEdge = await prisma.crawledPageEdge.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CrawledPageEdges and only return the `id`
     * const crawledPageEdgeWithIdOnly = await prisma.crawledPageEdge.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CrawledPageEdgeCreateManyAndReturnArgs>(args?: SelectSubset<T, CrawledPageEdgeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CrawledPageEdge.
     * @param {CrawledPageEdgeDeleteArgs} args - Arguments to delete one CrawledPageEdge.
     * @example
     * // Delete one CrawledPageEdge
     * const CrawledPageEdge = await prisma.crawledPageEdge.delete({
     *   where: {
     *     // ... filter to delete one CrawledPageEdge
     *   }
     * })
     * 
     */
    delete<T extends CrawledPageEdgeDeleteArgs>(args: SelectSubset<T, CrawledPageEdgeDeleteArgs<ExtArgs>>): Prisma__CrawledPageEdgeClient<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CrawledPageEdge.
     * @param {CrawledPageEdgeUpdateArgs} args - Arguments to update one CrawledPageEdge.
     * @example
     * // Update one CrawledPageEdge
     * const crawledPageEdge = await prisma.crawledPageEdge.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CrawledPageEdgeUpdateArgs>(args: SelectSubset<T, CrawledPageEdgeUpdateArgs<ExtArgs>>): Prisma__CrawledPageEdgeClient<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CrawledPageEdges.
     * @param {CrawledPageEdgeDeleteManyArgs} args - Arguments to filter CrawledPageEdges to delete.
     * @example
     * // Delete a few CrawledPageEdges
     * const { count } = await prisma.crawledPageEdge.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CrawledPageEdgeDeleteManyArgs>(args?: SelectSubset<T, CrawledPageEdgeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CrawledPageEdges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageEdgeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CrawledPageEdges
     * const crawledPageEdge = await prisma.crawledPageEdge.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CrawledPageEdgeUpdateManyArgs>(args: SelectSubset<T, CrawledPageEdgeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CrawledPageEdges and returns the data updated in the database.
     * @param {CrawledPageEdgeUpdateManyAndReturnArgs} args - Arguments to update many CrawledPageEdges.
     * @example
     * // Update many CrawledPageEdges
     * const crawledPageEdge = await prisma.crawledPageEdge.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CrawledPageEdges and only return the `id`
     * const crawledPageEdgeWithIdOnly = await prisma.crawledPageEdge.updateManyAndReturn({
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
    updateManyAndReturn<T extends CrawledPageEdgeUpdateManyAndReturnArgs>(args: SelectSubset<T, CrawledPageEdgeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CrawledPageEdge.
     * @param {CrawledPageEdgeUpsertArgs} args - Arguments to update or create a CrawledPageEdge.
     * @example
     * // Update or create a CrawledPageEdge
     * const crawledPageEdge = await prisma.crawledPageEdge.upsert({
     *   create: {
     *     // ... data to create a CrawledPageEdge
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CrawledPageEdge we want to update
     *   }
     * })
     */
    upsert<T extends CrawledPageEdgeUpsertArgs>(args: SelectSubset<T, CrawledPageEdgeUpsertArgs<ExtArgs>>): Prisma__CrawledPageEdgeClient<$Result.GetResult<Prisma.$CrawledPageEdgePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CrawledPageEdges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageEdgeCountArgs} args - Arguments to filter CrawledPageEdges to count.
     * @example
     * // Count the number of CrawledPageEdges
     * const count = await prisma.crawledPageEdge.count({
     *   where: {
     *     // ... the filter for the CrawledPageEdges we want to count
     *   }
     * })
    **/
    count<T extends CrawledPageEdgeCountArgs>(
      args?: Subset<T, CrawledPageEdgeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CrawledPageEdgeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CrawledPageEdge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageEdgeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CrawledPageEdgeAggregateArgs>(args: Subset<T, CrawledPageEdgeAggregateArgs>): Prisma.PrismaPromise<GetCrawledPageEdgeAggregateType<T>>

    /**
     * Group by CrawledPageEdge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CrawledPageEdgeGroupByArgs} args - Group by arguments.
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
      T extends CrawledPageEdgeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CrawledPageEdgeGroupByArgs['orderBy'] }
        : { orderBy?: CrawledPageEdgeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, CrawledPageEdgeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCrawledPageEdgeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CrawledPageEdge model
   */
  readonly fields: CrawledPageEdgeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CrawledPageEdge.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CrawledPageEdgeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    crawledPage<T extends CrawledPageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CrawledPageDefaultArgs<ExtArgs>>): Prisma__CrawledPageClient<$Result.GetResult<Prisma.$CrawledPagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    fromIssue<T extends CrawledPageIssueDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CrawledPageIssueDefaultArgs<ExtArgs>>): Prisma__CrawledPageIssueClient<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    toIssue<T extends CrawledPageIssueDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CrawledPageIssueDefaultArgs<ExtArgs>>): Prisma__CrawledPageIssueClient<$Result.GetResult<Prisma.$CrawledPageIssuePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the CrawledPageEdge model
   */
  interface CrawledPageEdgeFieldRefs {
    readonly id: FieldRef<"CrawledPageEdge", 'String'>
    readonly crawledPageId: FieldRef<"CrawledPageEdge", 'String'>
    readonly fromIssueId: FieldRef<"CrawledPageEdge", 'String'>
    readonly toIssueId: FieldRef<"CrawledPageEdge", 'String'>
    readonly relationship: FieldRef<"CrawledPageEdge", 'String'>
    readonly confidence: FieldRef<"CrawledPageEdge", 'String'>
    readonly mechanism: FieldRef<"CrawledPageEdge", 'String'>
    readonly explanation: FieldRef<"CrawledPageEdge", 'String'>
  }
    

  // Custom InputTypes
  /**
   * CrawledPageEdge findUnique
   */
  export type CrawledPageEdgeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPageEdge to fetch.
     */
    where: CrawledPageEdgeWhereUniqueInput
  }

  /**
   * CrawledPageEdge findUniqueOrThrow
   */
  export type CrawledPageEdgeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPageEdge to fetch.
     */
    where: CrawledPageEdgeWhereUniqueInput
  }

  /**
   * CrawledPageEdge findFirst
   */
  export type CrawledPageEdgeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPageEdge to fetch.
     */
    where?: CrawledPageEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPageEdges to fetch.
     */
    orderBy?: CrawledPageEdgeOrderByWithRelationInput | CrawledPageEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CrawledPageEdges.
     */
    cursor?: CrawledPageEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPageEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPageEdges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CrawledPageEdges.
     */
    distinct?: CrawledPageEdgeScalarFieldEnum | CrawledPageEdgeScalarFieldEnum[]
  }

  /**
   * CrawledPageEdge findFirstOrThrow
   */
  export type CrawledPageEdgeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPageEdge to fetch.
     */
    where?: CrawledPageEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPageEdges to fetch.
     */
    orderBy?: CrawledPageEdgeOrderByWithRelationInput | CrawledPageEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CrawledPageEdges.
     */
    cursor?: CrawledPageEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPageEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPageEdges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CrawledPageEdges.
     */
    distinct?: CrawledPageEdgeScalarFieldEnum | CrawledPageEdgeScalarFieldEnum[]
  }

  /**
   * CrawledPageEdge findMany
   */
  export type CrawledPageEdgeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    /**
     * Filter, which CrawledPageEdges to fetch.
     */
    where?: CrawledPageEdgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CrawledPageEdges to fetch.
     */
    orderBy?: CrawledPageEdgeOrderByWithRelationInput | CrawledPageEdgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CrawledPageEdges.
     */
    cursor?: CrawledPageEdgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CrawledPageEdges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CrawledPageEdges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CrawledPageEdges.
     */
    distinct?: CrawledPageEdgeScalarFieldEnum | CrawledPageEdgeScalarFieldEnum[]
  }

  /**
   * CrawledPageEdge create
   */
  export type CrawledPageEdgeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    /**
     * The data needed to create a CrawledPageEdge.
     */
    data: XOR<CrawledPageEdgeCreateInput, CrawledPageEdgeUncheckedCreateInput>
  }

  /**
   * CrawledPageEdge createMany
   */
  export type CrawledPageEdgeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CrawledPageEdges.
     */
    data: CrawledPageEdgeCreateManyInput | CrawledPageEdgeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CrawledPageEdge createManyAndReturn
   */
  export type CrawledPageEdgeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * The data used to create many CrawledPageEdges.
     */
    data: CrawledPageEdgeCreateManyInput | CrawledPageEdgeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CrawledPageEdge update
   */
  export type CrawledPageEdgeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    /**
     * The data needed to update a CrawledPageEdge.
     */
    data: XOR<CrawledPageEdgeUpdateInput, CrawledPageEdgeUncheckedUpdateInput>
    /**
     * Choose, which CrawledPageEdge to update.
     */
    where: CrawledPageEdgeWhereUniqueInput
  }

  /**
   * CrawledPageEdge updateMany
   */
  export type CrawledPageEdgeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CrawledPageEdges.
     */
    data: XOR<CrawledPageEdgeUpdateManyMutationInput, CrawledPageEdgeUncheckedUpdateManyInput>
    /**
     * Filter which CrawledPageEdges to update
     */
    where?: CrawledPageEdgeWhereInput
    /**
     * Limit how many CrawledPageEdges to update.
     */
    limit?: number
  }

  /**
   * CrawledPageEdge updateManyAndReturn
   */
  export type CrawledPageEdgeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * The data used to update CrawledPageEdges.
     */
    data: XOR<CrawledPageEdgeUpdateManyMutationInput, CrawledPageEdgeUncheckedUpdateManyInput>
    /**
     * Filter which CrawledPageEdges to update
     */
    where?: CrawledPageEdgeWhereInput
    /**
     * Limit how many CrawledPageEdges to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CrawledPageEdge upsert
   */
  export type CrawledPageEdgeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    /**
     * The filter to search for the CrawledPageEdge to update in case it exists.
     */
    where: CrawledPageEdgeWhereUniqueInput
    /**
     * In case the CrawledPageEdge found by the `where` argument doesn't exist, create a new CrawledPageEdge with this data.
     */
    create: XOR<CrawledPageEdgeCreateInput, CrawledPageEdgeUncheckedCreateInput>
    /**
     * In case the CrawledPageEdge was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CrawledPageEdgeUpdateInput, CrawledPageEdgeUncheckedUpdateInput>
  }

  /**
   * CrawledPageEdge delete
   */
  export type CrawledPageEdgeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
    /**
     * Filter which CrawledPageEdge to delete.
     */
    where: CrawledPageEdgeWhereUniqueInput
  }

  /**
   * CrawledPageEdge deleteMany
   */
  export type CrawledPageEdgeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CrawledPageEdges to delete
     */
    where?: CrawledPageEdgeWhereInput
    /**
     * Limit how many CrawledPageEdges to delete.
     */
    limit?: number
  }

  /**
   * CrawledPageEdge without action
   */
  export type CrawledPageEdgeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CrawledPageEdge
     */
    select?: CrawledPageEdgeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CrawledPageEdge
     */
    omit?: CrawledPageEdgeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CrawledPageEdgeInclude<ExtArgs> | null
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


  export const JobScalarFieldEnum: {
    id: 'id',
    url: 'url',
    status: 'status',
    error_message: 'error_message',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type JobScalarFieldEnum = (typeof JobScalarFieldEnum)[keyof typeof JobScalarFieldEnum]


  export const ResultScalarFieldEnum: {
    id: 'id',
    jobId: 'jobId',
    narrative: 'narrative',
    screenshot_url: 'screenshot_url',
    tech_stack: 'tech_stack',
    cross_page_patterns: 'cross_page_patterns',
    created_at: 'created_at'
  };

  export type ResultScalarFieldEnum = (typeof ResultScalarFieldEnum)[keyof typeof ResultScalarFieldEnum]


  export const IssueScalarFieldEnum: {
    id: 'id',
    resultId: 'resultId',
    category: 'category',
    signal_source: 'signal_source',
    severity: 'severity',
    raw_evidence: 'raw_evidence',
    technical_description: 'technical_description',
    fix_suggestion: 'fix_suggestion',
    severity_justification: 'severity_justification'
  };

  export type IssueScalarFieldEnum = (typeof IssueScalarFieldEnum)[keyof typeof IssueScalarFieldEnum]


  export const CausalEdgeScalarFieldEnum: {
    id: 'id',
    resultId: 'resultId',
    fromIssueId: 'fromIssueId',
    toIssueId: 'toIssueId',
    relationship: 'relationship',
    confidence: 'confidence',
    mechanism: 'mechanism',
    explanation: 'explanation'
  };

  export type CausalEdgeScalarFieldEnum = (typeof CausalEdgeScalarFieldEnum)[keyof typeof CausalEdgeScalarFieldEnum]


  export const CrawledPageScalarFieldEnum: {
    id: 'id',
    resultId: 'resultId',
    url: 'url',
    page_index: 'page_index',
    narrative: 'narrative',
    screenshot_url: 'screenshot_url',
    tech_stack: 'tech_stack',
    created_at: 'created_at'
  };

  export type CrawledPageScalarFieldEnum = (typeof CrawledPageScalarFieldEnum)[keyof typeof CrawledPageScalarFieldEnum]


  export const CrawledPageIssueScalarFieldEnum: {
    id: 'id',
    crawledPageId: 'crawledPageId',
    category: 'category',
    signal_source: 'signal_source',
    severity: 'severity',
    raw_evidence: 'raw_evidence',
    technical_description: 'technical_description',
    fix_suggestion: 'fix_suggestion',
    severity_justification: 'severity_justification'
  };

  export type CrawledPageIssueScalarFieldEnum = (typeof CrawledPageIssueScalarFieldEnum)[keyof typeof CrawledPageIssueScalarFieldEnum]


  export const CrawledPageEdgeScalarFieldEnum: {
    id: 'id',
    crawledPageId: 'crawledPageId',
    fromIssueId: 'fromIssueId',
    toIssueId: 'toIssueId',
    relationship: 'relationship',
    confidence: 'confidence',
    mechanism: 'mechanism',
    explanation: 'explanation'
  };

  export type CrawledPageEdgeScalarFieldEnum = (typeof CrawledPageEdgeScalarFieldEnum)[keyof typeof CrawledPageEdgeScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


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
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'JobStatus'
   */
  export type EnumJobStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobStatus'>
    


  /**
   * Reference to a field of type 'JobStatus[]'
   */
  export type ListEnumJobStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'JobStatus[]'>
    


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
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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


  export type JobWhereInput = {
    AND?: JobWhereInput | JobWhereInput[]
    OR?: JobWhereInput[]
    NOT?: JobWhereInput | JobWhereInput[]
    id?: StringFilter<"Job"> | string
    url?: StringFilter<"Job"> | string
    status?: EnumJobStatusFilter<"Job"> | $Enums.JobStatus
    error_message?: StringNullableFilter<"Job"> | string | null
    created_at?: DateTimeFilter<"Job"> | Date | string
    updated_at?: DateTimeFilter<"Job"> | Date | string
    result?: XOR<ResultNullableScalarRelationFilter, ResultWhereInput> | null
  }

  export type JobOrderByWithRelationInput = {
    id?: SortOrder
    url?: SortOrder
    status?: SortOrder
    error_message?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    result?: ResultOrderByWithRelationInput
  }

  export type JobWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: JobWhereInput | JobWhereInput[]
    OR?: JobWhereInput[]
    NOT?: JobWhereInput | JobWhereInput[]
    url?: StringFilter<"Job"> | string
    status?: EnumJobStatusFilter<"Job"> | $Enums.JobStatus
    error_message?: StringNullableFilter<"Job"> | string | null
    created_at?: DateTimeFilter<"Job"> | Date | string
    updated_at?: DateTimeFilter<"Job"> | Date | string
    result?: XOR<ResultNullableScalarRelationFilter, ResultWhereInput> | null
  }, "id">

  export type JobOrderByWithAggregationInput = {
    id?: SortOrder
    url?: SortOrder
    status?: SortOrder
    error_message?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: JobCountOrderByAggregateInput
    _max?: JobMaxOrderByAggregateInput
    _min?: JobMinOrderByAggregateInput
  }

  export type JobScalarWhereWithAggregatesInput = {
    AND?: JobScalarWhereWithAggregatesInput | JobScalarWhereWithAggregatesInput[]
    OR?: JobScalarWhereWithAggregatesInput[]
    NOT?: JobScalarWhereWithAggregatesInput | JobScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Job"> | string
    url?: StringWithAggregatesFilter<"Job"> | string
    status?: EnumJobStatusWithAggregatesFilter<"Job"> | $Enums.JobStatus
    error_message?: StringNullableWithAggregatesFilter<"Job"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"Job"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Job"> | Date | string
  }

  export type ResultWhereInput = {
    AND?: ResultWhereInput | ResultWhereInput[]
    OR?: ResultWhereInput[]
    NOT?: ResultWhereInput | ResultWhereInput[]
    id?: StringFilter<"Result"> | string
    jobId?: StringFilter<"Result"> | string
    narrative?: JsonFilter<"Result">
    screenshot_url?: StringNullableFilter<"Result"> | string | null
    tech_stack?: JsonNullableFilter<"Result">
    cross_page_patterns?: JsonNullableFilter<"Result">
    created_at?: DateTimeFilter<"Result"> | Date | string
    job?: XOR<JobScalarRelationFilter, JobWhereInput>
    issues?: IssueListRelationFilter
    edges?: CausalEdgeListRelationFilter
    crawledPages?: CrawledPageListRelationFilter
  }

  export type ResultOrderByWithRelationInput = {
    id?: SortOrder
    jobId?: SortOrder
    narrative?: SortOrder
    screenshot_url?: SortOrderInput | SortOrder
    tech_stack?: SortOrderInput | SortOrder
    cross_page_patterns?: SortOrderInput | SortOrder
    created_at?: SortOrder
    job?: JobOrderByWithRelationInput
    issues?: IssueOrderByRelationAggregateInput
    edges?: CausalEdgeOrderByRelationAggregateInput
    crawledPages?: CrawledPageOrderByRelationAggregateInput
  }

  export type ResultWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    jobId?: string
    AND?: ResultWhereInput | ResultWhereInput[]
    OR?: ResultWhereInput[]
    NOT?: ResultWhereInput | ResultWhereInput[]
    narrative?: JsonFilter<"Result">
    screenshot_url?: StringNullableFilter<"Result"> | string | null
    tech_stack?: JsonNullableFilter<"Result">
    cross_page_patterns?: JsonNullableFilter<"Result">
    created_at?: DateTimeFilter<"Result"> | Date | string
    job?: XOR<JobScalarRelationFilter, JobWhereInput>
    issues?: IssueListRelationFilter
    edges?: CausalEdgeListRelationFilter
    crawledPages?: CrawledPageListRelationFilter
  }, "id" | "jobId">

  export type ResultOrderByWithAggregationInput = {
    id?: SortOrder
    jobId?: SortOrder
    narrative?: SortOrder
    screenshot_url?: SortOrderInput | SortOrder
    tech_stack?: SortOrderInput | SortOrder
    cross_page_patterns?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: ResultCountOrderByAggregateInput
    _max?: ResultMaxOrderByAggregateInput
    _min?: ResultMinOrderByAggregateInput
  }

  export type ResultScalarWhereWithAggregatesInput = {
    AND?: ResultScalarWhereWithAggregatesInput | ResultScalarWhereWithAggregatesInput[]
    OR?: ResultScalarWhereWithAggregatesInput[]
    NOT?: ResultScalarWhereWithAggregatesInput | ResultScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Result"> | string
    jobId?: StringWithAggregatesFilter<"Result"> | string
    narrative?: JsonWithAggregatesFilter<"Result">
    screenshot_url?: StringNullableWithAggregatesFilter<"Result"> | string | null
    tech_stack?: JsonNullableWithAggregatesFilter<"Result">
    cross_page_patterns?: JsonNullableWithAggregatesFilter<"Result">
    created_at?: DateTimeWithAggregatesFilter<"Result"> | Date | string
  }

  export type IssueWhereInput = {
    AND?: IssueWhereInput | IssueWhereInput[]
    OR?: IssueWhereInput[]
    NOT?: IssueWhereInput | IssueWhereInput[]
    id?: StringFilter<"Issue"> | string
    resultId?: StringFilter<"Issue"> | string
    category?: StringFilter<"Issue"> | string
    signal_source?: StringFilter<"Issue"> | string
    severity?: IntFilter<"Issue"> | number
    raw_evidence?: StringFilter<"Issue"> | string
    technical_description?: StringFilter<"Issue"> | string
    fix_suggestion?: StringFilter<"Issue"> | string
    severity_justification?: StringFilter<"Issue"> | string
    result?: XOR<ResultScalarRelationFilter, ResultWhereInput>
    causedBy?: CausalEdgeListRelationFilter
    causes?: CausalEdgeListRelationFilter
  }

  export type IssueOrderByWithRelationInput = {
    id?: SortOrder
    resultId?: SortOrder
    category?: SortOrder
    signal_source?: SortOrder
    severity?: SortOrder
    raw_evidence?: SortOrder
    technical_description?: SortOrder
    fix_suggestion?: SortOrder
    severity_justification?: SortOrder
    result?: ResultOrderByWithRelationInput
    causedBy?: CausalEdgeOrderByRelationAggregateInput
    causes?: CausalEdgeOrderByRelationAggregateInput
  }

  export type IssueWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IssueWhereInput | IssueWhereInput[]
    OR?: IssueWhereInput[]
    NOT?: IssueWhereInput | IssueWhereInput[]
    resultId?: StringFilter<"Issue"> | string
    category?: StringFilter<"Issue"> | string
    signal_source?: StringFilter<"Issue"> | string
    severity?: IntFilter<"Issue"> | number
    raw_evidence?: StringFilter<"Issue"> | string
    technical_description?: StringFilter<"Issue"> | string
    fix_suggestion?: StringFilter<"Issue"> | string
    severity_justification?: StringFilter<"Issue"> | string
    result?: XOR<ResultScalarRelationFilter, ResultWhereInput>
    causedBy?: CausalEdgeListRelationFilter
    causes?: CausalEdgeListRelationFilter
  }, "id">

  export type IssueOrderByWithAggregationInput = {
    id?: SortOrder
    resultId?: SortOrder
    category?: SortOrder
    signal_source?: SortOrder
    severity?: SortOrder
    raw_evidence?: SortOrder
    technical_description?: SortOrder
    fix_suggestion?: SortOrder
    severity_justification?: SortOrder
    _count?: IssueCountOrderByAggregateInput
    _avg?: IssueAvgOrderByAggregateInput
    _max?: IssueMaxOrderByAggregateInput
    _min?: IssueMinOrderByAggregateInput
    _sum?: IssueSumOrderByAggregateInput
  }

  export type IssueScalarWhereWithAggregatesInput = {
    AND?: IssueScalarWhereWithAggregatesInput | IssueScalarWhereWithAggregatesInput[]
    OR?: IssueScalarWhereWithAggregatesInput[]
    NOT?: IssueScalarWhereWithAggregatesInput | IssueScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Issue"> | string
    resultId?: StringWithAggregatesFilter<"Issue"> | string
    category?: StringWithAggregatesFilter<"Issue"> | string
    signal_source?: StringWithAggregatesFilter<"Issue"> | string
    severity?: IntWithAggregatesFilter<"Issue"> | number
    raw_evidence?: StringWithAggregatesFilter<"Issue"> | string
    technical_description?: StringWithAggregatesFilter<"Issue"> | string
    fix_suggestion?: StringWithAggregatesFilter<"Issue"> | string
    severity_justification?: StringWithAggregatesFilter<"Issue"> | string
  }

  export type CausalEdgeWhereInput = {
    AND?: CausalEdgeWhereInput | CausalEdgeWhereInput[]
    OR?: CausalEdgeWhereInput[]
    NOT?: CausalEdgeWhereInput | CausalEdgeWhereInput[]
    id?: StringFilter<"CausalEdge"> | string
    resultId?: StringFilter<"CausalEdge"> | string
    fromIssueId?: StringFilter<"CausalEdge"> | string
    toIssueId?: StringFilter<"CausalEdge"> | string
    relationship?: StringFilter<"CausalEdge"> | string
    confidence?: StringFilter<"CausalEdge"> | string
    mechanism?: StringFilter<"CausalEdge"> | string
    explanation?: StringFilter<"CausalEdge"> | string
    result?: XOR<ResultScalarRelationFilter, ResultWhereInput>
    fromIssue?: XOR<IssueScalarRelationFilter, IssueWhereInput>
    toIssue?: XOR<IssueScalarRelationFilter, IssueWhereInput>
  }

  export type CausalEdgeOrderByWithRelationInput = {
    id?: SortOrder
    resultId?: SortOrder
    fromIssueId?: SortOrder
    toIssueId?: SortOrder
    relationship?: SortOrder
    confidence?: SortOrder
    mechanism?: SortOrder
    explanation?: SortOrder
    result?: ResultOrderByWithRelationInput
    fromIssue?: IssueOrderByWithRelationInput
    toIssue?: IssueOrderByWithRelationInput
  }

  export type CausalEdgeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CausalEdgeWhereInput | CausalEdgeWhereInput[]
    OR?: CausalEdgeWhereInput[]
    NOT?: CausalEdgeWhereInput | CausalEdgeWhereInput[]
    resultId?: StringFilter<"CausalEdge"> | string
    fromIssueId?: StringFilter<"CausalEdge"> | string
    toIssueId?: StringFilter<"CausalEdge"> | string
    relationship?: StringFilter<"CausalEdge"> | string
    confidence?: StringFilter<"CausalEdge"> | string
    mechanism?: StringFilter<"CausalEdge"> | string
    explanation?: StringFilter<"CausalEdge"> | string
    result?: XOR<ResultScalarRelationFilter, ResultWhereInput>
    fromIssue?: XOR<IssueScalarRelationFilter, IssueWhereInput>
    toIssue?: XOR<IssueScalarRelationFilter, IssueWhereInput>
  }, "id">

  export type CausalEdgeOrderByWithAggregationInput = {
    id?: SortOrder
    resultId?: SortOrder
    fromIssueId?: SortOrder
    toIssueId?: SortOrder
    relationship?: SortOrder
    confidence?: SortOrder
    mechanism?: SortOrder
    explanation?: SortOrder
    _count?: CausalEdgeCountOrderByAggregateInput
    _max?: CausalEdgeMaxOrderByAggregateInput
    _min?: CausalEdgeMinOrderByAggregateInput
  }

  export type CausalEdgeScalarWhereWithAggregatesInput = {
    AND?: CausalEdgeScalarWhereWithAggregatesInput | CausalEdgeScalarWhereWithAggregatesInput[]
    OR?: CausalEdgeScalarWhereWithAggregatesInput[]
    NOT?: CausalEdgeScalarWhereWithAggregatesInput | CausalEdgeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CausalEdge"> | string
    resultId?: StringWithAggregatesFilter<"CausalEdge"> | string
    fromIssueId?: StringWithAggregatesFilter<"CausalEdge"> | string
    toIssueId?: StringWithAggregatesFilter<"CausalEdge"> | string
    relationship?: StringWithAggregatesFilter<"CausalEdge"> | string
    confidence?: StringWithAggregatesFilter<"CausalEdge"> | string
    mechanism?: StringWithAggregatesFilter<"CausalEdge"> | string
    explanation?: StringWithAggregatesFilter<"CausalEdge"> | string
  }

  export type CrawledPageWhereInput = {
    AND?: CrawledPageWhereInput | CrawledPageWhereInput[]
    OR?: CrawledPageWhereInput[]
    NOT?: CrawledPageWhereInput | CrawledPageWhereInput[]
    id?: StringFilter<"CrawledPage"> | string
    resultId?: StringFilter<"CrawledPage"> | string
    url?: StringFilter<"CrawledPage"> | string
    page_index?: IntFilter<"CrawledPage"> | number
    narrative?: JsonFilter<"CrawledPage">
    screenshot_url?: StringNullableFilter<"CrawledPage"> | string | null
    tech_stack?: JsonNullableFilter<"CrawledPage">
    created_at?: DateTimeFilter<"CrawledPage"> | Date | string
    result?: XOR<ResultScalarRelationFilter, ResultWhereInput>
    issues?: CrawledPageIssueListRelationFilter
    edges?: CrawledPageEdgeListRelationFilter
  }

  export type CrawledPageOrderByWithRelationInput = {
    id?: SortOrder
    resultId?: SortOrder
    url?: SortOrder
    page_index?: SortOrder
    narrative?: SortOrder
    screenshot_url?: SortOrderInput | SortOrder
    tech_stack?: SortOrderInput | SortOrder
    created_at?: SortOrder
    result?: ResultOrderByWithRelationInput
    issues?: CrawledPageIssueOrderByRelationAggregateInput
    edges?: CrawledPageEdgeOrderByRelationAggregateInput
  }

  export type CrawledPageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CrawledPageWhereInput | CrawledPageWhereInput[]
    OR?: CrawledPageWhereInput[]
    NOT?: CrawledPageWhereInput | CrawledPageWhereInput[]
    resultId?: StringFilter<"CrawledPage"> | string
    url?: StringFilter<"CrawledPage"> | string
    page_index?: IntFilter<"CrawledPage"> | number
    narrative?: JsonFilter<"CrawledPage">
    screenshot_url?: StringNullableFilter<"CrawledPage"> | string | null
    tech_stack?: JsonNullableFilter<"CrawledPage">
    created_at?: DateTimeFilter<"CrawledPage"> | Date | string
    result?: XOR<ResultScalarRelationFilter, ResultWhereInput>
    issues?: CrawledPageIssueListRelationFilter
    edges?: CrawledPageEdgeListRelationFilter
  }, "id">

  export type CrawledPageOrderByWithAggregationInput = {
    id?: SortOrder
    resultId?: SortOrder
    url?: SortOrder
    page_index?: SortOrder
    narrative?: SortOrder
    screenshot_url?: SortOrderInput | SortOrder
    tech_stack?: SortOrderInput | SortOrder
    created_at?: SortOrder
    _count?: CrawledPageCountOrderByAggregateInput
    _avg?: CrawledPageAvgOrderByAggregateInput
    _max?: CrawledPageMaxOrderByAggregateInput
    _min?: CrawledPageMinOrderByAggregateInput
    _sum?: CrawledPageSumOrderByAggregateInput
  }

  export type CrawledPageScalarWhereWithAggregatesInput = {
    AND?: CrawledPageScalarWhereWithAggregatesInput | CrawledPageScalarWhereWithAggregatesInput[]
    OR?: CrawledPageScalarWhereWithAggregatesInput[]
    NOT?: CrawledPageScalarWhereWithAggregatesInput | CrawledPageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CrawledPage"> | string
    resultId?: StringWithAggregatesFilter<"CrawledPage"> | string
    url?: StringWithAggregatesFilter<"CrawledPage"> | string
    page_index?: IntWithAggregatesFilter<"CrawledPage"> | number
    narrative?: JsonWithAggregatesFilter<"CrawledPage">
    screenshot_url?: StringNullableWithAggregatesFilter<"CrawledPage"> | string | null
    tech_stack?: JsonNullableWithAggregatesFilter<"CrawledPage">
    created_at?: DateTimeWithAggregatesFilter<"CrawledPage"> | Date | string
  }

  export type CrawledPageIssueWhereInput = {
    AND?: CrawledPageIssueWhereInput | CrawledPageIssueWhereInput[]
    OR?: CrawledPageIssueWhereInput[]
    NOT?: CrawledPageIssueWhereInput | CrawledPageIssueWhereInput[]
    id?: StringFilter<"CrawledPageIssue"> | string
    crawledPageId?: StringFilter<"CrawledPageIssue"> | string
    category?: StringFilter<"CrawledPageIssue"> | string
    signal_source?: StringFilter<"CrawledPageIssue"> | string
    severity?: IntFilter<"CrawledPageIssue"> | number
    raw_evidence?: StringFilter<"CrawledPageIssue"> | string
    technical_description?: StringFilter<"CrawledPageIssue"> | string
    fix_suggestion?: StringFilter<"CrawledPageIssue"> | string
    severity_justification?: StringFilter<"CrawledPageIssue"> | string
    crawledPage?: XOR<CrawledPageScalarRelationFilter, CrawledPageWhereInput>
    causedBy?: CrawledPageEdgeListRelationFilter
    causes?: CrawledPageEdgeListRelationFilter
  }

  export type CrawledPageIssueOrderByWithRelationInput = {
    id?: SortOrder
    crawledPageId?: SortOrder
    category?: SortOrder
    signal_source?: SortOrder
    severity?: SortOrder
    raw_evidence?: SortOrder
    technical_description?: SortOrder
    fix_suggestion?: SortOrder
    severity_justification?: SortOrder
    crawledPage?: CrawledPageOrderByWithRelationInput
    causedBy?: CrawledPageEdgeOrderByRelationAggregateInput
    causes?: CrawledPageEdgeOrderByRelationAggregateInput
  }

  export type CrawledPageIssueWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CrawledPageIssueWhereInput | CrawledPageIssueWhereInput[]
    OR?: CrawledPageIssueWhereInput[]
    NOT?: CrawledPageIssueWhereInput | CrawledPageIssueWhereInput[]
    crawledPageId?: StringFilter<"CrawledPageIssue"> | string
    category?: StringFilter<"CrawledPageIssue"> | string
    signal_source?: StringFilter<"CrawledPageIssue"> | string
    severity?: IntFilter<"CrawledPageIssue"> | number
    raw_evidence?: StringFilter<"CrawledPageIssue"> | string
    technical_description?: StringFilter<"CrawledPageIssue"> | string
    fix_suggestion?: StringFilter<"CrawledPageIssue"> | string
    severity_justification?: StringFilter<"CrawledPageIssue"> | string
    crawledPage?: XOR<CrawledPageScalarRelationFilter, CrawledPageWhereInput>
    causedBy?: CrawledPageEdgeListRelationFilter
    causes?: CrawledPageEdgeListRelationFilter
  }, "id">

  export type CrawledPageIssueOrderByWithAggregationInput = {
    id?: SortOrder
    crawledPageId?: SortOrder
    category?: SortOrder
    signal_source?: SortOrder
    severity?: SortOrder
    raw_evidence?: SortOrder
    technical_description?: SortOrder
    fix_suggestion?: SortOrder
    severity_justification?: SortOrder
    _count?: CrawledPageIssueCountOrderByAggregateInput
    _avg?: CrawledPageIssueAvgOrderByAggregateInput
    _max?: CrawledPageIssueMaxOrderByAggregateInput
    _min?: CrawledPageIssueMinOrderByAggregateInput
    _sum?: CrawledPageIssueSumOrderByAggregateInput
  }

  export type CrawledPageIssueScalarWhereWithAggregatesInput = {
    AND?: CrawledPageIssueScalarWhereWithAggregatesInput | CrawledPageIssueScalarWhereWithAggregatesInput[]
    OR?: CrawledPageIssueScalarWhereWithAggregatesInput[]
    NOT?: CrawledPageIssueScalarWhereWithAggregatesInput | CrawledPageIssueScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CrawledPageIssue"> | string
    crawledPageId?: StringWithAggregatesFilter<"CrawledPageIssue"> | string
    category?: StringWithAggregatesFilter<"CrawledPageIssue"> | string
    signal_source?: StringWithAggregatesFilter<"CrawledPageIssue"> | string
    severity?: IntWithAggregatesFilter<"CrawledPageIssue"> | number
    raw_evidence?: StringWithAggregatesFilter<"CrawledPageIssue"> | string
    technical_description?: StringWithAggregatesFilter<"CrawledPageIssue"> | string
    fix_suggestion?: StringWithAggregatesFilter<"CrawledPageIssue"> | string
    severity_justification?: StringWithAggregatesFilter<"CrawledPageIssue"> | string
  }

  export type CrawledPageEdgeWhereInput = {
    AND?: CrawledPageEdgeWhereInput | CrawledPageEdgeWhereInput[]
    OR?: CrawledPageEdgeWhereInput[]
    NOT?: CrawledPageEdgeWhereInput | CrawledPageEdgeWhereInput[]
    id?: StringFilter<"CrawledPageEdge"> | string
    crawledPageId?: StringFilter<"CrawledPageEdge"> | string
    fromIssueId?: StringFilter<"CrawledPageEdge"> | string
    toIssueId?: StringFilter<"CrawledPageEdge"> | string
    relationship?: StringFilter<"CrawledPageEdge"> | string
    confidence?: StringFilter<"CrawledPageEdge"> | string
    mechanism?: StringFilter<"CrawledPageEdge"> | string
    explanation?: StringFilter<"CrawledPageEdge"> | string
    crawledPage?: XOR<CrawledPageScalarRelationFilter, CrawledPageWhereInput>
    fromIssue?: XOR<CrawledPageIssueScalarRelationFilter, CrawledPageIssueWhereInput>
    toIssue?: XOR<CrawledPageIssueScalarRelationFilter, CrawledPageIssueWhereInput>
  }

  export type CrawledPageEdgeOrderByWithRelationInput = {
    id?: SortOrder
    crawledPageId?: SortOrder
    fromIssueId?: SortOrder
    toIssueId?: SortOrder
    relationship?: SortOrder
    confidence?: SortOrder
    mechanism?: SortOrder
    explanation?: SortOrder
    crawledPage?: CrawledPageOrderByWithRelationInput
    fromIssue?: CrawledPageIssueOrderByWithRelationInput
    toIssue?: CrawledPageIssueOrderByWithRelationInput
  }

  export type CrawledPageEdgeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CrawledPageEdgeWhereInput | CrawledPageEdgeWhereInput[]
    OR?: CrawledPageEdgeWhereInput[]
    NOT?: CrawledPageEdgeWhereInput | CrawledPageEdgeWhereInput[]
    crawledPageId?: StringFilter<"CrawledPageEdge"> | string
    fromIssueId?: StringFilter<"CrawledPageEdge"> | string
    toIssueId?: StringFilter<"CrawledPageEdge"> | string
    relationship?: StringFilter<"CrawledPageEdge"> | string
    confidence?: StringFilter<"CrawledPageEdge"> | string
    mechanism?: StringFilter<"CrawledPageEdge"> | string
    explanation?: StringFilter<"CrawledPageEdge"> | string
    crawledPage?: XOR<CrawledPageScalarRelationFilter, CrawledPageWhereInput>
    fromIssue?: XOR<CrawledPageIssueScalarRelationFilter, CrawledPageIssueWhereInput>
    toIssue?: XOR<CrawledPageIssueScalarRelationFilter, CrawledPageIssueWhereInput>
  }, "id">

  export type CrawledPageEdgeOrderByWithAggregationInput = {
    id?: SortOrder
    crawledPageId?: SortOrder
    fromIssueId?: SortOrder
    toIssueId?: SortOrder
    relationship?: SortOrder
    confidence?: SortOrder
    mechanism?: SortOrder
    explanation?: SortOrder
    _count?: CrawledPageEdgeCountOrderByAggregateInput
    _max?: CrawledPageEdgeMaxOrderByAggregateInput
    _min?: CrawledPageEdgeMinOrderByAggregateInput
  }

  export type CrawledPageEdgeScalarWhereWithAggregatesInput = {
    AND?: CrawledPageEdgeScalarWhereWithAggregatesInput | CrawledPageEdgeScalarWhereWithAggregatesInput[]
    OR?: CrawledPageEdgeScalarWhereWithAggregatesInput[]
    NOT?: CrawledPageEdgeScalarWhereWithAggregatesInput | CrawledPageEdgeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CrawledPageEdge"> | string
    crawledPageId?: StringWithAggregatesFilter<"CrawledPageEdge"> | string
    fromIssueId?: StringWithAggregatesFilter<"CrawledPageEdge"> | string
    toIssueId?: StringWithAggregatesFilter<"CrawledPageEdge"> | string
    relationship?: StringWithAggregatesFilter<"CrawledPageEdge"> | string
    confidence?: StringWithAggregatesFilter<"CrawledPageEdge"> | string
    mechanism?: StringWithAggregatesFilter<"CrawledPageEdge"> | string
    explanation?: StringWithAggregatesFilter<"CrawledPageEdge"> | string
  }

  export type JobCreateInput = {
    id?: string
    url: string
    status?: $Enums.JobStatus
    error_message?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    result?: ResultCreateNestedOneWithoutJobInput
  }

  export type JobUncheckedCreateInput = {
    id?: string
    url: string
    status?: $Enums.JobStatus
    error_message?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    result?: ResultUncheckedCreateNestedOneWithoutJobInput
  }

  export type JobUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    error_message?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    result?: ResultUpdateOneWithoutJobNestedInput
  }

  export type JobUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    error_message?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    result?: ResultUncheckedUpdateOneWithoutJobNestedInput
  }

  export type JobCreateManyInput = {
    id?: string
    url: string
    status?: $Enums.JobStatus
    error_message?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type JobUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    error_message?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    error_message?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ResultCreateInput = {
    id?: string
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    job: JobCreateNestedOneWithoutResultInput
    issues?: IssueCreateNestedManyWithoutResultInput
    edges?: CausalEdgeCreateNestedManyWithoutResultInput
    crawledPages?: CrawledPageCreateNestedManyWithoutResultInput
  }

  export type ResultUncheckedCreateInput = {
    id?: string
    jobId: string
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    issues?: IssueUncheckedCreateNestedManyWithoutResultInput
    edges?: CausalEdgeUncheckedCreateNestedManyWithoutResultInput
    crawledPages?: CrawledPageUncheckedCreateNestedManyWithoutResultInput
  }

  export type ResultUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    job?: JobUpdateOneRequiredWithoutResultNestedInput
    issues?: IssueUpdateManyWithoutResultNestedInput
    edges?: CausalEdgeUpdateManyWithoutResultNestedInput
    crawledPages?: CrawledPageUpdateManyWithoutResultNestedInput
  }

  export type ResultUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    issues?: IssueUncheckedUpdateManyWithoutResultNestedInput
    edges?: CausalEdgeUncheckedUpdateManyWithoutResultNestedInput
    crawledPages?: CrawledPageUncheckedUpdateManyWithoutResultNestedInput
  }

  export type ResultCreateManyInput = {
    id?: string
    jobId: string
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type ResultUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ResultUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IssueCreateInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    result: ResultCreateNestedOneWithoutIssuesInput
    causedBy?: CausalEdgeCreateNestedManyWithoutToIssueInput
    causes?: CausalEdgeCreateNestedManyWithoutFromIssueInput
  }

  export type IssueUncheckedCreateInput = {
    id?: string
    resultId: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    causedBy?: CausalEdgeUncheckedCreateNestedManyWithoutToIssueInput
    causes?: CausalEdgeUncheckedCreateNestedManyWithoutFromIssueInput
  }

  export type IssueUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    result?: ResultUpdateOneRequiredWithoutIssuesNestedInput
    causedBy?: CausalEdgeUpdateManyWithoutToIssueNestedInput
    causes?: CausalEdgeUpdateManyWithoutFromIssueNestedInput
  }

  export type IssueUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    causedBy?: CausalEdgeUncheckedUpdateManyWithoutToIssueNestedInput
    causes?: CausalEdgeUncheckedUpdateManyWithoutFromIssueNestedInput
  }

  export type IssueCreateManyInput = {
    id?: string
    resultId: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
  }

  export type IssueUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
  }

  export type IssueUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
  }

  export type CausalEdgeCreateInput = {
    id?: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
    result: ResultCreateNestedOneWithoutEdgesInput
    fromIssue: IssueCreateNestedOneWithoutCausesInput
    toIssue: IssueCreateNestedOneWithoutCausedByInput
  }

  export type CausalEdgeUncheckedCreateInput = {
    id?: string
    resultId: string
    fromIssueId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CausalEdgeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
    result?: ResultUpdateOneRequiredWithoutEdgesNestedInput
    fromIssue?: IssueUpdateOneRequiredWithoutCausesNestedInput
    toIssue?: IssueUpdateOneRequiredWithoutCausedByNestedInput
  }

  export type CausalEdgeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CausalEdgeCreateManyInput = {
    id?: string
    resultId: string
    fromIssueId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CausalEdgeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CausalEdgeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageCreateInput = {
    id?: string
    url: string
    page_index: number
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    result: ResultCreateNestedOneWithoutCrawledPagesInput
    issues?: CrawledPageIssueCreateNestedManyWithoutCrawledPageInput
    edges?: CrawledPageEdgeCreateNestedManyWithoutCrawledPageInput
  }

  export type CrawledPageUncheckedCreateInput = {
    id?: string
    resultId: string
    url: string
    page_index: number
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    issues?: CrawledPageIssueUncheckedCreateNestedManyWithoutCrawledPageInput
    edges?: CrawledPageEdgeUncheckedCreateNestedManyWithoutCrawledPageInput
  }

  export type CrawledPageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    page_index?: IntFieldUpdateOperationsInput | number
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    result?: ResultUpdateOneRequiredWithoutCrawledPagesNestedInput
    issues?: CrawledPageIssueUpdateManyWithoutCrawledPageNestedInput
    edges?: CrawledPageEdgeUpdateManyWithoutCrawledPageNestedInput
  }

  export type CrawledPageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    page_index?: IntFieldUpdateOperationsInput | number
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    issues?: CrawledPageIssueUncheckedUpdateManyWithoutCrawledPageNestedInput
    edges?: CrawledPageEdgeUncheckedUpdateManyWithoutCrawledPageNestedInput
  }

  export type CrawledPageCreateManyInput = {
    id?: string
    resultId: string
    url: string
    page_index: number
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type CrawledPageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    page_index?: IntFieldUpdateOperationsInput | number
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CrawledPageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    page_index?: IntFieldUpdateOperationsInput | number
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CrawledPageIssueCreateInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    crawledPage: CrawledPageCreateNestedOneWithoutIssuesInput
    causedBy?: CrawledPageEdgeCreateNestedManyWithoutToIssueInput
    causes?: CrawledPageEdgeCreateNestedManyWithoutFromIssueInput
  }

  export type CrawledPageIssueUncheckedCreateInput = {
    id?: string
    crawledPageId: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    causedBy?: CrawledPageEdgeUncheckedCreateNestedManyWithoutToIssueInput
    causes?: CrawledPageEdgeUncheckedCreateNestedManyWithoutFromIssueInput
  }

  export type CrawledPageIssueUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    crawledPage?: CrawledPageUpdateOneRequiredWithoutIssuesNestedInput
    causedBy?: CrawledPageEdgeUpdateManyWithoutToIssueNestedInput
    causes?: CrawledPageEdgeUpdateManyWithoutFromIssueNestedInput
  }

  export type CrawledPageIssueUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    crawledPageId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    causedBy?: CrawledPageEdgeUncheckedUpdateManyWithoutToIssueNestedInput
    causes?: CrawledPageEdgeUncheckedUpdateManyWithoutFromIssueNestedInput
  }

  export type CrawledPageIssueCreateManyInput = {
    id?: string
    crawledPageId: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
  }

  export type CrawledPageIssueUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageIssueUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    crawledPageId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageEdgeCreateInput = {
    id?: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
    crawledPage: CrawledPageCreateNestedOneWithoutEdgesInput
    fromIssue: CrawledPageIssueCreateNestedOneWithoutCausesInput
    toIssue: CrawledPageIssueCreateNestedOneWithoutCausedByInput
  }

  export type CrawledPageEdgeUncheckedCreateInput = {
    id?: string
    crawledPageId: string
    fromIssueId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CrawledPageEdgeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
    crawledPage?: CrawledPageUpdateOneRequiredWithoutEdgesNestedInput
    fromIssue?: CrawledPageIssueUpdateOneRequiredWithoutCausesNestedInput
    toIssue?: CrawledPageIssueUpdateOneRequiredWithoutCausedByNestedInput
  }

  export type CrawledPageEdgeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    crawledPageId?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageEdgeCreateManyInput = {
    id?: string
    crawledPageId: string
    fromIssueId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CrawledPageEdgeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageEdgeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    crawledPageId?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
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

  export type EnumJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusFilter<$PrismaModel> | $Enums.JobStatus
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

  export type ResultNullableScalarRelationFilter = {
    is?: ResultWhereInput | null
    isNot?: ResultWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type JobCountOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    status?: SortOrder
    error_message?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type JobMaxOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    status?: SortOrder
    error_message?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type JobMinOrderByAggregateInput = {
    id?: SortOrder
    url?: SortOrder
    status?: SortOrder
    error_message?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
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

  export type EnumJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.JobStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobStatusFilter<$PrismaModel>
    _max?: NestedEnumJobStatusFilter<$PrismaModel>
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
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
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

  export type JobScalarRelationFilter = {
    is?: JobWhereInput
    isNot?: JobWhereInput
  }

  export type IssueListRelationFilter = {
    every?: IssueWhereInput
    some?: IssueWhereInput
    none?: IssueWhereInput
  }

  export type CausalEdgeListRelationFilter = {
    every?: CausalEdgeWhereInput
    some?: CausalEdgeWhereInput
    none?: CausalEdgeWhereInput
  }

  export type CrawledPageListRelationFilter = {
    every?: CrawledPageWhereInput
    some?: CrawledPageWhereInput
    none?: CrawledPageWhereInput
  }

  export type IssueOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CausalEdgeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CrawledPageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ResultCountOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    narrative?: SortOrder
    screenshot_url?: SortOrder
    tech_stack?: SortOrder
    cross_page_patterns?: SortOrder
    created_at?: SortOrder
  }

  export type ResultMaxOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    screenshot_url?: SortOrder
    created_at?: SortOrder
  }

  export type ResultMinOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    screenshot_url?: SortOrder
    created_at?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
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
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
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

  export type ResultScalarRelationFilter = {
    is?: ResultWhereInput
    isNot?: ResultWhereInput
  }

  export type IssueCountOrderByAggregateInput = {
    id?: SortOrder
    resultId?: SortOrder
    category?: SortOrder
    signal_source?: SortOrder
    severity?: SortOrder
    raw_evidence?: SortOrder
    technical_description?: SortOrder
    fix_suggestion?: SortOrder
    severity_justification?: SortOrder
  }

  export type IssueAvgOrderByAggregateInput = {
    severity?: SortOrder
  }

  export type IssueMaxOrderByAggregateInput = {
    id?: SortOrder
    resultId?: SortOrder
    category?: SortOrder
    signal_source?: SortOrder
    severity?: SortOrder
    raw_evidence?: SortOrder
    technical_description?: SortOrder
    fix_suggestion?: SortOrder
    severity_justification?: SortOrder
  }

  export type IssueMinOrderByAggregateInput = {
    id?: SortOrder
    resultId?: SortOrder
    category?: SortOrder
    signal_source?: SortOrder
    severity?: SortOrder
    raw_evidence?: SortOrder
    technical_description?: SortOrder
    fix_suggestion?: SortOrder
    severity_justification?: SortOrder
  }

  export type IssueSumOrderByAggregateInput = {
    severity?: SortOrder
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

  export type IssueScalarRelationFilter = {
    is?: IssueWhereInput
    isNot?: IssueWhereInput
  }

  export type CausalEdgeCountOrderByAggregateInput = {
    id?: SortOrder
    resultId?: SortOrder
    fromIssueId?: SortOrder
    toIssueId?: SortOrder
    relationship?: SortOrder
    confidence?: SortOrder
    mechanism?: SortOrder
    explanation?: SortOrder
  }

  export type CausalEdgeMaxOrderByAggregateInput = {
    id?: SortOrder
    resultId?: SortOrder
    fromIssueId?: SortOrder
    toIssueId?: SortOrder
    relationship?: SortOrder
    confidence?: SortOrder
    mechanism?: SortOrder
    explanation?: SortOrder
  }

  export type CausalEdgeMinOrderByAggregateInput = {
    id?: SortOrder
    resultId?: SortOrder
    fromIssueId?: SortOrder
    toIssueId?: SortOrder
    relationship?: SortOrder
    confidence?: SortOrder
    mechanism?: SortOrder
    explanation?: SortOrder
  }

  export type CrawledPageIssueListRelationFilter = {
    every?: CrawledPageIssueWhereInput
    some?: CrawledPageIssueWhereInput
    none?: CrawledPageIssueWhereInput
  }

  export type CrawledPageEdgeListRelationFilter = {
    every?: CrawledPageEdgeWhereInput
    some?: CrawledPageEdgeWhereInput
    none?: CrawledPageEdgeWhereInput
  }

  export type CrawledPageIssueOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CrawledPageEdgeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CrawledPageCountOrderByAggregateInput = {
    id?: SortOrder
    resultId?: SortOrder
    url?: SortOrder
    page_index?: SortOrder
    narrative?: SortOrder
    screenshot_url?: SortOrder
    tech_stack?: SortOrder
    created_at?: SortOrder
  }

  export type CrawledPageAvgOrderByAggregateInput = {
    page_index?: SortOrder
  }

  export type CrawledPageMaxOrderByAggregateInput = {
    id?: SortOrder
    resultId?: SortOrder
    url?: SortOrder
    page_index?: SortOrder
    screenshot_url?: SortOrder
    created_at?: SortOrder
  }

  export type CrawledPageMinOrderByAggregateInput = {
    id?: SortOrder
    resultId?: SortOrder
    url?: SortOrder
    page_index?: SortOrder
    screenshot_url?: SortOrder
    created_at?: SortOrder
  }

  export type CrawledPageSumOrderByAggregateInput = {
    page_index?: SortOrder
  }

  export type CrawledPageScalarRelationFilter = {
    is?: CrawledPageWhereInput
    isNot?: CrawledPageWhereInput
  }

  export type CrawledPageIssueCountOrderByAggregateInput = {
    id?: SortOrder
    crawledPageId?: SortOrder
    category?: SortOrder
    signal_source?: SortOrder
    severity?: SortOrder
    raw_evidence?: SortOrder
    technical_description?: SortOrder
    fix_suggestion?: SortOrder
    severity_justification?: SortOrder
  }

  export type CrawledPageIssueAvgOrderByAggregateInput = {
    severity?: SortOrder
  }

  export type CrawledPageIssueMaxOrderByAggregateInput = {
    id?: SortOrder
    crawledPageId?: SortOrder
    category?: SortOrder
    signal_source?: SortOrder
    severity?: SortOrder
    raw_evidence?: SortOrder
    technical_description?: SortOrder
    fix_suggestion?: SortOrder
    severity_justification?: SortOrder
  }

  export type CrawledPageIssueMinOrderByAggregateInput = {
    id?: SortOrder
    crawledPageId?: SortOrder
    category?: SortOrder
    signal_source?: SortOrder
    severity?: SortOrder
    raw_evidence?: SortOrder
    technical_description?: SortOrder
    fix_suggestion?: SortOrder
    severity_justification?: SortOrder
  }

  export type CrawledPageIssueSumOrderByAggregateInput = {
    severity?: SortOrder
  }

  export type CrawledPageIssueScalarRelationFilter = {
    is?: CrawledPageIssueWhereInput
    isNot?: CrawledPageIssueWhereInput
  }

  export type CrawledPageEdgeCountOrderByAggregateInput = {
    id?: SortOrder
    crawledPageId?: SortOrder
    fromIssueId?: SortOrder
    toIssueId?: SortOrder
    relationship?: SortOrder
    confidence?: SortOrder
    mechanism?: SortOrder
    explanation?: SortOrder
  }

  export type CrawledPageEdgeMaxOrderByAggregateInput = {
    id?: SortOrder
    crawledPageId?: SortOrder
    fromIssueId?: SortOrder
    toIssueId?: SortOrder
    relationship?: SortOrder
    confidence?: SortOrder
    mechanism?: SortOrder
    explanation?: SortOrder
  }

  export type CrawledPageEdgeMinOrderByAggregateInput = {
    id?: SortOrder
    crawledPageId?: SortOrder
    fromIssueId?: SortOrder
    toIssueId?: SortOrder
    relationship?: SortOrder
    confidence?: SortOrder
    mechanism?: SortOrder
    explanation?: SortOrder
  }

  export type ResultCreateNestedOneWithoutJobInput = {
    create?: XOR<ResultCreateWithoutJobInput, ResultUncheckedCreateWithoutJobInput>
    connectOrCreate?: ResultCreateOrConnectWithoutJobInput
    connect?: ResultWhereUniqueInput
  }

  export type ResultUncheckedCreateNestedOneWithoutJobInput = {
    create?: XOR<ResultCreateWithoutJobInput, ResultUncheckedCreateWithoutJobInput>
    connectOrCreate?: ResultCreateOrConnectWithoutJobInput
    connect?: ResultWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumJobStatusFieldUpdateOperationsInput = {
    set?: $Enums.JobStatus
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ResultUpdateOneWithoutJobNestedInput = {
    create?: XOR<ResultCreateWithoutJobInput, ResultUncheckedCreateWithoutJobInput>
    connectOrCreate?: ResultCreateOrConnectWithoutJobInput
    upsert?: ResultUpsertWithoutJobInput
    disconnect?: ResultWhereInput | boolean
    delete?: ResultWhereInput | boolean
    connect?: ResultWhereUniqueInput
    update?: XOR<XOR<ResultUpdateToOneWithWhereWithoutJobInput, ResultUpdateWithoutJobInput>, ResultUncheckedUpdateWithoutJobInput>
  }

  export type ResultUncheckedUpdateOneWithoutJobNestedInput = {
    create?: XOR<ResultCreateWithoutJobInput, ResultUncheckedCreateWithoutJobInput>
    connectOrCreate?: ResultCreateOrConnectWithoutJobInput
    upsert?: ResultUpsertWithoutJobInput
    disconnect?: ResultWhereInput | boolean
    delete?: ResultWhereInput | boolean
    connect?: ResultWhereUniqueInput
    update?: XOR<XOR<ResultUpdateToOneWithWhereWithoutJobInput, ResultUpdateWithoutJobInput>, ResultUncheckedUpdateWithoutJobInput>
  }

  export type JobCreateNestedOneWithoutResultInput = {
    create?: XOR<JobCreateWithoutResultInput, JobUncheckedCreateWithoutResultInput>
    connectOrCreate?: JobCreateOrConnectWithoutResultInput
    connect?: JobWhereUniqueInput
  }

  export type IssueCreateNestedManyWithoutResultInput = {
    create?: XOR<IssueCreateWithoutResultInput, IssueUncheckedCreateWithoutResultInput> | IssueCreateWithoutResultInput[] | IssueUncheckedCreateWithoutResultInput[]
    connectOrCreate?: IssueCreateOrConnectWithoutResultInput | IssueCreateOrConnectWithoutResultInput[]
    createMany?: IssueCreateManyResultInputEnvelope
    connect?: IssueWhereUniqueInput | IssueWhereUniqueInput[]
  }

  export type CausalEdgeCreateNestedManyWithoutResultInput = {
    create?: XOR<CausalEdgeCreateWithoutResultInput, CausalEdgeUncheckedCreateWithoutResultInput> | CausalEdgeCreateWithoutResultInput[] | CausalEdgeUncheckedCreateWithoutResultInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutResultInput | CausalEdgeCreateOrConnectWithoutResultInput[]
    createMany?: CausalEdgeCreateManyResultInputEnvelope
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
  }

  export type CrawledPageCreateNestedManyWithoutResultInput = {
    create?: XOR<CrawledPageCreateWithoutResultInput, CrawledPageUncheckedCreateWithoutResultInput> | CrawledPageCreateWithoutResultInput[] | CrawledPageUncheckedCreateWithoutResultInput[]
    connectOrCreate?: CrawledPageCreateOrConnectWithoutResultInput | CrawledPageCreateOrConnectWithoutResultInput[]
    createMany?: CrawledPageCreateManyResultInputEnvelope
    connect?: CrawledPageWhereUniqueInput | CrawledPageWhereUniqueInput[]
  }

  export type IssueUncheckedCreateNestedManyWithoutResultInput = {
    create?: XOR<IssueCreateWithoutResultInput, IssueUncheckedCreateWithoutResultInput> | IssueCreateWithoutResultInput[] | IssueUncheckedCreateWithoutResultInput[]
    connectOrCreate?: IssueCreateOrConnectWithoutResultInput | IssueCreateOrConnectWithoutResultInput[]
    createMany?: IssueCreateManyResultInputEnvelope
    connect?: IssueWhereUniqueInput | IssueWhereUniqueInput[]
  }

  export type CausalEdgeUncheckedCreateNestedManyWithoutResultInput = {
    create?: XOR<CausalEdgeCreateWithoutResultInput, CausalEdgeUncheckedCreateWithoutResultInput> | CausalEdgeCreateWithoutResultInput[] | CausalEdgeUncheckedCreateWithoutResultInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutResultInput | CausalEdgeCreateOrConnectWithoutResultInput[]
    createMany?: CausalEdgeCreateManyResultInputEnvelope
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
  }

  export type CrawledPageUncheckedCreateNestedManyWithoutResultInput = {
    create?: XOR<CrawledPageCreateWithoutResultInput, CrawledPageUncheckedCreateWithoutResultInput> | CrawledPageCreateWithoutResultInput[] | CrawledPageUncheckedCreateWithoutResultInput[]
    connectOrCreate?: CrawledPageCreateOrConnectWithoutResultInput | CrawledPageCreateOrConnectWithoutResultInput[]
    createMany?: CrawledPageCreateManyResultInputEnvelope
    connect?: CrawledPageWhereUniqueInput | CrawledPageWhereUniqueInput[]
  }

  export type JobUpdateOneRequiredWithoutResultNestedInput = {
    create?: XOR<JobCreateWithoutResultInput, JobUncheckedCreateWithoutResultInput>
    connectOrCreate?: JobCreateOrConnectWithoutResultInput
    upsert?: JobUpsertWithoutResultInput
    connect?: JobWhereUniqueInput
    update?: XOR<XOR<JobUpdateToOneWithWhereWithoutResultInput, JobUpdateWithoutResultInput>, JobUncheckedUpdateWithoutResultInput>
  }

  export type IssueUpdateManyWithoutResultNestedInput = {
    create?: XOR<IssueCreateWithoutResultInput, IssueUncheckedCreateWithoutResultInput> | IssueCreateWithoutResultInput[] | IssueUncheckedCreateWithoutResultInput[]
    connectOrCreate?: IssueCreateOrConnectWithoutResultInput | IssueCreateOrConnectWithoutResultInput[]
    upsert?: IssueUpsertWithWhereUniqueWithoutResultInput | IssueUpsertWithWhereUniqueWithoutResultInput[]
    createMany?: IssueCreateManyResultInputEnvelope
    set?: IssueWhereUniqueInput | IssueWhereUniqueInput[]
    disconnect?: IssueWhereUniqueInput | IssueWhereUniqueInput[]
    delete?: IssueWhereUniqueInput | IssueWhereUniqueInput[]
    connect?: IssueWhereUniqueInput | IssueWhereUniqueInput[]
    update?: IssueUpdateWithWhereUniqueWithoutResultInput | IssueUpdateWithWhereUniqueWithoutResultInput[]
    updateMany?: IssueUpdateManyWithWhereWithoutResultInput | IssueUpdateManyWithWhereWithoutResultInput[]
    deleteMany?: IssueScalarWhereInput | IssueScalarWhereInput[]
  }

  export type CausalEdgeUpdateManyWithoutResultNestedInput = {
    create?: XOR<CausalEdgeCreateWithoutResultInput, CausalEdgeUncheckedCreateWithoutResultInput> | CausalEdgeCreateWithoutResultInput[] | CausalEdgeUncheckedCreateWithoutResultInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutResultInput | CausalEdgeCreateOrConnectWithoutResultInput[]
    upsert?: CausalEdgeUpsertWithWhereUniqueWithoutResultInput | CausalEdgeUpsertWithWhereUniqueWithoutResultInput[]
    createMany?: CausalEdgeCreateManyResultInputEnvelope
    set?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    disconnect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    delete?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    update?: CausalEdgeUpdateWithWhereUniqueWithoutResultInput | CausalEdgeUpdateWithWhereUniqueWithoutResultInput[]
    updateMany?: CausalEdgeUpdateManyWithWhereWithoutResultInput | CausalEdgeUpdateManyWithWhereWithoutResultInput[]
    deleteMany?: CausalEdgeScalarWhereInput | CausalEdgeScalarWhereInput[]
  }

  export type CrawledPageUpdateManyWithoutResultNestedInput = {
    create?: XOR<CrawledPageCreateWithoutResultInput, CrawledPageUncheckedCreateWithoutResultInput> | CrawledPageCreateWithoutResultInput[] | CrawledPageUncheckedCreateWithoutResultInput[]
    connectOrCreate?: CrawledPageCreateOrConnectWithoutResultInput | CrawledPageCreateOrConnectWithoutResultInput[]
    upsert?: CrawledPageUpsertWithWhereUniqueWithoutResultInput | CrawledPageUpsertWithWhereUniqueWithoutResultInput[]
    createMany?: CrawledPageCreateManyResultInputEnvelope
    set?: CrawledPageWhereUniqueInput | CrawledPageWhereUniqueInput[]
    disconnect?: CrawledPageWhereUniqueInput | CrawledPageWhereUniqueInput[]
    delete?: CrawledPageWhereUniqueInput | CrawledPageWhereUniqueInput[]
    connect?: CrawledPageWhereUniqueInput | CrawledPageWhereUniqueInput[]
    update?: CrawledPageUpdateWithWhereUniqueWithoutResultInput | CrawledPageUpdateWithWhereUniqueWithoutResultInput[]
    updateMany?: CrawledPageUpdateManyWithWhereWithoutResultInput | CrawledPageUpdateManyWithWhereWithoutResultInput[]
    deleteMany?: CrawledPageScalarWhereInput | CrawledPageScalarWhereInput[]
  }

  export type IssueUncheckedUpdateManyWithoutResultNestedInput = {
    create?: XOR<IssueCreateWithoutResultInput, IssueUncheckedCreateWithoutResultInput> | IssueCreateWithoutResultInput[] | IssueUncheckedCreateWithoutResultInput[]
    connectOrCreate?: IssueCreateOrConnectWithoutResultInput | IssueCreateOrConnectWithoutResultInput[]
    upsert?: IssueUpsertWithWhereUniqueWithoutResultInput | IssueUpsertWithWhereUniqueWithoutResultInput[]
    createMany?: IssueCreateManyResultInputEnvelope
    set?: IssueWhereUniqueInput | IssueWhereUniqueInput[]
    disconnect?: IssueWhereUniqueInput | IssueWhereUniqueInput[]
    delete?: IssueWhereUniqueInput | IssueWhereUniqueInput[]
    connect?: IssueWhereUniqueInput | IssueWhereUniqueInput[]
    update?: IssueUpdateWithWhereUniqueWithoutResultInput | IssueUpdateWithWhereUniqueWithoutResultInput[]
    updateMany?: IssueUpdateManyWithWhereWithoutResultInput | IssueUpdateManyWithWhereWithoutResultInput[]
    deleteMany?: IssueScalarWhereInput | IssueScalarWhereInput[]
  }

  export type CausalEdgeUncheckedUpdateManyWithoutResultNestedInput = {
    create?: XOR<CausalEdgeCreateWithoutResultInput, CausalEdgeUncheckedCreateWithoutResultInput> | CausalEdgeCreateWithoutResultInput[] | CausalEdgeUncheckedCreateWithoutResultInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutResultInput | CausalEdgeCreateOrConnectWithoutResultInput[]
    upsert?: CausalEdgeUpsertWithWhereUniqueWithoutResultInput | CausalEdgeUpsertWithWhereUniqueWithoutResultInput[]
    createMany?: CausalEdgeCreateManyResultInputEnvelope
    set?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    disconnect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    delete?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    update?: CausalEdgeUpdateWithWhereUniqueWithoutResultInput | CausalEdgeUpdateWithWhereUniqueWithoutResultInput[]
    updateMany?: CausalEdgeUpdateManyWithWhereWithoutResultInput | CausalEdgeUpdateManyWithWhereWithoutResultInput[]
    deleteMany?: CausalEdgeScalarWhereInput | CausalEdgeScalarWhereInput[]
  }

  export type CrawledPageUncheckedUpdateManyWithoutResultNestedInput = {
    create?: XOR<CrawledPageCreateWithoutResultInput, CrawledPageUncheckedCreateWithoutResultInput> | CrawledPageCreateWithoutResultInput[] | CrawledPageUncheckedCreateWithoutResultInput[]
    connectOrCreate?: CrawledPageCreateOrConnectWithoutResultInput | CrawledPageCreateOrConnectWithoutResultInput[]
    upsert?: CrawledPageUpsertWithWhereUniqueWithoutResultInput | CrawledPageUpsertWithWhereUniqueWithoutResultInput[]
    createMany?: CrawledPageCreateManyResultInputEnvelope
    set?: CrawledPageWhereUniqueInput | CrawledPageWhereUniqueInput[]
    disconnect?: CrawledPageWhereUniqueInput | CrawledPageWhereUniqueInput[]
    delete?: CrawledPageWhereUniqueInput | CrawledPageWhereUniqueInput[]
    connect?: CrawledPageWhereUniqueInput | CrawledPageWhereUniqueInput[]
    update?: CrawledPageUpdateWithWhereUniqueWithoutResultInput | CrawledPageUpdateWithWhereUniqueWithoutResultInput[]
    updateMany?: CrawledPageUpdateManyWithWhereWithoutResultInput | CrawledPageUpdateManyWithWhereWithoutResultInput[]
    deleteMany?: CrawledPageScalarWhereInput | CrawledPageScalarWhereInput[]
  }

  export type ResultCreateNestedOneWithoutIssuesInput = {
    create?: XOR<ResultCreateWithoutIssuesInput, ResultUncheckedCreateWithoutIssuesInput>
    connectOrCreate?: ResultCreateOrConnectWithoutIssuesInput
    connect?: ResultWhereUniqueInput
  }

  export type CausalEdgeCreateNestedManyWithoutToIssueInput = {
    create?: XOR<CausalEdgeCreateWithoutToIssueInput, CausalEdgeUncheckedCreateWithoutToIssueInput> | CausalEdgeCreateWithoutToIssueInput[] | CausalEdgeUncheckedCreateWithoutToIssueInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutToIssueInput | CausalEdgeCreateOrConnectWithoutToIssueInput[]
    createMany?: CausalEdgeCreateManyToIssueInputEnvelope
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
  }

  export type CausalEdgeCreateNestedManyWithoutFromIssueInput = {
    create?: XOR<CausalEdgeCreateWithoutFromIssueInput, CausalEdgeUncheckedCreateWithoutFromIssueInput> | CausalEdgeCreateWithoutFromIssueInput[] | CausalEdgeUncheckedCreateWithoutFromIssueInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutFromIssueInput | CausalEdgeCreateOrConnectWithoutFromIssueInput[]
    createMany?: CausalEdgeCreateManyFromIssueInputEnvelope
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
  }

  export type CausalEdgeUncheckedCreateNestedManyWithoutToIssueInput = {
    create?: XOR<CausalEdgeCreateWithoutToIssueInput, CausalEdgeUncheckedCreateWithoutToIssueInput> | CausalEdgeCreateWithoutToIssueInput[] | CausalEdgeUncheckedCreateWithoutToIssueInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutToIssueInput | CausalEdgeCreateOrConnectWithoutToIssueInput[]
    createMany?: CausalEdgeCreateManyToIssueInputEnvelope
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
  }

  export type CausalEdgeUncheckedCreateNestedManyWithoutFromIssueInput = {
    create?: XOR<CausalEdgeCreateWithoutFromIssueInput, CausalEdgeUncheckedCreateWithoutFromIssueInput> | CausalEdgeCreateWithoutFromIssueInput[] | CausalEdgeUncheckedCreateWithoutFromIssueInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutFromIssueInput | CausalEdgeCreateOrConnectWithoutFromIssueInput[]
    createMany?: CausalEdgeCreateManyFromIssueInputEnvelope
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ResultUpdateOneRequiredWithoutIssuesNestedInput = {
    create?: XOR<ResultCreateWithoutIssuesInput, ResultUncheckedCreateWithoutIssuesInput>
    connectOrCreate?: ResultCreateOrConnectWithoutIssuesInput
    upsert?: ResultUpsertWithoutIssuesInput
    connect?: ResultWhereUniqueInput
    update?: XOR<XOR<ResultUpdateToOneWithWhereWithoutIssuesInput, ResultUpdateWithoutIssuesInput>, ResultUncheckedUpdateWithoutIssuesInput>
  }

  export type CausalEdgeUpdateManyWithoutToIssueNestedInput = {
    create?: XOR<CausalEdgeCreateWithoutToIssueInput, CausalEdgeUncheckedCreateWithoutToIssueInput> | CausalEdgeCreateWithoutToIssueInput[] | CausalEdgeUncheckedCreateWithoutToIssueInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutToIssueInput | CausalEdgeCreateOrConnectWithoutToIssueInput[]
    upsert?: CausalEdgeUpsertWithWhereUniqueWithoutToIssueInput | CausalEdgeUpsertWithWhereUniqueWithoutToIssueInput[]
    createMany?: CausalEdgeCreateManyToIssueInputEnvelope
    set?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    disconnect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    delete?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    update?: CausalEdgeUpdateWithWhereUniqueWithoutToIssueInput | CausalEdgeUpdateWithWhereUniqueWithoutToIssueInput[]
    updateMany?: CausalEdgeUpdateManyWithWhereWithoutToIssueInput | CausalEdgeUpdateManyWithWhereWithoutToIssueInput[]
    deleteMany?: CausalEdgeScalarWhereInput | CausalEdgeScalarWhereInput[]
  }

  export type CausalEdgeUpdateManyWithoutFromIssueNestedInput = {
    create?: XOR<CausalEdgeCreateWithoutFromIssueInput, CausalEdgeUncheckedCreateWithoutFromIssueInput> | CausalEdgeCreateWithoutFromIssueInput[] | CausalEdgeUncheckedCreateWithoutFromIssueInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutFromIssueInput | CausalEdgeCreateOrConnectWithoutFromIssueInput[]
    upsert?: CausalEdgeUpsertWithWhereUniqueWithoutFromIssueInput | CausalEdgeUpsertWithWhereUniqueWithoutFromIssueInput[]
    createMany?: CausalEdgeCreateManyFromIssueInputEnvelope
    set?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    disconnect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    delete?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    update?: CausalEdgeUpdateWithWhereUniqueWithoutFromIssueInput | CausalEdgeUpdateWithWhereUniqueWithoutFromIssueInput[]
    updateMany?: CausalEdgeUpdateManyWithWhereWithoutFromIssueInput | CausalEdgeUpdateManyWithWhereWithoutFromIssueInput[]
    deleteMany?: CausalEdgeScalarWhereInput | CausalEdgeScalarWhereInput[]
  }

  export type CausalEdgeUncheckedUpdateManyWithoutToIssueNestedInput = {
    create?: XOR<CausalEdgeCreateWithoutToIssueInput, CausalEdgeUncheckedCreateWithoutToIssueInput> | CausalEdgeCreateWithoutToIssueInput[] | CausalEdgeUncheckedCreateWithoutToIssueInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutToIssueInput | CausalEdgeCreateOrConnectWithoutToIssueInput[]
    upsert?: CausalEdgeUpsertWithWhereUniqueWithoutToIssueInput | CausalEdgeUpsertWithWhereUniqueWithoutToIssueInput[]
    createMany?: CausalEdgeCreateManyToIssueInputEnvelope
    set?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    disconnect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    delete?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    update?: CausalEdgeUpdateWithWhereUniqueWithoutToIssueInput | CausalEdgeUpdateWithWhereUniqueWithoutToIssueInput[]
    updateMany?: CausalEdgeUpdateManyWithWhereWithoutToIssueInput | CausalEdgeUpdateManyWithWhereWithoutToIssueInput[]
    deleteMany?: CausalEdgeScalarWhereInput | CausalEdgeScalarWhereInput[]
  }

  export type CausalEdgeUncheckedUpdateManyWithoutFromIssueNestedInput = {
    create?: XOR<CausalEdgeCreateWithoutFromIssueInput, CausalEdgeUncheckedCreateWithoutFromIssueInput> | CausalEdgeCreateWithoutFromIssueInput[] | CausalEdgeUncheckedCreateWithoutFromIssueInput[]
    connectOrCreate?: CausalEdgeCreateOrConnectWithoutFromIssueInput | CausalEdgeCreateOrConnectWithoutFromIssueInput[]
    upsert?: CausalEdgeUpsertWithWhereUniqueWithoutFromIssueInput | CausalEdgeUpsertWithWhereUniqueWithoutFromIssueInput[]
    createMany?: CausalEdgeCreateManyFromIssueInputEnvelope
    set?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    disconnect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    delete?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    connect?: CausalEdgeWhereUniqueInput | CausalEdgeWhereUniqueInput[]
    update?: CausalEdgeUpdateWithWhereUniqueWithoutFromIssueInput | CausalEdgeUpdateWithWhereUniqueWithoutFromIssueInput[]
    updateMany?: CausalEdgeUpdateManyWithWhereWithoutFromIssueInput | CausalEdgeUpdateManyWithWhereWithoutFromIssueInput[]
    deleteMany?: CausalEdgeScalarWhereInput | CausalEdgeScalarWhereInput[]
  }

  export type ResultCreateNestedOneWithoutEdgesInput = {
    create?: XOR<ResultCreateWithoutEdgesInput, ResultUncheckedCreateWithoutEdgesInput>
    connectOrCreate?: ResultCreateOrConnectWithoutEdgesInput
    connect?: ResultWhereUniqueInput
  }

  export type IssueCreateNestedOneWithoutCausesInput = {
    create?: XOR<IssueCreateWithoutCausesInput, IssueUncheckedCreateWithoutCausesInput>
    connectOrCreate?: IssueCreateOrConnectWithoutCausesInput
    connect?: IssueWhereUniqueInput
  }

  export type IssueCreateNestedOneWithoutCausedByInput = {
    create?: XOR<IssueCreateWithoutCausedByInput, IssueUncheckedCreateWithoutCausedByInput>
    connectOrCreate?: IssueCreateOrConnectWithoutCausedByInput
    connect?: IssueWhereUniqueInput
  }

  export type ResultUpdateOneRequiredWithoutEdgesNestedInput = {
    create?: XOR<ResultCreateWithoutEdgesInput, ResultUncheckedCreateWithoutEdgesInput>
    connectOrCreate?: ResultCreateOrConnectWithoutEdgesInput
    upsert?: ResultUpsertWithoutEdgesInput
    connect?: ResultWhereUniqueInput
    update?: XOR<XOR<ResultUpdateToOneWithWhereWithoutEdgesInput, ResultUpdateWithoutEdgesInput>, ResultUncheckedUpdateWithoutEdgesInput>
  }

  export type IssueUpdateOneRequiredWithoutCausesNestedInput = {
    create?: XOR<IssueCreateWithoutCausesInput, IssueUncheckedCreateWithoutCausesInput>
    connectOrCreate?: IssueCreateOrConnectWithoutCausesInput
    upsert?: IssueUpsertWithoutCausesInput
    connect?: IssueWhereUniqueInput
    update?: XOR<XOR<IssueUpdateToOneWithWhereWithoutCausesInput, IssueUpdateWithoutCausesInput>, IssueUncheckedUpdateWithoutCausesInput>
  }

  export type IssueUpdateOneRequiredWithoutCausedByNestedInput = {
    create?: XOR<IssueCreateWithoutCausedByInput, IssueUncheckedCreateWithoutCausedByInput>
    connectOrCreate?: IssueCreateOrConnectWithoutCausedByInput
    upsert?: IssueUpsertWithoutCausedByInput
    connect?: IssueWhereUniqueInput
    update?: XOR<XOR<IssueUpdateToOneWithWhereWithoutCausedByInput, IssueUpdateWithoutCausedByInput>, IssueUncheckedUpdateWithoutCausedByInput>
  }

  export type ResultCreateNestedOneWithoutCrawledPagesInput = {
    create?: XOR<ResultCreateWithoutCrawledPagesInput, ResultUncheckedCreateWithoutCrawledPagesInput>
    connectOrCreate?: ResultCreateOrConnectWithoutCrawledPagesInput
    connect?: ResultWhereUniqueInput
  }

  export type CrawledPageIssueCreateNestedManyWithoutCrawledPageInput = {
    create?: XOR<CrawledPageIssueCreateWithoutCrawledPageInput, CrawledPageIssueUncheckedCreateWithoutCrawledPageInput> | CrawledPageIssueCreateWithoutCrawledPageInput[] | CrawledPageIssueUncheckedCreateWithoutCrawledPageInput[]
    connectOrCreate?: CrawledPageIssueCreateOrConnectWithoutCrawledPageInput | CrawledPageIssueCreateOrConnectWithoutCrawledPageInput[]
    createMany?: CrawledPageIssueCreateManyCrawledPageInputEnvelope
    connect?: CrawledPageIssueWhereUniqueInput | CrawledPageIssueWhereUniqueInput[]
  }

  export type CrawledPageEdgeCreateNestedManyWithoutCrawledPageInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutCrawledPageInput, CrawledPageEdgeUncheckedCreateWithoutCrawledPageInput> | CrawledPageEdgeCreateWithoutCrawledPageInput[] | CrawledPageEdgeUncheckedCreateWithoutCrawledPageInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutCrawledPageInput | CrawledPageEdgeCreateOrConnectWithoutCrawledPageInput[]
    createMany?: CrawledPageEdgeCreateManyCrawledPageInputEnvelope
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
  }

  export type CrawledPageIssueUncheckedCreateNestedManyWithoutCrawledPageInput = {
    create?: XOR<CrawledPageIssueCreateWithoutCrawledPageInput, CrawledPageIssueUncheckedCreateWithoutCrawledPageInput> | CrawledPageIssueCreateWithoutCrawledPageInput[] | CrawledPageIssueUncheckedCreateWithoutCrawledPageInput[]
    connectOrCreate?: CrawledPageIssueCreateOrConnectWithoutCrawledPageInput | CrawledPageIssueCreateOrConnectWithoutCrawledPageInput[]
    createMany?: CrawledPageIssueCreateManyCrawledPageInputEnvelope
    connect?: CrawledPageIssueWhereUniqueInput | CrawledPageIssueWhereUniqueInput[]
  }

  export type CrawledPageEdgeUncheckedCreateNestedManyWithoutCrawledPageInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutCrawledPageInput, CrawledPageEdgeUncheckedCreateWithoutCrawledPageInput> | CrawledPageEdgeCreateWithoutCrawledPageInput[] | CrawledPageEdgeUncheckedCreateWithoutCrawledPageInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutCrawledPageInput | CrawledPageEdgeCreateOrConnectWithoutCrawledPageInput[]
    createMany?: CrawledPageEdgeCreateManyCrawledPageInputEnvelope
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
  }

  export type ResultUpdateOneRequiredWithoutCrawledPagesNestedInput = {
    create?: XOR<ResultCreateWithoutCrawledPagesInput, ResultUncheckedCreateWithoutCrawledPagesInput>
    connectOrCreate?: ResultCreateOrConnectWithoutCrawledPagesInput
    upsert?: ResultUpsertWithoutCrawledPagesInput
    connect?: ResultWhereUniqueInput
    update?: XOR<XOR<ResultUpdateToOneWithWhereWithoutCrawledPagesInput, ResultUpdateWithoutCrawledPagesInput>, ResultUncheckedUpdateWithoutCrawledPagesInput>
  }

  export type CrawledPageIssueUpdateManyWithoutCrawledPageNestedInput = {
    create?: XOR<CrawledPageIssueCreateWithoutCrawledPageInput, CrawledPageIssueUncheckedCreateWithoutCrawledPageInput> | CrawledPageIssueCreateWithoutCrawledPageInput[] | CrawledPageIssueUncheckedCreateWithoutCrawledPageInput[]
    connectOrCreate?: CrawledPageIssueCreateOrConnectWithoutCrawledPageInput | CrawledPageIssueCreateOrConnectWithoutCrawledPageInput[]
    upsert?: CrawledPageIssueUpsertWithWhereUniqueWithoutCrawledPageInput | CrawledPageIssueUpsertWithWhereUniqueWithoutCrawledPageInput[]
    createMany?: CrawledPageIssueCreateManyCrawledPageInputEnvelope
    set?: CrawledPageIssueWhereUniqueInput | CrawledPageIssueWhereUniqueInput[]
    disconnect?: CrawledPageIssueWhereUniqueInput | CrawledPageIssueWhereUniqueInput[]
    delete?: CrawledPageIssueWhereUniqueInput | CrawledPageIssueWhereUniqueInput[]
    connect?: CrawledPageIssueWhereUniqueInput | CrawledPageIssueWhereUniqueInput[]
    update?: CrawledPageIssueUpdateWithWhereUniqueWithoutCrawledPageInput | CrawledPageIssueUpdateWithWhereUniqueWithoutCrawledPageInput[]
    updateMany?: CrawledPageIssueUpdateManyWithWhereWithoutCrawledPageInput | CrawledPageIssueUpdateManyWithWhereWithoutCrawledPageInput[]
    deleteMany?: CrawledPageIssueScalarWhereInput | CrawledPageIssueScalarWhereInput[]
  }

  export type CrawledPageEdgeUpdateManyWithoutCrawledPageNestedInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutCrawledPageInput, CrawledPageEdgeUncheckedCreateWithoutCrawledPageInput> | CrawledPageEdgeCreateWithoutCrawledPageInput[] | CrawledPageEdgeUncheckedCreateWithoutCrawledPageInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutCrawledPageInput | CrawledPageEdgeCreateOrConnectWithoutCrawledPageInput[]
    upsert?: CrawledPageEdgeUpsertWithWhereUniqueWithoutCrawledPageInput | CrawledPageEdgeUpsertWithWhereUniqueWithoutCrawledPageInput[]
    createMany?: CrawledPageEdgeCreateManyCrawledPageInputEnvelope
    set?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    disconnect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    delete?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    update?: CrawledPageEdgeUpdateWithWhereUniqueWithoutCrawledPageInput | CrawledPageEdgeUpdateWithWhereUniqueWithoutCrawledPageInput[]
    updateMany?: CrawledPageEdgeUpdateManyWithWhereWithoutCrawledPageInput | CrawledPageEdgeUpdateManyWithWhereWithoutCrawledPageInput[]
    deleteMany?: CrawledPageEdgeScalarWhereInput | CrawledPageEdgeScalarWhereInput[]
  }

  export type CrawledPageIssueUncheckedUpdateManyWithoutCrawledPageNestedInput = {
    create?: XOR<CrawledPageIssueCreateWithoutCrawledPageInput, CrawledPageIssueUncheckedCreateWithoutCrawledPageInput> | CrawledPageIssueCreateWithoutCrawledPageInput[] | CrawledPageIssueUncheckedCreateWithoutCrawledPageInput[]
    connectOrCreate?: CrawledPageIssueCreateOrConnectWithoutCrawledPageInput | CrawledPageIssueCreateOrConnectWithoutCrawledPageInput[]
    upsert?: CrawledPageIssueUpsertWithWhereUniqueWithoutCrawledPageInput | CrawledPageIssueUpsertWithWhereUniqueWithoutCrawledPageInput[]
    createMany?: CrawledPageIssueCreateManyCrawledPageInputEnvelope
    set?: CrawledPageIssueWhereUniqueInput | CrawledPageIssueWhereUniqueInput[]
    disconnect?: CrawledPageIssueWhereUniqueInput | CrawledPageIssueWhereUniqueInput[]
    delete?: CrawledPageIssueWhereUniqueInput | CrawledPageIssueWhereUniqueInput[]
    connect?: CrawledPageIssueWhereUniqueInput | CrawledPageIssueWhereUniqueInput[]
    update?: CrawledPageIssueUpdateWithWhereUniqueWithoutCrawledPageInput | CrawledPageIssueUpdateWithWhereUniqueWithoutCrawledPageInput[]
    updateMany?: CrawledPageIssueUpdateManyWithWhereWithoutCrawledPageInput | CrawledPageIssueUpdateManyWithWhereWithoutCrawledPageInput[]
    deleteMany?: CrawledPageIssueScalarWhereInput | CrawledPageIssueScalarWhereInput[]
  }

  export type CrawledPageEdgeUncheckedUpdateManyWithoutCrawledPageNestedInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutCrawledPageInput, CrawledPageEdgeUncheckedCreateWithoutCrawledPageInput> | CrawledPageEdgeCreateWithoutCrawledPageInput[] | CrawledPageEdgeUncheckedCreateWithoutCrawledPageInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutCrawledPageInput | CrawledPageEdgeCreateOrConnectWithoutCrawledPageInput[]
    upsert?: CrawledPageEdgeUpsertWithWhereUniqueWithoutCrawledPageInput | CrawledPageEdgeUpsertWithWhereUniqueWithoutCrawledPageInput[]
    createMany?: CrawledPageEdgeCreateManyCrawledPageInputEnvelope
    set?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    disconnect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    delete?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    update?: CrawledPageEdgeUpdateWithWhereUniqueWithoutCrawledPageInput | CrawledPageEdgeUpdateWithWhereUniqueWithoutCrawledPageInput[]
    updateMany?: CrawledPageEdgeUpdateManyWithWhereWithoutCrawledPageInput | CrawledPageEdgeUpdateManyWithWhereWithoutCrawledPageInput[]
    deleteMany?: CrawledPageEdgeScalarWhereInput | CrawledPageEdgeScalarWhereInput[]
  }

  export type CrawledPageCreateNestedOneWithoutIssuesInput = {
    create?: XOR<CrawledPageCreateWithoutIssuesInput, CrawledPageUncheckedCreateWithoutIssuesInput>
    connectOrCreate?: CrawledPageCreateOrConnectWithoutIssuesInput
    connect?: CrawledPageWhereUniqueInput
  }

  export type CrawledPageEdgeCreateNestedManyWithoutToIssueInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutToIssueInput, CrawledPageEdgeUncheckedCreateWithoutToIssueInput> | CrawledPageEdgeCreateWithoutToIssueInput[] | CrawledPageEdgeUncheckedCreateWithoutToIssueInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutToIssueInput | CrawledPageEdgeCreateOrConnectWithoutToIssueInput[]
    createMany?: CrawledPageEdgeCreateManyToIssueInputEnvelope
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
  }

  export type CrawledPageEdgeCreateNestedManyWithoutFromIssueInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutFromIssueInput, CrawledPageEdgeUncheckedCreateWithoutFromIssueInput> | CrawledPageEdgeCreateWithoutFromIssueInput[] | CrawledPageEdgeUncheckedCreateWithoutFromIssueInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutFromIssueInput | CrawledPageEdgeCreateOrConnectWithoutFromIssueInput[]
    createMany?: CrawledPageEdgeCreateManyFromIssueInputEnvelope
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
  }

  export type CrawledPageEdgeUncheckedCreateNestedManyWithoutToIssueInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutToIssueInput, CrawledPageEdgeUncheckedCreateWithoutToIssueInput> | CrawledPageEdgeCreateWithoutToIssueInput[] | CrawledPageEdgeUncheckedCreateWithoutToIssueInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutToIssueInput | CrawledPageEdgeCreateOrConnectWithoutToIssueInput[]
    createMany?: CrawledPageEdgeCreateManyToIssueInputEnvelope
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
  }

  export type CrawledPageEdgeUncheckedCreateNestedManyWithoutFromIssueInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutFromIssueInput, CrawledPageEdgeUncheckedCreateWithoutFromIssueInput> | CrawledPageEdgeCreateWithoutFromIssueInput[] | CrawledPageEdgeUncheckedCreateWithoutFromIssueInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutFromIssueInput | CrawledPageEdgeCreateOrConnectWithoutFromIssueInput[]
    createMany?: CrawledPageEdgeCreateManyFromIssueInputEnvelope
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
  }

  export type CrawledPageUpdateOneRequiredWithoutIssuesNestedInput = {
    create?: XOR<CrawledPageCreateWithoutIssuesInput, CrawledPageUncheckedCreateWithoutIssuesInput>
    connectOrCreate?: CrawledPageCreateOrConnectWithoutIssuesInput
    upsert?: CrawledPageUpsertWithoutIssuesInput
    connect?: CrawledPageWhereUniqueInput
    update?: XOR<XOR<CrawledPageUpdateToOneWithWhereWithoutIssuesInput, CrawledPageUpdateWithoutIssuesInput>, CrawledPageUncheckedUpdateWithoutIssuesInput>
  }

  export type CrawledPageEdgeUpdateManyWithoutToIssueNestedInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutToIssueInput, CrawledPageEdgeUncheckedCreateWithoutToIssueInput> | CrawledPageEdgeCreateWithoutToIssueInput[] | CrawledPageEdgeUncheckedCreateWithoutToIssueInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutToIssueInput | CrawledPageEdgeCreateOrConnectWithoutToIssueInput[]
    upsert?: CrawledPageEdgeUpsertWithWhereUniqueWithoutToIssueInput | CrawledPageEdgeUpsertWithWhereUniqueWithoutToIssueInput[]
    createMany?: CrawledPageEdgeCreateManyToIssueInputEnvelope
    set?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    disconnect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    delete?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    update?: CrawledPageEdgeUpdateWithWhereUniqueWithoutToIssueInput | CrawledPageEdgeUpdateWithWhereUniqueWithoutToIssueInput[]
    updateMany?: CrawledPageEdgeUpdateManyWithWhereWithoutToIssueInput | CrawledPageEdgeUpdateManyWithWhereWithoutToIssueInput[]
    deleteMany?: CrawledPageEdgeScalarWhereInput | CrawledPageEdgeScalarWhereInput[]
  }

  export type CrawledPageEdgeUpdateManyWithoutFromIssueNestedInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutFromIssueInput, CrawledPageEdgeUncheckedCreateWithoutFromIssueInput> | CrawledPageEdgeCreateWithoutFromIssueInput[] | CrawledPageEdgeUncheckedCreateWithoutFromIssueInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutFromIssueInput | CrawledPageEdgeCreateOrConnectWithoutFromIssueInput[]
    upsert?: CrawledPageEdgeUpsertWithWhereUniqueWithoutFromIssueInput | CrawledPageEdgeUpsertWithWhereUniqueWithoutFromIssueInput[]
    createMany?: CrawledPageEdgeCreateManyFromIssueInputEnvelope
    set?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    disconnect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    delete?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    update?: CrawledPageEdgeUpdateWithWhereUniqueWithoutFromIssueInput | CrawledPageEdgeUpdateWithWhereUniqueWithoutFromIssueInput[]
    updateMany?: CrawledPageEdgeUpdateManyWithWhereWithoutFromIssueInput | CrawledPageEdgeUpdateManyWithWhereWithoutFromIssueInput[]
    deleteMany?: CrawledPageEdgeScalarWhereInput | CrawledPageEdgeScalarWhereInput[]
  }

  export type CrawledPageEdgeUncheckedUpdateManyWithoutToIssueNestedInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutToIssueInput, CrawledPageEdgeUncheckedCreateWithoutToIssueInput> | CrawledPageEdgeCreateWithoutToIssueInput[] | CrawledPageEdgeUncheckedCreateWithoutToIssueInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutToIssueInput | CrawledPageEdgeCreateOrConnectWithoutToIssueInput[]
    upsert?: CrawledPageEdgeUpsertWithWhereUniqueWithoutToIssueInput | CrawledPageEdgeUpsertWithWhereUniqueWithoutToIssueInput[]
    createMany?: CrawledPageEdgeCreateManyToIssueInputEnvelope
    set?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    disconnect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    delete?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    update?: CrawledPageEdgeUpdateWithWhereUniqueWithoutToIssueInput | CrawledPageEdgeUpdateWithWhereUniqueWithoutToIssueInput[]
    updateMany?: CrawledPageEdgeUpdateManyWithWhereWithoutToIssueInput | CrawledPageEdgeUpdateManyWithWhereWithoutToIssueInput[]
    deleteMany?: CrawledPageEdgeScalarWhereInput | CrawledPageEdgeScalarWhereInput[]
  }

  export type CrawledPageEdgeUncheckedUpdateManyWithoutFromIssueNestedInput = {
    create?: XOR<CrawledPageEdgeCreateWithoutFromIssueInput, CrawledPageEdgeUncheckedCreateWithoutFromIssueInput> | CrawledPageEdgeCreateWithoutFromIssueInput[] | CrawledPageEdgeUncheckedCreateWithoutFromIssueInput[]
    connectOrCreate?: CrawledPageEdgeCreateOrConnectWithoutFromIssueInput | CrawledPageEdgeCreateOrConnectWithoutFromIssueInput[]
    upsert?: CrawledPageEdgeUpsertWithWhereUniqueWithoutFromIssueInput | CrawledPageEdgeUpsertWithWhereUniqueWithoutFromIssueInput[]
    createMany?: CrawledPageEdgeCreateManyFromIssueInputEnvelope
    set?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    disconnect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    delete?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    connect?: CrawledPageEdgeWhereUniqueInput | CrawledPageEdgeWhereUniqueInput[]
    update?: CrawledPageEdgeUpdateWithWhereUniqueWithoutFromIssueInput | CrawledPageEdgeUpdateWithWhereUniqueWithoutFromIssueInput[]
    updateMany?: CrawledPageEdgeUpdateManyWithWhereWithoutFromIssueInput | CrawledPageEdgeUpdateManyWithWhereWithoutFromIssueInput[]
    deleteMany?: CrawledPageEdgeScalarWhereInput | CrawledPageEdgeScalarWhereInput[]
  }

  export type CrawledPageCreateNestedOneWithoutEdgesInput = {
    create?: XOR<CrawledPageCreateWithoutEdgesInput, CrawledPageUncheckedCreateWithoutEdgesInput>
    connectOrCreate?: CrawledPageCreateOrConnectWithoutEdgesInput
    connect?: CrawledPageWhereUniqueInput
  }

  export type CrawledPageIssueCreateNestedOneWithoutCausesInput = {
    create?: XOR<CrawledPageIssueCreateWithoutCausesInput, CrawledPageIssueUncheckedCreateWithoutCausesInput>
    connectOrCreate?: CrawledPageIssueCreateOrConnectWithoutCausesInput
    connect?: CrawledPageIssueWhereUniqueInput
  }

  export type CrawledPageIssueCreateNestedOneWithoutCausedByInput = {
    create?: XOR<CrawledPageIssueCreateWithoutCausedByInput, CrawledPageIssueUncheckedCreateWithoutCausedByInput>
    connectOrCreate?: CrawledPageIssueCreateOrConnectWithoutCausedByInput
    connect?: CrawledPageIssueWhereUniqueInput
  }

  export type CrawledPageUpdateOneRequiredWithoutEdgesNestedInput = {
    create?: XOR<CrawledPageCreateWithoutEdgesInput, CrawledPageUncheckedCreateWithoutEdgesInput>
    connectOrCreate?: CrawledPageCreateOrConnectWithoutEdgesInput
    upsert?: CrawledPageUpsertWithoutEdgesInput
    connect?: CrawledPageWhereUniqueInput
    update?: XOR<XOR<CrawledPageUpdateToOneWithWhereWithoutEdgesInput, CrawledPageUpdateWithoutEdgesInput>, CrawledPageUncheckedUpdateWithoutEdgesInput>
  }

  export type CrawledPageIssueUpdateOneRequiredWithoutCausesNestedInput = {
    create?: XOR<CrawledPageIssueCreateWithoutCausesInput, CrawledPageIssueUncheckedCreateWithoutCausesInput>
    connectOrCreate?: CrawledPageIssueCreateOrConnectWithoutCausesInput
    upsert?: CrawledPageIssueUpsertWithoutCausesInput
    connect?: CrawledPageIssueWhereUniqueInput
    update?: XOR<XOR<CrawledPageIssueUpdateToOneWithWhereWithoutCausesInput, CrawledPageIssueUpdateWithoutCausesInput>, CrawledPageIssueUncheckedUpdateWithoutCausesInput>
  }

  export type CrawledPageIssueUpdateOneRequiredWithoutCausedByNestedInput = {
    create?: XOR<CrawledPageIssueCreateWithoutCausedByInput, CrawledPageIssueUncheckedCreateWithoutCausedByInput>
    connectOrCreate?: CrawledPageIssueCreateOrConnectWithoutCausedByInput
    upsert?: CrawledPageIssueUpsertWithoutCausedByInput
    connect?: CrawledPageIssueWhereUniqueInput
    update?: XOR<XOR<CrawledPageIssueUpdateToOneWithWhereWithoutCausedByInput, CrawledPageIssueUpdateWithoutCausedByInput>, CrawledPageIssueUncheckedUpdateWithoutCausedByInput>
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

  export type NestedEnumJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusFilter<$PrismaModel> | $Enums.JobStatus
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

  export type NestedEnumJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.JobStatus | EnumJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.JobStatus[] | ListEnumJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.JobStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumJobStatusFilter<$PrismaModel>
    _max?: NestedEnumJobStatusFilter<$PrismaModel>
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
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
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

  export type ResultCreateWithoutJobInput = {
    id?: string
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    issues?: IssueCreateNestedManyWithoutResultInput
    edges?: CausalEdgeCreateNestedManyWithoutResultInput
    crawledPages?: CrawledPageCreateNestedManyWithoutResultInput
  }

  export type ResultUncheckedCreateWithoutJobInput = {
    id?: string
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    issues?: IssueUncheckedCreateNestedManyWithoutResultInput
    edges?: CausalEdgeUncheckedCreateNestedManyWithoutResultInput
    crawledPages?: CrawledPageUncheckedCreateNestedManyWithoutResultInput
  }

  export type ResultCreateOrConnectWithoutJobInput = {
    where: ResultWhereUniqueInput
    create: XOR<ResultCreateWithoutJobInput, ResultUncheckedCreateWithoutJobInput>
  }

  export type ResultUpsertWithoutJobInput = {
    update: XOR<ResultUpdateWithoutJobInput, ResultUncheckedUpdateWithoutJobInput>
    create: XOR<ResultCreateWithoutJobInput, ResultUncheckedCreateWithoutJobInput>
    where?: ResultWhereInput
  }

  export type ResultUpdateToOneWithWhereWithoutJobInput = {
    where?: ResultWhereInput
    data: XOR<ResultUpdateWithoutJobInput, ResultUncheckedUpdateWithoutJobInput>
  }

  export type ResultUpdateWithoutJobInput = {
    id?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    issues?: IssueUpdateManyWithoutResultNestedInput
    edges?: CausalEdgeUpdateManyWithoutResultNestedInput
    crawledPages?: CrawledPageUpdateManyWithoutResultNestedInput
  }

  export type ResultUncheckedUpdateWithoutJobInput = {
    id?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    issues?: IssueUncheckedUpdateManyWithoutResultNestedInput
    edges?: CausalEdgeUncheckedUpdateManyWithoutResultNestedInput
    crawledPages?: CrawledPageUncheckedUpdateManyWithoutResultNestedInput
  }

  export type JobCreateWithoutResultInput = {
    id?: string
    url: string
    status?: $Enums.JobStatus
    error_message?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type JobUncheckedCreateWithoutResultInput = {
    id?: string
    url: string
    status?: $Enums.JobStatus
    error_message?: string | null
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type JobCreateOrConnectWithoutResultInput = {
    where: JobWhereUniqueInput
    create: XOR<JobCreateWithoutResultInput, JobUncheckedCreateWithoutResultInput>
  }

  export type IssueCreateWithoutResultInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    causedBy?: CausalEdgeCreateNestedManyWithoutToIssueInput
    causes?: CausalEdgeCreateNestedManyWithoutFromIssueInput
  }

  export type IssueUncheckedCreateWithoutResultInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    causedBy?: CausalEdgeUncheckedCreateNestedManyWithoutToIssueInput
    causes?: CausalEdgeUncheckedCreateNestedManyWithoutFromIssueInput
  }

  export type IssueCreateOrConnectWithoutResultInput = {
    where: IssueWhereUniqueInput
    create: XOR<IssueCreateWithoutResultInput, IssueUncheckedCreateWithoutResultInput>
  }

  export type IssueCreateManyResultInputEnvelope = {
    data: IssueCreateManyResultInput | IssueCreateManyResultInput[]
    skipDuplicates?: boolean
  }

  export type CausalEdgeCreateWithoutResultInput = {
    id?: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
    fromIssue: IssueCreateNestedOneWithoutCausesInput
    toIssue: IssueCreateNestedOneWithoutCausedByInput
  }

  export type CausalEdgeUncheckedCreateWithoutResultInput = {
    id?: string
    fromIssueId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CausalEdgeCreateOrConnectWithoutResultInput = {
    where: CausalEdgeWhereUniqueInput
    create: XOR<CausalEdgeCreateWithoutResultInput, CausalEdgeUncheckedCreateWithoutResultInput>
  }

  export type CausalEdgeCreateManyResultInputEnvelope = {
    data: CausalEdgeCreateManyResultInput | CausalEdgeCreateManyResultInput[]
    skipDuplicates?: boolean
  }

  export type CrawledPageCreateWithoutResultInput = {
    id?: string
    url: string
    page_index: number
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    issues?: CrawledPageIssueCreateNestedManyWithoutCrawledPageInput
    edges?: CrawledPageEdgeCreateNestedManyWithoutCrawledPageInput
  }

  export type CrawledPageUncheckedCreateWithoutResultInput = {
    id?: string
    url: string
    page_index: number
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    issues?: CrawledPageIssueUncheckedCreateNestedManyWithoutCrawledPageInput
    edges?: CrawledPageEdgeUncheckedCreateNestedManyWithoutCrawledPageInput
  }

  export type CrawledPageCreateOrConnectWithoutResultInput = {
    where: CrawledPageWhereUniqueInput
    create: XOR<CrawledPageCreateWithoutResultInput, CrawledPageUncheckedCreateWithoutResultInput>
  }

  export type CrawledPageCreateManyResultInputEnvelope = {
    data: CrawledPageCreateManyResultInput | CrawledPageCreateManyResultInput[]
    skipDuplicates?: boolean
  }

  export type JobUpsertWithoutResultInput = {
    update: XOR<JobUpdateWithoutResultInput, JobUncheckedUpdateWithoutResultInput>
    create: XOR<JobCreateWithoutResultInput, JobUncheckedCreateWithoutResultInput>
    where?: JobWhereInput
  }

  export type JobUpdateToOneWithWhereWithoutResultInput = {
    where?: JobWhereInput
    data: XOR<JobUpdateWithoutResultInput, JobUncheckedUpdateWithoutResultInput>
  }

  export type JobUpdateWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    error_message?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobUncheckedUpdateWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    status?: EnumJobStatusFieldUpdateOperationsInput | $Enums.JobStatus
    error_message?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IssueUpsertWithWhereUniqueWithoutResultInput = {
    where: IssueWhereUniqueInput
    update: XOR<IssueUpdateWithoutResultInput, IssueUncheckedUpdateWithoutResultInput>
    create: XOR<IssueCreateWithoutResultInput, IssueUncheckedCreateWithoutResultInput>
  }

  export type IssueUpdateWithWhereUniqueWithoutResultInput = {
    where: IssueWhereUniqueInput
    data: XOR<IssueUpdateWithoutResultInput, IssueUncheckedUpdateWithoutResultInput>
  }

  export type IssueUpdateManyWithWhereWithoutResultInput = {
    where: IssueScalarWhereInput
    data: XOR<IssueUpdateManyMutationInput, IssueUncheckedUpdateManyWithoutResultInput>
  }

  export type IssueScalarWhereInput = {
    AND?: IssueScalarWhereInput | IssueScalarWhereInput[]
    OR?: IssueScalarWhereInput[]
    NOT?: IssueScalarWhereInput | IssueScalarWhereInput[]
    id?: StringFilter<"Issue"> | string
    resultId?: StringFilter<"Issue"> | string
    category?: StringFilter<"Issue"> | string
    signal_source?: StringFilter<"Issue"> | string
    severity?: IntFilter<"Issue"> | number
    raw_evidence?: StringFilter<"Issue"> | string
    technical_description?: StringFilter<"Issue"> | string
    fix_suggestion?: StringFilter<"Issue"> | string
    severity_justification?: StringFilter<"Issue"> | string
  }

  export type CausalEdgeUpsertWithWhereUniqueWithoutResultInput = {
    where: CausalEdgeWhereUniqueInput
    update: XOR<CausalEdgeUpdateWithoutResultInput, CausalEdgeUncheckedUpdateWithoutResultInput>
    create: XOR<CausalEdgeCreateWithoutResultInput, CausalEdgeUncheckedCreateWithoutResultInput>
  }

  export type CausalEdgeUpdateWithWhereUniqueWithoutResultInput = {
    where: CausalEdgeWhereUniqueInput
    data: XOR<CausalEdgeUpdateWithoutResultInput, CausalEdgeUncheckedUpdateWithoutResultInput>
  }

  export type CausalEdgeUpdateManyWithWhereWithoutResultInput = {
    where: CausalEdgeScalarWhereInput
    data: XOR<CausalEdgeUpdateManyMutationInput, CausalEdgeUncheckedUpdateManyWithoutResultInput>
  }

  export type CausalEdgeScalarWhereInput = {
    AND?: CausalEdgeScalarWhereInput | CausalEdgeScalarWhereInput[]
    OR?: CausalEdgeScalarWhereInput[]
    NOT?: CausalEdgeScalarWhereInput | CausalEdgeScalarWhereInput[]
    id?: StringFilter<"CausalEdge"> | string
    resultId?: StringFilter<"CausalEdge"> | string
    fromIssueId?: StringFilter<"CausalEdge"> | string
    toIssueId?: StringFilter<"CausalEdge"> | string
    relationship?: StringFilter<"CausalEdge"> | string
    confidence?: StringFilter<"CausalEdge"> | string
    mechanism?: StringFilter<"CausalEdge"> | string
    explanation?: StringFilter<"CausalEdge"> | string
  }

  export type CrawledPageUpsertWithWhereUniqueWithoutResultInput = {
    where: CrawledPageWhereUniqueInput
    update: XOR<CrawledPageUpdateWithoutResultInput, CrawledPageUncheckedUpdateWithoutResultInput>
    create: XOR<CrawledPageCreateWithoutResultInput, CrawledPageUncheckedCreateWithoutResultInput>
  }

  export type CrawledPageUpdateWithWhereUniqueWithoutResultInput = {
    where: CrawledPageWhereUniqueInput
    data: XOR<CrawledPageUpdateWithoutResultInput, CrawledPageUncheckedUpdateWithoutResultInput>
  }

  export type CrawledPageUpdateManyWithWhereWithoutResultInput = {
    where: CrawledPageScalarWhereInput
    data: XOR<CrawledPageUpdateManyMutationInput, CrawledPageUncheckedUpdateManyWithoutResultInput>
  }

  export type CrawledPageScalarWhereInput = {
    AND?: CrawledPageScalarWhereInput | CrawledPageScalarWhereInput[]
    OR?: CrawledPageScalarWhereInput[]
    NOT?: CrawledPageScalarWhereInput | CrawledPageScalarWhereInput[]
    id?: StringFilter<"CrawledPage"> | string
    resultId?: StringFilter<"CrawledPage"> | string
    url?: StringFilter<"CrawledPage"> | string
    page_index?: IntFilter<"CrawledPage"> | number
    narrative?: JsonFilter<"CrawledPage">
    screenshot_url?: StringNullableFilter<"CrawledPage"> | string | null
    tech_stack?: JsonNullableFilter<"CrawledPage">
    created_at?: DateTimeFilter<"CrawledPage"> | Date | string
  }

  export type ResultCreateWithoutIssuesInput = {
    id?: string
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    job: JobCreateNestedOneWithoutResultInput
    edges?: CausalEdgeCreateNestedManyWithoutResultInput
    crawledPages?: CrawledPageCreateNestedManyWithoutResultInput
  }

  export type ResultUncheckedCreateWithoutIssuesInput = {
    id?: string
    jobId: string
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    edges?: CausalEdgeUncheckedCreateNestedManyWithoutResultInput
    crawledPages?: CrawledPageUncheckedCreateNestedManyWithoutResultInput
  }

  export type ResultCreateOrConnectWithoutIssuesInput = {
    where: ResultWhereUniqueInput
    create: XOR<ResultCreateWithoutIssuesInput, ResultUncheckedCreateWithoutIssuesInput>
  }

  export type CausalEdgeCreateWithoutToIssueInput = {
    id?: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
    result: ResultCreateNestedOneWithoutEdgesInput
    fromIssue: IssueCreateNestedOneWithoutCausesInput
  }

  export type CausalEdgeUncheckedCreateWithoutToIssueInput = {
    id?: string
    resultId: string
    fromIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CausalEdgeCreateOrConnectWithoutToIssueInput = {
    where: CausalEdgeWhereUniqueInput
    create: XOR<CausalEdgeCreateWithoutToIssueInput, CausalEdgeUncheckedCreateWithoutToIssueInput>
  }

  export type CausalEdgeCreateManyToIssueInputEnvelope = {
    data: CausalEdgeCreateManyToIssueInput | CausalEdgeCreateManyToIssueInput[]
    skipDuplicates?: boolean
  }

  export type CausalEdgeCreateWithoutFromIssueInput = {
    id?: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
    result: ResultCreateNestedOneWithoutEdgesInput
    toIssue: IssueCreateNestedOneWithoutCausedByInput
  }

  export type CausalEdgeUncheckedCreateWithoutFromIssueInput = {
    id?: string
    resultId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CausalEdgeCreateOrConnectWithoutFromIssueInput = {
    where: CausalEdgeWhereUniqueInput
    create: XOR<CausalEdgeCreateWithoutFromIssueInput, CausalEdgeUncheckedCreateWithoutFromIssueInput>
  }

  export type CausalEdgeCreateManyFromIssueInputEnvelope = {
    data: CausalEdgeCreateManyFromIssueInput | CausalEdgeCreateManyFromIssueInput[]
    skipDuplicates?: boolean
  }

  export type ResultUpsertWithoutIssuesInput = {
    update: XOR<ResultUpdateWithoutIssuesInput, ResultUncheckedUpdateWithoutIssuesInput>
    create: XOR<ResultCreateWithoutIssuesInput, ResultUncheckedCreateWithoutIssuesInput>
    where?: ResultWhereInput
  }

  export type ResultUpdateToOneWithWhereWithoutIssuesInput = {
    where?: ResultWhereInput
    data: XOR<ResultUpdateWithoutIssuesInput, ResultUncheckedUpdateWithoutIssuesInput>
  }

  export type ResultUpdateWithoutIssuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    job?: JobUpdateOneRequiredWithoutResultNestedInput
    edges?: CausalEdgeUpdateManyWithoutResultNestedInput
    crawledPages?: CrawledPageUpdateManyWithoutResultNestedInput
  }

  export type ResultUncheckedUpdateWithoutIssuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    edges?: CausalEdgeUncheckedUpdateManyWithoutResultNestedInput
    crawledPages?: CrawledPageUncheckedUpdateManyWithoutResultNestedInput
  }

  export type CausalEdgeUpsertWithWhereUniqueWithoutToIssueInput = {
    where: CausalEdgeWhereUniqueInput
    update: XOR<CausalEdgeUpdateWithoutToIssueInput, CausalEdgeUncheckedUpdateWithoutToIssueInput>
    create: XOR<CausalEdgeCreateWithoutToIssueInput, CausalEdgeUncheckedCreateWithoutToIssueInput>
  }

  export type CausalEdgeUpdateWithWhereUniqueWithoutToIssueInput = {
    where: CausalEdgeWhereUniqueInput
    data: XOR<CausalEdgeUpdateWithoutToIssueInput, CausalEdgeUncheckedUpdateWithoutToIssueInput>
  }

  export type CausalEdgeUpdateManyWithWhereWithoutToIssueInput = {
    where: CausalEdgeScalarWhereInput
    data: XOR<CausalEdgeUpdateManyMutationInput, CausalEdgeUncheckedUpdateManyWithoutToIssueInput>
  }

  export type CausalEdgeUpsertWithWhereUniqueWithoutFromIssueInput = {
    where: CausalEdgeWhereUniqueInput
    update: XOR<CausalEdgeUpdateWithoutFromIssueInput, CausalEdgeUncheckedUpdateWithoutFromIssueInput>
    create: XOR<CausalEdgeCreateWithoutFromIssueInput, CausalEdgeUncheckedCreateWithoutFromIssueInput>
  }

  export type CausalEdgeUpdateWithWhereUniqueWithoutFromIssueInput = {
    where: CausalEdgeWhereUniqueInput
    data: XOR<CausalEdgeUpdateWithoutFromIssueInput, CausalEdgeUncheckedUpdateWithoutFromIssueInput>
  }

  export type CausalEdgeUpdateManyWithWhereWithoutFromIssueInput = {
    where: CausalEdgeScalarWhereInput
    data: XOR<CausalEdgeUpdateManyMutationInput, CausalEdgeUncheckedUpdateManyWithoutFromIssueInput>
  }

  export type ResultCreateWithoutEdgesInput = {
    id?: string
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    job: JobCreateNestedOneWithoutResultInput
    issues?: IssueCreateNestedManyWithoutResultInput
    crawledPages?: CrawledPageCreateNestedManyWithoutResultInput
  }

  export type ResultUncheckedCreateWithoutEdgesInput = {
    id?: string
    jobId: string
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    issues?: IssueUncheckedCreateNestedManyWithoutResultInput
    crawledPages?: CrawledPageUncheckedCreateNestedManyWithoutResultInput
  }

  export type ResultCreateOrConnectWithoutEdgesInput = {
    where: ResultWhereUniqueInput
    create: XOR<ResultCreateWithoutEdgesInput, ResultUncheckedCreateWithoutEdgesInput>
  }

  export type IssueCreateWithoutCausesInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    result: ResultCreateNestedOneWithoutIssuesInput
    causedBy?: CausalEdgeCreateNestedManyWithoutToIssueInput
  }

  export type IssueUncheckedCreateWithoutCausesInput = {
    id?: string
    resultId: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    causedBy?: CausalEdgeUncheckedCreateNestedManyWithoutToIssueInput
  }

  export type IssueCreateOrConnectWithoutCausesInput = {
    where: IssueWhereUniqueInput
    create: XOR<IssueCreateWithoutCausesInput, IssueUncheckedCreateWithoutCausesInput>
  }

  export type IssueCreateWithoutCausedByInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    result: ResultCreateNestedOneWithoutIssuesInput
    causes?: CausalEdgeCreateNestedManyWithoutFromIssueInput
  }

  export type IssueUncheckedCreateWithoutCausedByInput = {
    id?: string
    resultId: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    causes?: CausalEdgeUncheckedCreateNestedManyWithoutFromIssueInput
  }

  export type IssueCreateOrConnectWithoutCausedByInput = {
    where: IssueWhereUniqueInput
    create: XOR<IssueCreateWithoutCausedByInput, IssueUncheckedCreateWithoutCausedByInput>
  }

  export type ResultUpsertWithoutEdgesInput = {
    update: XOR<ResultUpdateWithoutEdgesInput, ResultUncheckedUpdateWithoutEdgesInput>
    create: XOR<ResultCreateWithoutEdgesInput, ResultUncheckedCreateWithoutEdgesInput>
    where?: ResultWhereInput
  }

  export type ResultUpdateToOneWithWhereWithoutEdgesInput = {
    where?: ResultWhereInput
    data: XOR<ResultUpdateWithoutEdgesInput, ResultUncheckedUpdateWithoutEdgesInput>
  }

  export type ResultUpdateWithoutEdgesInput = {
    id?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    job?: JobUpdateOneRequiredWithoutResultNestedInput
    issues?: IssueUpdateManyWithoutResultNestedInput
    crawledPages?: CrawledPageUpdateManyWithoutResultNestedInput
  }

  export type ResultUncheckedUpdateWithoutEdgesInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    issues?: IssueUncheckedUpdateManyWithoutResultNestedInput
    crawledPages?: CrawledPageUncheckedUpdateManyWithoutResultNestedInput
  }

  export type IssueUpsertWithoutCausesInput = {
    update: XOR<IssueUpdateWithoutCausesInput, IssueUncheckedUpdateWithoutCausesInput>
    create: XOR<IssueCreateWithoutCausesInput, IssueUncheckedCreateWithoutCausesInput>
    where?: IssueWhereInput
  }

  export type IssueUpdateToOneWithWhereWithoutCausesInput = {
    where?: IssueWhereInput
    data: XOR<IssueUpdateWithoutCausesInput, IssueUncheckedUpdateWithoutCausesInput>
  }

  export type IssueUpdateWithoutCausesInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    result?: ResultUpdateOneRequiredWithoutIssuesNestedInput
    causedBy?: CausalEdgeUpdateManyWithoutToIssueNestedInput
  }

  export type IssueUncheckedUpdateWithoutCausesInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    causedBy?: CausalEdgeUncheckedUpdateManyWithoutToIssueNestedInput
  }

  export type IssueUpsertWithoutCausedByInput = {
    update: XOR<IssueUpdateWithoutCausedByInput, IssueUncheckedUpdateWithoutCausedByInput>
    create: XOR<IssueCreateWithoutCausedByInput, IssueUncheckedCreateWithoutCausedByInput>
    where?: IssueWhereInput
  }

  export type IssueUpdateToOneWithWhereWithoutCausedByInput = {
    where?: IssueWhereInput
    data: XOR<IssueUpdateWithoutCausedByInput, IssueUncheckedUpdateWithoutCausedByInput>
  }

  export type IssueUpdateWithoutCausedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    result?: ResultUpdateOneRequiredWithoutIssuesNestedInput
    causes?: CausalEdgeUpdateManyWithoutFromIssueNestedInput
  }

  export type IssueUncheckedUpdateWithoutCausedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    causes?: CausalEdgeUncheckedUpdateManyWithoutFromIssueNestedInput
  }

  export type ResultCreateWithoutCrawledPagesInput = {
    id?: string
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    job: JobCreateNestedOneWithoutResultInput
    issues?: IssueCreateNestedManyWithoutResultInput
    edges?: CausalEdgeCreateNestedManyWithoutResultInput
  }

  export type ResultUncheckedCreateWithoutCrawledPagesInput = {
    id?: string
    jobId: string
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    issues?: IssueUncheckedCreateNestedManyWithoutResultInput
    edges?: CausalEdgeUncheckedCreateNestedManyWithoutResultInput
  }

  export type ResultCreateOrConnectWithoutCrawledPagesInput = {
    where: ResultWhereUniqueInput
    create: XOR<ResultCreateWithoutCrawledPagesInput, ResultUncheckedCreateWithoutCrawledPagesInput>
  }

  export type CrawledPageIssueCreateWithoutCrawledPageInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    causedBy?: CrawledPageEdgeCreateNestedManyWithoutToIssueInput
    causes?: CrawledPageEdgeCreateNestedManyWithoutFromIssueInput
  }

  export type CrawledPageIssueUncheckedCreateWithoutCrawledPageInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    causedBy?: CrawledPageEdgeUncheckedCreateNestedManyWithoutToIssueInput
    causes?: CrawledPageEdgeUncheckedCreateNestedManyWithoutFromIssueInput
  }

  export type CrawledPageIssueCreateOrConnectWithoutCrawledPageInput = {
    where: CrawledPageIssueWhereUniqueInput
    create: XOR<CrawledPageIssueCreateWithoutCrawledPageInput, CrawledPageIssueUncheckedCreateWithoutCrawledPageInput>
  }

  export type CrawledPageIssueCreateManyCrawledPageInputEnvelope = {
    data: CrawledPageIssueCreateManyCrawledPageInput | CrawledPageIssueCreateManyCrawledPageInput[]
    skipDuplicates?: boolean
  }

  export type CrawledPageEdgeCreateWithoutCrawledPageInput = {
    id?: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
    fromIssue: CrawledPageIssueCreateNestedOneWithoutCausesInput
    toIssue: CrawledPageIssueCreateNestedOneWithoutCausedByInput
  }

  export type CrawledPageEdgeUncheckedCreateWithoutCrawledPageInput = {
    id?: string
    fromIssueId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CrawledPageEdgeCreateOrConnectWithoutCrawledPageInput = {
    where: CrawledPageEdgeWhereUniqueInput
    create: XOR<CrawledPageEdgeCreateWithoutCrawledPageInput, CrawledPageEdgeUncheckedCreateWithoutCrawledPageInput>
  }

  export type CrawledPageEdgeCreateManyCrawledPageInputEnvelope = {
    data: CrawledPageEdgeCreateManyCrawledPageInput | CrawledPageEdgeCreateManyCrawledPageInput[]
    skipDuplicates?: boolean
  }

  export type ResultUpsertWithoutCrawledPagesInput = {
    update: XOR<ResultUpdateWithoutCrawledPagesInput, ResultUncheckedUpdateWithoutCrawledPagesInput>
    create: XOR<ResultCreateWithoutCrawledPagesInput, ResultUncheckedCreateWithoutCrawledPagesInput>
    where?: ResultWhereInput
  }

  export type ResultUpdateToOneWithWhereWithoutCrawledPagesInput = {
    where?: ResultWhereInput
    data: XOR<ResultUpdateWithoutCrawledPagesInput, ResultUncheckedUpdateWithoutCrawledPagesInput>
  }

  export type ResultUpdateWithoutCrawledPagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    job?: JobUpdateOneRequiredWithoutResultNestedInput
    issues?: IssueUpdateManyWithoutResultNestedInput
    edges?: CausalEdgeUpdateManyWithoutResultNestedInput
  }

  export type ResultUncheckedUpdateWithoutCrawledPagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    cross_page_patterns?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    issues?: IssueUncheckedUpdateManyWithoutResultNestedInput
    edges?: CausalEdgeUncheckedUpdateManyWithoutResultNestedInput
  }

  export type CrawledPageIssueUpsertWithWhereUniqueWithoutCrawledPageInput = {
    where: CrawledPageIssueWhereUniqueInput
    update: XOR<CrawledPageIssueUpdateWithoutCrawledPageInput, CrawledPageIssueUncheckedUpdateWithoutCrawledPageInput>
    create: XOR<CrawledPageIssueCreateWithoutCrawledPageInput, CrawledPageIssueUncheckedCreateWithoutCrawledPageInput>
  }

  export type CrawledPageIssueUpdateWithWhereUniqueWithoutCrawledPageInput = {
    where: CrawledPageIssueWhereUniqueInput
    data: XOR<CrawledPageIssueUpdateWithoutCrawledPageInput, CrawledPageIssueUncheckedUpdateWithoutCrawledPageInput>
  }

  export type CrawledPageIssueUpdateManyWithWhereWithoutCrawledPageInput = {
    where: CrawledPageIssueScalarWhereInput
    data: XOR<CrawledPageIssueUpdateManyMutationInput, CrawledPageIssueUncheckedUpdateManyWithoutCrawledPageInput>
  }

  export type CrawledPageIssueScalarWhereInput = {
    AND?: CrawledPageIssueScalarWhereInput | CrawledPageIssueScalarWhereInput[]
    OR?: CrawledPageIssueScalarWhereInput[]
    NOT?: CrawledPageIssueScalarWhereInput | CrawledPageIssueScalarWhereInput[]
    id?: StringFilter<"CrawledPageIssue"> | string
    crawledPageId?: StringFilter<"CrawledPageIssue"> | string
    category?: StringFilter<"CrawledPageIssue"> | string
    signal_source?: StringFilter<"CrawledPageIssue"> | string
    severity?: IntFilter<"CrawledPageIssue"> | number
    raw_evidence?: StringFilter<"CrawledPageIssue"> | string
    technical_description?: StringFilter<"CrawledPageIssue"> | string
    fix_suggestion?: StringFilter<"CrawledPageIssue"> | string
    severity_justification?: StringFilter<"CrawledPageIssue"> | string
  }

  export type CrawledPageEdgeUpsertWithWhereUniqueWithoutCrawledPageInput = {
    where: CrawledPageEdgeWhereUniqueInput
    update: XOR<CrawledPageEdgeUpdateWithoutCrawledPageInput, CrawledPageEdgeUncheckedUpdateWithoutCrawledPageInput>
    create: XOR<CrawledPageEdgeCreateWithoutCrawledPageInput, CrawledPageEdgeUncheckedCreateWithoutCrawledPageInput>
  }

  export type CrawledPageEdgeUpdateWithWhereUniqueWithoutCrawledPageInput = {
    where: CrawledPageEdgeWhereUniqueInput
    data: XOR<CrawledPageEdgeUpdateWithoutCrawledPageInput, CrawledPageEdgeUncheckedUpdateWithoutCrawledPageInput>
  }

  export type CrawledPageEdgeUpdateManyWithWhereWithoutCrawledPageInput = {
    where: CrawledPageEdgeScalarWhereInput
    data: XOR<CrawledPageEdgeUpdateManyMutationInput, CrawledPageEdgeUncheckedUpdateManyWithoutCrawledPageInput>
  }

  export type CrawledPageEdgeScalarWhereInput = {
    AND?: CrawledPageEdgeScalarWhereInput | CrawledPageEdgeScalarWhereInput[]
    OR?: CrawledPageEdgeScalarWhereInput[]
    NOT?: CrawledPageEdgeScalarWhereInput | CrawledPageEdgeScalarWhereInput[]
    id?: StringFilter<"CrawledPageEdge"> | string
    crawledPageId?: StringFilter<"CrawledPageEdge"> | string
    fromIssueId?: StringFilter<"CrawledPageEdge"> | string
    toIssueId?: StringFilter<"CrawledPageEdge"> | string
    relationship?: StringFilter<"CrawledPageEdge"> | string
    confidence?: StringFilter<"CrawledPageEdge"> | string
    mechanism?: StringFilter<"CrawledPageEdge"> | string
    explanation?: StringFilter<"CrawledPageEdge"> | string
  }

  export type CrawledPageCreateWithoutIssuesInput = {
    id?: string
    url: string
    page_index: number
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    result: ResultCreateNestedOneWithoutCrawledPagesInput
    edges?: CrawledPageEdgeCreateNestedManyWithoutCrawledPageInput
  }

  export type CrawledPageUncheckedCreateWithoutIssuesInput = {
    id?: string
    resultId: string
    url: string
    page_index: number
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    edges?: CrawledPageEdgeUncheckedCreateNestedManyWithoutCrawledPageInput
  }

  export type CrawledPageCreateOrConnectWithoutIssuesInput = {
    where: CrawledPageWhereUniqueInput
    create: XOR<CrawledPageCreateWithoutIssuesInput, CrawledPageUncheckedCreateWithoutIssuesInput>
  }

  export type CrawledPageEdgeCreateWithoutToIssueInput = {
    id?: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
    crawledPage: CrawledPageCreateNestedOneWithoutEdgesInput
    fromIssue: CrawledPageIssueCreateNestedOneWithoutCausesInput
  }

  export type CrawledPageEdgeUncheckedCreateWithoutToIssueInput = {
    id?: string
    crawledPageId: string
    fromIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CrawledPageEdgeCreateOrConnectWithoutToIssueInput = {
    where: CrawledPageEdgeWhereUniqueInput
    create: XOR<CrawledPageEdgeCreateWithoutToIssueInput, CrawledPageEdgeUncheckedCreateWithoutToIssueInput>
  }

  export type CrawledPageEdgeCreateManyToIssueInputEnvelope = {
    data: CrawledPageEdgeCreateManyToIssueInput | CrawledPageEdgeCreateManyToIssueInput[]
    skipDuplicates?: boolean
  }

  export type CrawledPageEdgeCreateWithoutFromIssueInput = {
    id?: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
    crawledPage: CrawledPageCreateNestedOneWithoutEdgesInput
    toIssue: CrawledPageIssueCreateNestedOneWithoutCausedByInput
  }

  export type CrawledPageEdgeUncheckedCreateWithoutFromIssueInput = {
    id?: string
    crawledPageId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CrawledPageEdgeCreateOrConnectWithoutFromIssueInput = {
    where: CrawledPageEdgeWhereUniqueInput
    create: XOR<CrawledPageEdgeCreateWithoutFromIssueInput, CrawledPageEdgeUncheckedCreateWithoutFromIssueInput>
  }

  export type CrawledPageEdgeCreateManyFromIssueInputEnvelope = {
    data: CrawledPageEdgeCreateManyFromIssueInput | CrawledPageEdgeCreateManyFromIssueInput[]
    skipDuplicates?: boolean
  }

  export type CrawledPageUpsertWithoutIssuesInput = {
    update: XOR<CrawledPageUpdateWithoutIssuesInput, CrawledPageUncheckedUpdateWithoutIssuesInput>
    create: XOR<CrawledPageCreateWithoutIssuesInput, CrawledPageUncheckedCreateWithoutIssuesInput>
    where?: CrawledPageWhereInput
  }

  export type CrawledPageUpdateToOneWithWhereWithoutIssuesInput = {
    where?: CrawledPageWhereInput
    data: XOR<CrawledPageUpdateWithoutIssuesInput, CrawledPageUncheckedUpdateWithoutIssuesInput>
  }

  export type CrawledPageUpdateWithoutIssuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    page_index?: IntFieldUpdateOperationsInput | number
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    result?: ResultUpdateOneRequiredWithoutCrawledPagesNestedInput
    edges?: CrawledPageEdgeUpdateManyWithoutCrawledPageNestedInput
  }

  export type CrawledPageUncheckedUpdateWithoutIssuesInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    page_index?: IntFieldUpdateOperationsInput | number
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    edges?: CrawledPageEdgeUncheckedUpdateManyWithoutCrawledPageNestedInput
  }

  export type CrawledPageEdgeUpsertWithWhereUniqueWithoutToIssueInput = {
    where: CrawledPageEdgeWhereUniqueInput
    update: XOR<CrawledPageEdgeUpdateWithoutToIssueInput, CrawledPageEdgeUncheckedUpdateWithoutToIssueInput>
    create: XOR<CrawledPageEdgeCreateWithoutToIssueInput, CrawledPageEdgeUncheckedCreateWithoutToIssueInput>
  }

  export type CrawledPageEdgeUpdateWithWhereUniqueWithoutToIssueInput = {
    where: CrawledPageEdgeWhereUniqueInput
    data: XOR<CrawledPageEdgeUpdateWithoutToIssueInput, CrawledPageEdgeUncheckedUpdateWithoutToIssueInput>
  }

  export type CrawledPageEdgeUpdateManyWithWhereWithoutToIssueInput = {
    where: CrawledPageEdgeScalarWhereInput
    data: XOR<CrawledPageEdgeUpdateManyMutationInput, CrawledPageEdgeUncheckedUpdateManyWithoutToIssueInput>
  }

  export type CrawledPageEdgeUpsertWithWhereUniqueWithoutFromIssueInput = {
    where: CrawledPageEdgeWhereUniqueInput
    update: XOR<CrawledPageEdgeUpdateWithoutFromIssueInput, CrawledPageEdgeUncheckedUpdateWithoutFromIssueInput>
    create: XOR<CrawledPageEdgeCreateWithoutFromIssueInput, CrawledPageEdgeUncheckedCreateWithoutFromIssueInput>
  }

  export type CrawledPageEdgeUpdateWithWhereUniqueWithoutFromIssueInput = {
    where: CrawledPageEdgeWhereUniqueInput
    data: XOR<CrawledPageEdgeUpdateWithoutFromIssueInput, CrawledPageEdgeUncheckedUpdateWithoutFromIssueInput>
  }

  export type CrawledPageEdgeUpdateManyWithWhereWithoutFromIssueInput = {
    where: CrawledPageEdgeScalarWhereInput
    data: XOR<CrawledPageEdgeUpdateManyMutationInput, CrawledPageEdgeUncheckedUpdateManyWithoutFromIssueInput>
  }

  export type CrawledPageCreateWithoutEdgesInput = {
    id?: string
    url: string
    page_index: number
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    result: ResultCreateNestedOneWithoutCrawledPagesInput
    issues?: CrawledPageIssueCreateNestedManyWithoutCrawledPageInput
  }

  export type CrawledPageUncheckedCreateWithoutEdgesInput = {
    id?: string
    resultId: string
    url: string
    page_index: number
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    issues?: CrawledPageIssueUncheckedCreateNestedManyWithoutCrawledPageInput
  }

  export type CrawledPageCreateOrConnectWithoutEdgesInput = {
    where: CrawledPageWhereUniqueInput
    create: XOR<CrawledPageCreateWithoutEdgesInput, CrawledPageUncheckedCreateWithoutEdgesInput>
  }

  export type CrawledPageIssueCreateWithoutCausesInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    crawledPage: CrawledPageCreateNestedOneWithoutIssuesInput
    causedBy?: CrawledPageEdgeCreateNestedManyWithoutToIssueInput
  }

  export type CrawledPageIssueUncheckedCreateWithoutCausesInput = {
    id?: string
    crawledPageId: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    causedBy?: CrawledPageEdgeUncheckedCreateNestedManyWithoutToIssueInput
  }

  export type CrawledPageIssueCreateOrConnectWithoutCausesInput = {
    where: CrawledPageIssueWhereUniqueInput
    create: XOR<CrawledPageIssueCreateWithoutCausesInput, CrawledPageIssueUncheckedCreateWithoutCausesInput>
  }

  export type CrawledPageIssueCreateWithoutCausedByInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    crawledPage: CrawledPageCreateNestedOneWithoutIssuesInput
    causes?: CrawledPageEdgeCreateNestedManyWithoutFromIssueInput
  }

  export type CrawledPageIssueUncheckedCreateWithoutCausedByInput = {
    id?: string
    crawledPageId: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
    causes?: CrawledPageEdgeUncheckedCreateNestedManyWithoutFromIssueInput
  }

  export type CrawledPageIssueCreateOrConnectWithoutCausedByInput = {
    where: CrawledPageIssueWhereUniqueInput
    create: XOR<CrawledPageIssueCreateWithoutCausedByInput, CrawledPageIssueUncheckedCreateWithoutCausedByInput>
  }

  export type CrawledPageUpsertWithoutEdgesInput = {
    update: XOR<CrawledPageUpdateWithoutEdgesInput, CrawledPageUncheckedUpdateWithoutEdgesInput>
    create: XOR<CrawledPageCreateWithoutEdgesInput, CrawledPageUncheckedCreateWithoutEdgesInput>
    where?: CrawledPageWhereInput
  }

  export type CrawledPageUpdateToOneWithWhereWithoutEdgesInput = {
    where?: CrawledPageWhereInput
    data: XOR<CrawledPageUpdateWithoutEdgesInput, CrawledPageUncheckedUpdateWithoutEdgesInput>
  }

  export type CrawledPageUpdateWithoutEdgesInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    page_index?: IntFieldUpdateOperationsInput | number
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    result?: ResultUpdateOneRequiredWithoutCrawledPagesNestedInput
    issues?: CrawledPageIssueUpdateManyWithoutCrawledPageNestedInput
  }

  export type CrawledPageUncheckedUpdateWithoutEdgesInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    page_index?: IntFieldUpdateOperationsInput | number
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    issues?: CrawledPageIssueUncheckedUpdateManyWithoutCrawledPageNestedInput
  }

  export type CrawledPageIssueUpsertWithoutCausesInput = {
    update: XOR<CrawledPageIssueUpdateWithoutCausesInput, CrawledPageIssueUncheckedUpdateWithoutCausesInput>
    create: XOR<CrawledPageIssueCreateWithoutCausesInput, CrawledPageIssueUncheckedCreateWithoutCausesInput>
    where?: CrawledPageIssueWhereInput
  }

  export type CrawledPageIssueUpdateToOneWithWhereWithoutCausesInput = {
    where?: CrawledPageIssueWhereInput
    data: XOR<CrawledPageIssueUpdateWithoutCausesInput, CrawledPageIssueUncheckedUpdateWithoutCausesInput>
  }

  export type CrawledPageIssueUpdateWithoutCausesInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    crawledPage?: CrawledPageUpdateOneRequiredWithoutIssuesNestedInput
    causedBy?: CrawledPageEdgeUpdateManyWithoutToIssueNestedInput
  }

  export type CrawledPageIssueUncheckedUpdateWithoutCausesInput = {
    id?: StringFieldUpdateOperationsInput | string
    crawledPageId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    causedBy?: CrawledPageEdgeUncheckedUpdateManyWithoutToIssueNestedInput
  }

  export type CrawledPageIssueUpsertWithoutCausedByInput = {
    update: XOR<CrawledPageIssueUpdateWithoutCausedByInput, CrawledPageIssueUncheckedUpdateWithoutCausedByInput>
    create: XOR<CrawledPageIssueCreateWithoutCausedByInput, CrawledPageIssueUncheckedCreateWithoutCausedByInput>
    where?: CrawledPageIssueWhereInput
  }

  export type CrawledPageIssueUpdateToOneWithWhereWithoutCausedByInput = {
    where?: CrawledPageIssueWhereInput
    data: XOR<CrawledPageIssueUpdateWithoutCausedByInput, CrawledPageIssueUncheckedUpdateWithoutCausedByInput>
  }

  export type CrawledPageIssueUpdateWithoutCausedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    crawledPage?: CrawledPageUpdateOneRequiredWithoutIssuesNestedInput
    causes?: CrawledPageEdgeUpdateManyWithoutFromIssueNestedInput
  }

  export type CrawledPageIssueUncheckedUpdateWithoutCausedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    crawledPageId?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    causes?: CrawledPageEdgeUncheckedUpdateManyWithoutFromIssueNestedInput
  }

  export type IssueCreateManyResultInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
  }

  export type CausalEdgeCreateManyResultInput = {
    id?: string
    fromIssueId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CrawledPageCreateManyResultInput = {
    id?: string
    url: string
    page_index: number
    narrative: JsonNullValueInput | InputJsonValue
    screenshot_url?: string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type IssueUpdateWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    causedBy?: CausalEdgeUpdateManyWithoutToIssueNestedInput
    causes?: CausalEdgeUpdateManyWithoutFromIssueNestedInput
  }

  export type IssueUncheckedUpdateWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    causedBy?: CausalEdgeUncheckedUpdateManyWithoutToIssueNestedInput
    causes?: CausalEdgeUncheckedUpdateManyWithoutFromIssueNestedInput
  }

  export type IssueUncheckedUpdateManyWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
  }

  export type CausalEdgeUpdateWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
    fromIssue?: IssueUpdateOneRequiredWithoutCausesNestedInput
    toIssue?: IssueUpdateOneRequiredWithoutCausedByNestedInput
  }

  export type CausalEdgeUncheckedUpdateWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CausalEdgeUncheckedUpdateManyWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageUpdateWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    page_index?: IntFieldUpdateOperationsInput | number
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    issues?: CrawledPageIssueUpdateManyWithoutCrawledPageNestedInput
    edges?: CrawledPageEdgeUpdateManyWithoutCrawledPageNestedInput
  }

  export type CrawledPageUncheckedUpdateWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    page_index?: IntFieldUpdateOperationsInput | number
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    issues?: CrawledPageIssueUncheckedUpdateManyWithoutCrawledPageNestedInput
    edges?: CrawledPageEdgeUncheckedUpdateManyWithoutCrawledPageNestedInput
  }

  export type CrawledPageUncheckedUpdateManyWithoutResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    page_index?: IntFieldUpdateOperationsInput | number
    narrative?: JsonNullValueInput | InputJsonValue
    screenshot_url?: NullableStringFieldUpdateOperationsInput | string | null
    tech_stack?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CausalEdgeCreateManyToIssueInput = {
    id?: string
    resultId: string
    fromIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CausalEdgeCreateManyFromIssueInput = {
    id?: string
    resultId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CausalEdgeUpdateWithoutToIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
    result?: ResultUpdateOneRequiredWithoutEdgesNestedInput
    fromIssue?: IssueUpdateOneRequiredWithoutCausesNestedInput
  }

  export type CausalEdgeUncheckedUpdateWithoutToIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CausalEdgeUncheckedUpdateManyWithoutToIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CausalEdgeUpdateWithoutFromIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
    result?: ResultUpdateOneRequiredWithoutEdgesNestedInput
    toIssue?: IssueUpdateOneRequiredWithoutCausedByNestedInput
  }

  export type CausalEdgeUncheckedUpdateWithoutFromIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CausalEdgeUncheckedUpdateManyWithoutFromIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    resultId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageIssueCreateManyCrawledPageInput = {
    id?: string
    category: string
    signal_source: string
    severity: number
    raw_evidence: string
    technical_description: string
    fix_suggestion?: string
    severity_justification?: string
  }

  export type CrawledPageEdgeCreateManyCrawledPageInput = {
    id?: string
    fromIssueId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CrawledPageIssueUpdateWithoutCrawledPageInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    causedBy?: CrawledPageEdgeUpdateManyWithoutToIssueNestedInput
    causes?: CrawledPageEdgeUpdateManyWithoutFromIssueNestedInput
  }

  export type CrawledPageIssueUncheckedUpdateWithoutCrawledPageInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
    causedBy?: CrawledPageEdgeUncheckedUpdateManyWithoutToIssueNestedInput
    causes?: CrawledPageEdgeUncheckedUpdateManyWithoutFromIssueNestedInput
  }

  export type CrawledPageIssueUncheckedUpdateManyWithoutCrawledPageInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    signal_source?: StringFieldUpdateOperationsInput | string
    severity?: IntFieldUpdateOperationsInput | number
    raw_evidence?: StringFieldUpdateOperationsInput | string
    technical_description?: StringFieldUpdateOperationsInput | string
    fix_suggestion?: StringFieldUpdateOperationsInput | string
    severity_justification?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageEdgeUpdateWithoutCrawledPageInput = {
    id?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
    fromIssue?: CrawledPageIssueUpdateOneRequiredWithoutCausesNestedInput
    toIssue?: CrawledPageIssueUpdateOneRequiredWithoutCausedByNestedInput
  }

  export type CrawledPageEdgeUncheckedUpdateWithoutCrawledPageInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageEdgeUncheckedUpdateManyWithoutCrawledPageInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageEdgeCreateManyToIssueInput = {
    id?: string
    crawledPageId: string
    fromIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CrawledPageEdgeCreateManyFromIssueInput = {
    id?: string
    crawledPageId: string
    toIssueId: string
    relationship: string
    confidence: string
    mechanism: string
    explanation: string
  }

  export type CrawledPageEdgeUpdateWithoutToIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
    crawledPage?: CrawledPageUpdateOneRequiredWithoutEdgesNestedInput
    fromIssue?: CrawledPageIssueUpdateOneRequiredWithoutCausesNestedInput
  }

  export type CrawledPageEdgeUncheckedUpdateWithoutToIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    crawledPageId?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageEdgeUncheckedUpdateManyWithoutToIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    crawledPageId?: StringFieldUpdateOperationsInput | string
    fromIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageEdgeUpdateWithoutFromIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
    crawledPage?: CrawledPageUpdateOneRequiredWithoutEdgesNestedInput
    toIssue?: CrawledPageIssueUpdateOneRequiredWithoutCausedByNestedInput
  }

  export type CrawledPageEdgeUncheckedUpdateWithoutFromIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    crawledPageId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
  }

  export type CrawledPageEdgeUncheckedUpdateManyWithoutFromIssueInput = {
    id?: StringFieldUpdateOperationsInput | string
    crawledPageId?: StringFieldUpdateOperationsInput | string
    toIssueId?: StringFieldUpdateOperationsInput | string
    relationship?: StringFieldUpdateOperationsInput | string
    confidence?: StringFieldUpdateOperationsInput | string
    mechanism?: StringFieldUpdateOperationsInput | string
    explanation?: StringFieldUpdateOperationsInput | string
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