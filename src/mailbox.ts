import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";
import * as Stream from "effect/Stream";

/** One scoped owner runs mutations in arrival order; no lock or shared permit. */
export const makeMailbox = Effect.gen(function* () {
  const jobs = yield* Queue.unbounded<Effect.Effect<void>>();
  yield* Stream.fromQueue(jobs).pipe(
    Stream.runForEach((job) => job),
    Effect.forkScoped,
  );
  return {
    run: <A, E, R>(operation: Effect.Effect<A, E, R>) =>
      Effect.gen(function* () {
        const context = yield* Effect.context<R>();
        const reply = yield* Deferred.make<A, E>();
        yield* Queue.offer(
          jobs,
          operation.pipe(
            Effect.provideContext(context),
            Effect.exit,
            Effect.flatMap((result) => Deferred.done(reply, result)),
            Effect.asVoid,
          ),
        );
        return yield* Deferred.await(reply);
      }),
  };
});

export type Mailbox = Effect.Success<typeof makeMailbox>;
