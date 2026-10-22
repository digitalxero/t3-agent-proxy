import * as NodeCrypto from "node:crypto";
import * as NodeHttp from "node:http";
//#region node_modules/effect/dist/Pipeable.js
/**
* The `Pipeable` module defines the shared interface and implementation helpers
* for values that support Effect-style method chaining with `.pipe(...)`.
*
* A `Pipeable` value can pass itself through a sequence of unary functions from
* left to right, so code can be written as `value.pipe(f, g, h)` instead of
* deeply nesting calls. This is the method form used by many Effect data types
* to compose transformations, validations, and effectful operations while
* keeping the original value as the starting point of the pipeline.
*
* @since 2.0.0
*/
/**
* Applies a `pipe` method's variadic arguments to an initial value from left
* to right.
*
* **When to use**
*
* Use to implement a custom `.pipe(...)` method from JavaScript's `arguments`
* object.
*
* **Details**
*
* This helper is intended for implementing `Pipeable.pipe` methods that
* receive JavaScript's `arguments` object. With no functions it returns the
* original value; otherwise it feeds each result into the next function.
*
* **Example** (Implementing a pipe method)
*
* ```ts import.meta.vitest
* import { Pipeable } from "effect"
*
* class NumberBox {
*   constructor(readonly value: number) {}
*
*   pipe(..._fns: ReadonlyArray<(value: number) => number>): number {
*     return Pipeable.pipeArguments(this.value, arguments) as number
*   }
* }
*
* const result = new NumberBox(5).pipe(
*   (n) => n + 2,
*   (n) => n * 3
* )
* result // => 21
* ```
*
* @category combinators
* @since 2.0.0
*/
const pipeArguments = (self, args) => {
	switch (args.length) {
		case 0: return self;
		case 1: return args[0](self);
		case 2: return args[1](args[0](self));
		case 3: return args[2](args[1](args[0](self)));
		case 4: return args[3](args[2](args[1](args[0](self))));
		case 5: return args[4](args[3](args[2](args[1](args[0](self)))));
		case 6: return args[5](args[4](args[3](args[2](args[1](args[0](self))))));
		case 7: return args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))));
		case 8: return args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self))))))));
		case 9: return args[8](args[7](args[6](args[5](args[4](args[3](args[2](args[1](args[0](self)))))))));
		default: {
			let ret = self;
			for (let i = 0, len = args.length; i < len; i++) ret = args[i](ret);
			return ret;
		}
	}
};
/**
* Reusable prototype that implements `Pipeable.pipe`.
*
* **When to use**
*
* Use when classes or object prototypes can reuse this value when they need the
* standard pipe implementation backed by `pipeArguments`.
*
* @category prototypes
* @since 3.15.0
*/
const Prototype$1 = { pipe() {
	return pipeArguments(this, arguments);
} };
/**
* Provides a base constructor whose instances implement the standard `Pipeable.pipe`
* method.
*
* **When to use**
*
* Use when you need to define a class that supports Effect-style method
* chaining through `.pipe(...)`.
*
* @category constructors
* @since 3.15.0
*/
const Class$2 = /*#__PURE__*/ function() {
	function PipeableBase() {}
	PipeableBase.prototype = Prototype$1;
	return PipeableBase;
}();
//#endregion
//#region node_modules/effect/dist/Function.js
/**
* Creates a function that can be called in data-first style or data-last
* (`pipe`-friendly) style.
*
* **When to use**
*
* Use to expose one implementation through both direct and `pipe`-friendly
* call styles.
*
* **Details**
*
* Pass either the arity of the uncurried function or a predicate that decides
* whether the current call is data-first. Arity is the common case. Use a
* predicate when optional arguments make arity ambiguous.
*
* **Example** (Selecting data-first or data-last style by arity)
*
* ```ts import.meta.vitest
* import { Function, pipe } from "effect"
*
* const sum = Function.dual<
*   (that: number) => (self: number) => number,
*   (self: number, that: number) => number
* >(2, (self, that) => self + that)
*
* sum(2, 3) // => 5
* pipe(2, sum(3)) // => 5
* ```
*
* **Example** (Defining overloads with call signatures)
*
* ```ts import.meta.vitest
* import { Function, pipe } from "effect"
*
* const sum: {
*   (that: number): (self: number) => number
*   (self: number, that: number): number
* } = Function.dual(2, (self: number, that: number): number => self + that)
*
* sum(2, 3) // => 5
* pipe(2, sum(3)) // => 5
* ```
*
* **Example** (Selecting data-first or data-last style with a predicate)
*
* ```ts import.meta.vitest
* import { Function, pipe } from "effect"
*
* const sum = Function.dual<
*   (that: number) => (self: number) => number,
*   (self: number, that: number) => number
* >(
*   (args) => args.length === 2,
*   (self, that) => self + that
* )
*
* sum(2, 3) // => 5
* pipe(2, sum(3)) // => 5
* ```
*
* @category combinators
* @since 2.0.0
*/
const dual = function(arity, body) {
	if (typeof arity === "function") return function() {
		return arity(arguments) ? body.apply(this, arguments) : (self) => body(self, ...arguments);
	};
	switch (arity) {
		case 0:
		case 1: throw new RangeError(`Invalid arity ${arity}`);
		case 2: return function(a, b) {
			if (arguments.length >= 2) return body(a, b);
			return function(self) {
				return body(self, a);
			};
		};
		case 3: return function(a, b, c) {
			if (arguments.length >= 3) return body(a, b, c);
			return function(self) {
				return body(self, a, b);
			};
		};
		default: return function() {
			if (arguments.length >= arity) return body.apply(this, arguments);
			const args = arguments;
			return function(self) {
				return body(self, ...args);
			};
		};
	}
};
/**
* Returns its input argument unchanged.
*
* **When to use**
*
* Use to return a value unchanged where a function is required.
*
* **Example** (Returning the same value)
*
* ```ts import.meta.vitest
* import { identity } from "effect"
*
* identity(5) // => 5
* ```
*
* @category combinators
* @since 2.0.0
*/
const identity = (a) => a;
/**
* Creates a zero-argument function that always returns the provided value.
*
* **When to use**
*
* Use when you need a thunk or callback that returns the same value on every
* invocation.
*
* **Example** (Creating a constant thunk)
*
* ```ts import.meta.vitest
* import { Function } from "effect"
*
* const constNull = Function.constant(null)
*
* constNull() // => null
* constNull() // => null
* ```
*
* @category constructors
* @since 2.0.0
*/
const constant = (value) => () => value;
/**
* Returns `true` when called.
*
* **When to use**
*
* Use when you need a thunk that returns `true` on every invocation.
*
* **Example** (Returning true from a thunk)
*
* ```ts import.meta.vitest
* import { Function } from "effect"
*
* Function.constTrue() // => true
* ```
*
* @category constants
* @since 2.0.0
*/
const constTrue = /*#__PURE__*/ constant(true);
/**
* Returns `false` when called.
*
* **When to use**
*
* Use when you need a thunk that returns `false` on every invocation.
*
* **Example** (Returning false from a thunk)
*
* ```ts import.meta.vitest
* import { Function } from "effect"
*
* Function.constFalse() // => false
* ```
*
* @category constants
* @since 2.0.0
*/
const constFalse = /*#__PURE__*/ constant(false);
/**
* Returns `undefined` when called.
*
* **When to use**
*
* Use when you need a thunk that returns `undefined` on every invocation.
*
* **Example** (Returning undefined from a thunk)
*
* ```ts import.meta.vitest
* import { Function } from "effect"
*
* Function.constUndefined() // => undefined
* ```
*
* @category constants
* @since 2.0.0
*/
const constUndefined = /*#__PURE__*/ constant(void 0);
/**
* Returns no meaningful value when called.
*
* **When to use**
*
* Use when you need a thunk that is called only for its effect and has no
* meaningful return value.
*
* **Example** (Returning void from a thunk)
*
* ```ts import.meta.vitest
* import { Function } from "effect"
*
* Function.constVoid() // => undefined
* ```
*
* @category constants
* @since 2.0.0
*/
const constVoid = constUndefined;
/**
* Creates a memoized function whose input is an object, caching results by
* object identity.
*
* **When to use**
*
* Use to reuse the result of a synchronous computation whose output is stable
* for a given object reference.
*
* **Details**
*
* Each memoized wrapper owns a private `WeakMap` keyed by object identity.
*
* **Gotchas**
*
* `undefined` is reserved to represent a cache miss and is therefore not
* supported as a return value.
*
* Structurally equal objects do not share cache entries. If the same object is
* mutated after its first call, later calls still return the cached result for
* that reference.
*
* @category caching
* @since 4.0.0
*/
function memoize(f) {
	const cache = /* @__PURE__ */ new WeakMap();
	return (a) => {
		const cached = cache.get(a);
		if (cached !== void 0) return cached;
		const result = f(a);
		cache.set(a, result);
		return result;
	};
}
/**
* Creates a memoized idempotent object transformation that caches both inputs
* and their outputs by object identity.
*
* **When to use**
*
* Use when an object transformation is idempotent and its output can be safely
* reused as a fixed point.
*
* **Details**
*
* After computing an input, the returned function caches both the input and
* the output. Calling it with either reference returns the output without
* invoking the supplied function again.
*
* **Gotchas**
*
* The returned function treats each computed output as a fixed point. If
* applying the supplied function to an output would produce an observably
* different value, this memoization changes that behavior.
*
* @see {@link memoize} for memoizing functions without an idempotence requirement
* @category caching
* @since 4.0.0
*/
function memoizeIdempotent(f) {
	const cache = /* @__PURE__ */ new WeakMap();
	return (a) => {
		const cached = cache.get(a);
		if (cached !== void 0) return cached;
		const result = f(a);
		cache.set(a, result);
		if (result !== a) cache.set(result, result);
		return result;
	};
}
//#endregion
//#region node_modules/effect/dist/internal/equal.js
/** @internal */
const getAllObjectKeys = (obj) => {
	const keys = new Set(Reflect.ownKeys(obj));
	if (obj.constructor === Object) return keys;
	if (obj instanceof Error) keys.delete("stack");
	const proto = Object.getPrototypeOf(obj);
	let current = proto;
	while (current !== null && current !== Object.prototype) {
		const ownKeys = Reflect.ownKeys(current);
		for (let i = 0; i < ownKeys.length; i++) keys.add(ownKeys[i]);
		current = Object.getPrototypeOf(current);
	}
	if (keys.has("constructor") && typeof obj.constructor === "function" && proto === obj.constructor.prototype) keys.delete("constructor");
	return keys;
};
/** @internal */
const byReferenceInstances = /*#__PURE__*/ new WeakSet();
/** @internal */
const viewBytes = (view) => new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
//#endregion
//#region node_modules/effect/dist/internal/hash.js
/**
* Back-edge count used to avoid caching entry-point-dependent hashes.
*
* @internal
*/
let backEdges = 0;
/** @internal */
const addBackEdge = () => {
	backEdges++;
};
//#endregion
//#region node_modules/effect/dist/Predicate.js
/**
* Defines runtime checks for values.
*
* A `Predicate<A>` returns `true` or `false` for an `A`. A
* `Refinement<A, B>` is a predicate that also narrows the TypeScript type when
* it succeeds. This module includes guards for common JavaScript values,
* property and tag checks, tuple and struct checks, boolean combinators, and
* helpers for composing predicates and refinements.
*
* @since 2.0.0
*/
/**
* Checks whether a value is a `string`.
*
* **When to use**
*
* Use when you need a `Predicate` guard to narrow an `unknown` value to a
* string.
*
* **Details**
*
* Uses `typeof input === "string"`.
*
* **Example** (Guarding strings)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = "hi"
*
* if (Predicate.isString(data)) {
*   data.toUpperCase() // => "HI"
* }
* ```
*
* @see {@link isNumber}
* @see {@link isBoolean}
* @see {@link Refinement}
* @category guards
* @since 2.0.0
*/
function isString(input) {
	return typeof input === "string";
}
/**
* Checks whether a value is a `number`.
*
* **When to use**
*
* Use when you need a `Predicate` guard to narrow an `unknown` value to a
* number.
*
* **Details**
*
* Uses `typeof input === "number"` and does not exclude `NaN` or `Infinity`.
*
* **Example** (Guarding numbers)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = 42
*
* if (Predicate.isNumber(data)) {
*   data + 1 // => 43
* }
* ```
*
* @see {@link isBigInt}
* @see {@link isString}
* @category guards
* @since 2.0.0
*/
function isNumber(input) {
	return typeof input === "number";
}
/**
* Checks whether a value is a `boolean`.
*
* **When to use**
*
* Use when you need a `Predicate` guard to narrow an `unknown` value to a
* boolean.
*
* **Details**
*
* Uses `typeof input === "boolean"`.
*
* **Example** (Guarding booleans)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = true
*
* if (Predicate.isBoolean(data)) {
*   data ? "yes" : "no" // => "yes"
* }
* ```
*
* @see {@link isString}
* @see {@link isNumber}
* @category guards
* @since 2.0.0
*/
function isBoolean(input) {
	return typeof input === "boolean";
}
/**
* Checks whether a value is a `symbol`.
*
* **When to use**
*
* Use when you need a `Predicate` guard to narrow an `unknown` value to a
* symbol.
*
* **Details**
*
* Uses `typeof input === "symbol"`.
*
* **Example** (Guarding symbols)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = Symbol.for("id")
*
* if (Predicate.isSymbol(data)) {
*   data.description // => "id"
* }
* ```
*
* @see {@link isPropertyKey}
* @category guards
* @since 2.0.0
*/
function isSymbol(input) {
	return typeof input === "symbol";
}
/**
* Checks whether a value is a valid `PropertyKey` (string, number, or symbol).
*
* **When to use**
*
* Use when you need a `Predicate` guard for unknown property keys before
* indexing.
*
* **Details**
*
* Uses `isString`, `isNumber`, and `isSymbol`.
*
* **Example** (Guarding property keys)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const key: unknown = "name"
* const obj: Record<PropertyKey, unknown> = { name: "Ada" }
*
* if (Predicate.isPropertyKey(key) && key in obj) {
*   obj[key] // => "Ada"
* }
* ```
*
* @see {@link isString}
* @see {@link isNumber}
* @see {@link isSymbol}
* @category guards
* @since 4.0.0
*/
function isPropertyKey(u) {
	return isString(u) || isNumber(u) || isSymbol(u);
}
/**
* Checks whether a value is a `function`.
*
* **When to use**
*
* Use when you need a `Predicate` guard to narrow an `unknown` value to a
* callable function.
*
* **Details**
*
* Uses `typeof input === "function"`.
*
* **Example** (Guarding functions)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = () => 1
*
* if (Predicate.isFunction(data)) {
*   data() // => 1
* }
* ```
*
* @see {@link isObjectKeyword}
* @category guards
* @since 2.0.0
*/
function isFunction(input) {
	return typeof input === "function";
}
/**
* Checks whether a value is not `null` and not `undefined`.
*
* **When to use**
*
* Use when you need a `Predicate` refinement that filters out nullish values
* but keeps other falsy ones.
*
* **Details**
*
* Uses `input != null`.
*
* **Example** (Filtering non-nullish values)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const values = [0, null, "", undefined]
* const present = values.filter(Predicate.isNotNullish) // => [0, ""]
* ```
*
* @see {@link isNullish}
* @see {@link isNotNull}
* @see {@link isNotUndefined}
* @category guards
* @since 4.0.0
*/
function isNotNullish(input) {
	return input != null;
}
/**
* Type guard that always returns `true`.
*
* **When to use**
*
* Use when you need a `Predicate` that always accepts, e.g. as a placeholder.
*
* **Example** (Matching every value)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* Predicate.isUnknown(123) // => true
* ```
*
* @see {@link isNever}
* @category guards
* @since 2.0.0
*/
function isUnknown(_) {
	return true;
}
/**
* Checks whether a value is a non-null object value that is not an array.
*
* **When to use**
*
* Use to narrow unknown input to a non-null, non-array object with a
* `Predicate` guard.
*
* **Details**
*
* This is a structural runtime check using `typeof input === "object"`, so it
* also accepts object instances such as `Date`, `Map`, class instances, and
* typed arrays. It excludes `null` and arrays.
*
* **Example** (Guarding objects)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* Predicate.isObject({ a: 1 }) // => true
* Predicate.isObject([1, 2]) // => false
* ```
*
* @see {@link isObjectOrArray}
* @see {@link isReadonlyObject}
* @category guards
* @since 2.0.0
*/
function isObject$1(input) {
	return typeof input === "object" && input !== null && !Array.isArray(input);
}
/**
* Checks whether a value is an `object` in the JavaScript sense (objects, arrays, functions).
*
* **When to use**
*
* Use when you need a `Predicate` guard that accepts arrays and functions as
* well as objects.
*
* **Details**
*
* Returns `true` for arrays and functions, and `false` for `null`.
*
* **Example** (Checking object keywords)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* Predicate.isObjectKeyword(() => 1) // => true
* Predicate.isObjectKeyword(null) // => false
* ```
*
* @see {@link isObject}
* @see {@link isObjectOrArray}
* @category guards
* @since 4.0.0
*/
function isObjectKeyword(input) {
	return typeof input === "object" && input !== null || isFunction(input);
}
/**
* Checks whether a value has a given property key.
*
* **When to use**
*
* Use when you need a `Predicate` guard for property access on `unknown`
* values with a simple structural object check.
*
* **Details**
*
* Uses the `in` operator and `isObjectKeyword`. This does not check property
* value types.
*
* **Example** (Guarding object properties)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const hasName = Predicate.hasProperty("name")
* const data: unknown = { name: "Ada" }
*
* if (hasName(data)) {
*   data.name // => "Ada"
* }
* ```
*
* @see {@link isTagged}
* @see {@link isObjectKeyword}
* @category guards
* @since 2.0.0
*/
const hasProperty = /*#__PURE__*/ dual(2, (self, property) => isObjectKeyword(self) && property in self);
/**
* Checks whether a value has a `_tag` property equal to the given tag.
*
* **When to use**
*
* Use when you model tagged unions with a `_tag` field and want a quick
* `Predicate` guard for tagged values.
*
* **Details**
*
* Uses `hasProperty` and strict equality on `_tag`.
*
* **Example** (Guarding tagged values)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const isOk = Predicate.isTagged("Ok")
*
* isOk({ _tag: "Ok", value: 1 }) // => true
* ```
*
* @see {@link hasProperty}
* @category guards
* @since 2.0.0
*/
const isTagged = /*#__PURE__*/ dual(2, (self, tag) => hasProperty(self, "_tag") && self["_tag"] === tag);
/**
* Checks whether a value is an `Error`.
*
* **When to use**
*
* Use when you need a `Predicate` guard for errors caught from unknown sources.
*
* **Details**
*
* Uses `instanceof Error`.
*
* **Example** (Guarding errors)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = new Error("boom")
*
* Predicate.isError(data) // => true
* ```
*
* @see {@link isUnknown}
* @category guards
* @since 2.0.0
*/
function isError(input) {
	return input instanceof Error;
}
/**
* Checks whether a value is iterable.
*
* **When to use**
*
* Use when you need a `Predicate` guard before iterating an unknown value.
*
* **Details**
*
* Accepts strings as iterable and uses `hasProperty` for `Symbol.iterator`.
*
* **Example** (Guarding iterables)
*
* ```ts import.meta.vitest
* import { Predicate } from "effect"
*
* const data: unknown = [1, 2, 3]
*
* Predicate.isIterable(data) // => true
* ```
*
* @see {@link isSet}
* @see {@link isMap}
* @category guards
* @since 2.0.0
*/
function isIterable(input) {
	return hasProperty(input, Symbol.iterator) || isString(input);
}
//#endregion
//#region node_modules/effect/dist/Hash.js
/**
* Computes Effect hash values and defines the interface for objects that want
* to provide their own hash implementation. Hashes are small numeric
* fingerprints used by Effect data structures to bucket values quickly; they
* are not cryptographic digests and they are not proof that two values are
* equal. The module also includes helpers for primitive, structure, array, and
* reference-based hashes, plus functions for combining and optimizing numeric
* hash values.
*
* @since 2.0.0
*/
/**
* Defines the unique identifier used to identify objects that implement the Hash interface.
*
* **When to use**
*
* Use as the computed property key for the method that supplies a custom hash
* value on a `Hash` implementor.
*
* @see {@link Hash} for the interface implemented with this symbol
* @see {@link isHash} for checking whether a value implements `Hash`
* @see {@link hash} for computing hash values
*
* @category symbols
* @since 2.0.0
*/
const symbol$1 = "~effect/Hash";
/**
* Computes a hash value for any given value.
*
* **When to use**
*
* Use to compute an Effect hash for primitives, collections, and hashable
* objects.
*
* **Details**
*
* This function can hash primitives (numbers, strings, booleans, etc.) as well as
* objects, arrays, and other complex data structures. It automatically handles
* different types and provides a consistent hash value for equivalent inputs.
*
* **Gotchas**
*
* Objects being hashed must be treated as immutable after their first hash
* computation. Hash results are cached, so mutating an object after hashing will
* lead to stale cached values and broken hash-based operations. For mutable
* objects, implement a custom `Hash` interface that hashes the object reference
* rather than its content.
*
* **Example** (Hashing different values)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* Hash.hash(42) === Hash.hash(42) // => true
* Hash.hash("hello") === Hash.hash("hello") // => true
* Hash.hash([1, 2, 3]) === Hash.hash([1, 2, 3]) // => true
* ```
*
* @category hashing
* @since 2.0.0
*/
const hash = (self) => {
	switch (typeof self) {
		case "number": return number$1(self);
		case "bigint": return string$1(self.toString(10));
		case "string": return string$1(self);
		case "function":
		case "object": if (self === null) break;
		else if (self instanceof Date) {
			if (Number.isNaN(self.getTime())) return string$1("Invalid Date");
			return string$1(self.toISOString());
		} else if (self instanceof RegExp) return string$1(self.toString());
		else {
			if (byReferenceInstances.has(self)) return random$1(self);
			const cached = hashCache.get(self);
			if (cached !== void 0) return cached;
			if (visitedObjects.has(self)) {
				addBackEdge();
				return string$1("[Circular]");
			}
			visitedObjects.add(self);
			const seen = backEdges;
			let h;
			try {
				if ("~effect/Hash" in self) h = self[symbol$1]();
				else if (typeof self === "function") h = random$1(self);
				else if (self instanceof DataView) h = array$1(viewBytes(self));
				else if (Array.isArray(self) || ArrayBuffer.isView(self)) h = array$1(self);
				else if (self instanceof Map) h = hashMap(self);
				else if (self instanceof Set) h = hashSet(self);
				else h = structure(self);
			} finally {
				visitedObjects.delete(self);
			}
			if (seen === backEdges) hashCache.set(self, h);
			return h;
		}
	}
	return optimize(mix(string$1(String(self))));
};
/**
* Generates a random hash value for an object and caches it.
*
* **When to use**
*
* Use to hash an object by reference identity instead of structural content.
*
* **Details**
*
* This function creates a random hash value for objects that don't have their own
* hash implementation. The hash value is cached using a WeakMap, so the same object
* will always return the same hash value during its lifetime.
*
* **Example** (Hashing objects by reference)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* const obj1 = { a: 1 }
* const obj2 = { a: 1 }
*
* Hash.random(obj1) === Hash.random(obj1) // => true
*
* typeof Hash.random(obj2) // => "number"
* ```
*
* @category hashing
* @since 2.0.0
*/
const random$1 = (self) => {
	if (!randomHashCache.has(self)) randomHashCache.set(self, optimize(Math.random() * 4294967296 | 0));
	return randomHashCache.get(self);
};
const mix = (h) => {
	h ^= h >>> 16;
	h = Math.imul(h, 2246822507);
	h ^= h >>> 13;
	h = Math.imul(h, 3266489909);
	return h ^ h >>> 16;
};
/**
* Combines two hash values into a single hash value.
*
* **When to use**
*
* Use to build a hash for a composite value by folding together hash values for
* its parts.
*
* **Details**
*
* Supports direct and pipeable usage. Argument order affects the result.
*
* **Example** (Combining hash values)
*
* ```ts import.meta.vitest
* import { Hash, pipe } from "effect"
*
* const hash1 = Hash.hash("hello")
* const hash2 = Hash.hash("world")
*
* const combined = Hash.combine(hash2)(hash1)
* combined === pipe(hash1, Hash.combine(hash2)) // => true
* ```
*
* @see {@link hash} for computing hash values from arbitrary inputs
* @see {@link structureKeys} for hashing selected object fields without manual combination
*
* @category hashing
* @since 2.0.0
*/
const combine = /*#__PURE__*/ dual(2, (self, b) => mix(Math.imul(self, 2654435761) + Math.imul(b, 2246822507)));
/**
* Applies bit manipulation techniques to optimize a hash value.
*
* **When to use**
*
* Use to improve the bit distribution of a raw numeric hash value.
*
* **Details**
*
* This function takes a hash value and applies bitwise operations to improve
* the distribution of hash values, reducing the likelihood of collisions.
*
* **Example** (Optimizing a hash value)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* Hash.optimize(1234567890) // => 160826066
* ```
*
* @category hashing
* @since 2.0.0
*/
const optimize = (n) => n & 3221225471 | n >>> 1 & 1073741824;
const float64 = /*#__PURE__*/ new DataView(/*#__PURE__*/ new ArrayBuffer(8));
/**
* Computes a hash value for a number.
*
* **When to use**
*
* Use to hash a JavaScript number with Effect's numeric hash semantics.
*
* **Details**
*
* Int32 values hash to themselves. Other numbers hash from their IEEE-754 bits,
* with a canonical representation for `NaN`.
*
* **Example** (Hashing numbers)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* Number.isInteger(Hash.number(42)) // => true
* Number.isInteger(Hash.number(3.14)) // => true
* Hash.number(NaN) === Hash.number(NaN) // => true
* Hash.number(Infinity) === Hash.number(Infinity) // => true
* Hash.number(100) === Hash.number(100) // => true
* ```
*
* @category hashing
* @since 2.0.0
*/
const number$1 = (n) => {
	const h = n | 0;
	if (h === n) return optimize(h);
	float64.setFloat64(0, n !== n ? NaN : n);
	return optimize(combine(float64.getInt32(0), float64.getInt32(4)));
};
/**
* Computes a hash value for a string using the djb2 algorithm.
*
* **When to use**
*
* Use when you need a string field to contribute to a custom structural hash
* implementation.
*
* **Details**
*
* This function implements a variation of the djb2 hash algorithm, which is
* known for its good distribution properties and speed. It processes each
* character of the string to produce a consistent hash value.
*
* **Example** (Hashing strings)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* Hash.string("hello") // => 181380007
* Hash.string("world") // => 164394279
* Hash.string("") // => 5381
* Hash.string("test") === Hash.string("test") // => true
* ```
*
* @category hashing
* @since 2.0.0
*/
const string$1 = (str) => {
	let h = 5381, i = str.length;
	while (i) h = h * 33 ^ str.charCodeAt(--i);
	return optimize(h);
};
/**
* Computes a hash value for an object using only the specified keys.
*
* **When to use**
*
* Use to hash an object by a selected set of property keys.
*
* **Details**
*
* This function allows you to hash an object by considering only specific keys,
* which is useful when you want to create a hash based on a subset of an object's
* properties.
*
* **Example** (Hashing selected object keys)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* const person = { name: "John", age: 30, city: "New York" }
*
* const hash1 = Hash.structureKeys(person, ["name", "age"])
* const hash2 = Hash.structureKeys(person, ["name", "city"])
*
* hash1 // => -731887653
* hash2 // => 148523102
*
* const person2 = { name: "John", age: 30, city: "Boston" }
* const hash3 = Hash.structureKeys(person2, ["name", "age"])
* hash1 === hash3 // => true
* ```
*
* @category hashing
* @since 2.0.0
*/
const structureKeys = (o, keys) => {
	let h = 12289;
	for (const key of keys) h ^= combine(hash(key), hash(o[key]));
	return optimize(h);
};
/**
* Computes a structural hash for an object using Effect's object key collection.
*
* **When to use**
*
* Use to hash an object from all structural keys collected by Effect.
*
* **Details**
*
* The hash is based on the object's structural keys and their values, including
* symbol keys and relevant prototype keys for non-plain objects.
*
* **Example** (Hashing object structures)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* const obj1 = { name: "John", age: 30 }
* const obj2 = { name: "Jane", age: 25 }
* const obj3 = { name: "John", age: 30 }
*
* Hash.structure(obj1) // => -731887653
* Hash.structure(obj2) // => -222100417
* Hash.structure(obj3) // => -731887653
* Hash.structure(obj1) === Hash.structure(obj3) // => true
* ```
*
* @category hashing
* @since 2.0.0
*/
const structure = (o) => structureKeys(o, getAllObjectKeys(o));
const unordered = (seed, f) => (iter) => {
	let h = seed;
	for (const element of iter) h ^= f(element);
	return optimize(h);
};
/**
* Computes a hash value for an iterable by hashing all of its elements.
*
* **When to use**
*
* Use to hash the values yielded by an iterable with Effect hash semantics.
*
* **Details**
*
* Folds element hashes with {@link combine}, so order and length affect the
* result.
*
* **Gotchas**
*
* A hash is not an equality proof. Distinct inputs can still share a hash.
*
* **Example** (Hashing arrays)
*
* ```ts import.meta.vitest
* import { Hash } from "effect"
*
* const arr1 = [1, 2, 3]
* const arr2 = [1, 2, 3]
* const arr3 = [3, 2, 1]
*
* Hash.array(arr1) === Hash.array(arr2) // => true
* Hash.array(arr1) === Hash.array(arr3) // => false
* ```
*
* @see {@link hash} for the general-purpose hash dispatcher
*
* @category hashing
* @since 2.0.0
*/
const array$1 = (arr) => {
	let h = 6151;
	for (const element of arr) h = combine(h, hash(element));
	return optimize(h);
};
const hashMap = /*#__PURE__*/ unordered(/*#__PURE__*/ string$1("Map"), ([k, v]) => combine(hash(k), hash(v)));
const setSeed = /*#__PURE__*/ string$1("Set");
const hashSet = /*#__PURE__*/ unordered(setSeed, (element) => combine(setSeed, hash(element)));
const randomHashCache = /*#__PURE__*/ new WeakMap();
const hashCache = /*#__PURE__*/ new WeakMap();
const visitedObjects = /*#__PURE__*/ new WeakSet();
//#endregion
//#region node_modules/effect/dist/Equal.js
/**
* Defines the unique string identifier for the `Equal` interface.
*
* **When to use**
*
* Use when you implement custom equality and need the computed property key for
* the equality method.
*
* **Details**
*
* This is a pure constant with no allocation or side effects.
*
* **Example** (Implementing Equal on a class)
*
* ```ts import.meta.vitest
* import { Equal, Hash } from "effect"
*
* class UserId implements Equal.Equal {
*   constructor(readonly id: string) {}
*
*   [Equal.symbol](that: Equal.Equal): boolean {
*     return that instanceof UserId && this.id === that.id
*   }
*
*   [Hash.symbol](): number {
*     return Hash.string(this.id)
*   }
* }
*
* Equal.equals(new UserId("1"), new UserId("1")) // => true
* Equal.equals(new UserId("1"), new UserId("2")) // => false
* ```
*
* @see {@link Equal} — the interface that uses this symbol
* @see {@link isEqual} — type guard for `Equal` implementors
* @category symbols
* @since 2.0.0
*/
const symbol = "~effect/Equal";
function equals$1() {
	if (arguments.length === 1) return (self) => compareBoth(self, arguments[0]);
	return compareBoth(arguments[0], arguments[1]);
}
function compareBoth(self, that) {
	if (self === that) return true;
	if (self == null || that == null) return false;
	const selfType = typeof self;
	if (selfType !== typeof that) return false;
	if (selfType === "number" && self !== self && that !== that) return true;
	if (selfType !== "object" && selfType !== "function") return false;
	if (byReferenceInstances.has(self) || byReferenceInstances.has(that)) return false;
	return compareObjects(self, that);
}
function compareObjects(self, that) {
	const depth = pathLeft.length;
	for (let i = depth; i-- > 0;) if (pathLeft[i] === self && pathRight[i] === that) return true;
	if (depth) return compareOnPath(self, that);
	let known = results.get(self);
	if (!known) results.set(self, known = /* @__PURE__ */ new WeakMap());
	let result = known.get(that);
	if (result === void 0) known.set(that, result = compareOnPath(self, that));
	return result;
}
function compareOnPath(self, that) {
	pathLeft.push(self);
	pathRight.push(that);
	try {
		return compareStructure(self, that);
	} finally {
		pathLeft.pop();
		pathRight.pop();
	}
}
const pathLeft = [];
const pathRight = [];
const results = /*#__PURE__*/ new WeakMap();
function compareStructure(self, that) {
	if (hash(self) !== hash(that)) return false;
	else if (self instanceof Date) {
		if (!(that instanceof Date)) return false;
		const selfTime = self.getTime();
		const thatTime = that.getTime();
		return selfTime === thatTime || Number.isNaN(selfTime) && Number.isNaN(thatTime);
	} else if (self instanceof RegExp) return that instanceof RegExp && self.toString() === that.toString();
	const bothEquals = isEqual(self);
	if (bothEquals !== isEqual(that) || typeof self === "function" && !bothEquals) return false;
	else if (bothEquals) return self[symbol](that);
	else if (Array.isArray(self)) {
		if (!Array.isArray(that) || self.length !== that.length) return false;
		return compareArrays(self, that);
	} else if (ArrayBuffer.isView(self)) {
		const selfIsDataView = self instanceof DataView;
		if (!ArrayBuffer.isView(that) || self.byteLength !== that.byteLength || selfIsDataView !== that instanceof DataView) return false;
		if (selfIsDataView) return compareTypedArrays(viewBytes(self), viewBytes(that));
		return compareTypedArrays(self, that);
	} else if (self instanceof Map) {
		if (!(that instanceof Map) || self.size !== that.size) return false;
		return compareHashed(self, that, entryHash, equalEntries);
	} else if (self instanceof Set) {
		if (!(that instanceof Set) || self.size !== that.size) return false;
		return compareHashed(self, that, hash, compareBoth);
	}
	return compareRecords(self, that);
}
function compareArrays(self, that) {
	for (let i = 0; i < self.length; i++) if (!compareBoth(self[i], that[i])) return false;
	return true;
}
function compareTypedArrays(self, that) {
	if (self.length !== that.length) return false;
	for (let i = 0; i < self.length; i++) if (self[i] !== that[i]) return false;
	return true;
}
function compareRecords(self, that) {
	const selfKeys = getAllObjectKeys(self);
	const thatKeys = getAllObjectKeys(that);
	if (selfKeys.size !== thatKeys.size) return false;
	for (const key of selfKeys) if (!thatKeys.has(key) || !compareBoth(self[key], that[key])) return false;
	return true;
}
function compareHashed(self, that, hashOf, equivalent) {
	const groups = /* @__PURE__ */ new Map();
	for (const item of that) {
		const h = hashOf(item);
		const group = groups.get(h);
		if (group) group.push(item);
		else groups.set(h, [item]);
	}
	outer: for (const item of self) {
		const group = groups.get(hashOf(item));
		if (group) {
			for (let i = 0; i < group.length; i++) if (equivalent(item, group[i])) {
				group[i] = group[group.length - 1];
				group.pop();
				continue outer;
			}
		}
		return false;
	}
	return true;
}
const entryHash = (entry) => hash(entry[0]);
const equalEntries = (self, that) => compareBoth(self[0], that[0]) && compareBoth(self[1], that[1]);
/**
* Checks whether a value implements the {@link Equal} interface.
*
* **When to use**
*
* Use when you need generic utility code to distinguish `Equal` implementors
* from plain values before calling `[Equal.symbol]` directly.
*
* **Details**
*
* - Pure function, no side effects.
* - Returns `true` if and only if `u` has a property keyed by
*   {@link symbol}.
* - Acts as a TypeScript type guard, narrowing the input to {@link Equal}.
*
* **Example** (Checking Equal values)
*
* ```ts import.meta.vitest
* import { Equal, Hash } from "effect"
*
* class Token implements Equal.Equal {
*   constructor(readonly value: string) {}
*   [Equal.symbol](that: Equal.Equal): boolean {
*     return that instanceof Token && this.value === that.value
*   }
*   [Hash.symbol](): number {
*     return Hash.string(this.value)
*   }
* }
*
* Equal.isEqual(new Token("abc")) // => true
* Equal.isEqual({ x: 1 }) // => false
* Equal.isEqual(42) // => false
* ```
*
* @see {@link Equal} — the interface being checked
* @see {@link symbol} — the property key that signals `Equal` support
* @category guards
* @since 2.0.0
*/
const isEqual = (u) => hasProperty(u, symbol);
//#endregion
//#region node_modules/effect/dist/Equivalence.js
/**
* Creates a custom equivalence relation with an optimized reference equality check.
*
* **When to use**
*
* Use when you need an equality rule that the built-in instances and input
* mapping helpers cannot express, and you can provide a law-abiding comparison.
*
* **Details**
*
* The returned equivalence first checks reference equality (`===`) for
* performance. If the values are not the same reference, it falls back to the
* provided equivalence function, which must satisfy reflexive, symmetric, and
* transitive properties.
*
* **Example** (Case-insensitive string equivalence)
*
* ```ts import.meta.vitest
* import { Equivalence } from "effect"
*
* const caseInsensitive = Equivalence.make<string>((a, b) =>
*   a.toLowerCase() === b.toLowerCase()
* )
*
* caseInsensitive("Hello", "HELLO") // => true
* caseInsensitive("foo", "bar") // => false
*
* // Same reference optimization
* const str = "test"
* caseInsensitive(str, str) // => true
* ```
*
* **Example** (Comparing numbers with tolerance)
*
* ```ts import.meta.vitest
* import { Equivalence } from "effect"
*
* const tolerance = Equivalence.make<number>((a, b) => Math.abs(a - b) < 0.0001)
*
* tolerance(1.0, 1.001) // => false
* tolerance(1.0, 1.00001) // => true
* ```
*
* @see {@link strictEqual}
* @see {@link mapInput}
* @category constructors
* @since 2.0.0
*/
const make$27 = (isEquivalent) => (self, that) => self === that || isEquivalent(self, that);
const isStrictEquivalent = (x, y) => x === y;
/**
* Creates an equivalence relation that uses strict equality (`===`) to compare values.
*
* **When to use**
*
* Use when you need strict equality (`===`) as the comparison.
*
* **Details**
*
* Uses JavaScript's strict equality operator (`===`). Primitives compare by
* value. Objects compare by reference, so only the same object instance is
* equivalent. Use this as a building block for more complex equivalences via
* `mapInput` or `combine`.
*
* **Gotchas**
*
* `NaN !== NaN`, so `NaN` values are never considered equivalent.
*
* **Example** (Comparing primitive types)
*
* ```ts import.meta.vitest
* import { Equivalence } from "effect"
*
* const strictEq = Equivalence.strictEqual<number>()
*
* strictEq(1, 1) // => true
* strictEq(1, 2) // => false
* strictEq(NaN, NaN) // => false
* ```
*
* **Example** (Comparing objects by reference)
*
* ```ts import.meta.vitest
* import { Equivalence } from "effect"
*
* const obj = { value: 42 }
* const strictObjEq = Equivalence.strictEqual<typeof obj>()
*
* strictObjEq(obj, obj) // => true
* strictObjEq(obj, { value: 42 }) // => false
* ```
*
* @see {@link make}
* @see `Equal` for structural equality
* @category constructors
* @since 4.0.0
*/
const strictEqual = () => isStrictEquivalent;
/**
* Creates an equivalence for tuples with heterogeneous element types.
*
* **When to use**
*
* Use when you need an `Equivalence` for fixed-length tuples with per-position
* equivalences.
*
* **Details**
*
* Tuples must have the same length; different lengths are never equivalent.
* Each equivalence is applied to the corresponding element position. The result
* returns `true` only if all elements are equivalent according to their
* respective equivalences, and it also satisfies reflexive, symmetric, and
* transitive properties.
*
* **Example** (Comparing homogeneous tuples)
*
* ```ts import.meta.vitest
* import { Equivalence } from "effect"
*
* const stringTupleEq = Equivalence.Tuple([
*   Equivalence.strictEqual<string>(),
*   Equivalence.strictEqual<string>(),
*   Equivalence.strictEqual<string>()
* ])
*
* const tuple1 = ["hello", "world", "test"] as const
* const tuple2 = ["hello", "world", "test"] as const
* const tuple3 = ["hello", "world", "different"] as const
*
* stringTupleEq(tuple1, tuple2) // => true
* stringTupleEq(tuple1, tuple3) // => false
* ```
*
* **Example** (Comparing tuples with custom equivalences)
*
* ```ts import.meta.vitest
* import { Equivalence } from "effect"
*
* const caseInsensitive = Equivalence.mapInput(
*   Equivalence.strictEqual<string>(),
*   (s: string) => s.toLowerCase()
* )
*
* const customTupleEq = Equivalence.Tuple([
*   caseInsensitive,
*   caseInsensitive,
*   caseInsensitive
* ])
*
* customTupleEq(["Hello", "World", "Test"], ["HELLO", "WORLD", "TEST"]) // => true
* ```
*
* @category combinators
* @since 4.0.0
*/
function Tuple$1(elements) {
	return make$27((self, that) => {
		if (self.length !== that.length) return false;
		for (let i = 0; i < self.length; i++) if (!elements[i](self[i], that[i])) return false;
		return true;
	});
}
/**
* @since 4.0.0
*/
function Array_(item) {
	return make$27((self, that) => {
		if (self.length !== that.length) return false;
		for (let i = 0; i < self.length; i++) if (!item(self[i], that[i])) return false;
		return true;
	});
}
//#endregion
//#region node_modules/effect/dist/internal/array.js
/**
* @since 2.0.0
*/
/** @internal */
const isArrayNonEmpty$1 = (self) => self.length > 0;
//#endregion
//#region node_modules/effect/dist/internal/count.js
/**
* Normalizes a collection count to a non-negative integer. `NaN` and
* non-positive values become `0`; positive infinity is preserved.
*
* @internal
*/
const normalize$1 = (n) => n > 0 ? Math.floor(n) : 0;
//#endregion
//#region node_modules/effect/dist/internal/record.js
/** @internal */
function assignProperty(self, key, value) {
	if (key === "__proto__") Object.defineProperty(self, key, {
		value,
		writable: true,
		enumerable: true,
		configurable: true
	});
	else self[key] = value;
}
/** @internal */
function assignProperties(self, source) {
	for (const key of Reflect.ownKeys(source)) if (Object.prototype.propertyIsEnumerable.call(source, key)) assignProperty(self, key, source[key]);
}
//#endregion
//#region node_modules/effect/dist/Redactable.js
/**
* Defines the symbol used to identify objects that implement the {@link Redactable}
* protocol.
*
* **When to use**
*
* Use as the property key when implementing the `Redactable` protocol.
*
* **Details**
*
* Add a method under this key to make an object redactable. The method receives
* the current `Context` and must return the replacement value. The symbol is
* registered globally via `Symbol.for("~effect/Redactable")`, so it is
* identical across multiple copies of the library at runtime.
*
* **Example** (Masking an API key)
*
* ```ts import.meta.vitest
* import { Context, Redactable } from "effect"
*
* class ApiKey {
*   constructor(readonly raw: string) {}
*
*   [Redactable.symbolRedactable](_ctx: Context.Context<never>) {
*     return this.raw.slice(0, 4) + "..."
*   }
* }
*
* Redactable.redact(new ApiKey("secret-key")) // => "secr..."
* ```
*
* @see {@link Redactable} for the interface this symbol belongs to
* @see {@link isRedactable} to check whether a value has this symbol
* @category symbols
* @since 3.10.0
*/
const symbolRedactable = /*#__PURE__*/ Symbol.for("~effect/Redactable");
/**
* Type guard that checks whether a value implements the {@link Redactable}
* interface.
*
* **When to use**
*
* Use to narrow an unknown value before calling redaction-specific helpers.
*
* @see {@link Redactable} for the interface being checked
* @see {@link redact} to apply redaction if the value is redactable
* @category guards
* @since 3.10.0
*/
const isRedactable = (u) => hasProperty(u, symbolRedactable);
/**
* Returns a redacted value if it implements {@link Redactable}, otherwise returns it
* unchanged.
*
* **When to use**
*
* Use as the general-purpose entry point for redaction when the input may
* or may not implement the redaction protocol.
*
* **Details**
*
* This function calls {@link isRedactable} and, when it returns `true`,
* delegates to {@link getRedacted}.
*
* **Gotchas**
*
* Redaction is not recursive. Nested redactable values inside the returned
* object are not automatically redacted.
*
* @see {@link isRedactable} to check before redacting
* @see {@link getRedacted} for the lower-level variant for known redactables
* @category destructors
* @since 3.10.0
*/
function redact$1(u) {
	if (isRedactable(u)) return getRedacted(u);
	return u;
}
/**
* Returns the result of calling `[symbolRedactable]` on a value that is
* already known to be {@link Redactable}.
*
* **When to use**
*
* Use when you need to read the redacted representation from a value already
* verified as `Redactable`.
*
* **Details**
*
* This function reads the current fiber's `Context` from the global fiber
* reference and passes it to the redaction method.
*
* **Gotchas**
*
* If no fiber is active, an empty `Context` is passed to the redaction method.
*
* @see {@link redact} for the higher-level variant that handles non-redactable values
* @see {@link isRedactable} for the type guard to verify before calling this
* @category destructors
* @since 4.0.0
*/
function getRedacted(redactable) {
	return redactable[symbolRedactable](globalThis["~effect/Fiber/currentFiber"]?.context ?? emptyContext$1);
}
/** @internal */
const currentFiberTypeId = "~effect/Fiber/currentFiber";
const emptyMap = /*#__PURE__*/ new Map();
const emptyContext$1 = {
	"~effect/Context": {},
	base: emptyMap,
	depth: 0,
	mapUnsafe: emptyMap,
	pipe() {
		return pipeArguments(this, arguments);
	}
};
//#endregion
//#region node_modules/effect/dist/Formatter.js
/**
* Formats JavaScript values into readable strings.
*
* `format` is intended for logs, diagnostics, and error messages. It handles
* primitives, objects, arrays, dates, regular expressions, maps, sets, class
* instances, errors, circular references, and redactable values. `formatJson`
* wraps JSON formatting with redaction and circular-reference handling, and the
* module also includes helpers for property keys, paths, and dates.
*
* @since 4.0.0
*/
/**
* Converts any JavaScript value into a human-readable string.
*
* **When to use**
*
* Use when you need to format arbitrary JavaScript values for debugging,
* logging, or error messages.
*
* **Details**
*
* - Output is **not** valid JSON; use {@link formatJson} when you need
*   parseable JSON.
* - Handles `BigInt`, `Symbol`, `Set`, `Map`, `Date`, `RegExp`, and class
*   instances that `JSON.stringify` cannot represent.
* - Circular references are shown as `"[Circular]"` instead of throwing.
* - Failures while inspecting a value are rendered as diagnostic placeholders instead of throwing.
* - Primitives: stringified naturally (`null`, `undefined`, `123`, `true`).
*   Strings are JSON-quoted.
* - Objects with a custom `toString` (not `Object.prototype.toString`):
*   `toString()` is called unless `ignoreToString` is `true`.
* - Errors with a `cause`: formatted as `"<message> (cause: <cause>)"`.
* - Iterables (`Set`, `Map`, etc.): formatted as
*   `ClassName([...elements])`.
* - Class instances: wrapped as `ClassName({...})`.
* - `Redactable` values are automatically redacted.
* - Arrays/objects with 0–1 entries are inline; larger ones are
*   pretty-printed when `space` is set.
* - `space` — indentation unit (number of spaces, or a string like
*   `"\t"`). Defaults to `0` (compact).
* - `ignoreToString` — skip calling `toString()`. Defaults to `false`.
*
* **Example** (Formatting compact output)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* Formatter.format({ a: 1, b: [2, 3] }) // => "{\"a\":1,\"b\":[2,3]}"
* ```
*
* **Example** (Pretty-printed output)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* const output = Formatter.format({ a: 1, b: [2, 3] }, { space: 2 })
* output // => "{\n  \"a\": 1,\n  \"b\": [\n    2,\n    3\n  ]\n}"
* ```
*
* **Example** (Handling circular references)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* const obj: any = { name: "loop" }
* obj.self = obj
* Formatter.format(obj) // => "{\"name\":\"loop\",\"self\":[Circular]}"
* ```
*
* @see {@link formatJson}
* @see {@link Formatter}
* @category formatting
* @since 2.0.0
*/
function format$2(input, options) {
	const space = options?.space ?? 0;
	const ancestors = /* @__PURE__ */ new WeakSet();
	const gap = !space ? "" : typeof space === "number" ? " ".repeat(space) : space;
	const ind = (d) => gap.repeat(d);
	const wrap = (v, body) => {
		const ctor = v?.constructor;
		return ctor && ctor !== Object.prototype.constructor && ctor.name ? `${ctor.name}(${body})` : body;
	};
	const ownKeys = (o) => {
		try {
			return Reflect.ownKeys(o);
		} catch {
			return ["[ownKeys threw]"];
		}
	};
	function recur(v, d = 0) {
		try {
			return recurUnsafe(v, d);
		} catch {
			if (typeof v === "object" && v !== null || typeof v === "function") ancestors.delete(v);
			return "[inspection threw]";
		}
	}
	function recurUnsafe(v, d = 0) {
		if (typeof v === "string") return JSON.stringify(v);
		if (typeof v === "number" || v == null || typeof v === "boolean" || typeof v === "symbol") return String(v);
		if (typeof v === "bigint") return String(v) + "n";
		if (typeof v === "object" || typeof v === "function") {
			if (ancestors.has(v)) return CIRCULAR;
			ancestors.add(v);
			let output;
			if (symbolRedactable in v) output = recur(getRedacted(v), d);
			else if (Array.isArray(v)) output = !gap || v.length <= 1 ? `[${v.map((x) => recur(x, d)).join(",")}]` : `[\n${ind(d + 1)}${v.map((x) => recur(x, d + 1)).join(",\n" + ind(d + 1))}\n${ind(d)}]`;
			else if (v instanceof Date) output = formatDate(v);
			else if (!options?.ignoreToString && hasProperty(v, "toString") && typeof v["toString"] === "function" && v["toString"] !== Object.prototype.toString && v["toString"] !== Array.prototype.toString) {
				const s = safeToString(v);
				output = v instanceof Error && v.cause !== void 0 ? `${s} (cause: ${recur(v.cause, d)})` : s;
			} else if (Symbol.iterator in v) output = `${v.constructor.name}(${recur(Array.from(v), d)})`;
			else {
				const keys = ownKeys(v);
				if (!gap || keys.length <= 1) {
					const body = `{${keys.map((k) => `${formatPropertyKey(k)}:${recur(safeGet(v, k), d)}`).join(",")}}`;
					output = wrap(v, body);
				} else {
					const body = `{\n${keys.map((k) => `${ind(d + 1)}${formatPropertyKey(k)}: ${recur(safeGet(v, k), d + 1)}`).join(",\n")}\n${ind(d)}}`;
					output = wrap(v, body);
				}
			}
			ancestors.delete(v);
			return output;
		}
		return String(v);
	}
	return recur(input, 0);
}
const CIRCULAR = "[Circular]";
/**
* @internal
*/
function formatPropertyKey(name) {
	return typeof name === "string" ? JSON.stringify(name) : String(name);
}
/**
* Formats an array of property keys as a bracket-notation path string.
*
* @internal
*/
function formatPath(path) {
	return path.map((key) => `[${formatPropertyKey(key)}]`).join("");
}
/**
* Formats a `Date` as an ISO 8601 string, returning `"Invalid Date"` for
* invalid dates instead of throwing.
*
* @internal
*/
function formatDate(date) {
	try {
		return date.toISOString();
	} catch {
		return "Invalid Date";
	}
}
function safeToString(input) {
	try {
		const s = input.toString();
		return typeof s === "string" ? s : String(s);
	} catch {
		return "[toString threw]";
	}
}
function safeGet(input, key) {
	try {
		return input[key];
	} catch {
		return "[property access threw]";
	}
}
/**
* Stringifies a value to JSON safely, silently dropping circular references.
*
* **When to use**
*
* Use when you need valid JSON output, unlike `format`, and the input may
* contain circular references that should be silently omitted rather than
* throwing a `TypeError`.
*
* **Details**
*
* Uses `JSON.stringify` internally with a replacer that tracks the current
* object ancestry. Circular references are replaced with `undefined`, which
* omits them from object output. `Redactable` values are automatically redacted
* before serialization. `BigInt` values are stringified with an `n` suffix.
* `Error` instances without a `toJSON` property include their enumerable
* properties plus `name` and `message`. Errors with `toJSON` keep their custom
* representation. Other values follow standard `JSON.stringify` behavior. The
* `space` parameter controls indentation and defaults to `0`.
*
* **Gotchas**
*
* When the root input is `undefined`, a symbol, or a function, `formatJson`
* returns `"null"` instead of the `undefined` returned by `JSON.stringify`.
* Nested values retain standard `JSON.stringify` behavior.
*
* **Example** (Formatting compact JSON)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* Formatter.formatJson({ name: "Alice", age: 30 }) // => "{\"name\":\"Alice\",\"age\":30}"
* ```
*
* **Example** (Handling circular references)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* const obj: any = { name: "test" }
* obj.self = obj
* Formatter.formatJson(obj) // => "{\"name\":\"test\"}"
* ```
*
* **Example** (Pretty-printed JSON)
*
* ```ts import.meta.vitest
* import { Formatter } from "effect"
*
* const output = Formatter.formatJson({ name: "Alice", age: 30 }, { space: 2 })
* output // => "{\n  \"name\": \"Alice\",\n  \"age\": 30\n}"
* ```
*
* @see {@link format}
* @see {@link Formatter}
* @category serialization
* @since 4.0.0
*/
function formatJson(input, options) {
	const ancestors = [];
	return JSON.stringify(input, function(key, value) {
		const original = Object.getOwnPropertyDescriptor(this, key)?.value;
		const redacted = hasProperty(original, symbolRedactable) ? redact$1(original) : redact$1(value);
		if (typeof redacted === "bigint") return format$2(redacted);
		if (typeof redacted !== "object" || redacted === null) return redacted;
		const current = redacted instanceof Error && !hasProperty(redacted, "toJSON") ? {
			...redacted,
			name: redacted.name,
			message: redacted.message
		} : redacted;
		while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) ancestors.pop();
		if (ancestors.includes(redacted)) return;
		ancestors.push(redacted);
		if (current !== redacted) ancestors.push(current);
		return current;
	}, options?.space) ?? "null";
}
//#endregion
//#region node_modules/effect/dist/Inspectable.js
/**
* Controls how values appear in logs and debugging output.
*
* Effect data types use `Inspectable` to provide stable string, JSON, and
* Node.js inspection output. This keeps custom values readable in logs, REPLs,
* test failures, and diagnostics. This module defines the Node inspect symbol,
* the `Inspectable` interface, safe conversion helpers, and shared prototype or
* class implementations for custom values.
*
* @since 2.0.0
*/
/**
* Defines the symbol used by Node.js for custom object inspection.
*
* **When to use**
*
* Use to implement Node.js custom inspection for a value.
*
* **Details**
*
* This symbol is recognized by Node.js's `util.inspect()` function and the REPL
* for custom object representation. When an object has a method with this symbol,
* it will be called to determine how the object should be displayed.
*
* **Example** (Defining custom Node inspection)
*
* ```ts import.meta.vitest
* import { Inspectable } from "effect"
*
* class CustomObject {
*   constructor(private value: string) {}
*
*   [Inspectable.NodeInspectSymbol]() {
*     return `CustomObject(${this.value})`
*   }
* }
*
* const obj = new CustomObject("hello")
* obj[Inspectable.NodeInspectSymbol]() // => "CustomObject(hello)"
* ```
*
* @category symbols
* @since 2.0.0
*/
const NodeInspectSymbol = /*#__PURE__*/ Symbol.for("nodejs.util.inspect.custom");
/**
* Converts a value to its structured inspection representation.
*
* **When to use**
*
* Use when you need the structured representation of an inspectable value
* without risking unhandled errors.
*
* **Details**
*
* This function applies redaction before extracting data from objects that
* implement `toJSON`, recursively processes arrays, and handles errors
* gracefully. Plain objects are returned unchanged, so the result is not
* guaranteed to be accepted by `JSON.stringify`; it may still contain values
* such as `BigInt`, functions, or circular references.
*
* @see {@link toStringUnknown} for converting unknown values to strings
*
* @category converting
* @since 4.0.0
*/
const toJson = (input) => {
	try {
		input = redact$1(input);
		if (hasProperty(input, "toJSON") && isFunction(input["toJSON"]) && input["toJSON"].length === 0) return input.toJSON();
		else if (Array.isArray(input)) return input.map(toJson);
		return input;
	} catch {
		return "[toJSON threw]";
	}
};
/**
* Converts an unknown value to a string for diagnostics.
*
* **When to use**
*
* Use to produce a diagnostic string from a value whose runtime type is unknown.
*
* **Details**
*
* Strings are returned unchanged. Objects are formatted as JSON using the
* provided whitespace setting when possible, and values that cannot be
* formatted are converted with `String`.
*
* @category converting
* @since 2.0.0
*/
const toStringUnknown = (u, whitespace = 2) => {
	if (typeof u === "string") return u;
	try {
		return typeof u === "object" ? formatJson(u, { space: whitespace }) : format$2(u, { space: whitespace });
	} catch {
		return String(u);
	}
};
/**
* A base prototype object that implements the {@link Inspectable} interface.
*
* **When to use**
*
* Use as a prototype for plain objects that should share standard inspectable behavior.
*
* **Details**
*
* This object provides default implementations for the {@link Inspectable} methods.
* It can be used as a prototype for objects that want to be inspectable,
* or as a mixin to add inspection capabilities to existing objects.
*
* **Example** (Using the base inspectable prototype)
*
* ```ts import.meta.vitest
* import { Inspectable } from "effect"
*
* // Use as prototype
* const myObject = Object.create(Inspectable.BaseProto)
* myObject.name = "example"
* myObject.value = 42
*
* myObject.toString() // => "\"[toJSON threw]\""
*
* // Or extend in a constructor
* function MyClass(this: any, name: string) {
*   this.name = name
* }
* MyClass.prototype = Object.create(Inspectable.BaseProto)
* MyClass.prototype.constructor = MyClass
* ```
*
* @category prototypes
* @since 2.0.0
*/
const BaseProto = {
	toJSON() {
		return toJson(this);
	},
	[NodeInspectSymbol]() {
		return this.toJSON();
	},
	toString() {
		return format$2(this.toJSON());
	}
};
/**
* Provides an abstract base class that implements the Inspectable interface.
*
* **When to use**
*
* Use as a base class for inspectable objects that define their own JSON representation.
*
* **Details**
*
* This class provides a convenient way to create inspectable objects by extending it.
* Subclasses only need to implement the `toJSON()` method, and they automatically
* get proper `toString()` and Node.js inspection support.
*
* **Example** (Extending the inspectable base class)
*
* ```ts import.meta.vitest
* import { Inspectable } from "effect"
*
* class User extends Inspectable.Class {
*   constructor(
*     public readonly id: number,
*     public readonly name: string,
*     public readonly email: string
*   ) {
*     super()
*   }
*
*   toJSON() {
*     return {
*       _tag: "User",
*       id: this.id,
*       name: this.name,
*       email: this.email
*     }
*   }
* }
*
* const user = new User(1, "Alice", "alice@example.com")
* user.toString() // => "{\"_tag\":\"User\",\"id\":1,\"name\":\"Alice\",\"email\":\"alice@example.com\"}"
* user[Inspectable.NodeInspectSymbol]() // => { _tag: "User", id: 1, name: "Alice", email: "alice@example.com" }
* ```
*
* @category models
* @since 2.0.0
*/
var Class$1 = class {
	/**
	* Node.js custom inspection method.
	*
	* **When to use**
	*
	* Use to expose the class JSON representation to Node.js inspection.
	*
	* @since 2.0.0
	*/
	[NodeInspectSymbol]() {
		return this.toJSON();
	}
	/**
	* Returns a formatted string representation of this object.
	*
	* **When to use**
	*
	* Use to format the class JSON representation as a string.
	*
	* @since 2.0.0
	*/
	toString() {
		return format$2(this.toJSON());
	}
};
//#endregion
//#region node_modules/effect/dist/internal/stackTraceLimit.js
/**
* Check if `Error.stackTraceLimit` is writable.
* Returns `false` if the property is frozen, non-writable, or `Error` is non-extensible.
*
* @internal
*/
const isStackTraceLimitWritable = () => {
	const desc = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
	if (desc === void 0) return Object.isExtensible(Error);
	return Object.hasOwn(desc, "writable") ? desc.writable === true : desc.set !== void 0;
};
const canWriteStackTraceLimit = /*#__PURE__*/ isStackTraceLimitWritable();
/**
* Get the current `Error.stackTraceLimit` value.
* Returns `undefined` if the property doesn't exist.
*
* @internal
*/
const getStackTraceLimit = () => Error.stackTraceLimit;
/**
* Safely set `Error.stackTraceLimit` if possible, otherwise no-op.
*
* Accepts `undefined` so a value read via {@link getStackTraceLimit} can be
* restored faithfully.
*
* @internal
*/
const setStackTraceLimit = (value) => {
	if (canWriteStackTraceLimit) Error.stackTraceLimit = value;
};
//#endregion
//#region node_modules/effect/dist/Utils.js
/**
* Yields its wrapped value exactly once, then completes with the value sent
* back in.
*
* **When to use**
*
* Use to implement `[Symbol.iterator]()` on Effect-like types so they can be
* `yield*`-ed inside generator functions, such as `Effect.gen` and
* `Option.gen`.
*
* **Details**
*
* The first call to `next()` returns a fresh `{ value: self, done: false }`.
* Every subsequent call returns `{ value: a, done: true }` where `a` is the
* argument passed to `next()`. To keep `yield*` cheap, the completion result
* is the iterator itself rather than a new object, so only the iterator and
* the single yielded result are allocated per `yield*`.
*
* **Example** (Yielding a wrapped value in a generator)
*
* ```ts import.meta.vitest
* import { Utils } from "effect"
*
* const gen = new Utils.SingleShotGen<string, number>("hello")
*
* gen.next(0).value // => "hello"
*
* gen.next(42).value // => 42
* ```
*
* @see {@link Gen} for the type-level signature that relies on `SingleShotGen`
* @category constructors
* @since 2.0.0
*/
var SingleShotGen = class {
	constructor(self) {
		this.value = self;
		this.done = false;
	}
	/**
	* Yields the stored value once, then completes with the value sent back in.
	*
	* **When to use**
	*
	* Use to advance a `SingleShotGen` through its single yield and completion
	* step.
	*
	* @since 2.0.0
	*/
	next(a) {
		if (this.done) {
			this.value = a;
			return this;
		}
		this.done = true;
		return {
			value: this.value,
			done: false
		};
	}
};
const pickInternalCall = () => {
	const InternalTypeId = "~effect/Utils/internal";
	const standard = { [InternalTypeId]: (body) => {
		return body();
	} };
	const forced = { [InternalTypeId]: (body) => {
		try {
			return body();
		} finally {}
	} };
	return getStackTraceLimit() !== 0 && standard[InternalTypeId](() => (/* @__PURE__ */ new Error()).stack)?.includes(InternalTypeId) === true ? standard[InternalTypeId] : forced[InternalTypeId];
};
/** @internal */
const internalCall = /*#__PURE__*/ pickInternalCall();
//#endregion
//#region node_modules/effect/dist/internal/core.js
/** @internal */
const EffectTypeId = `~effect/Effect`;
/** @internal */
const ExitTypeId = `~effect/Exit`;
const effectVariance = {
	_A: identity,
	_E: identity,
	_R: identity
};
/** @internal */
const identifier = `${EffectTypeId}/identifier`;
/** @internal */
const args = `${EffectTypeId}/args`;
/** @internal */
const evaluate = `${EffectTypeId}/evaluate`;
/** @internal */
const contA = `${EffectTypeId}/successCont`;
/** @internal */
const contE = `${EffectTypeId}/failureCont`;
/** @internal */
const contAll = `${EffectTypeId}/ensureCont`;
/** @internal */
const Yield = /*#__PURE__*/ Symbol.for("effect/Effect/Yield");
/** @internal */
const PipeInspectableProto = {
	pipe() {
		return pipeArguments(this, arguments);
	},
	toJSON() {
		return { ...this };
	},
	toString() {
		return format$2(this.toJSON(), {
			ignoreToString: true,
			space: 2
		});
	},
	[NodeInspectSymbol]() {
		return this.toJSON();
	}
};
/** @internal */
const EffectProto = {
	[EffectTypeId]: effectVariance,
	...PipeInspectableProto,
	[Symbol.iterator]() {
		return new SingleShotGen(this);
	},
	toJSON() {
		return {
			_id: "Effect",
			op: this[identifier],
			...args in this ? { args: this[args] } : void 0
		};
	}
};
/** @internal */
const isEffect$1 = (u) => hasProperty(u, EffectTypeId);
/** @internal */
const isExit = (u) => hasProperty(u, ExitTypeId);
/** @internal */
const CauseTypeId = "~effect/Cause";
/** @internal */
const CauseReasonTypeId = "~effect/Cause/Reason";
/** @internal */
const isCause = (self) => hasProperty(self, CauseTypeId);
/** @internal */
var CauseImpl = class {
	constructor(failures) {
		this[CauseTypeId] = CauseTypeId;
		this.reasons = failures;
	}
	pipe() {
		return pipeArguments(this, arguments);
	}
	toJSON() {
		return {
			_id: "Cause",
			failures: this.reasons.map((f) => f.toJSON())
		};
	}
	toString() {
		return `Cause(${format$2(this.reasons)})`;
	}
	[NodeInspectSymbol]() {
		return this.toJSON();
	}
	[symbol](that) {
		return isCause(that) && this.reasons.length === that.reasons.length && this.reasons.every((e, i) => equals$1(e, that.reasons[i]));
	}
	[symbol$1]() {
		return array$1(this.reasons);
	}
};
const annotationsMap = /*#__PURE__*/ new WeakMap();
/** @internal */
var ReasonBase = class {
	[CauseReasonTypeId];
	annotations;
	_tag;
	constructor(_tag, annotations, originalError) {
		this[CauseReasonTypeId] = CauseReasonTypeId;
		this._tag = _tag;
		if (annotations !== constEmptyAnnotations && typeof originalError === "object" && originalError !== null && annotations.size > 0) {
			const prevAnnotations = annotationsMap.get(originalError);
			if (prevAnnotations) annotations = new Map([...prevAnnotations, ...annotations]);
			annotationsMap.set(originalError, annotations);
		}
		this.annotations = annotations;
	}
	annotate(annotations, options) {
		if (annotations.mapUnsafe.size === 0) return this;
		const newAnnotations = new Map(this.annotations);
		annotations.mapUnsafe.forEach((value, key) => {
			if (options?.overwrite !== true && newAnnotations.has(key)) return;
			newAnnotations.set(key, value);
		});
		const self = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
		self.annotations = newAnnotations;
		return self;
	}
	pipe() {
		return pipeArguments(this, arguments);
	}
	toString() {
		return format$2(this);
	}
	[NodeInspectSymbol]() {
		return this.toString();
	}
};
/** @internal */
const constEmptyAnnotations = /*#__PURE__*/ new Map();
/** @internal */
var Fail = class extends ReasonBase {
	constructor(error, annotations = constEmptyAnnotations) {
		super("Fail", annotations, error);
		this.error = error;
	}
	toString() {
		return `Fail(${format$2(this.error)})`;
	}
	toJSON() {
		return {
			_tag: "Fail",
			error: this.error
		};
	}
	[symbol](that) {
		return isFailReason$1(that) && equals$1(this.error, that.error) && equals$1(this.annotations, that.annotations);
	}
	[symbol$1]() {
		return combine(string$1(this._tag))(combine(hash(this.error))(hash(this.annotations)));
	}
};
/** @internal */
const causeFromReasons = (reasons) => new CauseImpl(reasons);
const dedupeReasons = (self, that) => {
	const buckets = /* @__PURE__ */ new Map();
	const out = [];
	for (const reason of self.concat(that)) {
		const hash$2 = hash(reason);
		const bucket = buckets.get(hash$2);
		if (bucket === void 0) buckets.set(hash$2, [reason]);
		else if (bucket.some((previous) => equals$1(previous, reason))) continue;
		else bucket.push(reason);
		out.push(reason);
	}
	return out;
};
/** @internal */
const causeCombine = /*#__PURE__*/ dual(2, (self, that) => {
	if (self.reasons.length === 0) return that;
	else if (that.reasons.length === 0) return self;
	const newCause = new CauseImpl(dedupeReasons(self.reasons, that.reasons));
	return equals$1(self, newCause) ? self : newCause;
});
/** @internal */
const causeEmpty = /*#__PURE__*/ new CauseImpl([]);
/** @internal */
const causeFail = (error) => new CauseImpl([new Fail(error)]);
/** @internal */
var Die = class extends ReasonBase {
	constructor(defect, annotations = constEmptyAnnotations) {
		super("Die", annotations, defect);
		this.defect = defect;
	}
	toString() {
		return `Die(${format$2(this.defect)})`;
	}
	toJSON() {
		return {
			_tag: "Die",
			defect: this.defect
		};
	}
	[symbol](that) {
		return isDieReason(that) && equals$1(this.defect, that.defect) && equals$1(this.annotations, that.annotations);
	}
	[symbol$1]() {
		return combine(string$1(this._tag))(combine(hash(this.defect))(hash(this.annotations)));
	}
};
/** @internal */
const causeDie = (defect) => new CauseImpl([new Die(defect)]);
/** @internal */
const causeAnnotate = /*#__PURE__*/ dual((args) => isCause(args[0]), (self, annotations, options) => {
	if (annotations.mapUnsafe.size === 0) return self;
	return new CauseImpl(self.reasons.map((f) => f.annotate(annotations, options)));
});
/** @internal */
const isFailReason$1 = (self) => self._tag === "Fail";
/** @internal */
const isDieReason = (self) => self._tag === "Die";
/** @internal */
const isInterruptReason = (self) => self._tag === "Interrupt";
function defaultEvaluate(_fiber) {
	return exitDie(`Effect.evaluate: Not implemented`);
}
/** @internal */
const makePrimitiveProto = (options) => ({
	...EffectProto,
	[identifier]: options.op,
	[evaluate]: options[evaluate] ?? defaultEvaluate,
	[contA]: options[contA],
	[contE]: options[contE],
	[contAll]: options[contAll]
});
/** @internal */
const makePrimitive = (options) => {
	const Proto = makePrimitiveProto(options);
	const PrimitiveImpl = function(value) {
		this[args] = value;
	};
	PrimitiveImpl.prototype = Proto;
	return function(value) {
		return new PrimitiveImpl(value);
	};
};
/** @internal */
const makeExit = (options) => {
	const Proto = {
		[ExitTypeId]: ExitTypeId,
		_tag: options.op,
		get [options.prop]() {
			return this[args];
		},
		...makePrimitiveProto(options),
		toString() {
			return `${options.op}(${format$2(this[args])})`;
		},
		toJSON() {
			return {
				_id: "Exit",
				_tag: options.op,
				[options.prop]: this[args]
			};
		},
		[symbol](that) {
			return isExit(that) && that._tag === this._tag && equals$1(this[args], that[args]);
		},
		[symbol$1]() {
			return combine(string$1(options.op), hash(this[args]));
		}
	};
	const ExitPrimitive = function(value) {
		this[args] = value;
	};
	ExitPrimitive.prototype = Proto;
	return function(value) {
		return new ExitPrimitive(value);
	};
};
/** @internal */
const exitSucceed = /*#__PURE__*/ makeExit({
	op: "Success",
	prop: "value",
	[evaluate](fiber) {
		const cont = fiber.getCont(contA);
		return cont ? cont[contA](this[args], fiber, this) : fiber.yieldWith(this);
	}
});
/** @internal */
const StackTraceKey = { key: "effect/Cause/StackTrace" };
/** @internal */
const InterruptorStackTrace = { key: "effect/Cause/InterruptorStackTrace" };
/** @internal */
const exitFailCause = /*#__PURE__*/ makeExit({
	op: "Failure",
	prop: "cause",
	[evaluate](fiber) {
		let cause = this[args];
		let annotated = false;
		if (fiber.cache.stackFrame) {
			cause = causeAnnotate(cause, { mapUnsafe: /* @__PURE__ */ new Map([[StackTraceKey.key, fiber.cache.stackFrame]]) });
			annotated = true;
		}
		let cont = fiber.getCont(contE);
		const interruptedCause = fiber._interruptedCause;
		if (interruptedCause && fiber.interruptible) {
			let skippedHandler = false;
			while (cont && fiber.interruptible) {
				skippedHandler ||= identifier in cont;
				cont = fiber.getCont(contE);
			}
			if (skippedHandler) cause = causeFromReasons(cause.reasons.filter((reason) => reason._tag !== "Fail"));
			cause = causeCombine(cause, interruptedCause);
			annotated = true;
		}
		return cont ? cont[contE](cause, fiber, annotated ? void 0 : this) : fiber.yieldWith(annotated ? exitFailCause(cause) : this);
	}
});
/** @internal */
const exitFail = (e) => exitFailCause(causeFail(e));
/** @internal */
const exitDie = (defect) => exitFailCause(causeDie(defect));
/** @internal */
const withFiber$1 = /*#__PURE__*/ makePrimitive({
	op: "WithFiber",
	[evaluate](fiber) {
		return this[args](fiber);
	}
});
/** @internal */
const YieldableError = /*#__PURE__*/ function() {
	class YieldableError extends globalThis.Error {}
	const proto = /*#__PURE__*/ makePrimitiveProto({
		op: "YieldableError",
		[evaluate]() {
			return exitFail(this);
		}
	});
	delete proto.toString;
	Object.assign(YieldableError.prototype, proto);
	return YieldableError;
}();
/** @internal */
const Error$3 = /*#__PURE__*/ function() {
	const plainArgsSymbol = /*#__PURE__*/ Symbol.for("effect/Data/Error/plainArgs");
	return class Base extends YieldableError {
		constructor(args) {
			super(args?.message, args?.cause ? { cause: args.cause } : void 0);
			if (args) {
				assignProperties(this, args);
				Object.defineProperty(this, plainArgsSymbol, {
					value: args,
					enumerable: false
				});
			}
		}
		toJSON() {
			return {
				...this[plainArgsSymbol],
				...this
			};
		}
	};
}();
/** @internal */
const TaggedError$2 = (tag) => {
	class Base extends Error$3 {
		_tag = tag;
	}
	Base.prototype.name = tag;
	return Base;
};
/** @internal */
const DoneTypeId = "~effect/Cause/Done";
/** @internal */
const isDone$1 = (u) => hasProperty(u, DoneTypeId);
const DoneVoid = {
	[DoneTypeId]: DoneTypeId,
	_tag: "Done",
	value: void 0
};
/** @internal */
const Done = (value) => {
	if (value === void 0) return DoneVoid;
	return {
		[DoneTypeId]: DoneTypeId,
		_tag: "Done",
		value
	};
};
const doneVoid = /*#__PURE__*/ exitFail(DoneVoid);
/** @internal */
const done$2 = (value) => {
	if (value === void 0) return doneVoid;
	return exitFail(Done(value));
};
//#endregion
//#region node_modules/effect/dist/internal/option.js
/**
* @since 2.0.0
*/
const TypeId$33 = "~effect/Option";
const CommonProto$1 = {
	[TypeId$33]: { _A: (_) => _ },
	...PipeInspectableProto,
	[Symbol.iterator]() {
		return new SingleShotGen(this);
	}
};
const SomeProto = /*#__PURE__*/ Object.defineProperty(/*#__PURE__*/ Object.assign(/*#__PURE__*/ Object.create(CommonProto$1), {
	_tag: "Some",
	_op: "Some",
	[symbol](that) {
		return isOption(that) && isSome$1(that) && equals$1(this.value, that.value);
	},
	[symbol$1]() {
		return combine(hash(this._tag))(hash(this.value));
	},
	toString() {
		return `some(${format$2(this.value)})`;
	},
	toJSON() {
		return {
			_id: "Option",
			_tag: this._tag,
			value: toJson(this.value)
		};
	}
}), "valueOrUndefined", { get() {
	return this.value;
} });
const NoneHash = /*#__PURE__*/ hash("None");
const NoneProto = /*#__PURE__*/ Object.assign(/*#__PURE__*/ Object.create(CommonProto$1), {
	_tag: "None",
	_op: "None",
	valueOrUndefined: void 0,
	[symbol](that) {
		return isOption(that) && isNone$1(that);
	},
	[symbol$1]() {
		return NoneHash;
	},
	toString() {
		return `none()`;
	},
	toJSON() {
		return {
			_id: "Option",
			_tag: this._tag
		};
	}
});
/** @internal */
const isOption = (input) => hasProperty(input, TypeId$33);
/** @internal */
const isNone$1 = (fa) => fa._tag === "None";
/** @internal */
const isSome$1 = (fa) => fa._tag === "Some";
/** @internal */
const none$1 = /*#__PURE__*/ Object.create(NoneProto);
/** @internal */
const SomeImpl = function(value) {
	this.value = value;
};
SomeImpl.prototype = SomeProto;
/** @internal */
const some$1 = (value) => new SomeImpl(value);
//#endregion
//#region node_modules/effect/dist/internal/result.js
const TypeId$32 = "~effect/Result";
const CommonProto = {
	[TypeId$32]: {
		/* v8 ignore next 2 */
		_A: (_) => _,
		_E: (_) => _
	},
	...PipeInspectableProto,
	[Symbol.iterator]() {
		return new SingleShotGen(this);
	}
};
const SuccessProto = /*#__PURE__*/ Object.assign(/*#__PURE__*/ Object.create(CommonProto), {
	_tag: "Success",
	_op: "Success",
	[symbol](that) {
		return isResult(that) && isSuccess$2(that) && equals$1(this.success, that.success);
	},
	[symbol$1]() {
		return combine(hash(this._tag))(hash(this.success));
	},
	toString() {
		return `success(${format$2(this.success)})`;
	},
	toJSON() {
		return {
			_id: "Result",
			_tag: this._tag,
			value: toJson(this.success)
		};
	}
});
const FailureProto = /*#__PURE__*/ Object.assign(/*#__PURE__*/ Object.create(CommonProto), {
	_tag: "Failure",
	_op: "Failure",
	[symbol](that) {
		return isResult(that) && isFailure$1(that) && equals$1(this.failure, that.failure);
	},
	[symbol$1]() {
		return combine(hash(this._tag))(hash(this.failure));
	},
	toString() {
		return `failure(${format$2(this.failure)})`;
	},
	toJSON() {
		return {
			_id: "Result",
			_tag: this._tag,
			failure: toJson(this.failure)
		};
	}
});
/** @internal */
const isResult = (input) => hasProperty(input, TypeId$32);
/** @internal */
const isFailure$1 = (result) => result._tag === "Failure";
/** @internal */
const isSuccess$2 = (result) => result._tag === "Success";
/** @internal */
const FailureImpl = function(failure) {
	this.failure = failure;
};
FailureImpl.prototype = FailureProto;
/** @internal */
const fail$7 = (failure) => new FailureImpl(failure);
/** @internal */
const SuccessImpl = function(success) {
	this.success = success;
};
SuccessImpl.prototype = SuccessProto;
/** @internal */
const succeed$8 = (success) => new SuccessImpl(success);
//#endregion
//#region node_modules/effect/dist/Order.js
/**
* Defines comparison functions for ordered values.
*
* An `Order<A>` compares two `A` values and returns whether the first is less
* than, equal to, or greater than the second. Orders are used for sorting,
* choosing minimum or maximum values, checking ranges, and building ordered data
* structures. This module includes built-in orders, constructors for custom
* orders, tools for reversing and combining comparisons, tuple and struct
* helpers, comparison predicates, clamping, and reducer support.
*
* @since 2.0.0
*/
/**
* Creates a new `Order` instance from a comparison function.
*
* **When to use**
*
* Use when you need a sorting rule not covered by the built-in orders or input
* mapping helpers, and you can provide a total comparison.
*
* **Details**
*
* Uses reference equality (`===`) as a shortcut: if `self === that`, it returns
* `0` without calling the comparison function. The comparison function should
* return `-1`, `0`, or `1`, and the returned order satisfies total ordering
* laws when the comparison function does.
*
* **Example** (Creating an Order)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* const byAge = Order.make<{ name: string; age: number }>((self, that) => {
*   if (self.age < that.age) return -1
*   if (self.age > that.age) return 1
*   return 0
* })
*
* byAge({ name: "Alice", age: 30 }, { name: "Bob", age: 25 }) // => 1
* byAge({ name: "Alice", age: 25 }, { name: "Bob", age: 30 }) // => -1
* ```
*
* @see {@link mapInput} to transform an order by mapping the input type
* @see {@link combine} to combine multiple orders
* @category constructors
* @since 2.0.0
*/
function make$26(compare) {
	return (self, that) => self === that ? 0 : compare(self, that);
}
/**
* Order instance for strings that compares them lexicographically using JavaScript's `<` operator.
*
* **When to use**
*
* Use when you need lexicographic string ordering.
*
* **Details**
*
* Uses lexicographic dictionary ordering. The empty string is less than any
* non-empty string, and comparisons are case-sensitive.
*
* **Example** (Ordering strings)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* Order.String("apple", "banana") // => -1
* Order.String("banana", "apple") // => 1
* Order.String("apple", "apple") // => 0
* ```
*
* @see {@link mapInput} to compare objects by a string property
* @see {@link Struct} to combine with other orders for struct comparison
* @category instances
* @since 4.0.0
*/
const String$5 = /*#__PURE__*/ make$26((self, that) => self < that ? -1 : 1);
/**
* Order instance for numbers that compares them numerically.
*
* **When to use**
*
* Use when you need numeric ordering for numbers.
*
* **Details**
*
* `0` is considered equal to `-0`. All `NaN` values are considered equal to
* each other, and any `NaN` is considered less than any non-`NaN` number. All
* other values use standard numeric comparison.
*
* **Example** (Ordering numbers)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* Order.Number(1, 1) // => 0
* Order.Number(1, 2) // => -1
* Order.Number(2, 1) // => 1
*
* Order.Number(0, -0) // => 0
* Order.Number(NaN, 1) // => -1
* ```
*
* @see {@link mapInput} to compare objects by a number property
* @see {@link BigInt} for bigint comparisons
* @category instances
* @since 4.0.0
*/
const Number$4 = /*#__PURE__*/ make$26((self, that) => {
	if (globalThis.Number.isNaN(self) && globalThis.Number.isNaN(that)) return 0;
	if (globalThis.Number.isNaN(self)) return -1;
	if (globalThis.Number.isNaN(that)) return 1;
	return self < that ? -1 : 1;
});
/**
* Transforms an `Order` on type `A` into an `Order` on type `B` by providing a function that
* maps values of type `B` to values of type `A`.
*
* **When to use**
*
* Use when you need to adapt an `Order` to compare a larger value by one
* derived property.
*
* **Details**
*
* Applies the mapping function to both values before comparison. The mapping
* function should be pure and not have side effects so the ordering properties
* of the original order are preserved.
*
* **Example** (Mapping Input)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* const byLength = Order.mapInput(Order.Number, (s: string) => s.length)
*
* byLength("a", "bb") // => -1
* byLength("bb", "a") // => 1
* byLength("aa", "bb") // => 0
* ```
*
* @see {@link combine} to combine mapped orders for multi-criteria comparison
* @see {@link Struct} to create orders for structs with multiple fields
* @category mapping
* @since 2.0.0
*/
const mapInput = /*#__PURE__*/ dual(2, (self, f) => make$26((b1, b2) => self(f(b1), f(b2))));
/**
* Checks whether one value is strictly less than another according to the given order.
*
* **When to use**
*
* Use when you need a boolean less-than predicate using an `Order`.
*
* **Details**
*
* Returns `true` if the order returns `-1`, meaning the first value is less
* than the second. Equal or greater values return `false`.
*
* **Example** (Checking less-than comparisons)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* const isLessThanNumber = Order.isLessThan(Order.Number)
*
* isLessThanNumber(1, 2) // => true
* isLessThanNumber(2, 1) // => false
* isLessThanNumber(1, 1) // => false
* ```
*
* @see {@link isLessThanOrEqualTo} for non-strict less than or equal
* @see {@link isGreaterThan} for strict greater than
* @category predicates
* @since 4.0.0
*/
const isLessThan$1 = (O) => dual(2, (self, that) => O(self, that) === -1);
/**
* Checks whether one value is strictly greater than another according to the given order.
*
* **When to use**
*
* Use when you need a boolean greater-than predicate using an `Order`.
*
* **Details**
*
* Returns `true` if the order returns `1`, meaning the first value is greater
* than the second. Equal or lesser values return `false`.
*
* **Example** (Checking greater-than comparisons)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* const isGreaterThanNumber = Order.isGreaterThan(Order.Number)
*
* isGreaterThanNumber(2, 1) // => true
* isGreaterThanNumber(1, 2) // => false
* isGreaterThanNumber(1, 1) // => false
* ```
*
* @see {@link isGreaterThanOrEqualTo} for non-strict greater than or equal
* @see {@link isLessThan} for strict less than
* @category predicates
* @since 4.0.0
*/
const isGreaterThan$1 = (O) => dual(2, (self, that) => O(self, that) === 1);
/**
* Checks whether one value is less than or equal to another according to the given order.
*
* **When to use**
*
* Use when you need a boolean less-than-or-equal predicate using an `Order`.
*
* **Details**
*
* Returns `true` if the order returns `-1` or `0`, and returns `false` only if
* the order returns `1`.
*
* **Example** (Checking less-than-or-equal comparisons)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* const isLessThanOrEqualToNumber = Order.isLessThanOrEqualTo(Order.Number)
*
* isLessThanOrEqualToNumber(1, 2) // => true
* isLessThanOrEqualToNumber(1, 1) // => true
* isLessThanOrEqualToNumber(2, 1) // => false
* ```
*
* @see {@link isLessThan} for strict less than
* @see {@link isGreaterThan} for strict greater than
* @category predicates
* @since 4.0.0
*/
const isLessThanOrEqualTo$1 = (O) => dual(2, (self, that) => O(self, that) !== 1);
/**
* Checks whether one value is greater than or equal to another according to the given order.
*
* **When to use**
*
* Use when you need a boolean greater-than-or-equal predicate using an
* `Order`.
*
* **Details**
*
* Returns `true` if the order returns `1` or `0`, and returns `false` only if
* the order returns `-1`.
*
* **Example** (Checking greater-than-or-equal comparisons)
*
* ```ts import.meta.vitest
* import { Order } from "effect"
*
* const isGreaterThanOrEqualToNumber = Order.isGreaterThanOrEqualTo(Order.Number)
*
* isGreaterThanOrEqualToNumber(2, 1) // => true
* isGreaterThanOrEqualToNumber(1, 1) // => true
* isGreaterThanOrEqualToNumber(1, 2) // => false
* ```
*
* @see {@link isGreaterThan} for strict greater than
* @see {@link isLessThanOrEqualTo} for less than or equal
* @category predicates
* @since 4.0.0
*/
const isGreaterThanOrEqualTo$1 = (O) => dual(2, (self, that) => O(self, that) !== -1);
//#endregion
//#region node_modules/effect/dist/Option.js
/**
* Creates an `Option` representing the absence of a value.
*
* **When to use**
*
* Use to represent a missing or uninitialized value, such as returning "no
* result" from a function.
*
* **Details**
*
* - Returns `Option<never>`, which is a subtype of `Option<A>` for any `A`
* - Always returns the same singleton instance
*
* **Example** (Creating an empty Option)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* //      ┌─── Option<never>
* //      ▼
* const noValue = Option.none() // => Option.none()
* ```
*
* @see {@link some} for the opposite operation.
*
* @category constructors
* @since 2.0.0
*/
const none = () => none$1;
/**
* Wraps the given value into an `Option` to represent its presence.
*
* **When to use**
*
* Use to wrap a known present value as `Option`
* - Returning a successful result from a partial function
*
* **Details**
*
* - Always returns `Some<A>`
* - Does not filter `null` or `undefined`; use {@link fromNullishOr} for that
*
* **Example** (Wrapping a value)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* //      ┌─── Option<number>
* //      ▼
* const value = Option.some(1) // => Option.some(1)
* ```
*
* @see {@link none} for the opposite operation.
*
* @category constructors
* @since 2.0.0
*/
const some = some$1;
/**
* Checks whether an `Option` is `None` (absent).
*
* **When to use**
*
* Use when you need to branch on an absent `Option` before accessing `.value`.
*
* **Details**
*
* - Acts as a type guard, narrowing to `None<A>`
*
* **Example** (Checking for None)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* Option.isNone(Option.some(1)) // => false
* Option.isNone(Option.none()) // => true
* ```
*
* @see {@link isSome} for the opposite check.
*
* @category guards
* @since 2.0.0
*/
const isNone = isNone$1;
/**
* Checks whether an `Option` contains a value (`Some`).
*
* **When to use**
*
* Use when you need to branch on a present `Option` before accessing `.value`.
*
* **Details**
*
* - Acts as a type guard, narrowing to `Some<A>`
*
* **Example** (Checking for Some)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* Option.isSome(Option.some(1)) // => true
* Option.isSome(Option.none()) // => false
* ```
*
* @see {@link isNone} for the opposite check.
*
* @category guards
* @since 2.0.0
*/
const isSome = isSome$1;
/**
* Pattern-matches on an `Option`, handling both `None` and `Some` cases.
*
* **When to use**
*
* Use when you need to handle both `Some` and `None` in one expression and
* transform an `Option` into a plain value.
*
* **Details**
*
* - If `None`, calls `onNone` and returns its result
* - If `Some`, calls `onSome` with the value and returns its result
* - Supports the `dual` API (data-last and data-first)
*
* **Example** (Matching on an Option)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* Option.match(Option.some(1), {
*   onNone: () => "Option is empty",
*   onSome: (value) => `Option has a value: ${value}`
* }) // => "Option has a value: 1"
* ```
*
* @see {@link getOrElse} for unwrapping with a default
*
* @category pattern matching
* @since 2.0.0
*/
const match$4 = /*#__PURE__*/ dual(2, (self, { onNone, onSome }) => isNone(self) ? onNone() : onSome(self.value));
/**
* Extracts the value from a `Some`, or evaluates a fallback thunk on `None`.
*
* **When to use**
*
* Use when providing a default value for an absent `Option`
* - Unwrapping with lazy evaluation of the fallback
*
* **Details**
*
* - `Some` → returns the inner value
* - `None` → calls `onNone()` and returns its result
* - `onNone` is only called when needed (lazy)
*
* **Example** (Unwrapping with a fallback)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* Option.some(1).pipe(Option.getOrElse(() => 0)) // => 1
* Option.none().pipe(Option.getOrElse(() => 0)) // => 0
* ```
*
* @see {@link getOrNull} to fall back to `null`
* @see {@link getOrUndefined} to fall back to `undefined`
* @see {@link getOrThrow} to throw on `None`
*
* @category getters
* @since 2.0.0
*/
const getOrElse = /*#__PURE__*/ dual(2, (self, onNone) => isNone(self) ? onNone() : self.value);
/**
* Converts a nullable value (`null` or `undefined`) into an `Option`.
*
* **When to use**
*
* Use when you need JavaScript nullish values to become absence at an API
* boundary while all other values, including falsy ones, remain present.
*
* **Details**
*
* - `null` or `undefined` → `None`
* - Any other value → `Some` (typed as `NonNullable<A>`)
*
* **Example** (Converting nullable values to an Option)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* Option.fromNullishOr(undefined) // => Option.none()
* Option.fromNullishOr(null) // => Option.none()
* Option.fromNullishOr(1) // => Option.some(1)
* ```
*
* @see {@link fromNullOr} to only treat `null` as absent
* @see {@link fromUndefinedOr} to only treat `undefined` as absent
* @see {@link liftNullishOr} to lift a nullable-returning function
*
* @category converting
* @since 4.0.0
*/
const fromNullishOr = (a) => a == null ? none() : some(a);
/**
* Extracts the value from a `Some`, or returns `undefined` for `None`.
*
* **When to use**
*
* Use when you need to pass absent `Option` values to APIs that expect
* `undefined`.
*
* **Details**
*
* - `Some` → the inner value
* - `None` → `undefined`
*
* **Example** (Unwrapping to undefined)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* Option.getOrUndefined(Option.some(1)) // => 1
* Option.getOrUndefined(Option.none()) // => undefined
* ```
*
* @see {@link getOrNull} to return `null` instead
* @see {@link getOrElse} for a custom fallback
*
* @category getters
* @since 2.0.0
*/
const getOrUndefined$1 = /*#__PURE__*/ getOrElse(constUndefined);
/**
* Lifts a function that may throw into one that returns an `Option`.
*
* **When to use**
*
* Use to wrap exception-throwing APIs (e.g. `JSON.parse`) for safe usage
*
* **Details**
*
* - If the function returns normally → `Some` with the result
* - If the function throws → `None` (exception is swallowed)
*
* **Example** (Lifting JSON.parse)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* const parse = Option.liftThrowable(JSON.parse)
*
* parse("1") // => Option.some(1)
* parse("") // => Option.none()
* ```
*
* @see {@link liftNullishOr} for nullable-returning functions
*
* @category converting
* @since 2.0.0
*/
const liftThrowable = (f) => (...a) => {
	try {
		return some(f(...a));
	} catch {
		return none();
	}
};
/**
* Transforms the value inside a `Some` using the provided function, leaving
* `None` unchanged.
*
* **When to use**
*
* Use to apply a pure transformation to an `Option`'s present value, especially
* when chaining transformations in a pipeline.
*
* **Details**
*
* - `Some` → applies `f` and wraps the result in a new `Some`
* - `None` → returns `None` unchanged
*
* **Example** (Mapping over an Option)
*
* ```ts import.meta.vitest
* import { Option } from "effect"
*
* Option.map(Option.some(2), (n) => n * 2) // => Option.some(4)
* Option.map(Option.none(), (n: number) => n * 2) // => Option.none()
* ```
*
* @see {@link flatMap} when `f` returns an `Option`
* @see {@link as} to replace the value with a constant
*
* @category mapping
* @since 2.0.0
*/
const map$7 = /*#__PURE__*/ dual(2, (self, f) => isNone(self) ? none() : some(f(self.value)));
//#endregion
//#region node_modules/effect/dist/Result.js
/**
* Creates a `Result` holding a `Success` value.
*
* **Details**
*
* - Use when you have a value and want to lift it into the `Result` type
* - The error type `E` defaults to `never`
*
* **Example** (Wrapping a value)
*
* ```ts import.meta.vitest
* import { Result } from "effect"
*
* Result.succeed(42) // => Result.succeed(42)
* ```
*
* @see {@link fail} to create a Failure
* @see {@link void_ void} for a pre-built `Success<void>`
*
* @category constructors
* @since 4.0.0
*/
const succeed$7 = succeed$8;
/**
* Creates a `Result` holding a `Failure` value.
*
* **When to use**
*
* Use to represent a failed `Result` with a typed failure value.
*
* **Details**
*
* - The success type `A` defaults to `never`
*
* **Example** (Creating a failure)
*
* ```ts import.meta.vitest
* import { Result } from "effect"
*
* Result.fail("Something went wrong") // => Result.fail("Something went wrong")
* ```
*
* @see {@link succeed} to create a Success
* @see {@link mapError} to transform the error
*
* @category constructors
* @since 4.0.0
*/
const fail$6 = fail$7;
const try_$2 = (evaluate) => {
	if (isFunction(evaluate)) try {
		return succeed$7(evaluate());
	} catch (e) {
		return fail$6(e);
	}
	else try {
		return succeed$7(evaluate.try());
	} catch (e) {
		return fail$6(evaluate.catch(e));
	}
};
/**
* Checks whether a `Result` is a `Failure`.
*
* **When to use**
*
* Use to narrow a known `Result` to the `Failure` variant.
*
* **Details**
*
* - Acts as a TypeScript type guard, narrowing to `Failure<A, E>`
* - After narrowing, you can access `.failure` to read the error value
*
* **Example** (Narrowing to failure)
*
* ```ts import.meta.vitest
* import { Result } from "effect"
*
* const result = Result.fail("oops")
*
* if (Result.isFailure(result)) {
*   result.failure // => "oops"
* }
* ```
*
* @see {@link isSuccess} for the opposite check
* @see {@link isResult} to check if a value is any Result
*
* @category guards
* @since 4.0.0
*/
const isFailure = isFailure$1;
/**
* Checks whether a `Result` is a `Success`.
*
* **When to use**
*
* Use to narrow a known `Result` to the `Success` variant.
*
* **Details**
*
* - Acts as a TypeScript type guard, narrowing to `Success<A, E>`
* - After narrowing, you can access `.success` to read the value
*
* **Example** (Narrowing to success)
*
* ```ts import.meta.vitest
* import { Result } from "effect"
*
* const result = Result.succeed(42)
*
* if (Result.isSuccess(result)) {
*   result.success // => 42
* }
* ```
*
* @see {@link isFailure} for the opposite check
* @see {@link isResult} to check if a value is any Result
*
* @category guards
* @since 4.0.0
*/
const isSuccess$1 = isSuccess$2;
/**
* Folds a `Result` into a single value by applying one of two functions.
*
* **When to use**
*
* Use when a `Result`'s success and failure branches should be collapsed into
* one plain output type.
*
* **Details**
*
* - Applies `onSuccess` if the result is a `Success`
* - Applies `onFailure` if the result is a `Failure`
* - Both branches must return the same type (or a common supertype)
*
* **Example** (Folding to a string)
*
* ```ts import.meta.vitest
* import { pipe, Result } from "effect"
*
* const format = Result.match({
*   onSuccess: (n: number) => `Got ${n}`,
*   onFailure: (e: string) => `Err: ${e}`
* })
*
* format(Result.succeed(42)) // => "Got 42"
*
* format(Result.fail("timeout")) // => "Err: timeout"
* ```
*
* @see {@link merge} to extract `A | E` without mapping
* @see {@link getOrElse} to unwrap only the success with a fallback
*
* @category pattern matching
* @since 2.0.0
*/
const match$3 = /*#__PURE__*/ dual(2, (self, { onFailure, onSuccess }) => isFailure(self) ? onFailure(self.failure) : onSuccess(self.success));
/**
* Collects a structure of `Result`s into a single `Result` of collected values.
*
* **When to use**
*
* Use to collect independent `Result` values into one `Result` while preserving
* the original structure.
*
* **Details**
*
* Accepts:
* - A tuple/array: returns `Result` with a tuple/array of success values
* - A struct (record): returns `Result` with a struct of success values
* - An iterable: returns `Result` with an array of success values
*
* Short-circuits on the first `Failure` encountered; later elements are not inspected.
*
* **Example** (Collecting a tuple and a struct)
*
* ```ts import.meta.vitest
* import { Result } from "effect"
*
* // Tuple
* Result.all([Result.succeed(1), Result.succeed("two")]) // => Result.succeed([1, "two"])
*
* // Struct
* Result.all({ x: Result.succeed(1), y: Result.fail("err") }) // => Result.fail("err")
* ```
*
* @see {@link flatMap} for chaining two Results sequentially
* @see {@link gen} for generator-based composition of multiple Results
*
* @category sequencing
* @since 2.0.0
*/
const all$3 = (input) => {
	if (Symbol.iterator in input) {
		const out = [];
		for (const e of input) {
			if (isFailure(e)) return e;
			out.push(e.success);
		}
		return succeed$7(out);
	}
	const out = {};
	for (const key of Object.keys(input)) {
		const e = input[key];
		if (isFailure(e)) return e;
		assignProperty(out, key, e.success);
	}
	return succeed$7(out);
};
//#endregion
//#region node_modules/effect/dist/Tuple.js
/**
* Creates an `Equivalence` for tuples by comparing corresponding elements
* using the provided per-position `Equivalence`s. Two tuples are equivalent
* when all their corresponding elements are equivalent.
*
* **When to use**
*
* Use when you need an `Equivalence` to compare tuples element-by-element.
*
* **Details**
*
* This is an alias of `Equivalence.Tuple`.
*
* **Example** (Comparing tuples for equivalence)
*
* ```ts import.meta.vitest
* import { Equivalence, Tuple } from "effect"
*
* const eq = Tuple.makeEquivalence([
*   Equivalence.strictEqual<string>(),
*   Equivalence.strictEqual<number>()
* ])
*
* eq(["Alice", 30], ["Alice", 30]) // => true
* eq(["Alice", 30], ["Bob", 30]) // => false
* ```
*
* @see {@link makeOrder} – create an `Order` for tuples
* @category instances
* @since 4.0.0
*/
const makeEquivalence$2 = Tuple$1;
//#endregion
//#region node_modules/effect/dist/Record.js
/**
* Determines if a mutable record is empty.
*
* **Example** (Checking for an empty record)
*
* ```ts import.meta.vitest
* import { Record } from "effect"
*
* Record.isEmptyRecord({}) // => true
* Record.isEmptyRecord({ a: 3 }) // => false
* ```
*
* @category guards
* @since 2.0.0
*/
const isEmptyRecord = (self) => Object.keys(self).length === 0;
/**
* Checks whether a given `key` exists in a record.
*
* **Example** (Checking key membership)
*
* ```ts import.meta.vitest
* import { Record } from "effect"
*
* Record.has({ a: 1, b: 2 }, "a") // => true
* Record.has(Record.empty<string>(), "c") // => false
* ```
*
* @category predicates
* @since 2.0.0
*/
const has = /*#__PURE__*/ dual(2, (self, key) => Object.hasOwn(self, key));
/**
* Maps a record into another record by applying a transformation function to each of its values.
*
* **Example** (Mapping record values)
*
* ```ts import.meta.vitest
* import { Record } from "effect"
*
* const f = (n: number) => `-${n}`
*
* Record.map({ a: 3, b: 5 }, f) // => { a: "-3", b: "-5" }
*
* const g = (n: number, key: string) => `${key.toUpperCase()}-${n}`
*
* Record.map({ a: 3, b: 5 }, g) // => { a: "A-3", b: "B-5" }
* ```
*
* @category mapping
* @since 2.0.0
*/
const map$6 = /*#__PURE__*/ dual(2, (self, f) => {
	const out = { ...self };
	for (const key of keys(self)) assignProperty(out, key, f(self[key], key));
	return out;
});
/**
* Retrieves the keys of a given record as an array.
*
* **Example** (Getting record keys)
*
* ```ts import.meta.vitest
* import { Record } from "effect"
*
* Record.keys({ a: 1, b: 2, c: 3 }) // => ["a", "b", "c"]
* ```
*
* @category getters
* @since 2.0.0
*/
const keys = (self) => Object.keys(self);
/**
* Checks whether all the keys and values in one record are also found in another record.
* Uses the provided equivalence function to compare values.
*
* **Example** (Checking subrecords with a custom equivalence)
*
* ```ts import.meta.vitest
* import { Equivalence, Record } from "effect"
*
* const isSubrecord = Record.isSubrecordBy(
*   Equivalence.make<string>((self, that) => self.toLowerCase() === that.toLowerCase())
* )
*
* const required: Record.ReadonlyRecord<string, string> = { role: "Admin" }
* const available: Record.ReadonlyRecord<string, string> = {
*   role: "admin",
*   status: "active"
* }
*
* isSubrecord(required, available) // => true
* isSubrecord({ role: "Admin", status: "inactive" }, available) // => false
* isSubrecord(required, { role: "editor", status: "active" }) // => false
* ```
*
* @category predicates
* @since 2.0.0
*/
const isSubrecordBy = (equivalence) => dual(2, (self, that) => {
	for (const key of keys(self)) if (!has(that, key) || !equivalence(self[key], that[key])) return false;
	return true;
});
/**
* Create an `Equivalence` for records using the provided `Equivalence` for values.
* Two records are considered equivalent if they have the same keys and their corresponding values are equivalent.
*
* **Example** (Comparing records with a value equivalence)
*
* ```ts import.meta.vitest
* import { Equal, Record } from "effect"
*
* const recordEquivalence = Record.makeEquivalence(Equal.asEquivalence<number>())
*
* recordEquivalence({ a: 1, b: 2 }, { a: 1, b: 2 }) // => true
* recordEquivalence({ a: 1, b: 2 }, { a: 1, b: 3 }) // => false
* ```
*
* @category instances
* @since 4.0.0
*/
const makeEquivalence$1 = (equivalence) => {
	const is = isSubrecordBy(equivalence);
	return (self, that) => is(self, that) && is(that, self);
};
//#endregion
//#region node_modules/effect/dist/Array.js
/**
* Exposes the global array constructor.
*
* **When to use**
*
* Use to access native JavaScript array constructor methods such as `isArray`
* or `from` from the Effect module namespace.
*
* **Example** (Accessing the Array constructor)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.Array === globalThis.Array // => true
* ```
*
* @category constructors
* @since 4.0.0
*/
const Array$1 = globalThis.Array;
/**
* Converts an `Iterable` to an `Array`.
*
* **When to use**
*
* Use to convert any `Iterable` (Set, Generator, etc.) into an array.
*
* **Details**
*
* If the input is already an array, this returns it by reference without
* copying. Otherwise, it creates a new array from the iterable. Use `copy` if
* you need a fresh array even when the input is already an array.
*
* **Example** (Converting a Set to an array)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.fromIterable(new Set([1, 2, 3])) // => [1, 2, 3]
* ```
*
* @see {@link ensure} — wrap a single value or return an existing array
* @see {@link copy} — create a shallow copy of an array
*
* @category constructors
* @since 2.0.0
*/
const fromIterable$1 = (collection) => Array$1.isArray(collection) ? collection : Array$1.from(collection);
/**
* Adds a single element to the end of an iterable, returning a `NonEmptyArray`.
*
* **When to use**
*
* Use when you need to guarantee a non-empty result after adding a required
* trailing value.
*
* **Example** (Appending an element)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.append([1, 2, 3], 4) // => [1, 2, 3, 4]
* ```
*
* @see {@link prepend} — add to the front
* @see {@link appendAll} — append multiple elements
*
* @category combining
* @since 2.0.0
*/
const append$1 = /*#__PURE__*/ dual(2, (self, last) => [...self, last]);
Array$1.isArray;
/**
* Checks whether a mutable `Array` is non-empty, narrowing the type to
* `NonEmptyArray`.
*
* **When to use**
*
* Use when you need the narrowed value to remain a mutable `Array` after proving
* it has at least one element.
*
* **Example** (Checking for a non-empty array)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.isArrayNonEmpty([]) // => false
* Array.isArrayNonEmpty([1, 2, 3]) // => true
* ```
*
* @see {@link isReadonlyArrayNonEmpty} — readonly variant
* @see {@link isArrayEmpty} — opposite check
*
* @category guards
* @since 4.0.0
*/
const isArrayNonEmpty = isArrayNonEmpty$1;
/**
* Checks whether a `ReadonlyArray` is non-empty, narrowing the type to
* `NonEmptyReadonlyArray`.
*
* **When to use**
*
* Use when you need to prove a readonly array has at least one element without
* requiring mutable array methods afterward.
*
* **Example** (Checking for a non-empty readonly array)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.isReadonlyArrayNonEmpty([]) // => false
* Array.isReadonlyArrayNonEmpty([1, 2, 3]) // => true
* ```
*
* @see {@link isArrayNonEmpty} — mutable variant
* @see {@link isReadonlyArrayEmpty} — opposite check
*
* @category guards
* @since 4.0.0
*/
const isReadonlyArrayNonEmpty = isArrayNonEmpty$1;
/**
* Checks whether a string represents a JavaScript array index: a non-negative
* integer below `2 ** 32 - 1`, written without leading zeroes, a sign, or
* exponent notation.
*
* @internal
*/
function isCanonicalArrayIndex(key) {
	const index = Number(key);
	return String(index) === key && Number.isInteger(index) && index >= 0 && index < 2 ** 32 - 1;
}
/**
* Creates an empty array.
*
* **When to use**
*
* Use to create a typed empty array without allocating placeholder elements.
*
* **Example** (Creating an empty array)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.empty<number>() // => []
* ```
*
* @see {@link of} — create a single-element array
* @see {@link make} — create from multiple values
*
* @category constructors
* @since 2.0.0
*/
const empty$8 = () => [];
/**
* Wraps a single value in a `NonEmptyArray`.
*
* **Example** (Creating a single-element array)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.of(1) // => [1]
* ```
*
* @see {@link make} — create from multiple values
* @see {@link empty} — create an empty array
*
* @category constructors
* @since 2.0.0
*/
const of = (a) => [a];
/**
* Transforms each element using a function, returning a new array.
*
* **When to use**
*
* Use to transform each element independently while preserving the array shape.
*
* **Details**
*
* The function receives `(element, index)`. The return type preserves
* `NonEmptyArray`.
*
* **Example** (Doubling values)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* Array.map([1, 2, 3], (x) => x * 2) // => [2, 4, 6]
* ```
*
* @see {@link flatMap} — map and flatten
*
* @category mapping
* @since 2.0.0
*/
const map$5 = /*#__PURE__*/ dual(2, (self, f) => self.map(f));
/**
* Creates an `Equivalence` for arrays based on an element `Equivalence`. Two
* arrays are equivalent when they have the same length and all elements are
* pairwise equivalent.
*
* **Example** (Comparing arrays for equality)
*
* ```ts import.meta.vitest
* import { Array } from "effect"
*
* const eq = Array.makeEquivalence<number>((a, b) => a === b)
*
* eq([1, 2, 3], [1, 2, 3]) // => true
* ```
*
* @see {@link makeOrder} — create an ordering for arrays
*
* @category instances
* @since 4.0.0
*/
const makeEquivalence = Array_;
//#endregion
//#region node_modules/effect/dist/BigDecimal.js
/**
* Decimal numbers and arithmetic for cases where JavaScript `number` rounding
* is not precise enough. A `BigDecimal` stores digits as a `bigint` plus a
* decimal scale, which lets the module parse, compare, add, subtract, multiply,
* divide, round, and format decimal values such as money, quantities, and
* measurements.
*
* @since 2.0.0
*/
const TypeId$31 = "~effect/BigDecimal";
const BigDecimalProto = {
	[TypeId$31]: TypeId$31,
	[symbol$1]() {
		const normalized = normalize(this);
		return combine(string$1(String(normalized.value)), number$1(normalized.scale));
	},
	[symbol](that) {
		return isBigDecimal(that) && compare(this, that) === 0;
	},
	toString() {
		return `BigDecimal(${format$1(this)})`;
	},
	toJSON() {
		return {
			_id: "BigDecimal",
			value: String(this.value),
			scale: this.scale
		};
	},
	[NodeInspectSymbol]() {
		return this.toJSON();
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
/**
* Checks whether a given value is a `BigDecimal`.
*
* **When to use**
*
* Use to validate unknown input and narrow it to `BigDecimal`.
*
* **Example** (Checking BigDecimal values)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* const decimal = BigDecimal.fromNumber(123.45)
* BigDecimal.isBigDecimal(decimal) // => false
* BigDecimal.isBigDecimal(BigDecimal.fromStringUnsafe("123.45")) // => true
* BigDecimal.isBigDecimal(123.45) // => false
* BigDecimal.isBigDecimal("123.45") // => false
* ```
*
* @category guards
* @since 2.0.0
*/
const isBigDecimal = (u) => hasProperty(u, TypeId$31);
/**
* Creates a `BigDecimal` from a `bigint` value and a safe integer scale.
*
* **When to use**
*
* Use to construct a decimal directly from its unscaled integer value and
* decimal scale.
*
* **Gotchas**
*
* Throws a `RangeError` if `scale` is not a safe integer.
*
* **Example** (Creating decimals from bigint and scale)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* // Create 123.45 (12345 with scale 2)
* const decimal = BigDecimal.make(12345n, 2)
* decimal // => BigDecimal.fromStringUnsafe("123.45")
*
* // Create 42 (42 with scale 0)
* const integer = BigDecimal.make(42n, 0)
* integer // => BigDecimal.fromBigInt(42n)
* ```
*
* @see {@link fromBigInt} for constructing an integer decimal from a `bigint`
*
* @category constructors
* @since 2.0.0
*/
const make$25 = (value, scale) => {
	if (!Number.isSafeInteger(scale)) throw new RangeError(`Scale must be a safe integer, got ${scale}`);
	const o = Object.create(BigDecimalProto);
	o.value = value;
	o.scale = scale;
	return o;
};
const makeNormalized = (value, scale) => {
	const o = make$25(value, scale);
	o.normalized = o;
	return o;
};
const bigint0$2 = /*#__PURE__*/ BigInt(0);
const bigint1$1 = /*#__PURE__*/ BigInt(1);
const bigint10$1 = /*#__PURE__*/ BigInt(10);
const zero$1 = /*#__PURE__*/ makeNormalized(bigint0$2, 0);
/**
* Normalizes a given `BigDecimal` by removing trailing zeros.
*
* **When to use**
*
* Use to canonicalize decimals that have equivalent values but different
* internal scales.
*
* **Example** (Normalizing trailing zeros)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* const decimal = BigDecimal.normalize(BigDecimal.fromStringUnsafe("123.00000"))
* const decimalStorage = [decimal.value, decimal.scale] // => [123n, 0]
*
* const largeDecimal = BigDecimal.normalize(BigDecimal.fromStringUnsafe("12300000"))
* const largeDecimalStorage = [largeDecimal.value, largeDecimal.scale] // => [123n, -5]
* ```
*
* @see {@link format} for rendering normalized decimals as strings
*
* @category scaling
* @since 2.0.0
*/
const normalize = (self) => {
	if (self.normalized === void 0) {
		if (self.value === bigint0$2) self.normalized = zero$1;
		else {
			const digits = `${self.value}`;
			let end = digits.length;
			while (digits[end - 1] === "0") end--;
			self.normalized = makeNormalized(BigInt(digits.slice(0, end)), self.scale - (digits.length - end));
		}
	}
	return self.normalized;
};
const MAX_COMPARISON_SCALE_ALIGNMENT = 100;
const comparisonPowersOfTen = [bigint1$1];
const compareBigInt = (self, that) => self === that ? 0 : self < that ? -1 : 1;
const compareMagnitude = (self, that) => {
	const selfDigits = `${self.value < bigint0$2 ? -self.value : self.value}`;
	const thatDigits = `${that.value < bigint0$2 ? -that.value : that.value}`;
	const exponentDifference = BigInt(selfDigits.length - thatDigits.length) - BigInt(self.scale) + BigInt(that.scale);
	if (exponentDifference !== bigint0$2) return exponentDifference < bigint0$2 ? -1 : 1;
	const length = Math.max(selfDigits.length, thatDigits.length);
	return String$5(selfDigits.padEnd(length, "0"), thatDigits.padEnd(length, "0"));
};
const compare = (self, that) => {
	if (self.scale === that.scale) return compareBigInt(self.value, that.value);
	const selfSign = sign(self);
	const thatSign = sign(that);
	if (selfSign !== thatSign) return selfSign < thatSign ? -1 : 1;
	if (selfSign === 0) return 0;
	const scaleDifference = self.scale - that.scale;
	const absoluteScaleDifference = Math.abs(scaleDifference);
	if (absoluteScaleDifference > MAX_COMPARISON_SCALE_ALIGNMENT) return selfSign === -1 ? compareMagnitude(that, self) : compareMagnitude(self, that);
	const powerOfTen = comparisonPowersOfTen[absoluteScaleDifference] ??= bigint10$1 ** BigInt(absoluteScaleDifference);
	return scaleDifference > 0 ? compareBigInt(self.value, that.value * powerOfTen) : compareBigInt(self.value * powerOfTen, that.value);
};
/**
* Determines the sign of a given `BigDecimal`.
*
* **When to use**
*
* Use to classify a `BigDecimal` as negative, zero, or positive.
*
* **Example** (Reading decimal signs)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* BigDecimal.sign(BigDecimal.fromStringUnsafe("-5")) // => -1
* BigDecimal.sign(BigDecimal.fromStringUnsafe("0")) // => 0
* BigDecimal.sign(BigDecimal.fromStringUnsafe("5")) // => 1
* ```
*
* @category math
* @since 2.0.0
*/
const sign = (n) => n.value === bigint0$2 ? 0 : n.value < bigint0$2 ? -1 : 1;
/**
* Formats a `BigDecimal` as a string.
*
* **When to use**
*
* Use to render a `BigDecimal` as plain decimal text when possible.
*
* **Details**
*
* The value is normalized before formatting. Scientific notation is used when
* the absolute value of the normalized scale is at least `16`; otherwise plain
* decimal notation is used.
*
* **Example** (Formatting decimals)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* BigDecimal.format(BigDecimal.fromStringUnsafe("-5")) // => "-5"
* BigDecimal.format(BigDecimal.fromStringUnsafe("123.456")) // => "123.456"
* BigDecimal.format(BigDecimal.fromStringUnsafe("-0.00000123")) // => "-0.00000123"
* ```
*
* @see {@link toExponential} for always rendering scientific notation
*
* @category converting
* @since 2.0.0
*/
const format$1 = (n) => {
	const normalized = normalize(n);
	if (Math.abs(normalized.scale) >= 16) return toExponential(normalized);
	const negative = normalized.value < bigint0$2;
	const absolute = `${negative ? -normalized.value : normalized.value}`;
	const digits = normalized.scale > 0 ? absolute.padStart(normalized.scale + 1, "0") : absolute.padEnd(absolute.length - normalized.scale, "0");
	const point = digits.length - normalized.scale;
	const complete = normalized.scale > 0 ? `${digits.slice(0, point)}.${digits.slice(point)}` : digits;
	return negative ? `-${complete}` : complete;
};
/**
* Formats a given `BigDecimal` as a `string` in scientific notation.
*
* **When to use**
*
* Use to render a `BigDecimal` in scientific notation.
*
* **Example** (Formatting decimals exponentially)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* BigDecimal.toExponential(BigDecimal.make(123456n, -5)) // => "1.23456e+10"
* ```
*
* @see {@link format} for plain decimal formatting when possible
*
* @category converting
* @since 3.11.0
*/
const toExponential = (n) => {
	if (isZero$1(n)) return "0e+0";
	const normalized = normalize(n);
	const digits = `${normalized.value}`;
	const point = normalized.value < bigint0$2 ? 2 : 1;
	const head = digits.slice(0, point);
	const tail = digits.slice(point);
	const exp = tail.length - normalized.scale;
	return `${head}${tail === "" ? "" : `.${tail}`}e${exp >= 0 ? "+" : ""}${exp}`;
};
/**
* Checks whether a given `BigDecimal` is `0`.
*
* **When to use**
*
* Use to test whether a `BigDecimal` is exactly zero.
*
* **Example** (Checking zero decimals)
*
* ```ts import.meta.vitest
* import { BigDecimal } from "effect"
*
* BigDecimal.isZero(BigDecimal.fromStringUnsafe("0")) // => true
* BigDecimal.isZero(BigDecimal.fromStringUnsafe("1")) // => false
* ```
*
* @category predicates
* @since 2.0.0
*/
const isZero$1 = (n) => n.value === bigint0$2;
//#endregion
//#region node_modules/effect/dist/Effectable.js
/**
* Create a low-level `Effect` prototype.
*
* **When to use**
*
* Use when you need to create a custom Effect-like value without extending a
* class, by providing a label and an evaluate function that receives the
* current fiber.
*
* **Details**
*
* When the effect is evaluated, it calls `evaluate` with the current fiber.
*
* @see {@link Class} for a class-based approach to defining custom Effect values
* @see {@link Mixin} for wrapping an existing class constructor
*
* @category prototypes
* @since 4.0.0
*/
const Prototype = (options) => makePrimitiveProto({
	op: options.label,
	[evaluate]: options.evaluate
});
//#endregion
//#region node_modules/effect/dist/Context.js
/**
* Runtime type identifier attached to `Context` service keys and used by
* `isKey` to recognize them.
*
* @category type IDs
* @since 4.0.0
*/
const ServiceTypeId = "~effect/Context/Service";
/**
* Creates a `Context` service key.
*
* **When to use**
*
* Use when you need to define a context service key for a dependency that must
* be provided by the surrounding context.
*
* **Details**
*
* Call `Context.Service("Key")` for a function-style key, or use the two-stage
* form `Context.Service<Self, Shape>()("Key")` for class-style service
* declarations. The returned key can be yielded as an Effect and passed to
* `Context.make`, `Context.add`, and the Context getter functions.
*
* **Gotchas**
*
* The string key is the runtime identity of the service. Reusing the same key
* string for unrelated services makes them occupy the same slot in a
* `Context`.
*
* **Example** (Creating service keys)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* // Create a simple service
* const Database = Context.Service<{
*   query: (sql: string) => string
* }>("Database")
*
* // Create a service class
* class Config extends Context.Service<Config, {
*   port: number
* }>()("Config") {}
*
* // Use the services to create contexts
* const db = Context.make(Database, {
*   query: (sql) => `Result: ${sql}`
* })
* const config = Context.make(Config, { port: 8080 })
* Context.get(db, Database).query("SELECT 1") // => "Result: SELECT 1"
* Context.get(config, Config).port // => 8080
* ```
*
* @see {@link Reference} for service keys with default values
*
* @category services
* @since 4.0.0
*/
const Service = function() {
	function KeyClass() {}
	const self = KeyClass;
	Object.setPrototypeOf(self, ServiceProto);
	const init = (key, options) => {
		self.key = key;
		if (options?.defaultValue) {
			self[ReferenceTypeId] = ReferenceTypeId;
			self.defaultValue = options.defaultValue;
		}
		if (options?.make) self.make = options.make;
		if (options?.fiberCached) cacheKeys.add(key);
		return self;
	};
	return arguments.length > 0 ? init(arguments[0], arguments[1]) : init;
};
const ServiceProto = {
	[ServiceTypeId]: ServiceTypeId,
	.../*#__PURE__*/ Prototype({
		label: "Service",
		evaluate(fiber) {
			return exitSucceed(get(fiber.context, this));
		}
	}),
	toJSON() {
		return {
			_id: "Service",
			key: this.key
		};
	},
	of(self) {
		return self;
	},
	context(self) {
		return make$24(this, self);
	},
	use(f) {
		return withFiber$1((fiber) => f(get(fiber.context, this)));
	},
	useSync(f) {
		return withFiber$1((fiber) => exitSucceed(f(get(fiber.context, this))));
	}
};
const cacheKeys = /*#__PURE__*/ new Set();
const ReferenceTypeId = "~effect/Context/Reference";
const TypeId$30 = "~effect/Context";
const MaxDepth = 8;
const FlattenAfterBaseHits = 8;
const makeImpl = (cacheRoot, base, overlay, depth) => {
	const self = Object.create(Proto$13);
	self.cacheRoot = cacheRoot ?? self;
	self.base = base;
	self.overlay = overlay;
	self.depth = depth;
	self._flat = void 0;
	self.baseHits = 0;
	return self;
};
const applyOverlays = (map, overlay) => {
	if (!overlay) return;
	applyOverlays(map, overlay.parent);
	map.set(overlay.key, overlay.value);
};
const flatten$2 = (self) => {
	if (self._flat) return self._flat;
	if (!self.overlay) return self._flat = self.base;
	const map = new Map(self.base);
	applyOverlays(map, self.overlay);
	return self._flat = map;
};
const withFlat = (self, f) => {
	const map = new Map(self.mapUnsafe);
	f(map);
	return makeUnsafe$6(map);
};
const notFound = /*#__PURE__*/ Symbol();
const lookup = (self, key) => {
	const impl = self;
	for (let overlay = impl.overlay; overlay; overlay = overlay.parent) if (overlay.key === key) return overlay.value;
	const value = impl.base.get(key);
	if (value === void 0 && !impl.base.has(key)) return notFound;
	if (impl.overlay && ++impl.baseHits >= impl.base.size && impl.baseHits >= FlattenAfterBaseHits) {
		impl.base = flatten$2(impl);
		impl.overlay = void 0;
		impl.depth = 0;
	}
	return value;
};
/**
* Creates a `Context` from an existing service map.
*
* **When to use**
*
* Use when constructing a low-level `Context` from a trusted map whose lifecycle
* you control.
*
* **Gotchas**
*
* The provided map is retained without copying and must not be mutated after
* construction. Prefer `empty`, `make`, `add`, or `merge` for normal Context
* construction.
*
* **Example** (Creating a context from a map)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* // Create a context from a Map (unsafe)
* const map = new Map([
*   ["Logger", { log: (_msg: string) => {} }]
* ])
*
* const context = Context.makeUnsafe(map)
* context.mapUnsafe.size // => 1
* ```
*
* @category constructors
* @since 4.0.0
*/
const makeUnsafe$6 = (mapUnsafe) => makeImpl(void 0, mapUnsafe, void 0, 0);
const Proto$13 = {
	get mapUnsafe() {
		return flatten$2(this);
	},
	...PipeInspectableProto,
	[TypeId$30]: { _Services: (_) => _ },
	toJSON() {
		return {
			_id: "Context",
			services: Array.from(this.mapUnsafe).map(([key, value]) => ({
				key,
				value
			}))
		};
	},
	[symbol](that) {
		if (!isContext(that)) return false;
		const self = this.mapUnsafe;
		const other = that.mapUnsafe;
		if (self.size !== other.size) return false;
		for (const [key, value] of self) if (!other.has(key) || !equals$1(value, other.get(key))) return false;
		return true;
	},
	[symbol$1]() {
		return number$1(this.mapUnsafe.size);
	}
};
/** @internal */
const hasSameCache = (self, that) => self.cacheRoot === that.cacheRoot;
/**
* Checks whether the provided argument is a `Context`.
*
* **When to use**
*
* Use to narrow an unknown value before passing it to APIs that require a
* `Context`.
*
* **Details**
*
* This checks the runtime `Context` marker and does not inspect which services
* the context contains.
*
* **Gotchas**
*
* This guard only proves that the value is a `Context`; it does not prove that
* any specific service is present.
*
* **Example** (Checking for contexts)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
* Context.isContext(Context.empty()) // => true
* ```
*
* @see {@link isKey} for checking service keys
* @see {@link isReference} for checking references with defaults
*
* @category guards
* @since 2.0.0
*/
const isContext = (u) => hasProperty(u, TypeId$30);
/**
* Checks whether the provided argument is a `Reference`.
*
* **Example** (Checking for references)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* const LoggerRef = Context.Reference("Logger", {
*   defaultValue: () => ({ log: (_msg: string) => {} })
* })
*
* Context.isReference(LoggerRef) // => true
* Context.isReference(Context.Service("Key")) // => false
* ```
*
* @category guards
* @since 3.11.0
*/
const isReference = (u) => !!u[ReferenceTypeId];
/**
* Returns an empty `Context`.
*
* **Example** (Creating an empty context)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
* Context.empty().mapUnsafe.size // => 0
* ```
*
* @category constructors
* @since 2.0.0
*/
const empty$7 = () => emptyContext;
const emptyContext = /*#__PURE__*/ makeUnsafe$6(/*#__PURE__*/ new Map());
/**
* Creates a new `Context` with a single service associated to the key.
*
* **Example** (Creating a context with one service)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* const Port = Context.Service<{ PORT: number }>("Port")
*
* const context = Context.make(Port, { PORT: 8080 })
*
* Context.get(context, Port).PORT // => 8080
* ```
*
* @category constructors
* @since 2.0.0
*/
const make$24 = (key, service) => makeUnsafe$6(/* @__PURE__ */ new Map([[key.key, service]]));
/**
* Adds a service to a given `Context`.
*
* **When to use**
*
* Use when you need to store a known service value in a `Context`.
*
* **Details**
*
* If the context already contains the same service key, the new service
* replaces the previous one.
*
* **Example** (Adding a service to a context)
*
* ```ts import.meta.vitest
* import { Context, pipe } from "effect"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const someContext = Context.make(Port, { PORT: 8080 })
*
* const context = pipe(
*   someContext,
*   Context.add(Timeout, { TIMEOUT: 5000 })
* )
*
* const values = [Context.get(context, Port).PORT, Context.get(context, Timeout).TIMEOUT]
* values // => [8080, 5000]
* ```
*
* @see {@link addOrOmit} for adding or removing a service from an `Option`
*
* @category combining
* @since 2.0.0
*/
const add = /*#__PURE__*/ dual(3, (self, key, service) => addUnsafe(self, key.key, service));
/**
* Adds a service by key to a given `Context` using a string key.
*
* @category combining
* @since 4.0.0
*/
const addUnsafe = (self, key, service) => {
	const impl = self;
	const cacheRoot = cacheKeys.has(key) ? void 0 : impl.cacheRoot;
	if (impl.depth >= MaxDepth) {
		const map = new Map(impl.mapUnsafe);
		map.set(key, service);
		return makeImpl(cacheRoot, map, void 0, 0);
	}
	return makeImpl(cacheRoot, impl.base, {
		key,
		value: service,
		parent: impl.overlay
	}, impl.depth + 1);
};
/**
* Returns the service currently stored for a key, or `undefined` when the key
* is absent.
*
* **When to use**
*
* Use when you need to read the service stored for a key without resolving
* `Context.Reference` defaults.
*
* **Gotchas**
*
* This is a raw lookup and does not resolve default values for
* `Context.Reference` keys.
*
* @see {@link getOption} for a reference-aware optional lookup
*
* @category getters
* @since 4.0.0
*/
const getOrUndefined = /*#__PURE__*/ dual(2, (self, key) => getOrUndefinedUnsafe(self, key.key));
/** @internal */
const getOrUndefinedUnsafe = (self, key) => {
	const value = lookup(self, key);
	return value === notFound ? void 0 : value;
};
/**
* Gets the service for a key, throwing if an absent non-reference key cannot be
* resolved.
*
* **When to use**
*
* Use when you need to read a service from a context whose type does not prove
* the service is present.
*
* **Details**
*
* If the key is a `Context.Reference` and no override is stored in the
* context, its cached default value is returned. For absent non-reference keys,
* this function throws a runtime error.
*
* **Example** (Getting services unsafely)
*
* ```ts import.meta.vitest
* import { Context, Option } from "effect"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const context = Context.make(Port, { PORT: 8080 })
*
* Context.getUnsafe(context, Port).PORT // => 8080
* Context.getOption(context, Timeout) // => Option.none()
* ```
*
* @see {@link get} for type-checked service access
* @see {@link getOption} for optional service access
*
* @category unsafe
* @since 4.0.0
*/
const getUnsafe = /*#__PURE__*/ dual(2, (self, service) => {
	const value = lookup(self, service.key);
	if (value === notFound) {
		if (isReference(service)) return getDefaultValue(service);
		throw serviceNotFoundError(service);
	}
	return value;
});
/**
* Gets a service from the context that corresponds to the given key.
*
* **When to use**
*
* Use when you need type-checked access to a service already included in the
* context type.
*
* **Example** (Getting a service from a context)
*
* ```ts import.meta.vitest
* import { Context, pipe } from "effect"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const context = pipe(
*   Context.make(Port, { PORT: 8080 }),
*   Context.add(Timeout, { TIMEOUT: 5000 })
* )
*
* Context.get(context, Timeout).TIMEOUT // => 5000
* ```
*
* @see {@link getOption} for optional service access
* @see {@link getOrElse} for fallback values
*
* @category getters
* @since 2.0.0
*/
const get = getUnsafe;
const defaultValueCacheKey = "~effect/Context/defaultValue";
const getDefaultValue = (ref) => {
	if (defaultValueCacheKey in ref) return ref[defaultValueCacheKey];
	return ref[defaultValueCacheKey] = ref.defaultValue();
};
const serviceNotFoundError = (service) => {
	const error = /* @__PURE__ */ new Error(`Service not found${service.key ? `: ${String(service.key)}` : ""}`);
	if (error.stack) {
		const lines = error.stack.split("\n");
		lines.splice(1, 3);
		error.stack = lines.join("\n");
	}
	return error;
};
/**
* Gets the service for a key safely wrapped in an `Option`.
*
* **When to use**
*
* Use when you need to read a `Context` service as an `Option` so absence is
* represented as data.
*
* **Details**
*
* Returns `Option.some` when the service is stored in the context. If the key
* is a `Context.Reference` and no override is stored, returns `Option.some` of
* the cached default value. Missing non-reference keys return `Option.none`.
*
* **Example** (Getting optional services)
*
* ```ts import.meta.vitest
* import { Context, Option } from "effect"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const context = Context.make(Port, { PORT: 8080 })
*
* Context.getOption(context, Port) // => Option.some({ PORT: 8080 })
* Context.getOption(context, Timeout) // => Option.none()
* ```
*
* @see {@link getOrElse} for returning a fallback value directly
*
* @category getters
* @since 2.0.0
*/
const getOption = /*#__PURE__*/ dual(2, (self, service) => {
	const value = lookup(self, service.key);
	if (value !== notFound) return some(value);
	return isReference(service) ? some(getDefaultValue(service)) : none();
});
/**
* Merges two `Context`s into one.
*
* **When to use**
*
* Use when you need to combine two contexts.
*
* **Details**
*
* When both contexts contain the same service key, the service from `that`
* overrides the service from `self`.
*
* **Example** (Merging two contexts)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
*
* const firstContext = Context.make(Port, { PORT: 8080 })
* const secondContext = Context.make(Timeout, { TIMEOUT: 5000 })
*
* const context = Context.merge(firstContext, secondContext)
*
* const values = [Context.get(context, Port).PORT, Context.get(context, Timeout).TIMEOUT]
* values // => [8080, 5000]
* ```
*
* @see {@link mergeAll} for merging more than two contexts at once
*
* @category combining
* @since 2.0.0
*/
const merge$3 = /*#__PURE__*/ dual(2, (self, that) => {
	if (self.mapUnsafe.size === 0) return that;
	if (that.mapUnsafe.size === 0) return self;
	return withFlat(self, (map) => that.mapUnsafe.forEach((value, key) => map.set(key, value)));
});
/**
* Merges any number of `Context`s into one.
*
* **When to use**
*
* Use when you need to combine a variadic list of contexts.
*
* **Details**
*
* When multiple contexts contain the same service key, the service from the
* last context with that key is kept.
*
* **Example** (Merging multiple contexts)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* const Port = Context.Service<{ PORT: number }>("Port")
* const Timeout = Context.Service<{ TIMEOUT: number }>("Timeout")
* const Host = Context.Service<{ HOST: string }>("Host")
*
* const firstContext = Context.make(Port, { PORT: 8080 })
* const secondContext = Context.make(Timeout, { TIMEOUT: 5000 })
* const thirdContext = Context.make(Host, { HOST: "localhost" })
*
* const context = Context.mergeAll(
*   firstContext,
*   secondContext,
*   thirdContext
* )
*
* context.mapUnsafe.size // => 3
* ```
*
* @see {@link merge} for merging two contexts
*
* @category combining
* @since 3.12.0
*/
const mergeAll = (...ctxs) => {
	const map = /* @__PURE__ */ new Map();
	for (let i = 0; i < ctxs.length; i++) ctxs[i].mapUnsafe.forEach((value, key) => {
		map.set(key, value);
	});
	return makeUnsafe$6(map);
};
/**
* Creates a context key with a default value.
*
* **When to use**
*
* Use when you need to define a context key with a lazily computed default
* value.
*
* **Details**
*
* `Context.Reference` allows you to create a key that can hold a value. You
* can provide a default value for the service, which will automatically be used
* when the context is accessed, or override it with a custom implementation
* when needed. The default value is computed lazily and cached on the
* reference.
*
* **Example** (Creating references with default values)
*
* ```ts import.meta.vitest
* import { Context } from "effect"
*
* // Create a reference with a default value
* const messages: Array<string> = []
* const LoggerRef = Context.Reference("Logger", {
*   defaultValue: () => ({ log: (msg: string) => messages.push(`Default: ${msg}`) })
* })
*
* // The reference provides the default value when accessed from an empty context
* const context = Context.empty()
* const logger = Context.get(context, LoggerRef)
*
* // You can also override the default value
* const customContext = Context.make(LoggerRef, {
*   log: (msg: string) => messages.push(`Custom: ${msg}`)
* })
* const customLogger = Context.get(customContext, LoggerRef)
* logger.log("default")
* customLogger.log("message")
* messages // => ["Default: default", "Custom: message"]
* ```
*
* @see {@link Service} for required services without default values
*
* @category services
* @since 3.11.0
*/
const Reference = Service;
//#endregion
//#region node_modules/effect/dist/Duration.js
const TypeId$29 = "~effect/Duration";
const bigint0$1 = /*#__PURE__*/ BigInt(0);
const bigint1 = /*#__PURE__*/ BigInt(1);
const bigint2 = /*#__PURE__*/ BigInt(2);
const bigint10 = /*#__PURE__*/ BigInt(10);
const bigint24 = /*#__PURE__*/ BigInt(24);
const bigint60 = /*#__PURE__*/ BigInt(60);
const bigint1e3 = /*#__PURE__*/ BigInt(1e3);
const bigint1e6 = /*#__PURE__*/ BigInt(1e6);
const roundTiesAwayFromZero = (input) => BigInt(input < 0 ? Math.ceil(input - .5) : Math.floor(input + .5));
const roundMillisToNanos = (millis) => roundTiesAwayFromZero(millis * 1e6);
const parseNanos = (input, scale) => {
	const decimalIndex = input.indexOf(".");
	if (decimalIndex === -1) return BigInt(input) * scale;
	const isNegative = input[0] === "-";
	const fractional = input.slice(decimalIndex + 1);
	const fractionalScale = bigint10 ** BigInt(fractional.length);
	const scaled = (BigInt(input.slice(isNegative ? 1 : 0, decimalIndex)) * fractionalScale + BigInt(fractional)) * scale;
	const rounded = scaled / fractionalScale + (scaled % fractionalScale * bigint2 >= fractionalScale ? bigint1 : bigint0$1);
	return isNegative ? -rounded : rounded;
};
const DURATION_REGEXP = /^(-?\d+(?:\.\d+)?)\s+(nanos?|micros?|millis?|seconds?|minutes?|hours?|days?|weeks?)$/;
/**
* Decodes a `Duration.Input` into a `Duration`.
*
* **When to use**
*
* Use when the input has already been validated or comes from a trusted source
* and throwing is acceptable for invalid duration syntax.
*
* **Gotchas**
*
* If the input is not a valid `Duration.Input`, it throws an error.
*
* **Example** (Decoding duration inputs)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.fromInputUnsafe(1000) // => Duration.millis(1000)
* Duration.fromInputUnsafe("5 seconds") // => Duration.seconds(5)
* Duration.fromInputUnsafe("Infinity") // => Duration.infinity
* Duration.fromInputUnsafe([2, 500_000_000]) // => Duration.nanos(2_500_000_000n)
* ```
*
* @category constructors
* @since 4.0.0
*/
const fromInputUnsafe = (input) => {
	switch (typeof input) {
		case "number": return millis(input);
		case "bigint": return nanos(input);
		case "string": {
			if (input === "Infinity") return infinity;
			if (input === "-Infinity") return negativeInfinity;
			const match = DURATION_REGEXP.exec(input);
			if (!match) break;
			const [_, valueStr, unit] = match;
			if (unit === "nano" || unit === "nanos") return nanos(parseNanos(valueStr, bigint1));
			if (unit === "micro" || unit === "micros") return nanos(parseNanos(valueStr, bigint1e3));
			const value = Number(valueStr);
			switch (unit) {
				case "milli":
				case "millis": return millis(value);
				case "second":
				case "seconds": return seconds(value);
				case "minute":
				case "minutes": return minutes(value);
				case "hour":
				case "hours": return hours(value);
				case "day":
				case "days": return days(value);
				case "week":
				case "weeks": return weeks(value);
			}
			break;
		}
		case "object": {
			if (input === null) break;
			if (TypeId$29 in input) return input;
			if (Array.isArray(input)) {
				if (input.length !== 2 || !input.every(isNumber)) return invalid$1(input);
				if (Number.isNaN(input[0]) || Number.isNaN(input[1])) return zero;
				if (input[0] === -Infinity || input[1] === -Infinity) return negativeInfinity;
				if (input[0] === Infinity || input[1] === Infinity) return infinity;
				return make$23(roundTiesAwayFromZero(input[0] * 1e9 + input[1]));
			}
			const obj = input;
			let millis = 0;
			if (obj.weeks) millis += obj.weeks * 6048e5;
			if (obj.days) millis += obj.days * 864e5;
			if (obj.hours) millis += obj.hours * 36e5;
			if (obj.minutes) millis += obj.minutes * 6e4;
			if (obj.seconds) millis += obj.seconds * 1e3;
			if (obj.milliseconds) millis += obj.milliseconds;
			if (!obj.microseconds && !obj.nanoseconds) return make$23(millis);
			return make$23(roundTiesAwayFromZero(millis * 1e6 + (obj.microseconds ?? 0) * 1e3 + (obj.nanoseconds ?? 0)));
		}
	}
	return invalid$1(input);
};
const invalid$1 = (input) => {
	throw new Error(`Invalid Input: ${input}`);
};
const zeroDurationValue = {
	_tag: "Millis",
	millis: 0
};
const infinityDurationValue = { _tag: "Infinity" };
const negativeInfinityDurationValue = { _tag: "NegativeInfinity" };
const DurationProto = {
	[TypeId$29]: TypeId$29,
	[symbol$1]() {
		switch (this.value._tag) {
			case "Millis": {
				const nanos = this.value.millis * 1e6;
				return Number.isFinite(nanos) ? hash(roundTiesAwayFromZero(nanos)) : number$1(this.value.millis);
			}
			case "Nanos": return hash(this.value.nanos);
			default: return structure(this.value);
		}
	},
	[symbol](that) {
		return isDuration(that) && equals(this, that);
	},
	toString() {
		switch (this.value._tag) {
			case "Infinity": return "Infinity";
			case "NegativeInfinity": return "-Infinity";
			case "Nanos": return `${this.value.nanos} nanos`;
			case "Millis": return `${this.value.millis} millis`;
		}
	},
	toJSON() {
		switch (this.value._tag) {
			case "Millis": return {
				_id: "Duration",
				_tag: "Millis",
				millis: this.value.millis
			};
			case "Nanos": return {
				_id: "Duration",
				_tag: "Nanos",
				nanos: String(this.value.nanos)
			};
			case "Infinity": return {
				_id: "Duration",
				_tag: "Infinity"
			};
			case "NegativeInfinity": return {
				_id: "Duration",
				_tag: "NegativeInfinity"
			};
		}
	},
	[NodeInspectSymbol]() {
		return this.toJSON();
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
const make$23 = (input) => {
	const duration = Object.create(DurationProto);
	if (typeof input === "number") {
		if (isNaN(input) || input === 0 || Object.is(input, -0)) duration.value = zeroDurationValue;
		else if (!Number.isFinite(input)) duration.value = input > 0 ? infinityDurationValue : negativeInfinityDurationValue;
		else if (!Number.isInteger(input)) duration.value = {
			_tag: "Nanos",
			nanos: roundMillisToNanos(input)
		};
		else duration.value = {
			_tag: "Millis",
			millis: input
		};
	} else if (input === bigint0$1) duration.value = zeroDurationValue;
	else duration.value = {
		_tag: "Nanos",
		nanos: input
	};
	return duration;
};
/**
* Checks whether a value is a Duration.
*
* **Example** (Checking for durations)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.isDuration(Duration.seconds(1)) // => true
* Duration.isDuration(1000) // => false
* ```
*
* @category guards
* @since 2.0.0
*/
const isDuration = (u) => hasProperty(u, TypeId$29);
/**
* Checks whether a Duration is finite (not infinite).
*
* **Example** (Checking finite durations)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.isFinite(Duration.seconds(5)) // => true
* Duration.isFinite(Duration.infinity) // => false
* ```
*
* @category predicates
* @since 2.0.0
*/
const isFinite$1 = (self) => self.value._tag !== "Infinity" && self.value._tag !== "NegativeInfinity";
/**
* Checks whether a Duration is zero.
*
* **Example** (Checking for zero durations)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.isZero(Duration.zero) // => true
* Duration.isZero(Duration.seconds(1)) // => false
* ```
*
* @category predicates
* @since 3.5.0
*/
const isZero = (self) => {
	switch (self.value._tag) {
		case "Millis": return self.value.millis === 0;
		case "Nanos": return self.value.nanos === bigint0$1;
		case "Infinity":
		case "NegativeInfinity": return false;
	}
};
/**
* Returns `true` if the duration is negative (strictly less than zero).
*
* **Example** (Checking for negative durations)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.isNegative(Duration.seconds(-5)) // => true
* Duration.isNegative(Duration.zero) // => false
* Duration.isNegative(Duration.negativeInfinity) // => true
* ```
*
* @category predicates
* @since 4.0.0
*/
const isNegative = (self) => {
	switch (self.value._tag) {
		case "Millis": return self.value.millis < 0;
		case "Nanos": return self.value.nanos < bigint0$1;
		case "NegativeInfinity": return true;
		case "Infinity": return false;
	}
};
/**
* Returns the absolute value of the duration.
*
* **Example** (Taking absolute duration values)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.abs(Duration.seconds(-5)) // => Duration.seconds(5)
* Duration.abs(Duration.negativeInfinity) // => Duration.infinity
* ```
*
* @category math
* @since 4.0.0
*/
const abs = (self) => {
	switch (self.value._tag) {
		case "Infinity":
		case "NegativeInfinity": return infinity;
		case "Millis": return self.value.millis < 0 ? make$23(-self.value.millis) : self;
		case "Nanos": return self.value.nanos < bigint0$1 ? make$23(-self.value.nanos) : self;
	}
};
/**
* A Duration representing zero time.
*
* **Example** (Referencing the zero duration)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.zero) // => 0
* ```
*
* @category constructors
* @since 2.0.0
*/
const zero = /*#__PURE__*/ make$23(0);
/**
* A Duration representing infinite time.
*
* **Example** (Referencing infinite duration)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.infinity) // => Infinity
* ```
*
* @category constructors
* @since 2.0.0
*/
const infinity = /*#__PURE__*/ make$23(Infinity);
/**
* A Duration representing negative infinite time.
*
* **Example** (Referencing negative infinite duration)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.negativeInfinity) // => -Infinity
* ```
*
* @category constructors
* @since 4.0.0
*/
const negativeInfinity = /*#__PURE__*/ make$23(-Infinity);
/**
* Creates a Duration from nanoseconds.
*
* **Example** (Creating durations from nanoseconds)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.nanos(500_000_000n) // => Duration.nanos(500_000_000n)
* ```
*
* @category constructors
* @since 2.0.0
*/
const nanos = (nanos) => make$23(nanos);
/**
* Creates a Duration from milliseconds.
*
* **Example** (Creating durations from milliseconds)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.millis(1000)) // => 1000
* ```
*
* @category constructors
* @since 2.0.0
*/
const millis = (millis) => make$23(millis);
/**
* Creates a Duration from seconds.
*
* **Example** (Creating durations from seconds)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.seconds(30)) // => 30_000
* ```
*
* @category constructors
* @since 2.0.0
*/
const seconds = (seconds) => make$23(seconds * 1e3);
/**
* Creates a Duration from minutes.
*
* **Example** (Creating durations from minutes)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.minutes(5)) // => 300_000
* ```
*
* @category constructors
* @since 2.0.0
*/
const minutes = (minutes) => make$23(minutes * 6e4);
/**
* Creates a Duration from hours.
*
* **Example** (Creating durations from hours)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.hours(2)) // => 7_200_000
* ```
*
* @category constructors
* @since 2.0.0
*/
const hours = (hours) => make$23(hours * 36e5);
/**
* Creates a Duration from days.
*
* **Example** (Creating durations from days)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.days(1)) // => 86_400_000
* ```
*
* @category constructors
* @since 2.0.0
*/
const days = (days) => make$23(days * 864e5);
/**
* Creates a Duration from weeks.
*
* **Example** (Creating durations from weeks)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.weeks(1)) // => 604_800_000
* ```
*
* @category constructors
* @since 2.0.0
*/
const weeks = (weeks) => make$23(weeks * 6048e5);
/**
* Converts a Duration to milliseconds.
*
* **Example** (Converting durations to milliseconds)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toMillis(Duration.seconds(5)) // => 5000
* Duration.toMillis(Duration.minutes(2)) // => 120_000
* ```
*
* @category getters
* @since 2.0.0
*/
const toMillis = (self) => match$2(fromInputUnsafe(self), {
	onMillis: identity,
	onNanos: (nanos) => Number(nanos) / 1e6,
	onInfinity: () => Infinity,
	onNegativeInfinity: () => -Infinity
});
/**
* Converts a Duration to seconds.
*
* **Example** (Converting durations to seconds)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toSeconds(Duration.millis(5000)) // => 5
* Duration.toSeconds(Duration.minutes(2)) // => 120
* ```
*
* @category getters
* @since 2.0.0
*/
const toSeconds = (self) => match$2(fromInputUnsafe(self), {
	onMillis: (millis) => millis / 1e3,
	onNanos: (nanos) => Number(nanos) / 1e9,
	onInfinity: () => Infinity,
	onNegativeInfinity: () => -Infinity
});
/**
* Gets the duration in nanoseconds as a bigint.
*
* **When to use**
*
* Use when the duration is known to be finite and you need the nanosecond value
* as a `bigint`.
*
* **Details**
*
* Millisecond-backed fractional durations are rounded to the nearest
* nanosecond, with ties away from zero.
*
* **Gotchas**
*
* If the duration is infinite, it throws an error.
*
* **Example** (Reading nanoseconds unsafely)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.toNanosUnsafe(Duration.seconds(2)) // => 2_000_000_000n
*
* // Duration.toNanosUnsafe(Duration.infinity)
* // throws Error: "Cannot convert infinite duration to nanos"
* ```
*
* @category getters
* @since 4.0.0
*/
const toNanosUnsafe = (input) => {
	const self = fromInputUnsafe(input);
	switch (self.value._tag) {
		case "Infinity":
		case "NegativeInfinity": throw new Error("Cannot convert infinite duration to nanos");
		case "Nanos": return self.value.nanos;
		case "Millis": return roundMillisToNanos(self.value.millis);
	}
};
/**
* Pattern matches on the representation of a `Duration`.
*
* **Details**
*
* Provide handlers for millisecond-backed values, nanosecond-backed values,
* and positive infinity. Use `onNegativeInfinity` to handle negative infinity
* separately; otherwise negative infinity is handled by `onInfinity`.
*
* **Example** (Pattern matching on duration representations)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.match(Duration.seconds(5), {
*   onMillis: (millis) => `${millis} milliseconds`,
*   onNanos: (nanos) => `${nanos} nanoseconds`,
*   onInfinity: () => "infinite"
* }) // => "5000 milliseconds"
* ```
*
* @category pattern matching
* @since 2.0.0
*/
const match$2 = /*#__PURE__*/ dual(2, (self, options) => {
	switch (self.value._tag) {
		case "Millis": return options.onMillis(self.value.millis);
		case "Nanos": return options.onNanos(self.value.nanos);
		case "Infinity": return options.onInfinity();
		case "NegativeInfinity": return (options.onNegativeInfinity ?? options.onInfinity)();
	}
});
/**
* Pattern matches on two `Duration`s, providing handlers that receive both values.
*
* **Example** (Pattern matching on duration pairs)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.matchPair(Duration.seconds(3), Duration.seconds(2), {
*   onMillis: (a, b) => a + b,
*   onNanos: (a, b) => Number(a + b),
*   onInfinity: () => Infinity
* }) // => 5000
* ```
*
* @category pattern matching
* @since 4.0.0
*/
const matchPair = /*#__PURE__*/ dual(3, (self, that, options) => {
	if (self.value._tag === "Infinity" || self.value._tag === "NegativeInfinity" || that.value._tag === "Infinity" || that.value._tag === "NegativeInfinity") return options.onInfinity(self, that);
	if (self.value._tag === "Millis") return that.value._tag === "Millis" ? options.onMillis(self.value.millis, that.value.millis) : options.onNanos(toNanosUnsafe(self), that.value.nanos);
	else return options.onNanos(self.value.nanos, toNanosUnsafe(that));
});
/**
* Provides an `Equivalence` instance for comparing `Duration` values.
*
* **Example** (Comparing durations for equivalence)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.Equivalence(Duration.seconds(5), Duration.millis(5000)) // => true
* ```
*
* @category instances
* @since 2.0.0
*/
const Equivalence$2 = (self, that) => matchPair(self, that, {
	onMillis: (self, that) => self === that,
	onNanos: (self, that) => self === that,
	onInfinity: (self, that) => self.value._tag === that.value._tag
});
/**
* Checks whether two Durations are equal.
*
* **Example** (Checking duration equality)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.equals(Duration.seconds(5), Duration.millis(5000)) // => true
* ```
*
* @category predicates
* @since 2.0.0
*/
const equals = /*#__PURE__*/ dual(2, (self, that) => Equivalence$2(self, that));
/**
* Decomposes a `Duration` into normalized signed components.
*
* **Details**
*
* Finite durations are returned as `{ days, hours, minutes, seconds, millis,
* nanos }`. Infinite durations return every component as `Infinity` or
* `-Infinity`.
*
* **Example** (Decomposing durations into parts)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* // Create a complex duration by adding multiple parts
* const duration = Duration.sum(
*   Duration.sum(
*     Duration.sum(Duration.days(1), Duration.hours(2)),
*     Duration.sum(Duration.minutes(30), Duration.seconds(45))
*   ),
*   Duration.millis(123)
* )
* Duration.parts(duration) // => ({ days: 1, hours: 2, minutes: 30, seconds: 45, millis: 123, nanos: 0 })
*
* const complex = Duration.sum(Duration.hours(25), Duration.minutes(90))
* Duration.parts(complex) // => ({ days: 1, hours: 2, minutes: 30, seconds: 0, millis: 0, nanos: 0 })
* ```
*
* @category converting
* @since 3.8.0
*/
const parts = (self) => {
	if (self.value._tag === "Infinity") return {
		days: Infinity,
		hours: Infinity,
		minutes: Infinity,
		seconds: Infinity,
		millis: Infinity,
		nanos: Infinity
	};
	if (self.value._tag === "NegativeInfinity") return {
		days: -Infinity,
		hours: -Infinity,
		minutes: -Infinity,
		seconds: -Infinity,
		millis: -Infinity,
		nanos: -Infinity
	};
	const n = toNanosUnsafe(self);
	const neg = n < bigint0$1;
	const a = neg ? -n : n;
	const ms = a / bigint1e6;
	const sec = ms / bigint1e3;
	const min = sec / bigint60;
	const hr = min / bigint60;
	const d = hr / bigint24;
	const sign = neg ? -1 : 1;
	return {
		days: sign * Number(d),
		hours: sign * Number(hr % bigint24),
		minutes: sign * Number(min % bigint60),
		seconds: sign * Number(sec % bigint60),
		millis: sign * Number(ms % bigint1e3),
		nanos: sign * Number(a % bigint1e6)
	};
};
/**
* Converts a `Duration` to a human readable string.
*
* **Example** (Formatting durations)
*
* ```ts import.meta.vitest
* import { Duration } from "effect"
*
* Duration.format(Duration.millis(1000)) // => "1s"
* Duration.format(Duration.millis(1001)) // => "1s 1ms"
* ```
*
* @category converting
* @since 2.0.0
*/
const format = (self) => {
	if (self.value._tag === "Infinity") return "Infinity";
	if (self.value._tag === "NegativeInfinity") return "-Infinity";
	if (isZero(self)) return "0";
	if (isNegative(self)) return "-" + format(abs(self));
	const fragments = parts(self);
	const pieces = [];
	if (fragments.days !== 0) pieces.push(`${fragments.days}d`);
	if (fragments.hours !== 0) pieces.push(`${fragments.hours}h`);
	if (fragments.minutes !== 0) pieces.push(`${fragments.minutes}m`);
	if (fragments.seconds !== 0) pieces.push(`${fragments.seconds}s`);
	if (fragments.millis !== 0) pieces.push(`${fragments.millis}ms`);
	if (fragments.nanos !== 0) pieces.push(`${fragments.nanos}ns`);
	return pieces.join(" ");
};
//#endregion
//#region node_modules/effect/dist/Scheduler.js
/**
* Controls how runnable Effect fiber tasks are dispatched.
*
* A scheduler decides how tasks are queued, when queued tasks run, and when a
* fiber should pause so other work can continue. This module includes the
* scheduler service reference, the default `MixedScheduler`, dispatcher types
* for queued tasks, and references for tuning or disabling automatic scheduler
* yields.
*
* @since 2.0.0
*/
/**
* Context reference for the scheduler used by the Effect runtime.
*
* **When to use**
*
* Use when you need to replace scheduling behavior globally in tests or runtime
* setup, such as forcing deterministic task dispatch.
*
* **Details**
*
* The default value creates a `MixedScheduler`. Provide this service to
* customize execution mode, task dispatching, or yield behavior.
*
* @category services
* @since 2.0.0
*/
const Scheduler = /*#__PURE__*/ Reference("effect/Scheduler", {
	fiberCached: true,
	defaultValue: () => new MixedScheduler()
});
const setMicrotask = (f) => {
	let cancelled = false;
	Promise.resolve().then(() => {
		if (!cancelled) f();
	});
	return () => {
		cancelled = true;
	};
};
const setTimer = "setImmediate" in globalThis ? (f) => {
	const timer = globalThis.setImmediate(f);
	return () => globalThis.clearImmediate(timer);
} : (f) => {
	const timer = setTimeout(f, 0);
	return () => clearTimeout(timer);
};
const setImmediate = (f) => {
	try {
		return setTimer(f);
	} catch {
		return setMicrotask(f);
	}
};
var PriorityBuckets = class {
	buckets = [];
	scheduleTask(task, priority) {
		const buckets = this.buckets;
		const len = buckets.length;
		let bucket;
		let index = 0;
		for (; index < len; index++) {
			if (buckets[index][0] > priority) break;
			bucket = buckets[index];
		}
		if (bucket && bucket[0] === priority) bucket[1].push(task);
		else if (index === len) buckets.push([priority, [task]]);
		else buckets.splice(index, 0, [priority, [task]]);
	}
	drain() {
		const buckets = this.buckets;
		this.buckets = [];
		return buckets;
	}
};
/**
* Provides a scheduler implementation that batches queued tasks and dispatches them by
* priority.
*
* **When to use**
*
* Use when you need the default runtime scheduler directly, including a
* scheduler that batches queued work by priority and preserves FIFO order within
* each priority.
*
* **Details**
*
* `MixedScheduler` supports synchronous and asynchronous execution modes, uses
* operation counts to decide when fibers should yield, and is the default
* scheduler implementation.
*
* @category models
* @since 2.0.0
*/
var MixedScheduler = class {
	executionMode;
	setImmediate;
	constructor(executionMode = "async", setImmediateFn) {
		this.executionMode = executionMode;
		this.setImmediate = setImmediateFn ?? (executionMode === "sync" ? setMicrotask : setImmediate);
	}
	/**
	* Returns whether the fiber has reached its operation budget and should yield.
	*
	* **When to use**
	*
	* Use to decide whether a fiber should yield after consuming its current
	* operation budget.
	*
	* @since 2.0.0
	*/
	shouldYield(fiber) {
		return fiber.currentOpCount >= fiber.cache.maxOpsBeforeYield;
	}
	/**
	* Creates a dispatcher that schedules work through this scheduler.
	*
	* **When to use**
	*
	* Use when you need a standalone dispatcher from a scheduler instance, for
	* example in tests that enqueue tasks and then flush them deterministically.
	*
	* @since 4.0.0
	*/
	makeDispatcher() {
		return new MixedSchedulerDispatcher(this.setImmediate);
	}
};
var MixedSchedulerDispatcher = class {
	tasks = /*#__PURE__*/ new PriorityBuckets();
	running = void 0;
	setImmediate;
	constructor(setImmediateFn = setImmediate) {
		this.setImmediate = setImmediateFn;
	}
	/**
	* @since 2.0.0
	*/
	scheduleTask(task, priority) {
		this.tasks.scheduleTask(task, priority);
		if (this.running === void 0) this.running = this.setImmediate(this.afterScheduled);
	}
	/**
	* @since 2.0.0
	*/
	afterScheduled = () => {
		this.running = void 0;
		this.runTasks();
	};
	/**
	* @since 2.0.0
	*/
	runTasks() {
		const buckets = this.tasks.drain();
		for (let i = 0; i < buckets.length; i++) {
			const toRun = buckets[i][1];
			for (let j = 0; j < toRun.length; j++) toRun[j]();
		}
	}
	/**
	* @since 2.0.0
	*/
	flush() {
		while (this.tasks.buckets.length > 0) {
			if (this.running !== void 0) {
				this.running();
				this.running = void 0;
			}
			this.runTasks();
		}
	}
};
/**
* Context reference that controls the maximum number of operations a fiber
* can perform before yielding control back to the scheduler.
*
* **When to use**
*
* Use to tune scheduler fairness for CPU-bound fibers by changing the scheduler
* operation budget that triggers a yield.
*
* **Details**
*
* The default value is `2048` operations, which balances performance and
* fairness by helping prevent long-running fibers from monopolizing the
* execution thread.
*
* @see {@link PreventSchedulerYield} for bypassing scheduler yield checks entirely rather than tuning the operation budget
*
* @category services
* @since 4.0.0
*/
const MaxOpsBeforeYield = /*#__PURE__*/ Reference("effect/Scheduler/MaxOpsBeforeYield", {
	fiberCached: true,
	defaultValue: () => 2048
});
/**
* Context reference that controls whether the runtime should bypass scheduler
* yield checks. When set to `true`, the fiber run loop won't call
* `Scheduler.shouldYield`.
*
* **When to use**
*
* Use to bypass scheduler yield checks for controlled runtime workloads where
* cooperative yielding should be disabled.
*
* **Gotchas**
*
* Setting this reference to `true` can let long-running fibers monopolize the
* JavaScript thread.
*
* @see {@link MaxOpsBeforeYield} for tuning yield frequency without disabling yield checks
* @see {@link Scheduler} for providing custom scheduler yield behavior
*
* @category services
* @since 4.0.0
*/
const PreventSchedulerYield = /*#__PURE__*/ Reference("effect/Scheduler/PreventSchedulerYield", {
	fiberCached: true,
	defaultValue: () => false
});
/**
* Provides a base class for yieldable errors.
*
* **When to use**
*
* Use when you need yieldable errors that do **not** need tag-based
* discrimination.
*
* **Details**
*
* Extends `Cause.YieldableError`, so instances can be yielded inside
* `Effect.gen` to fail the enclosing effect. Fields are passed as a single
* object; when there are no fields the argument is optional. If a `message`
* field is provided, it becomes the error's `.message`.
*
* **Example** (Defining a yieldable error)
*
* ```ts import.meta.vitest
* import { Data, Effect, Exit } from "effect"
*
* class NetworkError extends Data.Error<{
*   readonly code: number
*   readonly message: string
* }> {}
*
* const program = Effect.gen(function*() {
*   return yield* new NetworkError({ code: 500, message: "timeout" })
* })
*
* Effect.runSync(Effect.exit(program)) // => Exit.fail(new NetworkError({ code: 500, message: "timeout" }))
* ```
*
* @see {@link TaggedError} — adds a `_tag` for `Effect.catchTag`
* @see {@link Class} — non-error data class
*
* @category constructors
* @since 2.0.0
*/
const Error$2 = Error$3;
/**
* Creates a tagged error class with a `_tag` discriminator.
*
* **When to use**
*
* Use when you need domain errors with discriminated-union handling.
*
* **Details**
*
* Like {@link Error}, but instances also carry a `readonly _tag` property,
* enabling `Effect.catchTag` and `Effect.catchTags` for tag-based recovery.
* The `_tag` is excluded from the constructor argument. Yielding an instance
* inside `Effect.gen` fails the effect with this error.
*
* **Example** (Recovering by tag)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* class NotFound extends Data.TaggedError("NotFound")<{
*   readonly resource: string
* }> {}
*
* class Forbidden extends Data.TaggedError("Forbidden")<{
*   readonly reason: string
* }> {}
*
* const program = Effect.gen(function*() {
*   return yield* new NotFound({ resource: "/users/42" })
* })
*
* const recovered = program.pipe(
*   Effect.catchTag("NotFound", (e) =>
*     Effect.succeed(`missing: ${e.resource}`))
* )
*
* await Effect.runPromise(recovered) // => "missing: /users/42"
* ```
*
* @see {@link Error} — without a `_tag`
* @see {@link TaggedClass} — tagged class that is not an error
*
* @category constructors
* @since 2.0.0
*/
const TaggedError$1 = TaggedError$2;
//#endregion
//#region node_modules/effect/dist/encoding/Hex.js
/**
* Encodes the given value into a hex `string`.
*
* **When to use**
*
* Use to encode text or bytes as lowercase hexadecimal text.
*
* **Example** (Encoding hex strings and bytes)
*
* ```ts import.meta.vitest
* import { Hex } from "effect/encoding"
*
* // Encode a string to hex
* Hex.encode("hello") // => "68656c6c6f"
*
* // Encode binary data to hex
* const bytes = new Uint8Array([72, 101, 108, 108, 111])
* Hex.encode(bytes) // => "48656c6c6f"
* ```
*
* @category encoding
* @since 4.0.0
*/
const encode$1 = (input) => typeof input === "string" ? hexEncodeUint8Array(encoder$3.encode(input)) : hexEncodeUint8Array(input);
/**
* Generates a random lowercase hexadecimal string, optimized for lengths that
* are multiples of 8.
*
* **Details**
*
* `length` is not validated. The function generates `length >>> 3` random
* 8-character words, so non-negative lengths below `2 ** 32` are rounded down
* to a multiple of 8 and other values follow JavaScript's unsigned 32-bit
* coercion rules.
*
* This function uses `Math.random()` and is not cryptographically secure. For
* security-sensitive values, use the `Crypto.Crypto` service's `randomBytes`
* method and encode the result with {@link encode}.
*
* @category encoding
* @since 4.0.0
*/
const random = (length) => {
	switch (length) {
		case 16: return random16();
		case 32: return random32();
		default: {
			let result = "";
			for (let i = length >>> 3; i > 0; i--) result += random8();
			return result;
		}
	}
};
const hexCharCodes = /*#__PURE__*/ Uint8Array.from("0123456789abcdef", (c) => c.charCodeAt(0));
const randomWord = () => Math.random() * 4294967296 >>> 0;
const random8 = () => {
	const a = randomWord();
	return String.fromCharCode(hexCharCodes[a >>> 28], hexCharCodes[a >>> 24 & 15], hexCharCodes[a >>> 20 & 15], hexCharCodes[a >>> 16 & 15], hexCharCodes[a >>> 12 & 15], hexCharCodes[a >>> 8 & 15], hexCharCodes[a >>> 4 & 15], hexCharCodes[a & 15]);
};
const random16 = () => {
	const a = randomWord();
	const b = randomWord();
	return String.fromCharCode(hexCharCodes[a >>> 28], hexCharCodes[a >>> 24 & 15], hexCharCodes[a >>> 20 & 15], hexCharCodes[a >>> 16 & 15], hexCharCodes[a >>> 12 & 15], hexCharCodes[a >>> 8 & 15], hexCharCodes[a >>> 4 & 15], hexCharCodes[a & 15], hexCharCodes[b >>> 28], hexCharCodes[b >>> 24 & 15], hexCharCodes[b >>> 20 & 15], hexCharCodes[b >>> 16 & 15], hexCharCodes[b >>> 12 & 15], hexCharCodes[b >>> 8 & 15], hexCharCodes[b >>> 4 & 15], hexCharCodes[b & 15]);
};
const random32 = () => {
	const a = randomWord();
	const b = randomWord();
	const c = randomWord();
	const d = randomWord();
	return String.fromCharCode(hexCharCodes[a >>> 28], hexCharCodes[a >>> 24 & 15], hexCharCodes[a >>> 20 & 15], hexCharCodes[a >>> 16 & 15], hexCharCodes[a >>> 12 & 15], hexCharCodes[a >>> 8 & 15], hexCharCodes[a >>> 4 & 15], hexCharCodes[a & 15], hexCharCodes[b >>> 28], hexCharCodes[b >>> 24 & 15], hexCharCodes[b >>> 20 & 15], hexCharCodes[b >>> 16 & 15], hexCharCodes[b >>> 12 & 15], hexCharCodes[b >>> 8 & 15], hexCharCodes[b >>> 4 & 15], hexCharCodes[b & 15], hexCharCodes[c >>> 28], hexCharCodes[c >>> 24 & 15], hexCharCodes[c >>> 20 & 15], hexCharCodes[c >>> 16 & 15], hexCharCodes[c >>> 12 & 15], hexCharCodes[c >>> 8 & 15], hexCharCodes[c >>> 4 & 15], hexCharCodes[c & 15], hexCharCodes[d >>> 28], hexCharCodes[d >>> 24 & 15], hexCharCodes[d >>> 20 & 15], hexCharCodes[d >>> 16 & 15], hexCharCodes[d >>> 12 & 15], hexCharCodes[d >>> 8 & 15], hexCharCodes[d >>> 4 & 15], hexCharCodes[d & 15]);
};
const encoder$3 = /*#__PURE__*/ new TextEncoder();
const byteToHex = /*#__PURE__*/ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
const hexEncodeUint8Array = (bytes) => {
	let result = "";
	for (let i = 0; i < bytes.length; i++) result += byteToHex[bytes[i]];
	return result;
};
//#endregion
//#region node_modules/effect/dist/Tracer.js
/**
* Defines the low-level tracing model used by Effect.
*
* A span records the lifetime of an operation, including its name, parent,
* attributes, links, annotations, sampling decision, kind, and completion
* status. The module also defines the tracer service, parent-span context,
* external span support, trace propagation settings, and the default in-memory
* span implementation.
*
* @since 2.0.0
*/
/**
* Defines the string key for the parent-span context service.
*
* **When to use**
*
* Use when you need the raw context key for parent span lookup in lower-level
* tracing code.
*
* **Example** (Reading the parent span key)
*
* ```ts import.meta.vitest
* import { Tracer } from "effect"
*
* // The key used to identify parent spans in the context
* Tracer.ParentSpanKey // => "effect/Tracer/ParentSpan"
* ```
*
* @category constants
* @since 4.0.0
*/
const ParentSpanKey = "effect/Tracer/ParentSpan";
/**
* Context service containing the `Span` or `ExternalSpan` to use as the parent
* of newly-created child spans.
*
* **Example** (Accessing the parent span)
*
* ```ts import.meta.vitest
* import { Effect, Tracer } from "effect"
*
* // Access the parent span from the context
* const program = Effect.gen(function*() {
*   const parentSpan = yield* Effect.service(Tracer.ParentSpan)
*   return parentSpan.spanId
* })
*
* const parent = Tracer.externalSpan({ spanId: "span-123", traceId: "trace-456" })
* await Effect.runPromise(Effect.provideService(program, Tracer.ParentSpan, parent)) // => "span-123"
* ```
*
* @category services
* @since 2.0.0
*/
var ParentSpan = class extends (/*#__PURE__*/ Service()(ParentSpanKey, { fiberCached: true })) {};
/**
* Creates a `Tracer` value from a tracer implementation object.
*
* **When to use**
*
* Use to create a custom tracing backend value that Effect can use when
* creating spans.
*
* **Details**
*
* `make` returns the supplied implementation object unchanged. The object must
* satisfy the `Tracer` contract, including a `span` method that returns a
* `Span`.
*
* @see {@link Span} for the span values returned by tracer implementations
*
* @category constructors
* @since 2.0.0
*/
const make$22 = (options) => options;
/**
* Context reference for disabling trace propagation.
*
* **When to use**
*
* Use to prevent spans in a scope from propagating tracing context.
*
* **Details**
*
* When enabled on fiber or span annotations, new spans are created as
* non-propagating no-op spans and disabled spans are skipped when deriving a
* parent span.
*
* **Example** (Disabling span propagation)
*
* ```ts import.meta.vitest
* import { Effect, Tracer } from "effect"
*
* // Disable span propagation for a specific effect
* const program = Tracer.DisablePropagation.pipe(
*   Effect.provideService(Tracer.DisablePropagation, true)
* )
*
* await Effect.runPromise(program) // => true
* ```
*
* @category services
* @since 3.12.0
*/
const DisablePropagation = /*#__PURE__*/ Reference("effect/Tracer/DisablePropagation", { defaultValue: constFalse });
/**
* Context reference for controlling the current trace level for dynamic filtering.
*
* **When to use**
*
* Use to set the default trace level for spans in a scope when span options do
* not provide `level`.
*
* **Details**
*
* The default value is `"Info"`. Span creation uses `options.level ??
* CurrentTraceLevel` before applying `MinimumTraceLevel`.
*
* @see {@link MinimumTraceLevel} for the threshold that decides whether spans at that level are sampled
*
* @category services
* @since 4.0.0
*/
const CurrentTraceLevel = /*#__PURE__*/ Reference("effect/Tracer/CurrentTraceLevel", { defaultValue: () => "Info" });
/**
* Context reference for setting the minimum trace level threshold. Spans and their
* descendants below this level will have their sampling decision forced to
* false, preventing them from being exported.
*
* **When to use**
*
* Use to set the trace-level threshold that controls whether spans are sampled
* by default.
*
* **Details**
*
* The default value is `"All"`. Span creation compares the span level from
* `options.level ?? CurrentTraceLevel` against this threshold.
*
* **Gotchas**
*
* Explicit `options.sampled` bypasses threshold computation.
*
* @see {@link CurrentTraceLevel} for the default span level used when options do not specify one
*
* @category services
* @since 4.0.0
*/
const MinimumTraceLevel = /*#__PURE__*/ Reference("effect/Tracer/MinimumTraceLevel", { defaultValue: () => "All" });
/**
* Defines the string key for the active tracer context reference.
*
* **When to use**
*
* Use when you need the raw context key for active tracer lookup in lower-level
* tracing code.
*
* @category constants
* @since 4.0.0
*/
const TracerKey = "effect/Tracer";
/**
* The default `Tracer` implementation backing the `Tracer` reference. It
* creates in-memory `NativeSpan` instances and does not export them anywhere.
*
* **Details**
*
* Runtime code can compare the active tracer against `nativeTracer` to detect
* that no tracing backend is installed and skip work that only a backend could
* observe, such as recording span attributes.
*
* @category references
* @since 4.0.0
*/
const nativeTracer = /*#__PURE__*/ make$22({ span: (options) => new NativeSpan(options) });
/**
* Default in-memory `Span` implementation used by the native tracer. It
* generates span and trace identifiers, stores attributes, events, and links,
* and records `Started` or `Ended` status.
*
* **Details**
*
* The constructor initializes the span with `Started` status. Trace and span
* identifiers, the attribute map, and the event list are created lazily on
* first access, so spans that are never inspected allocate as little as
* possible. Attributes, events, links, and status are mutated through `Span`
* methods.
*
* @see {@link Span} for the interface implemented by native spans
*
* @category models
* @since 4.0.0
*/
var NativeSpan = class {
	_tag = "Span";
	sampled;
	name;
	parent;
	annotations;
	links;
	startTime;
	kind;
	status;
	_traceId = void 0;
	_spanId = void 0;
	_attributes = void 0;
	_events = void 0;
	constructor(options) {
		this.name = options.name;
		this.parent = options.parent;
		this.annotations = options.annotations;
		this.links = options.links;
		this.startTime = options.startTime;
		this.kind = options.kind;
		this.sampled = options.sampled;
		this.status = {
			_tag: "Started",
			startTime: options.startTime
		};
	}
	get traceId() {
		return this._traceId ??= getOrUndefined$1(this.parent)?.traceId ?? random(32);
	}
	get spanId() {
		return this._spanId ??= random(16);
	}
	get attributes() {
		return this._attributes ??= /* @__PURE__ */ new Map();
	}
	get events() {
		return this._events ??= [];
	}
	end(endTime, exit) {
		this.status = {
			_tag: "Ended",
			endTime,
			exit,
			startTime: this.status.startTime
		};
	}
	attribute(key, value) {
		this.attributes.set(key, value);
	}
	event(name, startTime, attributes) {
		this.events.push([
			name,
			startTime,
			attributes ?? {}
		]);
	}
	addLinks(links) {
		this.links.push(...links);
	}
};
//#endregion
//#region node_modules/effect/dist/internal/metric.js
/** @internal */
const FiberRuntimeMetricsKey = "effect/Metric/FiberRuntimeMetrics";
//#endregion
//#region node_modules/effect/dist/internal/references.js
/** @internal */
const CurrentStackFrame = /*#__PURE__*/ Reference("effect/References/CurrentStackFrame", {
	fiberCached: true,
	defaultValue: constUndefined
});
/** @internal */
const TracerEnabled = /*#__PURE__*/ Reference("effect/References/TracerEnabled", {
	fiberCached: true,
	defaultValue: constTrue
});
/** @internal */
const TracerTimingEnabled = /*#__PURE__*/ Reference("effect/References/TracerTimingEnabled", { defaultValue: constTrue });
/** @internal */
const TracerSpanAnnotations = /*#__PURE__*/ Reference("effect/References/TracerSpanAnnotations", { defaultValue: () => ({}) });
/** @internal */
const TracerSpanLinks = /*#__PURE__*/ Reference("effect/References/TracerSpanLinks", { defaultValue: () => [] });
/** @internal */
const CurrentLogAnnotations$1 = /*#__PURE__*/ Reference("effect/References/CurrentLogAnnotations", { defaultValue: () => ({}) });
/** @internal */
const CurrentLogLevel = /*#__PURE__*/ Reference("effect/References/CurrentLogLevel", {
	fiberCached: true,
	defaultValue: () => "Info"
});
/** @internal */
const MinimumLogLevel = /*#__PURE__*/ Reference("effect/References/MinimumLogLevel", {
	fiberCached: true,
	defaultValue: () => "Info"
});
/** @internal */
const CurrentLogSpans = /*#__PURE__*/ Reference("effect/References/CurrentLogSpans", { defaultValue: () => [] });
//#endregion
//#region node_modules/effect/dist/internal/tracer.js
/** @internal */
const addSpanStackTrace = (options) => {
	if (options?.captureStackTrace === false) return options;
	else if (options?.captureStackTrace !== void 0 && typeof options.captureStackTrace !== "boolean") return options;
	const limit = getStackTraceLimit();
	if (limit === 0 && options?.captureStackTrace !== true) return {
		...options,
		captureStackTrace: false
	};
	setStackTraceLimit(3);
	const traceError = /* @__PURE__ */ new Error();
	setStackTraceLimit(limit);
	return {
		...options,
		captureStackTrace: spanCleaner(() => traceError.stack)
	};
};
/** @internal */
const makeStackCleaner = (line) => (stack) => {
	let cache;
	return () => {
		if (cache !== void 0) return cache;
		const trace = stack();
		if (!trace) return void 0;
		const lines = trace.split("\n");
		if (lines[line] !== void 0) {
			cache = lines[line].trim();
			return cache;
		}
	};
};
const spanCleaner = /*#__PURE__*/ makeStackCleaner(3);
//#endregion
//#region node_modules/effect/dist/internal/effect.js
/** @internal */
var Interrupt = class extends ReasonBase {
	constructor(fiberId, annotations = constEmptyAnnotations) {
		super("Interrupt", annotations, "Interrupted");
		this.fiberId = fiberId;
	}
	toString() {
		return `Interrupt(${this.fiberId})`;
	}
	toJSON() {
		return {
			_tag: "Interrupt",
			fiberId: this.fiberId
		};
	}
	[symbol](that) {
		return isInterruptReason(that) && this.fiberId === that.fiberId && this.annotations === that.annotations;
	}
	[symbol$1]() {
		return combine(string$1(`${this._tag}:${this.fiberId}`))(random$1(this.annotations));
	}
};
/** @internal */
const causeInterrupt = (fiberId) => new CauseImpl([new Interrupt(fiberId)]);
/** @internal */
const findFail = (self) => {
	const reason = self.reasons.find(isFailReason$1);
	return reason ? succeed$7(reason) : fail$6(self);
};
/** @internal */
const findError$1 = (self) => {
	for (let i = 0; i < self.reasons.length; i++) {
		const reason = self.reasons[i];
		if (reason._tag === "Fail") return succeed$7(reason.error);
	}
	return fail$6(self);
};
/** @internal */
const findDefect = (self) => {
	const reason = self.reasons.find(isDieReason);
	return reason ? succeed$7(reason.defect) : fail$6(self);
};
/** @internal */
const hasInterrupts$1 = (self) => self.reasons.some(isInterruptReason);
/** @internal */
const causeFilterInterruptors = (self) => {
	let interruptors;
	for (let i = 0; i < self.reasons.length; i++) {
		const f = self.reasons[i];
		if (f._tag !== "Interrupt") continue;
		interruptors ??= /* @__PURE__ */ new Set();
		if (f.fiberId !== void 0) interruptors.add(f.fiberId);
	}
	return interruptors ? succeed$7(interruptors) : fail$6(self);
};
/** @internal */
const causeMap = /*#__PURE__*/ dual(2, (self, f) => {
	let hasFail = false;
	const failures = self.reasons.map((failure) => {
		if (isFailReason$1(failure)) {
			hasFail = true;
			return new Fail(f(failure.error), failure.annotations);
		}
		return failure;
	});
	return hasFail ? causeFromReasons(failures) : self;
});
/** @internal */
const causeSquash = (self) => {
	let die;
	for (const reason of self.reasons) {
		if (reason._tag === "Fail") return reason.error;
		if (reason._tag === "Die") die ??= reason;
	}
	if (die !== void 0) return die.defect;
	if (self.reasons.length > 0) return new globalThis.Error("All fibers interrupted without error");
	return new globalThis.Error("Empty cause");
};
/** @internal */
const causePrettyErrors = (self, options) => {
	const errors = [];
	const interrupts = [];
	if (self.reasons.length === 0) return errors;
	const prevStackLimit = getStackTraceLimit();
	if (prevStackLimit !== 0) setStackTraceLimit(1);
	try {
		for (const failure of self.reasons) {
			if (failure._tag === "Interrupt") {
				interrupts.push(failure);
				continue;
			}
			errors.push(causePrettyError(failure._tag === "Die" ? failure.defect : failure.error, failure.annotations, options));
		}
		if (errors.length === 0) {
			const cause = /* @__PURE__ */ new Error("The fiber was interrupted by:");
			cause.name = "InterruptCause";
			cause.stack = interruptCauseStack(cause, interrupts);
			const error = new globalThis.Error("All fibers interrupted without error", { cause });
			error.name = "InterruptError";
			error.stack = `${error.name}: ${error.message}`;
			errors.push(causePrettyError(error, interrupts[0].annotations, options));
		}
	} finally {
		if (prevStackLimit !== 0) setStackTraceLimit(prevStackLimit);
	}
	return errors;
};
/** @internal */
const causePrettyError = (original, annotations, options) => {
	const kind = typeof original;
	let error;
	if (original && kind === "object") {
		error = new globalThis.Error(causePrettyMessage(original), { cause: original.cause ? causePrettyError(original.cause) : void 0 });
		if (typeof original.name === "string") error.name = original.name;
		if (typeof original.stack === "string") error.stack = cleanErrorStack(original.stack, error, annotations);
		else {
			const stack = `${error.name}: ${error.message}`;
			error.stack = annotations ? addStackAnnotations(stack, annotations) : stack;
		}
		if (options?.includeCauseInStack) error.stack = renderPrettyError(error);
		for (const key of Object.keys(original)) if (!(key in error)) error[key] = original[key];
	} else error = new globalThis.Error(!original ? `Unknown error: ${original}` : kind === "string" ? original : formatJson(original));
	return error;
};
const causePrettyMessage = (u) => {
	if (typeof u.message === "string") return u.message;
	else if (typeof u.toString === "function" && u.toString !== Object.prototype.toString && u.toString !== Array.prototype.toString) try {
		return u.toString();
	} catch {}
	return formatJson(u);
};
const locationRegExp = /\((.*)\)/g;
const cleanErrorStack = (stack, error, annotations) => {
	const message = `${error.name}: ${error.message}`;
	const lines = (stack.startsWith(message) ? stack.slice(message.length) : stack).split("\n");
	const out = [message];
	for (let i = 1; i < lines.length; i++) {
		if (/Generator\.next|~effect\/(?:Effect|Utils)/.test(lines[i])) break;
		out.push(lines[i]);
	}
	return annotations ? addStackAnnotations(out.join("\n"), annotations) : out.join("\n");
};
const addStackAnnotations = (stack, annotations) => {
	const frame = annotations?.get(StackTraceKey.key);
	if (frame) stack = `${stack}\n${currentStackTrace(frame)}`;
	return stack;
};
const interruptCauseStack = (error, interrupts) => {
	const out = [`${error.name}: ${error.message}`];
	for (const current of interrupts) {
		const fiberId = current.fiberId !== void 0 ? `#${current.fiberId}` : "unknown";
		const frame = current.annotations.get(InterruptorStackTrace.key);
		out.push(`    at fiber (${fiberId})`);
		if (frame) out.push(currentStackTrace(frame));
	}
	return out.join("\n");
};
const currentStackTrace = (frame) => {
	const out = [];
	let current = frame;
	let i = 0;
	while (current && i < 10) {
		const stack = current.stack();
		if (stack) {
			const locationMatchAll = stack.matchAll(locationRegExp);
			let match = false;
			for (const [, location] of locationMatchAll) {
				match = true;
				out.push(`    at ${current.name} (${location})`);
			}
			if (!match) out.push(`    at ${current.name} (${stack.replace(/^at /, "")})`);
		} else out.push(`    at ${current.name}`);
		current = current.parent;
		i++;
	}
	return out.join("\n");
};
/** @internal */
const causePretty = (cause) => causePrettyErrors(cause).map(renderPrettyError).join("\n");
const renderPrettyError = (e) => e.cause ? `${e.stack} {\n${renderErrorCause(e.cause, "  ")}\n}` : e.stack;
const renderErrorCause = (cause, prefix) => {
	const lines = cause.stack.split("\n");
	let stack = `${prefix}[cause]: ${lines[0]}`;
	for (let i = 1, len = lines.length; i < len; i++) stack += `\n${prefix}${lines[i]}`;
	if (cause.cause) stack += ` {\n${renderErrorCause(cause.cause, `${prefix}  `)}\n${prefix}}`;
	return stack;
};
/** @internal */
const FiberTypeId = "~effect/Fiber";
const fiberVariance = {
	_A: identity,
	_E: identity
};
const fiberIdStore = { id: 0 };
const AsyncResource = /*#__PURE__*/ (() => {
	try {
		return globalThis.process?.getBuiltinModule?.("node:async_hooks")?.AsyncResource;
	} catch {
		return;
	}
})();
const captureAsyncContext = () => AsyncResource === void 0 ? void 0 : new AsyncResource("effect/Fiber");
/** @internal */
const getCurrentFiber = () => globalThis[currentFiberTypeId];
/** @internal */
var FiberImpl = class {
	constructor(context, interruptible = true) {
		this.setContext(context);
		this.id = ++fiberIdStore.id;
		this.currentOpCount = 0;
		this.interruptible = interruptible;
		this._stack = [];
		this._observers = void 0;
		this._exit = void 0;
		this._children = void 0;
		this._interruptedCause = void 0;
		this._yielded = void 0;
		this._running = false;
		this._deferredInterrupt = false;
		this._parent = void 0;
		this._asyncContext = void 0;
		this.cache.runtimeMetrics?.recordFiberStart(this.context);
	}
	get [FiberTypeId]() {
		return fiberVariance;
	}
	get currentDispatcher() {
		return this._dispatcher ??= this.cache.scheduler.makeDispatcher();
	}
	getRef(ref) {
		return get(this.context, ref);
	}
	addObserver(cb) {
		if (this._exit) {
			cb(this._exit);
			return constVoid;
		}
		if (this._observers === void 0) this._observers = [cb];
		else this._observers.push(cb);
		return () => this.removeObserver(cb);
	}
	removeObserver(cb) {
		if (this._exit || this._observers === void 0) return;
		const index = this._observers.indexOf(cb);
		if (index >= 0) this._observers.splice(index, 1);
	}
	interruptUnsafe(fiberId, annotations) {
		if (this._exit) return;
		let cause = causeInterrupt(fiberId);
		if (this.cache.stackFrame) cause = causeAnnotate(cause, make$24(StackTraceKey, this.cache.stackFrame));
		if (annotations) cause = causeAnnotate(cause, annotations);
		this._interruptedCause = this._interruptedCause ? causeCombine(this._interruptedCause, cause) : cause;
		if (this.interruptible) {
			if (this._running) this._deferredInterrupt = true;
			else this.evaluate(failCause$5(this._interruptedCause));
		}
	}
	pollUnsafe() {
		return this._exit;
	}
	evaluate(effect) {
		if (this._exit) return;
		else if (this._asyncContext !== void 0) {
			const asyncContext = this._asyncContext;
			this._asyncContext = void 0;
			return asyncContext.runInAsyncScope(this.evaluate, this, effect);
		} else if (this._yielded !== void 0) {
			const yielded = this._yielded;
			this._yielded = void 0;
			yielded();
		}
		const exit = this.runLoop(effect);
		if (exit === Yield) {
			this._asyncContext = captureAsyncContext();
			return;
		}
		const interruptChildren = fiberMiddleware.interruptChildren && fiberMiddleware.interruptChildren(this);
		if (interruptChildren !== void 0) return this.evaluate(flatMap$1(interruptChildren, () => exit));
		this._exit = exit;
		this.cache.runtimeMetrics?.recordFiberEnd(this.context, this._exit);
		if (this._parent) {
			this._parent._children?.delete(this);
			this._parent = void 0;
		}
		if (this._observers !== void 0) {
			const observers = this._observers;
			this._observers = void 0;
			for (let i = 0; i < observers.length; i++) observers[i](exit);
		}
		this._stack.length = 0;
		this._children = void 0;
		this.context = empty$7();
	}
	runLoop(effect) {
		const prevFiber = globalThis[currentFiberTypeId];
		globalThis[currentFiberTypeId] = this;
		const prevRunning = this._running;
		this._running = true;
		let yielding = false;
		let current = effect;
		this.currentOpCount = 0;
		try {
			while (true) {
				if (this._deferredInterrupt) {
					this._deferredInterrupt = false;
					current = failCause$5(this._interruptedCause);
				}
				this.currentOpCount++;
				const cache = this.cache;
				if (!yielding && !cache.preventYield && cache.scheduler.shouldYield(this)) {
					yielding = true;
					const prev = current;
					current = flatMap$1(yieldNow, () => prev);
				}
				current = cache.tracerContext ? cache.tracerContext(current, this) : current[evaluate](this);
				if (current === Yield) {
					const yielded = this._yielded;
					if (ExitTypeId in yielded) {
						this._deferredInterrupt = false;
						this._yielded = void 0;
						return yielded;
					} else if (this._deferredInterrupt) {
						this._yielded = void 0;
						yielded();
						continue;
					}
					return Yield;
				}
			}
		} catch (error) {
			if (!hasProperty(current, evaluate)) return exitDie(`Fiber.runLoop: Not a valid effect: ${String(current)}`);
			return this.runLoop(exitDie(error));
		} finally {
			this._running = prevRunning;
			globalThis[currentFiberTypeId] = prevFiber;
		}
	}
	getCont(symbol) {
		if (this._deferredInterrupt) {
			this._deferredInterrupt = false;
			return deferredInterruptCont;
		}
		while (true) {
			const op = this._stack.pop();
			if (!op) return void 0;
			const all = op[contAll];
			if (all !== void 0) {
				const cont = all.call(op, this);
				if (cont) {
					cont[symbol] = cont;
					return cont;
				}
			}
			if (op[symbol]) return op;
		}
	}
	succeedWith(value) {
		if ((++this.currentOpCount & maxInlineSteps - 1) === 0) return exitSucceed(value);
		const cont = this.getCont(contA);
		return cont ? cont[contA](value, this) : this.yieldWith(exitSucceed(value));
	}
	yieldWith(value) {
		this._yielded = value;
		return Yield;
	}
	children() {
		return this._children ??= /* @__PURE__ */ new Set();
	}
	pipe() {
		return pipeArguments(this, arguments);
	}
	setContext(context) {
		const previous = this.context;
		this.context = context;
		if (previous !== void 0 && hasSameCache(previous, context)) return;
		const root = context.cacheRoot;
		const cache = root._fiberCache ??= makeFiberContextCache(context);
		if (this.cache?.scheduler !== cache.scheduler) this._dispatcher = void 0;
		this.cache = cache;
	}
	get currentSpanLocal() {
		const span = this.cache.span;
		return span?._tag === "Span" ? span : void 0;
	}
};
const makeFiberContextCache = (context) => {
	const currentTracer = getOrUndefinedUnsafe(context, TracerKey);
	return {
		scheduler: get(context, Scheduler),
		tracer: currentTracer,
		tracerContext: currentTracer ? currentTracer["context"] : void 0,
		tracerEnabled: get(context, TracerEnabled),
		span: getOrUndefinedUnsafe(context, ParentSpanKey),
		logLevel: get(context, CurrentLogLevel),
		minimumLogLevel: get(context, MinimumLogLevel),
		stackFrame: get(context, CurrentStackFrame),
		runtimeMetrics: getOrUndefinedUnsafe(context, FiberRuntimeMetricsKey),
		maxOpsBeforeYield: get(context, MaxOpsBeforeYield),
		preventYield: get(context, PreventSchedulerYield)
	};
};
const deferredInterruptCont = {
	[contA](_value, fiber) {
		return failCause$5(fiber._interruptedCause);
	},
	[contE](_cause, fiber) {
		return failCause$5(fiber._interruptedCause);
	}
};
const maxInlineSteps = 32;
const fiberMiddleware = { interruptChildren: void 0 };
const fiberStackAnnotations = (fiber) => {
	if (!fiber.cache.stackFrame) return void 0;
	const annotations = /* @__PURE__ */ new Map();
	annotations.set(InterruptorStackTrace.key, fiber.cache.stackFrame);
	return makeUnsafe$6(annotations);
};
/** @internal */
const fiberAwait = (self) => {
	const impl = self;
	if (impl._exit) return succeed$6(impl._exit);
	return callback$1((resume) => {
		if (impl._exit) return resume(succeed$6(impl._exit));
		return sync$1(self.addObserver((exit) => resume(succeed$6(exit))));
	});
};
/** @internal */
const fiberAwaitAll = (self) => callback$1((resume) => {
	const iter = self[Symbol.iterator]();
	const exits = [];
	let cancel = void 0;
	function loop() {
		let result = iter.next();
		while (!result.done) {
			if (result.value._exit) {
				exits.push(result.value._exit);
				result = iter.next();
				continue;
			}
			cancel = result.value.addObserver((exit) => {
				exits.push(exit);
				loop();
			});
			return;
		}
		resume(succeed$6(exits));
	}
	loop();
	return sync$1(() => cancel?.());
});
/** @internal */
const fiberJoin = (self) => {
	const impl = self;
	if (impl._exit) return impl._exit;
	return callback$1((resume) => {
		if (impl._exit) return resume(impl._exit);
		return sync$1(self.addObserver(resume));
	});
};
/** @internal */
const fiberInterrupt = (self) => withFiber$1((fiber) => fiberInterruptAs(self, fiber.id));
/** @internal */
const fiberInterruptAs = /*#__PURE__*/ dual((args) => hasProperty(args[0], FiberTypeId), (self, fiberId, annotations) => withFiber$1((parent) => {
	let ann = fiberStackAnnotations(parent);
	ann = ann && annotations ? merge$3(ann, annotations) : ann ?? annotations;
	self.interruptUnsafe(fiberId, ann);
	return asVoid$1(fiberAwait(self));
}));
/** @internal */
const fiberInterruptAll = (fibers) => withFiber$1((parent) => {
	const annotations = fiberStackAnnotations(parent);
	let fiberArr = empty$8();
	for (const fiber of fibers) {
		fiber.interruptUnsafe(parent.id, annotations);
		fiberArr.push(fiber);
	}
	return asVoid$1(fiberAwaitAll(fiberArr));
});
/** @internal */
const succeed$6 = exitSucceed;
/** @internal */
const failCause$5 = exitFailCause;
/** @internal */
const fail$5 = exitFail;
/** @internal */
const sync$1 = /*#__PURE__*/ makePrimitive({
	op: "Sync",
	[evaluate](fiber) {
		const value = this[args]();
		const cont = fiber.getCont(contA);
		return cont ? cont[contA](value, fiber) : fiber.yieldWith(exitSucceed(value));
	}
});
/** @internal */
const suspend$3 = /*#__PURE__*/ makePrimitive({
	op: "Suspend",
	[evaluate](_fiber) {
		return this[args]();
	}
});
/** @internal */
const fromResult$1 = /*#__PURE__*/ match$3({
	onFailure: fail$5,
	onSuccess: succeed$6
});
/** @internal */
const yieldNow = /*#__PURE__*/ (/* @__PURE__ */ makePrimitive({
	op: "Yield",
	[evaluate](fiber) {
		let resumed = false;
		fiber.currentDispatcher.scheduleTask(() => {
			if (resumed) return;
			fiber.evaluate(exitVoid);
		}, this[args] ?? 0);
		return fiber.yieldWith(() => {
			resumed = true;
		});
	}
}))(0);
/** @internal */
const succeedNone = /*#__PURE__*/ succeed$6(/*#__PURE__*/ none());
/** @internal */
const failCauseSync$1 = (evaluate) => suspend$3(() => failCause$5(evaluate()));
/** @internal */
const die$2 = (defect) => exitDie(defect);
/** @internal */
const failSync = (error) => suspend$3(() => fail$5(error()));
/** @internal */
const void_$2 = /*#__PURE__*/ succeed$6(void 0);
/** @internal */
const try_$1 = (options) => {
	const evaluate = typeof options === "function" ? options : options.try;
	const catcher = typeof options === "function" ? (cause) => new UnknownError(cause, "An error occurred in Effect.try") : options.catch;
	return suspend$3(() => {
		try {
			return succeed$6(evaluate());
		} catch (err) {
			return fail$5(catcher(err));
		}
	});
};
/** @internal */
const promise$1 = (evaluate) => callbackOptions(function(resume, signal) {
	evaluate(signal).then((a) => resume(succeed$6(a)), (e) => resume(die$2(e)));
}, evaluate.length !== 0);
/** @internal */
const tryPromise$1 = (options) => {
	const f = typeof options === "function" ? options : options.try;
	const catcher = typeof options === "function" ? (cause) => new UnknownError(cause, "An error occurred in Effect.tryPromise") : options.catch;
	return callbackOptions(function(resume, signal) {
		const failWithCatch = (cause) => suspend$3(() => {
			try {
				return fail$5(internalCall(() => catcher(cause)));
			} catch (err) {
				return die$2(err);
			}
		});
		try {
			f(signal).then((a) => resume(succeed$6(a)), (e) => resume(failWithCatch(e)));
		} catch (err) {
			resume(failWithCatch(err));
		}
	}, f.length !== 0);
};
/** @internal */
const withFiberId = (f) => withFiber$1((fiber) => f(fiber.id));
const callbackOptions = /*#__PURE__*/ function() {
	const Proto = /*#__PURE__*/ makePrimitiveProto({
		op: "Async",
		[evaluate](fiber) {
			let resumed = false;
			let yielded = false;
			const controller = this.withSignal ? new AbortController() : void 0;
			const onCancel = this.register.call(fiber.cache.scheduler, (effect) => {
				if (resumed) return;
				resumed = true;
				if (yielded) fiber.evaluate(effect);
				else yielded = effect;
			}, controller?.signal);
			if (yielded !== false) return yielded;
			yielded = true;
			fiber._yielded = () => {
				resumed = true;
			};
			if (controller === void 0 && onCancel === void 0) return Yield;
			fiber._stack.push(asyncFinalizer(() => {
				resumed = true;
				controller?.abort();
				return onCancel ?? exitVoid;
			}));
			return Yield;
		}
	});
	const AsyncImpl = function(register, withSignal) {
		this.register = register;
		this.withSignal = withSignal;
	};
	AsyncImpl.prototype = Proto;
	return function(register, withSignal) {
		return new AsyncImpl(register, withSignal);
	};
}();
const asyncFinalizer = /*#__PURE__*/ makePrimitive({
	op: "AsyncFinalizer",
	[contAll](fiber) {
		if (fiber.interruptible) {
			fiber.interruptible = false;
			fiber._stack.push(setInterruptibleTrue);
		}
	},
	[contE](cause, _fiber) {
		return hasInterrupts$1(cause) ? flatMap$1(combineFinalizerCause(exitFailCause(cause), this[args]()), () => failCause$5(cause)) : failCause$5(cause);
	}
});
/** @internal */
const callback$1 = (register) => callbackOptions(register, register.length >= 2);
/** @internal */
const never = /*#__PURE__*/ callback$1(constVoid);
/** @internal */
const gen$1 = (...args) => {
	if (args.length === 1) {
		const body = args[0];
		return suspend$3(() => fromIteratorUnsafe(body()));
	}
	const [options, body] = args;
	return suspend$3(() => fromIteratorUnsafe(body.call(options.self)));
};
/** @internal */
const fnUntraced$1 = (body, ...pipeables) => {
	const fn = pipeables.length === 0 ? function() {
		return suspend$3(() => fromIteratorUnsafe(body.apply(this, arguments)));
	} : function() {
		let effect = suspend$3(() => fromIteratorUnsafe(body.apply(this, arguments)));
		for (let i = 0; i < pipeables.length; i++) effect = pipeables[i](effect, ...arguments);
		return effect;
	};
	return defineFunctionLength(body.length, fn);
};
const defineFunctionLength = (length, fn) => Object.defineProperty(fn, "length", {
	value: length,
	configurable: true
});
const fnStackCleaner = /*#__PURE__*/ makeStackCleaner(2);
/** @internal */
const fn$1 = function() {
	const nameFirst = typeof arguments[0] === "string";
	const name = nameFirst ? arguments[0] : "Effect.fn";
	const spanOptions = nameFirst ? arguments[1] : void 0;
	const prevLimit = getStackTraceLimit();
	let defError;
	if (prevLimit !== 0) {
		setStackTraceLimit(2);
		defError = new globalThis.Error();
		setStackTraceLimit(prevLimit);
	}
	if (nameFirst) return (body, ...pipeables) => makeFn(name, body, defError, pipeables, nameFirst, spanOptions);
	return makeFn(name, arguments[0], defError, Array.prototype.slice.call(arguments, 1), nameFirst, spanOptions);
};
const makeFn = (name, bodyOrOptions, defError, pipeables, addSpan, spanOptions) => {
	const body = typeof bodyOrOptions === "function" ? bodyOrOptions : pipeables.shift().bind(bodyOrOptions.self);
	const definitionName = `${name} (definition)`;
	const definitionStack = defError ? fnStackCleaner(() => defError.stack) : constUndefined;
	return defineFunctionLength(body.length, function(...args) {
		let result = suspend$3(() => {
			const iter = body.apply(this, arguments);
			return isEffect$1(iter) ? iter : fromIteratorUnsafe(iter);
		});
		for (let i = 0; i < pipeables.length; i++) result = pipeables[i](result, ...args);
		if (!isEffect$1(result)) return result;
		const prevLimit = getStackTraceLimit();
		let callError;
		if (prevLimit !== 0) {
			setStackTraceLimit(2);
			callError = new globalThis.Error();
			setStackTraceLimit(prevLimit);
		}
		return updateService(addSpan ? useSpan$1(name, spanOptions, (span) => provideParentSpan(result, span)) : result, CurrentStackFrame, (prev) => ({
			name,
			stack: callError ? fnStackCleaner(() => callError.stack) : constUndefined,
			parent: {
				name: definitionName,
				stack: definitionStack,
				parent: prev
			}
		}));
	});
};
/** @internal */
const fnUntracedEager$1 = (body, ...pipeables) => defineFunctionLength(body.length, pipeables.length === 0 ? function() {
	return fromIteratorEagerUnsafe(() => body.apply(this, arguments));
} : function() {
	let effect = fromIteratorEagerUnsafe(() => body.apply(this, arguments));
	for (const pipeable of pipeables) effect = pipeable(effect, ...arguments);
	return effect;
});
const fromIteratorEagerUnsafe = (evaluate) => {
	try {
		const iterator = evaluate();
		let value = void 0;
		while (true) {
			const state = iterator.next(value);
			if (state.done) return succeed$6(state.value);
			const primitive = state.value;
			if (primitive && primitive._tag === "Success") {
				value = primitive.value;
				continue;
			} else if (primitive && primitive._tag === "Failure") return state.value;
			else {
				let isFirstExecution = true;
				return suspend$3(() => {
					if (isFirstExecution) {
						isFirstExecution = false;
						return flatMap$1(state.value, (value) => fromIteratorUnsafe(iterator, value));
					} else return suspend$3(() => fromIteratorUnsafe(evaluate()));
				});
			}
		}
	} catch (error) {
		return die$2(error);
	}
};
const fromIteratorUnsafe = /*#__PURE__*/ function() {
	const Proto = /*#__PURE__*/ makePrimitiveProto({
		op: "Iterator",
		[contA](value, fiber) {
			const iter = this.iterator;
			while (true) {
				const state = iter.next(value);
				if (state.done) return succeed$6(state.value);
				if (!effectIsExit(state.value)) {
					fiber._stack.push(this);
					return state.value;
				} else if (state.value._tag === "Failure") return state.value;
				value = state.value.value;
			}
		},
		[evaluate](fiber) {
			return this[contA](this.initial, fiber);
		}
	});
	const IteratorImpl = function(iterator, initial) {
		this.iterator = iterator;
		this.initial = initial;
	};
	IteratorImpl.prototype = Proto;
	return function(iterator, initial) {
		return new IteratorImpl(iterator, initial);
	};
}();
/** @internal */
const as$1 = /*#__PURE__*/ dual(2, (self, value) => new ContImpl(self, returnPayload, succeed$6(value)));
const evaluateCont = function(fiber) {
	fiber._stack.push(this);
	return this[args];
};
const OnSuccessProto = /*#__PURE__*/ makePrimitiveProto({
	op: "OnSuccess",
	[evaluate]: evaluateCont
});
const ContImpl = function(self, cont, payload) {
	this[args] = self;
	this[contA] = cont;
	this.payload = payload;
};
ContImpl.prototype = OnSuccessProto;
const returnPayload = function() {
	return this.payload;
};
const succeedPayload = function(_value, fiber) {
	return fiber.succeedWith(this.payload);
};
const continuationMarksStack = /*#__PURE__*/ (() => {
	const marker = "~effect/Effect/stackProbe";
	return { [marker]: function stackProbe() {
		return (/* @__PURE__ */ new Error()).stack;
	} }[marker]()?.includes("[as " + marker + "]") === true;
})();
const mapCont = function(value, fiber) {
	const f = this.payload;
	return fiber.succeedWith(continuationMarksStack ? f(value) : internalCall(() => f(value)));
};
const andThenCont = function(value) {
	const f = this.payload;
	return f(value);
};
const tapCont = function(value) {
	const f = this.payload;
	return new ContImpl(f(value), succeedPayload, value);
};
const tapEffectCont = function(value) {
	return new ContImpl(this.payload, succeedPayload, value);
};
/** @internal */
const asSome = (self) => map$4(self, some);
/** @internal */
const andThen$1 = /*#__PURE__*/ dual(2, (self, f) => new ContImpl(self, isEffect$1(f) ? returnPayload : andThenCont, f));
/** @internal */
const tap$1 = /*#__PURE__*/ dual(2, (self, f) => new ContImpl(self, isEffect$1(f) ? tapEffectCont : tapCont, f));
/** @internal */
const asVoid$1 = (self) => new ContImpl(self, returnPayload, exitVoid);
/** @internal */
const raceAllFirst = (all, options) => withFiber$1((parent) => {
	const fibers = /* @__PURE__ */ new Set();
	onExitUnsafe(parent, () => fibers.size === 0 ? void 0 : fiberInterruptAll(fibers));
	return callback$1((resume) => {
		let done = false;
		let i = 0;
		for (const effect of all) {
			if (done) break;
			const index = i++;
			const fiber = forkUnsafe$1(parent, effect, true, true, false);
			fibers.add(fiber);
			fiber.addObserver((exit) => {
				fibers.delete(fiber);
				const isWinner = !done;
				done = true;
				resume(exit);
				if (isWinner && options?.onWinner) options.onWinner({
					fiber,
					index,
					parentFiber: parent
				});
			});
		}
	});
});
/** @internal */
const raceFirst = /*#__PURE__*/ dual((args) => isEffect$1(args[1]), (self, that, options) => raceAllFirst([self, that], options));
/** @internal */
const flatMap$1 = /*#__PURE__*/ dual(2, (self, f) => new ContImpl(self, andThenCont, f));
/** @internal */
const effectIsExit = (effect) => effect[ExitTypeId] !== void 0;
/** @internal */
const flatMapEager$1 = /*#__PURE__*/ dual(2, (self, f) => {
	if (effectIsExit(self)) return self._tag === "Success" ? f(self.value) : self;
	return flatMap$1(self, f);
});
/** @internal */
const flatten$1 = (self) => flatMap$1(self, identity);
/** @internal */
const map$4 = /*#__PURE__*/ dual(2, (self, f) => new ContImpl(self, mapCont, f));
/** @internal */
const mapEager$1 = /*#__PURE__*/ dual(2, (self, f) => effectIsExit(self) ? exitMap(self, f) : map$4(self, f));
/** @internal */
const catchEager$1 = /*#__PURE__*/ dual(2, (self, f) => {
	if (effectIsExit(self)) {
		if (self._tag === "Success") return self;
		const error = findError$1(self.cause);
		if (isFailure(error)) return self;
		return f(error.success);
	}
	return catch_$2(self, f);
});
/** @internal */
const exitInterrupt$1 = (fiberId) => exitFailCause(causeInterrupt(fiberId));
/** @internal */
const exitIsSuccess = (self) => self._tag === "Success";
/** @internal */
const exitFilterCause = (self) => self._tag === "Failure" ? succeed$7(self.cause) : fail$6(self);
/** @internal */
const exitHasInterrupts = (self) => self._tag === "Failure" && hasInterrupts$1(self.cause);
/** @internal */
const exitVoid = /*#__PURE__*/ exitSucceed(void 0);
/** @internal */
const exitMap = /*#__PURE__*/ dual(2, (self, f) => self._tag === "Success" ? exitSucceed(f(self.value)) : self);
/** @internal */
const exitZipRight = /*#__PURE__*/ dual(2, (self, that) => exitIsSuccess(self) ? that : self);
/** @internal */
const exitAsVoidAll = (exits) => {
	const failures = [];
	for (const exit of exits) if (exit._tag === "Failure") failures.push(...exit.cause.reasons);
	return failures.length === 0 ? exitVoid : exitFailCause(causeFromReasons(failures));
};
/** @internal */
const serviceOption$1 = (service) => withFiber$1((fiber) => succeed$6(getOption(fiber.context, service)));
/** @internal */
const updateContext$1 = /*#__PURE__*/ dual(2, (self, f) => withFiber$1((fiber) => {
	const prevContext = fiber.context;
	const nextContext = f(prevContext);
	if (prevContext === nextContext) return self;
	fiber.setContext(nextContext);
	onExitUnsafe(fiber, () => {
		fiber.setContext(prevContext);
	});
	return self;
}));
/** @internal */
const updateService = /*#__PURE__*/ dual(3, (self, service, f) => updateContext$1(self, (s) => {
	const prev = getUnsafe(s, service);
	const next = f(prev);
	if (prev === next) return s;
	return add(s, service, next);
}));
/** @internal */
const context$1 = () => getContext;
const getContext = /*#__PURE__*/ withFiber$1((fiber) => succeed$6(fiber.context));
/** @internal */
const contextWith$1 = (f) => withFiber$1((fiber) => f(fiber.context));
/** @internal */
const provideContext$1 = /*#__PURE__*/ dual(2, (self, context) => {
	if (effectIsExit(self)) return self;
	return updateContext$1(self, merge$3(context));
});
/** @internal */
const provideService$1 = function() {
	if (arguments.length === 1) return dual(2, (self, impl) => provideServiceImpl(self, arguments[0], impl));
	return dual(3, (self, service, impl) => provideServiceImpl(self, service, impl)).apply(this, arguments);
};
const provideServiceImpl = (self, service, implementation) => updateContext$1(self, add(service, implementation));
/** @internal */
const when$1 = /*#__PURE__*/ dual(2, (self, condition) => flatMap$1(condition, (pass) => pass ? asSome(self) : succeedNone));
/** @internal */
const forever$1 = /*#__PURE__*/ dual((args) => isEffect$1(args[0]), (self, options) => whileLoop$1({
	while: constTrue,
	body: constant(options?.disableYield ? self : flatMap$1(self, (_) => yieldNow)),
	step: constVoid
}));
/** @internal */
const catchCause$2 = /*#__PURE__*/ dual(2, (self, f) => new OnFailureImpl(self, f.length !== 1 ? (cause) => f(cause) : f));
const OnFailureProto = /*#__PURE__*/ makePrimitiveProto({
	op: "OnFailure",
	[evaluate]: evaluateCont
});
const OnFailureImpl = function(self, f) {
	this[args] = self;
	this[contE] = f;
};
OnFailureImpl.prototype = OnFailureProto;
/** @internal */
const catchCauseFilter$1 = /*#__PURE__*/ dual(3, (self, filter, f) => catchCause$2(self, (cause) => {
	const eb = filter(cause);
	return isFailure(eb) ? failCause$5(eb.failure) : f(eb.success, cause);
}));
/** @internal */
const catch_$2 = /*#__PURE__*/ dual(2, (self, f) => catchCauseFilter$1(self, findError$1, (e) => f(e)));
/** @internal */
const catchDefect$1 = /*#__PURE__*/ dual(2, (self, f) => catchCauseFilter$1(self, findDefect, f));
/** @internal */
const tapCauseFilter = /*#__PURE__*/ dual(3, (self, filter, f) => catchCause$2(self, (cause) => {
	const result = filter(cause);
	if (isFailure(result)) return failCause$5(cause);
	return andThen$1(f(result.success, cause), failCause$5(cause));
}));
/** @internal */
const tapError$3 = /*#__PURE__*/ dual(2, (self, f) => tapCauseFilter(self, findError$1, (e) => f(e)));
/** @internal */
const catchFilter = /*#__PURE__*/ dual((args) => isEffect$1(args[0]), (self, filter, f, orElse) => catchCause$2(self, (cause) => {
	const error = findError$1(cause);
	if (isFailure(error)) return failCause$5(error.failure);
	const result = filter(error.success);
	if (isFailure(result)) return orElse ? orElse(result.failure) : failCause$5(cause);
	return f(result.success);
}));
/** @internal */
const catchTags$1 = /*#__PURE__*/ dual((args) => isEffect$1(args[0]), (self, cases, orElse) => {
	let keys;
	return catchFilter(self, (e) => {
		keys ??= Object.keys(cases);
		return hasProperty(e, "_tag") && isString(e["_tag"]) && keys.includes(e["_tag"]) ? succeed$7(e) : fail$6(e);
	}, (e) => cases[e["_tag"]](e), orElse);
});
/** @internal */
const mapError$3 = /*#__PURE__*/ dual(2, (self, f) => catch_$2(self, (error) => failSync(() => f(error))));
/** @internal */
const orDie$1 = (self) => catch_$2(self, die$2);
/** @internal */
const orElseSucceed$1 = /*#__PURE__*/ dual(2, (self, f) => catch_$2(self, (error) => sync$1(() => f(error))));
/** @internal */
const ignore$2 = /*#__PURE__*/ dual((args) => isEffect$1(args[0]), (self, options) => {
	if (!options?.log) return matchEffect$1(self, {
		onFailure: (_) => void_$2,
		onSuccess: (_) => void_$2
	});
	const logEffect = logWithLevel(options.log === true ? void 0 : options.log);
	return matchCauseEffect$1(self, {
		onFailure(cause) {
			const failure = findFail(cause);
			return isFailure(failure) ? failCause$5(failure.failure) : options.message === void 0 ? logEffect(cause) : logEffect(options.message, cause);
		},
		onSuccess: (_) => void_$2
	});
});
/** @internal */
const result$1 = (self) => matchEager(self, {
	onFailure: fail$6,
	onSuccess: succeed$7
});
/** @internal */
const matchCauseEffect$1 = /*#__PURE__*/ dual(2, (self, options) => new OnSuccessAndFailureImpl(self, options.onSuccess.length !== 1 ? (a) => options.onSuccess(a) : options.onSuccess, options.onFailure.length !== 1 ? (cause) => options.onFailure(cause) : options.onFailure));
const OnSuccessAndFailureProto = /*#__PURE__*/ makePrimitiveProto({
	op: "OnSuccessAndFailure",
	[evaluate]: evaluateCont
});
const OnSuccessAndFailureImpl = function(self, onSuccess, onFailure) {
	this[args] = self;
	this[contA] = onSuccess;
	this[contE] = onFailure;
};
OnSuccessAndFailureImpl.prototype = OnSuccessAndFailureProto;
const matchSuccess = function(value, fiber) {
	const handlers = this.payload;
	return fiber.succeedWith(continuationMarksStack ? handlers.onSuccess(value) : internalCall(() => handlers.onSuccess(value)));
};
const makeMatch = (op, onFailure) => {
	const Proto = makePrimitiveProto({
		op,
		[evaluate]: evaluateCont,
		[contA]: matchSuccess,
		[contE]: onFailure
	});
	const MatchImpl = function(self, handlers) {
		this[args] = self;
		this.payload = handlers;
	};
	MatchImpl.prototype = Proto;
	return MatchImpl;
};
const MatchImpl = /*#__PURE__*/ makeMatch("Match", function(cause, fiber) {
	const fail = cause.reasons.find(isFailReason$1);
	if (fail === void 0) return failCause$5(cause);
	const handlers = this.payload;
	return fiber.succeedWith(continuationMarksStack ? handlers.onFailure(fail.error) : internalCall(() => handlers.onFailure(fail.error)));
});
/** @internal */
const matchEffect$1 = /*#__PURE__*/ dual(2, (self, options) => matchCauseEffect$1(self, {
	onFailure: (cause) => {
		const fail = cause.reasons.find(isFailReason$1);
		return fail ? options.onFailure(fail.error) : failCause$5(cause);
	},
	onSuccess: options.onSuccess
}));
/** @internal */
const match$1 = /*#__PURE__*/ dual(2, (self, options) => new MatchImpl(self, options));
/** @internal */
const matchEager = /*#__PURE__*/ dual(2, (self, options) => {
	if (effectIsExit(self)) {
		if (self._tag === "Success") return exitSucceed(options.onSuccess(self.value));
		const error = findError$1(self.cause);
		if (isFailure(error)) return self;
		return exitSucceed(options.onFailure(error.success));
	}
	return match$1(self, options);
});
/** @internal */
const exit$1 = (self) => effectIsExit(self) ? exitSucceed(self) : exitPrimitive(self);
const exitPrimitive = /*#__PURE__*/ makePrimitive({
	op: "Exit",
	[evaluate](fiber) {
		fiber._stack.push(this);
		return this[args];
	},
	[contA](value, fiber, exit) {
		return fiber.succeedWith(exit ?? exitSucceed(value));
	},
	[contE](cause, fiber, exit) {
		return fiber.succeedWith(exit ?? exitFailCause(cause));
	}
});
/** @internal */
const timeoutOrElse = /*#__PURE__*/ dual(2, (self, options) => flatMap$1(timeoutOption(self, options.duration), (option) => isNone(option) ? options.orElse() : succeed$6(option.value)));
/** @internal */
const timeoutErrorFromDuration = (duration) => new TimeoutError(`Operation timed out after '${format(duration)}'`);
/** @internal */
const timeout$1 = /*#__PURE__*/ dual(2, (self, duration) => {
	const decoded = fromInputUnsafe(duration);
	return timeoutOrElse(self, {
		duration: decoded,
		orElse: () => fail$5(timeoutErrorFromDuration(decoded))
	});
});
/** @internal */
const timeoutOption = /*#__PURE__*/ dual(2, (self, duration) => raceFirst(asSome(self), as$1(sleep$1(duration), none())));
/** @internal */
const ScopeTypeId = "~effect/Scope";
/** @internal */
const ScopeCloseableTypeId = "~effect/Scope/Closeable";
/** @internal */
const scopeTag = /*#__PURE__*/ Service("effect/Scope");
/** @internal */
const scopeClose = (self, exit_) => withFiber$1((fiber) => {
	const close = scopeCloseUnsafe(self, exit_);
	if (close === void 0) return void_$2;
	fiberEnterUninterruptibleUnsafe(fiber);
	return close;
});
/** @internal */
const scopeCloseUnsafe = (self, exit_) => {
	const state = self.state;
	if (state._tag === "Closed") return;
	self.state = {
		_tag: "Closed",
		exit: exit_
	};
	if (self.parent !== void 0) scopeRemoveFinalizerUnsafe(self.parent, self);
	if (state._tag === "Empty") return;
	if (state.finalizer !== void 0) return runFinalizer(state.finalizer, exit_);
	const finalizers = state.finalizers;
	if (finalizers.size === 1) return runFinalizer(finalizers.values().next().value, exit_);
	return scopeCloseFinalizers(self, finalizers, exit_);
};
const runFinalizer = (finalizer, exit_) => {
	try {
		return finalizer(exit_);
	} catch (defect) {
		return exitDie(defect);
	}
};
const combineFinalizerCause = (exit_, finalizer) => exitIsSuccess(exit_) ? finalizer : catchCause$2(finalizer, (cause) => failCause$5(causeCombine(exit_.cause, cause)));
const scopeCloseFinalizers = /*#__PURE__*/ fnUntraced$1(function* (self, finalizers, exit_) {
	let exits = [];
	const fibers = [];
	const arr = Array.from(finalizers.values());
	const parent = getCurrentFiber();
	for (let i = arr.length - 1; i >= 0; i--) {
		const finalizer = arr[i];
		if (self.strategy === "sequential") exits.push(yield* exit$1(runFinalizer(finalizer, exit_)));
		else fibers.push(forkUnsafe$1(parent, runFinalizer(finalizer, exit_), true, true, "inherit"));
	}
	if (fibers.length > 0) exits = yield* fiberAwaitAll(fibers);
	return yield* exitAsVoidAll(exits);
});
/** @internal */
const scopeForkUnsafe = (scope, finalizerStrategy) => {
	const child = makeScope(finalizerStrategy, scope);
	if (scope.state._tag === "Closed") {
		child.state = scope.state;
		return child;
	}
	scopeAddFinalizerUnsafe(scope, child, (exit) => scopeClose(child, exit));
	return child;
};
/** @internal */
const scopeAddFinalizerExit = (scope, finalizer) => {
	return suspend$3(() => {
		if (scope.state._tag === "Closed") return finalizer(scope.state.exit);
		scopeAddFinalizerUnsafe(scope, {}, finalizer);
		return void_$2;
	});
};
/** @internal */
const scopeAddFinalizer = (scope, finalizer) => scopeAddFinalizerExit(scope, constant(finalizer));
/** @internal */
const scopeAddFinalizerUnsafe = (scope, key, finalizer) => {
	if (scope.state._tag === "Empty") scope.state = {
		_tag: "Open",
		finalizerKey: key,
		finalizer,
		finalizers: void 0
	};
	else if (scope.state._tag === "Open") {
		const state = scope.state;
		if (state.finalizer !== void 0) {
			state.finalizers = /* @__PURE__ */ new Map([[state.finalizerKey, state.finalizer]]);
			state.finalizerKey = void 0;
			state.finalizer = void 0;
			state.finalizers.set(key, finalizer);
		} else state.finalizers.set(key, finalizer);
	}
};
/** @internal */
const scopeRemoveFinalizerUnsafe = (scope, key) => {
	if (scope.state._tag !== "Open") return;
	const state = scope.state;
	if (state.finalizerKey === key) scope.state = constScopeEmpty;
	else if (state.finalizers !== void 0) {
		state.finalizers.delete(key);
		if (state.finalizers.size === 0) scope.state = constScopeEmpty;
	}
};
/** @internal */
const scopeMakeUnsafe = (finalizerStrategy) => makeScope(finalizerStrategy, void 0);
const makeScope = (finalizerStrategy = "sequential", parent) => ({
	[ScopeCloseableTypeId]: ScopeCloseableTypeId,
	[ScopeTypeId]: ScopeTypeId,
	strategy: finalizerStrategy,
	parent,
	state: constScopeEmpty
});
const constScopeEmpty = { _tag: "Empty" };
/** @internal */
const scope = scopeTag;
/** @internal */
const provideScope = /*#__PURE__*/ provideService$1(scopeTag);
/** @internal */
const scoped$1 = (self) => withFiber$1((fiber) => {
	const prev = fiber.context;
	const scope = scopeMakeUnsafe();
	fiber.setContext(add(fiber.context, scopeTag, scope));
	onExitUnsafe(fiber, (exit) => {
		fiber.setContext(prev);
		return scopeCloseUnsafe(scope, exit);
	});
	return self;
});
/** @internal */
const acquireRelease$1 = (acquire, release, options) => contextWith$1((context) => uninterruptibleMask$1((restore) => flatMap$1(scope, (scope) => tap$1(options?.interruptible ? restore(acquire) : acquire, (a) => scopeAddFinalizerExit(scope, (exit) => provideContext$1(release(a, exit), context))))));
const OnExitImpl = /*#__PURE__*/ function() {
	const Proto = /*#__PURE__*/ makePrimitiveProto({
		op: "OnExit",
		[evaluate](fiber) {
			fiber._stack.push(this);
			return this.effect;
		},
		[contAll](fiber) {
			if (fiber.interruptible && this.interruptible !== true) {
				fiber._stack.push(setInterruptibleTrue);
				fiber.interruptible = false;
			}
		},
		[contA](value, _, exit) {
			exit ??= exitSucceed(value);
			let eff;
			try {
				eff = this.onExit(exit);
			} catch (defect) {
				eff = exitDie(defect);
			}
			return eff ? flatMap$1(eff, (_) => exit) : exit;
		},
		[contE](cause, _, exit) {
			exit ??= exitFailCause(cause);
			let eff;
			try {
				eff = this.onExit(exit);
			} catch (defect) {
				eff = exitDie(defect);
			}
			return eff ? flatMap$1(combineFinalizerCause(exit, eff), (_) => exit) : exit;
		}
	});
	const OnExitImpl = function(effect, onExit, interruptible) {
		this.effect = effect;
		this.onExit = onExit;
		this.interruptible = interruptible;
	};
	OnExitImpl.prototype = Proto;
	return OnExitImpl;
}();
/** @internal */
const onExitPrimitive = (effect, onExit, interruptible) => new OnExitImpl(effect, onExit, interruptible);
/**
* Pushes an exit finalizer for the current `withFiber` evaluation. Only call inside `withFiber`.
* @internal
*/
const onExitUnsafe = (fiber, f) => {
	fiber._stack.push(new OnExitImpl(void 0, f, void 0));
};
/** @internal */
const onExit$2 = /*#__PURE__*/ dual(2, onExitPrimitive);
/** @internal */
const onExitFilter = /*#__PURE__*/ dual(3, (self, filter, f) => onExit$2(self, (exit) => {
	const b = filter(exit);
	return isFailure(b) ? void_$2 : f(b.success, exit);
}));
/** @internal */
const onError$1 = /*#__PURE__*/ dual(2, (self, f) => onExitFilter(self, exitFilterCause, f));
/** @internal */
const onErrorFilter = /*#__PURE__*/ dual(3, (self, filter, f) => onExit$2(self, (exit) => {
	if (exit._tag !== "Failure") return void_$2;
	const result = filter(exit.cause);
	return isFailure(result) ? void_$2 : f(result.success, exit.cause);
}));
/** @internal */
const onInterrupt$1 = /*#__PURE__*/ dual(2, (self, finalizer) => onErrorFilter(causeFilterInterruptors, finalizer)(self));
const infiniteTTL = /*#__PURE__*/ constant(Infinity);
const makeCachedUnsafe = (self, ttlMillis) => {
	let expiresAt = 0;
	let exit;
	let current;
	const join = (fiber, run) => {
		run.awaiters++;
		onExitUnsafe(fiber, () => {
			if (--run.awaiters > 0 || current !== run) return;
			current = void 0;
			return fiberInterrupt(run.fiber);
		});
		return fiberJoin(run.fiber);
	};
	return [withFiber$1((fiber) => {
		if (current !== void 0) return join(fiber, current);
		if (exit !== void 0 && (expiresAt === Infinity || fiber.getRef(ClockRef).currentTimeMillisUnsafe() < expiresAt)) return exit;
		exit = void 0;
		const clock = fiber.getRef(ClockRef);
		const run = {
			fiber: void 0,
			awaiters: 0
		};
		current = run;
		run.fiber = forkUnsafe$1(fiber, onExitPrimitive(self, (exit_) => {
			if (current !== run) return;
			current = void 0;
			if (exitHasInterrupts(exit_)) return;
			const duration = ttlMillis(exit_);
			expiresAt = duration === Infinity ? Infinity : clock.currentTimeMillisUnsafe() + duration;
			exit = exit_;
		}), true, true);
		return run.fiber._exit ?? join(fiber, run);
	}), sync$1(() => {
		exit = void 0;
	})];
};
/** @internal */
const cached$1 = (self) => sync$1(() => makeCachedUnsafe(self, infiniteTTL)[0]);
/** @internal */
const interrupt$2 = /*#__PURE__*/ withFiber$1((fiber) => failCause$5(causeInterrupt(fiber.id)));
/** @internal */
const uninterruptible$1 = (self) => withFiber$1((fiber) => {
	if (!fiber.interruptible) return self;
	fiber.interruptible = false;
	fiber._stack.push(setInterruptibleTrue);
	return self;
});
const setInterruptible = /*#__PURE__*/ makePrimitive({
	op: "SetInterruptible",
	[contAll](fiber) {
		fiber.interruptible = this[args];
		if (fiber._interruptedCause && fiber.interruptible) return () => failCause$5(fiber._interruptedCause);
	}
});
const setInterruptibleTrue = /*#__PURE__*/ setInterruptible(true);
const setInterruptibleFalse = /*#__PURE__*/ setInterruptible(false);
const setFiberInterruptible = (fiber) => {
	fiber.interruptible = true;
	fiber._stack.push(setInterruptibleFalse);
	if (fiber._interruptedCause) return failCause$5(fiber._interruptedCause);
};
/**
* Makes the current fiber uninterruptible for the returned effect without an
* extra primitive. Call only within `withFiber`.
*
* @internal
*/
const fiberEnterUninterruptibleUnsafe = (fiber) => {
	const impl = fiber;
	if (!impl.interruptible) return;
	impl.interruptible = false;
	impl._stack.push(setInterruptibleTrue);
};
/** @internal */
const interruptible = (self) => withFiber$1((fiber) => {
	if (fiber.interruptible) return self;
	return setFiberInterruptible(fiber) ?? self;
});
/** @internal */
const uninterruptibleMask$1 = (f) => withFiber$1((fiber) => {
	if (!fiber.interruptible) return f(identity);
	fiber.interruptible = false;
	fiber._stack.push(setInterruptibleTrue);
	return f(interruptible);
});
/** @internal */
const all$2 = (arg, options) => {
	if (isIterable(arg)) return options?.mode === "result" ? forEach$1(arg, result$1, options) : forEach$1(arg, identity, options);
	else if (options?.discard) return options.mode === "result" ? forEach$1(Object.values(arg), result$1, options) : forEach$1(Object.values(arg), identity, options);
	return suspend$3(() => {
		const out = {};
		return as$1(forEach$1(Object.entries(arg), ([key, effect]) => map$4(options?.mode === "result" ? result$1(effect) : effect, (value) => {
			assignProperty(out, key, value);
		}), {
			discard: true,
			concurrency: options?.concurrency
		}), out);
	});
};
/** @internal */
const whileLoop$1 = /*#__PURE__*/ makePrimitive({
	op: "While",
	[contA](value, fiber) {
		this[args].step(value);
		if (this[args].while()) {
			fiber._stack.push(this);
			return this[args].body();
		}
		return exitVoid;
	},
	[evaluate](fiber) {
		if (this[args].while()) {
			fiber._stack.push(this);
			return this[args].body();
		}
		return exitVoid;
	}
});
/** @internal */
const forEach$1 = /*#__PURE__*/ dual((args) => typeof args[1] === "function", (iterable, f, options) => suspend$3(() => {
	const concurrency = resolveConcurrency(options?.concurrency);
	if (concurrency === 1) return forEachSequential(iterable, f, options);
	const items = fromIterable$1(iterable);
	let length = items.length;
	if (length === 0) return options?.discard ? void_$2 : succeed$6([]);
	const out = options?.discard ? void 0 : new Array(length);
	const eff = forEachConcurrent({
		f,
		out
	}, items, { concurrency });
	return eff ? as$1(eff, out) : succeed$6(out);
}));
const forEachSequential = (iterable, f, options) => suspend$3(() => {
	const out = options?.discard ? void 0 : [];
	const iterator = iterable[Symbol.iterator]();
	let state = iterator.next();
	let index = 0;
	return as$1(whileLoop$1({
		while: () => !state.done,
		body: () => f(state.value, index++),
		step: (b) => {
			if (out) out.push(b);
			state = iterator.next();
		}
	}), out);
});
/** @internal */
const resolveConcurrency = (concurrency) => concurrency === "unbounded" ? Number.POSITIVE_INFINITY : Math.max(1, concurrency ?? 1);
/** @internal */
const iterateEager = () => (options) => {
	const onItem = options.onItem;
	const step = options.step;
	const resumeSequential = (state, items, index, end, effect) => flatMap$1(exit$1(effect), (itemExit) => step(state, items[index], itemExit, index) ?? runSequential(state, items, index + 1, end) ?? void_$2);
	const runSequential = (state, items, index = 0, end = items.length) => {
		for (; index < end; index++) {
			const item = items[index];
			const effect = onItem(state, item, index);
			if (!effectIsExit(effect)) return resumeSequential(state, items, index, end, effect);
			const terminal = step(state, item, effect, index);
			if (terminal) return terminal._tag === "Failure" ? terminal : void 0;
		}
	};
	return runSequential;
};
const iterateConcurrentImpl = (options) => {
	const onItem = options.onItem;
	const step = options.step;
	return (state, items, opts) => {
		let index = 0;
		const end = opts.end ?? items.length;
		const concurrency = opts.concurrency;
		let done = false;
		let parentFiber;
		let fibers;
		let resume;
		let terminal;
		let effect;
		const failDefect = (error) => {
			const defect = exitDie(error);
			terminal = defect;
			done = true;
			return fibers && fibers.size > 0 ? flatMap$1(uninterruptible$1(fiberInterruptAll(Array.from(fibers))), () => terminal ?? defect) : defect;
		};
		const go = () => {
			let paused = false;
			for (; !terminal && index < end; index++) {
				const item = items[index];
				const eff = effect ?? onItem(state, item, index);
				if (effectIsExit(eff)) {
					terminal = step(state, item, eff, index);
					if (terminal) break;
				} else if (!parentFiber) return callback$1((cb) => {
					parentFiber = getCurrentFiber();
					fibers = /* @__PURE__ */ new Set();
					effect = eff;
					resume = cb;
					let result;
					try {
						result = go();
					} catch (error) {
						return cb(failDefect(error));
					}
					if (result) return cb(result);
					return suspend$3(() => {
						terminal ??= exitVoid;
						return flatMap$1(fibers ? fiberInterruptAll(fibers) : void_$2, () => terminal?._tag === "Failure" ? terminal : void_$2);
					});
				});
				else {
					effect = void 0;
					const fiber = forkUnsafe$1(parentFiber, eff, true, true, "inherit");
					if (fiber._exit) {
						terminal = step(state, item, fiber._exit, index);
						if (terminal) break;
						continue;
					}
					fibers.add(fiber);
					const currentIndex = index;
					fiber.addObserver((exit) => {
						fibers.delete(fiber);
						try {
							if (terminal) {
								if (exit._tag === "Failure") {
									const reasons = exit.cause.reasons.filter((reason) => reason._tag !== "Interrupt");
									if (reasons.length > 0) {
										const cause = causeFromReasons(reasons);
										terminal = exitFailCause(terminal._tag === "Failure" ? causeCombine(terminal.cause, cause) : cause);
									}
								}
							} else {
								const result = step(state, item, exit, currentIndex);
								if (result) {
									terminal = result;
									go();
								}
							}
							if (paused) {
								const eff = go();
								if (eff) resume(eff);
							} else if (done && fibers.size === 0) resume(terminal ?? void_$2);
						} catch (error) {
							resume(failDefect(error));
						}
					});
					if (fibers.size < concurrency) continue;
					paused = true;
					index++;
					return;
				}
			}
			done = true;
			if (terminal) {
				if (fibers && fibers.size > 0) {
					const annotations = fiberStackAnnotations(parentFiber);
					fibers.forEach((f) => f.interruptUnsafe(parentFiber.id, annotations));
					return;
				}
				if (resume || terminal._tag === "Failure") return terminal;
			} else if (resume) {
				if (!fibers) return exitVoid;
				else if (fibers.size === 0) resume(void_$2);
			}
		};
		return go();
	};
};
/** @internal */
const iterateConcurrent = () => (options) => iterateConcurrentImpl(options);
const forEachConcurrent = /*#__PURE__*/ iterateConcurrentImpl({
	onItem(state, item, index) {
		return state.f(item, index);
	},
	step(state, _, exit, index) {
		if (exit._tag === "Failure") return exit;
		else if (state.out) state.out[index] = exit.value;
	}
});
/** @internal */
const forkUnsafe$1 = (parent, effect, immediate = false, daemon = false, uninterruptible = false) => {
	const parentRuntime = parent;
	const interruptible = uninterruptible === "inherit" ? parentRuntime.interruptible : !uninterruptible;
	const child = new FiberImpl(parentRuntime.context, interruptible);
	if (immediate) child.evaluate(effect);
	else {
		child._asyncContext = captureAsyncContext();
		parentRuntime.currentDispatcher.scheduleTask(() => child.evaluate(effect), 0);
	}
	if (!daemon && !child._exit) {
		parentRuntime.children().add(child);
		child._parent = parentRuntime;
	}
	return child;
};
/** @internal */
const forkIn$1 = /*#__PURE__*/ dual((args) => isEffect$1(args[0]), (self, scope, options) => withFiber$1((parent) => {
	const fiber = forkUnsafe$1(parent, self, options?.startImmediately, true, options?.uninterruptible);
	if (!fiber._exit) {
		if (scope.state._tag !== "Closed") {
			const key = {};
			const finalizer = () => withFiberId((interruptor) => interruptor === fiber.id ? void_$2 : fiberInterrupt(fiber));
			scopeAddFinalizerUnsafe(scope, key, finalizer);
			fiber.addObserver(() => scopeRemoveFinalizerUnsafe(scope, key));
		} else fiber.interruptUnsafe(parent.id, fiberStackAnnotations(parent));
	}
	return succeed$6(fiber);
}));
/** @internal */
const forkScoped$1 = /*#__PURE__*/ dual((args) => isEffect$1(args[0]), (self, options) => flatMap$1(scope, (scope) => forkIn$1(self, scope, options)));
/** @internal */
const runForkWith$1 = (context) => (effect, options) => {
	const fiber = new FiberImpl(options?.scheduler ? add(context, Scheduler, options.scheduler) : context, options?.uninterruptible !== true);
	fiber.evaluate(effect);
	if (fiber._exit) return fiber;
	if (options?.signal) {
		if (options.signal.aborted) fiber.interruptUnsafe();
		else {
			const abort = () => fiber.interruptUnsafe();
			options.signal.addEventListener("abort", abort, { once: true });
			fiber.addObserver(() => options.signal.removeEventListener("abort", abort));
		}
	}
	if (options?.onFiberStart) options.onFiberStart(fiber);
	return fiber;
};
/** @internal */
const fiberRunIn = /*#__PURE__*/ dual(2, (self, scope) => {
	if (self._exit) return self;
	else if (scope.state._tag === "Closed") {
		self.interruptUnsafe(self.id);
		return self;
	}
	const key = {};
	scopeAddFinalizerUnsafe(scope, key, () => fiberInterrupt(self));
	self.addObserver(() => scopeRemoveFinalizerUnsafe(scope, key));
	return self;
});
/** @internal */
const runFork$1 = /*#__PURE__*/ runForkWith$1(/*#__PURE__*/ empty$7());
/** @internal */
const runPromiseExitWith = (context) => {
	const runFork = runForkWith$1(context);
	return (effect, options) => {
		const fiber = runFork(effect, options);
		return new Promise((resolve) => {
			fiber.addObserver((exit) => resolve(exit));
		});
	};
};
/** @internal */
const runPromiseWith = (context) => {
	const runPromiseExit = runPromiseExitWith(context);
	return (effect, options) => runPromiseExit(effect, options).then((exit) => {
		if (exit._tag === "Failure") throw causeSquash(exit.cause);
		return exit.value;
	});
};
/** @internal */
const runPromise$1 = /*#__PURE__*/ runPromiseWith(/*#__PURE__*/ empty$7());
/** @internal */
const runSyncExitWith = (context) => {
	const runFork = runForkWith$1(context);
	return (effect) => {
		if (effectIsExit(effect)) return effect;
		const scheduler = new MixedScheduler("sync");
		const fiber = runFork(effect, { scheduler });
		fiber._dispatcher?.flush();
		return fiber._exit ?? exitDie(new AsyncFiberError(fiber));
	};
};
/** @internal */
const runSyncExit$1 = /*#__PURE__*/ runSyncExitWith(/*#__PURE__*/ empty$7());
/** @internal */
const runSyncWith = (context) => {
	const runSyncExit = runSyncExitWith(context);
	return (effect) => {
		const exit = runSyncExit(effect);
		if (exit._tag === "Failure") throw causeSquash(exit.cause);
		return exit.value;
	};
};
/** @internal */
const runSync$2 = /*#__PURE__*/ runSyncWith(/*#__PURE__*/ empty$7());
const succeedTrue = /*#__PURE__*/ succeed$6(true);
const succeedFalse = /*#__PURE__*/ succeed$6(false);
var Latch = class {
	waiters = [];
	scheduled = void 0;
	_isOpen;
	constructor(isOpen) {
		this._isOpen = isOpen;
	}
	scheduleUnsafe(fiber) {
		if (this.waiters.length === 0) return succeedTrue;
		if (this.scheduled === void 0) {
			this.scheduled = this.waiters;
			fiber.currentDispatcher.scheduleTask(this.flushScheduled, 0);
		} else for (let i = 0; i < this.waiters.length; i++) this.scheduled.push(this.waiters[i]);
		this.waiters = [];
		return succeedTrue;
	}
	flushScheduled = () => {
		if (this.scheduled === void 0) return;
		const waiters = this.scheduled;
		this.scheduled = void 0;
		for (let i = 0; i < waiters.length; i++) waiters[i](exitVoid);
	};
	flushWaiters() {
		const waiters = this.waiters;
		this.waiters = [];
		this.flushScheduled();
		for (let i = 0; i < waiters.length; i++) waiters[i](exitVoid);
	}
	open = /*#__PURE__*/ withFiber$1((fiber) => {
		if (this._isOpen) return succeedFalse;
		this._isOpen = true;
		return this.scheduleUnsafe(fiber);
	});
	release = /*#__PURE__*/ withFiber$1((fiber) => this._isOpen ? succeedFalse : this.scheduleUnsafe(fiber));
	openUnsafe() {
		if (this._isOpen) return false;
		this._isOpen = true;
		this.flushWaiters();
		return true;
	}
	await = /*#__PURE__*/ callback$1((resume) => {
		if (this._isOpen) return resume(void_$2);
		this.waiters.push(resume);
		return sync$1(() => {
			let index = this.waiters.indexOf(resume);
			if (index !== -1) this.waiters.splice(index, 1);
			else if (this.scheduled !== void 0) {
				index = this.scheduled.indexOf(resume);
				if (index !== -1) this.scheduled.splice(index, 1);
			}
		});
	});
	closeUnsafe() {
		if (!this._isOpen) return false;
		this._isOpen = false;
		return true;
	}
	close = /*#__PURE__*/ sync$1(() => this.closeUnsafe());
	whenOpen = (self) => flatMap$1(this.await, () => self);
	isOpen() {
		return this._isOpen;
	}
};
/** @internal */
const makeLatchUnsafe = (open) => new Latch(open ?? false);
const bigint0 = /*#__PURE__*/ BigInt(0);
const NoopSpanProto = {
	_tag: "Span",
	spanId: "noop",
	traceId: "noop",
	sampled: false,
	status: {
		_tag: "Ended",
		startTime: bigint0,
		endTime: bigint0,
		exit: exitVoid
	},
	attributes: /*#__PURE__*/ new Map(),
	links: [],
	kind: "internal",
	attribute() {},
	event() {},
	end() {},
	addLinks() {}
};
/** @internal */
const noopSpan = (options) => Object.assign(Object.create(NoopSpanProto), options);
const filterDisablePropagation = (span) => {
	if (!span) return none();
	return get(span.annotations, DisablePropagation) ? span._tag === "Span" ? filterDisablePropagation(getOrUndefined$1(span.parent)) : none() : some(span);
};
/** @internal */
const makeSpanUnsafe = (fiber, name, options) => {
	const disablePropagation = !fiber.cache.tracerEnabled || options?.annotations && get(options.annotations, DisablePropagation);
	const parent = options?.parent !== void 0 ? some(options.parent) : options?.root ? none() : filterDisablePropagation(fiber.cache.span);
	let span;
	if (disablePropagation) span = noopSpan({
		name,
		parent,
		annotations: add(options?.annotations ?? empty$7(), DisablePropagation, true)
	});
	else {
		const tracer = fiber.cache.tracer ?? nativeTracer;
		const clock = fiber.getRef(ClockRef);
		const timingEnabled = fiber.getRef(TracerTimingEnabled);
		const annotationsFromEnv = fiber.getRef(TracerSpanAnnotations);
		const linksFromEnv = fiber.getRef(TracerSpanLinks);
		const level = options?.level ?? fiber.getRef(CurrentTraceLevel);
		const links = options?.links !== void 0 ? [...linksFromEnv, ...options.links] : linksFromEnv.length === 0 ? [] : linksFromEnv.slice();
		span = tracer.span({
			name,
			parent,
			annotations: options?.annotations ?? empty$7(),
			links,
			startTime: timingEnabled ? clock.currentTimeNanosUnsafe() : bigint0,
			kind: options?.kind ?? "internal",
			root: options?.root ?? isNone(parent),
			sampled: options?.sampled ?? (isSome(parent) && parent.value.sampled === false ? false : !isLogLevelGreaterThan(fiber.getRef(MinimumTraceLevel), level))
		});
		for (const key in annotationsFromEnv) span.attribute(key, annotationsFromEnv[key]);
		if (options?.attributes !== void 0) for (const key in options.attributes) span.attribute(key, options.attributes[key]);
	}
	return span;
};
const provideSpanStackFrame = (name, stack) => {
	stack = typeof stack === "function" ? stack : constUndefined;
	return updateService(CurrentStackFrame, (parent) => ({
		name,
		stack,
		parent
	}));
};
/** @internal */
const endSpan = (span, exit, clock, timingEnabled) => sync$1(() => {
	if (span.status._tag === "Ended") return;
	span.end(timingEnabled ? clock.currentTimeNanosUnsafe() : bigint0, exit);
});
/** @internal */
const useSpan$1 = (name, ...args) => {
	const options = args.length === 1 ? void 0 : args[0];
	const evaluate = args[args.length - 1];
	return withFiber$1((fiber) => {
		const span = makeSpanUnsafe(fiber, name, options);
		const clock = fiber.getRef(ClockRef);
		const timingEnabled = fiber.getRef(TracerTimingEnabled);
		onExitUnsafe(fiber, (exit) => endSpan(span, exit, clock, timingEnabled));
		return evaluate(span);
	});
};
const provideParentSpan = /*#__PURE__*/ provideService$1(ParentSpan);
/** @internal */
const withParentSpan$1 = function() {
	const dataFirst = isEffect$1(arguments[0]);
	const span = dataFirst ? arguments[1] : arguments[0];
	let options = dataFirst ? arguments[2] : arguments[1];
	let provideStackFrame = identity;
	if (span._tag === "Span") {
		options = addSpanStackTrace(options);
		provideStackFrame = provideSpanStackFrame(span.name, options?.captureStackTrace);
	}
	if (dataFirst) return provideParentSpan(provideStackFrame(arguments[0]), span);
	return (self) => provideParentSpan(provideStackFrame(self), span);
};
/** @internal */
const ClockRef = /*#__PURE__*/ Reference("effect/Clock", { defaultValue: () => new ClockImpl() });
const MAX_TIMER_MILLIS = 2 ** 31 - 1;
var ClockImpl = class {
	currentTimeMillisUnsafe() {
		return Date.now();
	}
	currentTimeMillis = /*#__PURE__*/ sync$1(() => this.currentTimeMillisUnsafe());
	currentTimeNanosUnsafe() {
		return wallTimeNanos();
	}
	currentTimeNanos = /*#__PURE__*/ sync$1(() => this.currentTimeNanosUnsafe());
	monotonicTimeNanosUnsafe() {
		return monotonicNowNanos();
	}
	monotonicTimeNanos = /*#__PURE__*/ sync$1(() => this.monotonicTimeNanosUnsafe());
	sleep(duration) {
		return this.sleepMillis(toMillis(duration));
	}
	sleepMillis(millis) {
		if (millis <= 0) return yieldNow;
		else if (!Number.isFinite(millis)) return never;
		return callback$1((resume) => {
			const continuation = millis > MAX_TIMER_MILLIS ? this.sleepMillis(millis - MAX_TIMER_MILLIS) : void_$2;
			const handle = setTimeout(() => resume(continuation), Math.min(millis, MAX_TIMER_MILLIS));
			return sync$1(() => clearTimeout(handle));
		});
	}
};
const nanosPerMilli = /*#__PURE__*/ BigInt(1e6);
const monotonicNowNanos = /*#__PURE__*/ function() {
	const processHrtime = globalThis.process?.hrtime;
	if (typeof processHrtime?.bigint === "function") return () => processHrtime.bigint();
	if (typeof performance !== "undefined" && typeof performance.now === "function") return () => BigInt(Math.round(performance.now() * 1e6));
	let previous = /*#__PURE__*/ BigInt(0);
	return () => {
		const current = BigInt(Date.now()) * nanosPerMilli;
		if (current > previous) previous = current;
		return previous;
	};
}();
const wallTimeNanos = /*#__PURE__*/ function() {
	const reanchorThresholdNanos = /*#__PURE__*/ BigInt(1e9);
	let origin;
	return () => {
		const monotonic = monotonicNowNanos();
		const wall = BigInt(Date.now()) * nanosPerMilli;
		if (origin === void 0) origin = wall - monotonic;
		else {
			const projected = origin + monotonic;
			if ((wall > projected ? wall - projected : projected - wall) > reanchorThresholdNanos) origin = wall - monotonic;
		}
		return origin + monotonic;
	};
}();
/** @internal */
const clockWith$1 = (f) => withFiber$1((fiber) => f(fiber.getRef(ClockRef)));
/** @internal */
const sleep$1 = (duration) => clockWith$1((clock) => clock.sleep(fromInputUnsafe(duration)));
/** @internal */
const currentTimeMillis$1 = /*#__PURE__*/ clockWith$1((clock) => clock.currentTimeMillis);
/** @internal */
const TimeoutErrorTypeId = "~effect/Cause/TimeoutError";
/** @internal */
var TimeoutError = class extends (/*#__PURE__*/ TaggedError$2("TimeoutError")) {
	[TimeoutErrorTypeId] = TimeoutErrorTypeId;
	constructor(message) {
		super({ message });
	}
};
/** @internal */
const IllegalArgumentErrorTypeId = "~effect/Cause/IllegalArgumentError";
/** @internal */
var IllegalArgumentError$1 = class extends (/*#__PURE__*/ TaggedError$2("IllegalArgumentError")) {
	[IllegalArgumentErrorTypeId] = IllegalArgumentErrorTypeId;
	constructor(message) {
		super({ message });
	}
};
/** @internal */
const AsyncFiberErrorTypeId = "~effect/Cause/AsyncFiberError";
/** @internal */
var AsyncFiberError = class extends (/*#__PURE__*/ TaggedError$2("AsyncFiberError")) {
	[AsyncFiberErrorTypeId] = AsyncFiberErrorTypeId;
	constructor(fiber) {
		super({
			message: "An asynchronous Effect was executed with Effect.runSync",
			fiber
		});
	}
};
/** @internal */
const UnknownErrorTypeId = "~effect/Cause/UnknownError";
/** @internal */
var UnknownError = class extends (/*#__PURE__*/ TaggedError$2("UnknownError")) {
	[UnknownErrorTypeId] = UnknownErrorTypeId;
	constructor(cause, message) {
		super({
			message,
			cause
		});
	}
};
/** @internal */
const ConsoleRef = /*#__PURE__*/ Reference("effect/Console", { defaultValue: () => globalThis.console });
/** @internal */
const logLevelToOrder = (level) => {
	switch (level) {
		case "All": return Number.MIN_SAFE_INTEGER;
		case "Fatal": return 5e4;
		case "Error": return 4e4;
		case "Warn": return 3e4;
		case "Info": return 2e4;
		case "Debug": return 1e4;
		case "Trace": return 0;
		case "None": return Number.MAX_SAFE_INTEGER;
	}
};
/** @internal */
const isLogLevelGreaterThan = /*#__PURE__*/ isGreaterThan$1(/* @__PURE__ */ mapInput(Number$4, logLevelToOrder));
/** @internal */
const CurrentLoggers = /*#__PURE__*/ Reference("effect/Logger/CurrentLoggers", { defaultValue: () => /* @__PURE__ */ new Set([defaultLogger, tracerLogger]) });
/** @internal */
const LogToStderr = /*#__PURE__*/ Reference("effect/Logger/LogToStderr", { defaultValue: constFalse });
const LoggerProto = {
	["~effect/Logger"]: {
		_Message: identity,
		_Output: identity
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
/** @internal */
const loggerMake = (log) => {
	const self = Object.create(LoggerProto);
	self.log = log;
	return self;
};
/**
* Sanitize a given string by replacing spaces, equal signs, and double quotes
* with underscores.
*
* @internal
*/
const formatLabel = (key) => key.replace(/[\s="]/g, "_");
/**
* Formats a log span into a `<label>=<value>ms` string.
*
* @internal
*/
const formatLogSpan = (self, now) => {
	return `${formatLabel(self[0])}=${now - self[1]}ms`;
};
/** @internal */
const logWithLevel = (level) => (...message) => {
	let cause = void 0;
	for (let i = 0, len = message.length; i < len; i++) {
		const msg = message[i];
		if (isCause(msg)) {
			if (cause) message.splice(i, 1);
			else message = message.slice(0, i).concat(message.slice(i + 1));
			cause = cause ? causeFromReasons(cause.reasons.concat(msg.reasons)) : msg;
			i--;
		}
	}
	if (cause === void 0) cause = causeEmpty;
	return withFiber$1((fiber) => {
		const logLevel = level ?? fiber.cache.logLevel;
		if (isLogLevelGreaterThan(fiber.cache.minimumLogLevel, logLevel)) return void_$2;
		const clock = fiber.getRef(ClockRef);
		const loggers = fiber.getRef(CurrentLoggers);
		if (loggers.size > 0) {
			const date = new Date(clock.currentTimeMillisUnsafe());
			for (const logger of loggers) logger.log({
				cause,
				fiber,
				date,
				logLevel,
				message
			});
		}
		return void_$2;
	});
};
const colors = {
	bold: "1",
	red: "31",
	green: "32",
	yellow: "33",
	blue: "34",
	cyan: "36",
	white: "37",
	gray: "90",
	black: "30",
	bgBrightRed: "101"
};
colors.gray, colors.blue, colors.green, colors.yellow, colors.red, colors.bgBrightRed, colors.black;
const defaultDateFormat = (date) => `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}.${date.getMilliseconds().toString().padStart(3, "0")}`;
/** @internal */
const defaultLogger = /*#__PURE__*/ loggerMake(({ cause, date, fiber, logLevel, message }) => {
	const message_ = Array.isArray(message) ? message.slice() : [message];
	if (cause.reasons.length > 0) message_.push(causePretty(cause));
	const now = date.getTime();
	const spans = fiber.getRef(CurrentLogSpans);
	let spanString = "";
	for (const span of spans) spanString += ` ${formatLogSpan(span, now)}`;
	const annotations = fiber.getRef(CurrentLogAnnotations$1);
	if (Object.keys(annotations).length > 0) message_.push(annotations);
	const console = fiber.getRef(ConsoleRef);
	(fiber.getRef(LogToStderr) ? console.error : console.log)(`[${defaultDateFormat(date)}] ${logLevel.toUpperCase()} (#${fiber.id})${spanString}:`, ...message_);
});
/** @internal */
const tracerLogger = /*#__PURE__*/ loggerMake(({ cause, fiber, logLevel, message }) => {
	const clock = fiber.getRef(ClockRef);
	const annotations = fiber.getRef(CurrentLogAnnotations$1);
	const span = fiber.cache.span;
	if (span === void 0 || span._tag === "ExternalSpan") return;
	const attributes = {};
	for (const [key, value] of Object.entries(annotations)) assignProperty(attributes, key, value);
	attributes["effect.fiberId"] = fiber.id;
	attributes["effect.logLevel"] = logLevel.toUpperCase();
	if (cause.reasons.length > 0) attributes["effect.cause"] = causePretty(cause);
	span.event(toStringUnknown(Array.isArray(message) && message.length === 1 ? message[0] : message), clock.currentTimeNanosUnsafe(), attributes);
});
//#endregion
//#region node_modules/effect/dist/Cause.js
/**
* Narrows a `Reason` to `Fail`.
*
* **When to use**
*
* Use as a predicate for `Array.filter` to pick out typed `Fail` reasons when
* iterating over `cause.reasons`.
*
* **Example** (Filtering fail reasons)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* const cause = Cause.fail("error")
* const fails = cause.reasons.filter(Cause.isFailReason)
* fails[0].error // => "error"
* ```
*
* @see {@link isDieReason} — narrow to `Die`
* @see {@link isInterruptReason} — narrow to `Interrupt`
*
* @category guards
* @since 4.0.0
*/
const isFailReason = isFailReason$1;
/**
* Creates a `Cause` from an array of `Reason` values.
*
* **When to use**
*
* Use when you already have individual reasons (e.g. from filtering or
* transforming another cause's `reasons` array) and need to wrap them back
* into a `Cause`.
*
* **Details**
*
* - Returns a new `Cause`.
* - An empty array produces a cause equivalent to `empty`.
*
* **Gotchas**
*
* The `reasons` array is stored as provided. Treat the array as immutable
* after passing it to this function.
*
* **Example** (Building a cause from reasons)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* const reasons = [
*   Cause.makeFailReason("err1"),
*   Cause.makeFailReason("err2")
* ]
* Cause.fromReasons(reasons) // => Cause.combine(Cause.fail("err1"), Cause.fail("err2"))
* ```
*
* @see {@link combine} — merge two existing causes
*
* @category constructors
* @since 4.0.0
*/
const fromReasons = causeFromReasons;
/**
* Creates a `Cause` containing a single `Die` reason with the
* given defect.
*
* **When to use**
*
* Use to construct a cause from an untyped defect or unexpected thrown value.
*
* **Example** (Creating a die cause)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* Cause.die("Unexpected") // => Cause.fromReasons([Cause.makeDieReason("Unexpected")])
* ```
*
* @see {@link fail} — for typed errors
* @see {@link interrupt} — for fiber interruptions
*
* @category constructors
* @since 2.0.0
*/
const die$1 = causeDie;
/**
* Transforms the typed error values inside a `Cause` using the
* provided function. Only `Fail` reasons are affected; `Die` and `Interrupt`
* reasons pass through unchanged.
*
* **When to use**
*
* Use to transform expected typed failures while preserving defects and
* interruptions unchanged.
*
* **Details**
*
* If at least one `Fail` reason exists, this returns a new `Cause`
* containing the mapped failures. If the cause has no `Fail` reasons, the
* original cause is returned unchanged.
*
* **Example** (Mapping errors to uppercase)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* const cause = Cause.fail("error")
* const mapped = Cause.map(cause, (e) => e.toUpperCase())
* const reason = mapped.reasons[0]
* if (Cause.isFailReason(reason)) {
*   reason.error // => "ERROR"
* }
* ```
*
* @category mapping
* @since 2.0.0
*/
const map$3 = causeMap;
/**
* Collapses a `Cause` into a single `unknown` value, picking the "most
* important" failure in this order:
*
* **When to use**
*
* Use to collapse a structured cause to the single value that synchronous and
* promise runners would throw.
*
* **Details**
*
* 1. First `Fail` error (the `E` value)
* 2. First `Die` defect
* 3. A generic `Error("All fibers interrupted without error")` for interrupt-only causes
* 4. A generic `Error("Empty cause")` for `empty`
*
* This is the function used by `Effect.runPromise` and `Effect.runSync` to
* decide what to throw.
*
* **Gotchas**
*
* This function is lossy. Use {@link prettyErrors} or iterate `cause.reasons`
* when you need all failures.
*
* **Example** (Squashing a cause)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* Cause.squash(Cause.fail("error")) // => "error"
* Cause.squash(Cause.die("defect")) // => "defect"
* ```
*
* @see {@link prettyErrors} — non-lossy conversion to `Array<Error>`
* @see {@link pretty} — human-readable string rendering
*
* @category destructors
* @since 2.0.0
*/
const squash = causeSquash;
/**
* Returns `true` if the cause contains at least one `Interrupt` reason.
*
* **Example** (Checking for interruptions)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* Cause.hasInterrupts(Cause.interrupt(123)) // => true
* Cause.hasInterrupts(Cause.fail("error")) // => false
* ```
*
* @see {@link hasInterruptsOnly} — `true` only when *all* reasons are interrupts
* @see {@link hasFails} — check for typed errors
* @see {@link hasDies} — check for defects
*
* @category predicates
* @since 4.0.0
*/
const hasInterrupts = hasInterrupts$1;
/**
* Checks whether an arbitrary value is a `Done` signal.
*
* **Example** (Checking the runtime type)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* Cause.isDone(Cause.Done()) // => true
* Cause.isDone("not done") // => false
* ```
*
* @category guards
* @since 4.0.0
*/
const isDone = isDone$1;
/**
* Creates an Effect that fails with a `Done` error. Shorthand for
* `Effect.fail(Cause.Done(value))`.
*
* **When to use**
*
* Use when you model stream or queue completion through the error channel.
*
* **Example** (Failing with Done)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Exit } from "effect"
*
* const program = Cause.done("finished")
*
* await Effect.runPromiseExit(program) // => Exit.fail(Cause.Done("finished"))
* ```
*
* @see {@link Done} — create the signal value without an Effect
*
* @category constructors
* @since 4.0.0
*/
const done$1 = done$2;
/**
* Constructs an `IllegalArgumentError` with an optional message.
*
* **Example** (Creating an IllegalArgumentError)
*
* ```ts import.meta.vitest
* import { Cause } from "effect"
*
* new Cause.IllegalArgumentError("Invalid argument").message // => "Invalid argument"
* ```
*
* @category constructors
* @since 4.0.0
*/
const IllegalArgumentError = IllegalArgumentError$1;
//#endregion
//#region node_modules/effect/dist/Exit.js
/**
* Creates a successful Exit containing the given value.
*
* **When to use**
*
* Use when you need an Exit that contains a known success value.
*
* **Details**
*
* Returns a `Success<A>` with the provided value. Does not perform any
* computation.
*
* **Example** (Creating a successful Exit)
*
* ```ts import.meta.vitest
* import { Exit } from "effect"
*
* Exit.succeed(42) // => Exit.succeed(42)
* ```
*
* @see {@link fail} to create a failed Exit
* @see {@link void_ void} for a pre-allocated success with no value
*
* @category constructors
* @since 2.0.0
*/
const succeed$5 = exitSucceed;
/**
* Creates a failed Exit from a Cause.
*
* **When to use**
*
* Use when you already have a `Cause<E>` and want to wrap it in an Exit
* for advanced error handling where you need full control over the Cause
* structure.
*
* **Details**
*
* Returns a `Failure<never, E>`. If you only have an error value, use
* {@link fail} instead.
*
* **Example** (Creating a failed Exit from a Cause)
*
* ```ts import.meta.vitest
* import { Cause, Exit } from "effect"
*
* Exit.failCause(Cause.fail("Something went wrong")) // => Exit.fail("Something went wrong")
* ```
*
* @see {@link fail} to create a Failure from a plain error value
* @see {@link die} to create a Failure from a defect
*
* @category constructors
* @since 2.0.0
*/
const failCause$4 = exitFailCause;
/**
* Creates a failed Exit from a typed error value.
*
* **When to use**
*
* Use when you need to represent an expected typed failure as an `Exit`.
*
* **Details**
*
* The error is wrapped in a `Cause.Fail` internally.
*
* Returns a `Failure<never, E>`.
*
* **Example** (Creating a failed Exit)
*
* ```ts import.meta.vitest
* import { Exit } from "effect"
*
* Exit.fail("Something went wrong") // => Exit.fail("Something went wrong")
* ```
*
* @see {@link succeed} to create a successful Exit
* @see {@link die} to create a Failure from an unexpected defect
* @see {@link failCause} to create a Failure from a full Cause
*
* @category constructors
* @since 2.0.0
*/
const fail$4 = exitFail;
const void_$1 = exitVoid;
/**
* Checks whether an Exit is a Success.
*
* **When to use**
*
* Use as a type guard to narrow `Exit<A, E>` to `Success<A, E>` and access the
* `value` property.
*
* **Example** (Narrowing to success)
*
* ```ts import.meta.vitest
* import { Exit } from "effect"
*
* const exit = Exit.succeed(42)
*
* if (Exit.isSuccess(exit)) {
*   exit.value // => 42
* }
* ```
*
* @see {@link isFailure} for the opposite check
* @see {@link match} for exhaustive pattern matching
*
* @category guards
* @since 2.0.0
*/
const isSuccess = exitIsSuccess;
const DeferredProto = {
	["~effect/Deferred"]: {
		_A: identity,
		_E: identity
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
const DeferredImpl = function() {
	this.resumes = void 0;
	this.effect = void 0;
};
DeferredImpl.prototype = DeferredProto;
/**
* Creates an empty `Deferred` synchronously outside the `Effect` runtime.
*
* **When to use**
*
* Use to allocate a `Deferred` synchronously when direct allocation outside
* `Effect` is required.
*
* **Example** (Creating a Deferred unsafely)
*
* ```ts import.meta.vitest
* import { Deferred } from "effect"
*
* const deferred = Deferred.makeUnsafe<number>()
* Deferred.isDoneUnsafe(deferred) // => false
* ```
*
* @category unsafe
* @since 4.0.0
*/
const makeUnsafe$5 = () => new DeferredImpl();
/**
* Creates a new `Deferred`.
*
* **When to use**
*
* Use to allocate an empty `Deferred` inside an `Effect` workflow.
*
* **Example** (Creating a Deferred)
*
* ```ts import.meta.vitest
* import { Deferred, Effect } from "effect"
*
* const program = Effect.gen(function*() {
*   const deferred = yield* Deferred.make<number>()
*   yield* Deferred.succeed(deferred, 42)
*   return yield* Deferred.await(deferred)
* })
*
* await Effect.runPromise(program) // => 42
* ```
*
* @category constructors
* @since 2.0.0
*/
const make$21 = () => sync$1(() => makeUnsafe$5());
const _await = (self) => callback$1((resume) => {
	if (self.effect) return resume(self.effect);
	self.resumes ??= [];
	self.resumes.push(resume);
	return sync$1(() => {
		const resumes = self.resumes;
		if (resumes === void 0) return;
		const index = resumes.indexOf(resume);
		if (index >= 0) resumes.splice(index, 1);
	});
});
/**
* Completes the `Deferred` with the specified `Exit` value, which will be
* propagated to all fibers waiting on the value of the `Deferred`.
*
* **When to use**
*
* Use to complete a `Deferred` from an already computed `Exit`.
*
* **Details**
*
* The returned effect succeeds with `true` when this call completed the
* `Deferred`, or `false` if it was already completed.
*
* **Example** (Completing a Deferred with an Exit)
*
* ```ts import.meta.vitest
* import { Deferred, Effect, Exit } from "effect"
*
* const program = Effect.gen(function*() {
*   const deferred = yield* Deferred.make<number>()
*   yield* Deferred.done(deferred, Exit.succeed(42))
*   return yield* Effect.exit(Deferred.await(deferred))
* })
*
* await Effect.runPromise(program) // => Exit.succeed(42)
* ```
*
* @see {@link complete} for completing from an effect and memoizing its result
* @see {@link completeWith} for storing an effect directly
* @see {@link succeed} for completing with a success value
* @see {@link failCause} for completing with a failure cause
*
* @category completion
* @since 2.0.0
*/
const done = /* @__PURE__ */ dual(2, (self, effect) => sync$1(() => doneUnsafe(self, effect)));
/**
* Attempts to complete the `Deferred` with the specified `Cause`.
*
* **When to use**
*
* Use to complete a `Deferred` with a full failure cause.
*
* **Details**
*
* Fibers waiting on the `Deferred` observe that cause only if this call
* completes it. The returned effect succeeds with `true` when this call
* completed the `Deferred`, or `false` if it was already completed.
*
* **Example** (Failing a Deferred with a Cause)
*
* ```ts import.meta.vitest
* import { Cause, Deferred, Effect, Exit } from "effect"
*
* const program = Effect.gen(function*() {
*   const deferred = yield* Deferred.make<number, string>()
*   const success = yield* Deferred.failCause(deferred, Cause.fail("Operation failed"))
*   const exit = yield* Effect.exit(Deferred.await(deferred))
*   return [success, exit]
* })
*
* await Effect.runPromise(program) // => [true, Exit.failCause(Cause.fail("Operation failed"))]
* ```
*
* @category completion
* @since 2.0.0
*/
const failCause$3 = /*#__PURE__*/ dual(2, (self, cause) => done(self, exitFailCause(cause)));
/**
* Attempts to complete the `Deferred` with interruption by the specified
* `FiberId`.
*
* **When to use**
*
* Use to complete a `Deferred` as interrupted by a specific fiber id.
*
* **Details**
*
* Fibers waiting on the `Deferred` are interrupted with that fiber id only if
* this call completes it. The returned effect succeeds with `true` when this
* call completed the `Deferred`, or `false` if it was already completed.
*
* **Example** (Interrupting a Deferred with a fiber id)
*
* ```ts import.meta.vitest
* import { Deferred, Effect, Exit } from "effect"
*
* const program = Effect.gen(function*() {
*   const deferred = yield* Deferred.make<number>()
*   const success = yield* Deferred.interruptWith(deferred, 42)
*   const exit = yield* Effect.exit(Deferred.await(deferred))
*   return [success, exit]
* })
*
* await Effect.runPromise(program) // => [true, Exit.interrupt(42)]
* ```
*
* @category completion
* @since 2.0.0
*/
const interruptWith = /*#__PURE__*/ dual(2, (self, fiberId) => failCause$3(self, causeInterrupt(fiberId)));
/**
* Attempts to complete the `Deferred` synchronously with the specified
* completion effect.
*
* **When to use**
*
* Use to complete a `Deferred` synchronously in low-level code that already has
* the completion effect.
*
* **Details**
*
* This mutates the `Deferred` directly and should be reserved for low-level
* code; prefer the effectful completion APIs when possible. Returns `true` if
* this call completed the `Deferred`, or `false` if it was already completed.
*
* **Example** (Completing a Deferred unsafely)
*
* ```ts import.meta.vitest
* import { Deferred, Effect } from "effect"
*
* const deferred = Deferred.makeUnsafe<number>()
* Deferred.doneUnsafe(deferred, Effect.succeed(42)) // => true
* ```
*
* @category unsafe
* @since 4.0.0
*/
const doneUnsafe = (self, effect) => {
	if (self.effect) return false;
	self.effect = effect;
	if (self.resumes) {
		const resumes = self.resumes;
		self.resumes = void 0;
		for (let i = 0; i < resumes.length; i++) resumes[i](effect);
	}
	return true;
};
//#endregion
//#region node_modules/effect/dist/References.js
/**
* Context reference for managing log annotations that are automatically added to all log entries.
* These annotations provide contextual metadata that appears in every log message.
*
* **When to use**
*
* Use to attach shared contextual metadata to every log entry emitted in the
* current context.
*
* **Example** (Managing log annotations)
*
* ```ts import.meta.vitest
* import { Effect, References } from "effect"
*
* const logAnnotationExample = Effect.gen(function*() {
*   // Get current annotations (empty by default)
*   const current = yield* References.CurrentLogAnnotations
*   const defaultCount = Object.keys(current).length
*
*   // Run with custom log annotations
*   const custom = yield* Effect.provideService(
*     Effect.gen(function*() {
*       const annotations = yield* References.CurrentLogAnnotations
*       return [annotations.requestId, annotations.userId, annotations.version]
*     }),
*     References.CurrentLogAnnotations,
*     {
*       requestId: "req-123",
*       userId: "user-456",
*       version: "1.0.0"
*     }
*   )
*
*   // Run with extended annotations
*   const extended = yield* Effect.provideService(
*     Effect.gen(function*() {
*       const annotations = yield* References.CurrentLogAnnotations
*       return [annotations.operation, annotations.timestamp]
*     }),
*     References.CurrentLogAnnotations,
*     {
*       requestId: "req-123",
*       userId: "user-456",
*       version: "1.0.0",
*       operation: "data-sync",
*       timestamp: 1234567890
*     }
*   )
*
*   return [defaultCount, custom, extended]
* })
*
* await Effect.runPromise(logAnnotationExample) // => [0, ["req-123", "user-456", "1.0.0"], ["data-sync", 1234567890]]
* ```
*
* @category references
* @since 4.0.0
*/
const CurrentLogAnnotations = CurrentLogAnnotations$1;
//#endregion
//#region node_modules/effect/dist/Scope.js
/**
* Controls how long resources stay open.
*
* A scope is a lifetime boundary. Code can register cleanup effects on it, and
* closing the scope runs those cleanups with the `Exit` value that ended the
* work. Most application code uses higher-level APIs such as `Effect.scoped`
* and `Layer`, while this module is useful when code needs to create, provide,
* fork, close, or inspect scopes directly.
*
* @since 2.0.0
*/
/**
* Service tag for the active resource lifetime.
*
* **When to use**
*
* Use to access the active lifetime when registering finalizers or sharing
* resources with the surrounding scope.
*
* **Example** (Accessing the scope service)
*
* ```ts import.meta.vitest
* import { Effect, Scope } from "effect"
*
* const cleanups: Array<string> = []
* const program = Effect.gen(function*() {
*   const scope = yield* Scope.Scope
*   yield* Scope.addFinalizer(scope, Effect.sync(() => cleanups.push("Cleanup")))
* })
*
* Effect.runSync(Effect.scoped(program))
* cleanups // => ["Cleanup"]
* ```
*
* @category services
* @since 2.0.0
*/
const Scope = scopeTag;
/**
* Creates a new `Scope` synchronously without wrapping it in an `Effect`.
* This is useful when you need a scope immediately but should be used with caution
* as it doesn't provide the same safety guarantees as the `Effect`-wrapped version.
*
* **When to use**
*
* Use when a scope must be allocated synchronously and the caller will close it
* manually.
*
* **Example** (Creating a scope synchronously)
*
* ```ts import.meta.vitest
* import { Effect, Exit, Scope } from "effect"
*
* const scope = Scope.makeUnsafe("sequential")
* const cleanups: Array<string> = []
* const program = Effect.gen(function*() {
*   yield* Scope.addFinalizer(scope, Effect.sync(() => cleanups.push("Cleanup")))
*   yield* Scope.close(scope, Exit.void)
* })
*
* Effect.runSync(program)
* cleanups // => ["Cleanup"]
* ```
*
* @category constructors
* @since 4.0.0
*/
const makeUnsafe$4 = scopeMakeUnsafe;
/**
* Provides a concrete `Scope` to an effect.
*
* **When to use**
*
* Use to run an effect that requires `Scope` with a scope managed by the
* caller.
*
* **Details**
*
* Providing the scope removes the `Scope` requirement from the effect context.
*
* **Example** (Providing a scope)
*
* ```ts import.meta.vitest
* import { Effect, Exit, Scope } from "effect"
*
* const events: Array<string> = []
* const program = Effect.gen(function*() {
*   const scope = yield* Scope.Scope
*   yield* Scope.addFinalizer(scope, Effect.sync(() => events.push("cleanup")))
*   events.push("working")
* })
*
* const withScope = Effect.gen(function*() {
*   const scope = yield* Scope.make()
*   yield* Scope.provide(scope)(program)
*   yield* Scope.close(scope, Exit.void)
* })
*
* Effect.runSync(withScope)
* events // => ["working", "cleanup"]
* ```
*
* @category combinators
* @since 4.0.0
*/
const provide$1 = provideScope;
/**
* Registers an exit-aware finalizer on a scope.
*
* **When to use**
*
* Use when cleanup needs to know whether the scope closed with success,
* failure, or interruption.
*
* **Details**
*
* If the scope is open, the finalizer runs when the scope closes and receives
* the scope's exit value. If the scope is already closed, the finalizer runs
* immediately with the stored exit value.
*
* **Example** (Adding an exit-aware finalizer)
*
* ```ts import.meta.vitest
* import { Effect, Exit, Scope } from "effect"
*
* const exits: Array<Exit.Exit<unknown, unknown>> = []
* const withResource = Effect.gen(function*() {
*   const scope = yield* Scope.make()
*   yield* Scope.addFinalizerExit(scope, (exit) => Effect.sync(() => exits.push(exit)))
*   yield* Scope.close(scope, Exit.void)
* })
*
* Effect.runSync(withResource)
* exits // => [Exit.void]
* ```
*
* @category combinators
* @since 2.0.0
*/
const addFinalizerExit = scopeAddFinalizerExit;
/**
* Registers a finalizer effect on a scope.
*
* **Details**
*
* If the scope is open, the finalizer runs when the scope closes, regardless of
* whether the scope closes successfully or with an error. If the scope is
* already closed, the finalizer runs immediately.
*
* **Example** (Adding finalizers)
*
* ```ts import.meta.vitest
* import { Effect, Exit, Scope } from "effect"
*
* const events: Array<string> = []
* const program = Effect.gen(function*() {
*   const scope = yield* Scope.make()
*   yield* Scope.addFinalizer(scope, Effect.sync(() => events.push("cleanup 1")))
*   yield* Scope.addFinalizer(scope, Effect.sync(() => events.push("cleanup 2")))
*   yield* Scope.addFinalizer(scope, Effect.sync(() => events.push("cleanup 3")))
*   events.push("work")
*   yield* Scope.close(scope, Exit.void)
* })
*
* Effect.runSync(program)
* events // => ["work", "cleanup 3", "cleanup 2", "cleanup 1"]
* ```
*
* @category combinators
* @since 2.0.0
*/
const addFinalizer = scopeAddFinalizer;
/**
* Creates a closeable child scope synchronously and registers it with a parent scope.
*
* **When to use**
*
* Use when a child scope must be created synchronously and the caller controls
* both parent and child scope lifetimes.
*
* **Details**
*
* Closing the parent closes the child with the same exit value, and closing the
* child detaches it from the parent. The optional finalizer strategy configures
* the child scope and defaults to `"sequential"` when omitted.
*
* **Example** (Creating a child scope synchronously)
*
* ```ts import.meta.vitest
* import { Effect, Exit, Scope } from "effect"
*
* const cleanups: Array<string> = []
* const program = Effect.gen(function*() {
*   const parentScope = Scope.makeUnsafe("sequential")
*   const childScope = Scope.forkUnsafe(parentScope, "parallel")
*   yield* Scope.addFinalizer(parentScope, Effect.sync(() => cleanups.push("parent")))
*   yield* Scope.addFinalizer(childScope, Effect.sync(() => cleanups.push("child")))
*   yield* Scope.close(childScope, Exit.void)
*   yield* Scope.close(parentScope, Exit.void)
* })
*
* Effect.runSync(program)
* cleanups // => ["child", "parent"]
* ```
*
* @category combinators
* @since 4.0.0
*/
const forkUnsafe = scopeForkUnsafe;
/**
* Closes a scope and runs its registered finalizers.
*
* **When to use**
*
* Use to close a scope manually with a specific exit value.
*
* **Details**
*
* Finalizers run in the scope's configured order and receive the supplied
* `Exit`.
* By default, finalizers run uninterruptibly, so interrupting the closing fiber
* waits for them to finish; a finalizer can explicitly restore interruptibility.
*
* **Example** (Running scope finalizers)
*
* ```ts import.meta.vitest
* import { Effect, Exit, Scope } from "effect"
*
* const events: Array<string> = []
* const resourceManagement = Effect.gen(function*() {
*   const scope = yield* Scope.make("sequential")
*   yield* Scope.addFinalizer(scope, Effect.sync(() => events.push("database")))
*   yield* Scope.addFinalizer(scope, Effect.sync(() => events.push("file")))
*   yield* Scope.addFinalizer(scope, Effect.sync(() => events.push("memory")))
*   events.push("work")
*   yield* Scope.close(scope, Exit.succeed("Success!"))
* })
*
* Effect.runSync(resourceManagement)
* events // => ["work", "memory", "file", "database"]
* ```
*
* @category combinators
* @since 2.0.0
*/
const close = scopeClose;
//#endregion
//#region node_modules/effect/dist/Layer.js
const TypeId$27 = "~effect/Layer";
const MemoMapTypeId = "~effect/Layer/MemoMap";
const makeMemoMapEntry = (memoMap, layer) => {
	const entry = {
		observers: 0,
		deferred: makeUnsafe$5(),
		scope: makeUnsafe$4(),
		finalizer: (exit) => suspend$3(() => {
			if (--entry.observers > 0) return void_$2;
			memoMap.map.delete(layer);
			return close(entry.scope, exit);
		})
	};
	return entry;
};
const memoMapObserve = (entry, scope) => {
	if (scope.state._tag === "Closed") return false;
	entry.observers++;
	scopeAddFinalizerUnsafe(scope, {}, entry.finalizer);
	return true;
};
const LayerProto = {
	[TypeId$27]: {
		_ROut: identity,
		_E: identity,
		_RIn: identity
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
const fromBuildUnsafe = (build) => {
	const self = Object.create(LayerProto);
	self.build = build;
	return self;
};
/**
* Constructs a `Layer` from a function that uses a `MemoMap` and `Scope` to
* build the layer.
*
* **Details**
*
* The function receives a `MemoMap` for memoization and a `Scope` for resource management.
* A child scope is created, and if the build fails, the child scope is closed.
*
* **Example** (Constructing a layer from a build function)
*
* ```ts import.meta.vitest
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* const databaseLayer = Layer.fromBuild(() =>
*   Effect.sync(() =>
*     Context.make(Database, {
*       query: (sql: string) => Effect.succeed("result")
*     })
*   )
* )
*
* const program = Database.use((database) => database.query("SELECT 1"))
* Effect.runSync(Effect.provide(program, databaseLayer)) // => "result"
* ```
*
* @category constructors
* @since 4.0.0
*/
const fromBuild = (build) => fromBuildUnsafe((memoMap, scope) => {
	const layerScope = forkUnsafe(scope);
	return onExit$2(build(memoMap, layerScope), (exit) => exit._tag === "Failure" ? close(layerScope, exit) : void_$2);
});
/**
* Constructs a `Layer` from a function that uses a `MemoMap` and `Scope` to
* build the layer, with automatic memoization.
*
* **Details**
*
* This is similar to `fromBuild` but provides automatic memoization of the layer construction.
* The layer will be memoized based on the provided `MemoMap`.
*
* **Example** (Memoizing layer construction)
*
* ```ts import.meta.vitest
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* const databaseLayer = Layer.fromBuildMemo(() =>
*   Effect.sync(() =>
*     Context.make(Database, {
*       query: (sql: string) => Effect.succeed("result")
*     })
*   )
* )
*
* const program = Database.use((database) => database.query("SELECT 1"))
* Effect.runSync(Effect.provide(program, databaseLayer)) // => "result"
* ```
*
* @category constructors
* @since 4.0.0
*/
const fromBuildMemo = (build) => {
	const self = fromBuild((memoMap, scope) => memoMap.getOrElseMemoize(self, scope, build));
	return self;
};
var MemoMapImpl = class {
	get [MemoMapTypeId]() {
		return MemoMapTypeId;
	}
	parent;
	constructor(parent) {
		this.parent = parent;
	}
	map = /*#__PURE__*/ new Map();
	get(layer, scope) {
		const local = this.map.get(layer);
		if (local) {
			memoMapObserve(local, scope);
			return local.deferred.effect ?? _await(local.deferred);
		}
		return this.parent?.get(layer, scope);
	}
	getOrElseMemoize(layer, scope, build) {
		return suspend$3(() => {
			let deferred;
			return onExitPrimitive(suspend$3(() => {
				const existing = this.get(layer, scope);
				if (existing) return existing;
				const entry = makeMemoMapEntry(this, layer);
				if (!memoMapObserve(entry, scope)) return build(this, scope);
				deferred = entry.deferred;
				this.map.set(layer, entry);
				return build(this, entry.scope);
			}), (exit) => {
				if (deferred) doneUnsafe(deferred, exit);
			});
		});
	}
};
/**
* Constructs a `MemoMap` synchronously so it can be used to build additional layers.
*
* **Example** (Creating a memo map unsafely)
*
* ```ts import.meta.vitest
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* // Create a memo map for manual layer building
* const program = Effect.gen(function*() {
*   const memoMap = Layer.makeMemoMapUnsafe()
*   const scope = yield* Effect.scope
*
*   const dbLayer = Layer.succeed(Database, {
*     query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
*   })
*   const context = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)
*
*   return Context.get(context, Database)
* })
*
* const database = Effect.runSync(Effect.scoped(program))
* Effect.runSync(database.query("SELECT 1")) // => "result"
* ```
*
* @category constructors
* @since 4.0.0
*/
const makeMemoMapUnsafe = () => new MemoMapImpl();
/**
* Constructs a child `MemoMap` synchronously, allowing it to reuse layers
* already memoized in the parent while isolating any new layer allocations to
* the child map.
*
* **When to use**
*
* Use to synchronously fork a memo map for manual layer building when child
* builds should see parent memoized layers without writing newly built layers
* back to the parent.
*
* @see {@link forkMemoMap} for allocating the child memo map inside `Effect`
* @see {@link makeMemoMapUnsafe} for creating a root memo map without a parent
*
* @category constructors
* @since 4.0.0
*/
const forkMemoMapUnsafe = (parent) => new MemoMapImpl(parent);
/**
* Context service for the current `MemoMap` used in layer construction.
*
* **When to use**
*
* Use when building custom layer operations that need to access the current
* memoization map from the fiber context.
*
* **Details**
*
* This service wraps a `MemoMap` as a `Context.Service`, making it available
* for dependency injection during layer construction.
*
* @see {@link MemoMap} the memoization map type wrapped by this service
*
* @category services
* @since 3.13.0
*/
var CurrentMemoMap = class CurrentMemoMap extends (/*#__PURE__*/ Service()("effect/Layer/CurrentMemoMap")) {
	static forkOrCreate(self) {
		const current = getOrUndefined(self, CurrentMemoMap);
		return current ? forkMemoMapUnsafe(current) : makeMemoMapUnsafe();
	}
};
/**
* Builds a layer into an `Effect` value, using the specified `MemoMap` to memoize
* the layer construction.
*
* **Example** (Building layers with an explicit memo map)
*
* ```ts import.meta.vitest
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* class Logger extends Context.Service<Logger, {
*   readonly log: (msg: string) => Effect.Effect<void>
* }>()("Logger") {}
*
* const logs: Array<string> = []
*
* // Build layers with explicit memoization control
* const program = Effect.gen(function*() {
*   const memoMap = yield* Layer.makeMemoMap
*   const scope = yield* Effect.scope
*
*   // Build database layer with memoization
*   const dbLayer = Layer.succeed(Database, {
*     query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
*   })
*   const dbContext = yield* Layer.buildWithMemoMap(dbLayer, memoMap, scope)
*
*   // Build logger layer with same memoization (reuses memo if same layer)
*   const loggerLayer = Layer.succeed(Logger, {
*     log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => logs.push(msg)))
*   })
*   const loggerContext = yield* Layer.buildWithMemoMap(
*     loggerLayer,
*     memoMap,
*     scope
*   )
*
*   return {
*     database: Context.get(dbContext, Database),
*     logger: Context.get(loggerContext, Logger)
*   }
* })
*
* const services = Effect.runSync(Effect.scoped(program))
* Effect.runSync(services.logger.log("ready"))
* logs // => ["ready"]
* ```
*
* @category destructors
* @since 2.0.0
*/
const buildWithMemoMap = /*#__PURE__*/ dual(3, (self, memoMap, scope) => provideService$1(map$4(self.build(memoMap, scope), add(CurrentMemoMap, memoMap)), CurrentMemoMap, memoMap));
/**
* Builds a layer into a scoped value.
*
* **Example** (Building a layer into a context)
*
* ```ts import.meta.vitest
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* // Build a layer to get its services
* const program = Effect.gen(function*() {
*   const dbLayer = Layer.succeed(Database, {
*     query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
*   })
*
*   // Build the layer into Context - automatically manages scope and memoization
*   const context = yield* Layer.build(dbLayer)
*
*   // Extract the specific service from the built layer
*   const database = Context.get(context, Database)
*
*   return yield* database.query("SELECT * FROM users")
* })
*
* Effect.runSync(Effect.scoped(program)) // => "result"
* ```
*
* @category destructors
* @since 2.0.0
*/
const build = (self) => withFiber$1((fiber) => buildWithMemoMap(self, CurrentMemoMap.forkOrCreate(fiber.context), getUnsafe(fiber.context, Scope)));
/**
* Constructs a layer that provides a single service from an already available
* value.
*
* **When to use**
*
* Use when you need a `Layer` that provides a service from an already
* constructed implementation without effectful acquisition.
*
* **Example** (Creating a layer from a service implementation)
*
* ```ts import.meta.vitest
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* const DatabaseLayer = Layer.succeed(Database, {
*   query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`Query result: ${sql}`))
* })
* const program = Database.use((database) => database.query("SELECT 1"))
* Effect.runSync(Effect.provide(program, DatabaseLayer)) // => "Query result: SELECT 1"
* ```
*
* @see {@link sync} for constructing layers from lazy values
*
* @category constructors
* @since 2.0.0
*/
const succeed$4 = function() {
	if (arguments.length === 1) return (resource) => succeedContext(make$24(arguments[0], resource));
	return succeedContext(make$24(arguments[0], arguments[1]));
};
/**
* Constructs a layer that provides all services in an already available
* `Context`.
*
* **When to use**
*
* Use when you need a `Layer` built from an existing `Context`, including when
* you need to provide multiple services at once.
*
* **Details**
*
* This is a more general version of `succeed` that allows you to provide
* multiple services at once through a `Context`.
*
* **Example** (Providing multiple services from a context)
*
* ```ts import.meta.vitest
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* class Logger extends Context.Service<Logger, {
*   readonly log: (msg: string) => Effect.Effect<void>
* }>()("Logger") {}
*
* const logs: Array<string> = []
* const context = Context.make(Database, {
*   query: Effect.fn("Database.query")((sql: string) => Effect.succeed("result"))
* }).pipe(
*   Context.add(Logger, {
*     log: (msg: string) => Effect.sync(() => logs.push(msg))
*   })
* )
*
* const layer = Layer.succeedContext(context)
* const program = Logger.use((logger) => logger.log("ready"))
* Effect.runSync(Effect.provide(program, layer))
* logs // => ["ready"]
* ```
*
* @see {@link succeed} for providing a single service from a value
*
* @category constructors
* @since 2.0.0
*/
const succeedContext = (context) => fromBuildUnsafe(constant(succeed$6(context)));
/**
* Constructs a layer from an effect that produces a single service.
*
* **When to use**
*
* Use when you need to construct a `Layer`-provided service with an `Effect`,
* dependencies, or scoped resource acquisition.
*
* **Details**
*
* This allows you to create a `Layer` from an `Effect` that produces a service.
* The `Effect` is executed in the scope of the layer, allowing for proper
* resource management.
*
* **Example** (Creating a layer from an effect)
*
* ```ts import.meta.vitest
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* const layer = Layer.effect(Database,
*   Effect.sync(() => ({
*     query: (sql: string) => Effect.succeed(`Query: ${sql}`)
*   }))
* )
* const program = Database.use((database) => database.query("SELECT 1"))
* Effect.runSync(Effect.provide(program, layer)) // => "Query: SELECT 1"
* ```
*
* @see {@link effectContext} for effectfully providing multiple services
* @see {@link effectDiscard} for running construction work without providing services
*
* @category constructors
* @since 2.0.0
*/
const effect = function() {
	if (arguments.length === 1) return (effect) => effectImpl(arguments[0], effect);
	return effectImpl(arguments[0], arguments[1]);
};
const effectImpl = (service, effect) => effectContext(map$4(effect, (value) => make$24(service, value)));
/**
* Constructs a layer from an effect that produces all services in a `Context`.
*
* **When to use**
*
* Use when you need a `Layer` that effectfully constructs a `Context` with
* multiple services.
*
* **Details**
*
* This allows you to create a `Layer` from an effectful computation that
* returns multiple services. The `Effect` is executed in the scope of the
* layer.
*
* **Example** (Creating a layer from an effectful context)
*
* ```ts import.meta.vitest
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<
*   Database,
*   { readonly query: (sql: string) => Effect.Effect<string> }
* >()("Database") {}
*
* const layer = Layer.effectContext(
*   Effect.succeed(Context.make(Database, {
*     query: (sql: string) => Effect.succeed(`Query: ${sql}`)
*   }))
* )
* const program = Database.use((database) => database.query("SELECT 1"))
* Effect.runSync(Effect.provide(program, layer)) // => "Query: SELECT 1"
* ```
*
* @see {@link effect} for effectfully providing a single service
*
* @category constructors
* @since 2.0.0
*/
const effectContext = (effect) => fromBuildMemo((_, scope) => provide$1(effect, scope));
const mergeAllEffect = (layers, memoMap, scope) => {
	const parentScope = forkUnsafe(scope, "parallel");
	return forEach$1(layers, (layer) => layer.build(memoMap, forkUnsafe(parentScope, "sequential")), { concurrency: layers.length }).pipe(map$4((context) => mergeAll(...context)));
};
const provideWith = (self, that, f) => fromBuild((memoMap, scope) => flatMap$1(Array.isArray(that) ? mergeAllEffect(that, memoMap, scope) : that.build(memoMap, scope), (context) => self.build(memoMap, scope).pipe(provideContext$1(context), map$4((merged) => f(merged, context)))));
/**
* Feeds the output services of the dependency layer into the requirements of
* this layer, returning a layer that only provides the services from this layer.
*
* **When to use**
*
* Use when you need to hide an implementation dependency layer from callers.
*
* **Details**
*
* In `serviceLayer.pipe(Layer.provide(dependencyLayer))`, the dependency layer is
* built first and is used to satisfy the requirements of `serviceLayer`.
*
* **Example** (Providing layer dependencies)
*
* ```ts import.meta.vitest
* import { Context, Effect, Layer } from "effect"
*
* class Database extends Context.Service<Database, {
*   readonly query: (sql: string) => Effect.Effect<string>
* }>()("Database") {}
*
* class UserService extends Context.Service<UserService, {
*   readonly getUser: (id: string) => Effect.Effect<{
*     id: string
*     name: string
*   }>
* }>()("UserService") {}
*
* class Logger extends Context.Service<Logger, {
*   readonly log: (msg: string) => Effect.Effect<void>
* }>()("Logger") {}
*
* // Create dependency layers
* const databaseLayer = Layer.succeed(Database, {
*   query: Effect.fn("Database.query")((sql: string) => Effect.succeed(`DB: ${sql}`))
* })
*
* const logs: Array<string> = []
* const loggerLayer = Layer.succeed(Logger, {
*   log: Effect.fn("Logger.log")((msg: string) => Effect.sync(() => logs.push(`[LOG] ${msg}`)))
* })
*
* // UserService depends on Database and Logger
* const userServiceLayer = Layer.effect(UserService, Effect.gen(function*() {
*   const database = yield* Database
*   const logger = yield* Logger
*
*   return {
*     getUser: Effect.fn("UserService.getUser")(function*(id: string) {
*         yield* logger.log(`Looking up user ${id}`)
*         const result = yield* database.query(
*           `SELECT * FROM users WHERE id = ${id}`
*         )
*         return { id, name: result }
*       })
*   }
* }))
*
* // Provide dependencies to UserService layer
* const userServiceWithDependencies = userServiceLayer.pipe(
*   Layer.provide(Layer.mergeAll(databaseLayer, loggerLayer))
* )
*
* // Now UserService layer has no dependencies
* const program = Effect.gen(function*() {
*   const userService = yield* UserService
*   return yield* userService.getUser("123")
* }).pipe(
*   Effect.provide(userServiceWithDependencies)
* )
* Effect.runSync(program) // => { id: "123", name: "DB: SELECT * FROM users WHERE id = 123" }
* logs // => ["[LOG] Looking up user 123"]
* ```
*
* @see {@link provideMerge} for retaining the dependency services
*
* @category providing services
* @since 2.0.0
*/
const provide = /*#__PURE__*/ dual(2, (self, that) => provideWith(self, that, identity));
//#endregion
//#region node_modules/effect/dist/Clock.js
/**
* Returns an Effect that succeeds with the current Unix time in milliseconds.
*
* **When to use**
*
* Use to create wall-clock timestamps from the active `Clock` service with
* millisecond precision.
*
* **Gotchas**
*
* The value can move backward or forward when the system wall clock is
* corrected, so it is not suitable for measuring elapsed time.
*
* **Example** (Reading milliseconds)
*
* ```ts import.meta.vitest
* import { Clock, Effect } from "effect"
*
* const testClock: Clock.Clock = {
*   currentTimeMillisUnsafe: () => 1_000,
*   currentTimeMillis: Effect.succeed(1_000),
*   monotonicTimeNanosUnsafe: () => 1_000_000_000n,
*   monotonicTimeNanos: Effect.succeed(1_000_000_000n),
*   currentTimeNanosUnsafe: () => 1_000_000_000n,
*   currentTimeNanos: Effect.succeed(1_000_000_000n),
*   sleep: () => Effect.void
* }
*
* await Effect.runPromise(Effect.provideService(Clock.currentTimeMillis, Clock.Clock, testClock)) // => 1_000
* ```
*
* @see {@link currentTimeNanos} for nanosecond precision
* @see {@link monotonicTimeNanos} for measuring elapsed time
* @see {@link clockWith} for accessing the full Clock service
*
* @category accessors
* @since 2.0.0
*/
const currentTimeMillis = currentTimeMillis$1;
//#endregion
//#region node_modules/effect/dist/internal/dateTime.js
/** @internal */
const TypeId$26 = "~effect/DateTime";
/** @internal */
const TimeZoneTypeId = "~effect/DateTime/TimeZone";
const Proto$12 = {
	[TypeId$26]: TypeId$26,
	pipe() {
		return pipeArguments(this, arguments);
	},
	[NodeInspectSymbol]() {
		return this.toString();
	},
	toJSON() {
		return toDateUtc$1(this).toJSON();
	}
};
const ProtoUtc = {
	...Proto$12,
	_tag: "Utc",
	[symbol$1]() {
		return number$1(this.epochMilliseconds);
	},
	[symbol](that) {
		return isDateTime$1(that) && that._tag === "Utc" && this.epochMilliseconds === that.epochMilliseconds;
	},
	toString() {
		return `DateTime.Utc(${toDateUtc$1(this).toJSON()})`;
	}
};
({ ...Proto$12 });
const ProtoTimeZone = {
	[TimeZoneTypeId]: TimeZoneTypeId,
	[NodeInspectSymbol]() {
		return this.toString();
	}
};
({ ...ProtoTimeZone });
({ ...ProtoTimeZone });
/** @internal */
const isDateTime$1 = (u) => hasProperty(u, TypeId$26);
const makeUtc = (epochMillis) => {
	const self = Object.create(ProtoUtc);
	self.epochMilliseconds = epochMillis;
	Object.defineProperty(self, "partsUtc", {
		value: void 0,
		enumerable: false,
		writable: true
	});
	return self;
};
/** @internal */
const fromDateUnsafe = (date) => {
	const epochMillis = date.getTime();
	if (Number.isNaN(epochMillis)) throw new IllegalArgumentError("Invalid date");
	return makeUtc(epochMillis);
};
/** @internal */
const makeUnsafe$3 = (input) => {
	if (isDateTime$1(input)) return input;
	else if (input instanceof Date) return fromDateUnsafe(input);
	else if (typeof input === "object") {
		if ("epochMilliseconds" in input) return fromDateUnsafe(new Date(input.epochMilliseconds));
		const date = /* @__PURE__ */ new Date(0);
		setPartsDate(date, input);
		return fromDateUnsafe(date);
	} else if (typeof input === "string" && !hasZone(input)) return fromDateUnsafe(/* @__PURE__ */ new Date(input + "Z"));
	return fromDateUnsafe(new Date(input));
};
/**
* Detects whether a date string already contains timezone info.
* Without a zone, `new Date("2024-01-01T12:00:00")` is parsed as local time,
* so `makeUnsafe` appends "Z" to force UTC interpretation.
* This check prevents appending "Z" to strings that already have a zone
* (e.g. "2024-01-01T12:00:00Z", "...+05:30", "...GMT"), which would produce invalid dates.
*/
const hasZone = (input) => /Z|GMT|[+-]\d{2}$|[+-]\d{2}:?\d{2}$|\]$/.test(input);
/** @internal */
const make$20 = /*#__PURE__*/ liftThrowable(makeUnsafe$3);
/** @internal */
const now$1 = /*#__PURE__*/ map$4(currentTimeMillis, makeUtc);
/** @internal */
const toDateUtc$1 = (self) => new Date(self.epochMilliseconds);
const setPartsDate = (date, parts) => {
	if (parts.year !== void 0 || parts.month !== void 0 || parts.day !== void 0) date.setUTCFullYear(parts.year ?? date.getUTCFullYear(), parts.month !== void 0 ? parts.month - 1 : date.getUTCMonth(), parts.day ?? date.getUTCDate());
	if (parts.weekDay !== void 0) {
		const diff = parts.weekDay - date.getUTCDay();
		date.setUTCDate(date.getUTCDate() + diff);
	}
	if (parts.hour !== void 0) date.setUTCHours(parts.hour);
	if (parts.minute !== void 0) date.setUTCMinutes(parts.minute);
	if (parts.second !== void 0) date.setUTCSeconds(parts.second);
	if (parts.millisecond !== void 0) date.setUTCMilliseconds(parts.millisecond);
};
/** @internal */
const formatIso$1 = (self) => toDateUtc$1(self).toISOString();
//#endregion
//#region node_modules/effect/dist/internal/random.js
/** @internal */
const nextBetween = (min, max, draw) => {
	const value = draw * (max - min) + min;
	if (value !== max || min >= max || !Number.isFinite(max)) return value;
	if (max === 0) return -Number.MIN_VALUE;
	const view = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(8));
	view.setFloat64(0, max);
	const bits = view.getBigUint64(0);
	view.setBigUint64(0, max > 0 ? bits - BigInt(1) : bits + BigInt(1));
	return view.getFloat64(0);
};
//#endregion
//#region node_modules/effect/dist/Pull.js
/**
* Models one low-level pull step for stream-like consumers.
*
* A `Pull<A, E, Done, R>` is an `Effect` that can produce one `A`, fail with an
* ordinary error `E`, or signal end-of-input with `Cause.Done<Done>`. The
* separate done signal lets low-level consumers distinguish normal completion
* from failure. This module includes type extractors and helpers for detecting,
* filtering, catching, converting, and matching done signals separately from
* ordinary failures.
*
* @since 4.0.0
*/
/**
* Handles `Cause.Done` failures in an effect while leaving ordinary failures
* in the error channel.
*
* **When to use**
*
* Use to recover from a `Cause.Done` completion signal in an effect, such as
* turning a pull leftover value into a successful recovery effect while
* preserving ordinary failures.
*
* **Details**
*
* The handler receives the done leftover value and may recover with a new
* effect. Non-done errors are preserved.
*
* @see {@link matchEffect} for handling success, ordinary failure, and done outcomes explicitly
* @see {@link filterDoneLeftover} for extracting a done leftover from an existing `Cause`
*
* @category error handling
* @since 4.0.0
*/
const catchDone = /*#__PURE__*/ dual(2, (effect, f) => catchCauseFilter$1(effect, filterDoneLeftover, (l) => f(l)));
/**
* Checks whether a Cause contains any done errors.
*
* **When to use**
*
* Use when you need to test whether a pull failure cause represents normal
* completion and only need a boolean result.
*
* @see {@link isDoneFailure} for checking a single `Cause.Reason`
* @see {@link filterDone} for extracting the `Cause.Done` value from a `Cause`
* @see {@link filterNoDone} for selecting causes with no done failures
*
* @category predicates
* @since 4.0.0
*/
const isDoneCause = (cause) => cause.reasons.some(isDoneFailure);
/**
* Checks whether a `Cause.Reason` is a `Fail` reason whose error is a
* `Cause.Done` signal.
*
* **When to use**
*
* Use when you need to identify done completion reasons while traversing
* `cause.reasons`, before handling ordinary failures.
*
* @see {@link isDoneCause} for checking an entire `Cause` for any done reason
* @see {@link filterDone} for extracting the `Cause.Done` value from a `Cause`
*
* @category guards
* @since 4.0.0
*/
const isDoneFailure = (failure) => failure._tag === "Fail" && isDone(failure.error);
/**
* Finds a `Cause.Done` failure in a `Cause`.
*
* **When to use**
*
* Use to separate `Cause.Done` completion from ordinary causes while preserving
* the typed done value.
*
* **Details**
*
* Returns a successful `Result` with the `Cause.Done` value when the cause
* contains a done signal and no other failures besides interruptions. When the
* done signal was merged with a real failure (for example a failing
* finalizer), the `Result` fails with the remaining cause, stripped of the
* done signal. Without a done signal the `Result` fails with the original
* cause.
*
* @category filtering
* @since 4.0.0
*/
const filterDone = (cause) => {
	let done;
	let hasFailure = false;
	for (const reason of cause.reasons) if (isDoneFailure(reason)) done ??= reason.error;
	else if (reason._tag !== "Interrupt") hasFailure = true;
	if (done === void 0) return fail$6(cause);
	return hasFailure ? fail$6(fromReasons(cause.reasons.filter((reason) => !isDoneFailure(reason)))) : succeed$7(done);
};
/**
* Filters a Cause to extract the leftover value from done errors.
*
* **When to use**
*
* Use to extract only the leftover value carried by a `Cause.Done` completion
* signal.
*
* @category filtering
* @since 4.0.0
*/
const filterDoneLeftover = (cause) => {
	const done = filterDone(cause);
	return isFailure(done) ? done : succeed$7(done.success.value);
};
/**
* Converts a `Cause` into an `Exit`, treating `Cause.Done` as successful
* completion.
*
* **When to use**
*
* Use to produce an `Exit` for finalizing a low-level pull workflow when a
* `Cause.Done` signal should be treated as success and any remaining cause
* should fail.
*
* **Details**
*
* If the done signal is the only failure in the cause, its leftover becomes
* the successful value. Otherwise the non-done cause becomes the failure
* cause.
*
* @see {@link filterDone} for extracting the done signal without converting the cause to an `Exit`
* @see {@link matchEffect} for handling `Pull` success, failure, and done outcomes directly
*
* @category converting
* @since 4.0.0
*/
const doneExitFromCause = (cause) => {
	const halt = filterDone(cause);
	return !isFailure(halt) ? succeed$5(halt.success.value) : failCause$4(halt.failure);
};
/**
* Pattern matches on a Pull, handling success, failure, and done cases.
*
* **When to use**
*
* Use to handle all three `Pull` outcomes with effectful handlers.
*
* **Example** (Matching Pull outcomes)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Pull } from "effect"
*
* const pull = Cause.done("stream ended")
*
* const result = Pull.matchEffect(pull, {
*   onSuccess: (value) => Effect.succeed(`Got value: ${value}`),
*   onFailure: (cause) => Effect.succeed(`Got error: ${cause}`),
*   onDone: (leftover) => Effect.succeed(`Stream halted with: ${leftover}`)
* })
*
* await Effect.runPromise(result) // => "Stream halted with: stream ended"
* ```
*
* @category pattern matching
* @since 4.0.0
*/
const matchEffect = /*#__PURE__*/ dual(2, (self, options) => matchCauseEffect$1(self, {
	onSuccess: options.onSuccess,
	onFailure: (cause) => {
		const halt = filterDone(cause);
		return !isFailure(halt) ? options.onDone(halt.success.value) : options.onFailure(halt.failure);
	}
}));
//#endregion
//#region node_modules/effect/dist/Effect.js
/**
* Checks whether a value is an `Effect`.
*
* **Example** (Checking whether a value is an Effect)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* Effect.isEffect(Effect.succeed(1)) // => true
* Effect.isEffect("hello") // => false
* ```
*
* @category guards
* @since 2.0.0
*/
const isEffect = isEffect$1;
/**
* Combines an iterable or record of effects into one effect whose success shape
* follows the input.
*
* **When to use**
*
* Use to run a known collection of effects and collect results in the same
* tuple, iterable, or record shape.
*
* **Details**
*
* Tuple and iterable inputs collect results in order. Record inputs collect
* results under the same keys. By default, the combined effect fails on the
* first failure; with concurrent execution, effects that have already started
* may be interrupted, while effects not yet started are skipped.
*
* Options:
*
* Use `concurrency` to control sequential or concurrent execution. Use
* `mode: "result"` to run every effect and collect each success or failure as a
* `Result` in the same output shape. Use `discard: true` to ignore successful
* values and return `void`.
*
* **Example** (Collecting tuple results in order)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const tupleOfEffects = [
*   Effect.succeed(42),
*   Effect.succeed("Hello")
* ] as const
*
* //      ┌─── Effect<[number, string], never, never>
* //      ▼
* const resultsAsTuple = Effect.all(tupleOfEffects)
*
* await Effect.runPromise(resultsAsTuple) // => [42, "Hello"]
* ```
*
* **Example** (Collecting iterable results in order)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const iterableOfEffects: Iterable<Effect.Effect<number>> = [1, 2, 3].map(
*   Effect.succeed
* )
*
* //      ┌─── Effect<number[], never, never>
* //      ▼
* const resultsAsArray = Effect.all(iterableOfEffects)
*
* await Effect.runPromise(resultsAsArray) // => [1, 2, 3]
* ```
*
* **Example** (Collecting struct results by key)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const structOfEffects = {
*   a: Effect.succeed(42),
*   b: Effect.succeed("Hello")
* }
*
* //      ┌─── Effect<{ a: number; b: string; }, never, never>
* //      ▼
* const resultsAsStruct = Effect.all(structOfEffects)
*
* await Effect.runPromise(resultsAsStruct) // => { a: 42, b: "Hello" }
* ```
*
* **Example** (Collecting record results by key)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const recordOfEffects: Record<string, Effect.Effect<number>> = {
*   key1: Effect.succeed(1),
*   key2: Effect.succeed(2)
* }
*
* //      ┌─── Effect<{ [x: string]: number; }, never, never>
* //      ▼
* const resultsAsRecord = Effect.all(recordOfEffects)
*
* await Effect.runPromise(resultsAsRecord) // => { key1: 1, key2: 2 }
* ```
*
* **Example** (Stopping on the first failure)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
* const output: Array<unknown> = []
* const record = (value: unknown) => Effect.sync(() => { output.push(value) })
*
* const program = Effect.all([
*   Effect.succeed("Task1").pipe(Effect.tap(record)),
*   Effect.fail("Task2: Oh no!").pipe(Effect.tap(record)),
*   // Won't execute due to earlier failure
*   Effect.succeed("Task3").pipe(Effect.tap(record))
* ])
*
* const outcome = await Effect.runPromiseExit(program)
* const observation = [output, outcome] // => [["Task1"], Exit.fail("Task2: Oh no!")]
* ```
*
* @see {@link forEach} for iterating over elements and applying an effect.
* @category collecting
* @since 2.0.0
*/
const all$1 = all$2;
/**
* Executes an effectful operation for each element in an `Iterable`.
*
* **When to use**
*
* Use to traverse an iterable with an effectful function while preserving
* element order in the collected results.
*
* **Details**
*
* The `forEach` function applies a provided operation to each element in the
* iterable, producing a new effect that returns an array of results.
*
* If any effect fails, the iteration stops immediately (short-circuiting), and
* the error is propagated.
*
* Concurrency:
*
* The `concurrency` option controls how many operations are performed
* concurrently. By default, the operations are performed sequentially.
*
* Discarding Results:
*
* If the `discard` option is set to `true`, the intermediate results are not
* collected, and the final result of the operation is `void`.
*
* **Example** (Mapping over an iterable with effects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const result = Effect.forEach(
*   [1, 2, 3, 4, 5],
*   (n, index) =>
*     Effect.sync(() => { output.push(`Currently at index ${index}`) }).pipe(Effect.as(n * 2))
* )
*
* void output.push(await Effect.runPromise(result))
* output // => ["Currently at index 0", "Currently at index 1", "Currently at index 2", "Currently at index 3", "Currently at index 4", [2, 4, 6, 8, 10]]
* ```
*
* **Example** (Running effects without collecting results)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* // Apply effects but discard the results
* const result = Effect.forEach(
*   [1, 2, 3, 4, 5],
*   (n, index) =>
*     Effect.sync(() => { output.push(`Currently at index ${index}`) }).pipe(Effect.as(n * 2)),
*   { discard: true }
* )
*
* void output.push(await Effect.runPromise(result))
* output // => ["Currently at index 0", "Currently at index 1", "Currently at index 2", "Currently at index 3", "Currently at index 4", undefined]
* ```
*
* @see {@link all} for combining multiple effects into one.
* @category collecting
* @since 2.0.0
*/
const forEach = forEach$1;
/**
* Executes a body effect repeatedly while a condition holds true.
*
* **Example** (Repeating an effectful loop)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* let counter = 0
*
* const program = Effect.whileLoop({
*   while: () => counter < 5,
*   body: () => Effect.sync(() => ++counter),
*   step: (n) => void output.push(`Current count: ${n}`)
* })
*
* await Effect.runPromise(program)
* output // => ["Current count: 1", "Current count: 2", "Current count: 3", "Current count: 4", "Current count: 5"]
* ```
*
* @category repetition
* @since 2.0.0
*/
const whileLoop = whileLoop$1;
/**
* Creates an `Effect` that represents an asynchronous computation guaranteed to
* succeed.
*
* **When to use**
*
* Use to convert a `Promise` into an `Effect` when the async operation is
* guaranteed to succeed and will not reject.
*
* **Details**
*
* An optional `AbortSignal` can be provided to allow for interruption of the
* wrapped `Promise` API.
*
* **Gotchas**
*
* The `Promise` must not reject. If it rejects, the rejection is treated as a
* defect, not as a typed failure. Use `tryPromise` when rejection is expected.
*
* Interruption aborts the provided `AbortSignal`, but the underlying
* asynchronous operation only stops if it observes that signal.
*
* **Example** (Wrapping a non-rejecting Promise)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const succeedAsync = (message: string) =>
*   Effect.promise<string>(() => Promise.resolve(message))
*
* //      ┌─── Effect<string, never, never>
* //      ▼
* const program = succeedAsync("Async operation completed successfully!")
* await Effect.runPromise(program) // => "Async operation completed successfully!"
* ```
*
* @see {@link tryPromise} for a version that can handle failures.
* @category constructors
* @since 2.0.0
*/
const promise = promise$1;
/**
* Creates an `Effect` from an asynchronous computation that may throw or
* reject, mapping failures into the error channel.
*
* **When to use**
*
* Use when you need to perform asynchronous operations that might fail, such
* as fetching data from an API, and want thrown exceptions or rejected promises
* captured as Effect errors.
*
* **Details**
*
* The promise thunk is evaluated when the effect runs. If it returns a promise
* that resolves, the resolved value becomes the success value. If the thunk
* throws before returning a promise, or if the returned promise rejects, the
* thrown or rejected value is mapped into the error channel.
*
* Passing the thunk directly maps failures to {@link Cause.UnknownError}.
* Passing `{ try, catch }` uses `catch` to map failures to an error of type
* `E`.
*
* The thunk receives an `AbortSignal` that is aborted if the effect is
* interrupted. The underlying asynchronous operation only stops if it observes
* that signal.
*
* **Gotchas**
*
* If `catch` throws while mapping the error, that thrown value is treated as a
* defect. Return the error value you want in the error channel instead of
* throwing it.
*
* **Example** (Wrapping a fetch request that may fail)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const getTodo = (id: number) =>
*   Effect.tryPromise(() => Promise.resolve({ id, completed: false }))
*
* //      ┌─── Effect<{ id: number; completed: boolean }, UnknownError, never>
* //      ▼
* const program = getTodo(1)
* await Effect.runPromise(program) // => { id: 1, completed: false }
* ```
*
* **Example** (Mapping Promise rejections to a tagged error)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* class TodoFetchError extends Data.TaggedError("TodoFetchError")<{ readonly cause: unknown }> {}
*
* const getTodo = (id: number) =>
*   Effect.tryPromise({
*     try: () => Promise.reject(`Todo ${id} is unavailable`),
*     // remap the error
*     catch: (cause) => new TodoFetchError({ cause })
*   })
*
* //      ┌─── Effect<never, TodoFetchError, never>
* //      ▼
* const program = Effect.flip(getTodo(1))
* const error = await Effect.runPromise(program)
* error._tag // => "TodoFetchError"
* ```
*
* @see {@link promise} if the effectful computation is asynchronous and does not throw errors.
* @category constructors
* @since 2.0.0
*/
const tryPromise = tryPromise$1;
/**
* Creates an `Effect` that always succeeds with a given value.
*
* **When to use**
*
* Use when an effect should complete successfully with a specific value without any errors
* or external dependencies.
*
* **Example** (Creating a successful effect)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* // Creating an effect that represents a successful scenario
* //
* //      ┌─── Effect<number, never, never>
* //      ▼
* const success = Effect.succeed(42)
* Effect.runSync(success) // => 42
* ```
*
* @see {@link fail} to create an effect that represents a failure.
* @category constructors
* @since 2.0.0
*/
const succeed$3 = succeed$6;
/**
* Creates an `Effect` lazily, delaying construction until it is needed.
*
* **When to use**
*
* Use when you need to defer the evaluation of an effect until it is required.
*
* **Details**
*
* `suspend` takes a thunk that represents an effect and delays creating it
* until the suspended effect is evaluated. This is useful for optimizing
* expensive computations, managing circular dependencies such as recursive
* functions, and helping TypeScript unify return types when branches construct
* different effects. Any side effects or scoped captures inside the thunk are
* re-executed on each invocation.
*
* **Example** (Lazily evaluating side effects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* let i = 0
*
* const bad = Effect.succeed(i++)
*
* const good = Effect.suspend(() => Effect.succeed(i++))
*
* Effect.runSync(bad) // => 0
* Effect.runSync(bad) // => 0
*
* Effect.runSync(good) // => 1
* Effect.runSync(good) // => 2
* ```
*
* **Example** (Suspending recursive Fibonacci evaluation)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const blowsUp = (n: number): Effect.Effect<number> =>
*   n < 2
*     ? Effect.succeed(1)
*     : Effect.zipWith(blowsUp(n - 1), blowsUp(n - 2), (a, b) => a + b)
*
* // console.log(Effect.runSync(blowsUp(32)))
* // crash: JavaScript heap out of memory
*
* const allGood = (n: number): Effect.Effect<number> =>
*   n < 2
*     ? Effect.succeed(1)
*     : Effect.zipWith(
*         Effect.suspend(() => allGood(n - 1)),
*         Effect.suspend(() => allGood(n - 2)),
*         (a, b) => a + b
*       )
*
* Effect.runSync(allGood(16)) // => 1597
* ```
*
* **Example** (Helping TypeScript infer recursive effect types)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* //   Without suspend, TypeScript may struggle with type inference.
* //   Inferred type:
* //     (a: number, b: number) =>
* //       Effect<never, Error, never> | Effect<number, never, never>
* const withoutSuspend = (a: number, b: number) =>
*   b === 0
*     ? Effect.fail(new Error("Cannot divide by zero"))
*     : Effect.succeed(a / b)
*
* //   Using suspend to unify return types.
* //   Inferred type:
* //     (a: number, b: number) => Effect<number, Error, never>
* const withSuspend = (a: number, b: number) =>
*   Effect.suspend(() =>
*     b === 0
*       ? Effect.fail(new Error("Cannot divide by zero"))
*       : Effect.succeed(a / b)
*   )
*
* Effect.runSync(withSuspend(6, 2)) // => 3
* ```
*
* @category constructors
* @since 2.0.0
*/
const suspend$2 = suspend$3;
/**
* Creates an `Effect` that represents a synchronous side-effectful computation.
*
* **When to use**
*
* Use when you need to wrap a synchronous side-effectful operation that is not
* expected to throw.
*
* **Details**
*
* The provided function is evaluated lazily when the effect runs.
*
* **Gotchas**
*
* The function must not throw. If it throws, the thrown value is treated as a
* defect, not as a typed failure. Use `try` when throwing is expected.
*
* **Example** (Capturing synchronous logging in an Effect)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const log = (message: string) =>
*   Effect.sync(() => {
*     void output.push(message) // side effect
*   })
*
* //      ┌─── Effect<void, never, never>
* //      ▼
* const program = log("Hello, World!")
* Effect.runSync(program)
* output // => ["Hello, World!"]
* ```
*
* @see {@link try_ | try} for a version that can handle failures.
* @category constructors
* @since 2.0.0
*/
const sync = sync$1;
const void_ = void_$2;
/**
* Creates an `Effect` from a callback-based asynchronous API.
*
* **When to use**
*
* Use when you need to integrate APIs that complete through callbacks instead
* of returning a `Promise`.
*
* **Details**
*
* The registration function receives a `resume` callback and, when requested,
* an `AbortSignal`. Call `resume` at most once with the effect that should
* complete the fiber; later calls are ignored. Return an optional cleanup
* effect from the registration function to run if the fiber is interrupted.
*
* **Example** (Integrating callback APIs)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const fromCallback = (message: string) =>
*   Effect.callback<void>((resume) => {
*     queueMicrotask(() => {
*       void output.push(message)
*       resume(Effect.void)
*     })
*   })
*
* await Effect.runPromise(fromCallback("callback completed"))
* output // => ["callback completed"]
* ```
*
* @category constructors
* @since 4.0.0
*/
const callback = callback$1;
/**
* Provides a way to write effectful code using generator functions, simplifying
* control flow and error handling.
*
* **When to use**
*
* Use when you want to write effectful code that looks and behaves like
* synchronous code, while still handling asynchronous tasks, errors, and complex
* control flow such as loops and conditions.
*
* Generator functions work similarly to `async/await` but keep errors,
* requirements, and interruption in the Effect type. You can `yield*` values
* from effects and return the final result at the end.
*
* **Example** (Sequencing effects with generators)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* class DiscountRateError extends Data.TaggedError("DiscountRateError")<{}> {}
*
* const addServiceCharge = (amount: number) => amount + 1
*
* const applyDiscount = (
*   total: number,
*   discountRate: number
* ): Effect.Effect<number, DiscountRateError> =>
*   discountRate === 0
*     ? Effect.fail(new DiscountRateError())
*     : Effect.succeed(total - (total * discountRate) / 100)
*
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* const fetchDiscountRate = Effect.promise(() => Promise.resolve(5))
*
* export const program = Effect.gen(function*() {
*   const transactionAmount = yield* fetchTransactionAmount
*   const discountRate = yield* fetchDiscountRate
*   const discountedAmount = yield* applyDiscount(
*     transactionAmount,
*     discountRate
*   )
*   const finalAmount = addServiceCharge(discountedAmount)
*   return `Final amount to charge: ${finalAmount}`
* })
*
* await Effect.runPromise(program) // => "Final amount to charge: 96"
* ```
*
* @category constructors
* @since 2.0.0
*/
const gen = gen$1;
/**
* Creates an `Effect` that represents a recoverable error.
*
* **When to use**
*
* Use to explicitly signal a recoverable error in an `Effect`.
*
* **Details**
*
* The error keeps propagating unless it is handled. You can handle tagged
* errors with functions like {@link catchTag} or {@link catchTags}.
*
* **Example** (Creating a failed effect)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* class OperationFailedError extends Data.TaggedError("OperationFailedError")<{}> {}
*
* //      ┌─── Effect<never, OperationFailedError, never>
* //      ▼
* const failure = Effect.fail(
*   new OperationFailedError()
* )
* Effect.runSync(Effect.flip(failure))._tag // => "OperationFailedError"
* ```
*
* @see {@link succeed} to create an effect that represents a successful value.
* @category constructors
* @since 2.0.0
*/
const fail$3 = fail$5;
/**
* Creates an `Effect` that represents a failure with a specific `Cause`.
*
* **When to use**
*
* Use when you already have a full `Cause` and need to preserve defects,
* interruptions, annotations, or combined failures in the effect's failure
* channel.
*
* **Details**
*
* This function allows you to create effects that fail with complex error
* structures, including multiple errors, defects, interruptions, and more.
*
* **Example** (Failing with a full Cause)
*
* ```ts import.meta.vitest
* import { Cause, Effect } from "effect"
*
* const program = Effect.failCause(
*   Cause.fail("Network error")
* )
*
* Effect.runSync(Effect.flip(program)) // => "Network error"
* ```
*
* @category constructors
* @since 2.0.0
*/
const failCause$2 = failCause$5;
/**
* Creates an `Effect` that represents a failure with a `Cause` computed lazily.
*
* **When to use**
*
* Use to defer computing a full `Cause` until the effect is run.
*
* **Details**
*
* The cause-producing function is evaluated each time the effect is executed.
*
* **Example** (Lazily creating a Cause)
*
* ```ts import.meta.vitest
* import { Cause, Effect } from "effect"
*
* const program = Effect.failCauseSync(() =>
*   Cause.fail("Error computed at runtime")
* )
*
* Effect.runSync(Effect.flip(program)) // => "Error computed at runtime"
* ```
*
* @category constructors
* @since 2.0.0
*/
const failCauseSync = failCauseSync$1;
/**
* Creates an effect that terminates a fiber with a specified error.
*
* **When to use**
*
* Use when you need an `Effect` to report an unrecoverable defect instead of a
* typed error.
*
* **Details**
*
* The `die` function is used to signal a defect, which represents a critical
* and unexpected error in the code. When invoked, it produces an effect that
* does not handle the error and instead terminates the fiber.
*
* The error channel of the resulting effect is of type `never`, indicating that
* it cannot recover from this failure.
*
* **Example** (Failing on division by zero)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
*
* const defect = new Error("Cannot divide by zero")
* const divide = (a: number, b: number) =>
*   b === 0
*     ? Effect.die(defect)
*     : Effect.succeed(a / b)
*
* //      ┌─── Effect<number, never, never>
* //      ▼
* const program = divide(1, 0)
*
* Effect.runSyncExit(program) // => Exit.die(defect)
* ```
*
* @category constructors
* @since 2.0.0
*/
const die = die$2;
const try_ = try_$1;
/**
* Provides access to the current fiber within an effect computation.
*
* **Example** (Reading the current fiber)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const program = Effect.withFiber((fiber) => Effect.succeed(typeof fiber.id))
*
* Effect.runSync(program) // => "number"
* ```
*
* @category constructors
* @since 4.0.0
*/
const withFiber = withFiber$1;
/**
* Converts a `Result` to an `Effect`.
*
* **Example** (Converting a Result into an Effect)
*
* ```ts import.meta.vitest
* import { Effect, Result } from "effect"
* const output: Array<unknown> = []
*
* const success = Result.succeed(42)
* const failure = Result.fail("Something went wrong")
*
* const effect1 = Effect.fromResult(success)
* const effect2 = Effect.fromResult(failure)
*
* void output.push(Effect.runSync(effect1))
* void output.push(Effect.runSync(Effect.flip(effect2)))
* output // => [42, "Something went wrong"]
* ```
*
* @category converting
* @since 4.0.0
*/
const fromResult = fromResult$1;
/**
* Chains effects to produce new `Effect` instances, useful for combining
* operations that depend on previous results.
*
* **When to use**
*
* Use when you need to chain multiple effects, ensuring that each
* step produces a new `Effect` while flattening any nested effects that may
* occur.
*
* **Details**
*
* `flatMap` lets you sequence effects so that the result of one effect can be
* used in the next step. It is similar to `flatMap` used with arrays but works
* specifically with `Effect` instances, allowing you to avoid deeply nested
* effect structures.
*
* Since effects are immutable, `flatMap` always returns a new effect instead of
* changing the original one.
*
* **Example** (Choosing flatMap syntax variants)
*
* ```ts import.meta.vitest
* import { Effect, pipe } from "effect"
* const output: Array<unknown> = []
*
* const myEffect = Effect.succeed(1)
* const transformation = (n: number) => Effect.succeed(n + 1)
*
* const flatMappedWithPipe = pipe(myEffect, Effect.flatMap(transformation))
* const flatMappedWithDataFirst = Effect.flatMap(myEffect, transformation)
* const flatMappedWithMethod = myEffect.pipe(Effect.flatMap(transformation))
*
* void output.push(Effect.runSync(Effect.all([
*   flatMappedWithPipe,
*   flatMappedWithDataFirst,
*   flatMappedWithMethod
* ])))
* output // => [[2, 2, 2]]
* ```
*
* **Example** (Sequencing dependent effects)
*
* ```ts import.meta.vitest
* import { Data, Effect, pipe } from "effect"
*
* class DiscountRateError extends Data.TaggedError("DiscountRateError")<{}> {}
*
* // Function to apply a discount safely to a transaction amount
* const applyDiscount = (
*   total: number,
*   discountRate: number
* ): Effect.Effect<number, DiscountRateError> =>
*   discountRate === 0
*     ? Effect.fail(new DiscountRateError())
*     : Effect.succeed(total - (total * discountRate) / 100)
*
* // Simulated asynchronous task to fetch a transaction amount from database
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* // Chaining the fetch and discount application using `flatMap`
* const finalAmount = pipe(
*   fetchTransactionAmount,
*   Effect.flatMap((amount) => applyDiscount(amount, 5))
* )
*
* await Effect.runPromise(finalAmount) // => 95
* ```
*
* @see {@link tap} for a version that ignores the result of the effect.
* @category sequencing
* @since 2.0.0
*/
const flatMap = flatMap$1;
/**
* Flattens an `Effect` that produces another `Effect` into a single effect.
*
* **Example** (Flattening nested effects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const nested = Effect.succeed(Effect.succeed("hello"))
*
* const program = Effect.gen(function*() {
*   const value = yield* Effect.flatten(nested)
*   yield* Effect.sync(() => { output.push(value) })
* })
*
* Effect.runSync(program)
* output // => ["hello"]
* ```
*
* @category sequencing
* @since 2.0.0
*/
const flatten = flatten$1;
/**
* Runs this effect and then runs another effect, optionally using the first
* effect's success value to choose the next effect.
*
* **When to use**
*
* Use when you need one effect to run after another and the second effect may
* depend on the first effect's success value.
*
* **Details**
*
* When the second argument is an `Effect`, the first success value is discarded
* and the returned effect produces the second effect's value. When the second
* argument is a function, it receives the first success value and must return
* the next `Effect`.
*
* Failures or requirements from either effect are preserved in the returned
* effect.
*
* **Example** (Choosing andThen syntax variants)
*
* ```ts import.meta.vitest
* import { Effect, pipe } from "effect"
* const output: Array<unknown> = []
*
* const myEffect = Effect.succeed(1)
* const anotherEffect = Effect.succeed("done")
*
* const transformedWithPipe = pipe(myEffect, Effect.andThen(anotherEffect))
* const transformedWithDataFirst = Effect.andThen(myEffect, anotherEffect)
* const transformedWithMethod = myEffect.pipe(Effect.andThen(anotherEffect))
*
* void output.push(Effect.runSync(Effect.all([
*   transformedWithPipe,
*   transformedWithDataFirst,
*   transformedWithMethod
* ])))
* output // => [['done', 'done', 'done']]
* ```
*
* **Example** (Sequencing a discount calculation after fetching a total)
*
* ```ts import.meta.vitest
* import { Data, Effect, pipe } from "effect"
*
* class DiscountRateError extends Data.TaggedError("DiscountRateError")<{}> {}
*
* // Function to apply a discount safely to a transaction amount
* const applyDiscount = (
*   total: number,
*   discountRate: number
* ): Effect.Effect<number, DiscountRateError> =>
*   discountRate === 0
*     ? Effect.fail(new DiscountRateError())
*     : Effect.succeed(total - (total * discountRate) / 100)
*
* // Simulated asynchronous task to fetch a transaction amount from database
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* // Using Effect.map and Effect.flatMap
* const result1 = pipe(
*   fetchTransactionAmount,
*   Effect.map((amount) => amount * 2),
*   Effect.flatMap((amount) => applyDiscount(amount, 5))
* )
*
* await Effect.runPromise(result1) // => 190
*
* // Using Effect.andThen
* const result2 = pipe(
*   fetchTransactionAmount,
*   Effect.andThen((amount) => Effect.succeed(amount * 2)),
*   Effect.andThen((amount) => applyDiscount(amount, 5))
* )
*
* await Effect.runPromise(result2) // => 190
* ```
*
* @category sequencing
* @since 2.0.0
*/
const andThen = andThen$1;
/**
* Runs a side effect with the result of an effect without changing the original
* value.
*
* **When to use**
*
* Use when you need to run an effectful observation, such as logging or
* tracking, while passing the original success value to the next step.
*
* **Details**
*
* `tap` works similarly to `flatMap`, but it ignores the result of the function
* passed to it. The value from the previous effect remains available for the
* next part of the chain. Note that if the side effect fails, the entire chain
* will fail too.
*
* **Example** (Logging a step in a pipeline)
*
* ```ts import.meta.vitest
* import { Data, Effect, pipe } from "effect"
* const output: Array<unknown> = []
*
* class DiscountRateError extends Data.TaggedError("DiscountRateError")<{}> {}
*
* // Function to apply a discount safely to a transaction amount
* const applyDiscount = (
*   total: number,
*   discountRate: number
* ): Effect.Effect<number, DiscountRateError> =>
*   discountRate === 0
*     ? Effect.fail(new DiscountRateError())
*     : Effect.succeed(total - (total * discountRate) / 100)
*
* // Simulated asynchronous task to fetch a transaction amount from database
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* const finalAmount = pipe(
*   fetchTransactionAmount,
*   // Log the fetched transaction amount
*   Effect.tap((amount) => Effect.sync(() => { output.push(`Apply a discount to: ${amount}`) })),
*   // `amount` is still available!
*   Effect.flatMap((amount) => applyDiscount(amount, 5))
* )
*
* void output.push(await Effect.runPromise(finalAmount))
* output // => ["Apply a discount to: 100", 95]
* ```
*
* @category sequencing
* @since 2.0.0
*/
const tap = tap$1;
/**
* Converts both success and failure of an `Effect` into a `Result` type.
*
* **When to use**
*
* Use when you want an `Effect`'s typed failures to be handled as `Result`
* data while preserving the original error value.
*
* **Details**
*
* This function converts an effect that may fail into an effect that always
* succeeds, wrapping the outcome in a `Result` type. The result will be
* `Result.Failure` if the effect fails, containing the recoverable error, or
* `Result.Success` if it succeeds, containing the result.
*
* Using this function, you can handle recoverable errors explicitly without
* causing the effect to fail. This is particularly useful in scenarios where
* you want to chain effects and manage both success and failure in the same
* logical flow.
*
* The resulting effect cannot fail directly because all recoverable failures
* are represented inside the `Result` type.
*
* **Gotchas**
*
* `result` only captures typed, recoverable failures. Defects and
* interruptions are not captured inside the `Result` and still fail the
* effect.
*
* **Example** (Capturing success or failure as Result)
*
* ```ts import.meta.vitest
* import { Effect, Result } from "effect"
*
* const success = Effect.succeed(42)
* const failure = Effect.fail("Something went wrong")
*
* const program1 = Effect.result(success)
* const program2 = Effect.result(failure)
*
* Effect.runSync(program1) // => Result.succeed(42)
*
* Effect.runSync(program2) // => Result.fail("Something went wrong")
* ```
*
* @see {@link option} for a version that uses `Option` instead.
* @see {@link exit} for a version that encapsulates both recoverable errors and defects in an `Exit`.
*
* @category error handling
* @since 4.0.0
*/
const result = result$1;
/**
* Transforms an effect to encapsulate both failure and success using the `Exit`
* data type.
*
* **When to use**
*
* Use when you need to inspect the full outcome, including typed failures, defects,
* and interruptions.
*
* **Details**
*
* `exit` wraps an effect's success or failure inside an `Exit` type, allowing
* you to handle both cases explicitly.
*
* The resulting effect cannot fail because the failure is encapsulated within
* the `Exit.Failure` type. The error type is set to `never`, indicating that
* the effect is structured to never fail directly.
*
* **Example** (Capturing completion as Exit)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
*
* const success = Effect.succeed(42)
* const failure = Effect.fail("Something went wrong")
*
* const program1 = Effect.exit(success)
* const program2 = Effect.exit(failure)
*
* Effect.runSync(program1) // => Exit.succeed(42)
*
* Effect.runSync(program2) // => Exit.fail("Something went wrong")
* ```
*
* @see {@link option} for a version that uses `Option` instead.
* @see {@link result} for a version that uses `Result` instead.
*
* @category error handling
* @since 2.0.0
*/
const exit = exit$1;
/**
* Transforms the value inside an effect by applying a function to it.
*
* **When to use**
*
* Use to transform an effect's success value with a function that returns a
* plain value, producing a new effect without changing the original effect's
* typed error or context requirements.
*
* **Details**
*
* `map` takes a function and applies it to the value contained within an
* effect, creating a new effect with the transformed value.
*
* It's important to note that effects are immutable, meaning that the original
* effect is not modified. Instead, a new effect is returned with the updated
* value.
*
* **Example** (Choosing map syntax variants)
*
* ```ts import.meta.vitest
* import { Effect, pipe } from "effect"
* const output: Array<unknown> = []
*
* const myEffect = Effect.succeed(1)
* const transformation = (n: number) => n + 1
*
* const mappedWithPipe = pipe(myEffect, Effect.map(transformation))
* const mappedWithDataFirst = Effect.map(myEffect, transformation)
* const mappedWithMethod = myEffect.pipe(Effect.map(transformation))
*
* void output.push(Effect.runSync(Effect.all([
*   mappedWithPipe,
*   mappedWithDataFirst,
*   mappedWithMethod
* ])))
* output // => [[2, 2, 2]]
* ```
*
* **Example** (Adding a service charge)
*
* ```ts import.meta.vitest
* import { Effect, pipe } from "effect"
*
* const addServiceCharge = (amount: number) => amount + 1
*
* const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))
*
* const finalAmount = pipe(
*   fetchTransactionAmount,
*   Effect.map(addServiceCharge)
* )
*
* await Effect.runPromise(finalAmount) // => 101
* ```
*
* @see {@link mapError} for a version that operates on the error channel.
* @see {@link mapBoth} for a version that operates on both channels.
* @see {@link flatMap} or {@link andThen} for a version that can return a new effect.
* @category mapping
* @since 2.0.0
*/
const map$2 = map$4;
/**
* Replaces the value inside an effect with a constant value.
*
* **When to use**
*
* Use to replace a successful value with a constant while preserving failures
* and requirements.
*
* **Details**
*
* `as` allows you to ignore the original value inside an effect and
* replace it with a new constant value.
*
* **Example** (Replacing a success value)
*
* ```ts import.meta.vitest
* import { Effect, pipe } from "effect"
*
* // Replaces the value 5 with the constant "new value"
* const program = pipe(Effect.succeed(5), Effect.as("new value"))
*
* Effect.runSync(program) // => "new value"
* ```
*
* @see {@link map} for deriving the replacement value from the success value
* @see {@link asVoid} for replacing the success value with `void`
*
* @category mapping
* @since 2.0.0
*/
const as = as$1;
/**
* Maps the success value of an `Effect` to `void`, preserving failures.
*
* **Example** (Discarding success values)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const program = Effect.asVoid(Effect.succeed(42))
*
* Effect.runSync(program) // => undefined
* ```
*
* @category mapping
* @since 2.0.0
*/
const asVoid = asVoid$1;
const catch_$1 = catch_$2;
/**
* Handles multiple errors in a single block of code using their `_tag` field.
*
* **When to use**
*
* Use when one recovery step should handle several tagged error types by
* matching their readonly `_tag` fields.
*
* **Details**
*
* Pass a handler table whose keys are tags, plus an optional fallback for
* unmatched errors.
*
* The error type must have a readonly `_tag` field to use `catchTags`. This
* field is used to identify and match errors.
*
* **Example** (Handling multiple tagged errors)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* // Define tagged error types
* class ValidationError extends Data.TaggedError("ValidationError")<{
*   message: string
* }> {}
*
* class NetworkError extends Data.TaggedError("NetworkError")<{
*   statusCode: number
* }> {}
*
* // An effect that might fail with multiple error types
* const program: Effect.Effect<string, ValidationError | NetworkError> =
*   Effect.fail(new NetworkError({ statusCode: 503 }))
*
* // Handle multiple error types at once
* const handled = Effect.catchTags(program, {
*   ValidationError: (error) =>
*     Effect.succeed(`Validation failed: ${error.message}`),
*   NetworkError: (error) => Effect.succeed(`Network error: ${error.statusCode}`)
* })
*
* Effect.runSync(handled) // => "Network error: 503"
* ```
*
* @category error handling
* @since 2.0.0
*/
const catchTags = catchTags$1;
/**
* Handles both recoverable and unrecoverable errors by providing a recovery
* effect.
*
* **When to use**
*
* Use when you need to recover from an `Effect` by inspecting the full `Cause`,
* including recoverable failures, defects, and interruptions, instead of only
* the typed error value.
*
* **Details**
*
* When to Recover from Defects:
*
* Defects are unexpected errors that typically shouldn't be recovered from, as
* they often indicate serious issues. However, in some cases, such as
* dynamically loaded plugins, controlled recovery might be needed.
*
* **Example** (Recovering from full failure causes)
*
* ```ts import.meta.vitest
* import { Cause, Effect } from "effect"
* const output: Array<unknown> = []
*
* // An effect that might fail in different ways
* const program = Effect.die("Something went wrong")
*
* // Recover from any cause (including defects)
* const recovered = Effect.catchCause(program, (cause) => {
*   if (Cause.hasDies(cause)) {
*     return Effect.sync(() => { output.push("Caught defect") }).pipe(
*       Effect.as("Recovered from defect")
*     )
*   }
*   return Effect.succeed("Unknown error")
* })
*
* void output.push(Effect.runSync(recovered))
* output // => ["Caught defect", "Recovered from defect"]
* ```
*
* @category error handling
* @since 4.0.0
*/
const catchCause$1 = catchCause$2;
/**
* Recovers from defects using a provided recovery function.
*
* **When to use**
*
* Use when you need to report or translate defects at integration boundaries.
*
* **Details**
*
* `catchDefect` handles unexpected defects, such as thrown exceptions or
* values passed to `die`, without catching typed failures or interruptions.
*
* When to Recover from Defects:
*
* Defects are unexpected errors that typically should not be recovered from, as
* they often indicate serious issues. In some cases, such as dynamically loaded
* plugins, controlled recovery may be needed.
*
* **Example** (Recovering from defects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* // An effect that might throw an unexpected error (defect)
* const program = Effect.sync(() => {
*   throw new Error("Unexpected error")
* })
*
* // Recover from defects only
* const recovered = Effect.catchDefect(program, (defect) => {
*   return Effect.sync(() => { output.push(`Caught defect: ${(defect as Error).message}`) }).pipe(
*     Effect.as("Recovered from defect")
*   )
* })
*
* void output.push(Effect.runSync(recovered))
* output // => ["Caught defect: Unexpected error", "Recovered from defect"]
* ```
*
* @category error handling
* @since 4.0.0
*/
const catchDefect = catchDefect$1;
/**
* Transforms the failure value of an effect without changing its success value.
*
* **When to use**
*
* Use to translate an `Effect`'s typed failures while leaving successful values
* unchanged.
*
* **Details**
*
* Only the failure channel is transformed. The success channel and requirements
* are preserved.
*
* **Example** (Transforming the error channel)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* class TaskError extends Data.TaggedError("TaskError")<{ readonly message: string }> {}
*
* //      ┌─── Effect<number, string, never>
* //      ▼
* const simulatedTask = Effect.fail("Oh no!").pipe(Effect.as(1))
*
* //      ┌─── Effect<number, TaskError, never>
* //      ▼
* const mapped = Effect.mapError(
*   simulatedTask,
*   (message) => new TaskError({ message })
* )
* Effect.runSync(Effect.flip(mapped)).message // => "Oh no!"
* ```
*
* @see {@link map} for a version that operates on the success channel.
* @see {@link mapBoth} for a version that operates on both channels.
*
* @category error handling
* @since 2.0.0
*/
const mapError$2 = mapError$3;
/**
* Converts typed failures from the error channel into defects, removing the
* error type from the returned effect.
*
* **When to use**
*
* Use when you need to turn an `Effect` typed failure that represents an
* unrecoverable bug or invalid state into a defect.
*
* **Example** (Converting typed failures into defects)
*
* ```ts import.meta.vitest
* import { Data, Effect, Exit } from "effect"
*
* class DivideByZeroError extends Data.TaggedError("DivideByZeroError")<{}> {}
*
* const divide = (a: number, b: number) =>
*   b === 0
*     ? Effect.fail(new DivideByZeroError())
*     : Effect.succeed(a / b)
*
* //      ┌─── Effect<number, never, never>
* //      ▼
* const program = Effect.orDie(divide(1, 0))
*
* Effect.runSyncExit(program) // => Exit.die(new DivideByZeroError())
* ```
*
* @category error handling
* @since 2.0.0
*/
const orDie = orDie$1;
/**
* Runs an effectful operation when the source effect fails, while preserving
* the original failure when the operation succeeds.
*
* **Details**
*
* Use this for logging, metrics, or other failure-side observations. If the
* operation passed to `tapError` fails, that error is also represented in the
* returned effect's error channel.
*
* **Example** (Running effects on failure)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
* const output: Array<unknown> = []
*
* // Simulate a task that fails with an error
* const task: Effect.Effect<number, string> = Effect.fail("NetworkError")
*
* // Use tapError to log the error message when the task fails
* const tapping = Effect.tapError(
*   task,
*   (error) => Effect.sync(() => { output.push(`expected error: ${error}`) })
* )
*
* void output.push(Effect.runSyncExit(tapping))
* output // => ["expected error: NetworkError", Exit.fail("NetworkError")]
* ```
*
* @category error handling
* @since 2.0.0
*/
const tapError$2 = tapError$3;
/**
* Discards both the success and failure values of an effect.
*
* **When to use**
*
* Use when an effect should run for its side effects while both success and
* failure values are discarded.
*
* **Details**
*
* Use the `log` option to emit the full {@link Cause} when the effect fails,
* and `message` to prepend a custom log message.
*
* **Example** (Discarding success and failure values)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* //      ┌─── Effect<number, string, never>
* //      ▼
* const task = Effect.fail("Uh oh!").pipe(Effect.as(5))
*
* //      ┌─── Effect<void, never, never>
* //      ▼
* const program = task.pipe(Effect.ignore)
* Effect.runSync(program) // => undefined
* ```
*
* **Example** (Logging failures while ignoring results)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const task = Effect.fail("Uh oh!")
*
* const program = task.pipe(Effect.ignore)
* Effect.runSync(program) // => undefined
* ```
*
* @category error handling
* @since 2.0.0
*/
const ignore$1 = ignore$2;
/**
* Recovers from a typed failure by producing a fallback success value.
*
* **Details**
*
* If the source effect succeeds, its value is preserved. If it fails in the
* error channel, `orElseSucceed` evaluates the fallback with that error and
* succeeds with the returned value, removing the typed error from the returned
* effect.
*
* Defects and interruptions are not recovered by this operator.
*
* **Example** (Replacing failures with a value)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
*
* const validate = (age: number): Effect.Effect<number, string> => {
*   if (age < 0) {
*     return Effect.fail("NegativeAgeError")
*   } else if (age < 18) {
*     return Effect.fail("IllegalAgeError")
*   } else {
*     return Effect.succeed(age)
*   }
* }
*
* const program = Effect.orElseSucceed(validate(-1), (error) => error === "IllegalAgeError" ? 18 : 0)
*
* Effect.runSyncExit(program) // => Exit.succeed(0)
* ```
*
* @category error handling
* @since 2.0.0
*/
const orElseSucceed = orElseSucceed$1;
/**
* Adds a time limit to an effect, triggering a timeout if the effect exceeds
* the duration.
*
* **When to use**
*
* Use when you need a timeout of an `Effect` to be represented as a typed
* failure.
*
* **Details**
*
* The `timeout` function allows you to specify a time limit for an
* effect's execution. If the effect does not complete within the given time, a
* `TimeoutError` is raised. This can be useful for controlling how long your
* program waits for a task to finish, ensuring that it doesn't hang
* indefinitely if the task takes too long.
*
* **Gotchas**
*
* If the timeout wins, the source effect is interrupted.
*
* **Example** (Failing when work takes too long)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const timedEffect = Effect.never.pipe(Effect.timeout(0))
* const error = await Effect.runPromise(Effect.flip(timedEffect))
* error._tag // => "TimeoutError"
* ```
*
* @see {@link timeoutOption} for returning `Option.none` on timeout.
* @see {@link timeoutOrElse} for a version that allows specifying both success and timeout handlers.
*
* @category delays & timeouts
* @since 2.0.0
*/
const timeout = timeout$1;
/**
* Returns an effect that suspends the current fiber for the specified duration
* without blocking a JavaScript thread.
*
* **Example** (Pausing without blocking)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const program = Effect.gen(function*() {
*   yield* Effect.sync(() => { output.push("Start") })
*   yield* Effect.sleep(0)
*   yield* Effect.sync(() => { output.push("End") })
* })
*
* await Effect.runPromise(program)
* output // => ["Start", "End"]
* ```
*
* @category delays & timeouts
* @since 2.0.0
*/
const sleep = sleep$1;
/**
* Runs an effect conditionally based on the result of an effectful boolean
* condition.
*
* **When to use**
*
* Use when you need an effectful check to decide whether another effect should
* run while representing the skipped case explicitly.
*
* **Details**
*
* The condition effect is evaluated first. If it succeeds with `true`, the
* source effect is run and its success value is wrapped in `Option.some`. If it
* succeeds with `false`, the source effect is skipped and the result is
* `Option.none`. If the condition effect fails, that failure is preserved.
*
* **Example** (Conditionally running an effect)
*
* ```ts import.meta.vitest
* import { Effect, Option } from "effect"
* const output: Array<unknown> = []
*
* const shouldLog = true
*
* const program = Effect.when(
*   Effect.sync(() => { output.push("Condition is true!") }),
*   Effect.succeed(shouldLog)
* )
*
* void output.push(Effect.runSync(program))
* output // => ["Condition is true!", Option.some(undefined)]
* ```
*
* @category filtering
* @since 2.0.0
*/
const when = when$1;
/**
* Handles both success and failure cases of an effect without performing side
* effects.
*
* **When to use**
*
* Use when you need to fold an `Effect` into a value by handling success and
* failure differently without triggering side effects.
*
* **Details**
*
* `match` lets you define custom handlers for both success and failure
* scenarios. You provide separate functions to handle each case, allowing you
* to process the result if the effect succeeds, or handle the error if the
* effect fails.
*
* **Example** (Matching success and failure values)
*
* ```ts import.meta.vitest
* import { Data, Effect } from "effect"
*
* class ExampleError extends Data.TaggedError("ExampleError")<{ readonly message: string }> {}
*
* const success: Effect.Effect<number, ExampleError> = Effect.succeed(42)
*
* const program1 = Effect.match(success, {
*   onFailure: (error) => `failure: ${error.message}`,
*   onSuccess: (value) => `success: ${value}`
* })
*
* // Run and log the result of the successful effect
* Effect.runSync(program1) // => "success: 42"
*
* const failure: Effect.Effect<number, ExampleError> = Effect.fail(
*   new ExampleError({ message: "Uh oh!" })
* )
*
* const program2 = Effect.match(failure, {
*   onFailure: (error) => `failure: ${error.message}`,
*   onSuccess: (value) => `success: ${value}`
* })
*
* // Run and log the result of the failed effect
* Effect.runSync(program2) // => "failure: Uh oh!"
* ```
*
* @see {@link matchEffect} if you need to perform side effects in the handlers.
* @category pattern matching
* @since 2.0.0
*/
const match = match$1;
/**
* Handles failures with access to the cause and allows performing side effects.
*
* **When to use**
*
* Use when you need to fold an `Effect` with effectful success handlers and
* `Cause`-aware failure handlers.
*
* **Details**
*
* The `matchCauseEffect` function works similarly to {@link matchCause}, but it
* also allows you to perform additional side effects based on the failure
* cause. This function provides access to the complete cause of the failure,
* making it possible to differentiate between various failure types, and allows
* you to respond accordingly while performing side effects (like logging or
* other operations).
*
* **Example** (Effectfully matching on causes)
*
* ```ts import.meta.vitest
* import { Cause, Data, Effect, Result } from "effect"
* const output: Array<unknown> = []
*
* class TaskError extends Data.TaggedError("TaskError")<{ readonly message: string }> {}
*
* const task = Effect.fail(new TaskError({ message: "Task failed" }))
*
* const program = Effect.matchCauseEffect(task, {
*   onFailure: (cause) =>
*     Effect.gen(function*() {
*       if (Cause.hasFails(cause)) {
*         const error = Cause.findError(cause)
*         if (Result.isSuccess(error)) {
*           yield* Effect.sync(() => { output.push(`Handling error: ${error.success.message}`) })
*         }
*         return "recovered from error"
*       } else {
*         yield* Effect.sync(() => { output.push("Handling interruption or defect") })
*         return "recovered from interruption/defect"
*       }
*     }),
*   onSuccess: (value) =>
*     Effect.gen(function*() {
*       yield* Effect.sync(() => { output.push(`Success: ${value}`) })
*       return `processed ${value}`
*     })
* })
*
* void output.push(Effect.runSync(program))
* output // => ["Handling error: Task failed", "recovered from error"]
* ```
*
* @see {@link matchCause} if you don't need side effects and only want to handle the result or failure.
* @see {@link matchEffect} if you don't need to handle the cause of the failure.
*
* @category pattern matching
* @since 2.0.0
*/
const matchCauseEffect = matchCauseEffect$1;
/**
* Returns the complete context.
*
* **When to use**
*
* Use to read the complete `Context` available to the current effect.
*
* **Details**
*
* This function allows you to access all services that are currently available
* in the effect's environment. This can be useful for debugging, introspection,
* or when you need to pass the entire context to another function.
*
* **Example** (Reading the full context)
*
* ```ts import.meta.vitest
* import { Context, Effect, Option } from "effect"
* const output: Array<unknown> = []
*
* const Logger = Context.Service<{
*   log: (msg: string) => void
* }>("Logger")
* const Database = Context.Service<{
*   query: (sql: string) => string
* }>("Database")
*
* const program = Effect.gen(function*() {
*   const allServices = yield* Effect.context()
*
*   // Check if specific services are available
*   const loggerOption = Context.getOption(allServices, Logger)
*   const databaseOption = Context.getOption(allServices, Database)
*
*   yield* Effect.sync(() => { output.push(`Logger available: ${Option.isSome(loggerOption)}`) })
*   yield* Effect.sync(() => { output.push(`Database available: ${Option.isSome(databaseOption)}`) })
* })
*
* const context = Context.make(Logger, { log: () => {} })
*   .pipe(Context.add(Database, { query: () => "result" }))
*
* const provided = Effect.provideContext(program, context)
* Effect.runSync(provided)
* output // => ["Logger available: true", "Database available: true"]
* ```
*
* @see {@link contextWith} for deriving an effect from the complete context
* @see {@link service} for reading one service from the context
*
* @category accessors
* @since 2.0.0
*/
const context = context$1;
/**
* Transforms the current context using the provided function.
*
* **When to use**
*
* Use to derive an effect from the complete `Context`.
*
* **Details**
*
* This function allows you to access the complete context and perform
* computations based on all available services. This is useful when you need
* to conditionally execute logic based on what services are available.
*
* **Example** (Deriving values from the context)
*
* ```ts import.meta.vitest
* import { Context, Effect, Option } from "effect"
* const output: Array<unknown> = []
*
* const Logger = Context.Service<{
*   log: (msg: string) => void
* }>("Logger")
* const Cache = Context.Service<{
*   get: (key: string) => string | null
* }>("Cache")
*
* const program = Effect.contextWith((services: Context.Context<Context.Service.Identifier<typeof Cache>>) => {
*   const cacheOption = Context.getOption(services, Cache)
*   const hasCache = Option.isSome(cacheOption)
*
*   if (hasCache) {
*     return Effect.gen(function*() {
*       const cache = yield* Effect.service(Cache)
*       yield* Effect.sync(() => { output.push("Using cached data") })
*       return cache.get("user:123") || "default"
*     })
*   } else {
*     return Effect.gen(function*() {
*       yield* Effect.sync(() => { output.push("No cache available, using fallback") })
*       return "fallback data"
*     })
*   }
* })
*
* const withCache = Effect.provideService(program, Cache, {
*   get: () => "cached_value"
* })
* void output.push(Effect.runSync(withCache))
* output // => ["Using cached data", "cached_value"]
* ```
*
* @see {@link context} for reading the complete context as a value
* @see {@link service} for reading one service from the context
*
* @category accessors
* @since 2.0.0
*/
const contextWith = contextWith$1;
/**
* Provides a context to an effect, fulfilling its service requirements.
*
* **Details**
*
* This function provides multiple services at once by supplying a context
* that contains all the required services. It removes the provided services
* from the effect's requirements, making them available to the effect.
*
* **Example** (Providing a complete context)
*
* ```ts import.meta.vitest
* import { Context, Effect } from "effect"
* const output: Array<unknown> = []
*
* // Define service keys
* const Logger = Context.Service<{
*   log: (msg: string) => void
* }>("Logger")
* const Database = Context.Service<{
*   query: (sql: string) => string
* }>("Database")
*
* // Create a context with multiple services
* const context = Context.make(Logger, { log: (message) => { output.push(message) } })
*   .pipe(Context.add(Database, { query: () => "result" }))
*
* // An effect that requires both services
* const program = Effect.gen(function*() {
*   const logger = yield* Effect.service(Logger)
*   const db = yield* Effect.service(Database)
*   logger.log("Querying database")
*   return db.query("SELECT * FROM users")
* })
*
* const provided = Effect.provideContext(program, context)
* void output.push(Effect.runSync(provided))
* output // => ["Querying database", "result"]
* ```
*
* @category providing services
* @since 4.0.0
*/
const provideContext = provideContext$1;
/**
* Optionally accesses a service from the environment.
*
* **When to use**
*
* Use to read an optional dependency from the current context without making
* that dependency part of the effect's required environment.
*
* **Details**
*
* This function attempts to access a service from the environment. If the
* service is available, it returns `Some(service)`. If the service is not
* available, it returns `None`. Unlike `service`, this function does not
* require the service to be present in the environment.
*
* **Example** (Accessing an optional service)
*
* ```ts import.meta.vitest
* import { Context, Effect, Option } from "effect"
* const output: Array<unknown> = []
*
* // Define a service key
* const Logger = Context.Service<{
*   log: (msg: string) => void
* }>("Logger")
*
* // Use serviceOption to optionally access the logger
* const program = Effect.gen(function*() {
*   const maybeLogger = yield* Effect.serviceOption(Logger)
*
*   if (Option.isSome(maybeLogger)) {
*     maybeLogger.value.log("Service is available")
*   } else {
*     void output.push("Service not available")
*   }
* })
*
* Effect.runSync(program)
* output // => ["Service not available"]
* ```
*
* @category accessors
* @since 2.0.0
*/
const serviceOption = serviceOption$1;
/**
* Provides part of the required context while leaving the rest unchanged.
*
* **Details**
*
* This function allows you to transform the context required by an effect,
* providing part of the context and leaving the rest to be fulfilled later.
*
* **Example** (Updating the context before running)
*
* ```ts import.meta.vitest
* import { Context, Effect } from "effect"
*
* // Define services
* const Logger = Context.Service<{
*   log: (msg: string) => void
* }>("Logger")
* const Config = Context.Service<{
*   name: string
* }>("Config")
*
* const program = Effect.service(Config).pipe(
*   Effect.map((config) => `Hello ${config.name}!`)
* )
*
* // Transform services by providing Config while keeping Logger requirement
* const configured = program.pipe(
*   Effect.updateContext((context: Context.Context<Context.Service.Identifier<typeof Logger>>) =>
*     Context.add(context, Config, { name: "World" })
*   )
* )
*
* // The effect now requires only Logger service
* const result = Effect.provideService(configured, Logger, {
*   log: () => {}
* })
* Effect.runSync(result) // => "Hello World!"
* ```
*
* @category providing services
* @since 4.0.0
*/
const updateContext = updateContext$1;
/**
* Provides one concrete service implementation to an effect.
*
* **When to use**
*
* Use to satisfy one service requirement with an already-built implementation.
*
* **Details**
*
* The service requirement identified by the `Context.Key` is removed from the
* effect requirements after the implementation is provided.
*
* **Example** (Providing a service value)
*
* ```ts import.meta.vitest
* import { Context, Effect } from "effect"
* const output: Array<unknown> = []
*
* // Define a service for configuration
* const Config = Context.Service<{
*   apiUrl: string
*   timeout: number
* }>("Config")
*
* const fetchData = Effect.gen(function*() {
*   const config = yield* Effect.service(Config)
*   yield* Effect.sync(() => { output.push(`Fetching from: ${config.apiUrl}`) })
*   yield* Effect.sync(() => { output.push(`Timeout: ${config.timeout}ms`) })
*   return "data"
* })
*
* // Provide the service implementation
* const program = Effect.provideService(fetchData, Config, {
*   apiUrl: "https://api.example.com",
*   timeout: 5000
* })
*
* void output.push(Effect.runSync(program))
* output // => ["Fetching from: https://api.example.com", "Timeout: 5000ms", "data"]
* ```
*
* @see {@link provide} for providing multiple layers to an effect.
* @see {@link provideServiceEffect} for acquiring the service implementation effectfully.
* @see {@link provideContext} for providing a complete context.
* @category providing services
* @since 2.0.0
*/
const provideService = provideService$1;
/**
* Runs an effect with a scope that closes when the effect completes.
*
* **When to use**
*
* Use to acquire scoped resources for the duration of a single workflow.
*
* **Details**
*
* Finalizers for resources acquired inside the workflow run as soon as the
* workflow completes, whether by success, failure, or interruption.
*
* **Example** (Running a scoped acquisition)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const resource = Effect.acquireRelease(
*   Effect.sync(() => { output.push("Acquiring resource") }).pipe(Effect.as("resource")),
*   () => Effect.sync(() => { output.push("Releasing resource") })
* )
*
* const program = Effect.scoped(
*   Effect.gen(function*() {
*     const res = yield* resource
*     yield* Effect.sync(() => { output.push(`Using ${res}`) })
*     return res
*   })
* )
*
* Effect.runSync(program)
* output // => ["Acquiring resource", "Using resource", "Releasing resource"]
* ```
*
* @category resource management
* @since 2.0.0
*/
const scoped = scoped$1;
/**
* Constructs a scoped resource from an acquisition effect and a release
* finalizer.
*
* **When to use**
*
* Use to acquire a scoped resource with an explicit release finalizer.
*
* **Details**
*
* If acquisition succeeds, the release finalizer is added to the current scope
* and is guaranteed to run when that scope closes. The finalizer receives the
* `Exit` value used to close the scope.
*
* By default, acquisition is protected by an uninterruptible region. Pass
* `{ interruptible: true }` to allow the acquisition effect to be interrupted.
*
* **Example** (Acquiring and releasing a resource)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
* const output: Array<unknown> = []
*
* // Simulate a resource that needs cleanup
* interface FileHandle {
*   readonly path: string
*   readonly content: string
* }
*
* // Acquire a file handle
* const acquire = Effect.gen(function*() {
*   yield* Effect.sync(() => { output.push("Opening file") })
*   return { path: "/tmp/file.txt", content: "file content" }
* })
*
* // Release the file handle
* const release = (handle: FileHandle, exit: Exit.Exit<unknown, unknown>) =>
*   Effect.sync(() => { output.push(
*     `Closing file ${handle.path} with exit: ${
*       Exit.isSuccess(exit) ? "success" : "failure"
*     }`
*   ) })
*
* // Create a scoped resource
* const resource = Effect.acquireRelease(acquire, release)
*
* // Use the resource within a scope
* const program = Effect.scoped(
*   Effect.gen(function*() {
*     const handle = yield* resource
*     yield* Effect.sync(() => { output.push(`Using file: ${handle.path}`) })
*     return handle.content
*   })
* )
*
* void output.push(Effect.runSync(program))
* output // => ["Opening file", "Using file: /tmp/file.txt", "Closing file /tmp/file.txt with exit: success", "file content"]
* ```
*
* @see {@link acquireDisposable} for resources that implement JavaScript disposal protocols
* @see {@link acquireUseRelease} for bracketing acquire, use, and release in one effect
*
* @category resource management
* @since 2.0.0
*/
const acquireRelease = acquireRelease$1;
/**
* Runs the specified effect if this effect fails, providing the error to the
* effect if it exists. The provided effect will not be interrupted.
*
* **Example** (Running cleanup on failure)
*
* ```ts import.meta.vitest
* import { Cause, Data, Effect, Exit } from "effect"
* const output: Array<unknown> = []
*
* class TaskError extends Data.TaggedError("TaskError")<{ readonly message: string }> {}
*
* const error = new TaskError({ message: "Something went wrong" })
* const task = Effect.fail(error)
*
* const program = Effect.onError(
*   task,
*   (cause) => Effect.sync(() => { output.push(`Cleanup on error: ${Cause.squash(cause)}`) })
* )
*
* void output.push(Effect.runSyncExit(program))
* output // => ["Cleanup on error: TaskError: Something went wrong", Exit.fail(error)]
* ```
*
* @category resource management
* @since 2.0.0
*/
const onError = onError$1;
/**
* Ensures that a cleanup function runs whether this effect succeeds, fails, or
* is interrupted.
*
* **Details**
*
* If both the effect and the cleanup function fail, the two causes are merged.
*
* **Example** (Observing every exit)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
* const output: Array<unknown> = []
*
* const task = Effect.succeed(42)
*
* const program = Effect.onExit(task, (exit) =>
*   Effect.sync(() => { output.push(
*     Exit.isSuccess(exit)
*       ? `Task succeeded with: ${exit.value}`
*       : `Task failed: ${Exit.isFailure(exit) ? exit.cause : "interrupted"}`
*   ) }))
*
* void output.push(Effect.runSync(program))
* output // => ["Task succeeded with: 42", 42]
* ```
*
* @category resource management
* @since 2.0.0
*/
const onExit$1 = onExit$2;
/**
* Returns an effect that lazily computes a result and caches it for subsequent
* evaluations.
*
* **When to use**
*
* Use when you need an expensive or time-consuming operation to be evaluated
* once and reused by later callers.
*
* **Details**
*
* This function wraps an effect and ensures that its result is computed only
* once. Once the result is computed, it is cached, meaning that subsequent
* evaluations of the same effect will return the cached result without
* re-executing the logic.
*
* Concurrent callers share the pending computation, which is interrupted only
* once every caller waiting on it has been interrupted. Interrupted
* computations are never cached, so the next evaluation starts a fresh
* computation.
*
* **Example** (Memoizing an effect until invalidated)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
* const record = (value: unknown) => Effect.sync(() => { output.push(value) })
*
* let i = 1
* const expensiveTask = Effect.sync(() => {
*   void output.push("expensive task...")
*   return `result ${i++}`
* })
*
* const program = Effect.gen(function*() {
*   void output.push("non-cached version:")
*   yield* expensiveTask.pipe(Effect.andThen(record))
*   yield* expensiveTask.pipe(Effect.andThen(record))
*   void output.push("cached version:")
*   const cached = yield* Effect.cached(expensiveTask)
*   yield* cached.pipe(Effect.andThen(record))
*   yield* cached.pipe(Effect.andThen(record))
* })
*
* await Effect.runPromise(program)
* output // => ["non-cached version:", "expensive task...", "result 1", "expensive task...", "result 2", "cached version:", "expensive task...", "result 3", "result 3"]
* ```
*
* @see {@link cachedWithTTL} for a similar function that includes a
* time-to-live duration for the cached value.
* @see {@link cachedInvalidateWithTTL} for a similar function that includes an
* additional effect for manually invalidating the cached value.
* @category caching
* @since 2.0.0
*/
const cached = cached$1;
/**
* Returns an effect that is immediately interrupted.
*
* **Example** (Creating an interrupted effect)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const program = Effect.gen(function*() {
*   return yield* Effect.interrupt
*   yield* Effect.succeed("This won't execute and is unreachable")
* })
*
* Effect.runSyncExit(program)._tag // => "Failure"
* ```
*
* @category interruption
* @since 2.0.0
*/
const interrupt$1 = interrupt$2;
/**
* Runs the specified finalizer effect if this effect is interrupted.
*
* **Example** (Running cleanup on interruption)
*
* ```ts import.meta.vitest
* import { Effect, Fiber } from "effect"
* const output: Array<unknown> = []
*
* const task = Effect.forever(Effect.succeed("working..."))
*
* const program = Effect.onInterrupt(
*   task,
*   () => Effect.sync(() => { output.push("Task was interrupted, cleaning up...") })
* )
*
* const fiber = Effect.runFork(program)
* await Effect.runPromise(Fiber.interrupt(fiber))
* output // => ["Task was interrupted, cleaning up..."]
* ```
*
* @category interruption
* @since 2.0.0
*/
const onInterrupt = onInterrupt$1;
/**
* Returns a new effect that disables interruption for the given effect.
*
* **Example** (Preventing interruption)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const criticalTask = Effect.gen(function*() {
*   yield* Effect.sync(() => { output.push("Starting critical section...") })
*   yield* Effect.sync(() => { output.push("Critical section completed") })
* })
*
* const program = Effect.uninterruptible(criticalTask)
*
* Effect.runSync(program)
* output // => ["Starting critical section...", "Critical section completed"]
* ```
*
* @category interruption
* @since 2.0.0
*/
const uninterruptible = uninterruptible$1;
/**
* Disables interruption and provides a restore function to restore the
* interruptible state within the effect.
*
* **Example** (Restoring interruption in protected regions)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const program = Effect.uninterruptibleMask((restore) =>
*   Effect.gen(function*() {
*     yield* Effect.sync(() => { output.push("Uninterruptible phase...") })
*     // Restore interruptibility for this part
*     yield* restore(
*       Effect.gen(function*() {
*         yield* Effect.sync(() => { output.push("Interruptible phase...") })
*       })
*     )
*
*     yield* Effect.sync(() => { output.push("Back to uninterruptible") })
*   })
* )
*
* Effect.runSync(program)
* output // => ["Uninterruptible phase...", "Interruptible phase...", "Back to uninterruptible"]
* ```
*
* @category interruption
* @since 2.0.0
*/
const uninterruptibleMask = uninterruptibleMask$1;
/**
* Repeats this effect forever (until the first error).
*
* **Example** (Repeating forever)
*
* ```ts import.meta.vitest
* import { Effect, Option } from "effect"
*
* const program = Effect.forever(Effect.never).pipe(Effect.timeoutOption(0))
* await Effect.runPromise(program) // => Option.none()
* ```
*
* @category repetition
* @since 2.0.0
*/
const forever = forever$1;
/**
* Create a new span for tracing, and automatically close it when the effect
* completes.
*
* **Details**
*
* The span is not added to the current span stack, so no child spans will be
* created for it.
*
* **Example** (Running an effect with a standalone span)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const program = Effect.useSpan(
*   "user-operation",
*   (span) => Effect.succeed(`${span.name}: success`)
* )
* Effect.runSync(program) // => "user-operation: success"
* ```
*
* @category tracing
* @since 2.0.0
*/
const useSpan = useSpan$1;
/**
* Adds the provided span to the current span stack.
*
* **Example** (Setting a parent span)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const program = Effect.gen(function*() {
*   const span = yield* Effect.makeSpan("parent-span")
*   const childTask = Effect.succeed("child operation")
*   yield* Effect.withParentSpan(childTask, span)
*   return "completed"
* })
* Effect.runSync(program) // => "completed"
* ```
*
* @category tracing
* @since 2.0.0
*/
const withParentSpan = withParentSpan$1;
/**
* Forks the effect in the specified scope. The fiber will be interrupted
* when the scope is closed.
*
* **Example** (Forking into a supplied scope)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const task = Effect.never
*
* const program = Effect.scoped(
*   Effect.gen(function*() {
*     const scope = yield* Effect.scope
*     const fiber = yield* Effect.forkIn(task, scope)
*     // Fiber will be interrupted when scope closes
*     return "done"
*   })
* )
*
* await Effect.runPromise(program) // => "done"
* ```
*
* @category forking
* @since 2.0.0
*/
const forkIn = forkIn$1;
/**
* Forks the fiber in a `Scope`, interrupting it when the scope is closed.
*
* **Example** (Forking into the current scope)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const backgroundTask = Effect.never
*
* const program = Effect.scoped(
*   Effect.gen(function*() {
*     yield* backgroundTask.pipe(Effect.forkScoped)
*
*     // Fiber will be interrupted when scope closes
*     return "scope completed"
*   })
* )
*
* await Effect.runPromise(program) // => "scope completed"
* ```
*
* @category forking
* @since 2.0.0
*/
const forkScoped = forkScoped$1;
/**
* Runs an effect in the background, returning a fiber that can
* be observed or interrupted.
*
* **When to use**
*
* Use when you need to start an effect in the background and receive a fiber.
*
* **Example** (Running an effect in the background)
*
* ```ts import.meta.vitest
* import { Effect, Fiber } from "effect"
* const output: Array<unknown> = []
*
* //      ┌─── Effect<number, never, never>
* //      ▼
* const program = Effect.sync(() => { output.push("running...") }).pipe(Effect.as("done"))
*
* //      ┌─── RuntimeFiber<number, never>
* //      ▼
* const fiber = Effect.runFork(program)
*
* void output.push(await Effect.runPromise(Fiber.join(fiber)))
* output // => ["running...", "done"]
* ```
*
* @category running
* @since 2.0.0
*/
const runFork = runFork$1;
/**
* Runs an effect in the background with the provided services.
*
* **When to use**
*
* Use when an effect still requires services, you already have a `Context`, and
* you want a background fiber.
*
* **Example** (Running with services in the background)
*
* ```ts import.meta.vitest
* import { Context, Effect, Fiber } from "effect"
* const output: Array<unknown> = []
*
* interface Logger {
*   log: (message: string) => void
* }
*
* const Logger = Context.Service<Logger>("Logger")
*
* const services = Context.make(Logger, {
*   log: (message) => void output.push(message)
* })
*
* const program = Effect.gen(function*() {
*   const logger = yield* Logger
*   logger.log("Hello from service!")
*   return "done"
* })
*
* const fiber = Effect.runForkWith(services)(program)
* void output.push(await Effect.runPromise(Fiber.join(fiber)))
* output // => ["Hello from service!", "done"]
* ```
*
* @category running
* @since 4.0.0
*/
const runForkWith = runForkWith$1;
/**
* Executes an effect and returns the result as a `Promise`.
*
* **When to use**
*
* Use when you need to execute an effect and work with the
* result using `Promise` syntax, typically for compatibility with other
* promise-based code.
*
* If the effect succeeds, the promise will resolve with the result. If the
* effect fails, the promise will reject with an error.
*
* **Example** (Running a successful effect as a Promise)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* await Effect.runPromise(Effect.succeed(1)) // => 1
* ```
*
* **Example** (Running effects as promises)
*
* ```ts import.meta.vitest
* //Example: Handling a Failing Effect as a Rejected Promise
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* await Effect.runPromise(Effect.fail("my error")).catch(() => {
*   void output.push("rejected")
* })
* output // => ["rejected"]
* ```
*
* @see {@link runPromiseExit} for a version that returns an `Exit` type instead of rejecting.
* @category running
* @since 2.0.0
*/
const runPromise = runPromise$1;
/**
* Executes an effect synchronously and returns its success value.
*
* **When to use**
*
* Use when you need to execute an effect that is guaranteed to complete
* synchronously.
*
* **Details**
*
* If the effect fails, dies, is interrupted, or performs asynchronous work,
* `runSync` throws a `FiberFailure` instead of returning a value. Use
* `runSyncExit` when you want the failure captured as an `Exit`.
*
* **Example** (Running a synchronous effect)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* const program = Effect.sync(() => {
*   void output.push("Hello, World!")
*   return 1
* })
*
* const result = Effect.runSync(program)
* void output.push(result)
* output // => ["Hello, World!", 1]
* ```
*
* **Example** (Throwing for failed or async effects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* try {
*   // Attempt to run an effect that fails
*   Effect.runSync(Effect.fail("my error"))
* } catch (e) {
*   void output.push("failed effect")
* }
* try {
*   // Attempt to run an effect that involves async work
*   Effect.runSync(Effect.promise(() => Promise.resolve(1)))
* } catch (e) {
*   void output.push("async effect")
* }
* output // => ["failed effect", "async effect"]
* ```
*
* @see {@link runSyncExit} for a version that returns an `Exit` type instead of
* throwing an error.
* @category running
* @since 2.0.0
*/
const runSync$1 = runSync$2;
/**
* Runs an effect synchronously and captures the outcome safely as an `Exit` type, which
* represents the outcome (success or failure) of the effect.
*
* **When to use**
*
* Use to find out whether an effect succeeded or failed,
* including any defects, without dealing with asynchronous operations.
*
* **Details**
*
* The `Exit` type represents the result of the effect. Successful effects are
* wrapped in `Success`, and failed effects are wrapped in `Failure` with a
* `Cause`.
*
* If the effect contains asynchronous operations, `runSyncExit` will
* return an `Failure` with a `Die` cause, indicating that the effect cannot be
* resolved synchronously.
*
* **Example** (Observing synchronous results as Exit)
*
* ```ts import.meta.vitest
* import { Effect, Exit } from "effect"
*
* Effect.runSyncExit(Effect.succeed(1)) // => Exit.succeed(1)
*
* Effect.runSyncExit(Effect.fail("my error")) // => Exit.fail("my error")
* ```
*
* **Example** (Capturing async work as a Die cause)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Exit } from "effect"
*
* const exit = Effect.runSyncExit(Effect.promise(() => Promise.resolve(1)))
* const isAsyncDie = Exit.hasDies(exit) && exit.cause.reasons.some(
*   (reason) => Cause.isDieReason(reason) && Cause.isAsyncFiberError(reason.defect)
* )
*
* isAsyncDie // => true
* ```
*
* @see {@link runSync} for a version that throws on failure.
*
* @category running
* @since 2.0.0
*/
const runSyncExit = runSyncExit$1;
/**
* Creates an Effect-returning function without tracing.
*
* **When to use**
*
* Use when you are defining a reusable Effect function whose implementation
* would otherwise be a normal function returning {@link gen}, especially when
* tracing spans or stack-frame capture are not needed.
*
* **Details**
*
* Compared to a plain function that returns {@link gen}, `Effect.fnUntraced`
* reuses the generator body instead of allocating a fresh generator closure
* around the arguments on every call. It does not record an Effect stack-frame
* boundary and does not create tracing spans. Use {@link fn} when you need
* those stack frames or spans. Additional arguments after the generator body
* act like `pipe` transforms: each transform receives the previous result and
* the original function arguments. Annotate the generator return type with
* `Effect.fn.Return<A, E, R>` when the produced `Effect` type needs to be
* stated explicitly.
*
* **Example** (Defining untraced effect functions)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const f = Effect.fnUntraced(function*(
*   value: string
* ) {
*   return yield* Effect.succeed(value.length)
* })
*
* //      ┌─── Effect.Effect<number>
* //      ▼
* const program = f("hello")
* Effect.runSync(program) // => 5
* ```
*
* **Example** (Transforming the returned Effect)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const f = Effect.fnUntraced(
*   function*(value: string) {
*     return yield* Effect.succeed(value.length)
*   },
*   (effect, value) =>
*     effect.pipe(Effect.map((length) => `${value}: ${length}`))
* )
*
* //      ┌─── Effect.Effect<string>
* //      ▼
* const program = f("hello")
* Effect.runSync(program) // => "hello: 5"
* ```
*
* **Example** (Annotating an untraced non-parametric function)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const f = Effect.fnUntraced(function*(
*   value: string
* ): Effect.fn.Return<number> {
*   return yield* Effect.succeed(value.length)
* })
*
* //      ┌─── Effect.Effect<number>
* //      ▼
* const program = f("hello")
* Effect.runSync(program) // => 5
* ```
*
* **Example** (Annotating an untraced parametric function)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const f = Effect.fnUntraced(function*<A>(
*   value: A
* ): Effect.fn.Return<A> {
*   return yield* Effect.succeed(value)
* })
*
* //      ┌─── Effect.Effect<string>
* //      ▼
* const program = f("hello")
* Effect.runSync(program) // => "hello"
* ```
*
* @category constructors
* @since 3.12.0
*/
const fnUntraced = fnUntraced$1;
/**
* Creates a reusable traced function from an Effect body.
*
* **When to use**
*
* Use when you are defining a reusable Effect function whose implementation
* would otherwise be a normal function returning {@link gen}, and you want
* tracing spans or stack-frame capture.
*
* **Details**
*
* Compared to a plain function that returns {@link gen}, `Effect.fn` reuses the
* generator body instead of allocating a fresh generator closure around the
* arguments on every call. Call `Effect.fn(body, ...)` for a generic
* stack-frame boundary without creating a span. Call
* `Effect.fn("operationName", options?)(body, ...)` when that boundary should
* have a readable operation name and the returned `Effect` should create a
* tracing span when run. {@link SpanOptionsNoTrace} configures span metadata
* such as attributes, links, parent or root selection, kind, sampling, and log
* level. Additional arguments after the generator body act like `pipe`
* transforms: each transform receives the previous result and the original
* function arguments. When those transforms return an `Effect`, the returned
* effect includes stack-frame metadata and, for the named form, a tracing span.
* Generator bodies may declare a `this` parameter; pass `{ self }` before the
* body to bind `this` when the function is created.
*
* **Example** (Defining traced effect functions)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const f = Effect.fn("calculateLength")(function*(value: string) {
*   return yield* Effect.succeed(value.length)
* })
*
* //      ┌─── Effect.Effect<number>
* //      ▼
* const program = f("hello")
* Effect.runSync(program) // => 5
* ```
*
* **Example** (Transforming the returned Effect)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const f = Effect.fn("formatLength")(
*   function*(value: string) {
*     return yield* Effect.succeed(value.length)
*   },
*   (effect, value) =>
*     effect.pipe(Effect.map((length) => `${value}: ${length}`))
* )
*
* //      ┌─── Effect.Effect<string>
* //      ▼
* const program = f("hello")
* Effect.runSync(program) // => "hello: 5"
* ```
*
* **Example** (Binding this)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* class Counter {
*   count = 0
*
*   increment = Effect.fn("Counter.increment")(
*     { self: this },
*     function*(this: Counter, by: number) {
*       this.count += by
*       return yield* Effect.succeed(this.count)
*     }
*   )
* }
*
* const counter = new Counter()
*
* //      ┌─── Effect.Effect<number>
* //      ▼
* const program = counter.increment(1)
* Effect.runSync(program) // => 1
* ```
*
* **Example** (Annotating a traced non-parametric function)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const f = Effect.fn("calculateLength")(function*(
*   value: string
* ): Effect.fn.Return<number> {
*   return yield* Effect.succeed(value.length)
* })
*
* //      ┌─── Effect.Effect<number>
* //      ▼
* const program = f("hello")
* Effect.runSync(program) // => 5
* ```
*
* **Example** (Annotating a traced parametric function)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const f = Effect.fn("succeed")(function*<A>(
*   value: A
* ): Effect.fn.Return<A> {
*   return yield* Effect.succeed(value)
* })
*
* //      ┌─── Effect.Effect<string>
* //      ▼
* const program = f("hello")
* Effect.runSync(program) // => "hello"
* ```
*
* @category constructors
* @since 3.11.0
*/
const fn = fn$1;
/**
* Retrieves the `Clock` service from the context and provides it to the
* specified effectful function.
*
* **Example** (Accessing the Clock service)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const program = Effect.clockWith((clock) =>
*   clock.currentTimeMillis.pipe(
*     Effect.map(() => "Clock is available")
*   )
* )
*
* Effect.runSync(program) // => "Clock is available"
* ```
*
* @category accessors
* @since 2.0.0
*/
const clockWith = clockWith$1;
/**
* Logs one or more messages at the WARNING level.
*
* **Example** (Logging warnings)
*
* ```ts import.meta.vitest
* import { Effect, Logger } from "effect"
* const output: Array<unknown> = []
*
* const program = Effect.gen(function*() {
*   yield* Effect.logWarning("API rate limit approaching")
* })
*
* const logger = Logger.make<unknown, void>(({ logLevel, message }) => {
*   void output.push(`${logLevel}: ${Array.isArray(message) ? message.map(String).join(" ") : String(message)}`)
* })
* Effect.runSync(Effect.provide(program, Logger.layer([logger])))
* output // => ["Warn: API rate limit approaching"]
* ```
*
* @category logging
* @since 2.0.0
*/
const logWarning = /*#__PURE__*/ logWithLevel("Warn");
/**
* Adds an annotation to each log line in this effect.
*
* **Example** (Adding log annotations)
*
* ```ts import.meta.vitest
* import { Effect, Logger } from "effect"
* const output: Array<unknown> = []
*
* const program = Effect.gen(function*() {
*   yield* Effect.log("Starting operation")
* })
*
* // Add annotations to all log messages
* const annotatedProgram = Effect.annotateLogs(program, {
*   userId: "user123",
*   operation: "data-processing"
* })
*
* // Also supports single key-value annotations
* const singleAnnotated = Effect.annotateLogs(program, "requestId", "req-456")
*
* const logger = Logger.make<unknown, void>(({ message }) =>
*   void output.push(Array.isArray(message) ? message.join(" ") : String(message))
* )
* const run = (effect: Effect.Effect<void>) =>
*   Effect.runSync(Effect.provide(effect, Logger.layer([logger])))
* run(annotatedProgram)
* run(singleAnnotated)
* output // => ["Starting operation", "Starting operation"]
* ```
*
* @category logging
* @since 2.0.0
*/
const annotateLogs = /*#__PURE__*/ dual((args) => isEffect(args[0]), (effect, ...args) => updateService(effect, CurrentLogAnnotations, (annotations) => {
	const newAnnotations = args.length === 1 ? {
		...annotations,
		...args[0]
	} : { ...annotations };
	if (args.length === 1) return newAnnotations;
	else assignProperty(newAnnotations, args[0], args[1]);
	return newAnnotations;
}));
/**
* Applies `map` eagerly when an effect is already resolved.
*
* **When to use**
*
* Use when an already-resolved effect should apply a success transformation
* immediately while pending effects still use regular mapping.
*
* **Details**
*
* Success effects apply the mapping function immediately. Failure effects pass
* through unchanged, and pending effects fall back to regular `map` behavior.
*
* **Example** (Mapping already completed effects)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* // For resolved effects, the mapping is applied immediately
* const resolved = Effect.succeed(5)
* const mapped = Effect.mapEager(resolved, (n) => n * 2) // Applied eagerly
*
* // For pending effects, behaves like regular map
* const pending = Effect.delay(Effect.succeed(5), 0)
* const mappedPending = Effect.mapEager(pending, (n) => n * 2) // Uses regular map
*
* await Effect.runPromise(Effect.all([mapped, mappedPending])) // => [10, 10]
* ```
*
* @category mapping
* @since 4.0.0
*/
const mapEager = mapEager$1;
/**
* Applies `flatMap` eagerly when an effect is already resolved.
*
* **When to use**
*
* Use when an already-resolved successful effect should bind immediately to the
* next effect while pending effects still use regular flat mapping.
*
* **Details**
*
* Success effects apply the flatMap function immediately. Failure effects pass
* through unchanged, and pending effects fall back to regular `flatMap`
* behavior.
*
* **Example** (Flat mapping eagerly when possible)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* // For resolved effects, the flatMap is applied immediately
* const resolved = Effect.succeed(5)
* const flatMapped = Effect.flatMapEager(resolved, (n) => Effect.succeed(n * 2)) // Applied eagerly
*
* // For pending effects, behaves like regular flatMap
* const pending = Effect.delay(Effect.succeed(5), 0)
* const flatMappedPending = Effect.flatMapEager(
*   pending,
*   (n) => Effect.succeed(n * 2)
* ) // Uses regular flatMap
*
* await Effect.runPromise(Effect.all([flatMapped, flatMappedPending])) // => [10, 10]
* ```
*
* @category sequencing
* @since 4.0.0
*/
const flatMapEager = flatMapEager$1;
/**
* Applies `catch` eagerly when an effect is already resolved.
*
* **When to use**
*
* Use when an already-resolved failed effect should recover immediately while
* pending effects still use regular error recovery.
*
* **Details**
*
* Success effects pass through unchanged because there is no error to catch.
* Failure effects apply the catch function immediately, and pending effects
* fall back to regular `catch` behavior.
*
* **Example** (Catching failures eagerly when possible)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
* const output: Array<unknown> = []
*
* // For resolved failure effects, the catch function is applied immediately
* const failed = Effect.fail("original error")
* const recovered = Effect.catchEager(
*   failed,
*   (err: string) => Effect.succeed(`recovered from: ${err}`)
* ) // Applied eagerly
*
* // For success effects, returns success as-is
* const success = Effect.succeed(42)
* const unchanged = Effect.catchEager(
*   success,
*   (err: string) => Effect.succeed(`recovered from: ${err}`)
* ) // Returns success as-is
*
* // For pending effects, behaves like regular catch
* const pending = Effect.delay(Effect.fail("error"), 0)
* const recoveredPending = Effect.catchEager(
*   pending,
*   (err: string) => Effect.succeed(`recovered from: ${err}`)
* ) // Uses regular catch
*
* void output.push(await Effect.runPromise(Effect.all([
*   recovered,
*   unchanged,
*   recoveredPending
* ])))
* output // => [['recovered from: original error', 42, 'recovered from: error']]
* ```
*
* @category error handling
* @since 4.0.0
*/
const catchEager = catchEager$1;
/**
* Creates untraced function effects with eager evaluation optimization.
*
* **Details**
*
* Executes generator functions eagerly when all yielded effects are synchronous,
* stopping at the first async effect and deferring to normal execution.
*
* **Example** (Defining eager untraced effect functions)
*
* ```ts import.meta.vitest
* import { Effect } from "effect"
*
* const computation = Effect.fnUntracedEager(function*() {
*   yield* Effect.succeed(1)
*   yield* Effect.succeed(2)
*   return "computed eagerly"
* })
*
* const effect = computation() // Executed immediately if all effects are sync
* Effect.runSync(effect) // => "computed eagerly"
* ```
*
* @category constructors
* @since 4.0.0
*/
const fnUntracedEager = fnUntracedEager$1;
/**
* Creates a `DateTime` safely from supported input values.
*
* **Details**
*
* - A `DateTime`
* - A JavaScript `Date`
* - The number of milliseconds since the Unix epoch
* - An object with date and time parts
* - A string that can be parsed as a date
*
* Returns `Some` with the constructed `DateTime` when the input is valid, or
* `None` when construction would fail, including invalid `Date` instances or
* unparseable strings.
*
* **Example** (Creating optional DateTime values)
*
* ```ts import.meta.vitest
* import { DateTime, Option } from "effect"
*
* // from Date
* DateTime.make(new Date("2024-01-01T12:00:00Z")) // => Option.some(DateTime.makeUnsafe("2024-01-01T12:00:00Z"))
*
* // from parts
* DateTime.make({ year: 2024 }) // => Option.some(DateTime.makeUnsafe("2024-01-01T00:00:00Z"))
*
* // from string
* DateTime.make("2024-01-01") // => Option.some(DateTime.makeUnsafe("2024-01-01T00:00:00Z"))
*
* DateTime.make("not a date") // => Option.none()
* ```
*
* @category constructors
* @since 3.6.0
*/
const make$19 = make$20;
/**
* Gets the current time using the `Clock` service and converts it to a `DateTime`.
*
* **Example** (Getting the current DateTime)
*
* ```ts import.meta.vitest
* import { DateTime, Effect } from "effect"
* import { TestClock } from "effect/testing"
*
* await Effect.runPromise(Effect.map(DateTime.now, DateTime.isDateTime)) // => true
* ```
*
* @category constructors
* @since 3.6.0
*/
const now = now$1;
/**
* Formats a `DateTime` as a UTC ISO string.
*
* **Details**
*
* Always returns the UTC representation in ISO 8601 format, ignoring any time zone.
*
* **Example** (Formatting DateTime values as ISO strings)
*
* ```ts import.meta.vitest
* import { DateTime } from "effect"
*
* DateTime.formatIso(DateTime.makeUnsafe("2024-01-01T12:30:45.123Z")) // => "2024-01-01T12:30:45.123Z"
*
* const zoned = DateTime.makeZonedUnsafe("2024-01-01T12:30:45.123Z", {
*   timeZone: "Europe/London"
* })
* DateTime.formatIso(zoned) // => "2024-01-01T12:30:45.123Z"
* ```
*
* @category formatting
* @since 3.6.0
*/
const formatIso = formatIso$1;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const codes = /*#__PURE__*/ (/* @__PURE__ */ new Uint8Array(123)).fill(255);
for (let i = 0; i < 64; i++) codes[/*#__PURE__*/ alphabet.charCodeAt(i)] = i;
codes[/*#__PURE__*/ "=".charCodeAt(0)] = 0;
//#endregion
//#region node_modules/effect/dist/http/Cookies.js
/**
* Models HTTP cookies and cookie collections for requests and responses.
*
* A `Cookie` stores a name, value, encoded value, and standard cookie
* attributes. A `Cookies` value is an immutable collection keyed by cookie
* name. This module parses request `Cookie` headers, builds response
* `Set-Cookie` headers, and provides helpers for adding, removing, merging, and
* expiring cookies.
*
* @stability unstable
* @since 4.0.0
*/
const TypeId$25 = "~effect/http/Cookies";
const CookieTypeId = "~effect/http/Cookies/Cookie";
const CookieErrorTypeId = "~effect/http/Cookies/CookieError";
/**
* Error reason describing why cookie construction failed, such as invalid name,
* value, domain, path, or infinite max-age.
*
* @stability unstable
* @category errors
* @since 4.0.0
*/
var CookiesErrorReason = class extends Error$2 {};
/**
* Error returned when a cookie name, value, domain, path, or max-age option is invalid.
*
* **Details**
*
* Inspect `reason` to determine the specific validation failure.
*
* @stability unstable
* @category errors
* @since 4.0.0
*/
var CookiesError = class CookiesError extends (/*#__PURE__*/ TaggedError$1("CookiesError")) {
	/**
	* Creates a cookie error from a reason tag and optional cause.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	static fromReason(reason, cause) {
		return new CookiesError({ reason: new CookiesErrorReason({
			_tag: reason,
			cause
		}) });
	}
	/**
	* Marks this value as a cookie validation error for runtime guards.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	[CookieErrorTypeId] = CookieErrorTypeId;
	/**
	* Uses the concrete cookie error reason as the public message.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get message() {
		return this.reason._tag;
	}
};
const Proto$11 = {
	[TypeId$25]: TypeId$25,
	...BaseProto,
	toJSON() {
		return {
			_id: "effect/Cookies",
			cookies: map$6(this.cookies, (cookie) => cookie.toJSON())
		};
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
/**
* Creates a `Cookies` collection from an existing readonly record of cookies keyed by cookie name.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const fromReadonlyRecord = (cookies) => {
	const self = Object.create(Proto$11);
	self.cookies = cookies;
	return self;
};
/**
* Create a Cookies object from an Iterable
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const fromIterable = (cookies) => {
	const record = {};
	for (const cookie of cookies) assignProperty(record, cookie.name, cookie);
	return fromReadonlyRecord(record);
};
/**
* Create a Cookies object from a set of Set-Cookie headers
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const fromSetCookie = (headers) => {
	const arrayHeaders = typeof headers === "string" ? [headers] : headers;
	const cookies = [];
	for (const header of arrayHeaders) {
		const cookie = parseSetCookie(header.trim());
		if (cookie) cookies.push(cookie);
	}
	return fromIterable(cookies);
};
function parseSetCookie(header) {
	const parts = header.split(";").map((_) => _.trim()).filter((_) => _ !== "");
	if (parts.length === 0) return;
	const firstEqual = parts[0].indexOf("=");
	if (firstEqual === -1) return;
	const name = parts[0].slice(0, firstEqual);
	if (!cookieNameRegExp.test(name)) return;
	const valueEncoded = parts[0].slice(firstEqual + 1);
	const value = tryDecodeURIComponent(valueEncoded);
	if (parts.length === 1) return Object.assign(Object.create(CookieProto), {
		name,
		value,
		valueEncoded
	});
	const options = {};
	for (let i = 1; i < parts.length; i++) {
		const part = parts[i];
		const equalIndex = part.indexOf("=");
		const key = equalIndex === -1 ? part : part.slice(0, equalIndex).trim();
		const value = equalIndex === -1 ? void 0 : part.slice(equalIndex + 1).trim();
		switch (key.toLowerCase()) {
			case "domain": {
				if (value === void 0) break;
				const domain = value.trim().replace(/^\./, "");
				if (domain) options.domain = domain;
				break;
			}
			case "expires": {
				if (value === void 0) break;
				const date = new Date(value);
				if (!isNaN(date.getTime())) options.expires = date;
				break;
			}
			case "max-age": {
				if (value === void 0) break;
				const maxAge = parseInt(value, 10);
				if (!isNaN(maxAge)) options.maxAge = seconds(maxAge);
				break;
			}
			case "path":
				if (value === void 0) break;
				if (value[0] === "/") options.path = value;
				break;
			case "priority":
				if (value === void 0) break;
				switch (value.toLowerCase()) {
					case "low":
						options.priority = "low";
						break;
					case "medium":
						options.priority = "medium";
						break;
					case "high": options.priority = "high";
				}
				break;
			case "httponly":
				options.httpOnly = true;
				break;
			case "secure":
				options.secure = true;
				break;
			case "partitioned":
				options.partitioned = true;
				break;
			case "samesite":
				if (value === void 0) break;
				switch (value.toLowerCase()) {
					case "lax":
						options.sameSite = "lax";
						break;
					case "strict":
						options.sameSite = "strict";
						break;
					case "none": options.sameSite = "none";
				}
		}
	}
	return Object.assign(Object.create(CookieProto), {
		name,
		value,
		valueEncoded,
		options: Object.keys(options).length > 0 ? options : void 0
	});
}
/**
* An empty Cookies object
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const empty$6 = /*#__PURE__*/ fromIterable([]);
/**
* Returns `true` when the `Cookies` collection contains no cookies.
*
* @stability unstable
* @category predicates
* @since 4.0.0
*/
const isEmpty = (self) => isEmptyRecord(self.cookies);
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
const cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const cookieDomainRegExp = /^[\u0009\u0020-\u003a\u003c-\u007e\u0080-\u00ff]+$/;
const cookiePathRegExp = /^[\u0020-\u003a\u003c-\u007e]+$/;
const CookieProto = {
	[CookieTypeId]: CookieTypeId,
	...BaseProto,
	toJSON() {
		return {
			_id: "effect/Cookies/Cookie",
			name: this.name,
			value: this.value,
			options: this.options
		};
	}
};
function validateCookie(name, encodedValue, options) {
	if (!cookieNameRegExp.test(name)) return CookiesError.fromReason("InvalidCookieName");
	if (encodedValue && !fieldContentRegExp.test(encodedValue)) return CookiesError.fromReason("InvalidCookieValue");
	if (options?.domain !== void 0 && !cookieDomainRegExp.test(options.domain)) return CookiesError.fromReason("InvalidCookieDomain");
	if (options?.path !== void 0 && !cookiePathRegExp.test(options.path)) return CookiesError.fromReason("InvalidCookiePath");
	if (options?.maxAge !== void 0 && !isFinite$1(fromInputUnsafe(options.maxAge))) return CookiesError.fromReason("CookieInfinityMaxAge");
}
/**
* Serializes a cookie into a string.
*
* **Details**
*
* Adapted from https://github.com/fastify/fastify-cookie under MIT License
*
* @stability unstable
* @category encoding
* @since 4.0.0
*/
function serializeCookie(self) {
	const error = validateCookie(self.name, self.valueEncoded, self.options);
	if (error !== void 0) throw error;
	let str = self.name + "=" + self.valueEncoded;
	if (self.options === void 0) return str;
	const options = self.options;
	if (options.maxAge !== void 0) {
		const maxAge = toSeconds(fromInputUnsafe(options.maxAge));
		str += "; Max-Age=" + Math.trunc(maxAge);
	}
	if (options.domain !== void 0) str += "; Domain=" + options.domain;
	if (options.path !== void 0) str += "; Path=" + options.path;
	if (options.priority !== void 0) switch (options.priority) {
		case "low":
			str += "; Priority=Low";
			break;
		case "medium":
			str += "; Priority=Medium";
			break;
		case "high": str += "; Priority=High";
	}
	if (options.expires !== void 0) str += "; Expires=" + options.expires.toUTCString();
	if (options.httpOnly) str += "; HttpOnly";
	if (options.secure) str += "; Secure";
	if (options.partitioned) str += "; Partitioned";
	if (options.sameSite !== void 0) switch (options.sameSite) {
		case "lax":
			str += "; SameSite=Lax";
			break;
		case "strict":
			str += "; SameSite=Strict";
			break;
		case "none": str += "; SameSite=None";
	}
	return str;
}
/**
* Serializes a `Cookies` collection into an array of `Set-Cookie` header values.
*
* @stability unstable
* @category encoding
* @since 4.0.0
*/
const toSetCookieHeaders = (self) => Object.values(self.cookies).map(serializeCookie);
const tryDecodeURIComponent = (str) => {
	try {
		return decodeURIComponent(str);
	} catch (_) {
		return str;
	}
};
//#endregion
//#region node_modules/effect/dist/internal/redacted.js
/** @internal */
const redactedRegistry = /*#__PURE__*/ new WeakMap();
//#endregion
//#region node_modules/effect/dist/Redacted.js
/**
* Wraps sensitive values so normal output does not reveal them.
*
* A `Redacted<A>` shows a redacted placeholder in string, JSON, and inspection
* output, while still storing the original value for trusted code that needs to
* recover it. This helps reduce accidental leaks in logs and diagnostics. This
* module includes constructors, runtime checks, value recovery, wiping of stored
* values, and comparison helpers that avoid exposing the wrapped value at the
* call site.
*
* @since 3.3.0
*/
const TypeId$24 = "~effect/Redacted";
/**
* Returns `true` if a value is a `Redacted` wrapper.
*
* **When to use**
*
* Use to validate unknown input and narrow it to `Redacted`.
*
* **Details**
*
* When this function returns `true`, TypeScript narrows the value to
* `Redacted<unknown>`.
*
* **Example** (Checking for redacted values)
*
* ```ts import.meta.vitest
* import { Redacted } from "effect"
*
* const secret = Redacted.make("my-secret")
* const plainString = "not-secret"
*
* Redacted.isRedacted(secret) // => true
* Redacted.isRedacted(plainString) // => false
* ```
*
* @category guards
* @since 3.3.0
*/
const isRedacted = (u) => hasProperty(u, TypeId$24);
/**
* Creates a `Redacted` wrapper for a sensitive value.
*
* **When to use**
*
* Use to wrap a sensitive value so normal string, JSON, and inspection output
* is redacted.
*
* **Details**
*
* The wrapper redacts string, JSON, and inspection output to reduce accidental
* disclosure. The original value remains retrievable with `Redacted.value`
* until the wrapper is wiped or becomes unreachable.
*
* **Example** (Creating a redacted value)
*
* ```ts import.meta.vitest
* import { Redacted } from "effect"
*
* const API_KEY = Redacted.make("1234567890")
* String(API_KEY) // => "<redacted>"
* ```
*
* @category constructors
* @since 3.3.0
*/
const make$18 = (value, options) => {
	const self = Object.create(Proto$10);
	if (options?.label) self.label = options.label;
	redactedRegistry.set(self, value);
	return self;
};
const Proto$10 = {
	[TypeId$24]: { _A: (_) => _ },
	label: void 0,
	...PipeInspectableProto,
	toJSON() {
		return this.toString();
	},
	toString() {
		return `<redacted${isString(this.label) ? ":" + this.label : ""}>`;
	},
	[symbol$1]() {
		return hash(redactedRegistry.get(this));
	},
	[symbol](that) {
		return isRedacted(that) && equals$1(redactedRegistry.get(this), redactedRegistry.get(that));
	}
};
//#endregion
//#region node_modules/effect/dist/http/Headers.js
/**
* Models HTTP headers for the unstable HTTP client and server modules.
*
* `Headers` values are immutable maps keyed by lowercase header name. This
* module converts common header inputs into that shape, provides helpers for
* reading and updating header values, and redacts configured sensitive headers
* when values are inspected.
*
* @stability unstable
* @since 4.0.0
*/
/**
* Runtime type identifier for `Headers` values.
*
* @stability unstable
* @category type IDs
* @since 4.0.0
*/
const TypeId$23 = /*#__PURE__*/ Symbol.for("~effect/http/Headers");
const Proto$9 = /*#__PURE__*/ Object.defineProperties(/*#__PURE__*/ Object.create(null), {
	[TypeId$23]: { value: TypeId$23 },
	[symbolRedactable]: { value(context) {
		return redact(this, get(context, CurrentRedactedNames));
	} },
	toJSON: { value() {
		return redact$1(this);
	} },
	[symbol]: { value(that) {
		return Equivalence$1(this, that);
	} },
	[symbol$1]: { value() {
		return structure(this);
	} },
	toString: { value: BaseProto.toString },
	[NodeInspectSymbol]: { value: BaseProto[NodeInspectSymbol] }
});
const make$17 = (input) => Object.assign(Object.create(Proto$9), input);
/**
* Provides an `Equivalence` instance that compares `Headers` by header names
* and string values.
*
* @stability unstable
* @category instances
* @since 4.0.0
*/
const Equivalence$1 = /*#__PURE__*/ makeEquivalence$1(/*#__PURE__*/ strictEqual());
/**
* An empty `Headers` collection.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const empty$5 = /*#__PURE__*/ Object.create(Proto$9);
/**
* Creates `Headers` from a record or iterable of header entries.
*
* **Details**
*
* Header names are normalized to lowercase. Array values in record input are joined with `", "`, and `undefined` values are omitted.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const fromInput$1 = (input) => {
	if (input === void 0) return empty$5;
	else if (Symbol.iterator in input) {
		const out = Object.create(Proto$9);
		for (const [k, v] of input) out[k.toLowerCase()] = v;
		return out;
	}
	const out = Object.create(Proto$9);
	for (const [k, v] of Object.entries(input)) if (Array.isArray(v)) out[k.toLowerCase()] = v.join(", ");
	else if (v !== void 0) out[k.toLowerCase()] = v;
	return out;
};
/**
* Treats an existing record as `Headers` unsafely.
*
* **Gotchas**
*
* This mutates the record's prototype and does not normalize header names; callers must provide the expected lowercase keys.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const fromRecordUnsafe = (input) => Object.setPrototypeOf(input, Proto$9);
/**
* Returns a new `Headers` collection with the given header set.
*
* **Details**
*
* The header name is normalized to lowercase.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const set$1 = /*#__PURE__*/ dual(3, (self, key, value) => {
	const out = make$17(self);
	out[key.toLowerCase()] = value;
	return out;
});
/**
* Returns a new `Headers` collection with all provided headers set.
*
* **Details**
*
* Input headers are normalized with `fromInput` and override existing headers with the same lowercase name.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const setAll$1 = /*#__PURE__*/ dual(2, (self, headers) => make$17({
	...self,
	...fromInput$1(headers)
}));
/**
* Returns a new `Headers` collection containing headers from both collections.
*
* **Details**
*
* Headers from the second collection override headers from the first collection with the same name.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const merge$2 = /*#__PURE__*/ dual(2, (self, headers) => {
	const out = make$17(self);
	Object.assign(out, headers);
	return out;
});
/**
* Returns a new `Headers` collection with the named header removed.
*
* **Details**
*
* The provided header name is normalized to lowercase before removal.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const remove$1 = /*#__PURE__*/ dual(2, (self, key) => {
	const out = make$17(self);
	delete out[key.toLowerCase()];
	return out;
});
/**
* Returns a plain record with selected header values wrapped in `Redacted`.
*
* **Details**
*
* String keys are normalized to lowercase before matching; regular expressions are tested against the stored header names.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const redact = /*#__PURE__*/ dual(2, (self, key) => {
	const out = { ...self };
	const modify = (key) => {
		if (typeof key === "string") {
			const k = key.toLowerCase();
			if (k in self) out[k] = make$18(self[k]);
		} else for (const name in self) if (name.search(key) !== -1) out[name] = make$18(self[name]);
	};
	if (Array.isArray(key)) for (let i = 0; i < key.length; i++) modify(key[i]);
	else modify(key);
	return out;
});
/**
* Checks whether a header name matches one of the redaction patterns.
*
* **Details**
*
* String patterns are compared case-insensitively against the header name;
* regular expressions are tested against it. Use to avoid the record copy of
* `redact` when only a membership check is needed.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const isRedactedName = (name, patterns) => {
	for (let i = 0; i < patterns.length; i++) {
		const pattern = patterns[i];
		if (typeof pattern === "string") {
			if (pattern.toLowerCase() === name.toLowerCase()) return true;
		} else if (name.search(pattern) !== -1) return true;
	}
	return false;
};
/**
* Context reference listing header names or patterns that should be redacted when `Headers` are inspected or rendered.
*
* **Details**
*
* Defaults include `authorization`, `cookie`, `set-cookie`, and `x-api-key`.
*
* @stability unstable
* @category services
* @since 4.0.0
*/
const CurrentRedactedNames = /*#__PURE__*/ Reference("effect/Headers/CurrentRedactedNames", { defaultValue: () => [
	"authorization",
	"cookie",
	"set-cookie",
	"x-api-key"
] });
//#endregion
//#region node_modules/effect/dist/http/UrlParams.js
/**
* Models URL query parameters as ordered string pairs.
*
* `UrlParams` is used for HTTP client query strings, URL-encoded form bodies,
* and server-side decoding. Values can be built from records, iterables, or
* native `URLSearchParams`, then updated, serialized, converted to a `URL`, or
* decoded with schemas.
*
* @stability unstable
* @since 4.0.0
*/
const TypeId$22 = "~effect/http/UrlParams";
/**
* Returns `true` when a value is a `UrlParams` instance.
*
* @stability unstable
* @category guards
* @since 4.0.0
*/
const isUrlParams = (u) => hasProperty(u, TypeId$22);
const Proto$8 = {
	...PipeInspectableProto,
	[TypeId$22]: TypeId$22,
	[Symbol.iterator]() {
		return this.params[Symbol.iterator]();
	},
	toJSON() {
		return {
			_id: "UrlParams",
			params: Object.fromEntries(this.params)
		};
	},
	[symbol](that) {
		return Equivalence(this, that);
	},
	[symbol$1]() {
		return array$1(this.params.flat());
	}
};
/**
* Creates `UrlParams` from ordered string key-value pairs.
*
* **Details**
*
* The input pairs are used as-is and are not coerced or normalized.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const make$16 = (params) => {
	const self = Object.create(Proto$8);
	self.params = params;
	return self;
};
/**
* Creates `UrlParams` from a supported input shape.
*
* **Details**
*
* Primitive values are converted to strings, arrays produce repeated parameters,
* nested records use bracket notation, and `undefined` values are omitted.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const fromInput = (input) => {
	if (isUrlParams(input)) return input;
	const parsed = fromInputNested(input);
	const out = [];
	for (let i = 0; i < parsed.length; i++) if (Array.isArray(parsed[i][0])) {
		const [keys, value] = parsed[i];
		out.push([`${keys[0]}[${keys.slice(1).join("][")}]`, value]);
	} else out.push(parsed[i]);
	return make$16(out);
};
const fromInputNested = (input) => {
	const entries = typeof input[Symbol.iterator] === "function" ? fromIterable$1(input) : Object.entries(input);
	const out = [];
	for (const [key, value] of entries) if (Array.isArray(value)) {
		for (let i = 0; i < value.length; i++) if (value[i] !== void 0) out.push([key, String(value[i])]);
	} else if (value !== null && typeof value === "object") {
		const nested = fromInputNested(value);
		for (const [k, v] of nested) out.push([[key, ...typeof k === "string" ? [k] : k], v]);
	} else if (value !== void 0) out.push([key, String(value)]);
	return out;
};
/**
* Provides an order-sensitive `Equivalence` instance for `UrlParams`.
*
* **Details**
*
* Two values are equivalent when they contain the same key-value pairs in the same
* order.
*
* @stability unstable
* @category instances
* @since 4.0.0
*/
const Equivalence = /*#__PURE__*/ make$27((a, b) => arrayEquivalence(a.params, b.params));
const arrayEquivalence = /*#__PURE__*/ makeEquivalence(/*#__PURE__*/ makeEquivalence$2([/*#__PURE__*/ strictEqual(), /*#__PURE__*/ strictEqual()]));
/**
* An empty `UrlParams` value.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const empty$4 = /*#__PURE__*/ make$16([]);
/**
* Sets multiple query parameters from input.
*
* **Details**
*
* Keys present in the input replace existing values for those keys, while
* unmentioned existing parameters are preserved.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const setAll = /*#__PURE__*/ dual(2, (self, input) => {
	const params = fromInput(input).params.slice();
	const keys = /* @__PURE__ */ new Set();
	for (let i = 0; i < params.length; i++) keys.add(params[i][0]);
	for (let i = 0; i < self.params.length; i++) {
		if (keys.has(self.params[i][0])) continue;
		params.push(self.params[i]);
	}
	return make$16(params);
});
/**
* Serializes `UrlParams` to a URL query string without a leading question mark.
*
* @stability unstable
* @category converting
* @since 4.0.0
*/
const toString = (input) => new URLSearchParams(fromInput(input).params).toString();
//#endregion
//#region node_modules/effect/dist/internal/schema/annotations.js
/** @internal */
function resolve$1(ast) {
	return ast.checks ? ast.checks[ast.checks.length - 1].annotations : ast.annotations;
}
/** @internal */
const STRUCTURAL_ANNOTATION_KEY = "~structural";
/** @internal */
const SENTINELS_ANNOTATION_KEY = "~sentinels";
/** @internal */
const CONSTRUCTOR_ANNOTATION_KEY = "~constructor";
/** @internal */
const getExpected = /*#__PURE__*/ memoize((ast) => {
	const identifier = resolve$1(ast)?.identifier;
	if (typeof identifier === "string") return identifier;
	return ast.getExpected(getExpected);
});
//#endregion
//#region node_modules/effect/dist/internal/schema/parser.js
/** @internal */
const missing = /*#__PURE__*/ Symbol();
/** @internal */
const succeed$2 = succeed$5;
/** @internal */
const missingExit = /*#__PURE__*/ succeed$2(missing);
/** @internal */
const sameExit = /*#__PURE__*/ succeed$2(missing);
/** @internal */
const toOption = (value) => value === missing ? none() : some(value);
/** @internal */
const fromOptionExit = (option) => option._tag === "None" ? missingExit : succeed$2(option.value);
//#endregion
//#region node_modules/effect/dist/SchemaIssue.js
/**
* Describes problems found while decoding, encoding, or checking data with
* schemas.
*
* An `Issue` records what failed and, for nested data, where the failure
* happened. The Schema system uses these values for missing keys, unexpected
* keys, invalid types, invalid values, failed filters, failed transformations,
* and alternatives that did not match. This module also formats issues.
*
* @since 4.0.0
*/
const TypeId$21 = "~effect/SchemaIssue/Issue";
/**
* Returns `true` if the given value is an {@link Issue}.
*
* **When to use**
*
* Use when you need to narrow an `unknown` value to `Issue` in error-handling
* code, such as distinguishing an `Issue` from other error types in a catch-all
* handler.
*
* **Details**
*
* - Checks for the internal `TypeId` brand on the value.
*
* **Example** (Type-guarding an unknown error)
*
* ```ts import.meta.vitest
* import { SchemaIssue } from "effect"
*
* const issue = new SchemaIssue.MissingKey(undefined)
* SchemaIssue.isIssue(issue) // => true
* SchemaIssue.isIssue("not an issue") // => false
* ```
*
* @see {@link Issue}
*
* @category guards
* @since 4.0.0
*/
function isIssue(u) {
	return hasProperty(u, TypeId$21) && u[TypeId$21] === TypeId$21;
}
/**
* Returns `true` when an issue contains an input reported by the schema parser.
*
* **When to use**
*
* Use when reading `Issue.input`, especially when `undefined` is a valid input
* value.
*
* **Details**
*
* Reported input is stored as an own property. This guard checks for that
* property and narrows `input` from optional to required.
*
* **Example** (Reading a reported input)
*
* ```ts import.meta.vitest
* import { Result, Schema, SchemaIssue } from "effect"
*
* const result = Schema.decodeUnknownResult(Schema.String)(1, { reportInput: true })
* if (Result.isFailure(result) && SchemaIssue.hasInput(result.failure.issue)) {
*   result.failure.issue.input // => 1
* }
* ```
*
* @see {@link Issue} for the complete issue model
*
* @category guards
* @since 4.0.0
*/
function hasInput(issue) {
	return Object.hasOwn(issue, "input");
}
var IssueNodeImpl = class {
	[TypeId$21] = TypeId$21;
	constructor(input, options) {
		if (options?.reportInput === true && input !== missing) this.input = input;
	}
};
/**
* Constructs a schema issue for a failed refinement check.
*
* @category constructors
* @since 4.0.0
*/
const Filter$1 = class extends IssueNodeImpl {
	_tag = "Filter";
	/**
	* The filter that failed.
	*/
	filter;
	/**
	* The issue that occurred.
	*/
	issue;
	constructor(filter, issue, input, options) {
		super(input, options);
		this.filter = filter;
		this.issue = issue;
	}
};
/**
* Constructs a schema issue for a failed transformation.
*
* @category constructors
* @since 4.0.0
*/
const Encoding = class extends IssueNodeImpl {
	_tag = "Encoding";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The issue that occurred.
	*/
	issue;
	constructor(ast, issue, input, options) {
		super(input, options);
		this.ast = ast;
		this.issue = issue;
	}
};
/**
* Constructs a schema issue that points to a nested location.
*
* @category constructors
* @since 4.0.0
*/
const Pointer = class extends IssueNodeImpl {
	_tag = "Pointer";
	/**
	* The path to the location in the input that caused the issue.
	*/
	path;
	/**
	* The issue that occurred.
	*/
	issue;
	constructor(path, issue) {
		super();
		this.path = path;
		this.issue = issue;
	}
};
/**
* Constructs a schema issue for a missing key or tuple index.
*
* @category constructors
* @since 4.0.0
*/
const MissingKey = class extends IssueNodeImpl {
	_tag = "MissingKey";
	/**
	* The metadata for the issue.
	*/
	annotations;
	constructor(annotations) {
		super();
		this.annotations = annotations;
	}
};
/**
* Constructs a schema issue for an unexpected key or tuple index.
*
* @category constructors
* @since 4.0.0
*/
const UnexpectedKey = class extends IssueNodeImpl {
	_tag = "UnexpectedKey";
	/**
	* The schema that caused the issue.
	*/
	ast;
	constructor(ast, input, options) {
		super(input, options);
		this.ast = ast;
	}
};
/**
* Constructs a schema issue that groups multiple child issues.
*
* @category constructors
* @since 4.0.0
*/
const Composite = class extends IssueNodeImpl {
	_tag = "Composite";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The issues that occurred.
	*/
	issues;
	constructor(ast, issues, input, options) {
		super(input, options);
		this.ast = ast;
		this.issues = issues;
	}
};
/**
* Constructs a schema issue for an input with an invalid runtime type.
*
* @category constructors
* @since 4.0.0
*/
const InvalidType = class extends IssueNodeImpl {
	_tag = "InvalidType";
	/**
	* The schema that caused the issue.
	*/
	ast;
	constructor(ast, input, options) {
		super(input, options);
		this.ast = ast;
	}
};
/**
* Constructs a schema issue for a value that violates a constraint.
*
* @category constructors
* @since 4.0.0
*/
const InvalidValue = class extends IssueNodeImpl {
	_tag = "InvalidValue";
	/**
	* The metadata for the issue.
	*/
	annotations;
	constructor(annotations, input, options) {
		super(input, options);
		this.annotations = annotations;
	}
};
/**
* Constructs a schema issue for a value that matches no union member.
*
* @category constructors
* @since 4.0.0
*/
const AnyOf = class extends IssueNodeImpl {
	_tag = "AnyOf";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The issues that occurred.
	*/
	issues;
	constructor(ast, issues, input, options) {
		super(input, options);
		this.ast = ast;
		this.issues = issues;
	}
};
/**
* Constructs a schema issue for a value that matches multiple union members.
*
* @category constructors
* @since 4.0.0
*/
const OneOf = class extends IssueNodeImpl {
	_tag = "OneOf";
	/**
	* The schema that caused the issue.
	*/
	ast;
	/**
	* The schemas that were successful.
	*/
	successes;
	constructor(ast, successes, input, options) {
		super(input, options);
		this.ast = ast;
		this.successes = successes;
	}
};
function makeFilterIssue(entry, input, options) {
	if (isIssue(entry)) return entry;
	if (typeof entry === "string") return new InvalidValue({ message: entry }, input, options);
	const inner = typeof entry.issue === "string" ? new InvalidValue({ message: entry.issue }, input, options) : entry.issue;
	return new Pointer(entry.path, inner);
}
/** @internal */
function makeSingle(out, input, options) {
	if (out === void 0) return;
	if (typeof out === "boolean") return out ? void 0 : new InvalidValue(void 0, input, options);
	return makeFilterIssue(out, input, options);
}
/** @internal */
function normalizeFilterOutput(ast, out, input, options) {
	if (Array.isArray(out)) {
		if (!isReadonlyArrayNonEmpty(out)) return;
		return out.length === 1 ? makeFilterIssue(out[0], input, options) : new Composite(ast, map$5(out, (entry) => makeFilterIssue(entry, input, options)), input, options);
	}
	return makeSingle(out, input, options);
}
/**
* Returns the built-in {@link LeafHook} used by default formatters.
*
* **When to use**
*
* Use as the default leaf renderer when customizing only the {@link CheckHook}.
*
* **Details**
*
* - Checks for a `message` annotation first; returns it if present.
* - For `InvalidValue`, an `expected` annotation uses the standard expected
*   value message and includes reported input when available.
* - Otherwise generates a default message per `_tag`. When the issue reports
*   input, the message includes its formatted value where applicable:
*   - `InvalidType` → `"Expected <type>"` or `"Expected <type>, got <input>"`
*   - `InvalidValue` → `"Expected a valid value"` or `"Invalid data <input>"`
*   - `MissingKey` → `"Missing key"`
*   - `UnexpectedKey` → `"Expected no excess property"` or
*     `"Unexpected key with value <input>"`
*   - `Forbidden` → `"Forbidden operation"`
*   - `OneOf` → `"Expected exactly one member to match"` or
*     `"Expected exactly one member to match the input <input>"`
*
* **Example** (Formatting Standard Schema issues with defaultLeafHook)
*
* ```ts import.meta.vitest
* import { SchemaIssue } from "effect"
*
* const formatter = SchemaIssue.makeFormatterStandardSchemaV1({
*   leafHook: SchemaIssue.defaultLeafHook
* })
* formatter(new SchemaIssue.MissingKey(undefined)) // => { issues: [{ path: [], message: "Missing key" }] }
* ```
*
* @see {@link LeafHook}
* @see {@link makeFormatterStandardSchemaV1}
*
* @category formatting
* @since 4.0.0
*/
const defaultLeafHook = (issue) => {
	const message = findMessage(issue);
	if (message !== void 0) return message;
	switch (issue._tag) {
		case "InvalidType": return getExpectedMessage(getExpected(issue.ast), issue);
		case "InvalidValue": {
			const expected = findExpected(issue);
			if (expected !== void 0) return getExpectedMessage(expected, issue);
			const input = formatInput(issue);
			return input === void 0 ? "Expected a valid value" : `Invalid data ${input}`;
		}
		case "MissingKey": return "Missing key";
		case "UnexpectedKey": {
			const input = formatInput(issue);
			return input === void 0 ? "Expected no excess property" : `Unexpected key with value ${input}`;
		}
		case "Forbidden": return "Forbidden operation";
		case "OneOf": {
			const input = formatInput(issue);
			return input === void 0 ? "Expected exactly one member to match" : `Expected exactly one member to match the input ${input}`;
		}
	}
};
/**
* Returns the built-in {@link CheckHook} used by default formatters.
*
* **When to use**
*
* Use as the default filter renderer when customizing only the {@link LeafHook}.
*
* **Details**
*
* - Looks for a `message` annotation on the inner issue first, then on the
*   filter itself.
* - Returns `undefined` when no annotation is found, causing the formatter to
*   fall back to `"Expected <filter>"` or, when the filter reports input,
*   `"Expected <filter>, got <input>"`.
*
* @see {@link CheckHook}
* @see {@link makeFormatterStandardSchemaV1}
*
* @category formatting
* @since 4.0.0
*/
const defaultCheckHook = (issue) => findMessage(issue.issue) ?? findMessage(issue);
function formatInput(issue) {
	return hasInput(issue) ? format$2(issue.input) : void 0;
}
function findExpected(issue) {
	const expected = issue.annotations?.expected;
	return typeof expected === "string" ? expected : void 0;
}
function getExpectedMessage(expected, issue) {
	const input = formatInput(issue);
	return input === void 0 ? `Expected ${expected}` : `Expected ${expected}, got ${input}`;
}
function formatCheck(check) {
	const expected = check.annotations?.expected;
	if (typeof expected === "string") return expected;
	switch (check._tag) {
		case "Filter": return "<filter>";
		case "FilterGroup": return check.checks.map((check) => formatCheck(check)).join(" & ");
	}
}
/**
* Creates a {@link Formatter} that converts an {@link Issue} into a
* human-readable multi-line string.
*
* **When to use**
*
* Use when you need to format a `SchemaIssue.Issue` as error messages for
* logging, CLI output, or developer-facing diagnostics.
*
* **Details**
*
* - Flattens the issue tree into `{ message, path }` entries using
*   {@link defaultLeafHook} and {@link defaultCheckHook}.
* - Includes reported input in default messages when the node producing the
*   message has an `input` field.
* - Each entry is rendered as `"<message>"` or `"<message>\n  at <path>"`.
* - Multiple entries are joined with newlines.
*
* **Gotchas**
*
* Formatting an issue can disclose input retained with `reportInput: true`.
* Wrapper inputs are not inherited by child messages, and custom messages are
* returned unchanged.
*
* **Example** (Formatting an issue as a string)
*
* ```ts import.meta.vitest
* import { SchemaIssue } from "effect"
*
* const formatter = SchemaIssue.makeFormatterDefault()
* formatter(new SchemaIssue.MissingKey(undefined)) // => "Missing key"
* ```
*
* @see {@link makeFormatterStandardSchemaV1} — produces Standard Schema V1 format instead
* @see {@link Formatter}
*
* @category formatting
* @since 4.0.0
*/
function makeFormatterDefault() {
	return (issue) => formatIssue(issue, "");
}
/** @internal */
const defaultFormatter = /*#__PURE__*/ makeFormatterDefault();
function formatIssue(issue, path) {
	let message;
	switch (issue._tag) {
		case "Filter": {
			const annotated = defaultCheckHook(issue);
			if (annotated !== void 0) message = annotated;
			else {
				if (issue.issue._tag !== "InvalidValue") return formatIssue(issue.issue, path);
				const expected = findExpected(issue.issue);
				message = expected === void 0 ? getExpectedMessage(formatCheck(issue.filter), issue) : getExpectedMessage(expected, issue.issue);
			}
			break;
		}
		case "Encoding": return formatIssue(issue.issue, path);
		case "Pointer": return formatIssue(issue.issue, path + formatPath(issue.path));
		case "Composite":
		case "AnyOf":
			if (issue._tag === "Composite" || issue.issues.length > 0) return issue.issues.map((issue) => formatIssue(issue, path)).join("\n");
			message = findMessage(issue) ?? getExpectedMessage(getExpected(issue.ast), issue);
			break;
		default: message = defaultLeafHook(issue);
	}
	return path ? `${message}\n  at ${path}` : message;
}
function findMessage(issue) {
	if (issue._tag === "Pointer") return;
	if (issue._tag === "Encoding") return findMessage(issue.issue);
	const message = (issue._tag === "Filter" ? issue.filter.annotations : "annotations" in issue ? issue.annotations : issue.ast.annotations)?.[issue._tag === "MissingKey" ? "messageMissingKey" : issue._tag === "UnexpectedKey" ? "messageUnexpectedKey" : "message"];
	if (typeof message === "string") return message;
}
//#endregion
//#region node_modules/effect/dist/internal/schema/cause.js
/** @internal */
function getSchemaIssue(cause) {
	let issue;
	for (const reason of cause.reasons) {
		if (!isFailReason(reason) || !isIssue(reason.error)) return;
		issue ??= reason.error;
	}
	return issue;
}
/** @internal */
function getSchemaIssueOrThrow(cause, message) {
	const issue = getSchemaIssue(cause);
	if (issue === void 0) throw new Error(message, { cause });
	return issue;
}
//#endregion
//#region node_modules/effect/dist/SchemaGetter.js
const makeGetter = (fields) => Object.assign(Object.create(Prototype$1), fields);
const passthrough_$1 = /*#__PURE__*/ makeGetter({ _tag: "Passthrough" });
function passthrough$1() {
	return passthrough_$1;
}
/**
* Creates a getter that applies a pure function to present values.
*
* **When to use**
*
* Use when you need a schema getter for a pure, infallible transformation
* between types.
* - Building encode/decode pairs for `Schema.decodeTo`.
*
* **Details**
*
* - This is the most commonly used constructor.
* - Transforms `Some(e)` to `Some(f(e))` and leaves `None` unchanged.
* - Skips `None` inputs — only called when a value is present.
* - Never fails.
*
* **Example** (Transforming strings to numbers)
*
* ```ts import.meta.vitest
* import { Schema, SchemaGetter } from "effect"
*
* const NumberFromString = Schema.String.pipe(
*   Schema.decodeTo(Schema.Number, {
*     decode: SchemaGetter.transform((s) => Number(s)),
*     encode: SchemaGetter.transform((n) => String(n))
*   })
* )
* Schema.decodeSync(NumberFromString)("42") // => 42
* ```
*
* @see {@link transformEffect} when the transformation returns an `Effect`
* @see {@link transformOptional} when you need to handle `None` inputs
* @see {@link passthrough} when no transformation is needed
*
* @category transforming
* @since 4.0.0
*/
function transform$1(f) {
	return makeGetter({
		_tag: "Transform",
		transform: f
	});
}
/**
* Creates a getter that applies an effectful transformation to present values.
*
* **When to use**
*
* Use when you need a schema getter for a transformation that may fail, require
* Effect services, or run asynchronously.
*
* **Details**
*
* - Skips `None` inputs — only called when a value is present.
* - On success, wraps the result in `Some`.
* - On failure, propagates the `Issue`.
*
* **Example** (Parsing with failure)
*
* ```ts import.meta.vitest
* import { Effect, Option, SchemaGetter, SchemaIssue } from "effect"
*
* const safeParseInt = SchemaGetter.transformEffect<number, string>(
*   (s, options) => {
*     const n = parseInt(s, 10)
*     return isNaN(n)
*       ? Effect.fail(new SchemaIssue.InvalidValue({ message: "not an integer" }, s, options))
*       : Effect.succeed(n)
*   }
* )
* await Effect.runPromise(SchemaGetter.run(safeParseInt, Option.some("42"), {})) // => Option.some(42)
* ```
*
* @see {@link transform} when transformation cannot fail
* @see {@link transformOptionalEffect} when you need full `Option` control over the output
*
* @category transforming
* @since 4.0.0
*/
function transformEffect$1(f) {
	return makeGetter({
		_tag: "TransformEffect",
		transform: f
	});
}
/**
* Coerces any value to a `string` using the global `String()` constructor.
*
* **When to use**
*
* Use when you need a schema getter to coerce a present encoded value to a
* string with `String()`.
*
* **Details**
*
* The getter is pure, never fails, and delegates to `globalThis.String`.
*
* **Example** (Coercing to a string)
*
* ```ts import.meta.vitest
* import { Effect, Option, SchemaGetter } from "effect"
*
* const toString = SchemaGetter.String<number>()
* Effect.runSync(SchemaGetter.run(toString, Option.some(42), {})) // => Option.some("42")
* ```
*
* @see {@link transform} for custom string conversions
*
* @category converting
* @since 4.0.0
*/
function String$4() {
	return transform$1(globalThis.String);
}
/**
* Coerces any value to a `number` using the global `Number()` constructor.
*
* **When to use**
*
* Use when you need a schema getter to coerce a present encoded value to a
* number with `Number()`.
*
* **Details**
*
* The getter is pure, never fails, and delegates to `globalThis.Number`. It may
* produce `NaN` for non-numeric inputs.
*
* **Example** (Coercing to a number)
*
* ```ts import.meta.vitest
* import { Effect, Option, SchemaGetter } from "effect"
*
* const toNumber = SchemaGetter.Number<string>()
* Effect.runSync(SchemaGetter.run(toNumber, Option.some("42"), {})) // => Option.some(42)
* ```
*
* @see {@link transformEffect} for effectful or validated number parsing
*
* @category converting
* @since 4.0.0
*/
function Number$3() {
	return transform$1(globalThis.Number);
}
function parseJson(options) {
	return transformEffect$1((input, parseOptions) => try_({
		try: () => JSON.parse(input, options?.reviver),
		catch: () => new InvalidValue({ expected: "a valid JSON string" }, input, parseOptions)
	}));
}
/**
* Stringifies a present value using `JSON.stringify`.
*
* **When to use**
*
* Use when you need a schema getter to serialize a present decoded value to
* JSON text during encoding.
*
* **Details**
*
* - Skips `None` inputs.
* - If `JSON.stringify` throws or returns `undefined`, fails with
*   `SchemaIssue.InvalidValue`.
* - Supports optional `replacer` and `space` options, matching
*   `JSON.stringify`.
*
* **Example** (Stringifying JSON)
*
* ```ts import.meta.vitest
* import { Effect, Option, SchemaGetter } from "effect"
*
* const stringify = SchemaGetter.stringifyJson()
* const result = await Effect.runPromise(SchemaGetter.run(stringify, Option.some({ a: 1 }), {}))
* result // => Option.some("{\"a\":1}")
* ```
*
* @see {@link parseJson} for the inverse operation
*
* @category encoding
* @since 4.0.0
*/
function stringifyJson(options) {
	return transformEffect$1((input, parseOptions) => try_({
		try: () => {
			const output = JSON.stringify(input, options?.replacer, options?.space);
			if (output === void 0) throw new TypeError("Value cannot be represented as JSON");
			return output;
		},
		catch: () => new InvalidValue({ expected: "a JSON-serializable value" }, input, parseOptions)
	}));
}
//#endregion
//#region node_modules/effect/dist/SchemaTransformation.js
/**
* Constructs schema middleware from its decode and encode functions.
*
* @category constructors
* @since 4.0.0
*/
const Middleware = class extends Class$2 {
	_tag = "Middleware";
	decode;
	encode;
	constructor(decode, encode) {
		super();
		this.decode = decode;
		this.encode = encode;
	}
	flip() {
		return new Middleware(this.encode, this.decode);
	}
};
const TypeId$20 = "~effect/SchemaTransformation/Transformation";
/**
* Constructs a bidirectional schema transformation from its decode and encode getters.
*
* @category constructors
* @since 4.0.0
*/
const Transformation = class extends Class$2 {
	[TypeId$20] = TypeId$20;
	_tag = "Transformation";
	decode;
	encode;
	constructor(decode, encode) {
		super();
		this.decode = decode;
		this.encode = encode;
	}
	flip() {
		return new Transformation(this.encode, this.decode);
	}
};
/**
* Returns `true` if `u` is a `Transformation` instance.
*
* **When to use**
*
* Use to check whether a value is already a schema transformation before
* wrapping it.
*
* **Details**
*
* - Pure predicate, no side effects.
* - Acts as a TypeScript type guard.
*
* **Example** (Checking a value)
*
* ```ts import.meta.vitest
* import { SchemaTransformation } from "effect"
*
* SchemaTransformation.isTransformation(SchemaTransformation.trim()) // => true
* SchemaTransformation.isTransformation({ decode: null, encode: null }) // => false
* ```
*
* @see {@link Transformation}
* @see {@link makeTransformation}
*
* @category guards
* @since 4.0.0
*/
function isTransformation(u) {
	return hasProperty(u, TypeId$20) && u[TypeId$20] === TypeId$20;
}
/**
* Constructs a `Transformation` from an object with `decode` and `encode`
* `Getter`s. If the input is already a `Transformation`, returns it as-is.
*
* **When to use**
*
* Use when you already have schema getter instances and want to pair them into
* a schema transformation.
* - You want idempotent wrapping (won't double-wrap).
*
* **Details**
*
* - Returns the input unchanged if it is already a `Transformation`.
*
* **Example** (Wrapping existing getters)
*
* ```ts import.meta.vitest
* import { SchemaGetter, SchemaTransformation } from "effect"
*
* const t = SchemaTransformation.makeTransformation({
*   decode: SchemaGetter.transform<number, string>((s) => Number(s)),
*   encode: SchemaGetter.transform<string, number>((n) => String(n))
* })
* t._tag // => "Transformation"
* ```
*
* @see {@link transform} — simpler constructor from pure functions
* @see {@link transformEffect} — constructor from effectful functions
* @see {@link Transformation}
*
* @category constructors
* @since 3.10.0
*/
const makeTransformation = (options) => {
	if (isTransformation(options)) return options;
	return new Transformation(options.decode, options.encode);
};
/**
* Creates a `Transformation` from pure (sync, infallible) decode and encode
* functions.
*
* **When to use**
*
* Use when you need an infallible schema transformation that does not require
* Effect services.
*
* **Details**
*
* - Each function receives the input and returns the output directly.
* - Skips `None` inputs (missing keys) — functions are only called on present values.
* - Does not allocate Effects internally; uses optimized sync path.
*
* **Example** (Converting between cents and dollars)
*
* ```ts import.meta.vitest
* import { Schema, SchemaTransformation } from "effect"
*
* const CentsFromDollars = Schema.Number.pipe(
*   Schema.decodeTo(
*     Schema.Number,
*     SchemaTransformation.transform({
*       decode: (dollars) => dollars * 100,
*       encode: (cents) => cents / 100
*     })
*   )
* )
* Schema.decodeSync(CentsFromDollars)(2.5) // => 250
* ```
*
* @see {@link transformEffect} — for fallible or effectful transformations
* @see {@link transformOptional} — for transformations that handle missing keys
* @see {@link passthrough} — when no conversion is needed
*
* @category transforming
* @since 3.10.0
*/
function transform(options) {
	return new Transformation(transform$1(options.decode), transform$1(options.encode));
}
const passthrough_ = /*#__PURE__*/ new Transformation(/*#__PURE__*/ passthrough$1(), /*#__PURE__*/ passthrough$1());
function passthrough() {
	return passthrough_;
}
/**
* Decodes a `string` into a `number` and encodes a `number` back to a
* `string`.
*
* **When to use**
*
* Use when you need a schema transformation to parse numeric strings from APIs,
* form data, or URL parameters.
*
* **Details**
*
* Decoding coerces the string to a number like `Number(s)`. Encoding coerces
* the number to a string like `String(n)`. This does not validate that the
* result is finite; combine with `Schema.Finite` or `Schema.Int` for stricter
* checks.
*
* **Example** (Converting a string to a number)
*
* ```ts import.meta.vitest
* import { Schema, SchemaTransformation } from "effect"
*
* const schema = Schema.String.pipe(
*   Schema.decodeTo(Schema.Number, SchemaTransformation.numberFromString)
* )
* Schema.decodeSync(schema)("42") // => 42
* ```
*
* @see {@link bigintFromString}
* @see {@link transform}
*
* @category converting
* @since 4.0.0
*/
const numberFromString = /*#__PURE__*/ new Transformation(/*#__PURE__*/ Number$3(), /*#__PURE__*/ String$4());
const isJsonError = (input) => isObject$1(input) && typeof input["message"] === "string";
const decodeJsonError = (input) => {
	const err = Object.hasOwn(input, "cause") ? new Error(input.message, { cause: decodeDefect(input.cause) }) : new Error(input.message);
	if (typeof input.name === "string" && input.name !== "Error") err.name = input.name;
	if (typeof input.stack === "string") err.stack = input.stack;
	return err;
};
const encodeUnknownAsJson = (input) => {
	try {
		const json = formatJson(input);
		return json === void 0 ? format$2(input) : JSON.parse(json);
	} catch {
		return format$2(input);
	}
};
const encodeJsonError = (input, options, encodeDefect) => {
	const encoded = {
		name: input.name,
		message: typeof input.message === "string" ? input.message : ""
	};
	if (options?.includeStack && typeof input.stack === "string") encoded.stack = input.stack;
	if (!options?.excludeCause && input.cause !== void 0) encoded.cause = encodeDefect(input.cause);
	return encoded;
};
const makeEncodeDefect = (options) => {
	const seen = /* @__PURE__ */ new WeakSet();
	const encode = (input) => {
		if (isError(input)) {
			if (seen.has(input)) return "[Circular]";
			seen.add(input);
			const encoded = encodeJsonError(input, options, encode);
			seen.delete(input);
			return encoded;
		}
		return encodeUnknownAsJson(input);
	};
	return encode;
};
const decodeDefect = (input) => isJsonError(input) ? decodeJsonError(input) : input;
/** @internal */
const defectFromJson = (options) => transform({
	decode: decodeDefect,
	encode: makeEncodeDefect(options)
});
/**
* Decodes a JSON string with `JSON.parse` and encodes a value with
* `JSON.stringify`.
*
* **When to use**
*
* Use when you need a schema transformation to decode JSON stored or
* transmitted as a string, usually before composing with another schema that
* validates the parsed structure.
*
* **Details**
*
* The `reviver` option is passed to `JSON.parse` during decoding. The
* `replacer` and `space` options are passed to `JSON.stringify` during
* encoding. Decode fails with `InvalidValue` for invalid JSON, and encode can
* fail with `InvalidValue` when `JSON.stringify` cannot serialize the value.
*
* **Example** (Parsing JSON)
*
* ```ts import.meta.vitest
* import { Schema, SchemaTransformation } from "effect"
*
* const schema = Schema.String.pipe(
*   Schema.decodeTo(Schema.Unknown, SchemaTransformation.fromJsonString())
* )
* Schema.decodeSync(schema)("{\"ok\":true}") // => { ok: true }
* ```
*
* @see {@link uint8ArrayFromBase64String}
* @see {@link fromFormData}
*
* @category decoding
* @since 4.0.0
*/
function fromJsonString$1(options) {
	return new Transformation(parseJson(options ?? {}), stringifyJson(options));
}
//#endregion
//#region node_modules/effect/dist/SchemaAST.js
/**
* Represents Effect schemas as runtime trees.
*
* Every `Schema` has an AST made from nodes for declarations, primitives,
* literals, arrays, objects, unions, suspended schemas, checks, annotations,
* encoding links, and parsing context. Most users work with the higher-level
* `Schema` module. Use `SchemaAST` when you need to inspect schema nodes, build
* ASTs programmatically, change encoded or decoded views, collect issues, or
* run low-level schema checks.
*
* @since 4.0.0
*/
function makeGuard(tag) {
	return (ast) => ast._tag === tag;
}
/**
* Narrows an {@link AST} to {@link Declaration}.
*
* **When to use**
*
* Use to recognize declaration AST nodes before running declaration-specific
* handling.
*
* @see {@link Declaration} for the AST node type narrowed by this guard
*
* @category guards
* @since 3.10.0
*/
const isDeclaration = /*#__PURE__*/ makeGuard("Declaration");
/**
* Narrows an {@link AST} to {@link Never}.
*
* **When to use**
*
* Use to detect the AST node for a schema that can never match before handling
* other schema variants.
*
* @see {@link Never} for the AST node type narrowed by this guard
* @see {@link never} for the singleton `Never` AST instance
*
* @category guards
* @since 4.0.0
*/
const isNever = /*#__PURE__*/ makeGuard("Never");
/**
* Narrows an {@link AST} to {@link Literal}.
*
* **When to use**
*
* Use to recognize exact string, number, boolean, or bigint literal AST nodes.
*
* @see {@link Literal} for the AST node type narrowed by this guard
* @see {@link LiteralValue} for the values stored by literal nodes
*
* @category guards
* @since 3.10.0
*/
const isLiteral = /*#__PURE__*/ makeGuard("Literal");
/**
* Narrows an {@link AST} to {@link UniqueSymbol}.
*
* @category guards
* @since 3.10.0
*/
const isUniqueSymbol = /*#__PURE__*/ makeGuard("UniqueSymbol");
/**
* Narrows an {@link AST} to {@link Arrays}.
*
* **When to use**
*
* Use to recognize array-like AST nodes before reading their element, rest, or
* mutability metadata.
*
* @see {@link Arrays} for the AST node type narrowed by this guard
*
* @category guards
* @since 4.0.0
*/
const isArrays = /*#__PURE__*/ makeGuard("Arrays");
/**
* Narrows an {@link AST} to {@link Objects}.
*
* @category guards
* @since 4.0.0
*/
const isObjects = /*#__PURE__*/ makeGuard("Objects");
/**
* Narrows an {@link AST} to {@link Suspend}.
*
* @category guards
* @since 3.10.0
*/
const isSuspend = /*#__PURE__*/ makeGuard("Suspend");
/**
* Constructs a {@link Link}.
*
* @category constructors
* @since 4.0.0
*/
const Link = class {
	to;
	transformation;
	constructor(to, transformation) {
		this.to = to;
		this.transformation = transformation;
	}
};
/** @internal */
const defaultParseOptions = {};
/**
* Constructs a {@link Context}.
*
* @category constructors
* @since 4.0.0
*/
const Context = class {
	isOptional;
	isMutable;
	/** Used for constructor default values (e.g. `withConstructorDefault` API) */
	constructorDefault;
	annotations;
	constructor(isOptional, isMutable, constructorDefault = void 0, annotations = void 0) {
		this.isOptional = isOptional;
		this.isMutable = isMutable;
		this.constructorDefault = constructorDefault;
		this.annotations = annotations;
	}
};
const TypeId$19 = "~effect/Schema";
var ASTNodeImpl = class {
	[TypeId$19] = TypeId$19;
	annotations;
	checks;
	encoding;
	context;
	constructor(annotations = void 0, checks = void 0, encoding = void 0, context = void 0) {
		this.annotations = annotations;
		this.checks = checks;
		this.encoding = encoding;
		this.context = context;
	}
	toString() {
		return `<${this._tag}>`;
	}
};
/**
* Constructs a {@link Declaration}.
*
* @category constructors
* @since 4.0.0
*/
const Declaration = class extends ASTNodeImpl {
	_tag = "Declaration";
	typeParameters;
	run;
	encodingChecks;
	/**
	* Parser factory {@link flip} swaps in, so a declaration can behave
	* differently when encoding. `undefined` reuses `run`.
	*/
	encodingRun;
	constructor(typeParameters, run, annotations, checks, encoding, context, encodingChecks, encodingRun) {
		super(annotations, checks, encoding, context);
		this.typeParameters = typeParameters;
		this.run = run;
		this.encodingChecks = encodingChecks;
		this.encodingRun = encodingRun;
	}
	/** @internal */
	getParser() {
		let run;
		return (input, options) => {
			if (input === missing) return missingExit;
			return (run ??= this.run(this.typeParameters))(input, this, options);
		};
	}
	_rebuild(recur, checks, encodingChecks, run, encodingRun) {
		const tps = mapOrSame(this.typeParameters, recur);
		return tps === this.typeParameters && checks === this.checks && encodingChecks === this.encodingChecks && run === this.run && encodingRun === this.encodingRun ? this : new Declaration(tps, run, this.annotations, checks, void 0, this.context, encodingChecks, encodingRun);
	}
	/** @internal */
	recur(recur) {
		return this._rebuild(recur, this.checks, this.encodingChecks, this.run, this.encodingRun);
	}
	/** @internal */
	flip(recur) {
		return this._rebuild(recur, this.encodingChecks, this.checks, this.encodingRun ?? this.run, this.run);
	}
	/** @internal */
	getExpected() {
		const expected = this.annotations?.expected;
		if (typeof expected === "string") return expected;
		return "<Declaration>";
	}
};
/**
* Constructs a {@link Null}.
*
* @category constructors
* @since 4.0.0
*/
const Null$1 = class extends ASTNodeImpl {
	_tag = "Null";
	/** @internal */
	getParser() {
		return fromConst(this, null);
	}
	/** @internal */
	getExpected() {
		return "null";
	}
};
const null_ = /*#__PURE__*/ new Null$1();
/**
* Constructs a {@link Undefined}.
*
* @category constructors
* @since 4.0.0
*/
const Undefined$1 = class extends ASTNodeImpl {
	_tag = "Undefined";
	/** @internal */
	getParser() {
		return fromConst(this, void 0);
	}
	/** @internal */
	toCodecJson() {
		return replaceEncoding(this, [undefinedToNull]);
	}
	/** @internal */
	getExpected() {
		return "undefined";
	}
};
const undefinedToNull = /*#__PURE__*/ new Link(null_, /*#__PURE__*/ new Transformation(/*#__PURE__*/ transform$1(() => void 0), /*#__PURE__*/ transform$1(() => null)));
const undefined_ = /*#__PURE__*/ new Undefined$1();
/**
* Constructs a {@link Unknown}.
*
* @category constructors
* @since 4.0.0
*/
const Unknown$1 = class extends ASTNodeImpl {
	_tag = "Unknown";
	/** @internal */
	getParser() {
		return fromRefinement(this, isUnknown);
	}
	/** @internal */
	getExpected() {
		return "unknown";
	}
};
/**
* Provides the singleton {@link Unknown} AST instance.
*
* **When to use**
*
* Use when you need the reusable AST singleton for a schema node that accepts
* every value while keeping parsed values opaque.
*
* @see {@link any} for the singleton that accepts every value as `any`
*
* @category constructors
* @since 4.0.0
*/
const unknown = /*#__PURE__*/ new Unknown$1();
/**
* Constructs a {@link Literal}.
*
* @category constructors
* @since 4.0.0
*/
const Literal$1 = class extends ASTNodeImpl {
	_tag = "Literal";
	literal;
	constructor(literal, annotations, checks, encoding, context) {
		super(annotations, checks, encoding, context);
		if (typeof literal === "number" && !globalThis.Number.isFinite(literal)) throw new Error(`A numeric literal must be finite, got ${format$2(literal)}`);
		this.literal = literal;
	}
	/** @internal */
	getParser() {
		return fromConst(this, this.literal);
	}
	/** @internal */
	matchPart(s, _options) {
		return s === globalThis.String(this.literal) ? this.literal : void 0;
	}
	/** @internal */
	toCodecJson() {
		return typeof this.literal === "bigint" ? literalToString(this) : this;
	}
	/** @internal */
	toCodecStringTree() {
		return typeof this.literal === "string" ? this : literalToString(this);
	}
	/** @internal */
	getExpected() {
		return typeof this.literal === "string" ? JSON.stringify(this.literal) : globalThis.String(this.literal);
	}
};
function literalToString(ast) {
	const literalAsString = globalThis.String(ast.literal);
	return replaceEncoding(ast, [new Link(new Literal$1(literalAsString), new Transformation(transform$1(() => ast.literal), transform$1(() => literalAsString)))]);
}
/**
* Constructs a {@link String}.
*
* @category constructors
* @since 4.0.0
*/
const String$3 = class extends ASTNodeImpl {
	_tag = "String";
	/** @internal */
	getParser() {
		return fromRefinement(this, isString);
	}
	/** @internal */
	matchPart(s, options) {
		const checks = this.checks;
		return checks && !options.disableChecks && collectIssues(checks, s, void 0, this, options) ? void 0 : s;
	}
	/** @internal */
	getExpected() {
		return "string";
	}
};
/**
* Provides the singleton {@link String} AST instance.
*
* **When to use**
*
* Use as the shared `SchemaAST` node for unconstrained JavaScript strings.
*
* @see {@link String} for the AST node class
* @see {@link isString} for narrowing an AST to a string node
*
* @category constructors
* @since 4.0.0
*/
const string = /*#__PURE__*/ new String$3();
/**
* Constructs a {@link Number}.
*
* @category constructors
* @since 4.0.0
*/
const Number$2 = class extends ASTNodeImpl {
	_tag = "Number";
	/** @internal */
	getParser() {
		return fromRefinement(this, isNumber);
	}
	/** @internal */
	matchKey(s, options) {
		return this._match(isStringNumberRegExp, s, options);
	}
	/** @internal */
	matchPart(s, options) {
		return this._match(isStringFiniteRegExp, s, options);
	}
	_match(regexp, s, options) {
		if (!regexp.test(s)) return void 0;
		const value = globalThis.Number(s);
		if (options.disableChecks || !this.checks) return value;
		return collectIssues(this.checks, value, void 0, this, options) ? void 0 : value;
	}
	/** @internal */
	toCodecJson() {
		if (this.checks && (hasCheck(this.checks, "effect/schema/isFinite") || hasCheck(this.checks, "effect/schema/isInt"))) return this;
		return replaceEncoding(this, [numberToJson]);
	}
	/** @internal */
	toCodecStringTree() {
		if (this.toCodecJson() === this) return replaceEncoding(this, [finiteToString]);
		return replaceEncoding(this, [numberToString]);
	}
	/** @internal */
	getExpected() {
		return "number";
	}
};
function hasCheck(checks, id) {
	return checks.some((check) => check.annotations?.representation?.id === id || check._tag === "FilterGroup" && hasCheck(check.checks, id));
}
/**
* Provides the singleton {@link Number} AST instance.
*
* **When to use**
*
* Use when you need the canonical `SchemaAST` node for schemas that accept any
* JavaScript number value.
*
* @see {@link Number} for the AST node class and serialization behavior
* @see {@link Literal} for exact finite numeric literal AST nodes
*
* @category constructors
* @since 4.0.0
*/
const number = /*#__PURE__*/ new Number$2();
/**
* Constructs a {@link Boolean}.
*
* @category constructors
* @since 4.0.0
*/
const Boolean$2 = class extends ASTNodeImpl {
	_tag = "Boolean";
	/** @internal */
	getParser() {
		return fromRefinement(this, isBoolean);
	}
	/** @internal */
	getExpected() {
		return "boolean";
	}
};
/**
* Provides the singleton {@link Boolean} AST instance.
*
* **When to use**
*
* Use to reuse the standard AST node that accepts either `true` or `false` when
* constructing schema ASTs directly.
*
* @see {@link Boolean} for the AST node class
* @see {@link Literal} for exact boolean literal AST nodes
*
* @category constructors
* @since 4.0.0
*/
const boolean = /*#__PURE__*/ new Boolean$2();
/**
* Constructs a {@link Arrays}.
*
* @category constructors
* @since 4.0.0
*/
const Arrays = class extends ASTNodeImpl {
	_tag = "Arrays";
	isMutable;
	elements;
	rest;
	encodingChecks;
	constructor(isMutable, elements, rest, annotations, checks, encoding, context, encodingChecks) {
		super(annotations, checks, encoding, context);
		this.isMutable = isMutable;
		this.elements = elements;
		this.rest = rest;
		this.encodingChecks = encodingChecks;
		let hasOptional = false;
		for (let i = 0; i < elements.length; i++) if (isOptional(elements[i])) hasOptional = true;
		else if (hasOptional) throw new Error("A required element cannot follow an optional element. ts(1257)");
		if (hasOptional && rest.length > 1) throw new Error("A required element cannot follow an optional element. ts(1257)");
		for (let i = 1; i < rest.length; i++) if (isOptional(rest[i])) throw new Error("An optional element cannot follow a rest element. ts(1266)");
	}
	/** @internal */
	getParser(compile, compileField = compile) {
		const ast = this;
		let elements;
		let rest;
		const elementLen = ast.elements.length;
		const tailLen = Math.max(0, ast.rest.length - 1);
		function getParser(tailThreshold, index) {
			if (index < elementLen) return elements[index];
			else if (index >= tailThreshold) return rest[index - tailThreshold + 1];
			return rest[0];
		}
		const finish = (state) => {
			const { input, len, options } = state;
			if (ast.rest.length === 0 && len > elementLen) for (let i = elementLen; i < len; i++) {
				const unexpected = new UnexpectedKey(ast, input[i], options);
				const issue = new Pointer([i], unexpected);
				if (options.errors === "all") {
					if (state.issues) state.issues.push(issue);
					else state.issues = [issue];
				} else return fail$3(new Composite(ast, [issue], input, options));
			}
			if (state.issues) return fail$3(new Composite(ast, state.issues, input, options));
			return succeed$2(state.output);
		};
		const parse = (input, options) => {
			const len = input.length;
			const state = {
				ast,
				getParser,
				input,
				len,
				tailThreshold: Math.max(elementLen, len - tailLen),
				output: new globalThis.Array(len),
				issues: void 0,
				options
			};
			const end = ast.rest.length === 0 ? elementLen : Math.max(len, elementLen + tailLen);
			const concurrency = options.concurrency === void 0 ? 1 : resolveConcurrency(options.concurrency);
			const eff = concurrency === 1 ? parseArray(state, input, 0, end) : parseArrayConcurrent(state, input, {
				concurrency,
				end
			});
			if (!eff) return finish(state);
			if (effectIsExit(eff)) return flatMapEager(eff, () => finish(state));
			let first = true;
			return suspend$2(() => {
				if (!first) return parse(input, options);
				first = false;
				return flatMap(eff, () => finish(state));
			});
		};
		return (input, options) => {
			if (input === missing) return missingExit;
			try {
				if (!Array.isArray(input)) return fail$3(new InvalidType(ast, input, options));
				if (!elements) {
					elements = ast.elements.map((ast) => ({
						ast,
						parser: compileField(ast)
					}));
					rest = ast.rest.map((ast) => ({
						ast,
						parser: compileField(ast)
					}));
				}
				return parse(input, options);
			} catch (error) {
				return die(error);
			}
		};
	}
	_rebuild(recur, checks, encodingChecks) {
		const elements = mapOrSame(this.elements, recur);
		const rest = mapOrSame(this.rest, recur);
		return elements === this.elements && rest === this.rest && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Arrays(this.isMutable, elements, rest, this.annotations, checks, void 0, this.context, encodingChecks);
	}
	/** @internal */
	recur(recur) {
		return this._rebuild(recur, this.checks, this.encodingChecks);
	}
	/** @internal */
	flip(recur) {
		return this._rebuild(recur, this.encodingChecks, this.checks);
	}
	/** @internal */
	getExpected() {
		return "array";
	}
};
/** @internal */
function stepArray(s, item, exit, i) {
	if (exit._tag === "Failure") return wrapPropertyKeyIssue(s, s.ast, i, exit);
	const value = exit === sameExit ? item : exit[args];
	if (value !== missing) s.output[i] = value;
	else {
		const p = s.getParser(s.tailThreshold, i);
		if (isOptional(p.ast)) return;
		const issue = new Pointer([i], new MissingKey(p.ast.context?.annotations));
		if (s.options.errors === "all") {
			if (s.issues) s.issues.push(issue);
			else s.issues = [issue];
		} else return fail$4(new Composite(s.ast, [issue], s.input, s.options));
	}
}
const parseArrayOptions = {
	onItem(s, item, i) {
		const value = i < s.len ? item : missing;
		return s.getParser(s.tailThreshold, i).parser(value, s.options);
	},
	step: stepArray
};
/** @internal */
const parseArray = /*#__PURE__*/ iterateEager()(parseArrayOptions);
const parseArrayConcurrent = /*#__PURE__*/ iterateConcurrent()(parseArrayOptions);
const wrapPropertyKeyIssue = (s, ast, key, exit) => {
	if (exit.cause.reasons.length === 0) return exit;
	const issue = getSchemaIssue(exit.cause);
	if (issue === void 0) return failCause$4(map$3(exit.cause, (issue) => new Composite(ast, [new Pointer([key], issue)], s.input, s.options)));
	const pointer = new Pointer([key], issue);
	if (s.options.errors === "all") {
		if (s.issues) s.issues.push(pointer);
		else s.issues = [pointer];
	} else return fail$4(new Composite(ast, [pointer], s.input, s.options));
};
/**
* floating point or integer, with optional exponent
* @internal
*/
const FINITE_PATTERN = "[+-]?\\d*\\.?\\d+(?:[Ee][+-]?\\d+)?";
/**
* Returns the object keys that match the index signature parameter schema.
* @internal
*/
function getIndexSignatureKeys(input, parameter, options = defaultParseOptions) {
	let stringKeys;
	let symbolKeys;
	function go(parameter) {
		switch (parameter._tag) {
			case "String":
			case "TemplateLiteral": return (stringKeys ??= Object.keys(input)).filter((k) => parameter.matchPart(k, options) !== void 0);
			case "Number": return (stringKeys ??= Object.keys(input)).filter((k) => parameter.matchKey(k, options) !== void 0);
			case "Symbol": return (symbolKeys ??= Object.getOwnPropertySymbols(input)).filter((k) => Object.prototype.propertyIsEnumerable.call(input, k) && parameter.matchKey(k, options) !== void 0);
			case "Union": return [...new Set(parameter.types.flatMap(go))];
			default: return [];
		}
	}
	return go(parameterFromPropertyKey(toEncoded(parameter)));
}
/**
* Constructs a {@link PropertySignature}.
*
* @category constructors
* @since 4.0.0
*/
const PropertySignature = class {
	name;
	type;
	constructor(name, type) {
		this.name = name;
		this.type = type;
	}
};
function isIndexSignatureParameterSide(ast) {
	switch (ast._tag) {
		case "String":
		case "Number":
		case "Symbol":
		case "TemplateLiteral": return true;
		case "Union": return ast.types.every(isIndexSignatureParameterSide);
		default: return false;
	}
}
function isIndexSignatureParameterEncodedSide(ast) {
	const encoded = getLastEncoding(ast);
	switch (encoded._tag) {
		case "String":
		case "Number":
		case "Symbol":
		case "TemplateLiteral": return true;
		case "Union": return encoded.types.every(isIndexSignatureParameterEncodedSide);
		default: return false;
	}
}
function isIndexSignatureParameter(ast) {
	return isIndexSignatureParameterSide(ast) && isIndexSignatureParameterEncodedSide(ast);
}
/**
* Constructs a {@link IndexSignature}.
*
* @category constructors
* @since 4.0.0
*/
const IndexSignature = class {
	parameter;
	type;
	constructor(parameter, type) {
		if (!isIndexSignatureParameter(parameter)) throw new Error(`Invalid index signature parameter ${parameter._tag}`);
		this.parameter = parameter;
		this.type = type;
		if (isOptional(type) && !containsUndefined(type)) throw new Error("Cannot use `Schema.optionalKey` with index signatures, use `Schema.optional` instead.");
	}
};
/**
* Constructs a {@link Objects}.
*
* @category constructors
* @since 4.0.0
*/
const Objects = class extends ASTNodeImpl {
	_tag = "Objects";
	propertySignatures;
	indexSignatures;
	encodingChecks;
	constructor(propertySignatures, indexSignatures, annotations, checks, encoding, context, encodingChecks) {
		super(annotations, checks, encoding, context);
		this.propertySignatures = propertySignatures;
		this.indexSignatures = indexSignatures;
		this.encodingChecks = encodingChecks;
	}
	/** @internal */
	getParser(compile, compileField = compile) {
		const ast = this;
		const hasProperties = ast.propertySignatures.length;
		const indexCount = ast.indexSignatures.length;
		if (!hasProperties && !indexCount) return fromRefinement(ast, isNotNullish);
		let properties;
		let indexes;
		const compileMembers = () => {
			if (!properties) {
				properties = ast.propertySignatures.map((ps) => ({
					parser: compileField(ps.type),
					name: ps.name,
					type: ps.type
				}));
				indexes = indexCount ? ast.indexSignatures.map((is) => ({
					is,
					parserKey: compile(parameterFromPropertyKey(is.parameter)),
					parserValue: compileField(is.type)
				})) : void 0;
			}
			return properties;
		};
		const makeFallback = () => {
			const expectedKeys = new Set(ast.propertySignatures.map((ps) => typeof ps.name === "number" ? globalThis.String(ps.name) : ps.name));
			const finishIndex = (s, key, k2, inputValue, exitValue) => {
				if (exitValue._tag === "Failure") return wrapPropertyKeyIssue(s, ast, key, exitValue) ?? void_$1;
				const value = exitValue === sameExit ? inputValue : exitValue[args];
				if (k2 !== missing && value !== missing) {
					if (hasProperties && (expectedKeys.has(key) || expectedKeys.has(typeof k2 === "number" ? globalThis.String(k2) : k2))) return void_$1;
					assignProperty(s.out, k2, value);
				}
				return void_$1;
			};
			const parseIndex = (s, key, index, exitKey) => {
				if (!exitKey) {
					const eff = index.parserKey(key, s.options);
					if (!effectIsExit(eff)) return flatMap(exit(eff), (exit) => parseIndex(s, key, index, exit));
					exitKey = eff;
				}
				if (exitKey._tag === "Failure") return wrapPropertyKeyIssue(s, ast, key, exitKey) ?? void_$1;
				const k2 = exitKey === sameExit ? key : exitKey[args];
				const inputValue = s.input[key];
				const result = index.parserValue(inputValue, s.options);
				return effectIsExit(result) ? finishIndex(s, key, k2, inputValue, result) : flatMap(exit(result), (exit) => finishIndex(s, key, k2, inputValue, exit));
			};
			const parseStringIndex = (s, key, index) => {
				const inputValue = s.input[key];
				const result = index.parserValue(inputValue, s.options);
				return effectIsExit(result) ? finishIndex(s, key, key, inputValue, result) : flatMap(exit(result), (exit) => finishIndex(s, key, key, inputValue, exit));
			};
			const parseIndexes = indexCount ? iterateConcurrent()({
				onItem: (s, [key, index]) => index.is.parameter === string ? parseStringIndex(s, key, index) : parseIndex(s, key, index),
				step: (_s, _item, exit) => exit._tag === "Failure" ? exit : void 0
			}) : void 0;
			return fnUntracedEager(function* (input, options) {
				if (input === missing) return missing;
				if (!(typeof input === "object" && input !== null && !Array.isArray(input))) return yield* fail$3(new InvalidType(ast, input, options));
				compileMembers();
				const record = input;
				const out = {};
				const state = {
					ast,
					input: record,
					out,
					issues: void 0,
					options
				};
				const errorsAllOption = options.errors === "all";
				const onExcessPropertyError = options.onExcessProperty === "error";
				const concurrency = options.concurrency === void 0 ? 1 : resolveConcurrency(options.concurrency);
				const indexKeys = indexCount && onExcessPropertyError ? ast.indexSignatures.map((index) => getIndexSignatureKeys(record, index.parameter, options)) : void 0;
				if (onExcessPropertyError) {
					const coveredKeys = indexKeys ? new Set(expectedKeys) : expectedKeys;
					if (indexKeys) for (const keys of indexKeys) for (const key of keys) coveredKeys.add(key);
					const inputKeys = Reflect.ownKeys(record);
					for (let i = 0; i < inputKeys.length; i++) {
						const key = inputKeys[i];
						if (!coveredKeys.has(key) && Object.prototype.propertyIsEnumerable.call(record, key)) {
							const unexpected = new UnexpectedKey(ast, record[key], options);
							const issue = new Pointer([key], unexpected);
							if (errorsAllOption) {
								if (state.issues) state.issues.push(issue);
								else state.issues = [issue];
								continue;
							} else return yield* fail$3(new Composite(ast, [issue], input, options));
						}
					}
				}
				if (hasProperties) {
					const eff = concurrency === 1 ? parseProperties(state, properties) : parsePropertiesConcurrent(state, properties, { concurrency });
					if (eff) yield* eff;
				}
				if (indexCount && concurrency === 1) for (let i = 0; i < indexCount; i++) {
					const index = indexes[i];
					const parse = index.is.parameter === string ? parseStringIndex : parseIndex;
					const keys = indexKeys?.[i] ?? (index.is.parameter === string ? Object.keys(record) : getIndexSignatureKeys(record, index.is.parameter, options));
					for (let j = 0; j < keys.length; j++) {
						const eff = parse(state, keys[j], index);
						if (!effectIsExit(eff)) yield* eff;
						else if (eff._tag === "Failure") return yield* eff;
					}
				}
				else if (parseIndexes) {
					const keyPairs = empty$8();
					for (let i = 0; i < indexCount; i++) {
						const index = indexes[i];
						const keys = indexKeys?.[i] ?? (index.is.parameter === string ? Object.keys(record) : getIndexSignatureKeys(record, index.is.parameter, options));
						for (let j = 0; j < keys.length; j++) keyPairs.push([keys[j], index]);
					}
					const eff = parseIndexes(state, keyPairs, { concurrency });
					if (eff) yield* eff;
				}
				if (state.issues) return yield* fail$3(new Composite(ast, state.issues, input, options));
				return out;
			});
		};
		if (indexCount) return makeFallback();
		let fallback;
		const resume = (state, index, pending) => {
			const property = properties[index];
			return flatMap(exit(pending), (exit) => {
				const terminal = stepProperty(state, property, exit);
				if (terminal) return terminal;
				const done = () => succeed$2(state.out);
				const eff = parseProperties(state, properties.slice(index + 1));
				return eff ? flatMapEager(eff, done) : done();
			});
		};
		return (input, options) => {
			if (input === missing) return missingExit;
			if (options.errors === "all" || options.onExcessProperty !== void 0 || options.concurrency !== void 0 && resolveConcurrency(options.concurrency) !== 1) return (fallback ??= makeFallback())(input, options);
			if (!(typeof input === "object" && input !== null && !Array.isArray(input))) return fail$3(new InvalidType(ast, input, options));
			const props = compileMembers();
			const record = input;
			const out = {};
			const state = {
				ast,
				input: record,
				out,
				issues: void 0,
				options
			};
			try {
				for (let index = 0; index < props.length; index++) {
					const property = props[index];
					const name = property.name;
					const hasKey = hasPropertySignature(record, name);
					const value = hasKey ? record[name] : missing;
					const exit = property.parser(value, options);
					if (!effectIsExit(exit)) return resume(state, index, exit);
					if (exit === sameExit) {
						if (hasKey) assignProperty(out, name, value);
						continue;
					}
					const terminal = stepProperty(state, property, exit);
					if (terminal) return terminal;
				}
			} catch (error) {
				return die(error);
			}
			return succeed$2(out);
		};
	}
	_rebuild(recur, recurParameter, checks, encodingChecks) {
		const props = mapOrSame(this.propertySignatures, (ps) => {
			const t = recur(ps.type);
			return t === ps.type ? ps : new PropertySignature(ps.name, t);
		});
		const indexes = mapOrSame(this.indexSignatures, (is) => {
			const p = recurParameter(is.parameter);
			const t = recur(is.type);
			return p === is.parameter && t === is.type ? is : new IndexSignature(p, t);
		});
		return props === this.propertySignatures && indexes === this.indexSignatures && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Objects(props, indexes, this.annotations, checks, void 0, this.context, encodingChecks);
	}
	/** @internal */
	flip(recur) {
		return this._rebuild(recur, recur, this.encodingChecks, this.checks);
	}
	/** @internal */
	recur(recur, recurParameter = recur) {
		return this._rebuild(recur, recurParameter, this.checks, this.encodingChecks);
	}
	/** @internal */
	getExpected() {
		if (this.propertySignatures.length === 0 && this.indexSignatures.length === 0) return "object | array";
		return "object";
	}
};
/** @internal */
function stepProperty(s, p, exit) {
	if (exit._tag === "Failure") return wrapPropertyKeyIssue(s, s.ast, p.name, exit);
	if (exit === sameExit) return;
	const value = exit[args];
	if (value !== missing) {
		assignProperty(s.out, p.name, value);
		return;
	}
	delete s.out[p.name];
	if (!isOptional(p.type)) {
		const issue = new Pointer([p.name], new MissingKey(p.type.context?.annotations));
		if (s.options.errors === "all") {
			if (s.issues) s.issues.push(issue);
			else s.issues = [issue];
			return;
		} else return fail$4(new Composite(s.ast, [issue], s.input, s.options));
	}
}
const parsePropertiesOptions = {
	onItem(s, p) {
		if (!hasPropertySignature(s.input, p.name)) return p.parser(missing, s.options);
		const value = s.input[p.name];
		assignProperty(s.out, p.name, value);
		return p.parser(value, s.options);
	},
	step: stepProperty
};
/** @internal */
const parseProperties = /*#__PURE__*/ iterateEager()(parsePropertiesOptions);
const parsePropertiesConcurrent = /*#__PURE__*/ iterateConcurrent()(parsePropertiesOptions);
function combineChecks(a, b) {
	if (!a) return b;
	if (!b) return a;
	return [...a, ...b];
}
/** @internal */
function struct(fields, checks, annotations) {
	return new Objects(Reflect.ownKeys(fields).map((key) => {
		return new PropertySignature(key, fields[key].ast);
	}), [], annotations, checks);
}
/** @internal */
function getAST(self) {
	return self.ast;
}
/** @internal */
function union(members, options, checks) {
	return new Union$1(members.map(getAST), options, void 0, checks);
}
const toCandidate = /*#__PURE__*/ memoizeIdempotent((ast) => {
	while (true) {
		if (isSuspend(ast)) return unknown;
		const encoding = ast.encoding;
		if (!encoding) return ast.recur?.(toCandidate, identity) ?? ast;
		if (encoding.some((link) => link.transformation._tag === "Middleware" && link.transformation.decode !== identity)) return unknown;
		ast = encoding[encoding.length - 1].to;
	}
});
function getCandidateTypes(ast) {
	switch (ast._tag) {
		case "Null": return ["null"];
		case "Undefined": return ["undefined"];
		case "String":
		case "TemplateLiteral": return ["string"];
		case "Number": return ["number"];
		case "Boolean": return ["boolean"];
		case "Symbol":
		case "UniqueSymbol": return ["symbol"];
		case "BigInt": return ["bigint"];
		case "Arrays": return ["array"];
		case "ObjectKeyword": return [
			"object",
			"array",
			"function"
		];
		case "Objects": return ast.propertySignatures.length || ast.indexSignatures.length ? ["object"] : [
			"string",
			"number",
			"boolean",
			"symbol",
			"bigint",
			"object",
			"array",
			"function"
		];
		case "Enum": return Array.from(new Set(ast.enums.map(([, v]) => typeof v)));
		case "Literal": return [typeof ast.literal];
		case "Union": return Array.from(new Set(ast.types.flatMap(getCandidateTypes)));
		default: return [
			"null",
			"undefined",
			"string",
			"number",
			"boolean",
			"symbol",
			"bigint",
			"object",
			"array",
			"function"
		];
	}
}
/** @internal */
function collectSentinels(ast) {
	switch (ast._tag) {
		default: return [];
		case "Declaration": {
			const s = ast.annotations?.[SENTINELS_ANNOTATION_KEY];
			return Array.isArray(s) ? s : [];
		}
		case "Objects": return ast.propertySignatures.flatMap((ps) => {
			const type = ps.type;
			if (!isOptional(type)) {
				if (isLiteral(type)) return [{
					key: ps.name,
					literal: type.literal
				}];
				if (isUniqueSymbol(type)) return [{
					key: ps.name,
					literal: type.symbol
				}];
			}
			return [];
		});
		case "Arrays": return ast.elements.flatMap((e, i) => {
			if (!isOptional(e)) {
				if (isLiteral(e)) return [{
					key: i,
					literal: e.literal
				}];
				if (isUniqueSymbol(e)) return [{
					key: i,
					literal: e.symbol
				}];
			}
			return [];
		});
		case "Union": {
			if (ast.types.length === 0) return [];
			const members = ast.types.map((type) => collectSentinels(toCandidate(type)));
			return members[0].filter((s) => members.every((sentinels) => sentinels.some((o) => o.key === s.key && o.literal === s.literal)));
		}
		case "Suspend": return collectSentinels(ast.thunk());
	}
}
const candidateIndexCache = /*#__PURE__*/ new WeakMap();
const emptyCandidates = /*#__PURE__*/ Object.freeze([]);
const getRuntimeType = (input) => input === null ? "null" : Array.isArray(input) ? "array" : typeof input;
const hasPropertySignature = (input, key) => key === "__proto__" ? Object.hasOwn(input, key) : key in input;
/** @internal */
function getCandidateIndex(types) {
	let index = candidateIndexCache.get(types);
	if (index) return index;
	let bySentinel;
	let sentinelCandidateCount = 0;
	let otherwise;
	let literalCandidates;
	let onlyLiterals = true;
	const literalOf = [];
	for (let i = 0; i < types.length; i++) {
		const a = types[i];
		const encoded = toCandidate(a);
		if (isNever(encoded)) continue;
		if (isLiteral(encoded) || isUniqueSymbol(encoded)) {
			literalCandidates ??= /* @__PURE__ */ new Map();
			const literal = isLiteral(encoded) ? encoded.literal : encoded.symbol;
			literalOf[i] = literal;
			let arr = literalCandidates.get(literal);
			if (!arr) literalCandidates.set(literal, arr = []);
			arr.push(i);
		} else onlyLiterals = false;
		const sentinels = collectSentinels(encoded);
		if (sentinels.length) {
			bySentinel ??= /* @__PURE__ */ new Map();
			sentinelCandidateCount++;
			for (const { key, literal } of sentinels) {
				let entry = bySentinel.get(key);
				if (!entry) bySentinel.set(key, entry = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Set()]);
				entry[1].add(i);
				let indexes = entry[0].get(literal);
				if (!indexes) entry[0].set(literal, indexes = /* @__PURE__ */ new Set());
				indexes.add(i);
			}
		} else {
			otherwise ??= {};
			const candidateTypes = getCandidateTypes(encoded);
			for (const t of candidateTypes) (otherwise[t] ??= []).push(i);
		}
	}
	const fallbacks = {};
	const getFallback = (type) => fallbacks[type] ??= Object.freeze(otherwise?.[type] ?? emptyCandidates);
	if (onlyLiterals && literalCandidates) {
		literalCandidates.forEach(Object.freeze);
		index = (input) => literalCandidates.get(input) ?? emptyCandidates;
	} else if (bySentinel?.size === 1 && !otherwise) {
		const [key, [byValue]] = bySentinel.entries().next().value;
		const candidates = /* @__PURE__ */ new Map();
		for (const [literal, indexes] of byValue) candidates.set(literal, Object.freeze(Array.from(indexes)));
		const all = Object.freeze(types.map((_, i) => i));
		index = (input, isConstructor) => {
			if (isObjectKeyword(input)) {
				const value = hasPropertySignature(input, key) ? input[key] : void 0;
				if (value !== void 0) return candidates.get(value) ?? emptyCandidates;
				if (isConstructor) return all;
			}
			return emptyCandidates;
		};
	} else if (bySentinel) {
		let commonSentinel;
		for (const entry of bySentinel) if ((!commonSentinel || entry[1][0].size > commonSentinel[1][0].size) && entry[1][1].size === sentinelCandidateCount) commonSentinel = entry;
		index = (input, isConstructor) => {
			const runtimeType = getRuntimeType(input);
			if (!isObjectKeyword(input)) return getFallback(runtimeType);
			const selected = new Set(otherwise?.[runtimeType]);
			let directKey;
			if (commonSentinel) {
				const [key, [byValue]] = commonSentinel;
				const hasKey = hasPropertySignature(input, key);
				const value = hasKey ? input[key] : void 0;
				if (hasKey && (!isConstructor || value !== void 0)) {
					const match = byValue.get(value);
					if (!match) return getFallback(runtimeType);
					for (const i of match) selected.add(i);
					directKey = key;
				}
			}
			if (directKey === void 0) for (const [key, [byValue, all]] of bySentinel) {
				const hasKey = hasPropertySignature(input, key);
				const value = hasKey ? input[key] : void 0;
				if (hasKey && (!isConstructor || value !== void 0)) {
					const match = byValue.get(value);
					if (match) for (const i of match) selected.add(i);
				} else if (isConstructor) for (const i of all) selected.add(i);
			}
			for (const [key, [byValue, all]] of bySentinel) {
				if (key === directKey) continue;
				const hasKey = hasPropertySignature(input, key);
				const value = hasKey ? input[key] : void 0;
				if (hasKey && (!isConstructor || value !== void 0)) {
					const match = byValue.get(value);
					for (const i of selected) if (all.has(i) && !match?.has(i)) selected.delete(i);
				}
			}
			return Array.from(selected).sort((a, b) => a - b);
		};
	} else index = (input) => {
		const fallback = getFallback(getRuntimeType(input));
		return literalCandidates ? fallback.filter((i) => literalOf[i] === void 0 || literalOf[i] === input) : fallback;
	};
	candidateIndexCache.set(types, index);
	return index;
}
/**
* Constructs a {@link Union}.
*
* @category constructors
* @since 4.0.0
*/
const Union$1 = class extends ASTNodeImpl {
	_tag = "Union";
	types;
	options;
	encodingChecks;
	constructor(types, options, annotations, checks, encoding, context, encodingChecks) {
		super(annotations, checks, encoding, context);
		this.types = types;
		this.options = options;
		this.encodingChecks = encodingChecks;
	}
	/** @internal */
	getParser(compile, compileField) {
		const ast = this;
		const isConstructor = compileField !== void 0;
		const parsers = [];
		const parser = (i) => parsers[i] ??= compile(ast.types[i]);
		let index;
		return (input, options) => {
			if (input === missing) return missingExit;
			const candidates = (index ??= getCandidateIndex(ast.types))(input, isConstructor);
			if (candidates.length === 0) return fail$3(new AnyOf(ast, [], input, options));
			if (candidates.length === 1) {
				const result = parser(candidates[0])(input, options);
				if (result._tag === "Success") return result;
				return effectIsExit(result) ? failSingleUnionCandidate(ast, result.cause, input, options) : catchSingleUnionCandidate(ast, result, input, options);
			}
			return parseUnionCandidates(ast, parser, candidates, input, options);
		};
	}
	_rebuild(recur, checks, encodingChecks) {
		const types = mapOrSame(this.types, recur);
		return types === this.types && checks === this.checks && encodingChecks === this.encodingChecks ? this : new Union$1(types, this.options, this.annotations, checks, void 0, this.context, encodingChecks);
	}
	/** @internal */
	recur(recur) {
		return this._rebuild(recur, this.checks, this.encodingChecks);
	}
	/** @internal */
	flip(recur) {
		return this._rebuild(recur, this.encodingChecks, this.checks);
	}
	/** @internal */
	matchPart(s, options) {
		for (const type of this.types) {
			const out = type.matchPart(s, options);
			if (out !== void 0) return out;
		}
	}
	/** @internal */
	getExpected(getExpected) {
		const expected = this.annotations?.expected;
		if (typeof expected === "string") return expected;
		if (this.types.length === 0) return "never";
		const types = this.types.map((type) => {
			const encoded = toEncoded(type);
			switch (encoded._tag) {
				case "Arrays": {
					const literals = encoded.elements.filter(isLiteral);
					if (literals.length > 0) return `${formatIsMutable(encoded.isMutable)}[ ${literals.map((e) => getExpected(e) + formatIsOptional(e.context?.isOptional)).join(", ")}, ... ]`;
					break;
				}
				case "Objects": {
					const literals = encoded.propertySignatures.filter((ps) => isLiteral(ps.type));
					if (literals.length > 0) return `{ ${literals.map((ps) => `${formatIsMutable(ps.type.context?.isMutable)}${formatPropertyKey(ps.name)}${formatIsOptional(ps.type.context?.isOptional)}: ${getExpected(ps.type)}`).join(", ")}, ... }`;
					break;
				}
			}
			return getExpected(encoded);
		});
		return Array.from(new Set(types)).join(" | ");
	}
};
function failSingleUnionCandidate(ast, cause, input, options) {
	const issue = getSchemaIssue(cause);
	if (!issue) return failCause$4(cause);
	return fail$4(new AnyOf(ast, [issue], input, options));
}
function catchSingleUnionCandidate(ast, result, input, options) {
	return catchCause$1(result, (cause) => failSingleUnionCandidate(ast, cause, input, options));
}
function parseUnionCandidates(ast, parser, candidates, input, options) {
	const state = {
		ast,
		parser,
		input,
		out: void 0,
		successes: ast.options?.mode === "oneOf" ? [] : void 0,
		issues: void 0,
		options
	};
	const eff = parseUnion(state, candidates);
	if (!eff) {
		if (state.out) return state.out;
		return fail$3(new AnyOf(ast, state.issues ?? [], input, options));
	}
	return resumeUnion(eff, state);
}
function resumeUnion(eff, state) {
	return flatMapEager(eff, (_) => {
		if (state.out === sameExit) return succeed$3(state.input);
		if (state.out) return state.out;
		return fail$3(new AnyOf(state.ast, state.issues ?? [], state.input, state.options));
	});
}
const parseUnion = /*#__PURE__*/ iterateEager()({
	onItem(s, i) {
		return s.parser(i)(s.input, s.options);
	},
	step(s, i, exit) {
		if (exit._tag === "Failure") {
			const issue = getSchemaIssue(exit.cause);
			if (issue === void 0) return exit;
			if (s.issues) s.issues.push(issue);
			else s.issues = [issue];
		} else {
			if (s.out && s.successes) {
				s.successes.push(s.ast.types[i]);
				return fail$4(new OneOf(s.ast, s.successes, s.input, s.options));
			}
			s.out = exit;
			if (s.successes) s.successes.push(s.ast.types[i]);
			else return void_$1;
		}
	}
});
const nonFiniteLiterals = /*#__PURE__*/ new Union$1([
	/*#__PURE__*/ new Literal$1("Infinity"),
	/*#__PURE__*/ new Literal$1("-Infinity"),
	/*#__PURE__*/ new Literal$1("NaN")
]);
function formatIsMutable(isMutable) {
	return isMutable ? "" : "readonly ";
}
function formatIsOptional(isOptional) {
	return isOptional ? "?" : "";
}
/**
* Constructs a {@link Filter}.
*
* @category constructors
* @since 4.0.0
*/
const Filter = class extends Class$2 {
	_tag = "Filter";
	run;
	annotations;
	/**
	* Whether the parsing process should be aborted after this check has failed.
	*/
	aborted;
	constructor(run, annotations = void 0, aborted = false) {
		super();
		this.run = run;
		this.annotations = annotations;
		this.aborted = aborted;
	}
	annotate(annotations) {
		return new Filter(this.run, {
			...this.annotations,
			...annotations
		}, this.aborted);
	}
	abort() {
		return new Filter(this.run, this.annotations, true);
	}
	and(other, annotations) {
		return new FilterGroup([this, other], annotations);
	}
};
/**
* Constructs a {@link FilterGroup}.
*
* @category constructors
* @since 4.0.0
*/
const FilterGroup = class extends Class$2 {
	_tag = "FilterGroup";
	checks;
	annotations;
	constructor(checks, annotations = void 0) {
		super();
		this.checks = checks;
		this.annotations = annotations;
	}
	annotate(annotations) {
		return new FilterGroup(this.checks, {
			...this.annotations,
			...annotations
		});
	}
	and(other, annotations) {
		return new FilterGroup([this, other], annotations);
	}
};
/** @internal */
function makeFilter$1(filter, annotations, aborted = false) {
	return new Filter((input, ast, options) => normalizeFilterOutput(ast, filter(input, ast, options), input, options), annotations, aborted);
}
/** @internal */
function isFinite(annotations) {
	return makeFilter$1((n) => globalThis.Number.isFinite(n), {
		expected: "a finite number",
		representation: {
			id: "effect/schema/isFinite",
			payload: null
		},
		toJsonSchema: () => ({ type: "number" }),
		toCode: () => ({ runtime: "Schema.isFinite()" }),
		arbitraryConstraint: { number: "finite" },
		...annotations
	});
}
const numberToJson = /*#__PURE__*/ new Link(/*#__PURE__*/ new Union$1([/* @__PURE__ */ appendChecks(number, [/*#__PURE__*/ isFinite()]), nonFiniteLiterals]), /*#__PURE__*/ new Transformation(/*#__PURE__*/ Number$3(), /*#__PURE__*/ transform$1((n) => globalThis.Number.isFinite(n) ? n : globalThis.String(n))));
/**
* Creates a {@link Filter} that validates strings by running `RegExp.test`.
*
* **When to use**
*
* Use when string validation should be represented as a schema `Filter` backed
* by a regular expression.
*
* **Details**
*
* The filter can be used with `Schema.filter` or attached directly to a
* `String` AST node through checks. The regular expression is cloned and its
* `lastIndex` is reset before each test, so global and sticky expressions are
* deterministic and the provided regular expression is not mutated. The
* regular expression source is stored in annotations for serialization and
* arbitrary generation.
*
* **Gotchas**
*
* Arbitrary metadata preserves both `regExp.source` and `regExp.flags`.
* Implementations that cannot consume all flags may still use the source as a
* generation hint because the Schema filter validates every generated value.
* JSON Schema has no way to carry JavaScript regular-expression flags. Unless
* annotations provide `toJsonSchema`, the RegExp constraint is omitted from
* JSON Schema export.
*
* **Example** (Validating an email pattern)
*
* ```ts import.meta.vitest
* import { SchemaAST } from "effect"
*
* const emailFilter = SchemaAST.isPattern(/^[^@]+@[^@]+$/)
* emailFilter.run("alice@example.com", SchemaAST.string, {}) // => undefined
* emailFilter.run("invalid", SchemaAST.string, {})?._tag // => "InvalidValue"
* ```
*
* @see {@link Filter}
* @category constructors
* @since 4.0.0
*/
function isPattern$1(regExp, annotations) {
	const copy = new globalThis.RegExp(regExp);
	const payload = {
		source: copy.source,
		flags: copy.flags
	};
	return makeFilter$1((s) => {
		copy.lastIndex = 0;
		return copy.test(s);
	}, {
		expected: `a string matching the RegExp ${payload.source}`,
		representation: {
			id: "effect/schema/isPattern",
			payload
		},
		toJsonSchema: () => [{}, true],
		arbitraryConstraint: { patterns: [payload] },
		...annotations
	});
}
const bodyOwners = /*#__PURE__*/ new WeakMap();
function copy(ast, changes) {
	const out = Object.assign(Object.create(Object.getPrototypeOf(ast)), ast, changes);
	if (Reflect.ownKeys(changes).every((key) => key === "context" || key === "encoding")) bodyOwners.set(out, getContextOwner(ast));
	return out;
}
/** @internal */
function getContextOwner(ast) {
	const existing = bodyOwners.get(ast);
	if (existing !== void 0) return existing;
	if (ast.encoding === void 0) return ast;
	const owner = Object.assign(Object.create(Object.getPrototypeOf(ast)), ast, { encoding: void 0 });
	bodyOwners.set(ast, owner);
	return owner;
}
/** @internal */
function replaceEncoding(ast, encoding) {
	return ast.encoding === encoding ? ast : copy(ast, { encoding });
}
/** @internal */
function replaceContext(ast, context) {
	if (ast.context === context) return ast;
	const owner = getContextOwner(ast);
	if (owner.context === context && owner.encoding === ast.encoding) return owner;
	return copy(ast, { context });
}
/** @internal */
function getLastEncoding(ast) {
	return ast.encoding ? getLastEncoding(ast.encoding[ast.encoding.length - 1].to) : ast;
}
/** @internal */
function annotate(ast, annotations) {
	if (ast.checks) {
		const last = ast.checks[ast.checks.length - 1];
		return replaceChecks(ast, append$1(ast.checks.slice(0, -1), last.annotate(annotations)));
	}
	return copy(ast, { annotations: {
		...ast.annotations,
		...annotations
	} });
}
/** @internal */
function replaceChecks(ast, checks) {
	if (ast._tag === "Suspend" && checks) throw new Error("Cannot add checks to Suspend");
	if (ast.checks === checks) return ast;
	return copy(ast, { checks });
}
/** @internal */
function appendChecks(ast, checks) {
	return replaceChecks(ast, combineChecks(ast.checks, checks));
}
/** @internal */
function mapLink(link, f) {
	const to = f(link.to);
	return to === link.to ? link : new Link(to, link.transformation);
}
function updateLastLink(encoding, f) {
	const links = encoding;
	const last = links[links.length - 1];
	const out = mapLink(last, f);
	return out === last ? encoding : append$1(encoding.slice(0, encoding.length - 1), out);
}
/** @internal */
function applyToLastLink(f) {
	return (ast) => ast.encoding ? replaceEncoding(ast, updateLastLink(ast.encoding, f)) : ast;
}
/** @internal */
function replaceContextLastLink(ast, context) {
	return applyToLastLink((ast) => replaceContext(ast, context))(ast);
}
/** @internal */
function applyToSelfOrLastLinkEncoding(f) {
	function out(ast) {
		return ast.encoding ? replaceEncoding(ast, updateLastLink(ast.encoding, out)) : f(ast);
	}
	return memoize(out);
}
/** @internal */
function applyToSelfOrLastLinkEncodingIdempotent(f, options) {
	function out(ast) {
		if (ast.encoding) {
			const last = ast.encoding[ast.encoding.length - 1];
			return options?.stopAt?.(last) ? ast : replaceEncoding(ast, updateLastLink(ast.encoding, out));
		}
		return f(ast);
	}
	return memoizeIdempotent(out);
}
function appendTransformation(from, transformation, to) {
	const link = new Link(from, transformation);
	return replaceEncoding(to, to.encoding ? [...to.encoding, link] : [link]);
}
function mapOrSame(as, f) {
	let out;
	for (let i = 0; i < as.length; i++) {
		const a = as[i];
		const fa = f(a);
		if (out) out[i] = fa;
		else if (fa !== a) {
			out = new Array(as.length);
			for (let j = 0; j < i; j++) out[j] = as[j];
			out[i] = fa;
		}
	}
	return out ?? as;
}
/** @internal */
function annotateKey(ast, annotations) {
	return replaceContext(ast, ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, ast.context.constructorDefault, {
		...ast.context.annotations,
		...annotations
	}) : new Context(false, false, void 0, annotations));
}
/** @internal */
const optionalKey$1 = /*#__PURE__*/ memoizeIdempotent((ast) => {
	const context = ast.context ? ast.context.isOptional === false ? new Context(true, ast.context.isMutable, ast.context.constructorDefault, ast.context.annotations) : ast.context : new Context(true, false);
	return optionalKeyLastLink(replaceContext(ast, context));
});
const optionalKeyLastLink = /*#__PURE__*/ applyToLastLink(optionalKey$1);
/** @internal */
const optional$1 = /*#__PURE__*/ memoize((ast) => optionalKey$1(new Union$1([ast, undefined_])));
/** @internal */
function withConstructorDefault$1(ast, defaultValue) {
	return replaceContext(ast, ast.context ? new Context(ast.context.isOptional, ast.context.isMutable, defaultValue, ast.context.annotations) : new Context(false, false, defaultValue));
}
/**
* Attaches a `Transformation` to the `to` AST, making it decode from the
* `from` AST and encode back to it.
*
* **Details**
*
* This is the low-level primitive behind `Schema.decodeTo`. It appends a
* {@link Link} to the `to` node's encoding chain.
*
* - Returns a new AST with the same type as `to`.
*
* @see {@link Link}
* @see {@link Encoding}
* @see {@link flip}
* @category transforming
* @since 4.0.0
*/
function decodeTo$1(from, to, transformation) {
	return appendTransformation(from, transformation, to);
}
function parseParameter(ast) {
	const literals = [];
	const parameters = [];
	function go(ast) {
		switch (ast._tag) {
			case "Literal":
				if (isPropertyKey(ast.literal) && !literals.includes(ast.literal)) literals.push(ast.literal);
				return;
			case "UniqueSymbol":
				if (!literals.includes(ast.symbol)) literals.push(ast.symbol);
				return;
			case "Never": return;
			case "Union":
				for (let i = 0; i < ast.types.length; i++) go(ast.types[i]);
				return;
			default: parameters.push(ast);
		}
	}
	go(ast);
	return {
		literals,
		parameters
	};
}
/** @internal */
function record(key, value) {
	const { literals, parameters: indexSignatures } = parseParameter(key);
	return new Objects(literals.map((literal) => new PropertySignature(literal, value)), indexSignatures.map((parameter) => new IndexSignature(parameter, value)));
}
/**
* Returns `true` if the AST node represents an optional property.
*
* **Details**
*
* Checks `ast.context?.isOptional`. Defaults to `false` when no
* {@link Context} is set.
*
* @see `Schema.optionalKey`
* @see {@link Context}
* @category predicates
* @since 4.0.0
*/
function isOptional(ast) {
	return ast.context?.isOptional ?? false;
}
function isStructuralCheck(check) {
	return check.annotations?.["~structural"] === true || check._tag === "FilterGroup" && check.checks.every(isStructuralCheck);
}
function extractStructuralChecks(checks) {
	function extract(check) {
		if (isStructuralCheck(check)) return [check];
		return check._tag === "FilterGroup" ? check.checks.flatMap(extract) : [];
	}
	const out = checks.flatMap(extract);
	return isArrayNonEmpty(out) ? out : void 0;
}
function canPreserveEncodingChecks(ast) {
	let preserve = true;
	function visit(child) {
		preserve = preserve && !child.encoding && !isSuspend(child);
		if (preserve && "recur" in child) child.recur(visit);
		return child;
	}
	if ("recur" in ast) ast.recur(visit);
	return preserve;
}
/**
* Strips all encoding transformations from an AST, returning the decoded
* (type-level) representation.
*
* **Details**
*
* - Memoized: same input reference → same output reference.
* - Recursively walks into composite nodes ({@link Arrays}, {@link Objects},
*   {@link Union}, {@link Suspend}).
*
* **Example** (Getting the type AST)
*
* ```ts import.meta.vitest
* import { Schema, SchemaAST } from "effect"
*
* const schema = Schema.NumberFromString
* const typeAst = SchemaAST.toType(schema.ast)
* typeAst._tag // => "Number"
* ```
*
* @see {@link toEncoded}
* @see {@link flip}
* @category transforming
* @since 4.0.0
*/
const toType = /*#__PURE__*/ memoizeIdempotent((ast) => {
	const owner = getContextOwner(ast);
	if (owner !== ast) {
		const type = toType(owner);
		return type === owner && ast.encoding === void 0 ? ast : replaceContext(type, ast.context);
	}
	const type = "recur" in ast ? ast.recur(toType) : ast;
	if ("encodingChecks" in type && type.encodingChecks) {
		const checks = canPreserveEncodingChecks(ast) ? type.encodingChecks : isArrays(type) || isObjects(type) || isDeclaration(type) && type.typeParameters.length > 0 ? extractStructuralChecks(type.encodingChecks) : void 0;
		return copy(type, {
			encodingChecks: void 0,
			checks: combineChecks(type.checks, checks)
		});
	}
	return type;
});
/**
* Returns the encoded (wire-format) AST by flipping and then stripping
* encodings.
*
* **Details**
*
* Equivalent to `toType(flip(ast))`. This gives you the AST that describes
* the shape of the serialized/encoded data.
*
* - Memoized: same input reference → same output reference.
*
* **Example** (Getting the encoded AST)
*
* ```ts import.meta.vitest
* import { Schema, SchemaAST } from "effect"
*
* const schema = Schema.NumberFromString
* const encodedAst = SchemaAST.toEncoded(schema.ast)
* encodedAst._tag // => "String"
* ```
*
* @see {@link toType}
* @see {@link flip}
* @category transforming
* @since 4.0.0
*/
const toEncoded = /*#__PURE__*/ memoizeIdempotent((ast) => {
	return toType(flip(ast));
});
function flipEncoding(ast, encoding) {
	const links = encoding;
	const len = links.length;
	const last = links[len - 1];
	const ls = [new Link(flip(replaceEncoding(ast, void 0)), links[0].transformation.flip())];
	for (let i = 1; i < len; i++) ls.unshift(new Link(flip(links[i - 1].to), links[i].transformation.flip()));
	const to = flip(last.to);
	if (to.encoding) return replaceEncoding(to, [...to.encoding, ...ls]);
	else return replaceEncoding(to, ls);
}
/**
* Swaps the decode and encode directions of an AST's {@link Encoding} chain.
*
* **Details**
*
* After flipping, what was decoding becomes encoding and vice versa. This is
* the core operation behind `Schema.encode` — encoding a value is decoding
* with a flipped SchemaAST.
*
* - Memoized: same input reference → same output reference.
* - Recursively walks composite nodes.
*
* @see {@link toType}
* @see {@link toEncoded}
* @category transforming
* @since 4.0.0
*/
const flip = /*#__PURE__*/ memoize((ast) => {
	if (ast.encoding) return flipEncoding(ast, ast.encoding);
	const owner = getContextOwner(ast);
	if (owner !== ast) {
		const flipped = flip(owner);
		return flipped === owner ? ast : replaceContext(flipped, ast.context);
	}
	return "flip" in ast ? ast.flip(flip) : "recur" in ast ? ast.recur(flip) : ast;
});
/** @internal */
function containsUndefined(ast) {
	switch (ast._tag) {
		case "Undefined": return true;
		case "Union": return ast.types.some(containsUndefined);
		default: return false;
	}
}
function fromConst(ast, value) {
	const succeed = value === 0 ? sameExit : succeed$2(value);
	return (input, options) => {
		if (input === missing) return missingExit;
		if (input === value) return succeed;
		return fail$3(new InvalidType(ast, input, options));
	};
}
function fromRefinement(ast, refinement) {
	return (input, options) => {
		if (input === missing) return missingExit;
		if (refinement(input)) return sameExit;
		return fail$3(new InvalidType(ast, input, options));
	};
}
/** @internal */
const parameterFromPropertyKey = /*#__PURE__*/ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
	switch (ast._tag) {
		default: return ast;
		case "Number": return ast.toCodecStringTree();
		case "Union": return ast.recur(parameterFromPropertyKey);
	}
});
/** @internal */
const parameterFromString = /*#__PURE__*/ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
	switch (ast._tag) {
		default: return ast;
		case "Symbol":
		case "UniqueSymbol": return ast.toCodecStringTree();
		case "Union": return ast.recur(parameterFromString);
	}
});
const isStringFiniteRegExp = /*#__PURE__*/ new globalThis.RegExp(`^${FINITE_PATTERN}$`);
const isStringNumberRegExp = /*#__PURE__*/ new globalThis.RegExp(`^(?:${FINITE_PATTERN}|Infinity|-Infinity|NaN)$`);
/** @internal */
function isStringFinite(annotations) {
	return isPattern$1(isStringFiniteRegExp, {
		expected: "a string representing a finite number",
		representation: {
			id: "effect/schema/isStringFinite",
			payload: null
		},
		toJsonSchema: () => ({ pattern: isStringFiniteRegExp.source }),
		...annotations
	});
}
const finiteString = /*#__PURE__*/ appendChecks(string, [/*#__PURE__*/ isStringFinite()]);
const finiteToString = /*#__PURE__*/ new Link(finiteString, numberFromString);
const numberToString = /*#__PURE__*/ new Link(/*#__PURE__*/ new Union$1([finiteString, nonFiniteLiterals]), numberFromString);
/** @internal */
function collectIssues(checks, value, issues, ast, options) {
	for (let i = 0; i < checks.length; i++) {
		const check = checks[i];
		if (check._tag === "FilterGroup") {
			issues = collectIssues(check.checks, value, issues, ast, options);
			if (issues && (options.errors !== "all" || issues[issues.length - 1].filter.aborted)) return issues;
		} else {
			const issue = check.run(value, ast, options);
			if (issue) {
				const filter = new Filter$1(check, issue, value, options);
				if (issues) issues.push(filter);
				else issues = [filter];
				if (options.errors !== "all" || check.aborted) return issues;
			}
		}
	}
	return issues;
}
/** @internal */
function getConstructorDescriptor(ast) {
	if (!isDeclaration(ast)) return void 0;
	const getDescriptor = ast.annotations?.[CONSTRUCTOR_ANNOTATION_KEY];
	return isFunction(getDescriptor) ? getDescriptor(ast.typeParameters) : void 0;
}
function isJsonLeaf(u) {
	return u === null || typeof u === "string" || typeof u === "boolean" || typeof u === "number" && globalThis.Number.isFinite(u);
}
function isStringTreeLeaf(u) {
	return u === void 0 || typeof u === "string";
}
function isTree(u, isLeaf) {
	const cache = /* @__PURE__ */ new WeakMap();
	const stack = [];
	outer: while (true) {
		if (typeof u !== "object" || u === null) {
			if (!isLeaf(u)) return false;
		} else {
			const value = u;
			const cached = cache.get(value);
			if (cached === false) return false;
			if (cached === void 0) {
				const isArray = Array.isArray(value);
				if (!isArray) {
					const prototype = Object.getPrototypeOf(value);
					if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) return false;
				}
				cache.set(value, false);
				stack.push({
					value,
					keys: isArray ? value.length : Object.keys(value),
					index: 0
				});
			}
		}
		while (stack.length > 0) {
			const frame = stack[stack.length - 1];
			const keys = frame.keys;
			if (typeof keys === "number") {
				if (frame.index < keys) {
					u = frame.value[frame.index++];
					continue outer;
				}
			} else if (frame.index < keys.length) {
				u = frame.value[keys[frame.index++]];
				continue outer;
			}
			cache.set(frame.value, true);
			stack.pop();
		}
		return true;
	}
}
/**
* Returns true if the value is a JSON value.
*
* When a cyclic reference is detected, returns false.
*
* @internal
*/
function isJson(u) {
	return isTree(u, isJsonLeaf);
}
/** @internal */
const Json$2 = /*#__PURE__*/ new Declaration([], () => (input, ast, options) => isJson(input) ? sameExit : fail$3(new InvalidType(ast, input, options)), {
	representation: {
		id: "effect/schema/Json",
		payload: null
	},
	expected: "JSON value",
	toCodecJson: () => void 0,
	toCodecStringTree: () => unknownToStringTree
});
/**
* Returns true if the value is a StringTree value.
*
* When a cyclic reference is detected, returns false.
*
* @internal
*/
function isStringTree(u) {
	return isTree(u, isStringTreeLeaf);
}
/** @internal */
const unknownToStringTree = /*#__PURE__*/ new Link(/* @__PURE__ */ new Declaration([], () => (input, ast, options) => isStringTree(input) ? sameExit : fail$3(new InvalidType(ast, input, options)), {
	expected: "StringTree",
	toCodecStringTree: () => void 0
}), /*#__PURE__*/ passthrough());
//#endregion
//#region node_modules/effect/dist/internal/schema/interpreter.js
const flatMapTransformation = (result, current, f) => result === sameExit ? f(current) : flatMapEager(result, f);
function compileTransformation(transformation) {
	if (transformation._tag === "Middleware") return (result, current, options) => {
		const transformed = result === sameExit ? transformation.decode(succeed$2(toOption(current)), options) : transformation.decode(mapEager(result, toOption), options);
		return fromOptionalEffect(transformed);
	};
	const getter = transformation.decode;
	switch (getter._tag) {
		case "Passthrough": return (result, current) => result === sameExit ? succeed$2(current) : result;
		case "Transform": {
			const transform = (value) => value === missing ? missingExit : succeed$2(getter.transform(value));
			return (result, current) => flatMapTransformation(result, current, transform);
		}
		case "TransformOptional": {
			const transform = (value) => fromOptionExit(getter.transform(toOption(value)));
			return (result, current) => flatMapTransformation(result, current, transform);
		}
		case "TransformEffect": return (result, current, options) => flatMapTransformation(result, current, (value) => value === missing ? missingExit : getter.transform(value, options));
		case "TransformOptionalEffect": return (result, current, options) => flatMapTransformation(result, current, (value) => fromOptionalEffect(getter.transform(toOption(value), options)));
	}
}
const fromOptionalEffect = (effect) => flatMapEager(effect, fromOptionExit);
/** @internal */
const wrapEncoding = (ast, input, options, effect) => catchCause$1(effect, (cause) => failCauseSync(() => map$3(cause, (issue) => new Encoding(ast, issue, input, options))));
function makeConstructorParser(descriptor, compile) {
	const transform = compileTransformation(descriptor.link.transformation);
	let sourceParser;
	return (input, options) => {
		if (input === missing) return missingExit;
		if (descriptor.isConstructed(input)) return sameExit;
		const result = (sourceParser ??= compile(descriptor.link.to))(input, options);
		return transform(result, input, options);
	};
}
function withDefault$1(ast, parser) {
	const defaultValue = ast.context.constructorDefault;
	return (input, options) => {
		if (input !== missing && input !== void 0) return parser(input, options);
		const result = defaultValue;
		if (effectIsExit(result) && result._tag === "Success") {
			const local = parser(result[args], options);
			return local === sameExit ? result : local;
		}
		return flatMapEager(wrapEncoding(ast, input, options, result), (value) => {
			const local = parser(value, options);
			return local === sameExit ? succeed$2(value) : local;
		});
	};
}
/** @internal */
function compileField(ast, compile) {
	const parser = compile(ast);
	return ast.context?.constructorDefault === void 0 ? parser : withDefault$1(ast, parser);
}
/** @internal */
function compile(ast, compile, compileField, base, specialize) {
	if (ast._tag === "Declaration") for (const parameter of ast.typeParameters) compile(parameter);
	const descriptor = compileField ? getConstructorDescriptor(ast) : void 0;
	const parser = descriptor ? makeConstructorParser(descriptor, compile) : base ?? ast.getParser(compile, compileField);
	const checks = ast.checks;
	const links = ast.encoding;
	const transformations = links?.map((link) => compileTransformation(link.transformation));
	const encodingChecks = ast.encodingChecks;
	if (!links && !checks && !encodingChecks) return parser;
	let encodingParsers;
	const parseChecks = (input, options) => {
		let result = parser(input, options);
		if (encodingChecks && !options.disableChecks) {
			if (effectIsExit(result)) {
				if (result._tag === "Success") {
					const output = result === sameExit ? input : result[args];
					if (input !== missing && output !== missing) {
						const issues = collectIssues(encodingChecks, input, void 0, ast, options);
						if (issues) result = fail$3(new Composite(ast, issues, input, options));
					}
				}
			} else result = flatMap(result, (value) => {
				if (input !== missing && value !== missing) {
					const issues = collectIssues(encodingChecks, input, void 0, ast, options);
					if (issues) return fail$3(new Composite(ast, issues, input, options));
				}
				return succeed$3(value);
			});
		}
		if (checks && !options.disableChecks) {
			if (effectIsExit(result)) {
				if (result._tag === "Success") {
					const value = result === sameExit ? input : result[args];
					if (value === missing) return result;
					const issues = collectIssues(checks, value, void 0, ast, options);
					if (issues) result = fail$3(new Composite(ast, issues, value, options));
				}
			} else result = flatMap(result, (value) => {
				if (value !== missing) {
					const issues = collectIssues(checks, value, void 0, ast, options);
					if (issues) return fail$3(new Composite(ast, issues, value, options));
				}
				return succeed$3(value);
			});
		}
		return result;
	};
	const parseLocal = specialize === void 0 ? parseChecks : specialize(parseChecks);
	if (!links) return parseLocal;
	return (input, options) => {
		const parsers = encodingParsers ??= links.map((link) => compile(link.to));
		let current = input;
		let result = parsers[parsers.length - 1](input, options);
		for (let i = links.length - 1; i >= 0; i--) {
			result = transformations[i](result, current, options);
			if (i !== 0) {
				const next = parsers[i - 1];
				if (result._tag === "Success") {
					current = result[args];
					result = next(current, options);
				} else result = flatMapEager(result, (value) => {
					const nextResult = next(value, options);
					return nextResult === sameExit ? succeed$2(value) : nextResult;
				});
			}
		}
		if (result._tag === "Success") {
			const value = result[args];
			const local = parseLocal(value, options);
			return local === sameExit ? result : local;
		}
		result = wrapEncoding(ast, input, options, result);
		return flatMapEager(result, (value) => {
			const local = parseLocal(value, options);
			return local === sameExit ? succeed$2(value) : local;
		});
	};
}
//#endregion
//#region node_modules/effect/dist/internal/schema/compilerRegistry.js
/** @internal */
const invalid = /*#__PURE__*/ Symbol();
const cache = /*#__PURE__*/ new WeakMap();
const decodeChild = (ast) => resolve(ast).parser;
const makeChild = (ast) => resolve(ast).makeEffect;
const makeField = (ast) => compileField(ast, makeChild);
var InterpretedEntry = class {
	ast;
	constructor(ast) {
		this.ast = ast;
	}
	get decodeEffect() {
		return this.cachedDecodeEffect ??= compile(this.ast, decodeChild);
	}
	get parser() {
		return this.decodeEffect;
	}
	get makeEffect() {
		return this.cachedMakeEffect ??= compile(this.ast, makeChild, makeField);
	}
};
/** @internal */
function resolve(ast) {
	const cached = cache.get(ast);
	if (cached !== void 0) return cached;
	const entry = new InterpretedEntry(ast);
	cache.set(ast, entry);
	return entry;
}
//#endregion
//#region node_modules/effect/dist/SchemaParser.js
/**
* Runs schemas against real values.
*
* Schema parsers construct values from schema input, check whether a value
* matches a schema, decode encoded input, and encode decoded values back to
* their external form. This module exposes those operations through several
* result styles, including `Effect`, `Promise`, `Exit`, `Option`, `Result`, and
* synchronous functions that throw. It also contains the lower-level runner that
* walks a schema AST and reports schema failures as `SchemaIssue.Issue` values.
*
* @since 4.0.0
*/
/**
* Creates an effectful maker for the schema's decoded type side.
*
* **When to use**
*
* Use to construct decoded schema values in `Effect` while preserving
* construction failures as `SchemaIssue.Issue` values in the error channel.
*
* **Details**
*
* The returned function accepts constructor input, applies constructor defaults,
* runs type-side validation unless checks are disabled, and fails with a
* `SchemaIssue.Issue` when construction fails.
*
* @category constructors
* @since 4.0.0
*/
function makeEffect(schema) {
	const ast = schema.ast;
	let parser;
	return (input, options) => {
		return (parser ??= runWithCompiler(constructorCompiler, toType(ast)))(input, options?.disableChecks ? options?.parseOptions ? {
			...options.parseOptions,
			disableChecks: true
		} : { disableChecks: true } : options?.parseOptions);
	};
}
/**
* Creates a synchronous maker that returns `Option.some` with the constructed
* value on success, or `Option.none` when construction fails with schema issues.
*
* **When to use**
*
* Use when you need to validate schema constructor input and only care whether
* construction succeeds, without exposing `SchemaIssue.Issue` details.
*
* **Gotchas**
*
* Only causes made entirely of schema issues are converted to `Option.none`.
* Causes that contain defects, interruptions, or asynchronous work at this
* synchronous boundary throw an `Error` whose cause is the underlying `Cause`.
*
* @category constructors
* @since 4.0.0
*/
function makeOption(schema) {
	const parser = makeEffect(schema);
	return (input, options) => {
		const exit = runSyncExit(parser(input, options));
		if (isSuccess(exit)) return some(exit.value);
		getSchemaIssueOrThrow(exit.cause, "Option adapter can only return none for schema issues");
		return none();
	};
}
/**
* Creates a synchronous maker for the schema's decoded type side.
*
* **When to use**
*
* Use to construct decoded schema values synchronously when invalid input
* should throw an `Error` whose cause is `SchemaIssue.Issue`.
*
* **Details**
*
* The returned function constructs a value from constructor input and throws an
* `Error` with the `SchemaIssue.Issue` in its `cause` when construction fails.
* Schema validation failures use the generic message `"Schema validation failed"`.
* Format the `cause` explicitly with `SchemaIssue.makeFormatterDefault()` when
* human-readable details are needed.
*
* **Gotchas**
*
* Causes that contain defects, interruptions, or asynchronous work at this
* synchronous boundary throw an `Error` whose cause is the underlying `Cause`,
* instead of being converted to a schema validation error.
*
* @category constructors
* @since 4.0.0
*/
function make$15(schema) {
	return makeConstructorSync(toType(schema.ast));
}
/**
* Creates a type guard that checks whether an input satisfies the schema's decoded
* type side.
*
* **When to use**
*
* Use to build a type guard for checking the decoded side of a schema without
* exposing issue details.
*
* **Details**
*
* The guard returns `true` on successful validation and `false` when validation
* fails only with schema issues, without exposing issue details.
*
* **Gotchas**
*
* Only causes made entirely of schema issues are converted to `false`. Causes
* that contain defects, interruptions, or asynchronous work at this synchronous
* boundary throw an `Error` whose cause is the underlying `Cause`.
*
* @category guards
* @since 3.10.0
*/
function is$1(schema) {
	return _is(schema.ast);
}
function makeIs(ast) {
	{
		const parser = asExit(run(ast));
		return (input) => {
			const exit = parser(input, defaultParseOptions);
			if (isSuccess(exit)) return true;
			getSchemaIssueOrThrow(exit.cause, "Type guard adapter can only return false for schema issues");
			return false;
		};
	}
}
/** @internal */
function _is(ast) {
	const typeAST = toType(ast);
	let guard = (input) => {
		guard = makeIs(typeAST);
		return guard(input);
	};
	return (input) => {
		return guard(input);
	};
}
/**
* Creates an effectful decoder for `unknown` input.
*
* **When to use**
*
* Use when you need to decode untyped boundary input in an `Effect` whose
* failure channel is `SchemaIssue.Issue`, while preserving transformations
* and service requirements.
*
* **Details**
*
* The returned function succeeds with the schema's decoded `Type` or fails with a
* `SchemaIssue.Issue`. Decoding service requirements are preserved in the returned
* `Effect`. Parse options may be provided when creating the decoder and overridden
* when applying it.
*
* @see {@link decodeEffect} for input already typed as the schema's `Encoded` type
*
* @category decoding
* @since 4.0.0
*/
function decodeUnknownEffect$1(schema, options) {
	const parser = run(schema.ast);
	return options === void 0 ? parser : (input, overrideOptions) => parser(input, mergeParseOptions(options, overrideOptions));
}
/** @internal */
function decodeUnknownOption$1(schema, options) {
	return asOption(decodeUnknownEffect$1(schema, options));
}
/**
* Creates an effectful encoder for `unknown` input.
*
* **When to use**
*
* Use when you need to encode untyped boundary input in an `Effect` whose
* failure channel is `SchemaIssue.Issue`, while preserving service
* requirements.
*
* **Details**
*
* The returned function succeeds with the schema's `Encoded` value or fails with a
* `SchemaIssue.Issue`. Encoding service requirements are preserved in the returned
* `Effect`. Parse options may be provided when creating the encoder and overridden
* when applying it.
*
* @see {@link encodeEffect} for the typed-input variant when the value is already typed as the schema's decoded `Type`
*
* @category encoding
* @since 4.0.0
*/
function encodeUnknownEffect$1(schema, options) {
	const parser = run(flip(schema.ast));
	return options === void 0 ? parser : (input, overrideOptions) => parser(input, mergeParseOptions(options, overrideOptions));
}
const mergeParseOptions = (options, overrideOptions) => overrideOptions ? {
	...options,
	...overrideOptions
} : options;
const getValue = (value) => {
	if (value === missing) return fail$3(new InvalidValue());
	return succeed$3(value);
};
/** @internal */
function run(ast) {
	return runWithCompiler(normalCompiler, ast);
}
function parserResult(result, input) {
	if (result === sameExit) return succeed$3(input);
	if (!effectIsExit(result)) return flatMapEager(result, getValue);
	return result[args] === missing ? getValue(missing) : result;
}
function runWithCompiler(compiler, ast) {
	let parser;
	return (input, options) => {
		const result = (parser ??= compiler(ast))(input, options ?? defaultParseOptions);
		if (result === sameExit) return succeed$3(input);
		if (!effectIsExit(result)) return flatMapEager(result, getValue);
		return result[args] === missing ? getValue(missing) : result;
	};
}
function asExit(parser) {
	return (input, options) => runSyncExit(parser(input, options));
}
/** @internal */
function asOption(parser) {
	const parserExit = asExit(parser);
	return (input, options) => {
		const exit = parserExit(input, options);
		if (isSuccess(exit)) return some(exit.value);
		getSchemaIssueOrThrow(exit.cause, "Option adapter can only return none for schema issues");
		return none();
	};
}
function runSync(effect, message) {
	const exit = runSyncExit(effect);
	if (isSuccess(exit)) return exit.value;
	const issue = getSchemaIssueOrThrow(exit.cause, message);
	throw new Error("Schema validation failed", { cause: issue });
}
function makeConstructorSync(ast) {
	let entry;
	let parser;
	return (input, options) => {
		entry ??= resolve(ast);
		const parseOptions = options?.disableChecks ? options.parseOptions ? {
			...options.parseOptions,
			disableChecks: true
		} : { disableChecks: true } : options?.parseOptions ?? defaultParseOptions;
		const make = entry.make;
		if (make !== void 0 && input !== missing) {
			let output;
			try {
				output = make(input, parseOptions);
			} catch (error) {
				getSchemaIssueOrThrow(die$1(error), "Constructor adapter can only throw schema issues");
				throw error;
			}
			if (output !== invalid && output !== missing) return output;
		}
		return runSync(parserResult((parser ??= entry.makeEffect)(input, parseOptions), input), "Constructor adapter can only throw schema issues");
	};
}
const normalCompiler = (ast) => resolve(ast).parser;
const constructorCompiler = (ast) => resolve(ast).makeEffect;
//#endregion
//#region node_modules/effect/dist/internal/schema/make.js
/** @internal */
const TypeId$18 = "~effect/Schema/Schema";
const RebuildOptions = /*#__PURE__*/ Symbol();
const SchemaProto = {
	[TypeId$18]: TypeId$18,
	get make() {
		const value = make$15(this);
		Object.defineProperty(this, "make", {
			value,
			enumerable: true
		});
		return value;
	},
	get makeEffect() {
		const value = makeEffect(this);
		Object.defineProperty(this, "makeEffect", {
			value,
			enumerable: true
		});
		return value;
	},
	get makeOption() {
		const value = makeOption(this);
		Object.defineProperty(this, "makeOption", {
			value,
			enumerable: true
		});
		return value;
	},
	pipe() {
		return pipeArguments(this, arguments);
	},
	annotate(annotations) {
		return this.rebuild(annotate(this.ast, annotations));
	},
	annotateKey(annotations) {
		return this.rebuild(annotateKey(this.ast, annotations));
	},
	check(...checks) {
		return this.rebuild(appendChecks(this.ast, checks));
	},
	rebuild(ast) {
		return make$14(ast, this[RebuildOptions]);
	}
};
/** @internal */
function make$14(ast, options) {
	function Schema() {}
	const self = Object.setPrototypeOf(Schema, SchemaProto);
	if (options && (Object.hasOwn(options, "name") || Object.hasOwn(options, "length") || Object.hasOwn(options, "__proto__"))) Object.defineProperties(self, Object.getOwnPropertyDescriptors({ ...options }));
	else Object.assign(self, options);
	self[RebuildOptions] = options;
	self.ast = ast;
	return self;
}
//#endregion
//#region node_modules/effect/dist/internal/schema/toCodec.js
function withoutConstructorDefault(context) {
	return context.constructorDefault === void 0 ? context : new Context(context.isOptional, context.isMutable, void 0, context.annotations);
}
function validateCanonicalObjectPropertyNames(ast) {
	if (ast.propertySignatures.some((ps) => typeof ps.name !== "string")) throw new globalThis.Error("Objects property names must be strings", { cause: ast });
}
function makeReorder(getPriority) {
	return (types) => {
		const sortedTypes = [...types].sort((a, b) => getPriority(toEncoded(a)) - getPriority(toEncoded(b)));
		if (!sortedTypes.some((ast, index) => ast !== types[index])) return types;
		return sortedTypes;
	};
}
/** @internal */
function toCodecStringTree$1(schema) {
	return make$14(toCodecStringTreeAST(schema.ast), { schema });
}
const toStringTreeReorder = /*#__PURE__*/ makeReorder((ast) => {
	switch (ast._tag) {
		case "Null":
		case "Boolean":
		case "Number":
		case "BigInt":
		case "Symbol":
		case "UniqueSymbol": return 0;
		default: return 1;
	}
});
function toCodecStringTreeASTStep(ast, recur, onMissingAnnotation) {
	switch (ast._tag) {
		case "Declaration": {
			const typeParameters = ast.typeParameters.map((tp) => make$14(recur(toEncoded(tp))));
			const getStringTreeLink = ast.annotations?.toCodecStringTree;
			if (isFunction(getStringTreeLink)) {
				const link = getStringTreeLink(typeParameters);
				if (link === void 0) return ast;
				return replaceEncoding(ast, [mapLink(link, recur)]);
			}
			const getJsonLink = ast.annotations?.toCodecJson;
			const jsonLink = isFunction(getJsonLink) ? getJsonLink(typeParameters) : void 0;
			const getLink = jsonLink === void 0 ? ast.annotations?.toCodec : void 0;
			const link = jsonLink ?? (isFunction(getLink) ? getLink(typeParameters) : void 0);
			return link === void 0 ? onMissingAnnotation(ast) : replaceEncoding(ast, [mapLink(link, recur)]);
		}
		case "Null": return replaceEncoding(ast, [nullToString]);
		case "Boolean": return replaceEncoding(ast, [booleanToString]);
		case "Unknown":
		case "ObjectKeyword": return replaceEncoding(ast, [unknownToStringTree]);
		case "Enum":
		case "Number":
		case "Literal":
		case "UniqueSymbol":
		case "Symbol":
		case "BigInt": return ast.toCodecStringTree();
		case "Objects":
			validateCanonicalObjectPropertyNames(ast);
			return ast.recur(recur, parameterFromString);
		case "Union": {
			const sortedTypes = toStringTreeReorder(ast.types);
			if (sortedTypes !== ast.types) return new Union$1(sortedTypes, ast.options, ast.annotations, ast.checks, ast.encoding, ast.context, ast.encodingChecks).recur(recur);
			return ast.recur(recur);
		}
		case "Arrays":
		case "Suspend": return ast.recur(recur);
	}
	return ast;
}
const nullToString = /*#__PURE__*/ new Link(/*#__PURE__*/ new Literal$1("null"), /*#__PURE__*/ new Transformation(/*#__PURE__*/ transform$1(() => null), /*#__PURE__*/ transform$1(() => "null")));
const booleanToString = /*#__PURE__*/ new Link(/*#__PURE__*/ new Union$1([/*#__PURE__*/ new Literal$1("true"), /*#__PURE__*/ new Literal$1("false")]), /*#__PURE__*/ new Transformation(/*#__PURE__*/ transform$1((s) => s === "true"), /*#__PURE__*/ String$4()));
const arrayFromSingleTransformation = /*#__PURE__*/ new Transformation(/*#__PURE__*/ transform$1((input) => typeof input === "string" ? [input] : input), /*#__PURE__*/ passthrough$1());
const isCodecArrayFromSingleLink = (link) => link.transformation === arrayFromSingleTransformation;
const toCodecStringTreeAST = /*#__PURE__*/ applyToSelfOrLastLinkEncodingIdempotent((ast) => {
	const out = toCodecStringTreeASTStep(ast, toCodecStringTreeAST, (ast) => {
		throw new globalThis.Error("Missing structural codec for StringTree", { cause: ast });
	});
	if (out !== ast && ast.context !== void 0) return replaceContextLastLink(out, withoutConstructorDefault(ast.context));
	return out;
}, { stopAt: isCodecArrayFromSingleLink });
//#endregion
//#region node_modules/effect/dist/Struct.js
/**
* Wraps a plain function as a {@link Lambda} value so it can be used with
* {@link map}, {@link mapPick}, and {@link mapOmit}.
*
* **When to use**
*
* Use to create a typed lambda for struct mapping APIs that need type-level
* input and output tracking.
*
* **Details**
*
* The type parameter `L` encodes both the input and output types at the type
* level, allowing the compiler to track how struct value types change. At
* runtime, the returned value is the same function; `lambda` only adjusts the
* type.
*
* **Example** (Wrapping values in arrays)
*
* ```ts import.meta.vitest
* import { pipe, Struct } from "effect"
*
* interface AsArray extends Struct.Lambda {
*   <A>(self: A): Array<A>
*   readonly "~lambda.out": Array<this["~lambda.in"]>
* }
*
* const asArray = Struct.lambda<AsArray>((a) => [a])
* const result = pipe({ x: 1, y: "hello" }, Struct.map(asArray))
* result // => { x: [1], y: ["hello"] }
* ```
*
* @see {@link Lambda} – the type-level interface
* @see {@link map} – apply a lambda to all struct values
* @category constructors
* @since 4.0.0
*/
const lambda = (f) => f;
//#endregion
//#region node_modules/effect/dist/internal/schemaError.js
const SchemaErrorTypeId = "~effect/Schema/SchemaError";
function isSchemaError$1(u) {
	return hasProperty(u, "~effect/Schema/SchemaError") && u["~effect/Schema/SchemaError"] === "~effect/Schema/SchemaError";
}
//#endregion
//#region node_modules/effect/dist/Schema.js
const TypeId$17 = TypeId$18;
/**
* Error thrown or returned when schema decoding or encoding fails.
*
* **Details**
*
* The `issue` field contains a structured {@link SchemaIssue.Issue} tree describing
* every validation failure, including the path to the problematic value and
* the expected type or constraint. The `message` field renders the issue tree
* with the default formatter.
*
* **Gotchas**
*
* Parsing with `reportInput: true` adds an enumerable `input` field to
* value-bearing issues. Built-in messages may include reported input, and
* custom annotations or messages are not sanitized.
*
* **Example** (Inspecting a SchemaError)
*
* ```ts import.meta.vitest
* import { Result, Schema } from "effect"
*
* const result = Schema.decodeUnknownResult(Schema.Number)("not a number")
* const message = Result.isFailure(result) ? result.failure.message : ""
* message // => "Expected number"
* ```
*
* @see {@link isSchemaError} for narrowing unknown values
* @category errors
* @since 4.0.0
*/
var SchemaError = class extends (/*#__PURE__*/ TaggedError$1("SchemaError")) {
	[SchemaErrorTypeId] = SchemaErrorTypeId;
	constructor(issue) {
		const stackTraceLimit = getStackTraceLimit();
		setStackTraceLimit(0);
		try {
			super({ issue });
		} finally {
			setStackTraceLimit(stackTraceLimit);
		}
	}
	get message() {
		return defaultFormatter(this.issue);
	}
	toString() {
		return `SchemaError(${this.message})`;
	}
};
/**
* Returns `true` if `u` is a {@link SchemaError}.
*
* **When to use**
*
* Use when you need to narrow an unknown value to `SchemaError`.
*
* **Example** (Narrowing Schema errors)
*
* ```ts import.meta.vitest
* import { Result, Schema } from "effect"
*
* const result = Result.try(() => Schema.decodeUnknownSync(Schema.Number)("oops"))
* const error: unknown = Result.isFailure(result) ? result.failure : undefined
* Schema.isSchemaError(error) // => true
* ```
*
* @category guards
* @since 4.0.0
*/
function isSchemaError(u) {
	return isSchemaError$1(u);
}
function fromIssueEffect(self) {
	if (effectIsExit(self)) return fromIssueExit(self);
	return catchCause$1(self, (cause) => failCauseSync(() => map$3(cause, (issue) => new SchemaError(issue))));
}
function fromIssueExit(exit) {
	return isSuccess(exit) ? exit : failCause$4(map$3(exit.cause, (issue) => new SchemaError(issue)));
}
function getSchemaErrorOrThrow(cause, message) {
	let schemaError;
	for (const reason of cause.reasons) {
		if (!isFailReason(reason) || !isSchemaError(reason.error)) throw new globalThis.Error(message, { cause });
		schemaError ??= reason.error;
	}
	if (schemaError === void 0) throw new globalThis.Error(message, { cause });
	return schemaError;
}
function runSchemaErrorSync(self) {
	const exit = runSyncExit(self);
	if (isSuccess(exit)) return exit.value;
	throw getSchemaErrorOrThrow(exit.cause, "Sync adapter can only throw schema errors");
}
/**
* Creates a type guard function that checks if a value conforms to a given
* schema.
*
* **Details**
*
* This function returns a predicate that performs a type-safe check, narrowing
* the type of the input value if the check passes. The predicate returns `false`
* for schema mismatches.
*
* **Gotchas**
*
* Only causes made entirely of schema issues are converted to `false`. Causes
* that contain defects, interruptions, or other non-schema reasons throw
* instead.
*
* **Example** (Defining a basic type guard)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const isString = Schema.is(Schema.String)
*
* isString("hello") // => true
* isString(42) // => false
*
* // Type narrowing in action
* const value: unknown = "hello"
* if (isString(value)) {
*   // value is now typed as string
*   value.toUpperCase() // => "HELLO"
* }
* ```
*
* @category guards
* @since 3.10.0
*/
const is = is$1;
/**
* Decodes an `unknown` input against a schema, returning an `Effect` that
* succeeds with the decoded value or fails with a {@link SchemaError}.
*
* **When to use**
*
* Use when you need to decode unknown input in an `Effect` whose failure
* channel is `SchemaError`.
*
* **Details**
*
* Prefer {@link decodeEffect} when the input is already typed as the schema's
* `Encoded` type.
* Options may be provided either when creating the decoder or when applying it;
* application options override creation options.
*
* @see {@link SchemaParser.decodeUnknownEffect} for the adapter that fails with `SchemaIssue.Issue` directly
*
* @category decoding
* @since 4.0.0
*/
function decodeUnknownEffect(schema, options) {
	const parser = decodeUnknownEffect$1(schema, options);
	return (input, options) => {
		return fromIssueEffect(parser(input, options));
	};
}
/**
* Decodes an `unknown` input against a schema, returning an `Option` that is
* `Some` with the decoded value on success or `None` for schema mismatches.
*
* **When to use**
*
* Use when you do not know the input type statically and only need to know
* whether decoding succeeded.
*
* **Details**
*
* Prefer this over {@link decodeUnknownExit} or {@link decodeUnknownEffect}
* when you don't need error details. For input already typed as the schema's
* `Encoded` type use {@link decodeOption}.
* Options may be provided either when creating the decoder or when applying it;
* application options override creation options.
*
* **Gotchas**
*
* Only causes made entirely of schema issues are converted to `None`. Causes
* that contain defects, interruptions, or other non-schema reasons throw
* instead.
*
* @category decoding
* @since 3.10.0
*/
const decodeUnknownOption = decodeUnknownOption$1;
/**
* Decodes an `unknown` input against a schema synchronously, returning the
* decoded value or throwing a {@link SchemaError} for schema mismatches.
*
* **When to use**
*
* Use when you need to validate unknown data at a synchronous boundary and want
* schema mismatches to throw `SchemaError`.
*
* **Details**
*
* For input already typed as the schema's `Encoded` type use `decodeSync`.
* Only service-free schemas can be decoded synchronously. For alternatives that
* do not throw on schema mismatches, see `decodeUnknownOption`,
* `decodeUnknownExit`, or `decodeUnknownEffect`. Options may be provided either
* when creating the decoder or when applying it; application options override
* creation options.
*
* **Gotchas**
*
* Non-schema failures may throw a runtime failure instead of `SchemaError`.
*
* **Example** (Decoding with a transformation schema)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const NumberFromString = Schema.NumberFromString
*
* Schema.decodeUnknownSync(NumberFromString)("42") // => 42
* ```
*
* @see {@link SchemaParser.decodeUnknownSync} for the adapter that throws an `Error` whose cause is `SchemaIssue.Issue`
*
* @category decoding
* @since 4.0.0
*/
function decodeUnknownSync(schema, options) {
	const parser = decodeUnknownEffect(schema, options);
	return (input, options) => {
		return runSchemaErrorSync(parser(input, options));
	};
}
/**
* Encodes an `unknown` input against a schema, returning an `Effect` that
* succeeds with the encoded value or fails with a {@link SchemaError}.
*
* **When to use**
*
* Use when you need to encode unknown input in an `Effect` whose failure
* channel is `SchemaError`.
*
* **Details**
*
* Prefer {@link encodeEffect} when the value is already typed as the schema's
* `Type`.
* Options may be provided either when creating the encoder or when applying it;
* application options override creation options.
*
* **Example** (Encoding a value to a string)
*
* ```ts import.meta.vitest
* import { Effect, Schema } from "effect"
*
* const NumberFromString = Schema.NumberFromString
*
* await Effect.runPromise(Schema.encodeUnknownEffect(NumberFromString)(42)) // => "42"
* ```
*
* @see {@link SchemaParser.encodeUnknownEffect} for the adapter that fails with `SchemaIssue.Issue` directly
*
* @category encoding
* @since 4.0.0
*/
function encodeUnknownEffect(schema, options) {
	const parser = encodeUnknownEffect$1(schema, options);
	return (input, options) => {
		return fromIssueEffect(parser(input, options));
	};
}
/**
* Encodes a typed input (the schema's `Type`) against a schema, returning an
* `Effect` that succeeds with the encoded value or fails with a
* {@link SchemaError}.
*
* **When to use**
*
* Use when you need to encode input already typed as the schema's `Type` in
* an `Effect` whose failure channel is `SchemaError`.
*
* **Details**
*
* For `unknown` input use {@link encodeUnknownEffect}.
* Options may be provided either when creating the encoder or when applying it;
* application options override creation options.
*
* @see {@link SchemaParser.encodeEffect} for the adapter that fails with `SchemaIssue.Issue` directly
*
* @category encoding
* @since 4.0.0
*/
const encodeEffect = encodeUnknownEffect;
/**
* Creates a schema from an AST (Abstract Syntax Tree) node.
*
* **Details**
*
* This is the fundamental constructor for all schemas in the Effect Schema
* library. It takes an AST node and wraps it in a fully-typed schema that
* preserves all type information and provides the complete schema API.
*
* The `make` function is used internally to create all primitive schemas like
* `String`, `Number`, `Boolean`, etc., as well as more complex schemas. It's
* the bridge between the untyped AST representation and the strongly-typed
* schema.
*
* @category constructors
* @since 3.10.0
*/
const make$13 = make$14;
/**
* Checks whether a value is a `Schema`.
*
* @category guards
* @since 3.10.0
*/
function isSchema(u) {
	return hasProperty(u, TypeId$17) && u[TypeId$17] === TypeId$17;
}
/**
* Creates an exact optional key schema for struct fields. Unlike `optional`,
* this creates exact optional properties (not `| undefined`) that can be
* completely omitted from the object.
*
* **Example** (Creating a struct with optional key)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Struct({
*   name: Schema.String,
*   age: Schema.optionalKey(Schema.Number)
* })
*
* // Type: { readonly name: string; readonly age?: number }
* type Person = typeof schema["Type"]
* ```
*
* @category combinators
* @since 4.0.0
*/
const optionalKey = /*#__PURE__*/ lambda((schema) => make$13(optionalKey$1(schema.ast), { schema }));
/**
* Marks a struct field as optional, allowing the key to be absent or
* `undefined`.
*
* **Details**
*
* The resulting property may be absent or explicitly set to `undefined`.
* Equivalent to `optionalKey(UndefinedOr(S))`.
*
* Use {@link optionalKey} instead if you want exact optional semantics (absent
* only, not `undefined`).
*
* **Example** (Defining an optional field accepting undefined)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Struct({
*   name: Schema.String,
*   age: Schema.optional(Schema.Number)
* })
*
* // { readonly name: string; readonly age?: number | undefined }
* type Person = typeof schema.Type
* ```
*
* @category combinators
* @since 3.10.0
*/
const optional = /*#__PURE__*/ lambda((self) => {
	const schema = UndefinedOr(self);
	return make$13(optional$1(self.ast), { schema });
});
/**
* Creates a schema for a single literal value (string, number, bigint, boolean, or null).
*
* **Example** (Defining a string literal)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Literal("hello")
* // Type: Schema.Literal<"hello">
* Schema.decodeSync(schema)("hello") // => "hello"
* ```
*
* @see {@link Literals} for a schema that represents a union of literals.
* @see {@link tag} for a schema that represents a literal value that can be
* used as a discriminator field in tagged unions and has a constructor default.
* @category constructors
* @since 3.10.0
*/
function Literal(literal) {
	const out = make$13(new Literal$1(literal), {
		literal,
		transform(to) {
			return out.pipe(decodeTo(Literal(to), {
				decode: transform$1(() => to),
				encode: transform$1(() => literal)
			}));
		}
	});
	return out;
}
/**
* Schema for the `unknown` type. Accepts any value without validation.
*
* **When to use**
*
* Use as a top schema when you need to accept any input while preserving
* TypeScript's `unknown` safety at use sites.
*
* @see {@link Any} for the `any` variant.
* @category schemas
* @since 3.10.0
*/
const Unknown = /*#__PURE__*/ make$13(unknown);
/**
* Schema for the `null` literal. Validates that the input is strictly `null`.
*
* @see {@link NullOr} for a union with another schema.
* @category schemas
* @since 3.10.0
*/
const Null = /*#__PURE__*/ make$13(null_);
/**
* Schema for the `undefined` literal. Validates that the input is strictly `undefined`.
*
* @see {@link UndefinedOr} for a union with another schema.
* @category schemas
* @since 3.10.0
*/
const Undefined = /*#__PURE__*/ make$13(undefined_);
/**
* Schema for `string` values. Validates that the input is `typeof` `"string"`.
*
* @category schemas
* @since 4.0.0
*/
const String$2 = /*#__PURE__*/ make$13(string);
/**
* Schema for `number` values, including `NaN`, `Infinity`, and `-Infinity`.
*
* **Details**
*
* Default JSON serializer:
*
* - Finite numbers are serialized as numbers.
* - Non-finite values are serialized as strings (`"NaN"`, `"Infinity"`, `"-Infinity"`).
*
* @see {@link Finite} for a schema that excludes non-finite values.
* @category schemas
* @since 4.0.0
*/
const Number$1 = /*#__PURE__*/ make$13(number);
/**
* Schema for `boolean` values. Validates that the input is `typeof` `"boolean"`.
*
* **When to use**
*
* Use to validate values that are already JavaScript booleans.
*
* @see {@link BooleanFromBit} for a schema that decodes bit literals `0` or `1` into a boolean
*
* @category schemas
* @since 4.0.0
*/
const Boolean$1 = /*#__PURE__*/ make$13(boolean);
function makeStruct(ast, fields) {
	return make$13(ast, {
		fields,
		mapFields(f, options) {
			const fields = f(this.fields);
			return makeStruct(struct(fields, options?.unsafePreserveChecks ? this.ast.checks : void 0), fields);
		}
	});
}
/**
* Defines a struct schema from a map of field schemas.
*
* **Details**
*
* Each field value is a schema. Use {@link optionalKey} or {@link optional} to
* mark fields as optional, and {@link mutableKey} to mark them as mutable.
*
* The resulting schema's `Type` is a readonly object type with the fields'
* decoded types. The `Encoded` form mirrors the field schemas' encoded types.
* Declared fields may be inherited and are copied to own properties in the
* output. The `__proto__` field is accepted only when it is an own property.
* Parsing does not guarantee that output keys retain their input order.
*
* **Example** (Defining a basic struct)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const Person = Schema.Struct({
*   name: Schema.String,
*   age: Schema.Number,
*   email: Schema.optionalKey(Schema.String)
* })
*
* // { readonly name: string; readonly age: number; readonly email?: string }
* type Person = typeof Person.Type
*
* Schema.decodeUnknownSync(Person)({ name: "Alice", age: 30 }) // => { name: "Alice", age: 30 }
* ```
*
* @category constructors
* @since 3.10.0
*/
function Struct(fields) {
	return makeStruct(struct(fields, void 0), fields);
}
/**
* Defines a record schema whose dynamic properties are selected by a key schema
* and decoded with a value schema.
*
* **Details**
*
* For dynamic keys, the key schema selects matching own properties and the
* value schema decodes or encodes only those selected properties. Checks on
* string, number, symbol, and template literal key schemas narrow which
* properties are selected.
*
* For transformed key schemas, property selection is based on encoded property
* names before the selected key is decoded.
*
* **Gotchas**
*
* When decoded or encoded key transformations produce the same property key,
* sequential parsing applies selected own properties in selection order, so
* the later selected property overwrites the earlier value. Dynamic key
* selection always examines own properties. Finite literal keys are declared
* fields and may therefore be inherited. Output key order is not guaranteed.
*
* **Example** (Defining a string-keyed record of numbers)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Record(Schema.String, Schema.Number)
*
* // { readonly [x: string]: number }
* type R = typeof schema.Type
*
* Schema.decodeUnknownSync(schema)({ a: 1, b: 2 }) // => { a: 1, b: 2 }
* ```
*
* @category constructors
* @since 3.10.0
*/
function Record(key, value) {
	return make$13(record(key.ast, value.ast), {
		key,
		value
	});
}
/**
* @category constructors
* @since 4.0.0
*/
const ArraySchema = /*#__PURE__*/ lambda((schema) => make$13(new Arrays(false, [], [schema.ast]), { value: schema }));
function makeUnion(ast, members) {
	return make$13(ast, {
		members,
		mapMembers(f, options) {
			const members = f(this.members);
			return makeUnion(union(members, this.ast.options, options?.unsafePreserveChecks ? this.ast.checks : void 0), members);
		}
	});
}
/**
* Creates a union schema from an array of member schemas. Members are tested in
* order; the first match is returned.
*
* **Details**
*
* Optionally, specify `mode`:
* - `"anyOf"` (default) — matches if any member matches.
* - `"oneOf"` — matches if exactly one member matches.
*
* **Example** (Defining a string or number union)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Union([Schema.String, Schema.Number])
*
* Schema.decodeUnknownSync(schema)("hello") // => "hello"
* Schema.decodeUnknownSync(schema)(42) // => 42
* ```
*
* @category constructors
* @since 3.10.0
*/
function Union(members, options) {
	return makeUnion(union(members, options, void 0), members);
}
/**
* Creates a union schema from an array of literal values.
*
* **Example** (Defining status codes)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Literals(["active", "inactive", "pending"])
* Schema.decodeSync(schema)("active") // => "active"
* ```
*
* @see {@link Literal} for a schema that represents a single literal.
* @category constructors
* @since 4.0.0
*/
function Literals(literals) {
	const members = literals.map(Literal);
	return make$13(union(members, void 0, void 0), {
		literals,
		members,
		mapMembers(f) {
			return Union(f(this.members));
		},
		pick(literals) {
			return Literals(literals);
		},
		transform(to) {
			return Union(members.map((member, index) => member.transform(to[index])));
		}
	});
}
/**
* Creates a union schema of `S | null`.
*
* @category constructors
* @since 3.10.0
*/
const NullOr = /*#__PURE__*/ lambda((self) => Union([self, Null]));
/**
* Creates a union schema of `S | undefined`.
*
* @category constructors
* @since 3.10.0
*/
const UndefinedOr = /*#__PURE__*/ lambda((self) => Union([self, Undefined]));
function decodeTo(to, transformation) {
	return (from) => {
		return make$13(decodeTo$1(from.ast, to.ast, transformation ? makeTransformation(transformation) : passthrough()), {
			from,
			to
		});
	};
}
/**
* Attaches a constructor default value to a schema field.
*
* **Details**
*
* Constructor defaults are applied only during `make*`, not during decoding or
* encoding. Failures are represented directly as `SchemaIssue.Issue` values.
*
* **Example** (Defining an optional field with a static default)
*
* ```ts import.meta.vitest
* import { Effect, Schema } from "effect"
*
* const MySchema = Schema.Struct({
*   name: Schema.String.pipe(
*     Schema.optionalKey,
*     Schema.withConstructorDefault(Effect.succeed("anonymous"))
*   )
* })
*
* MySchema.make({}).name // => "anonymous"
* ```
*
* @category constructors
* @since 3.10.0
*/
function withConstructorDefault(defaultValue) {
	return (schema) => make$13(withConstructorDefault$1(schema.ast, defaultValue), { schema });
}
/**
* Combines a {@link Literal} schema with {@link withConstructorDefault}, making it ideal
* for discriminator fields in tagged unions. When constructing via `make`, the
* `_tag` field can be omitted and will be filled automatically.
*
* **Example** (Defining a discriminated union tag)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const A = Schema.Struct({ _tag: Schema.tag("A"), value: Schema.Number })
*
* // _tag is optional in make, auto-filled to "A"
* const a = A.make({ value: 42 })
* a // => { _tag: "A", value: 42 }
* ```
*
* @see {@link tagDefaultOmit} to also omit the tag during encoding
* @see {@link TaggedStruct} for a shorthand that adds `_tag` automatically
* @category constructors
* @since 3.10.0
*/
function tag(literal) {
	return Literal(literal).pipe(withConstructorDefault(succeed$3(literal)));
}
/**
* Creates a struct schema with an automatically populated `_tag` field.
*
* **When to use**
*
* Use to define a tagged union case from a literal tag and a set of fields.
*
* **Details**
*
* When using the `make` method, the `_tag` field is optional and will be
* added automatically. However, when decoding or encoding, the `_tag` field
* must be present in the input.
*
* **Example** (Defining a tagged struct shorthand)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* // Defines a struct with a fixed `_tag` field
* const tagged = Schema.TaggedStruct("A", {
*   a: Schema.String
* })
*
* // This is the same as writing:
* const equivalent = Schema.Struct({
*   _tag: Schema.tag("A"),
*   a: Schema.String
* })
* void tagged
* void equivalent
* ```
*
* **Example** (Accessing the literal value of the tag)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const tagged = Schema.TaggedStruct("A", {
*   a: Schema.String
* })
*
* tagged.fields._tag.schema.literal // => "A"
* ```
*
* @category constructors
* @since 3.10.0
*/
function TaggedStruct(value, fields) {
	return Struct({
		_tag: tag(value),
		...fields
	});
}
/**
* Creates a custom validation filter from a predicate function.
*
* **Details**
*
* The predicate receives the decoded input value, the schema AST, and parse
* options, and returns a `FilterOutput`. Non-success outputs are normalized into
* schema issues. The `annotations` parameter annotates the filter itself; with
* the default formatter, failures use `message` first, `expected` second, and
* `<filter>` when neither is provided.
*
* When `abort` is `true`, parsing stops after this filter fails instead of
* collecting later check failures.
*
* **Example** (Reporting failure at a nested path)
*
* ```ts import.meta.vitest
* import { Result, Schema } from "effect"
*
* const schema = Schema.Struct({ password: Schema.String, confirmPassword: Schema.String }).check(
*   Schema.makeFilter((o) =>
*     o.password === o.confirmPassword
*       ? undefined
*       : { path: ["password"], issue: "password and confirmPassword must match" }
*   )
* )
*
* const result = Schema.decodeUnknownResult(schema)({ password: "123456", confirmPassword: "1234567" })
* if (Result.isFailure(result) && result.failure.issue._tag === "Filter" && result.failure.issue.issue._tag === "Pointer") {
*   result.failure.issue.issue.path // => ["password"]
* }
* ```
*
* **Example** (Reporting multiple failures at once)
*
* ```ts import.meta.vitest
* import { Result, Schema } from "effect"
*
* const schema = Schema.Struct({ a: Schema.Finite, b: Schema.Finite, c: Schema.Finite }).check(
*   Schema.makeFilter((o) => {
*     const issues: Array<Schema.FilterIssue> = []
*     if (o.a > 0) {
*       if (o.b <= 0) issues.push({ path: ["b"], issue: "b must be greater than 0" })
*       if (o.c <= 0) issues.push({ path: ["c"], issue: "c must be greater than 0" })
*     }
*     return issues
*   })
* )
*
* const result = Schema.decodeUnknownResult(schema)({ a: 1, b: 0, c: 0 })
* if (Result.isFailure(result) && result.failure.issue._tag === "Filter" && result.failure.issue.issue._tag === "Composite") {
*   result.failure.issue.issue.issues.map((issue) => issue._tag === "Pointer" ? issue.path : []) // => [["b"], ["c"]]
* }
* ```
*
* @category constructors
* @since 4.0.0
*/
const makeFilter = makeFilter$1;
/**
* Validates that a string matches the specified regular expression pattern.
*
* **Details**
*
* JSON Schema:
*
* Unless annotations override `toJsonSchema`, JSON Schema receives a `pattern`
* only when the JavaScript RegExp uses the Unicode flag and its other flags are
* `d`, `g`, or `y`. Sticky patterns are anchored at the start of the string.
*
* Arbitrary:
*
* During arbitrary generation, this applies a `patterns`
* constraint to ensure generated strings match the specified RegExp pattern.
*
* @category validation
* @since 4.0.0
*/
function isPattern(regExp, annotations) {
	const source = regExp.source;
	const flags = regExp.flags;
	const canExport = /^[dg]*uy?$/.test(flags);
	const runtimeRegExp = flags === "" ? `new RegExp(${format$2(source)})` : `new RegExp(${format$2(source)}, ${format$2(flags)})`;
	return isPattern$1(regExp, {
		toJsonSchema: () => canExport ? { pattern: flags.endsWith("y") ? `^(?:${source})` : source } : [{}, true],
		toCode: () => ({ runtime: `Schema.isPattern(${runtimeRegExp})` }),
		...annotations
	});
}
/**
* Creates an inclusive or exclusive range check for any ordered type from an
* `Order.Order` instance.
*
* @category validation
* @since 4.0.0
*/
function makeIsBetween(deriveOptions) {
	const greaterThanOrEqualTo = isGreaterThanOrEqualTo$1(deriveOptions.order);
	const greaterThan = isGreaterThan$1(deriveOptions.order);
	const lessThanOrEqualTo = isLessThanOrEqualTo$1(deriveOptions.order);
	const lessThan = isLessThan$1(deriveOptions.order);
	const formatter = deriveOptions.formatter ?? format$2;
	return (options, annotations) => {
		const gte = options.exclusiveMinimum ? greaterThan : greaterThanOrEqualTo;
		const lte = options.exclusiveMaximum ? lessThan : lessThanOrEqualTo;
		return makeFilter((input) => gte(input, options.minimum) && lte(input, options.maximum), {
			expected: `a value between ${formatter(options.minimum)}${options.exclusiveMinimum ? " (excluded)" : ""} and ${formatter(options.maximum)}${options.exclusiveMaximum ? " (excluded)" : ""}`,
			arbitraryConstraint: {
				order: deriveOptions.order,
				minimum: options.minimum,
				maximum: options.maximum,
				...options.exclusiveMinimum && { exclusiveMinimum: true },
				...options.exclusiveMaximum && { exclusiveMaximum: true }
			},
			...deriveOptions.annotate?.(options),
			...annotations
		});
	};
}
function encodeNumberPayload(number) {
	if (!globalThis.Number.isFinite(number)) throw new globalThis.RangeError(`Expected a finite number, got ${format$2(number)}`);
	return number;
}
/**
* Validates that a number is within a specified range. The range boundaries can
* be inclusive or exclusive based on the provided options.
*
* **Details**
*
* JSON Schema:
*
* This check corresponds to `minimum`/`maximum` or `exclusiveMinimum`/`exclusiveMaximum`
* constraints in JSON Schema, depending on the options provided.
*
* Arbitrary:
*
* During arbitrary generation, this applies `minimum` and
* `maximum` constraints with optional `exclusiveMinimum` and
* `exclusiveMaximum` flags to ensure generated numbers fall within the
* specified range.
*
* @category validation
* @since 4.0.0
*/
const isBetween = /*#__PURE__*/ makeIsBetween({
	order: Number$4,
	annotate: (options) => {
		const exclusiveMinimum = options.exclusiveMinimum ? true : void 0;
		const exclusiveMaximum = options.exclusiveMaximum ? true : void 0;
		return {
			representation: {
				id: "effect/schema/isBetween",
				payload: {
					minimum: encodeNumberPayload(options.minimum),
					maximum: encodeNumberPayload(options.maximum),
					...exclusiveMinimum && { exclusiveMinimum },
					...exclusiveMaximum && { exclusiveMaximum }
				}
			},
			toJsonSchema: () => ({
				[exclusiveMinimum ? "exclusiveMinimum" : "minimum"]: options.minimum,
				[exclusiveMaximum ? "exclusiveMaximum" : "maximum"]: options.maximum
			}),
			toCode: () => ({ runtime: `Schema.isBetween({ minimum: ${format$2(options.minimum)}, maximum: ${format$2(options.maximum)}, exclusiveMinimum: ${format$2(exclusiveMinimum)}, exclusiveMaximum: ${format$2(exclusiveMaximum)} })` })
		};
	}
});
/**
* Validates that a number is a safe integer (within the safe integer range
* that can be exactly represented in JavaScript).
*
* **Details**
*
* JSON Schema:
*
* This check corresponds to the `type: "integer"` constraint in JSON Schema.
*
* Arbitrary:
*
* During arbitrary generation, this applies an integer constraint.
*
* @category validation
* @since 4.0.0
*/
function isInt(annotations) {
	return makeFilter((n) => globalThis.Number.isSafeInteger(n), {
		expected: "an integer",
		representation: {
			id: "effect/schema/isInt",
			payload: null
		},
		toJsonSchema: () => [{ type: "integer" }, true],
		toCode: () => ({ runtime: "Schema.isInt()" }),
		arbitraryConstraint: { number: "integer" },
		...annotations
	});
}
/**
* Schema for integers, rejecting `NaN`, `Infinity`, and `-Infinity`.
*
* @category schemas
* @since 3.10.0
*/
const Int = /*#__PURE__*/ Number$1.check(/*#__PURE__*/ isInt());
function makeIsMinLength(minLength, minCodePoints, annotations) {
	return makeFilter((input) => input.length >= minLength, {
		expected: `a value with a length of at least ${minLength}`,
		representation: {
			id: "effect/schema/isMinLength",
			payload: { minLength }
		},
		toJsonSchema: ({ type }) => type === "string" ? minLength <= 1 ? { minLength: minCodePoints } : [{ minLength: minCodePoints }, true] : type === "array" ? { minItems: minLength } : type === void 0 ? [{
			minLength: minCodePoints,
			minItems: minLength
		}, true] : [{}, true],
		toCode: () => ({ runtime: `Schema.isMinLength(${minLength})` }),
		[STRUCTURAL_ANNOTATION_KEY]: true,
		arbitraryConstraint: { minLength },
		...annotations
	});
}
/**
* Validates that a value has at least one element. Works with strings and arrays.
* This is equivalent to `isMinLength(1)`.
*
* **Details**
*
* JSON Schema:
*
* This check corresponds to the `minLength: 1` constraint for strings or the
* `minItems: 1` constraint for arrays in JSON Schema.
*
* Arbitrary:
*
* During arbitrary generation, this applies a `minLength: 1`
* constraint to ensure generated strings or arrays are non-empty.
*
* @category validation
* @since 4.0.0
*/
function isNonEmpty(annotations) {
	return makeIsMinLength(1, 1, annotations);
}
/**
* Validates that a value has at most the specified length. Works with strings
* and arrays.
*
* **Details**
*
* JSON Schema:
*
* The bound must be finite; it is rounded down and clamped to zero. This check
* corresponds to `maxItems` for arrays. Strings use the same bound for
* `maxLength`, which cannot reject a string accepted by this check because a
* string has no more code points than UTF-16 code units.
*
* Arbitrary:
*
* During arbitrary generation, this applies a `maxLength`
* constraint to ensure generated strings or arrays have at most the required
* length.
*
* @category validation
* @since 4.0.0
*/
function isMaxLength(maxLength, annotations) {
	maxLength = normalizeCardinality(maxLength);
	return makeFilter((input) => input.length <= maxLength, {
		expected: `a value with a length of at most ${maxLength}`,
		representation: {
			id: "effect/schema/isMaxLength",
			payload: { maxLength }
		},
		toJsonSchema: ({ type }) => type === "string" ? maxLength === 0 ? { maxLength } : [{ maxLength }, true] : type === "array" ? { maxItems: maxLength } : type === void 0 ? [{
			maxLength,
			maxItems: maxLength
		}, true] : [{}, true],
		toCode: () => ({ runtime: `Schema.isMaxLength(${maxLength})` }),
		[STRUCTURAL_ANNOTATION_KEY]: true,
		arbitraryConstraint: { maxLength },
		...annotations
	});
}
function normalizeCardinality(value) {
	if (!globalThis.Number.isFinite(value)) throw new globalThis.RangeError(`Expected a finite number, got ${value}`);
	return Math.max(0, Math.floor(value));
}
/**
* Schema for non-empty strings. Validates that a string has at least one
* character.
*
* @category schemas
* @since 3.10.0
*/
const NonEmptyString = /*#__PURE__*/ String$2.check(/*#__PURE__*/ isNonEmpty());
const getErrorOptionsKey = (options) => (options?.includeStack === true ? 1 : 0) | (options?.excludeCause === true ? 2 : 0);
const getErrorOptions = (key) => {
	switch (key) {
		case 0: return;
		case 1: return { includeStack: true };
		case 2: return { excludeCause: true };
		case 3: return {
			includeStack: true,
			excludeCause: true
		};
	}
};
const defectSchemaCache = [];
/**
* Schema for unexpected defect values represented as `unknown` with a JSON
* encoded form.
*
* **When to use**
*
* Use when you need a schema for `Cause` defects or other unexpected failures
* whose runtime value may be any value.
*
* **Details**
*
* The encoded side is {@link Json}. During decoding, JSON objects with a string
* `message` property are decoded into JavaScript `Error` values, preserving a
* non-default `name` and any string `stack`. Other JSON values decode
* unchanged.
*
* During encoding, JavaScript `Error` values encode to JSON objects with
* `name`, `message`, and optional `cause` properties. Pass
* `{ includeStack: true }` to include string stack traces in encoded `Error`
* defects, or `{ excludeCause: true }` to omit causes. Other values are
* serialized through Effect's JSON formatter and then parsed back into JSON
* when possible.
*
* **Gotchas**
*
* This schema is for carrying defects across JSON boundaries, not for
* preserving every JavaScript value exactly. Some values cannot round-trip
* unchanged:
*
* - A non-`Error` object such as `{ message: "boom" }` encodes as an
*   error-shaped JSON object and decodes back as an `Error`.
* - JSON serialization normalizes unsupported values. For example,
*   `undefined` array elements encode as `null`, unsupported object properties
*   are omitted, and circular references are dropped.
* - Values that cannot be represented as JSON fall back to Effect's formatted
*   string representation.
*
* @see {@link ErrorInstance} for a schema that only accepts JavaScript `Error` values.
* @category schemas
* @since 4.0.0
*/
function Defect(options) {
	const key = getErrorOptionsKey(options);
	const cached = defectSchemaCache[key];
	if (cached !== void 0) return cached;
	const schema = Json$1.pipe(decodeTo(Unknown, defectFromJson(getErrorOptions(key))));
	defectSchemaCache[key] = schema;
	return schema;
}
globalThis.RegExp;
globalThis.URL;
const JsonString = /*#__PURE__*/ String$2.annotate({
	expected: "a string that will be decoded as JSON",
	contentMediaType: "application/json"
});
/**
* Returns a schema that decodes a JSON string and then decodes the parsed value
* using the given schema.
*
* **Details**
*
* This is useful when working with JSON-encoded strings where the actual
* structure of the value is known and described by an existing schema.
*
* During decoding, the resulting schema first parses the input string as JSON,
* using `reviver` when provided, and then runs the provided schema on the
* parsed result. During encoding, it first encodes with the provided schema and
* then passes the result to `JSON.stringify` with the optional `replacer` and
* `space`.
*
* **Example** (Formatting encoded JSON)
*
* ```ts import.meta.vitest
* import { Schema } from "effect"
*
* const schema = Schema.Struct({ a: Schema.Number })
* const schemaFromJsonString = Schema.fromJsonString(schema, { space: 2 })
*
* Schema.encodeSync(schemaFromJsonString)({ a: 1 }) // => "{\n  \"a\": 1\n}"
* ```
*
* @category schemas
* @since 4.0.0
*/
function fromJsonString(schema, options) {
	return JsonString.pipe(decodeTo(schema, fromJsonString$1(options)));
}
globalThis.File;
globalThis.FormData;
globalThis.URLSearchParams;
globalThis.Uint8Array;
const immerable = /*#__PURE__*/ globalThis.Symbol.for("immer-draftable");
const payloadToken = {};
function makeClass(Inherited, identifier, struct$1, annotations, proto) {
	const getClassSchema = getClassSchemaFactory(struct$1, identifier, annotations);
	const ClassTypeId = getClassTypeId(identifier);
	const out = class extends Inherited {
		constructor(...[input, options]) {
			const payload = options?.["~payload"];
			const value = payload?.token === payloadToken ? payload.value : struct$1.make(input ?? {}, options);
			super(value, {
				...options,
				disableChecks: true,
				"~payload": {
					token: payloadToken,
					value
				}
			});
		}
		static [TypeId$17] = TypeId$17;
		get [ClassTypeId]() {
			return ClassTypeId;
		}
		static [immerable] = true;
		static identifier = identifier;
		static fields = struct$1.fields;
		static get ast() {
			return getClassSchema(this).ast;
		}
		static pipe() {
			return pipeArguments(this, arguments);
		}
		static rebuild(ast) {
			return getClassSchema(this).rebuild(ast);
		}
		static make(input, options) {
			return make$15(getClassSchema(this))(input ?? {}, options);
		}
		static makeOption(input, options) {
			return makeOption(getClassSchema(this))(input ?? {}, options);
		}
		static makeEffect(input, options) {
			return getClassSchema(this).makeEffect(input ?? {}, options);
		}
		static annotate(annotations) {
			return this.rebuild(annotate(this.ast, annotations));
		}
		static annotateKey(annotations) {
			return this.rebuild(annotateKey(this.ast, annotations));
		}
		static check(...checks) {
			return this.rebuild(appendChecks(this.ast, checks));
		}
		static extend(identifier) {
			return (schema, annotations) => {
				const extension = isStruct(schema) ? schema : Struct(schema);
				const fields = {
					...struct$1.fields,
					...extension.fields
				};
				const ast = struct(fields, struct$1.ast.checks, { identifier });
				return makeClass(this, identifier, makeStruct(appendChecks(ast, extension.ast.checks), fields), annotations, proto);
			};
		}
		static mapFields(f, options) {
			return struct$1.mapFields(f, options);
		}
	};
	if (proto !== void 0) Object.assign(out.prototype, proto(identifier));
	return out;
}
function getClassTransformation(self) {
	return new Transformation(transform$1((input) => new self(input, { "~payload": {
		token: payloadToken,
		value: input
	} })), passthrough$1());
}
function getClassTypeId(identifier) {
	return `~effect/Schema/Class/${identifier}`;
}
function getClassSchemaFactory(from, identifier, annotations) {
	let memo;
	return (self) => {
		if (memo !== void 0) return memo;
		const ClassTypeId = getClassTypeId(identifier);
		const isClassValue = (input) => input instanceof self || hasProperty(input, ClassTypeId);
		const transformation = getClassTransformation(self);
		return memo = decodeTo(make$13(new Declaration([from.ast], () => (input, ast, options) => {
			return isClassValue(input) ? succeed$3(input) : fail$3(new InvalidType(ast, input, options));
		}, {
			identifier,
			[CONSTRUCTOR_ANNOTATION_KEY]: ([from]) => ({
				isConstructed: isClassValue,
				link: new Link(from, transformation)
			}),
			toCodec: ([from]) => new Link(from.ast, transformation),
			toEquivalence: ([from]) => from,
			toFormatter: ([from]) => (t) => `${self.identifier}(${from(t)})`,
			[SENTINELS_ANNOTATION_KEY]: collectSentinels(from.ast),
			...annotations
		})), transformation)(from);
	};
}
function isStruct(schema) {
	return isSchema(schema);
}
/**
* Creates a schema-backed error class that can be used as a typed,
* yieldable error in Effect programs. Combines {@link Class} validation with
* the `YieldableError` interface so instances can be yielded directly inside
* `Effect.gen`.
*
* **Example** (Schema-backed error)
*
* ```ts import.meta.vitest
* import { Effect, Schema } from "effect"
*
* class NotFound extends Schema.Error<NotFound>("NotFound")({
*   id: Schema.Number
* }) {}
*
* const program = Effect.gen(function*() {
*   yield* new NotFound({ id: 1 })
* })
* const error = await Effect.runPromise(Effect.flip(program))
* error.id // => 1
* ```
*
* @category constructors
* @since 4.0.0
*/
const Error$1 = (identifier) => (schema, annotations) => {
	const struct = isStruct(schema) ? schema : Struct(schema);
	return makeClass(Error$3, identifier, struct, annotations, (identifier) => ({ name: identifier }));
};
/**
* Defines a schema-backed yieldable error class with an automatically populated
* `_tag` field.
*
* **When to use**
*
* Use to define typed errors that are schema validated, yielded in `Effect.gen`,
* and matched as tagged union members.
*
* **Example** (Defining a tagged error class)
*
* ```ts import.meta.vitest
* import { Effect, Schema } from "effect"
*
* class NotFound extends Schema.TaggedError<NotFound>()("NotFound", {
*   id: Schema.Number
* }) {}
*
* const program = Effect.gen(function*() {
*   yield* new NotFound({ id: 42 })
* })
* const error = await Effect.runPromise(Effect.flip(program))
* error._tag // => "NotFound"
* error.id // => 42
* ```
*
* @category constructors
* @since 3.10.0
*/
const TaggedError = (identifier) => {
	return (tagValue, schema, annotations) => {
		const struct = isStruct(schema) ? schema.mapFields((fields) => ({
			_tag: tag(tagValue),
			...fields
		}), { unsafePreserveChecks: true }) : TaggedStruct(tagValue, schema);
		return Error$1(identifier ?? tagValue)(struct, annotations);
	};
};
/**
* Converts a schema to the StringTree canonical codec, where every leaf value
* becomes a string while preserving the original structure.
*
* **Details**
*
* Derivation does not run transformations. Annotation links may be asynchronous,
* may fail, and may use optional services; the consuming parser chooses the
* execution and failure handling. Links cannot require services not declared by
* the input schema because hooks do not widen the returned service types.
*
* **Gotchas**
*
* Declarations must provide a structural `toCodecStringTree`, `toCodecJson`, or
* `toCodec` encoding. A callback can return `undefined` when the declaration is
* already in canonical StringTree form.
*
* @category converting
* @since 4.0.0
*/
const toCodecStringTree = toCodecStringTree$1;
/**
* Schema that accepts and validates any immutable JSON-compatible value.
*
* **Example** (Validating a JSON value)
*
* ```ts import.meta.vitest
* import { Option, Schema } from "effect"
*
* Schema.decodeUnknownOption(Schema.Json)({ key: [1, true, null] }) // => Option.some({ key: [1, true, null] })
* ```
*
* @category schemas
* @since 4.0.0
*/
const Json$1 = /*#__PURE__*/ make$13(/*#__PURE__*/ annotate(Json$2, { toCode: () => ({
	runtime: "Schema.Json",
	Type: "Schema.Json"
}) }));
const PluginId = String$2.check(isPattern(/^[a-z][a-z0-9-]{0,63}$/));
const PluginLocalId = String$2.check(isPattern(/^[a-z][a-z0-9-]{0,63}$/));
const Label = String$2.check(isMaxLength(200));
const Text = String$2.check(isMaxLength(16384));
const PluginInput = Record(String$2, Json$1);
const PluginPermission = Literals([
	"orchestration:read",
	"orchestration:operate",
	"settings:write",
	"providers:manage",
	"environment:maintain",
	"diagnostics:read",
	"filesystem:read",
	"filesystem:write",
	"terminal:read",
	"terminal:operate",
	"source-control:write",
	"review:write",
	"access:read",
	"access:write",
	"relay:read",
	"relay:write",
	"preview:operate"
]);
Struct({
	apiVersion: Literal(1),
	id: PluginId,
	name: Label,
	version: Label,
	description: optionalKey(Text)
});
const PluginAction = Struct({
	id: PluginLocalId,
	label: Label,
	command: PluginLocalId,
	input: PluginInput
});
const PluginField = Struct({
	name: PluginLocalId,
	label: Label,
	kind: Literals([
		"text",
		"password",
		"number",
		"boolean",
		"select"
	]),
	value: optionalKey(Union([
		String$2,
		Number$1,
		Boolean$1
	])),
	options: optionalKey(ArraySchema(Struct({
		label: Label,
		value: Label
	})).check(isMaxLength(100))),
	required: optionalKey(Boolean$1)
});
const PluginBlock = Union([
	Struct({
		id: PluginLocalId,
		kind: Literal("text"),
		text: Text
	}),
	Struct({
		id: PluginLocalId,
		kind: Literal("link"),
		label: Label,
		url: Text
	}),
	Struct({
		id: PluginLocalId,
		kind: Literal("actions"),
		actions: ArraySchema(PluginAction).check(isMaxLength(20))
	}),
	Struct({
		id: PluginLocalId,
		kind: Literal("form"),
		label: Label,
		command: PluginLocalId,
		fields: ArraySchema(PluginField).check(isMaxLength(40)),
		input: PluginInput
	}),
	Struct({
		id: PluginLocalId,
		kind: Literal("table"),
		columns: ArraySchema(Label).check(isMaxLength(20)),
		rows: ArraySchema(Struct({
			id: Label,
			cells: ArraySchema(Text).check(isMaxLength(20)),
			actions: ArraySchema(PluginAction).check(isMaxLength(20))
		})).check(isMaxLength(500))
	})
]);
const unique = (values) => new Set(values).size === values.length;
Struct({
	title: Label,
	blocks: ArraySchema(PluginBlock).check(isMaxLength(100))
}).check(makeFilter((view) => unique(view.blocks.map((block) => block.id)) && view.blocks.every((block) => {
	if (block.kind === "form") return unique(block.fields.map((field) => field.name)) && block.fields.every((field) => unique(field.options?.map((option) => option.value) ?? []));
	if (block.kind === "actions") return unique(block.actions.map((action) => action.id));
	if (block.kind === "table") return unique(block.columns) && unique(block.rows.map((row) => row.id)) && block.rows.every((row) => row.cells.length === block.columns.length && unique(row.actions.map((action) => action.id)));
	return true;
})));
Struct({
	id: PluginLocalId,
	title: Label,
	location: Literals(["settings", "usage"]),
	permission: PluginPermission
});
Struct({
	id: PluginLocalId,
	title: Label,
	description: Text,
	permission: PluginPermission,
	/** Agent access is opt-in; secret-bearing commands should leave this false. */
	agent: Boolean$1
});
Struct({
	$t3: Literal("secret"),
	label: Label,
	value: Text
});
var PluginError = class extends TaggedError()("PluginError", {
	operation: String$2,
	cause: Defect()
}) {
	get message() {
		return `Plugin operation failed (${this.operation}).`;
	}
};
//#endregion
//#region node_modules/effect/dist/internal/ulid.js
const maxTimestamp = 2 ** 48 - 1;
const base32Chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
/** @internal */
const ulidString = (timestampMillis, bytes) => {
	if (bytes.length !== 10) throw new Error(`ULID randomness must be exactly 10 bytes, received ${bytes.length}`);
	const timestamp = Math.min(Math.max(0, Math.trunc(timestampMillis)), maxTimestamp);
	let out = "";
	for (let shift = 45; shift >= 0; shift -= 5) out += base32Chars[Math.floor(timestamp / 2 ** shift) & 31];
	let accumulator = 0;
	let bits = 0;
	for (const byte of bytes) {
		accumulator = accumulator << 8 | byte;
		bits += 8;
		while (bits >= 5) {
			bits -= 5;
			out += base32Chars[accumulator >>> bits & 31];
		}
		accumulator &= (1 << bits) - 1;
	}
	return out;
};
//#endregion
//#region node_modules/effect/dist/internal/uuid.js
const hex = (byte) => byte.toString(16).padStart(2, "0");
/** @internal */
const stringify = (bytes) => {
	return [
		bytes.subarray(0, 4),
		bytes.subarray(4, 6),
		bytes.subarray(6, 8),
		bytes.subarray(8, 10),
		bytes.subarray(10, 16)
	].map((segment) => Array.from(segment, hex).join("")).join("-");
};
const randomBytes = () => globalThis.crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16));
/** @internal */
function v4Bytes(bytes = randomBytes()) {
	bytes[6] = bytes[6] & 15 | 64;
	bytes[8] = bytes[8] & 63 | 128;
	return bytes;
}
/** @internal */
const v4String = (bytes) => stringify(bytes === void 0 ? v4Bytes() : v4Bytes(bytes));
const maxV7Timestamp = 2 ** 48 - 1;
/** @internal */
function v7Bytes(timestampMillis, bytes = randomBytes()) {
	const timestamp = Math.min(Math.max(0, Math.trunc(timestampMillis)), maxV7Timestamp);
	bytes[0] = Math.floor(timestamp / 2 ** 40);
	bytes[1] = Math.floor(timestamp / 2 ** 32) & 255;
	bytes[2] = Math.floor(timestamp / 2 ** 24) & 255;
	bytes[3] = Math.floor(timestamp / 2 ** 16) & 255;
	bytes[4] = Math.floor(timestamp / 256) & 255;
	bytes[5] = timestamp & 255;
	bytes[6] = bytes[6] & 15 | 112;
	bytes[8] = bytes[8] & 63 | 128;
	return bytes;
}
/** @internal */
const v7String = (timestampMillis, bytes) => stringify(bytes === void 0 ? v7Bytes(timestampMillis) : v7Bytes(timestampMillis, bytes));
//#endregion
//#region node_modules/effect/dist/PlatformError.js
/**
* Normalized errors for platform APIs.
*
* Platform services such as file systems, terminals, and sockets use
* `PlatformError` to report host-level failures in a consistent shape. The
* wrapper records whether the problem came from an invalid argument or from the
* operating system, while preserving useful details such as the module, method,
* path, descriptor, description, and original cause when available.
*
* @since 4.0.0
*/
const TypeId$16 = "~effect/PlatformError";
/**
* Error data for an invalid argument passed to a platform API.
*
* **When to use**
*
* Use when you need to model caller input rejected before a platform operation
* runs, including invalid-argument reason data.
*
* **Details**
*
* The error records the module and method that rejected the argument, with an
* optional description and cause. It is usually wrapped in `PlatformError`.
*
* @see {@link badArgument} for creating a wrapped `PlatformError` whose reason is `BadArgument`
* @see {@link SystemError} for failures reported by the host platform or operating system
* @see {@link PlatformError} for the wrapper used by most platform APIs
*
* @category errors
* @since 4.0.0
*/
var BadArgument = class extends (/*#__PURE__*/ TaggedError$1("BadArgument")) {
	/**
	* Formats the module, method, and optional description that rejected the argument.
	*
	* **When to use**
	*
	* Use to read the formatted error message for a rejected platform argument.
	*
	* @since 4.0.0
	*/
	get message() {
		return `${this.module}.${this.method}${this.description ? `: ${this.description}` : ""}`;
	}
};
/**
* Error data for a platform or system operation failure.
*
* **When to use**
*
* Use when you need normalized reason data for a platform or system operation
* failure, including the operation details.
*
* **Details**
*
* The error records a normalized `_tag`, the module and method that failed,
* and optional details such as the syscall, path or descriptor, description,
* and original cause. It is usually wrapped in `PlatformError`.
*
* @see {@link systemError} for creating the usual `PlatformError` wrapper from this reason data
* @see {@link BadArgument} for platform API failures caused by rejected caller input before an operation runs
* @see {@link SystemErrorTag} for the normalized tag values stored in `_tag`
*
* @category errors
* @since 4.0.0
*/
var SystemError = class extends Error$2 {
	/**
	* Formats the normalized system error tag with operation and path details.
	*
	* **When to use**
	*
	* Use to read the formatted error message for a normalized system failure.
	*
	* @since 4.0.0
	*/
	get message() {
		return `${this._tag}: ${this.module}.${this.method}${this.pathOrDescriptor !== void 0 ? ` (${this.pathOrDescriptor})` : ""}${this.description ? `: ${this.description}` : ""}`;
	}
};
/**
* Tagged error used by platform APIs to report either invalid arguments or
* system-level failures.
*
* **When to use**
*
* Use as the shared error type for platform APIs that expose invalid arguments
* and host or operating-system failures through a single `Effect` error
* channel.
*
* **Details**
*
* The `reason` field contains the underlying `BadArgument` or `SystemError`.
* When that reason has a cause, the cause is preserved on the wrapper.
*
* @see {@link BadArgument} for invalid inputs rejected before an operation runs
* @see {@link SystemError} for failures reported by the host platform or operating system
* @see {@link badArgument} for creating this wrapper from rejected caller input
* @see {@link systemError} for creating this wrapper from a host or operating-system failure
*
* @category errors
* @since 4.0.0
*/
var PlatformError = class extends (/*#__PURE__*/ TaggedError$1("PlatformError")) {
	constructor(reason) {
		if ("cause" in reason) super({
			reason,
			cause: reason.cause
		});
		else super({ reason });
	}
	/**
	* Marks this value as a platform error wrapper for runtime guards.
	*
	* **When to use**
	*
	* Use to identify `PlatformError` values through their runtime type marker.
	*
	* @since 4.0.0
	*/
	[TypeId$16] = TypeId$16;
	get message() {
		return this.reason.message;
	}
};
/**
* Creates a `PlatformError` whose reason is a `SystemError`.
*
* **When to use**
*
* Use to adapt an operating-system or platform failure into the normalized
* platform error model.
*
* @category constructors
* @since 4.0.0
*/
const systemError = (options) => new PlatformError(new SystemError(options));
/**
* Creates a `PlatformError` whose reason is a `BadArgument`.
*
* **When to use**
*
* Use to report a platform API rejecting caller input before performing the
* underlying operation.
*
* @category constructors
* @since 4.0.0
*/
const badArgument = (options) => new PlatformError(new BadArgument(options));
//#endregion
//#region node_modules/effect/dist/Crypto.js
/**
* Defines a platform-independent service for cryptographic operations.
*
* Runtime packages provide concrete implementations backed by the host
* platform's cryptography APIs. This module defines the service interface and a
* constructor from random-byte and digest primitives. The service provides
* secure random bytes and numbers, UUIDv4 and UUIDv7 generation, shuffling, and
* SHA message digests.
*
* @since 4.0.0
*/
const TypeId$15 = "~effect/Crypto";
/**
* Service tag for platform cryptography.
*
* **When to use**
*
* Use when you need to provide or retrieve the full platform cryptography
* service from an effect's context.
*
* **Details**
*
* Providing this service supplies platform-agnostic cryptographic operations
* such as hashing, UUID generation, and secure random values.
*
* @see {@link make} for constructing a Crypto service from primitive operations
*
* @category services
* @since 4.0.0
*/
const Crypto = /*#__PURE__*/ Service("effect/Crypto");
/**
* Creates a `Crypto` service from the primitive implementation, deriving the
* random generator helpers and UUID generation from those primitives.
*
* **When to use**
*
* Use to build a Crypto service for a platform integration, test layer, or
* custom runtime from primitive random-byte and digest operations.
*
* **Details**
*
* The constructor derives random numbers, booleans, integer ranges, shuffling,
* and UUID generation from `impl.randomBytes`. Digest operations delegate to
* `impl.digest`.
*
* **Gotchas**
*
* `impl.randomBytes` must return cryptographically secure bytes of the
* requested length. UUID formatting mutates the byte array returned for UUID
* generation, so the implementation should return a fresh array for each call.
*
* **Example** (Creating a Crypto service)
*
* ```ts import.meta.vitest
* import { Crypto, Effect } from "effect"
*
* const testCrypto = Crypto.make({
*   randomBytes: (size) => new Uint8Array(size),
*   digest: (_algorithm, data) => Effect.succeed(data)
* })
*
* await Effect.runPromise(testCrypto.randomBytes(4)) // => new Uint8Array([0, 0, 0, 0])
* ```
*
* @category constructors
* @since 4.0.0
*/
const make$12 = (impl) => {
	const randomBytesUnsafe = impl.randomBytes;
	const randomBytes = (size) => map$2(validateSize("randomBytes", size), randomBytesUnsafe);
	const readUint53 = (bytes) => (bytes[0] & 31) * 2 ** 48 + bytes[1] * 2 ** 40 + bytes[2] * 2 ** 32 + bytes[3] * 2 ** 24 + bytes[4] * 2 ** 16 + bytes[5] * 256 + bytes[6];
	const nextDoubleUnsafe = () => readUint53(randomBytesUnsafe(7)) / 2 ** 53;
	const nextIntUnsafe = () => {
		while (true) {
			const bytes = randomBytesUnsafe(7);
			const value = readUint53(bytes);
			if ((bytes[0] & 32) === 0) return value + Number.MIN_SAFE_INTEGER;
			if (value < Number.MAX_SAFE_INTEGER) return value + 1;
		}
	};
	return Crypto.of({
		[TypeId$15]: TypeId$15,
		randomBytes,
		nextDoubleUnsafe,
		nextIntUnsafe,
		digest: impl.digest,
		random: sync(() => nextDoubleUnsafe()),
		randomBoolean: sync(() => nextDoubleUnsafe() > .5),
		randomInt: sync(() => nextIntUnsafe()),
		randomBetween: (min, max) => sync(() => nextBetween(min, max, nextDoubleUnsafe())),
		randomIntBetween(min, max, options) {
			const extra = options?.halfOpen === true ? 0 : 1;
			return sync(() => {
				const minInt = Math.ceil(min);
				const maxInt = Math.floor(max);
				return Math.floor(nextDoubleUnsafe() * (maxInt - minInt + extra)) + minInt;
			});
		},
		randomShuffle: (elements) => sync(() => {
			const buffer = Array.from(elements);
			for (let i = buffer.length - 1; i >= 1; i = i - 1) {
				const index = Math.min(i, Math.floor(nextDoubleUnsafe() * (i + 1)));
				const value = buffer[i];
				buffer[i] = buffer[index];
				buffer[index] = value;
			}
			return buffer;
		}),
		randomUUIDv4: sync(() => v4String(randomBytesUnsafe(16))),
		randomUUIDv7: clockWith((clock) => succeed$3(v7String(clock.currentTimeMillisUnsafe(), randomBytesUnsafe(16)))),
		randomULID: clockWith((clock) => succeed$3(ulidString(clock.currentTimeMillisUnsafe(), randomBytesUnsafe(10))))
	});
};
const validateSize = (method, size) => Number.isSafeInteger(size) && size >= 0 ? succeed$3(size) : fail$3(badArgument({
	module: "Crypto",
	method,
	description: "size must be a non-negative safe integer"
}));
//#endregion
//#region node_modules/@effect/platform-node-shared/dist/NodeCrypto.js
/**
* Node-compatible implementation of Effect's `Crypto` service.
*
* This module builds the service from `node:crypto`, using `randomBytes` for
* random data and `createHash` for supported digest algorithms. It exports
* `make` as the concrete service value and `layer` for providing it through
* Effect context.
*
* @since 1.0.0
*/
const toHashAlgorithm = (algorithm) => {
	switch (algorithm) {
		case "SHA-1": return "sha1";
		case "SHA-256": return "sha256";
		case "SHA-384": return "sha384";
		case "SHA-512": return "sha512";
	}
};
const digest = (algorithm, data) => try_({
	try: () => Uint8Array.from(NodeCrypto.createHash(toHashAlgorithm(algorithm)).update(data).digest()),
	catch: (cause) => systemError({
		module: "Crypto",
		method: "digest",
		_tag: "Unknown",
		description: "Could not compute digest",
		cause
	})
});
//#endregion
//#region node_modules/@effect/platform-node/dist/NodeCrypto.js
/**
* The `NodeCrypto` module provides the Node.js `Crypto` service layer for
* Effect programs. Provide {@link layer} at the edge of a Node application,
* CLI, script, or test to satisfy `effect/Crypto` with Node's `node:crypto`
* implementation for secure random bytes, UUID generation, random values, and
* SHA digest operations.
*
* This module is the public Node adapter around the shared Node-compatible
* implementation. Digest failures are reported as platform errors, and SHA-1
* remains available only for interoperability with existing protocols.
*
* @since 1.0.0
*/
/**
* Layer that provides the Node.js Crypto service implementation.
*
* @category layers
* @since 1.0.0
*/
const layer$3 = /* @__PURE__ */ succeed$4(Crypto, /* @__PURE__ */ make$12({
	randomBytes: NodeCrypto.randomBytes,
	digest
}));
//#endregion
//#region node_modules/effect/dist/Fiber.js
/**
* Joins a fiber, blocking until it completes. If the fiber succeeds,
* returns its value. If it fails, the error is propagated.
*
* **When to use**
*
* Use when you need a forked fiber's failure to fail the current Effect because
* that fiber is part of the current workflow.
*
* **Gotchas**
*
* Joining a failed fiber propagates the fiber's Cause. Use {@link await_ await} when
* you need to inspect the `Exit` instead of failing.
*
* **Example** (Joining a fiber)
*
* ```ts import.meta.vitest
* import { Effect, Fiber } from "effect"
*
* const program = Effect.gen(function*() {
*   const fiber = yield* Effect.forkChild(Effect.succeed(42))
*   return yield* Fiber.join(fiber)
* })
*
* const actual = await Effect.runPromise(program)
* actual // => 42
* ```
*
* @see {@link await_ await} for inspecting the fiber outcome as an Exit
*
* @category combinators
* @since 2.0.0
*/
const join = fiberJoin;
/**
* Interrupts a fiber, causing it to stop executing and clean up any
* acquired resources.
*
* **When to use**
*
* Use when you need to cancel a forked fiber and wait for its cleanup to
* complete.
*
* **Details**
*
* The returned Effect completes only after the interrupted fiber has completed.
*
* **Gotchas**
*
* Interruption is cooperative. A fiber can continue running while it is inside
* uninterruptible work or finalizers.
*
* **Example** (Interrupting a fiber)
*
* ```ts import.meta.vitest
* import { Effect, Fiber } from "effect"
*
* const program = Effect.gen(function*() {
*   const fiber = yield* Effect.forkChild(
*     Effect.delay("1 second")(Effect.succeed(42))
*   )
*   yield* Fiber.interrupt(fiber)
* })
*
* await Effect.runPromise(program)
* ```
*
* @see {@link interruptAs} for specifying the interrupting fiber ID
* @see {@link await_ await} for observing the interrupted fiber's Exit
*
* @category interruption
* @since 2.0.0
*/
const interrupt = fiberInterrupt;
/**
* Adds a fiber to a `Scope` and returns the same fiber.
*
* **When to use**
*
* Use when a manually managed fiber should be interrupted when a Scope closes.
*
* **Details**
*
* When the scope is closed, the fiber is interrupted. If the scope is already
* closed, the fiber is interrupted immediately.
*
* **Gotchas**
*
* This does not wait for the fiber to complete. It only registers the
* interruption finalizer and returns the same fiber.
*
* @see {@link interrupt} for interrupting and waiting for completion
*
* @category resource management
* @since 4.0.0
*/
const runIn = fiberRunIn;
//#endregion
//#region node_modules/effect/dist/Latch.js
/**
* Creates a `Latch` synchronously, outside of `Effect`.
*
* **When to use**
*
* Use when you need to allocate a `Latch` synchronously outside an Effect
* workflow.
*
* **Details**
*
* The latch starts closed by default; pass `true` to create it open.
*
* **Example** (Creating a latch unsafely)
*
* ```ts import.meta.vitest
* import { Effect, Fiber, Latch } from "effect"
*
* const latch = Latch.makeUnsafe(false)
* const waiter = latch.await.pipe(Effect.as("opened"))
*
* const program = Effect.gen(function*() {
*   const fiber = yield* Effect.forkChild(waiter)
*   yield* latch.open
*   return yield* Fiber.join(fiber)
* })
*
* await Effect.runPromise(program) // => "opened"
* ```
*
* @see {@link make} for creating a latch inside Effect code
*
* @category constructors
* @since 4.0.0
*/
const makeUnsafe$1 = makeLatchUnsafe;
//#endregion
//#region node_modules/effect/dist/MutableRef.js
const TypeId$14 = "~effect/MutableRef";
const MutableRefProto = {
	[TypeId$14]: TypeId$14,
	...PipeInspectableProto,
	toJSON() {
		return {
			_id: "MutableRef",
			current: toJson(this.current)
		};
	}
};
/**
* Creates a new MutableRef with the specified initial value.
*
* **When to use**
*
* Use to create a synchronous `MutableRef` initialized with a value.
*
* **Example** (Creating mutable refs)
*
* ```ts import.meta.vitest
* import { MutableRef } from "effect"
*
* // Create a counter reference
* const counter = MutableRef.make(0)
*
* MutableRef.get(counter) // => 0
*
* // Create a configuration reference
* const config = MutableRef.make({ debug: false, timeout: 5000 })
*
* MutableRef.get(config) // => { debug: false, timeout: 5000 }
*
* // Create a string reference
* const status = MutableRef.make("idle")
* MutableRef.set(status, "running")
*
* MutableRef.get(status) // => "running"
* ```
*
* @category constructors
* @since 2.0.0
*/
const make$10 = (value) => {
	const ref = Object.create(MutableRefProto);
	ref.current = value;
	return ref;
};
/**
* Sets the MutableRef to a new value and returns the reference.
*
* **When to use**
*
* Use when you need an in-place `MutableRef` replacement that returns the same
* `MutableRef`.
*
* **Example** (Setting values)
*
* ```ts import.meta.vitest
* import { MutableRef } from "effect"
*
* const ref = MutableRef.make("initial")
*
* // Set a new value
* MutableRef.set(ref, "updated")
*
* MutableRef.get(ref) // => "updated"
*
* // Chain set operations (since it returns the ref)
* const result = MutableRef.set(ref, "final")
*
* result === ref // => true
* MutableRef.get(ref) // => "final"
*
* // Set complex objects
* const config = MutableRef.make({ debug: false, verbose: false })
* MutableRef.set(config, { debug: true, verbose: true })
*
* MutableRef.get(config) // => { debug: true, verbose: true }
*
* // Pipe-able version
* const setValue = MutableRef.set("new value")
* setValue(ref)
*
* MutableRef.get(ref) // => "new value"
*
* // Useful for state management
* const state = MutableRef.make<"idle" | "loading" | "success" | "error">("idle")
* MutableRef.set(state, "loading")
* // ... perform async operation
* MutableRef.set(state, "success")
*
* MutableRef.get(state) // => "success"
* ```
*
* @category mutations
* @since 2.0.0
*/
const set = /*#__PURE__*/ dual(2, (self, value) => {
	self.current = value;
	return self;
});
//#endregion
//#region node_modules/effect/dist/MutableList.js
/**
* Defines the unique symbol used to represent an empty result when taking elements from a MutableList.
* This symbol is returned by `take` when the list is empty, allowing for safe type checking.
*
* **When to use**
*
* Use to detect that `take` returned no element before handling the result as a
* list item.
*
* **Example** (Checking for empty results)
*
* ```ts import.meta.vitest
* import { MutableList } from "effect"
*
* const list = MutableList.make<string>()
*
* MutableList.take(list) === MutableList.Empty // => true
* ```
*
* @category symbols
* @since 4.0.0
*/
const Empty$1 = /*#__PURE__*/ Symbol.for("effect/MutableList/Empty");
/**
* Creates an empty MutableList.
*
* **Example** (Creating an empty mutable list)
*
* ```ts import.meta.vitest
* import { MutableList } from "effect"
*
* const list = MutableList.make<string>()
*
* list.length // => 0
* MutableList.append(list, "first")
* MutableList.take(list) // => "first"
* list.length // => 0
* ```
*
* @category constructors
* @since 2.0.0
*/
const make$9 = () => ({
	head: void 0,
	tail: void 0,
	length: 0
});
const compactHead = (self) => {
	const head = self.head;
	if (head.offset >= 1024 && head === self.tail && head.mutable && (head.array.length - head.offset) * 8 <= head.offset) self.head = self.tail = {
		array: head.array.slice(head.offset),
		mutable: true,
		offset: 0,
		next: void 0
	};
};
const emptyBucket = () => ({
	array: [],
	mutable: true,
	offset: 0,
	next: void 0
});
/**
* Appends an element to the end of the MutableList.
* This operation is optimized for high-frequency usage.
*
* **Example** (Appending elements)
*
* ```ts import.meta.vitest
* import { MutableList } from "effect"
*
* const list = MutableList.make<number>()
* MutableList.append(list, 1)
* MutableList.append(list, 2)
* MutableList.append(list, 3)
*
* MutableList.toArray(list) // => [1, 2, 3]
* list.length // => 3
* ```
*
* @category mutations
* @since 2.0.0
*/
const append = (self, message) => {
	if (!self.tail) self.head = self.tail = emptyBucket();
	else if (!self.tail.mutable) {
		self.tail.next = emptyBucket();
		self.tail = self.tail.next;
	}
	self.tail.array.push(message);
	self.length++;
};
/**
* Prepends an element to the beginning of the MutableList.
* This operation is optimized for high-frequency usage.
*
* **Example** (Prepending elements)
*
* ```ts import.meta.vitest
* import { MutableList } from "effect"
*
* const list = MutableList.make<string>()
* MutableList.append(list, "last")
* MutableList.prepend(list, "third")
* MutableList.prepend(list, "second")
* MutableList.prepend(list, "first")
*
* MutableList.toArray(list) // => ["first", "second", "third", "last"]
* ```
*
* @category mutations
* @since 2.0.0
*/
const prepend = (self, message) => {
	self.head = {
		array: [message],
		mutable: true,
		offset: 0,
		next: self.head
	};
	if (!self.tail) self.tail = self.head;
	self.length++;
};
/**
* Removes all elements from the MutableList, resetting it to an empty state.
* This operation is highly optimized and releases all internal memory.
*
* **Example** (Clearing a mutable list)
*
* ```ts import.meta.vitest
* import { MutableList } from "effect"
*
* const list = MutableList.make<number>()
* MutableList.appendAll(list, [1, 2, 3, 4, 5])
*
* MutableList.clear(list)
*
* MutableList.toArray(list) // => []
* list.length // => 0
* MutableList.take(list) === MutableList.Empty // => true
* ```
*
* @category mutations
* @since 4.0.0
*/
const clear = (self) => {
	self.head = self.tail = void 0;
	self.length = 0;
};
/**
* Takes up to N elements from the beginning of the MutableList and returns them as an array.
* The taken elements are removed from the list. This operation is optimized for performance
* and includes zero-copy optimizations when possible.
*
* **Details**
*
* Finite fractional values of `n` are rounded down. `NaN` and non-positive
* values leave the list unchanged and return an empty array.
*
* **Example** (Taking batches)
*
* ```ts import.meta.vitest
* import { MutableList } from "effect"
*
* const list = MutableList.make<number>()
* MutableList.appendAll(list, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
*
* MutableList.takeN(list, 3) // => [1, 2, 3]
* MutableList.toArray(list) // => [4, 5, 6, 7, 8, 9, 10]
* list.length // => 7
* ```
*
* @category mutations
* @since 4.0.0
*/
const takeN = (self, n) => {
	n = normalize$1(n);
	if (n <= 0 || !self.head) return [];
	n = Math.min(n, self.length);
	if (n === self.length && self.head?.offset === 0 && !self.head.next) {
		const array = self.head.array;
		clear(self);
		return array;
	}
	const array = new Array(n);
	let index = 0;
	let chunk = self.head;
	while (chunk) {
		while (chunk.offset < chunk.array.length) {
			array[index++] = chunk.array[chunk.offset];
			if (chunk.mutable) chunk.array[chunk.offset] = void 0;
			chunk.offset++;
			if (index === n) {
				self.head = chunk.offset === chunk.array.length && chunk.next ? chunk.next : chunk;
				self.length -= n;
				if (self.length === 0) clear(self);
				else compactHead(self);
				return array;
			}
		}
		chunk = chunk.next;
	}
	clear(self);
	return array;
};
/**
* Takes all elements from the MutableList and returns them as an array.
* The list becomes empty after this operation. This is equivalent to takeN(list, list.length).
*
* **Example** (Draining all elements)
*
* ```ts import.meta.vitest
* import { MutableList } from "effect"
*
* const list = MutableList.make<string>()
* MutableList.appendAll(list, ["apple", "banana", "cherry"])
*
* MutableList.takeAll(list) // => ["apple", "banana", "cherry"]
* list.length // => 0
* ```
*
* @category mutations
* @since 4.0.0
*/
const takeAll$2 = (self) => takeN(self, self.length);
/**
* Takes a single element from the beginning of the MutableList.
* Returns the element if available, or the Empty symbol if the list is empty.
* The taken element is removed from the list.
*
* **Example** (Taking one element)
*
* ```ts import.meta.vitest
* import { MutableList } from "effect"
*
* const list = MutableList.make<string>()
* MutableList.appendAll(list, ["first", "second", "third"])
*
* MutableList.take(list) // => "first"
* MutableList.toArray(list) // => ["second", "third"]
* list.length // => 2
* ```
*
* @category mutations
* @since 4.0.0
*/
const take$1 = (self) => {
	if (!self.head) return Empty$1;
	const message = self.head.array[self.head.offset];
	if (self.head.mutable) self.head.array[self.head.offset] = void 0;
	self.head.offset++;
	self.length--;
	if (self.head.offset === self.head.array.length) {
		if (self.head.next) self.head = self.head.next;
		else clear(self);
	} else compactHead(self);
	return message;
};
/**
* Filters the MutableList in place, keeping only elements that satisfy the predicate.
* This operation modifies the list and rebuilds its internal structure for efficiency.
* The predicate receives each element's current index.
*
* **Example** (Filtering in place)
*
* ```ts import.meta.vitest
* import { MutableList } from "effect"
*
* const list = MutableList.make<number>()
* MutableList.appendAll(list, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
*
* MutableList.filter(list, (n) => n % 2 === 0)
*
* MutableList.toArray(list) // => [2, 4, 6, 8, 10]
* ```
*
* @category mutations
* @since 4.0.0
*/
const filter$1 = (self, f) => {
	const array = [];
	let chunk = self.head;
	let index = 0;
	while (chunk) {
		for (let i = chunk.offset; i < chunk.array.length; i++) if (f(chunk.array[i], index++)) array.push(chunk.array[i]);
		chunk = chunk.next;
	}
	if (array.length === 0) {
		clear(self);
		return;
	}
	self.head = self.tail = {
		array,
		mutable: true,
		offset: 0,
		next: void 0
	};
	self.length = array.length;
};
/**
* Removes all occurrences of a value from the `MutableList` using JavaScript
* strict equality semantics.
*
* **When to use**
*
* Use when in-place removal should use JavaScript identity/strict equality
* rather than Effect structural equality.
*
* **Details**
*
* The list is modified in place.
*
* **Gotchas**
*
* Values are compared with `!==`, so this does not use Effect structural
* equality.
*
* **Example** (Removing matching values)
*
* ```ts import.meta.vitest
* import { MutableList } from "effect"
*
* const list = MutableList.make<string>()
* MutableList.appendAll(list, ["apple", "banana", "apple", "cherry", "apple"])
*
* MutableList.remove(list, "apple")
*
* MutableList.toArray(list) // => ["banana", "cherry"]
* ```
*
* @category mutations
* @since 4.0.0
*/
const remove = (self, value) => filter$1(self, (v) => v !== value);
//#endregion
//#region node_modules/effect/dist/PubSub.js
/**
* Broadcasts values from publishers to many subscribers.
*
* Publishers add messages with `publish` or `publishAll`, and each active
* `Subscription` receives its own copy of every accepted message. Unlike a
* queue, subscribers do not compete for messages. This module includes bounded,
* dropping, sliding, and unbounded hubs, optional replay buffers for late
* subscribers, message-taking helpers, capacity and shutdown operations, a
* type guard, and low-level types for custom hub strategies.
*
* @since 2.0.0
*/
const TypeId$13 = "~effect/PubSub";
const SubscriptionTypeId = "~effect/PubSub/Subscription";
/**
* Creates a PubSub with a custom atomic implementation and strategy.
*
* **Example** (Creating a PubSub with a custom strategy)
*
* ```ts import.meta.vitest
* import { Effect, PubSub } from "effect"
*
* const program = Effect.gen(function*() {
*   // Create custom PubSub with specific atomic implementation and strategy
*   const pubsub = yield* PubSub.make<string>({
*     atomicPubSub: () => PubSub.makeAtomicBounded(100),
*     strategy: () => new PubSub.BackPressureStrategy()
*   })
*
*   // Use the created PubSub
*   const published = yield* PubSub.publish(pubsub, "Hello")
*   yield* PubSub.shutdown(pubsub)
*   return published
* })
*
* const actual = await Effect.runPromise(program)
* actual // => true
* ```
*
* @category constructors
* @since 4.0.0
*/
const make$8 = (options) => sync(() => makePubSubUnsafe(options.atomicPubSub(), /* @__PURE__ */ new Map(), makeUnsafe$4(), makeUnsafe$1(false), make$10(false), options.strategy(), make$10(none())));
/**
* Creates an unbounded `PubSub`.
*
* **Example** (Creating an unbounded PubSub)
*
* ```ts import.meta.vitest
* import { Effect, PubSub } from "effect"
*
* const program = Effect.scoped(Effect.gen(function*() {
*   // Create unbounded PubSub
*   const pubsub = yield* PubSub.unbounded<string>()
*
*   const subscription = yield* PubSub.subscribe(pubsub)
*
*   // Can publish unlimited messages
*   for (let i = 0; i < 3; i++) {
*     yield* PubSub.publish(pubsub, `message-${i}`)
*   }
*
*   return yield* PubSub.takeAll(subscription)
* }))
*
* const actual = await Effect.runPromise(program)
* actual // => ["message-0", "message-1", "message-2"]
* ```
*
* @category constructors
* @since 2.0.0
*/
const unbounded$1 = (options) => make$8({
	atomicPubSub: () => makeAtomicUnbounded(options),
	strategy: () => new DroppingStrategy()
});
/**
* Creates an unbounded atomic PubSub implementation with optional replay buffer.
*
* **When to use**
*
* Use to create the low-level storage layer for a custom `PubSub` whose active
* subscribers may retain an unbounded number of pending messages.
*
* **Gotchas**
*
* Messages published while subscribers are active can be retained without a
* capacity limit until those subscribers take them or unsubscribe.
*
* @see {@link makeAtomicBounded} for a bounded atomic implementation that enforces capacity
* @see {@link make} for wrapping an atomic implementation with a delivery strategy
* @see {@link unbounded} for the high-level effectful constructor for unbounded `PubSub` values
*
* @category constructors
* @since 4.0.0
*/
const makeAtomicUnbounded = (options) => {
	const replay = options?.replay;
	return new UnboundedPubSub(replay && replay > 0 ? new ReplayBuffer(Math.ceil(replay)) : void 0);
};
/**
* Attempts to publish a message synchronously without applying the PubSub
* strategy's effectful surplus handling.
*
* **When to use**
*
* Use when you need a non-blocking synchronous publish attempt where `false`
* is an acceptable result when the message cannot be accepted immediately.
*
* **Details**
*
* Returns `false` if the `PubSub` is shut down or the message cannot be
* accepted immediately, for example when a bounded PubSub is full. Prefer
* `publish` when backpressure or sliding behavior should be honored.
*
* **Example** (Publishing without suspending)
*
* ```ts import.meta.vitest
* import { Effect, PubSub } from "effect"
*
* const program = Effect.gen(function*() {
*   const pubsub = yield* PubSub.bounded<string>(2)
*   return PubSub.publishUnsafe(pubsub, "Hello")
* })
*
* const actual = await Effect.runPromise(program)
* actual // => true
* ```
*
* @see {@link publish} for effectful publishing that honors the configured surplus strategy
*
* @category publishing
* @since 4.0.0
*/
const publishUnsafe = /*#__PURE__*/ dual(2, (self, value) => {
	if (self.shutdownFlag.current || isSome(self.ended.current)) return false;
	if (self.pubsub.publish(value)) {
		self.strategy.completeSubscribersUnsafe(self.pubsub, self.subscribers);
		return true;
	}
	return false;
});
/**
* Subscribes to receive messages from the `PubSub`. The resulting subscription can
* be evaluated multiple times within the scope to take a message from the `PubSub`
* each time.
*
* **Example** (Subscribing to messages)
*
* ```ts import.meta.vitest
* import { Effect, PubSub } from "effect"
*
* const program = Effect.gen(function*() {
*   const pubsub = yield* PubSub.bounded<string>(10)
*
*   // Subscribe within a scope for automatic cleanup
*   const first = yield* Effect.scoped(Effect.gen(function*() {
*     const subscription = yield* PubSub.subscribe(pubsub)
*
*     // Publish some messages
*     yield* PubSub.publish(pubsub, "Hello")
*     yield* PubSub.publish(pubsub, "World")
*
*     // Take messages one by one
*     const msg1 = yield* PubSub.take(subscription)
*     const msg2 = yield* PubSub.take(subscription)
*
*     // Subscription is automatically cleaned up when scope exits
*     return [msg1, msg2]
*   }))
*
*   const second = yield* Effect.scoped(Effect.gen(function*() {
*     const sub1 = yield* PubSub.subscribe(pubsub)
*     const sub2 = yield* PubSub.subscribe(pubsub)
*
*     // Multiple subscribers can receive the same messages
*     yield* PubSub.publish(pubsub, "Broadcast")
*
*     return yield* Effect.all([
*       PubSub.take(sub1),
*       PubSub.take(sub2)
*     ])
*   }))
*   return [first, second]
* })
*
* const actual = await Effect.runPromise(program)
* actual // => [["Hello", "World"], ["Broadcast", "Broadcast"]]
* ```
*
* @category subscriptions
* @since 2.0.0
*/
const subscribe = (self) => uninterruptible(contextWith((services) => {
	const localScope = get(services, Scope);
	const scope = forkUnsafe(self.scope);
	const subscription = makeSubscriptionUnsafe(self.pubsub, self.subscribers, self.strategy, self.ended);
	return addFinalizer(scope, unsubscribe(subscription)).pipe(andThen(addFinalizerExit(localScope, (exit) => close(scope, exit))), as(subscription));
}));
const unsubscribe = (self) => uninterruptible(withFiber((state) => {
	set(self.shutdownFlag, true);
	return forEach(takeAll$2(self.pollers), (d) => interruptWith(d, state.id), {
		discard: true,
		concurrency: "unbounded"
	}).pipe(tap(() => sync(() => {
		self.subscribers.delete(self.subscription);
		self.subscription.unsubscribe();
		self.replayWindow.close();
		self.strategy.onPubSubEmptySpaceUnsafe(self.pubsub, self.subscribers);
	})), when(self.shutdownHook.open), asVoid);
}));
/**
* Takes all available messages from the subscription, suspending if no items
* are available.
*
* **Example** (Taking all available messages)
*
* ```ts import.meta.vitest
* import { Effect, PubSub } from "effect"
*
* const program = Effect.scoped(Effect.gen(function*() {
*   const pubsub = yield* PubSub.bounded<string>(10)
*
*   const subscription = yield* PubSub.subscribe(pubsub)
*
*   // Publish multiple messages
*   yield* PubSub.publishAll(pubsub, ["msg1", "msg2", "msg3"])
*
*   // Take all available messages at once
*   return yield* PubSub.takeAll(subscription)
* }))
*
* const actual = await Effect.runPromise(program)
* actual // => ["msg1", "msg2", "msg3"]
* ```
*
* @category subscriptions
* @since 4.0.0
*/
const takeAll$1 = (self) => suspend$2(function loop(value) {
	if (self.shutdownFlag.current) return interrupt$1;
	let as = self.pollers.length === 0 ? self.subscription.pollUpTo(Number.POSITIVE_INFINITY) : [];
	if (value) as = value.concat(as);
	self.strategy.onPubSubEmptySpaceUnsafe(self.pubsub, self.subscribers);
	if (self.replayWindow.remaining > 0) return succeed$3(self.replayWindow.takeAll().concat(as));
	else if (!isArrayNonEmpty(as)) return flatMap(pollForItem(self), (item) => loop([item]));
	return succeed$3(as);
});
const pollForItem = (self) => callback((resume) => {
	if (self.shutdownFlag.current) return resume(interrupt$1);
	if (isSome(self.ended.current)) return resume(succeed$3(self.ended.current.value));
	const deferred = makeUnsafe$5();
	let set = self.subscribers.get(self.subscription);
	if (!set) {
		set = /* @__PURE__ */ new Set();
		self.subscribers.set(self.subscription, set);
	}
	set.add(self.pollers);
	append(self.pollers, deferred);
	self.strategy.completePollersUnsafe(self.pubsub, self.subscribers, self.subscription, self.pollers);
	if (deferred.effect) return resume(deferred.effect);
	deferred.resumes = [resume];
	return sync(() => remove(self.pollers, deferred));
});
const AbsentValue = /*#__PURE__*/ Symbol.for("effect/PubSub/AbsentValue");
const addSubscribers = (subscribers, subscription, pollers) => {
	if (!subscribers.has(subscription)) subscribers.set(subscription, /* @__PURE__ */ new Set());
	subscribers.get(subscription).add(pollers);
};
const removeSubscribers = (subscribers, subscription, pollers) => {
	if (!subscribers.has(subscription)) return;
	const set = subscribers.get(subscription);
	set.delete(pollers);
	if (set.size === 0) subscribers.delete(subscription);
};
const makeSubscriptionUnsafe = (pubsub, subscribers, strategy, ended) => new SubscriptionImpl(pubsub, subscribers, pubsub.subscribe(), make$9(), makeUnsafe$1(false), make$10(false), strategy, pubsub.replayWindow(), ended);
var UnboundedPubSub = class {
	publisherHead = {
		value: AbsentValue,
		replayIndex: void 0,
		subscribers: 0,
		next: null
	};
	publisherTail = this.publisherHead;
	publisherIndex = 0;
	subscribersIndex = 0;
	capacity = Number.MAX_SAFE_INTEGER;
	replayBuffer;
	constructor(replayBuffer) {
		this.replayBuffer = replayBuffer;
	}
	replayWindow() {
		return this.replayBuffer ? new ReplayWindowImpl(this.replayBuffer) : emptyReplayWindow;
	}
	isEmpty() {
		return this.publisherHead === this.publisherTail;
	}
	isFull() {
		return false;
	}
	size() {
		return this.publisherIndex - this.subscribersIndex;
	}
	publish(value) {
		const replayIndex = this.replayBuffer?.offer(value);
		const subscribers = this.publisherTail.subscribers;
		if (subscribers !== 0) {
			const node = {
				value,
				replayIndex,
				subscribers,
				next: null
			};
			this.publisherTail.next = node;
			this.publisherTail = this.publisherTail.next;
			this.publisherIndex += 1;
		}
		return true;
	}
	publishAll(elements) {
		if (this.publisherTail.subscribers !== 0) for (const a of elements) this.publish(a);
		else if (this.replayBuffer) this.replayBuffer.offerAll(elements);
		return [];
	}
	slide() {
		if (this.publisherHead !== this.publisherTail) {
			const node = this.publisherHead.next;
			const value = node.value;
			this.publisherHead = this.publisherHead.next;
			this.publisherHead.value = AbsentValue;
			this.subscribersIndex += 1;
			this.replayBuffer?.slide(value, node.replayIndex);
		}
	}
	subscribe() {
		this.publisherTail.subscribers += 1;
		return new UnboundedPubSubSubscription(this, this.publisherTail, this.publisherIndex, false);
	}
};
var UnboundedPubSubSubscription = class {
	self;
	subscriberHead;
	subscriberIndex;
	unsubscribed;
	constructor(self, subscriberHead, subscriberIndex, unsubscribed) {
		this.self = self;
		this.subscriberHead = subscriberHead;
		this.subscriberIndex = subscriberIndex;
		this.unsubscribed = unsubscribed;
	}
	isEmpty() {
		if (this.unsubscribed) return true;
		let empty = true;
		let loop = true;
		while (loop) if (this.subscriberHead === this.self.publisherTail) loop = false;
		else if (this.subscriberHead.next.value !== AbsentValue) {
			empty = false;
			loop = false;
		} else {
			this.subscriberHead = this.subscriberHead.next;
			this.subscriberIndex += 1;
		}
		return empty;
	}
	size() {
		if (this.unsubscribed) return 0;
		return this.self.publisherIndex - Math.max(this.subscriberIndex, this.self.subscribersIndex);
	}
	poll() {
		if (this.unsubscribed) return Empty$1;
		let loop = true;
		let polled = Empty$1;
		while (loop) if (this.subscriberHead === this.self.publisherTail) loop = false;
		else {
			const elem = this.subscriberHead.next.value;
			if (elem !== AbsentValue) {
				polled = elem;
				this.subscriberHead.subscribers -= 1;
				if (this.subscriberHead.subscribers === 0) {
					this.self.publisherHead = this.self.publisherHead.next;
					this.self.publisherHead.value = AbsentValue;
					this.self.subscribersIndex += 1;
				}
				loop = false;
			}
			this.subscriberHead = this.subscriberHead.next;
			this.subscriberIndex += 1;
		}
		return polled;
	}
	pollUpTo(n) {
		n = normalize$1(n);
		const builder = [];
		let i = 0;
		while (i !== n) {
			const a = this.poll();
			if (a === Empty$1) i = n;
			else {
				builder.push(a);
				i += 1;
			}
		}
		return builder;
	}
	unsubscribe() {
		if (!this.unsubscribed) {
			this.unsubscribed = true;
			this.self.publisherTail.subscribers -= 1;
			while (this.subscriberHead !== this.self.publisherTail) {
				if (this.subscriberHead.next.value !== AbsentValue) {
					this.subscriberHead.subscribers -= 1;
					if (this.subscriberHead.subscribers === 0) {
						this.self.publisherHead = this.self.publisherHead.next;
						this.self.publisherHead.value = AbsentValue;
						this.self.subscribersIndex += 1;
					}
				}
				this.subscriberHead = this.subscriberHead.next;
			}
		}
	}
};
var SubscriptionImpl = class {
	[SubscriptionTypeId] = { _A: identity };
	pubsub;
	subscribers;
	subscription;
	pollers;
	shutdownHook;
	shutdownFlag;
	strategy;
	replayWindow;
	ended;
	constructor(pubsub, subscribers, subscription, pollers, shutdownHook, shutdownFlag, strategy, replayWindow, ended) {
		this.pubsub = pubsub;
		this.subscribers = subscribers;
		this.subscription = subscription;
		this.pollers = pollers;
		this.shutdownHook = shutdownHook;
		this.shutdownFlag = shutdownFlag;
		this.strategy = strategy;
		this.replayWindow = replayWindow;
		this.ended = ended;
	}
	pipe() {
		return pipeArguments(this, arguments);
	}
};
var PubSubImpl = class {
	[TypeId$13] = { _A: identity };
	pubsub;
	subscribers;
	scope;
	shutdownHook;
	shutdownFlag;
	strategy;
	ended;
	constructor(pubsub, subscribers, scope, shutdownHook, shutdownFlag, strategy, ended) {
		this.pubsub = pubsub;
		this.subscribers = subscribers;
		this.scope = scope;
		this.shutdownHook = shutdownHook;
		this.shutdownFlag = shutdownFlag;
		this.strategy = strategy;
		this.ended = ended;
	}
	pipe() {
		return pipeArguments(this, arguments);
	}
};
const makePubSubUnsafe = (pubsub, subscribers, scope, shutdownHook, shutdownFlag, strategy, ended) => new PubSubImpl(pubsub, subscribers, scope, shutdownHook, shutdownFlag, strategy, ended);
/**
* Represents the dropping strategy for bounded `PubSub` values.
*
* **When to use**
*
* Use to keep publishers fast by dropping new messages when the `PubSub` is at
* capacity.
*
* **Details**
*
* A publish that arrives while the `PubSub` is full is dropped instead of
* waiting for capacity.
*
* **Gotchas**
*
* Subscribers may miss messages published while they are subscribed.
*
* **Example** (Applying a dropping strategy)
*
* ```ts import.meta.vitest
* import { Effect, PubSub } from "effect"
*
* const program = Effect.scoped(Effect.gen(function*() {
*   // Explicitly create a PubSub with a dropping strategy
*   const pubsub = yield* PubSub.make<string>({
*     atomicPubSub: () => PubSub.makeAtomicBounded(2),
*     strategy: () => new PubSub.DroppingStrategy()
*   })
*
*   const subscription = yield* PubSub.subscribe(pubsub)
*
*   // Fill the PubSub
*   const pub1 = yield* PubSub.publish(pubsub, "msg1") // true
*   const pub2 = yield* PubSub.publish(pubsub, "msg2") // true
*   const pub3 = yield* PubSub.publish(pubsub, "msg3") // false (dropped)
*
*   // Subscribers will only see the first two messages
*   const messages = yield* PubSub.takeAll(subscription)
*   return { published: [pub1, pub2, pub3], messages }
* }))
*
* const actual = await Effect.runPromise(program)
* actual // => { published: [true, true, false], messages: ["msg1", "msg2"] }
* ```
*
* @category models
* @since 4.0.0
*/
var DroppingStrategy = class {
	get shutdown() {
		return void_;
	}
	handleSurplus(_pubsub, _subscribers, _elements, _isShutdown) {
		return succeed$3(false);
	}
	onPubSubEmptySpaceUnsafe(_pubsub, _subscribers) {}
	completePollersUnsafe(pubsub, subscribers, subscription, pollers) {
		return strategyCompletePollersUnsafe(this, pubsub, subscribers, subscription, pollers);
	}
	completeSubscribersUnsafe(pubsub, subscribers) {
		return strategyCompleteSubscribersUnsafe(this, pubsub, subscribers);
	}
};
const strategyCompletePollersUnsafe = (strategy, pubsub, subscribers, subscription, pollers) => {
	let keepPolling = true;
	while (keepPolling && !subscription.isEmpty()) {
		const poller = take$1(pollers);
		if (poller === Empty$1) {
			removeSubscribers(subscribers, subscription, pollers);
			if (pollers.length === 0) keepPolling = false;
			else addSubscribers(subscribers, subscription, pollers);
		} else {
			const pollResult = subscription.poll();
			if (pollResult === Empty$1) prepend(pollers, poller);
			else {
				doneUnsafe(poller, succeed$5(pollResult));
				strategy.onPubSubEmptySpaceUnsafe(pubsub, subscribers);
			}
		}
	}
};
const strategyCompleteSubscribersUnsafe = (strategy, pubsub, subscribers) => {
	for (const [subscription, pollersSet] of subscribers) for (const pollers of pollersSet) strategy.completePollersUnsafe(pubsub, subscribers, subscription, pollers);
};
var ReplayBuffer = class {
	capacity;
	head = {
		value: AbsentValue,
		index: 0,
		next: null
	};
	tail = this.head;
	slideValues = [];
	size = 0;
	index = 0;
	publisherIndex = 0;
	constructor(capacity) {
		this.capacity = capacity;
	}
	slide(value, publisherIndex) {
		this.slideValues[this.index % this.capacity] = {
			value,
			index: publisherIndex
		};
		this.index++;
	}
	offer(a) {
		const index = this.publisherIndex++;
		this.tail.value = a;
		this.tail.index = index;
		this.tail.next = {
			value: AbsentValue,
			index: 0,
			next: null
		};
		this.tail = this.tail.next;
		if (this.size === this.capacity) this.head = this.head.next;
		else this.size += 1;
		return index;
	}
	offerAll(as) {
		for (const a of as) this.offer(a);
	}
};
var ReplayWindowImpl = class {
	buffer;
	values;
	index = 0;
	remaining;
	slideIndex;
	newestIndex = -1;
	constructor(buffer) {
		this.buffer = buffer;
		this.remaining = buffer.size;
		this.slideIndex = buffer.index;
		this.values = new Array(this.remaining);
		let node = buffer.head;
		for (let i = 0; i < this.remaining; i++) {
			this.values[i] = node.value;
			this.newestIndex = node.index;
			node = node.next;
		}
	}
	close() {
		this.values.length = 0;
		this.remaining = 0;
	}
	sync() {
		const slides = this.buffer.index - this.slideIndex;
		if (slides === 0 || this.remaining === 0) return;
		const count = Math.min(slides, this.buffer.capacity);
		const start = this.buffer.index - count;
		for (let i = 0; i < count; i++) {
			const entry = this.buffer.slideValues[(start + i) % this.buffer.capacity];
			if (entry.index > this.newestIndex) {
				this.index = (this.index + 1) % this.values.length;
				this.values[(this.index + this.remaining - 1) % this.values.length] = entry.value;
				this.newestIndex = entry.index;
			}
		}
		this.slideIndex = this.buffer.index;
	}
	take() {
		if (this.remaining === 0) return;
		this.sync();
		const value = this.values[this.index];
		this.values[this.index] = AbsentValue;
		this.index = (this.index + 1) % this.values.length;
		this.remaining--;
		if (this.remaining === 0) this.close();
		return value;
	}
	takeN(n) {
		n = normalize$1(n);
		const len = Math.min(n, this.remaining);
		const items = new Array(len);
		for (let i = 0; i < len; i++) items[i] = this.take();
		return items;
	}
	takeAll() {
		return this.takeN(this.remaining);
	}
};
const emptyReplayWindow = {
	remaining: 0,
	take: () => void 0,
	takeN: () => [],
	takeAll: () => [],
	close: () => void 0
};
//#endregion
//#region node_modules/effect/dist/Queue.js
const TypeId$12 = "~effect/Queue";
const EnqueueTypeId = "~effect/Queue/Enqueue";
const DequeueTypeId = "~effect/Queue/Dequeue";
const variance = {
	_A: identity,
	_E: identity
};
const QueueProto = {
	[TypeId$12]: variance,
	[EnqueueTypeId]: variance,
	[DequeueTypeId]: variance,
	...PipeInspectableProto,
	toJSON() {
		return {
			_id: "effect/Queue",
			state: this.state._tag,
			size: sizeUnsafe(this)
		};
	}
};
/**
* Creates a `Queue` with optional capacity and overflow strategy.
*
* **Details**
*
* By default the queue is unbounded and uses the `"suspend"` strategy. Provide
* `capacity` for a bounded queue and choose `"suspend"`, `"dropping"`, or
* `"sliding"` to control what happens when the queue is full. The returned
* queue can be offered to, taken from, failed, ended, interrupted, or shut down.
*
* **Example** (Creating queues)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.make<number, string | Cause.Done>()
*
*   // add messages to the queue
*   yield* Queue.offer(queue, 1)
*   yield* Queue.offer(queue, 2)
*   yield* Queue.offerAll(queue, [3, 4, 5])
*
*   // take messages from the queue
*   const messages = yield* Queue.takeAll(queue)
*
*   // signal that the queue is done
*   yield* Queue.end(queue)
*   const done = yield* Effect.flip(Queue.take(queue))
*
*   // signal that another queue has failed
*   const failedQueue = yield* Queue.make<number, string>()
*   const failed = yield* Queue.fail(failedQueue, "boom")
*   return { messages, done, failed }
* })
*
* await Effect.runPromise(program) // => { messages: [1, 2, 3, 4, 5], done: Cause.Done(), failed: true }
* ```
*
* @category constructors
* @since 4.0.0
*/
const make$7 = (options) => withFiber$1((fiber) => {
	const self = Object.create(QueueProto);
	self.dispatcher = fiber.currentDispatcher;
	self.capacity = options?.capacity ?? Number.POSITIVE_INFINITY;
	self.strategy = options?.strategy ?? "suspend";
	self.messages = make$9();
	self.scheduleRunning = false;
	self.state = {
		_tag: "Open",
		takers: /* @__PURE__ */ new Set(),
		offers: /* @__PURE__ */ new Set(),
		awaiters: /* @__PURE__ */ new Set()
	};
	return succeed$6(self);
});
/**
* Creates a bounded queue with the specified capacity that uses backpressure strategy.
*
* **Details**
*
* When the queue reaches capacity, producers will be suspended until space becomes available.
* This ensures all messages are processed but may slow down producers.
*
* **Example** (Creating bounded queues)
*
* ```ts import.meta.vitest
* import { Effect, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<string>(5)
*
*   // This will succeed as queue has capacity
*   yield* Queue.offer(queue, "first")
*   yield* Queue.offer(queue, "second")
*
*   const size = yield* Queue.size(queue)
*   return size
* })
*
* await Effect.runPromise(program) // => 2
* ```
*
* @category constructors
* @since 2.0.0
*/
const bounded = (capacity) => make$7({ capacity });
/**
* Creates an unbounded queue that can grow to any size without blocking producers.
*
* **When to use**
*
* Use when you need producers to add messages without backpressure and accept
* unbounded memory growth.
*
* **Example** (Creating unbounded queues)
*
* ```ts import.meta.vitest
* import { Effect, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.unbounded<string>()
*
*   // Producers can always add messages without blocking
*   yield* Queue.offer(queue, "message1")
*   yield* Queue.offer(queue, "message2")
*   yield* Queue.offerAll(queue, ["message3", "message4", "message5"])
*
*   // Check current size
*   const size = yield* Queue.size(queue)
*
*   // Take all messages
*   const messages = yield* Queue.takeAll(queue)
*   return { size, messages }
* })
*
* await Effect.runPromise(program) // => { size: 5, messages: ["message1", "message2", "message3", "message4", "message5"] }
* ```
*
* @category constructors
* @since 2.0.0
*/
const unbounded = () => make$7();
/**
* Adds a message to the queue. Returns `false` if the queue is done.
*
* **Details**
*
* For bounded queues, this operation may suspend if the queue is at capacity,
* depending on the backpressure strategy. For dropping/sliding queues, it may
* return false or succeed immediately by dropping/sliding existing messages.
*
* **Example** (Offering a value)
*
* ```ts import.meta.vitest
* import { Effect, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<number>(3)
*
*   // Successfully add messages to queue
*   const success1 = yield* Queue.offer(queue, 1)
*   const success2 = yield* Queue.offer(queue, 2)
*
*   // Queue state
*   const size = yield* Queue.size(queue)
*   return { offered: [success1, success2], size }
* })
*
* await Effect.runPromise(program) // => { offered: [true, true], size: 2 }
* ```
*
* @category offering
* @since 2.0.0
*/
const offer = /*#__PURE__*/ dual(2, (self, message) => suspend$3(() => offerUnsafe(self, message) ? exitTrue : self.state._tag === "Open" && self.strategy === "suspend" ? offerOrWait(self, message) : exitFalse));
/**
* Adds a message to the queue synchronously. Returns `false` if the queue is done.
*
* **When to use**
*
* Use when you are already in synchronous queue internals or a performance
* boundary where wrapping the mutation in `Effect` is intentionally avoided.
*
* **Gotchas**
*
* This is an unsafe operation that directly modifies the queue without Effect wrapping.
* Use this only when you're certain about the synchronous nature of the operation.
*
* **Example** (Offering a value synchronously)
*
* ```ts import.meta.vitest
* import { Effect, Queue } from "effect"
*
* // Create a queue effect and extract the queue for unsafe operations
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<number>(3)
*
*   // Add messages synchronously using unsafe API
*   const success1 = Queue.offerUnsafe(queue, 1)
*   const success2 = Queue.offerUnsafe(queue, 2)
*
*   // Check current size
*   const size = Queue.sizeUnsafe(queue)
*   return { offered: [success1, success2], size }
* })
*
* await Effect.runPromise(program) // => { offered: [true, true], size: 2 }
* ```
*
* @category offering
* @since 4.0.0
*/
const offerUnsafe = (self, message) => {
	if (self.state._tag !== "Open") return false;
	else if (self.messages.length >= self.capacity) {
		if (self.strategy === "sliding") {
			take$1(self.messages);
			append(self.messages, message);
			return true;
		} else if (self.capacity <= 0 && self.state.takers.size > 0) {
			append(self.messages, message);
			releaseTakers(self);
			return true;
		}
		return false;
	}
	append(self.messages, message);
	scheduleReleaseTaker(self);
	return true;
};
/**
* Fails the queue with a cause. If the queue is already done, `false` is
* returned.
*
* **Example** (Failing queues with a cause)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Exit, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<number, string>(10)
*
*   // Create a cause and fail the queue
*   const cause = Cause.fail("Queue processing failed")
*   const failed = yield* Queue.failCause(queue, cause)
*
*   // The queue is now done with the specified failure cause
*   const exit = yield* Effect.exit(Queue.take(queue))
*   return [failed, exit]
* })
*
* await Effect.runPromise(program) // => [true, Exit.failCause(Cause.fail("Queue processing failed"))]
* ```
*
* @category completion
* @since 4.0.0
*/
const failCause$1 = /*#__PURE__*/ dual(2, (self, cause) => sync$1(() => failCauseUnsafe(self, cause)));
/**
* Fails the queue with a cause synchronously. If the queue is already done, `false` is
* returned.
*
* **When to use**
*
* Use when queue completion must be driven from synchronous internals while
* preserving the full failure `Cause`.
*
* **Gotchas**
*
* This is an unsafe operation that directly modifies the queue without Effect wrapping.
*
* **Example** (Failing queues with a cause synchronously)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Exit, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<number, string>(10)
*
*   // Create a cause and fail the queue synchronously
*   const cause = Cause.fail("Processing error")
*   const failed = Queue.failCauseUnsafe(queue, cause)
*
*   // The queue is now done with the specified failure cause
*   const exit = Queue.takeUnsafe(queue)
*   return [failed, exit]
* })
*
* await Effect.runPromise(program) // => [true, Exit.failCause(Cause.fail("Processing error"))]
* ```
*
* @category completion
* @since 4.0.0
*/
const failCauseUnsafe = (self, cause) => {
	if (self.state._tag !== "Open") return false;
	const exit = exitFailCause(cause);
	const fail = exitZipRight(exit, exitFailDone);
	if (self.state.offers.size === 0 && self.messages.length === 0) {
		finalize(self, fail);
		return true;
	}
	self.state = {
		...self.state,
		_tag: "Closing",
		exit: fail
	};
	scheduleReleaseTaker(self);
	return true;
};
/**
* Shuts down the queue immediately, discarding buffered messages and resuming
* pending operations.
*
* **Details**
*
* Returns `true` when the queue is shut down by this call, or `false` when it
* has already been shut down or completed.
*
* **Example** (Shutting down queues)
*
* ```ts import.meta.vitest
* import { Effect, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<number>(2)
*
*   // Add messages
*   yield* Queue.offer(queue, 1)
*   yield* Queue.offer(queue, 2)
*
*   // Shutdown clears buffered messages and prevents further offers
*   const wasShutdown = yield* Queue.shutdown(queue)
*
*   // Queue is now done and cleared
*   const size = yield* Queue.size(queue)
*   return { wasShutdown, size }
* })
*
* await Effect.runPromise(program) // => { wasShutdown: true, size: 0 }
* ```
*
* @see {@link shutdownUnsafe} for synchronous shutdown
* @category completion
* @since 2.0.0
*/
const shutdown = (self) => sync$1(() => shutdownUnsafe(self));
/**
* Shuts down the queue synchronously, discarding buffered messages and resuming
* pending operations.
*
* **When to use**
*
* Use when a synchronous callback must discard buffered messages and settle
* pending queue operations before returning.
*
* **Details**
*
* An open queue completes with an interruption. A queue already closing retains
* its completion cause. Call `failCauseUnsafe` first to shut down with a specific
* failure. Returns `true` when the queue is shut down by this call, or `false`
* when it has already been shut down or completed.
*
* @see {@link shutdown} for the effectful variant
* @see {@link failCauseUnsafe} to set a failure before discarding buffered messages
* @category completion
* @since 4.0.0
*/
const shutdownUnsafe = (self) => {
	if (self.state._tag === "Done") return false;
	clear(self.messages);
	const offers = self.state.offers;
	finalize(self, self.state._tag === "Open" ? exitInterrupt : self.state.exit);
	for (const entry of offers) resumeUnoffered(entry);
	return true;
};
/**
* Takes all currently available messages, waiting until at least one message
* is available when the queue is empty.
*
* **When to use**
*
* Use when consumers should process the next non-empty batch of buffered
* messages instead of repeatedly taking one message at a time.
*
* **Details**
*
* Returns a non-empty array. If the queue completes or fails before a message
* can be taken, the effect fails with the queue's terminal error.
*
* **Example** (Taking all available values)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<number, Cause.Done>(5)
*
*   // Add several messages
*   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5])
*
*   // Take all available messages
*   const messages1 = yield* Queue.takeAll(queue)
*   return messages1
* })
*
* await Effect.runPromise(program) // => [1, 2, 3, 4, 5]
* ```
*
* @category taking
* @since 2.0.0
*/
const takeAll = (self) => takeBetween(self, 1, Number.POSITIVE_INFINITY);
/**
* Takes between `min` and `max` messages from the queue.
*
* **Details**
*
* The operation waits when fewer than the required minimum messages are
* available. It returns at most `max` messages. Finite fractional bounds are
* rounded down, while `NaN` and non-positive bounds are treated as `0`. If the
* queue is closing, drains the currently available messages even when fewer
* than `min` are available. Once the queue is done, the effect fails with the
* queue's terminal error.
*
* **Example** (Taking a bounded batch of values)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<number>(10)
*
*   // Add several messages
*   yield* Queue.offerAll(queue, [1, 2, 3, 4, 5, 6, 7, 8])
*
*   // Take between 2 and 5 messages
*   const batch1 = yield* Queue.takeBetween(queue, 2, 5)
*
*   // Take between 1 and 10 messages (but only 3 remain)
*   const batch2 = yield* Queue.takeBetween(queue, 1, 10)
*
*   // No more messages available, will wait or return done
*   // const batch3 = yield* Queue.takeBetween(queue, 1, 3)
*   return [batch1, batch2]
* })
*
* await Effect.runPromise(program) // => [[1, 2, 3, 4, 5], [6, 7, 8]]
* ```
*
* @category taking
* @since 2.0.0
*/
const takeBetween = /*#__PURE__*/ dual(3, (self, min, max) => {
	min = normalize$1(min);
	max = normalize$1(max);
	return suspend$3(() => takeBetweenUnsafe(self, min, max) ?? andThen$1(awaitTake(self, () => canTake(self, min)), takeBetween(self, min, max)));
});
/**
* Takes a single message from the queue, or wait for a message to be
* available.
*
* **Details**
*
* If the queue is done, it will fail with `Done`. If the
* queue fails, the Effect will fail with the error.
*
* **Example** (Taking one value)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Exit, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<string, Cause.Done>(3)
*
*   // Add some messages
*   yield* Queue.offer(queue, "first")
*   yield* Queue.offer(queue, "second")
*
*   // Take messages one by one
*   const msg1 = yield* Queue.take(queue)
*   const msg2 = yield* Queue.take(queue)
*
*   // End the queue
*   yield* Queue.end(queue)
*
*   // Taking from an ended queue fails with Done
*   const result = yield* Effect.exit(Queue.take(queue))
*   return [[msg1, msg2], result]
* })
*
* await Effect.runPromise(program) // => [["first", "second"], Exit.fail(Cause.Done())]
* ```
*
* @category taking
* @since 2.0.0
*/
const take = (self) => suspend$3(() => takeUnsafe(self) ?? andThen$1(awaitTake(self, () => canTake(self, 1)), take(self)));
/**
* Attempts to take one message from the queue synchronously.
*
* **When to use**
*
* Use when polling queue internals must not suspend or register a waiting taker,
* and `undefined` is an acceptable result for an empty queue.
*
* **Details**
*
* Returns an `Exit` for an immediately available message or for the queue's
* terminal state. Returns `undefined` when no message is immediately available.
* This operation does not wait or register a taker.
*
* **Example** (Taking one value synchronously)
*
* ```ts import.meta.vitest
* import { Effect, Exit, Queue } from "effect"
*
* // Create a queue and use unsafe operations
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<number>(10)
*
*   // Add some messages
*   Queue.offerUnsafe(queue, 1)
*   Queue.offerUnsafe(queue, 2)
*
*   // Take a message synchronously
*   const result1 = Queue.takeUnsafe(queue)
*
*   const result2 = Queue.takeUnsafe(queue)
*
*   // No more messages - returns undefined
*   const result3 = Queue.takeUnsafe(queue)
*   return [result1, result2, result3]
* })
*
* await Effect.runPromise(program) // => [Exit.succeed(1), Exit.succeed(2), undefined]
* ```
*
* @category taking
* @since 4.0.0
*/
const takeUnsafe = (self) => {
	if (self.state._tag === "Done") return self.state.exit;
	if (self.messages.length > 0) {
		const message = take$1(self.messages);
		releaseCapacity(self);
		return exitSucceed(message);
	} else if (self.capacity <= 0 && self.state.offers.size > 0) {
		const message = takeOfferUnsafe(self.state.offers);
		releaseCapacity(self);
		return exitSucceed(message);
	}
};
/**
* Returns the current number of buffered messages in the queue synchronously.
*
* **When to use**
*
* Use when you need an immediate `Queue` size snapshot for diagnostics or
* internals and do not need the read wrapped in `Effect`.
*
* **Details**
*
* After `endUnsafe`, a queue remains `Closing` while buffered messages are
* drained, and its size continues to include those messages. A `Done` queue
* reports a size of `0`. This unsafe operation reads the queue state directly
* without Effect wrapping.
*
* **Example** (Checking queue size synchronously)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<number, Cause.Done>(10)
*
*   // Check size of empty queue
*   const size1 = Queue.sizeUnsafe(queue)
*
*   // Add some messages
*   Queue.offerUnsafe(queue, 1)
*   Queue.offerUnsafe(queue, 2)
*   Queue.offerUnsafe(queue, 3)
*
*   // Check size after adding messages
*   const size2 = Queue.sizeUnsafe(queue)
*
*   // End the queue
*   Queue.endUnsafe(queue)
*
*   // Ending retains the buffered size while the queue is Closing
*   const size3 = Queue.sizeUnsafe(queue)
*   return [size1, size2, size3]
* })
*
* await Effect.runPromise(program) // => [0, 3, 3]
* ```
*
* @category sizes
* @since 4.0.0
*/
const sizeUnsafe = (self) => self.state._tag === "Done" ? 0 : self.messages.length;
const exitFalse = /*#__PURE__*/ exitSucceed(false);
const exitTrue = /*#__PURE__*/ exitSucceed(true);
const exitFailDone = /*#__PURE__*/ exitFail(/*#__PURE__*/ Done());
const exitInterrupt = /*#__PURE__*/ exitInterrupt$1();
const releaseTakers = (self) => {
	if (self.state._tag === "Done" || self.state.takers.size === 0) return;
	for (const taker of self.state.takers) {
		if (!taker.ready()) continue;
		self.state.takers.delete(taker);
		taker.resume(exitVoid);
		if (self.messages.length === 0) break;
	}
};
const scheduleReleaseTaker = (self) => {
	if (self.scheduleRunning || self.state._tag === "Done" || self.state.takers.size === 0) return;
	self.scheduleRunning = true;
	self.dispatcher.scheduleTask(() => {
		self.scheduleRunning = false;
		releaseTakers(self);
	}, 0);
};
const takeBetweenUnsafe = (self, min, max) => {
	if (self.state._tag === "Done") return self.state.exit;
	else if (max <= 0 || min <= 0) return exitSucceed([]);
	else if (!canTake(self, min)) return;
	const messages = self.messages.length > 0 ? takeN(self.messages, max) : [takeOfferUnsafe(self.state.offers)];
	releaseCapacity(self);
	return exitSucceed(messages);
};
const canTake = (self, min) => self.messages.length >= (self.state._tag === "Closing" ? 1 : Math.min(min, self.capacity || 1)) || self.capacity <= 0 && self.state._tag !== "Done" && self.state.offers.size > 0;
const awaitTake = (self, ready) => callback$1((resume) => {
	if (self.state._tag === "Done") return resume(self.state.exit);
	if (ready()) return resume(exitVoid);
	const taker = {
		ready,
		resume
	};
	self.state.takers.add(taker);
	return sync$1(() => {
		if (self.state._tag !== "Done") self.state.takers.delete(taker);
	});
});
const offerOrWait = (self, message) => callback$1((resume) => offerUnsafe(self, message) ? resume(exitTrue) : waitToOffer(self, {
	_tag: "Single",
	message,
	resume
}));
const waitToOffer = (self, entry) => {
	if (self.state._tag !== "Open") return resumeUnoffered(entry);
	const offers = self.state.offers;
	offers.add(entry);
	return sync$1(() => {
		if (self.state._tag === "Done") return;
		offers.delete(entry);
		if (self.state._tag === "Closing" && offers.size === 0 && self.messages.length === 0) finalize(self, self.state.exit);
	});
};
const resumeUnoffered = (entry) => entry._tag === "Single" ? entry.resume(exitFalse) : entry.resume(exitSucceed(entry.remaining.slice(entry.offset)));
const takeOfferUnsafe = (offers) => {
	const entry = offers.values().next().value;
	if (entry._tag === "Single") {
		offers.delete(entry);
		entry.resume(exitTrue);
		return entry.message;
	}
	const message = entry.remaining[entry.offset++];
	if (entry.offset === entry.remaining.length) {
		offers.delete(entry);
		entry.resume(exitSucceed([]));
	}
	return message;
};
const releaseCapacity = (self) => {
	if (self.state._tag === "Done") return isDoneCause(self.state.exit.cause);
	else if (self.state.offers.size === 0) {
		if (self.state._tag === "Closing" && self.messages.length === 0) {
			finalize(self, self.state.exit);
			return isDoneCause(self.state.exit.cause);
		}
		return false;
	}
	for (const entry of self.state.offers) {
		let n = self.capacity - self.messages.length;
		if (n <= 0) break;
		else if (entry._tag === "Single") {
			append(self.messages, entry.message);
			self.state.offers.delete(entry);
			entry.resume(exitTrue);
		} else {
			for (; entry.offset < entry.remaining.length; entry.offset++) {
				if (n === 0) return false;
				append(self.messages, entry.remaining[entry.offset]);
				n--;
			}
			self.state.offers.delete(entry);
			entry.resume(exitSucceed([]));
		}
	}
	return false;
};
const finalize = (self, exit) => {
	if (self.state._tag === "Done") return;
	const openState = self.state;
	self.state = {
		_tag: "Done",
		exit
	};
	for (const taker of openState.takers) taker.resume(exit);
	openState.takers.clear();
	for (const awaiter of openState.awaiters) awaiter(exit);
	openState.awaiters.clear();
};
//#endregion
//#region node_modules/effect/dist/Semaphore.js
/**
* Creates a `Semaphore` synchronously with the specified total
* number of permits.
*
* **When to use**
*
* Use to construct a semaphore synchronously when an immediate value is
* required outside an Effect workflow.
*
* **Example** (Creating an unsafe semaphore)
*
* ```ts import.meta.vitest
* import { Effect, Semaphore } from "effect"
*
* const semaphore = Semaphore.makeUnsafe(3)
*
* const task = (id: number) =>
*   semaphore.withPermits(1)(
*     Effect.gen(function*() {
*       yield* Effect.yieldNow
*       return id
*     })
*   )
*
* // Only 3 tasks can run concurrently
* const program = Effect.all([
*   task(1),
*   task(2),
*   task(3),
*   task(4),
*   task(5)
* ], { concurrency: "unbounded" })
*
* await Effect.runPromise(program) // => [1, 2, 3, 4, 5]
* ```
*
* @category constructors
* @since 4.0.0
*/
const makeUnsafe = (permits) => new SemaphoreImpl(permits);
const waitForPermits = (self, n, effect) => callback$1((resume) => {
	if (self.free >= n) return resume(effect);
	const observer = () => {
		if (self.free < n) return;
		self.waiters.delete(observer);
		resume(effect);
	};
	self.waiters.add(observer);
	return sync$1(() => {
		self.waiters.delete(observer);
	});
});
var SemaphoreImpl = class {
	waiters = /*#__PURE__*/ new Set();
	taken = 0;
	permits;
	constructor(permits) {
		this.permits = permits;
	}
	get free() {
		return this.permits - this.taken;
	}
	take(n) {
		const take = suspend$3(() => {
			if (this.free < n) return waitForPermits(this, n, take);
			this.taken += n;
			return succeed$6(n);
		});
		return take;
	}
	takeIfAvailable(n) {
		return suspend$3(() => {
			if (this.free < n) return succeed$6(false);
			this.taken += n;
			return succeed$6(true);
		});
	}
	releaseUnsafe(fiber, n) {
		this.taken -= n;
		if (this.waiters.size > 0) fiber.currentDispatcher.scheduleTask(() => {
			for (const observer of this.waiters) {
				if (this.free <= 0) break;
				observer();
			}
		}, 0);
		return this.free;
	}
	resize(permits) {
		return withFiber$1((fiber) => {
			this.permits = permits;
			if (this.free < 0) return void_$2;
			this.releaseUnsafe(fiber, 0);
			return void_$2;
		});
	}
	release(n) {
		return withFiber$1((fiber) => succeed$6(this.releaseUnsafe(fiber, n)));
	}
	get releaseAll() {
		return withFiber$1((fiber) => succeed$6(this.releaseUnsafe(fiber, this.taken)));
	}
	withPermits(n) {
		return (self) => uninterruptibleMask$1((restore) => {
			const acquire = suspend$3(() => {
				if (this.free < n) {
					const wait = waitForPermits(this, n, void_$2);
					return flatMap$1(restore(wait), () => acquire);
				}
				this.taken += n;
				return onExitPrimitive(restore(self), () => {
					this.releaseUnsafe(getCurrentFiber(), n);
				}, true);
			});
			return acquire;
		});
	}
	withPermit = /*#__PURE__*/ this.withPermits(1);
	withPermitsIfAvailable(n) {
		return (self) => uninterruptibleMask$1((restore) => {
			if (this.free < n) return succeedNone;
			this.taken += n;
			return onExitPrimitive(restore(asSome(self)), () => {
				this.releaseUnsafe(getCurrentFiber(), n);
			}, true);
		});
	}
};
//#endregion
//#region node_modules/effect/dist/Channel.js
/**
* Provides low-level building blocks for streaming data through Effect.
*
* A `Channel` can read input elements, write output elements, fail with a typed
* error, and finish with a typed result while managing resources safely.
* Streams and sinks are built on channels, so most application code uses those
* higher-level modules instead. This module is useful when implementing stream
* operators or specialized streaming workflows.
*
* @since 2.0.0
*/
/**
* Runtime identifier stored on `Channel` values and used by `isChannel` to
* recognize them.
*
* @category type IDs
* @since 4.0.0
*/
const TypeId$11 = "~effect/Channel";
/**
* Checks whether a value is a `Channel`.
*
* **Example** (Checking for channels)
*
* ```ts import.meta.vitest
* import { Channel } from "effect"
*
* const channel = Channel.succeed(42)
* Channel.isChannel(channel) // => true
* Channel.isChannel("not a channel") // => false
* ```
*
* @category guards
* @since 3.5.4
*/
const isChannel = (u) => hasProperty(u, TypeId$11);
const ChannelProto = {
	[TypeId$11]: {
		_Env: identity,
		_InErr: identity,
		_InElem: identity,
		_OutErr: identity,
		_OutElem: identity
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
/**
* Creates a `Channel` from a transformation function that operates on upstream pulls.
*
* **Example** (Creating channels from transforms)
*
* ```ts import.meta.vitest
* import { Channel, Effect } from "effect"
*
* const channel = Channel.fromTransform((upstream, scope) =>
*   Effect.succeed(upstream)
* )
* await Effect.runPromise(Channel.runCollect(channel)) // => []
* ```
*
* @category constructors
* @since 4.0.0
*/
const fromTransform = (transform) => {
	const self = Object.create(ChannelProto);
	self.transform = (upstream, scope) => catchCause$1(transform(upstream, scope), (cause) => succeed$3(failCause$2(cause)));
	return self;
};
/**
* Transforms a Channel by applying a function to its Pull implementation.
*
* **Example** (Transforming pull behavior)
*
* ```ts import.meta.vitest
* import { Channel, Effect } from "effect"
*
* // Transform a channel by modifying its pull behavior
* const originalChannel = Channel.fromIterable([1, 2, 3])
*
* const transformedChannel = Channel.transformPull(
*   originalChannel,
*   (pull, scope) =>
*     Effect.succeed(
*       Effect.map(pull, (value) => value * 2)
*     )
* )
* await Effect.runPromise(Channel.runCollect(transformedChannel)) // => [2, 4, 6]
* ```
*
* @category constructors
* @since 4.0.0
*/
const transformPull = (self, f) => fromTransform((upstream, scope) => flatMap(toTransform(self)(upstream, scope), (pull) => f(pull, scope)));
/**
* Creates a `Channel` from an `Effect` that produces a `Pull`.
*
* **Example** (Creating channels from pulls)
*
* ```ts import.meta.vitest
* import { Cause, Channel, Effect } from "effect"
*
* const channel = Channel.fromPull(Effect.sync(() => {
*   let emitted = false
*   return Effect.suspend(() => {
*     if (emitted) return Cause.done()
*     emitted = true
*     return Effect.succeed(42)
*   })
* }))
* await Effect.runPromise(Channel.runCollect(channel)) // => [42]
* ```
*
* @category constructors
* @since 4.0.0
*/
const fromPull = (effect) => fromTransform((_, __) => effect);
/**
* Creates a `Channel` from a transformation function that operates on upstream
* pulls, but also provides a forked scope that closes when the resulting
* Channel completes.
*
* **When to use**
*
* Use when building channels that require scoped resource lifecycle management,
* providing both the channel scope and a forked scope that automatically closes
* when the channel completes.
*
* @see {@link fromTransform} for a simpler transformation without a forked scope
* @category constructors
* @since 4.0.0
*/
const fromTransformBracket = (f) => fromTransform(fnUntraced(function* (upstream, scope) {
	const closableScope = forkUnsafe(scope);
	const onCause = (cause) => close(closableScope, doneExitFromCause(cause));
	const pull = yield* onError(f(upstream, scope, closableScope), onCause);
	return onError(pull, onCause);
}));
/**
* Converts a `Channel` back to its underlying transformation function.
*
* **Example** (Extracting channel transforms)
*
* ```ts import.meta.vitest
* import { Channel, Effect } from "effect"
*
* const channel = Channel.succeed(42)
* const transform = Channel.toTransform(channel)
* typeof transform // => "function"
* Effect.runSync(Channel.runCollect(channel)) // => [42]
* ```
*
* @category destructors
* @since 4.0.0
*/
const toTransform = (channel) => channel.transform;
/**
* Creates a `Channel` that lazily evaluates to another channel.
*
* **Example** (Suspending channel creation)
*
* ```ts import.meta.vitest
* import { Channel, Effect } from "effect"
*
* const channel = Channel.suspend(() => Channel.succeed(42))
* Effect.runSync(Channel.runCollect(channel)) // => [42]
* ```
*
* @category constructors
* @since 2.0.0
*/
const suspend$1 = (evaluate) => fromTransform((upstream, scope) => suspend$2(() => toTransform(evaluate())(upstream, scope)));
/**
* Constructs a channel that fails immediately with the specified error.
*
* **Example** (Failing with an error)
*
* ```ts import.meta.vitest
* import { Channel, Effect, Exit } from "effect"
*
* const failedChannel = Channel.fail("Something went wrong")
* Effect.runSync(Effect.exit(Channel.runCollect(failedChannel))) // => Exit.fail("Something went wrong")
* ```
*
* @category constructors
* @since 2.0.0
*/
const fail$1 = (error) => fromPull(succeed$3(fail$3(error)));
/**
* Creates a channel from a queue that emits arrays of elements.
*
* **Example** (Creating batched channels from queues)
*
* ```ts import.meta.vitest
* import { Cause, Channel, Effect, Queue } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.bounded<number, Cause.Done>(4)
*   yield* Queue.offerAll(queue, [1, 2, 3, 4])
*   yield* Queue.end(queue)
*   const arrayChannel = Channel.fromQueueArray(queue)
*   return yield* Channel.runCollect(arrayChannel)
* })
* await Effect.runPromise(program) // => [[1, 2, 3, 4]]
* ```
*
* @category constructors
* @since 4.0.0
*/
const fromQueueArray = (queue) => fromPull(succeed$3(takeAll(queue)));
/**
* Creates a channel from a PubSub subscription that outputs arrays of values.
*
* **Details**
*
* This constructor creates a channel that reads from a PubSub subscription and outputs
* arrays of values in chunks. It's useful when you want to process multiple values at once
* for better performance.
*
* **Example** (Batching subscription values)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect, Option, PubSub } from "effect"
*
* class StreamError extends Data.TaggedError("StreamError")<{
*   readonly message: string
* }> {}
*
* const program = Effect.gen(function*() {
*   const pubsub = yield* PubSub.bounded<number>(16)
*   const subscription = yield* PubSub.subscribe(pubsub)
*
*   // Create a channel that reads arrays of values
*   const channel = Channel.fromSubscriptionArray(subscription)
*
*   // Publish some values
*   yield* PubSub.publish(pubsub, 1)
*   yield* PubSub.publish(pubsub, 2)
*   yield* PubSub.publish(pubsub, 3)
*   yield* PubSub.publish(pubsub, 4)
*
*   // The channel will output arrays like [1, 2, 3] and [4]
*   return channel
* })
* const result = Effect.scoped(Effect.flatMap(program, Channel.runHead))
* await Effect.runPromise(result) // => Option.some([1, 2, 3, 4])
* ```
*
* **Example** (Processing subscription values in batches)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect, Option, PubSub } from "effect"
*
* class BatchProcessingError extends Data.TaggedError("BatchProcessingError")<{
*   readonly reason: string
* }> {}
*
* const batchProcessor = Effect.gen(function*() {
*   const pubsub = yield* PubSub.bounded<string>(32)
*   const subscription = yield* PubSub.subscribe(pubsub)
*
*   // Create a channel that processes items in batches
*   const batchChannel = Channel.fromSubscriptionArray(subscription)
*
*   // Transform to process each batch
*   const processedChannel = Channel.map(batchChannel, (batch) =>
*     batch.map((item) => item.toUpperCase())
*   )
*
*   yield* PubSub.publishAll(pubsub, ["one", "two"])
*   return processedChannel
* })
* const batch = Effect.scoped(Effect.flatMap(batchProcessor, Channel.runHead))
* await Effect.runPromise(batch) // => Option.some(["ONE", "TWO"])
* ```
*
* **Example** (Aggregating subscription metrics)
*
* ```ts import.meta.vitest
* import { Channel, Effect, Option, PubSub } from "effect"
*
* const metricsAggregator = Effect.gen(function*() {
*   const metricsPubSub = yield* PubSub.bounded<
*     { timestamp: number; value: number }
*   >(100)
*   const subscription = yield* PubSub.subscribe(metricsPubSub)
*
*   // Create a channel that collects metrics in chunks
*   const metricsChannel = Channel.fromSubscriptionArray(subscription)
*
*   // Transform to calculate aggregate statistics
*   const aggregatedChannel = Channel.map(metricsChannel, (metrics) => {
*     const values = metrics.map((m) => m.value)
*     const sum = values.reduce((a, b) => a + b, 0)
*     const avg = sum / values.length
*     const min = Math.min(...values)
*     const max = Math.max(...values)
*
*     return {
*       count: values.length,
*       sum,
*       average: avg,
*       min,
*       max,
*       firstTimestamp: Math.min(...metrics.map((m) => m.timestamp)),
*       lastTimestamp: Math.max(...metrics.map((m) => m.timestamp))
*     }
*   })
*
*   yield* PubSub.publish(metricsPubSub, { timestamp: 1, value: 10 })
*   return aggregatedChannel
* })
* const metric = Effect.scoped(Effect.flatMap(metricsAggregator, Channel.runHead))
* const result = await Effect.runPromise(metric)
* Option.map(result, ({ count, sum, average, min, max }) => ({ count, sum, average, min, max })) // => Option.some({ count: 1, sum: 10, average: 10, min: 10, max: 10 })
* ```
*
* @category constructors
* @since 4.0.0
*/
const fromSubscriptionArray = (subscription) => fromPull(succeed$3(onInterrupt(takeAll$1(subscription), () => done$1())));
/**
* Creates a channel from a PubSub that outputs arrays of values.
*
* **Details**
*
* This constructor creates a channel that reads from a PubSub by automatically
* subscribing to it and collecting values into arrays. The channel outputs
* arrays of values in chunks, making it ideal for batch processing scenarios.
*
* **Example** (Batching PubSub values)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect, Option, PubSub } from "effect"
*
* class BatchError extends Data.TaggedError("BatchError")<{
*   readonly message: string
* }> {}
*
* const program = Effect.gen(function*() {
*   const pubsub = yield* PubSub.unbounded<number>({ replay: 4 })
*
*   // Create a channel that reads arrays of values
*   const channel = Channel.fromPubSubArray(pubsub)
*
*   // Publish some values
*   yield* PubSub.publish(pubsub, 1)
*   yield* PubSub.publish(pubsub, 2)
*   yield* PubSub.publish(pubsub, 3)
*   yield* PubSub.publish(pubsub, 4)
*
*   // The channel will output arrays like [1, 2, 3] and [4]
*   return channel
* })
* const result = Effect.scoped(Effect.flatMap(program, Channel.runHead))
* await Effect.runPromise(result) // => Option.some([1, 2, 3, 4])
* ```
*
* **Example** (Processing PubSub orders in batches)
*
* ```ts import.meta.vitest
* import { Channel, Effect, Option, PubSub } from "effect"
*
* interface Order {
*   readonly id: string
*   readonly customerId: string
*   readonly items: ReadonlyArray<string>
*   readonly total: number
*   readonly submittedAt: number
* }
*
* const orderBatchProcessor = Effect.gen(function*() {
*   const orderPubSub = yield* PubSub.unbounded<Order>({ replay: 1 })
*
*   // Create a channel that processes orders in batches
*   const orderChannel = Channel.fromPubSubArray(orderPubSub)
*
*   // Transform to process each batch of orders
*   const processedChannel = Channel.map(orderChannel, (orderBatch) => {
*     const totalRevenue = orderBatch.reduce((sum, order) => sum + order.total, 0)
*     const customerCount = new Set(orderBatch.map((order) =>
*       order.customerId
*     )).size
*
*     return {
*       batchSize: orderBatch.length,
*       totalRevenue,
*       uniqueCustomers: customerCount,
*       firstSubmittedAt: Math.min(...orderBatch.map((order) => order.submittedAt)),
*       orders: orderBatch
*     }
*   })
*
*   yield* PubSub.publish(orderPubSub, {
*     id: "1", customerId: "a", items: ["book"], total: 10, submittedAt: 1
*   })
*   return processedChannel
* })
* const order = Effect.scoped(Effect.flatMap(orderBatchProcessor, Channel.runHead))
* const result = await Effect.runPromise(order)
* Option.map(result, (batch) => [batch.batchSize, batch.totalRevenue, batch.uniqueCustomers]) // => Option.some([1, 10, 1])
* ```
*
* **Example** (Processing PubSub logs in batches)
*
* ```ts import.meta.vitest
* import { Channel, Effect, Option, PubSub } from "effect"
*
* interface LogEntry {
*   readonly timestamp: number
*   readonly level: "info" | "warn" | "error"
*   readonly message: string
*   readonly source: string
* }
*
* const logAggregator = Effect.gen(function*() {
*   const logPubSub = yield* PubSub.unbounded<LogEntry>({ replay: 1 })
*
*   // Create a channel that collects logs in batches
*   const logChannel = Channel.fromPubSubArray(logPubSub)
*
*   // Transform to analyze log batches
*   const analysisChannel = Channel.map(logChannel, (logBatch) => {
*     const errorCount = logBatch.filter((log) => log.level === "error").length
*     const warnCount = logBatch.filter((log) => log.level === "warn").length
*     const infoCount = logBatch.filter((log) => log.level === "info").length
*
*     const timeRange = {
*       start: Math.min(...logBatch.map((log) => log.timestamp)),
*       end: Math.max(...logBatch.map((log) => log.timestamp))
*     }
*
*     return {
*       batchId: `${timeRange.start}-${timeRange.end}`,
*       totalEntries: logBatch.length,
*       errorCount,
*       warnCount,
*       infoCount,
*       timeRange,
*       sources: [...new Set(logBatch.map((log) => log.source))]
*     }
*   })
*
*   yield* PubSub.publish(logPubSub, {
*     timestamp: 1,
*     level: "info",
*     message: "ready",
*     source: "app"
*   } satisfies LogEntry)
*   return analysisChannel
* })
* const log = Effect.scoped(Effect.flatMap(logAggregator, Channel.runHead))
* const result = await Effect.runPromise(log)
* Option.map(result, (batch) => [batch.batchId, batch.totalEntries, batch.infoCount]) // => Option.some(["1-1", 1, 1])
* ```
*
* @category constructors
* @since 4.0.0
*/
const fromPubSubArray = (pubsub) => unwrap$1(map$2(subscribe(pubsub), fromSubscriptionArray));
/**
* Creates a channel from a lazily supplied Web `ReadableStream`.
*
* **Example** (Reading from a Web stream)
*
* ```ts import.meta.vitest
* import { Channel, Effect } from "effect"
*
* const channel = Channel.fromReadableStream({
*   evaluate: () => new ReadableStream({
*     start(controller) {
*       controller.enqueue(1)
*       controller.close()
*     }
*   }),
*   onError: (cause) => new Error(String(cause))
* })
*
* await Effect.runPromise(Channel.runCollect(channel)) // => [[1]]
* ```
*
* @category constructors
* @since 4.0.0
*/
const fromReadableStream$1 = (options) => fromTransform((_, scope) => readableStreamToPullUnsafe({
	scope,
	readable: options.evaluate(),
	onError: options.onError,
	releaseLockOnEnd: options.releaseLockOnEnd
}));
const readableStreamToPullUnsafe = (options) => {
	const reader = options.readable.getReader();
	const exit = options.exit ?? make$10(void 0);
	const pull = suspend$2(() => {
		if (exit.current) return exit.current;
		return matchCauseEffect(tryPromise({
			try: () => reader.read(),
			catch: options.onError
		}), {
			onFailure: (cause) => exit.current ?? failCause$2(cause),
			onSuccess: ({ done, value }) => {
				if (exit.current) return exit.current;
				return done ? done$1() : succeed$3(of(value));
			}
		});
	});
	return as(addFinalizer(options.scope, options.releaseLockOnEnd ? sync(() => reader.releaseLock()) : promise(() => reader.cancel().catch(constVoid))), pull);
};
/**
* Maps the output of this channel using the specified function.
*
* **Example** (Mapping channel output)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect } from "effect"
*
* class TransformError extends Data.TaggedError("TransformError")<{
*   readonly reason: string
* }> {}
*
* // Basic mapping of channel values
* const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
* const doubledChannel = Channel.map(numbersChannel, (n) => n * 2)
* Effect.runSync(Channel.runCollect(doubledChannel)) // => [2, 4, 6, 8, 10]
*
* // Transform string data
* const wordsChannel = Channel.fromIterable(["hello", "world", "effect"])
* const upperCaseChannel = Channel.map(wordsChannel, (word) => word.toUpperCase())
* Effect.runSync(Channel.runCollect(upperCaseChannel)) // => ["HELLO", "WORLD", "EFFECT"]
*
* // Complex object transformation
* type User = { id: number; name: string }
* type UserDisplay = { displayName: string; isActive: boolean }
*
* const usersChannel = Channel.fromIterable([
*   { id: 1, name: "Alice" },
*   { id: 2, name: "Bob" }
* ])
* const displayChannel = Channel.map(usersChannel, (user): UserDisplay => ({
*   displayName: `User: ${user.name}`,
*   isActive: true
* }))
* Effect.runSync(Channel.runCollect(displayChannel)) // => [{ displayName: "User: Alice", isActive: true }, { displayName: "User: Bob", isActive: true }]
* ```
*
* @category sequencing
* @since 2.0.0
*/
const map$1 = /*#__PURE__*/ dual(2, (self, f) => transformPull(self, (pull) => sync(() => {
	let i = 0;
	return map$2(pull, (o) => f(o, i++));
})));
const concurrencyIsSequential = (concurrency) => concurrency === void 0 || concurrency !== "unbounded" && concurrency <= 1;
/**
* Maps each output element with an effectful function, preserving the source
* channel's done value.
*
* **When to use**
*
* Use when transforming each channel output needs an Effect, service
* dependency, failure channel, or configured concurrency.
*
* **Details**
*
* The mapping function receives the output element and its zero-based index.
* By default elements are mapped sequentially. Use `options.concurrency` to
* map multiple elements concurrently, and `options.unordered` to allow
* concurrently mapped outputs to be emitted as soon as they complete.
*
* **Example** (Mapping channel output with effects)
*
* ```ts import.meta.vitest
* import { Channel, Effect } from "effect"
*
* const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
* const processedChannel = Channel.mapEffect(
*   numbersChannel,
*   (n) => Effect.succeed(n * n)
* )
* await Effect.runPromise(Channel.runCollect(processedChannel)) // => [1, 4, 9, 16, 25]
* ```
*
* @category sequencing
* @since 2.0.0
*/
const mapEffect$1 = /*#__PURE__*/ dual((args) => isChannel(args[0]), (self, f, options) => concurrencyIsSequential(options?.concurrency) ? mapEffectSequential(self, f) : mapEffectConcurrent(self, f, options));
const mapEffectSequential = (self, f) => fromTransform((upstream, scope) => {
	let i = 0;
	return map$2(toTransform(self)(upstream, scope), flatMap((o) => f(o, i++)));
});
const mapEffectConcurrent = (self, f, options) => fromTransformBracket(fnUntraced(function* (upstream, scope, forkedScope) {
	let i = 0;
	const pull = yield* toTransform(self)(upstream, scope);
	const concurrencyN = options.concurrency === "unbounded" ? Number.MAX_SAFE_INTEGER : options.concurrency;
	const queue = yield* bounded(0);
	yield* addFinalizer(forkedScope, shutdown(queue));
	const runFork = runForkWith(yield* context());
	const trackFiber = runIn(forkedScope);
	if (options.unordered) {
		const semaphore = makeUnsafe(concurrencyN);
		const release = constant(semaphore.release(1));
		const handle = matchCauseEffect({
			onFailure: (cause) => flatMap(failCause$1(queue, cause), release),
			onSuccess: (value) => flatMap(offer(queue, value), release)
		});
		yield* semaphore.take(1).pipe(flatMap(() => pull), flatMap((value) => {
			const index = i++;
			trackFiber(runFork(handle(suspend$2(() => f(value, index)))));
			return void_;
		}), forever({ disableYield: true }), catchCause$1((cause) => semaphore.withPermits(concurrencyN - 1)(failCause$1(queue, cause))), forkIn(forkedScope));
	} else {
		const effects = yield* bounded(concurrencyN - 2);
		yield* addFinalizer(forkedScope, shutdown(effects));
		yield* take(effects).pipe(flatten, flatMap((value) => offer(queue, value)), forever({ disableYield: true }), catchCause$1((cause) => failCause$1(queue, cause)), forkIn(forkedScope));
		let errorCause;
		const onExit = (exit) => {
			if (exit._tag === "Success") return;
			errorCause = exit.cause;
			failCauseUnsafe(queue, exit.cause);
		};
		yield* pull.pipe(flatMap((value) => {
			if (errorCause) return failCause$2(errorCause);
			const index = i++;
			const fiber = runFork(suspend$2(() => f(value, index)));
			trackFiber(fiber);
			fiber.addObserver(onExit);
			return offer(effects, join(fiber));
		}), forever({ disableYield: true }), catchCause$1((cause) => offer(effects, failCause$4(cause)).pipe(andThen(failCause$1(effects, cause)))), forkIn(forkedScope));
	}
	return take(queue);
}));
/**
* Flattens a channel that outputs arrays into a channel that outputs individual elements.
*
* **Example** (Flattening arrays of channel output)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect } from "effect"
*
* class FlattenError extends Data.TaggedError("FlattenError")<{
*   readonly message: string
* }> {}
*
* // Create a channel that outputs arrays
* const arrayChannel = Channel.fromIterable([
*   [1, 2, 3],
*   [4, 5],
*   [6, 7, 8, 9]
* ])
*
* // Flatten the arrays into individual elements
* const flattenedChannel = Channel.flattenArray(arrayChannel)
*
* Effect.runSync(Channel.runCollect(flattenedChannel)) // => [1, 2, 3, 4, 5, 6, 7, 8, 9]
* ```
*
* @category transforming
* @since 4.0.0
*/
const flattenArray = (self) => transformPull(self, (pull) => {
	let array;
	let index = 0;
	const pump = suspend$2(function loop() {
		if (array === void 0) return flatMap(pull, (array_) => {
			switch (array_.length) {
				case 0: return loop();
				case 1: return succeed$3(array_[0]);
				default:
					array = array_;
					return succeed$3(array_[index++]);
			}
		});
		const next = array[index++];
		if (index >= array.length) {
			array = void 0;
			index = 0;
		}
		return succeed$3(next);
	});
	return succeed$3(pump);
});
/**
* Filters arrays of elements emitted by a channel, applying the filter
* to each element within the arrays and only emitting non-empty filtered arrays.
*
* **Example** (Filtering array output)
*
* ```ts import.meta.vitest
* import { Array, Channel, Effect } from "effect"
*
* const nonEmptyArrayPredicate = Array.isReadonlyArrayNonEmpty
*
* // Create a channel that outputs arrays of mixed data
* const arrayChannel = Channel.fromIterable([
*   Array.make(1, 2, 3, 4, 5),
*   Array.make(6, 7, 8, 9, 10),
*   Array.make(11, 12, 13, 14, 15)
* ]).pipe(Channel.filter(nonEmptyArrayPredicate))
*
* // Filter arrays to keep only even numbers
* const evenArraysChannel = Channel.filterArray(arrayChannel, (n) => n % 2 === 0)
* Effect.runSync(Channel.runCollect(evenArraysChannel)) // => [[2, 4], [6, 8, 10], [12, 14]]
* // Note: Only non-empty filtered arrays are emitted
*
* // Arrays that would become empty after filtering are discarded entirely
* const oddChannel = Channel.fromIterable([
*   Array.make(1, 3, 5),
*   Array.make(2, 4),
*   Array.make(7, 9)
* ]).pipe(Channel.filter(nonEmptyArrayPredicate))
* const filteredOddChannel = Channel.filterArray(oddChannel, (n) => n % 2 === 0)
* Effect.runSync(Channel.runCollect(filteredOddChannel)) // => [[2, 4]]
* ```
*
* @category filtering
* @since 4.0.0
*/
const filterArray = /*#__PURE__*/ dual(2, (self, predicate) => transformPull(self, (pull) => succeed$3(flatMap(pull, function loop(arr) {
	const passes = [];
	for (let i = 0; i < arr.length; i++) if (predicate(arr[i])) passes.push(arr[i]);
	return isReadonlyArrayNonEmpty(passes) ? succeed$3(passes) : flatMap(pull, loop);
}))));
/**
* Runs an effect when the channel fails with a typed error, then preserves the
* original channel failure.
*
* **Details**
*
* The effect is not run for normal channel completion. If the observer effect
* fails, that failure can fail the returned channel.
*
* @category error handling
* @since 4.0.0
*/
const tapError$1 = /*#__PURE__*/ dual(2, (self, f) => transformPull(self, (pull) => succeed$3(tapError$2(pull, (err) => isDone(err) ? void_ : asVoid(f(err))))));
/**
* Returns a new channel, which is the merge of this channel and the specified
* channel.
*
* **Example** (Merging channels)
*
* ```ts import.meta.vitest
* import { Channel, Effect } from "effect"
*
* // Create two channels
* const leftChannel = Channel.fromIterable([1, 2, 3])
* const rightChannel = Channel.fromIterable(["a", "b", "c"])
*
* // The default "both" strategy waits for both channels to complete
* const mergedChannel = Channel.merge(leftChannel, rightChannel)
*
* const values = await Effect.runPromise(Channel.runCollect(mergedChannel))
* values.map(String).sort() // => ["1", "2", "3", "a", "b", "c"]
* ```
*
* @category combining
* @since 4.0.0
*/
const merge$1 = /*#__PURE__*/ dual((args) => isChannel(args[0]) && isChannel(args[1]), (left, right, options) => fromTransformBracket(fnUntraced(function* (upstream, _scope, forkedScope) {
	const strategy = options?.haltStrategy ?? "both";
	const queue = yield* bounded(0);
	yield* addFinalizer(forkedScope, shutdown(queue));
	let done = 0;
	function onExit(side, cause) {
		done++;
		if (!isDoneCause(cause)) return failCause$1(queue, cause);
		switch (strategy) {
			case "both": return done === 2 ? failCause$1(queue, cause) : void_;
			case "left":
			case "right": return side === strategy ? failCause$1(queue, cause) : void_;
			case "either": return failCause$1(queue, cause);
		}
	}
	const runSide = (side, channel, scope) => toTransform(channel)(upstream, scope).pipe(flatMap((pull) => pull.pipe(flatMap((value) => offer(queue, value)), forever)), onError((cause) => andThen(close(scope, doneExitFromCause(cause)), onExit(side, cause))), forkIn(forkedScope));
	yield* runSide("left", left, forkUnsafe(forkedScope));
	yield* runSide("right", right, forkUnsafe(forkedScope));
	return take(queue);
})));
/**
* Splits upstream string chunks into lines, recognizing `\n`, `\r\n`, and
* standalone `\r` as line terminators. The behavior matches
* `String.linesIterator` regardless of how the input is chunked.
*
* **Details**
*
* A line terminator at the very end of the stream does **not** produce a
* trailing empty line (consistent with `String.linesIterator`). Conversely,
* if the stream ends without a terminator the final partial line is still
* emitted.
*
* **Example** (Splitting string chunks into lines)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const result = await Effect.runPromise(Stream.runCollect(
*   Stream.splitLines(Stream.make("hel", "lo\r\nwor", "ld\n"))
* ))
* result // => ["hello", "world"]
* ```
*
* @category splitting
* @since 2.0.0
*/
const splitLines$1 = () => fromTransform((upstream, _scope) => sync(() => {
	let stringBuilder = "";
	let midCRLF = false;
	let done = none();
	function splitLinesArray(chunk) {
		const chunkBuilder = [];
		function pushLine(segment) {
			if (stringBuilder.length === 0) chunkBuilder.push(segment);
			else {
				chunkBuilder.push(stringBuilder + segment);
				stringBuilder = "";
			}
		}
		for (let i = 0; i < chunk.length; i++) {
			const str = chunk[i];
			if (str.length !== 0) {
				let from = 0;
				let indexOfCR = str.indexOf("\r");
				let indexOfLF = str.indexOf("\n");
				if (midCRLF) {
					if (indexOfLF === 0) {
						from = 1;
						indexOfLF = str.indexOf("\n", from);
					}
					midCRLF = false;
				}
				while (indexOfCR !== -1 || indexOfLF !== -1) if (indexOfCR === -1 || indexOfLF !== -1 && indexOfLF < indexOfCR) {
					pushLine(str.substring(from, indexOfLF));
					from = indexOfLF + 1;
					indexOfLF = str.indexOf("\n", from);
				} else {
					pushLine(str.substring(from, indexOfCR));
					if (str.length === indexOfCR + 1) {
						midCRLF = true;
						from = str.length;
						indexOfCR = -1;
					} else {
						from = indexOfCR + (indexOfLF === indexOfCR + 1 ? 2 : 1);
						indexOfCR = str.indexOf("\r", from);
						indexOfLF = str.indexOf("\n", from);
					}
				}
				stringBuilder = stringBuilder + str.substring(from);
			}
		}
		return isReadonlyArrayNonEmpty(chunkBuilder) ? chunkBuilder : null;
	}
	const pullOrFlush = suspend$2(() => {
		if (done._tag === "Some") return done$1(done.value);
		return matchEffect(upstream, {
			onSuccess: loop,
			onFailure: failCause$2,
			onDone: (leftover) => {
				done = some(leftover);
				if (stringBuilder.length > 0) {
					const last = stringBuilder;
					stringBuilder = "";
					midCRLF = false;
					return succeed$3([last]);
				}
				return done$1(leftover);
			}
		});
	});
	function loop(chunk) {
		const lines = splitLinesArray(chunk);
		return lines !== null ? succeed$3(lines) : pullOrFlush;
	}
	return pullOrFlush;
}));
/**
* Returns a new channel that pipes the output of this channel into the
* specified channel. The returned channel has the input type of this channel,
* and the output type of the specified channel, terminating with the value of
* the specified channel.
*
* **Example** (Piping one channel into another)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect } from "effect"
*
* class PipeError extends Data.TaggedError("PipeError")<{
*   readonly stage: string
* }> {}
*
* // Create source and transform channels
* const sourceChannel = Channel.fromIterable([1, 2, 3])
* const transformChannel = Channel.map(sourceChannel, (n: number) => n * 2)
*
* // Pipe the source into the transform
* const pipedChannel = Channel.pipeTo(sourceChannel, transformChannel)
*
* Effect.runSync(Channel.runCollect(pipedChannel)) // => [2, 4, 6]
* ```
*
* @category sequencing
* @since 2.0.0
*/
const pipeTo = /*#__PURE__*/ dual(2, (self, that) => fromTransform((upstream, scope) => flatMap(toTransform(self)(upstream, scope), (upstream) => toTransform(that)(upstream, scope))));
/**
* Constructs a `Channel` from a scoped effect that will result in a
* `Channel` if successful.
*
* **Example** (Unwrapping channel effects)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect } from "effect"
*
* class UnwrapError extends Data.TaggedError("UnwrapError")<{
*   readonly reason: string
* }> {}
*
* // Create an effect that produces a channel
* const channelEffect = Effect.succeed(
*   Channel.fromIterable([1, 2, 3])
* )
*
* // Unwrap the effect to get the channel
* const unwrappedChannel = Channel.unwrap(channelEffect)
*
* Effect.runSync(Channel.runCollect(unwrappedChannel)) // => [1, 2, 3]
* ```
*
* @category constructors
* @since 2.0.0
*/
const unwrap$1 = (channel) => fromTransform((upstream, scope) => {
	let pull;
	return succeed$3(suspend$2(() => {
		if (pull) return pull;
		return channel.pipe(provide$1(scope), flatMap((channel) => toTransform(channel)(upstream, scope)), flatMap((pull_) => pull = pull_));
	}));
});
/**
* Returns a channel with an exit-aware finalizer that is guaranteed to run once
* the channel begins execution, whether it succeeds or fails.
*
* **Example** (Running exit finalizers)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect, Exit } from "effect"
*
* class ExitError extends Data.TaggedError("ExitError")<{
*   readonly stage: string
* }> {}
*
* // Create a channel
* const dataChannel = Channel.fromIterable([1, 2, 3])
*
* // Attach exit handler
* const exits: Array<Exit.Exit<void, ExitError>> = []
* const channelWithExit = Channel.onExit(dataChannel, (exit) => {
*   exits.push(exit)
*   return Effect.void
* })
* const observed = [await Effect.runPromise(Channel.runCollect(channelWithExit)), exits] // => [[1, 2, 3], [Exit.void]]
* ```
*
* @category resource management
* @since 4.0.0
*/
const onExit = /*#__PURE__*/ dual(2, (self, finalizer) => fromTransformBracket((upstream, scope, forkedScope) => addFinalizerExit(forkedScope, finalizer).pipe(andThen(toTransform(self)(upstream, scope)))));
/**
* Returns a channel with a finalizer effect that is guaranteed to run once the
* channel begins execution, whether it succeeds or fails.
*
* **Example** (Ensuring cleanup runs)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect } from "effect"
*
* class EnsureError extends Data.TaggedError("EnsureError")<{
*   readonly operation: string
* }> {}
*
* // Create a channel
* const dataChannel = Channel.fromIterable([1, 2, 3])
*
* // Ensure cleanup always runs
* const events: Array<string> = []
* const channelWithCleanup = Channel.ensuring(
*   dataChannel,
*   Effect.sync(() => events.push("cleanup"))
* )
* const observed = [await Effect.runPromise(Channel.runCollect(channelWithCleanup)), events] // => [[1, 2, 3], ["cleanup"]]
* ```
*
* @category resource management
* @since 2.0.0
*/
const ensuring$1 = /*#__PURE__*/ dual(2, (self, finalizer) => onExit(self, (_) => finalizer));
const runWith = (self, f, onHalt) => suspend$2(() => {
	const scope = makeUnsafe$4();
	const makePull = toTransform(self)(done$1(), scope);
	return catchDone(flatMap(makePull, f), onHalt ? onHalt : succeed$3).pipe(onExit$1((exit) => close(scope, exit)));
});
/**
* Runs a channel and discards all output elements, returning only the final result.
*
* **Example** (Draining channel output at runtime)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect } from "effect"
*
* class DrainError extends Data.TaggedError("DrainError")<{
*   readonly stage: string
* }> {}
*
* // Create a channel that outputs elements and completes with a result
* const resultChannel = Channel.fromIterable([1, 2, 3])
* const completedChannel = Channel.concat(resultChannel, Channel.end("completed"))
*
* // Drain all elements and get only the final result
* const drainEffect = Channel.runDrain(completedChannel)
*
* Effect.runSync(drainEffect) // => "completed"
* ```
*
* @category running
* @since 2.0.0
*/
const runDrain$1 = (self) => runWith(self, (pull) => forever(pull, { disableYield: true }));
/**
* Runs a channel and applies an effect to each output element.
*
* **Example** (Running effects for each output)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect } from "effect"
*
* class ForEachError extends Data.TaggedError("ForEachError")<{
*   readonly element: unknown
* }> {}
*
* // Create a channel with numbers
* const numbersChannel = Channel.fromIterable([1, 2, 3])
*
* // Run forEach to process each element
* const processed: Array<number> = []
* const forEachEffect = Channel.runForEach(
*   numbersChannel,
*   (n) => Effect.sync(() => processed.push(n))
* )
*
* await Effect.runPromise(forEachEffect)
* processed // => [1, 2, 3]
* ```
*
* @category running
* @since 4.0.0
*/
const runForEach$1 = /*#__PURE__*/ dual(2, (self, f) => runWith(self, (pull) => forever(flatMap(pull, f), { disableYield: true })));
/**
* Runs a channel and folds over all output elements with an accumulator.
*
* **Example** (Folding channel output)
*
* ```ts import.meta.vitest
* import { Channel, Data, Effect } from "effect"
*
* class FoldError extends Data.TaggedError("FoldError")<{
*   readonly operation: string
* }> {}
*
* // Create a channel with numbers
* const numbersChannel = Channel.fromIterable([1, 2, 3, 4, 5])
*
* // Fold to calculate sum
* const sumEffect = Channel.runFold(numbersChannel, () => 0, (acc, n) => acc + n)
*
* Effect.runSync(sumEffect) // => 15
* ```
*
* @category running
* @since 4.0.0
*/
const runFold$1 = /*#__PURE__*/ dual(3, (self, initial, f) => suspend$2(() => {
	let state = initial();
	return runWith(self, (pull) => whileLoop({
		while: constTrue,
		body: () => pull,
		step: (value) => {
			state = f(state, value);
		}
	}), () => succeed$3(state));
}));
//#endregion
//#region node_modules/effect/dist/internal/stream.js
const TypeId$10 = "~effect/Stream";
const streamVariance = {
	_R: identity,
	_E: identity,
	_A: identity
};
const Stream$1 = function(channel) {
	this.channel = channel;
};
Stream$1.prototype = {
	[TypeId$10]: streamVariance,
	pipe() {
		return pipeArguments(this, arguments);
	}
};
/** @internal */
const fromChannel$1 = (channel) => new Stream$1(channel);
//#endregion
//#region node_modules/effect/dist/Stream.js
/**
* Describes effectful sources that emit values over time.
*
* A `Stream<A, E, R>` can emit many `A` values, fail with `E`, and require
* services `R` while it is being consumed. Streams are useful for data that is
* pulled in steps, such as values from collections, queues, pubsubs, schedules,
* callbacks, async iterables, or platform streams. The APIs here cover the full
* stream lifecycle: create a stream, transform or combine it, control buffering
* and timing, handle failures, and finally consume it.
*
* @since 2.0.0
*/
/**
* Runtime identifier stored on `Stream` values and used by `isStream` to
* recognize them.
*
* **Details**
*
* This marker is part of the runtime representation of `Stream` values. Prefer
* `isStream` when narrowing unknown values.
*
* @see {@link isStream} for the public guard that checks this identifier
*
* @category type IDs
* @since 4.0.0
*/
const TypeId$9 = "~effect/Stream";
/**
* Checks whether a value is a Stream.
*
* **Example** (Checking whether a value is a Stream)
*
* ```ts import.meta.vitest
* import { Stream } from "effect"
*
* Stream.isStream(Stream.make(1, 2, 3)) // => true
* Stream.isStream({ data: [1, 2, 3] }) // => false
* ```
*
* @category guards
* @since 4.0.0
*/
const isStream = (u) => hasProperty(u, TypeId$9);
/**
* Creates a stream from a array-emitting `Channel`.
*
* **Example** (Creating a stream from an array-emitting channel)
*
* ```ts import.meta.vitest
* import { Channel, Effect, Stream } from "effect"
*
* const channel = Channel.succeed([1, 2, 3] as const)
* const stream = Stream.fromChannel(channel)
* await Effect.runPromise(Stream.runCollect(stream)) // => [1, 2, 3]
* ```
*
* @category constructors
* @since 2.0.0
*/
const fromChannel = fromChannel$1;
/**
* Creates a channel from a stream.
*
* **Example** (Converting a stream to a channel)
*
* ```ts import.meta.vitest
* import { Channel, Effect, Stream } from "effect"
*
* const channel = Stream.toChannel(Stream.make(1, 2, 3))
* const values = await Effect.runPromise(Channel.runCollect(channel))
* values.flat() // => [1, 2, 3]
* ```
*
* @category destructors
* @since 2.0.0
*/
const toChannel = (stream) => stream.channel;
/**
* Creates a lazily constructed stream.
*
* **Details**
*
* The stream factory is evaluated each time the stream is run.
*
* **Example** (Creating a lazily constructed stream)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* await Effect.runPromise(Stream.suspend(() => Stream.make(1, 2, 3)).pipe(Stream.runCollect)) // => [1, 2, 3]
* ```
*
* @category constructors
* @since 2.0.0
*/
const suspend = (stream) => fromChannel(suspend$1(() => stream().channel));
/**
* Terminates with the specified error.
*
* **Example** (Failing a stream)
*
* ```ts import.meta.vitest
* import { Effect, Exit, Stream } from "effect"
*
* await Effect.runPromise(Effect.exit(Stream.runCollect(Stream.fail("Uh oh!")))) // => Exit.fail("Uh oh!")
* ```
*
* @category constructors
* @since 2.0.0
*/
const fail = (error) => fromChannel(fail$1(error));
/**
* Creates a stream that pulls values from a `Queue.Dequeue`.
*
* **Details**
*
* The stream emits non-empty batches of queued values and ends when the queue
* fails with `Cause.Done`; other queue failures are propagated.
*
* **Example** (Creating a stream from a queue of values)
*
* ```ts import.meta.vitest
* import { Cause, Effect, Queue, Stream } from "effect"
*
* const program = Effect.gen(function*() {
*   const queue = yield* Queue.unbounded<number, Cause.Done>()
*   yield* Queue.offer(queue, 1)
*   yield* Queue.offer(queue, 2)
*   yield* Queue.offer(queue, 3)
*   yield* Queue.end(queue)
*
*   const stream = Stream.fromQueue(queue)
*   const values = yield* Stream.runCollect(stream)
*   values // => [1, 2, 3]
* })
*
* await Effect.runPromise(program)
* ```
*
* @category constructors
* @since 2.0.0
*/
const fromQueue = (queue) => fromChannel(fromQueueArray(queue));
/**
* Creates a stream from a subscription to a `PubSub`.
*
* **Example** (Creating a stream from a subscription to a PubSub)
*
* ```ts import.meta.vitest
* import { Effect, Fiber, PubSub, Stream } from "effect"
*
* const program = Effect.gen(function*() {
*   const pubsub = yield* PubSub.unbounded<number>({ replay: 3 })
*
*   const fiber = yield* Stream.fromPubSub(pubsub).pipe(
*     Stream.take(3),
*     Stream.runCollect,
*     Effect.forkChild
*   )
*
*   yield* PubSub.publish(pubsub, 1)
*   yield* PubSub.publish(pubsub, 2)
*   yield* PubSub.publish(pubsub, 3)
*
*   const values = yield* Fiber.join(fiber)
*   values // => [1, 2, 3]
* })
*
* await Effect.runPromise(program)
* ```
*
* @category constructors
* @since 2.0.0
*/
const fromPubSub = (pubsub) => fromChannel(fromPubSubArray(pubsub));
/**
* Creates a stream from a lazily supplied Web `ReadableStream`.
*
* **Details**
*
* The stream reads from a `ReadableStreamDefaultReader`, maps read failures
* with `onError`, and closes the reader when the stream finalizes. By default
* the reader is canceled; set `releaseLockOnEnd` to release the lock instead.
*
* **Example** (Creating a stream from a ReadableStream)
*
* ```ts import.meta.vitest
* import { Data, Effect, Stream } from "effect"
*
* class StreamError extends Data.TaggedError("StreamError")<{ readonly cause: unknown }> {}
*
* const readableStream = new ReadableStream({
*   start(controller) {
*     controller.enqueue(1)
*     controller.enqueue(2)
*     controller.enqueue(3)
*     controller.close()
*   }
* })
*
* const program = Effect.gen(function*() {
*   const stream = Stream.fromReadableStream({
*     evaluate: () => readableStream,
*     onError: (cause) => new StreamError({ cause })
*   })
*   const values = yield* Stream.runCollect(stream)
*   values // => [1, 2, 3]
* })
*
* await Effect.runPromise(program)
* ```
*
* @category constructors
* @since 2.0.0
*/
const fromReadableStream = (options) => fromChannel(fromReadableStream$1(options));
/**
* Transforms the elements of this stream using the supplied function.
*
* **Example** (Mapping stream values)
*
* ```ts import.meta.vitest
* import { Effect, Option, Stream } from "effect"
*
* const stream = Stream.fromArray([1, 2, 3]).pipe(Stream.map((n, i) => n + i))
* await Effect.runPromise(Stream.runCollect(stream)) // => [1, 3, 5]
* ```
*
* @category mapping
* @since 2.0.0
*/
const map = /*#__PURE__*/ dual(2, (self, f) => suspend(() => {
	let i = 0;
	return fromChannel(map$1(self.channel, map$5((o) => f(o, i++))));
}));
/**
* Maps over elements of the stream with the specified effectful function.
*
* **When to use**
*
* Use when each stream element transformation needs an Effect, service
* dependency, failure channel, or configured concurrency.
*
* **Example** (Effectfully mapping stream values)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const events: Array<string> = []
* const stream = Stream.make(1, 2, 3)
*
* const mappedStream = stream.pipe(
*   Stream.mapEffect((n) =>
*     Effect.sync(() => {
*       events.push(`Processing: ${n}`)
*       return n * 2
*     })
*   )
* )
*
* const program = Effect.gen(function*() {
*   const result = yield* Stream.runCollect(mappedStream)
*   result // => [2, 4, 6]
* })
*
* await Effect.runPromise(program)
* events // => ["Processing: 1", "Processing: 2", "Processing: 3"]
* ```
*
* @category mapping
* @since 2.0.0
*/
const mapEffect = /*#__PURE__*/ dual((args) => isStream(args[0]), (self, f, options) => self.channel.pipe(flattenArray, mapEffect$1(f, options), map$1(of), fromChannel));
/**
* Merges two streams, emitting elements from both as they arrive.
*
* **Details**
*
* By default, the merged stream ends when both streams end. Use
* `haltStrategy` to change the termination behavior.
*
* **Example** (Merging stream values)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const fast = Stream.make(1, 2, 3)
* const slow = Stream.fromEffect(Effect.delay(Effect.succeed(4), "50 millis"))
*
* const program = Effect.gen(function*() {
*   const result = yield* Stream.runCollect(Stream.merge(fast, slow))
*   result // => [ 1, 2, 3, 4 ]
* })
*
* await Effect.runPromise(program)
* ```
*
* @category merging
* @since 2.0.0
*/
const merge = /*#__PURE__*/ dual((args) => isStream(args[0]) && isStream(args[1]), (self, that, options) => fromChannel(merge$1(toChannel(self), toChannel(that), options)));
/**
* Filters a stream to the elements that satisfy a predicate.
*
* **Example** (Filtering stream values)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const program = Effect.gen(function*() {
*   const stream = Stream.make(1, 2, 3, 4).pipe(
*     Stream.filter((n) => n % 2 === 0)
*   )
*   const values = yield* Stream.runCollect(stream)
*   values // => [ 2, 4 ]
* })
*
* await Effect.runPromise(program)
* ```
*
* @category filtering
* @since 2.0.0
*/
const filter = /*#__PURE__*/ dual(2, (self, predicate) => fromChannel(filterArray(toChannel(self), predicate)));
/**
* Peeks at errors effectfully without changing the stream unless the tap fails.
*
* **Example** (Effectfully peeking at errors)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const errors: Array<string> = []
* const stream = Stream.make(1, 2).pipe(
*   Stream.concat(Stream.fail("boom")),
*   Stream.tapError((error) => Effect.sync(() => errors.push(error))),
*   Stream.catch(() => Stream.make(999))
* )
*
* const program = Effect.gen(function*() {
*   const values = yield* Stream.runCollect(stream)
*   values // => [1, 2, 999]
* })
*
* await Effect.runPromise(program)
* errors // => ["boom"]
* ```
*
* @category error handling
* @since 2.0.0
*/
const tapError = /*#__PURE__*/ dual(2, (self, f) => self.channel.pipe(tapError$1(f), fromChannel));
/**
* Decodes Uint8Array chunks into strings using TextDecoder with an optional encoding.
*
* **Example** (Decoding Uint8Array chunks into strings using TextDecoder with an optional encoding)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const encoder = new TextEncoder()
* const stream = Stream.make(
*   encoder.encode("Hello"),
*   encoder.encode(" World")
* )
*
* const program = Effect.gen(function*() {
*   const decoded = yield* stream.pipe(
*     Stream.decodeText,
*     Stream.runCollect
*   )
*   decoded // => [ 'Hello', ' World' ]
* })
*
* await Effect.runPromise(program)
* ```
*
* @category text
* @since 2.0.0
*/
const decodeText = /*#__PURE__*/ dual((args) => isStream(args[0]), (self, options) => suspend(() => {
	const decoder = new TextDecoder(options?.encoding);
	return map(self, (chunk) => decoder.decode(chunk, { stream: true }));
}));
/**
* Encodes a stream of strings into UTF-8 `Uint8Array` chunks.
*
* **Example** (Encoding a stream of strings into UTF-8 Uint8Array chunks)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const stream = Stream.make("Hello", " ", "World")
* const program = Effect.gen(function*() {
*   const encoded = Stream.encodeText(stream)
*   const chunks = yield* Stream.runCollect(encoded)
*   const bytes = chunks.map((chunk) => [...chunk])
*   bytes // => [ [ 72, 101, 108, 108, 111 ], [ 32 ], [ 87, 111, 114, 108, 100 ] ]
* })
*
* await Effect.runPromise(program)
* ```
*
* @category text
* @since 2.0.0
*/
const encodeText$1 = (self) => suspend(() => {
	const encoder = new TextEncoder();
	return map(self, (chunk) => encoder.encode(chunk));
});
/**
* Splits a stream of strings into lines, handling `\n`, `\r`, and `\r\n` delimiters across chunks.
*
* **Example** (Splitting streamed text into lines)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* await Effect.runPromise(Effect.gen(function* () {
*   const lines = yield* Stream.runCollect(
*     Stream.make("a\nb\r\n", "c\n").pipe(Stream.splitLines)
*   )
*   lines // => [ 'a', 'b', 'c' ]
* }))
* ```
*
* @category text
* @since 2.0.0
*/
const splitLines = (self) => self.channel.pipe(pipeTo(splitLines$1()), fromChannel);
/**
* Executes the provided finalizer after this stream's finalizers run.
*
* **Example** (Ensuring finalization)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const events: Array<string> = []
* const stream = Stream.fromArray([1, 2]).pipe(
*   Stream.ensuring(Effect.sync(() => events.push("cleanup")))
* )
*
* const program = Effect.gen(function*() {
*   const collected = yield* Stream.runCollect(stream)
*   collected // => [1, 2]
* })
*
* await Effect.runPromise(program)
* events // => ["cleanup"]
* ```
*
* @category resource management
* @since 2.0.0
*/
const ensuring = /*#__PURE__*/ dual(2, (self, finalizer) => fromChannel(ensuring$1(self.channel, finalizer)));
/**
* Runs the stream and folds elements using a pure reducer.
*
* **Example** (Folding stream values)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const program = Effect.gen(function*() {
*   const total = yield* Stream.runFold(
*     Stream.make(1, 2, 3),
*     () => 0,
*     (acc, n) => acc + n
*   )
*   total // => 6
* })
*
* await Effect.runPromise(program)
* ```
*
* @category destructors
* @since 2.0.0
*/
const runFold = /*#__PURE__*/ dual(3, (self, initial, f) => runFold$1(self.channel, initial, (acc, arr) => {
	for (let i = 0; i < arr.length; i++) acc = f(acc, arr[i]);
	return acc;
}));
/**
* Runs the provided effectful callback for each element of the stream.
*
* **Example** (Running an effect for each value)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const stream = Stream.make(1, 2, 3)
* const values: Array<string> = []
*
* const program = Effect.gen(function*() {
*   yield* Stream.runForEach(stream, (n) => Effect.sync(() => values.push(`Processing: ${n}`)))
* })
*
* await Effect.runPromise(program)
* values // => ["Processing: 1", "Processing: 2", "Processing: 3"]
* ```
*
* @category destructors
* @since 2.0.0
*/
const runForEach = /*#__PURE__*/ dual(2, (self, f) => runForEach$1(self.channel, (arr) => {
	let i = 0;
	return whileLoop({
		while: () => i < arr.length,
		body: () => f(arr[i++]),
		step: constVoid
	});
}));
/**
* Consumes the stream in chunks, passing each non-empty array to the callback.
*
* **Example** (Consuming stream chunks)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const stream = Stream.make(1, 2, 3, 4, 5)
* const chunks: Array<string> = []
* const program = Effect.gen(function*() {
*   yield* Stream.runForEachArray(
*     stream,
*     (chunk) => Effect.sync(() => chunks.push(chunk.join(", ")))
*   )
* })
*
* await Effect.runPromise(program)
* chunks // => ["1, 2, 3, 4, 5"]
* ```
*
* @category destructors
* @since 4.0.0
*/
const runForEachArray = /*#__PURE__*/ dual(2, (self, f) => runForEach$1(self.channel, f));
/**
* Runs the stream for its effects, discarding emitted elements.
*
* **Example** (Draining a stream run)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const values: Array<number> = []
* const program = Effect.gen(function*() {
*   const stream = Stream.make(1, 2, 3).pipe(
*     Stream.mapEffect((n) => Effect.sync(() => values.push(n)))
*   )
*
*   yield* Stream.runDrain(stream)
* })
*
* await Effect.runPromise(program)
* values // => [1, 2, 3]
* ```
*
* @category destructors
* @since 2.0.0
*/
const runDrain = (self) => runDrain$1(self.channel);
/**
* Converts the stream to a `ReadableStream` using the provided services.
*
* **When to use**
*
* Use when bridging to Web Streams and you already have the `Context` required
* to run the stream outside an `Effect`.
*
* **Details**
*
* See https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream.
*
* **Example** (Converting to a ReadableStream with services)
*
* ```ts import.meta.vitest
* import { Context, Stream } from "effect"
*
* const stream = Stream.make(1, 2, 3, 4, 5)
* const readableStream = Stream.toReadableStreamWith(stream, Context.empty())
* const values = await Array.fromAsync(readableStream)
* values // => [ 1, 2, 3, 4, 5 ]
* ```
*
* @category destructors
* @since 4.0.0
*/
const toReadableStreamWith = /*#__PURE__*/ dual((args) => isStream(args[0]), (self, context, options) => {
	let currentResolve = void 0;
	let fiber = void 0;
	const latch = makeUnsafe$1(false);
	return new ReadableStream({
		start(controller) {
			fiber = runFork(provideContext(runForEachArray(self, (chunk) => latch.whenOpen(sync(() => {
				latch.closeUnsafe();
				for (let i = 0; i < chunk.length; i++) controller.enqueue(chunk[i]);
				currentResolve();
				currentResolve = void 0;
			}))), context));
			fiber.addObserver((exit) => {
				if (exit._tag === "Failure") controller.error(squash(exit.cause));
				else controller.close();
			});
		},
		pull() {
			return new Promise((resolve) => {
				currentResolve = resolve;
				latch.openUnsafe();
			});
		},
		cancel() {
			if (!fiber) return;
			return runPromise(asVoid(interrupt(fiber)));
		}
	}, options?.strategy);
});
/**
* Creates an Effect that builds a ReadableStream from the stream.
*
* **When to use**
*
* Use when bridging to Web Streams from inside an `Effect` so the required
* services can be captured from the current context.
*
* **Details**
*
* See https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream.
*
* **Example** (Creating a ReadableStream effect)
*
* ```ts import.meta.vitest
* import { Effect, Stream } from "effect"
*
* const stream = Stream.make(1, 2, 3, 4, 5)
*
* const effect = Effect.gen(function*() {
*   const readableStream = yield* Stream.toReadableStreamEffect(stream)
*   readableStream instanceof ReadableStream // => true
* })
*
* await Effect.runPromise(effect)
* ```
*
* @category destructors
* @since 2.0.0
*/
const toReadableStreamEffect = /*#__PURE__*/ dual((args) => isStream(args[0]), (self, options) => map$2(context(), (context) => toReadableStreamWith(self, context, options)));
//#endregion
//#region node_modules/effect/dist/SubscriptionRef.js
/**
* Stores mutable state and publishes changes as a stream.
*
* A `SubscriptionRef<A>` stores the latest value, publishes the initial value,
* and publishes every committed update so subscribers can observe state over
* time. Updates are serialized so only one change is applied at a time. This
* module includes constructors, current-value reads, the `changes` stream,
* writes, updates, partial updates, and effectful update helpers.
*
* @since 2.0.0
*/
const TypeId$8 = "~effect/SubscriptionRef";
const Proto$7 = {
	...PipeInspectableProto,
	[TypeId$8]: { _A: identity },
	toJSON() {
		return {
			_id: "SubscriptionRef",
			value: this.value
		};
	}
};
/**
* Constructs a new `SubscriptionRef` from an initial value.
*
* **When to use**
*
* Use to create a `SubscriptionRef` when consumers need to read the latest
* value and subscribe to every update.
*
* **Details**
*
* The initial value is published during construction, so `changes` starts new
* subscribers with that value before future updates.
*
* @see {@link changes} for streaming the current value and subsequent updates
* @see {@link set} for replacing the value and notifying subscribers
*
* @category constructors
* @since 2.0.0
*/
const make$6 = (value) => map$2(unbounded$1({ replay: 1 }), (pubsub) => {
	const self = Object.create(Proto$7);
	self.semaphore = makeUnsafe(1);
	self.value = value;
	self.pubsub = pubsub;
	publishUnsafe(self.pubsub, value);
	return self;
});
/**
* Creates a stream that emits the current value and all subsequent changes to
* the `SubscriptionRef`.
*
* **Details**
*
* The stream will first emit the current value, then emit all future changes
* as they occur.
*
* **Example** (Streaming changes)
*
* ```ts import.meta.vitest
* import { Deferred, Effect, Fiber, Stream, SubscriptionRef } from "effect"
*
* const program = Effect.gen(function*() {
*   const ref = yield* SubscriptionRef.make(0)
*   const ready = yield* Deferred.make<void>()
*
*   const fiber = yield* SubscriptionRef.changes(ref).pipe(
*     Stream.tap(() => Deferred.succeed(ready, void 0)),
*     Stream.take(3),
*     Stream.runCollect,
*     Effect.forkChild
*   )
*
*   yield* Deferred.await(ready)
*   yield* SubscriptionRef.set(ref, 1)
*   yield* SubscriptionRef.set(ref, 2)
*
*   const values = yield* Fiber.join(fiber)
*   return Array.from(values)
* })
*
* await Effect.runPromise(program) // => [0, 1, 2]
* ```
*
* @category subscriptions
* @since 4.0.0
*/
const changes = (self) => fromPubSub(self.pubsub);
const setUnsafe = (self, value) => {
	self.value = value;
	publishUnsafe(self.pubsub, value);
};
/**
* Updates the value of the `SubscriptionRef` with the result of applying a
* function, notifying subscribers of the change.
*
* **Example** (Updating a value)
*
* ```ts import.meta.vitest
* import { Effect, SubscriptionRef } from "effect"
*
* const program = Effect.gen(function*() {
*   const ref = yield* SubscriptionRef.make(10)
*
*   yield* SubscriptionRef.update(ref, (n) => n * 2)
*
*   return yield* SubscriptionRef.get(ref)
* })
*
* await Effect.runPromise(program) // => 20
* ```
*
* @category mutations
* @since 2.0.0
*/
const update = /*#__PURE__*/ dual(2, (self, update) => self.semaphore.withPermit(sync(() => setUnsafe(self, update(self.value)))));
//#endregion
//#region node_modules/effect/dist/http/HttpBody.js
const TypeId$7 = "~effect/http/HttpBody";
var Proto$6 = class {
	[TypeId$7];
	constructor() {
		this[TypeId$7] = TypeId$7;
	}
	[NodeInspectSymbol]() {
		return this.toJSON();
	}
	toString() {
		return format$2(this, { ignoreToString: true });
	}
};
/**
* HTTP body variant representing the absence of request content.
*
* @stability unstable
* @category models
* @since 4.0.0
*/
var Empty = class extends Proto$6 {
	_tag = "Empty";
	toJSON() {
		return {
			_id: "effect/HttpBody",
			_tag: "Empty"
		};
	}
};
/**
* Provides the singleton empty HTTP body.
*
* **When to use**
*
* Use when you need an HTTP body value that represents no body content.
*
* @stability unstable
* @category constants
* @since 4.0.0
*/
const empty$1 = /*#__PURE__*/ new Empty();
/**
* HTTP body variant backed by a `Uint8Array`.
*
* **Details**
*
* It stores the bytes, content type, and byte length.
*
* @stability unstable
* @category models
* @since 4.0.0
*/
var Uint8Array$1 = class extends Proto$6 {
	_tag = "Uint8Array";
	contentType;
	contentLength;
	/** Original text retained for adapters that can skip encoding. */
	text;
	_body;
	constructor(body, contentType, contentLength, text) {
		super();
		this._body = body;
		this.text = text;
		this.contentType = contentType;
		this.contentLength = contentLength;
	}
	get body() {
		return this._body ??= encodeText(this.text);
	}
	toJSON() {
		return {
			_id: "effect/HttpBody",
			_tag: "Uint8Array",
			body: this.contentType.startsWith("text/") || this.contentType.endsWith("json") ? new TextDecoder().decode(this.body) : `Uint8Array(${this.body.length})`,
			contentType: this.contentType,
			contentLength: this.contentLength
		};
	}
};
const encoder$1 = /*#__PURE__*/ new TextEncoder();
const buffer = globalThis.Buffer;
const encodeText = buffer !== void 0 ? (body) => buffer.from(body, "utf8") : (body) => encoder$1.encode(body);
/**
* Creates a UTF-8 encoded text HTTP body.
*
* **Details**
*
* The content type defaults to `text/plain`. Text bodies are encoded lazily.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const text$1 = (body, contentType) => {
	if (typeof body !== "string") body = body === void 0 ? "" : String(body);
	if (buffer !== void 0) return new Uint8Array$1(void 0, contentType ?? "text/plain", buffer.byteLength(body, "utf8"), body);
	const bytes = encoder$1.encode(body);
	return new Uint8Array$1(bytes, contentType ?? "text/plain", bytes.length, body);
};
/**
* Creates a JSON HTTP body using `JSON.stringify`, throwing if serialization fails.
*
* **Details**
*
* The content type defaults to `application/json`.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const jsonUnsafe$1 = (body, contentType) => text$1(JSON.stringify(body), contentType ?? "application/json");
/**
* Creates an `application/x-www-form-urlencoded` HTTP body from `UrlParams`.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const urlParams = (urlParams, contentType) => text$1(toString(fromInput(urlParams)), contentType ?? "application/x-www-form-urlencoded");
/**
* HTTP body variant backed by a stream of `Uint8Array` chunks.
*
* @stability unstable
* @category models
* @since 4.0.0
*/
var Stream = class extends Proto$6 {
	_tag = "Stream";
	stream;
	contentType;
	contentLength;
	constructor(stream, contentType, contentLength) {
		super();
		this.stream = stream;
		this.contentType = contentType;
		this.contentLength = contentLength;
	}
	toJSON() {
		return {
			_id: "effect/HttpBody",
			_tag: "Stream",
			contentType: this.contentType,
			contentLength: this.contentLength
		};
	}
};
/**
* Creates a streaming HTTP body from a stream of byte chunks.
*
* **Details**
*
* The content type defaults to `application/octet-stream`; content length is optional.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const stream$1 = (body, contentType, contentLength) => new Stream(body, contentType ?? "application/octet-stream", contentLength);
//#endregion
//#region node_modules/effect/dist/http/HttpClientError.js
/**
* Typed failure model for Effect HTTP client operations.
*
* HTTP clients wrap request construction, transport, status-code validation, and
* response decoding failures in `HttpClientError`. The wrapper keeps the failed
* request and the specific failure reason together, so callers can handle client
* failures uniformly while still matching on the reason `_tag` for retry
* policy, logging, metrics, and user-facing messages.
*
* @stability unstable
* @since 4.0.0
*/
const TypeId$6 = "~effect/http/HttpClientError";
/**
* Returns `true` when a value is an `HttpClientError`.
*
* @stability unstable
* @category guards
* @since 4.0.0
*/
const isHttpClientError = (u) => hasProperty(u, TypeId$6);
/**
* Error wrapper for HTTP client failures, exposing the failed request and the optional response through its `reason`.
*
* @stability unstable
* @category errors
* @since 4.0.0
*/
var HttpClientError = class extends (/*#__PURE__*/ TaggedError$1("HttpClientError")) {
	constructor(props) {
		if ("cause" in props.reason) super({
			...props,
			cause: props.reason.cause
		});
		else super(props);
	}
	/**
	* Marks this value as an HTTP client error for runtime guards.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	[TypeId$6] = TypeId$6;
	/**
	* HTTP request associated with the client failure.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get request() {
		return this.reason.request;
	}
	/**
	* HTTP response associated with the client failure, when one was received.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get response() {
		return "response" in this.reason ? this.reason.response : void 0;
	}
	get message() {
		return this.reason.message;
	}
};
const formatReason = (tag) => tag.endsWith("Error") ? tag.slice(0, -5) : tag;
const formatMessage = (reason, description, info) => description ? `${reason}: ${description} (${info})` : `${reason} error (${info})`;
/**
* Error describing transport-level failures that occur while sending an HTTP request.
*
* @stability unstable
* @category errors
* @since 4.0.0
*/
var TransportError = class extends (/*#__PURE__*/ TaggedError$1("TransportError")) {
	/**
	* Formats the request method and URL for transport error messages.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get methodAndUrl() {
		return `${this.request.method} ${this.request.url}`;
	}
	/**
	* Builds the transport error message from the optional description and request details.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get message() {
		return formatMessage(formatReason(this._tag), this.description, this.methodAndUrl);
	}
};
/**
* Error describing failures while constructing a URL from an HTTP client request.
*
* @stability unstable
* @category errors
* @since 4.0.0
*/
var InvalidUrlError = class extends (/*#__PURE__*/ TaggedError$1("InvalidUrlError")) {
	/**
	* Formats the request method and URL for invalid URL error messages.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get methodAndUrl() {
		return `${this.request.method} ${this.request.url}`;
	}
	/**
	* Builds the invalid URL error message from the optional description and request details.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get message() {
		return formatMessage(formatReason(this._tag), this.description, this.methodAndUrl);
	}
};
/**
* Response error for HTTP responses rejected because of their status code.
*
* @stability unstable
* @category errors
* @since 4.0.0
*/
var StatusCodeError = class extends (/*#__PURE__*/ TaggedError$1("StatusCodeError")) {
	/**
	* Formats the request method and URL for status code error messages.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get methodAndUrl() {
		return `${this.request.method} ${this.request.url}`;
	}
	/**
	* Builds the status code error message from the response status, optional description, and request details.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get message() {
		const info = `${this.response.status} ${this.methodAndUrl}`;
		return formatMessage(formatReason(this._tag), this.description, info);
	}
};
/**
* Response error for failures while decoding an HTTP response body.
*
* @stability unstable
* @category errors
* @since 4.0.0
*/
var DecodeError = class extends (/*#__PURE__*/ TaggedError$1("DecodeError")) {
	/**
	* Formats the request method and URL for response decoding error messages.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get methodAndUrl() {
		return `${this.request.method} ${this.request.url}`;
	}
	/**
	* Builds the response decoding error message from the response status, optional description, and request details.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get message() {
		const info = `${this.response.status} ${this.methodAndUrl}`;
		return formatMessage(formatReason(this._tag), this.description, info);
	}
};
/**
* Response error for operations that expected a response body but received an empty body.
*
* @stability unstable
* @category errors
* @since 4.0.0
*/
var EmptyBodyError = class extends (/*#__PURE__*/ TaggedError$1("EmptyBodyError")) {
	/**
	* Formats the request method and URL for empty response body error messages.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get methodAndUrl() {
		return `${this.request.method} ${this.request.url}`;
	}
	/**
	* Builds the empty body error message from the response status, optional description, and request details.
	*
	* @stability unstable
	* @since 4.0.0
	*/
	get message() {
		const info = `${this.response.status} ${this.methodAndUrl}`;
		return formatMessage(formatReason(this._tag), this.description, info);
	}
};
//#endregion
//#region node_modules/effect/dist/http/HttpMethod.js
/**
* Provides tuples mapping each supported HTTP method to its short
* request-constructor name.
*
* **When to use**
*
* Use when you need the mapping from supported HTTP method literals to their
* short request-constructor names.
*
* @stability unstable
* @category constants
* @since 4.0.0
*/
const allShort = [
	["GET", "get"],
	["POST", "post"],
	["PUT", "put"],
	["DELETE", "del"],
	["PATCH", "patch"],
	["HEAD", "head"],
	["OPTIONS", "options"],
	["TRACE", "trace"],
	["QUERY", "query"]
];
//#endregion
//#region node_modules/effect/dist/http/internal/httpBody.js
/**
* @internal
*/
const updateHeaders = (headers, body) => {
	if (body._tag === "Empty" || body._tag === "FormData") return remove$1(remove$1(headers, "content-type"), "content-length");
	headers = body.contentType === void 0 ? remove$1(headers, "content-type") : set$1(headers, "content-type", body.contentType);
	return body.contentLength === void 0 ? remove$1(headers, "content-length") : set$1(headers, "content-length", body.contentLength.toString());
};
//#endregion
//#region node_modules/effect/dist/http/Url.js
/**
* Error returned when constructing a `URL` fails.
*
* @stability unstable
* @category errors
* @since 4.0.0
*/
var UrlError = class extends (/*#__PURE__*/ TaggedError$1("UrlError")) {};
/**
* Creates a `URL` safely by appending `UrlParams` and an optional hash to a URL string.
*
* **Details**
*
* Returns a `Result` that fails with `UrlError` if the URL cannot be constructed.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const make$5 = (url, params, hash) => try_$2({
	try: () => {
		const urlInstance = new URL(url, baseUrl());
		for (let i = 0; i < params.params.length; i++) {
			const [key, value] = params.params[i];
			if (value !== void 0) urlInstance.searchParams.append(key, value);
		}
		if (hash !== void 0) urlInstance.hash = hash;
		return urlInstance;
	},
	catch: (cause) => new UrlError({ cause })
});
const baseUrl = () => {
	if ("location" in globalThis && globalThis.location !== void 0 && globalThis.location.origin !== void 0 && globalThis.location.pathname !== void 0) return location.origin + location.pathname;
};
//#endregion
//#region node_modules/effect/dist/http/HttpClientRequest.js
const TypeId$5 = "~effect/http/HttpClientRequest";
const Proto$5 = {
	[TypeId$5]: TypeId$5,
	...BaseProto,
	toJSON() {
		return {
			_id: "HttpClientRequest",
			method: this.method,
			url: this.url,
			urlParams: this.urlParams,
			hash: this.hash,
			headers: redact$1(this.headers),
			body: this.body.toJSON()
		};
	},
	pipe() {
		return pipeArguments(this, arguments);
	}
};
/**
* Constructs an `HttpClientRequest` from fully normalized request components.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
function makeWith$1(method, url, urlParams, hash, headers, body) {
	const self = Object.create(Proto$5);
	self.method = method;
	self.url = url;
	self.urlParams = urlParams;
	self.hash = hash;
	self.headers = headers;
	self.body = body;
	return self;
}
/**
* An empty `GET` request with no URL, query parameters, hash, headers, or body.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const empty = /*#__PURE__*/ makeWith$1("GET", "", empty$4, /*#__PURE__*/ none(), empty$5, empty$1);
/**
* Creates a request constructor for the specified HTTP method.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const make$4 = (method) => (url, options) => modify(empty, {
	method,
	url,
	...options ?? void 0
});
/**
* Creates a `POST` request for the specified URL.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const post = /*#__PURE__*/ make$4("POST");
/**
* Applies request options to an `HttpClientRequest`, returning a new request.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const modify = /*#__PURE__*/ dual(2, (self, options) => {
	let result = self;
	if (options.method) result = setMethod(result, options.method);
	if (options.url) result = setUrl(result, options.url);
	if (options.headers) result = setHeaders(result, options.headers);
	if (options.urlParams) result = setUrlParams(result, options.urlParams);
	if (options.hash) result = setHash(result, options.hash);
	if (options.body) result = setBody(result, options.body);
	if (options.accept) result = accept(result, options.accept);
	if (options.acceptJson) result = acceptJson(result);
	return result;
});
/**
* Sets the HTTP method on a request, returning a new request.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const setMethod = /*#__PURE__*/ dual(2, (self, method) => makeWith$1(method, self.url, self.urlParams, self.hash, self.headers, self.body));
/**
* Sets a single request header, replacing any existing value for that header.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const setHeader = /*#__PURE__*/ dual(3, (self, key, value) => makeWith$1(self.method, self.url, self.urlParams, self.hash, set$1(self.headers, key, value), self.body));
/**
* Sets multiple request headers from an input collection, replacing existing values with matching names.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const setHeaders = /*#__PURE__*/ dual(2, (self, input) => makeWith$1(self.method, self.url, self.urlParams, self.hash, setAll$1(self.headers, input), self.body));
/**
* Sets the `Accept` header to the specified media type.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const accept = /*#__PURE__*/ dual(2, (self, mediaType) => setHeader(self, "Accept", mediaType));
/**
* Sets the `Accept` header to `application/json`.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const acceptJson = /*#__PURE__*/ accept("application/json");
/**
* Sets the request URL. When given a `URL`, its search parameters and hash are extracted into the request's structured fields.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const setUrl = /*#__PURE__*/ dual(2, (self, url) => {
	if (typeof url === "string") return makeWith$1(self.method, url, self.urlParams, self.hash, self.headers, self.body);
	const clone = new URL(url.toString());
	const urlParams = fromInput(clone.searchParams);
	const hash = fromNullishOr(clone.hash === "" ? void 0 : clone.hash.slice(1));
	clone.search = "";
	clone.hash = "";
	return makeWith$1(self.method, clone.toString(), urlParams, hash, self.headers, self.body);
});
/**
* Sets query parameters from an input collection, replacing existing values for matching names.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const setUrlParams = /*#__PURE__*/ dual(2, (self, input) => makeWith$1(self.method, self.url, setAll(self.urlParams, input), self.hash, self.headers, self.body));
/**
* Sets the URL fragment on a request without the leading `#`.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const setHash = /*#__PURE__*/ dual(2, (self, hash) => makeWith$1(self.method, self.url, self.urlParams, some(hash), self.headers, self.body));
/**
* Sets the request body and updates `Content-Type` and `Content-Length` headers from the body metadata when available.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const setBody = /*#__PURE__*/ dual(2, (self, body) => {
	return makeWith$1(self.method, self.url, self.urlParams, self.hash, updateHeaders(self.headers, body), body);
});
/**
* Sets a JSON request body using unsafe JSON encoding.
*
* **When to use**
*
* Use when the request body is known to be JSON-serializable and a synchronous
* `HttpClientRequest` result is needed.
*
* **Gotchas**
*
* JSON encoding may throw instead of failing in the Effect error channel.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const bodyJsonUnsafe = /*#__PURE__*/ dual(2, (self, body) => setBody(self, jsonUnsafe$1(body)));
/**
* Sets an `application/x-www-form-urlencoded` request body from URL parameter input.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
const bodyUrlParams = /*#__PURE__*/ dual(2, (self, input) => setBody(self, urlParams(fromInput(input))));
/**
* Builds a `URL` from the request URL, query parameters, and hash, returning `Option.none()` if the URL is invalid.
*
* @stability unstable
* @category combinators
* @since 4.0.0
*/
function toUrl(self) {
	const r = make$5(self.url, self.urlParams, getOrUndefined$1(self.hash));
	if (isSuccess$1(r)) return some(r.success);
	return none();
}
//#endregion
//#region node_modules/effect/dist/http/HttpIncomingMessage.js
/**
* Type identifier for `HttpIncomingMessage` values.
*
* @stability unstable
* @category type IDs
* @since 4.0.0
*/
const TypeId$4 = "~effect/http/HttpIncomingMessage";
/**
* Builds an inspectable object for an incoming message, redacting headers and including a synchronously readable JSON or text body when available.
*
* @stability unstable
* @category converting
* @since 4.0.0
*/
const inspect = (self, that) => {
	const contentType = self.headers["content-type"] ?? "";
	let body;
	if (contentType.includes("application/json")) try {
		body = runSync$1(self.json);
	} catch (_) {}
	else if (contentType.includes("text/") || contentType.includes("urlencoded")) try {
		body = runSync$1(self.text);
	} catch (_) {}
	const obj = {
		...that,
		headers: redact$1(self.headers),
		remoteAddress: self.remoteAddress
	};
	if (body !== void 0) obj.body = body;
	return obj;
};
//#endregion
//#region node_modules/effect/dist/http/HttpClientResponse.js
/**
* Represents responses returned by the Effect HTTP client.
*
* An `HttpClientResponse` keeps the original request together with the response
* status, headers, cookies, and body accessors from the shared incoming-message
* model. This module includes constructors, schema-based decoders, helpers for
* streaming response bodies, and utilities for matching or filtering by HTTP
* status.
*
* @stability unstable
* @since 4.0.0
*/
/**
* Type identifier for `HttpClientResponse` values.
*
* @stability unstable
* @category type IDs
* @since 4.0.0
*/
const TypeId$3 = "~effect/http/HttpClientResponse";
/**
* Wraps a Web `Response` and its original `HttpClientRequest` as an `HttpClientResponse`.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const fromWeb = (request, source) => new WebHttpClientResponse(request, source);
/**
* Succeeds with the response only when its status is in the 2xx range, otherwise fails with `HttpClientError`.
*
* @stability unstable
* @category filtering
* @since 4.0.0
*/
const filterStatusOk = (self) => self.status >= 200 && self.status < 300 ? succeed$3(self) : fail$3(new HttpClientError({ reason: new StatusCodeError({
	response: self,
	request: self.request,
	description: "non 2xx status code"
}) }));
var WebHttpClientResponse = class extends Class$1 {
	[TypeId$4];
	[TypeId$3];
	request;
	source;
	constructor(request, source) {
		super();
		this.request = request;
		this.source = source;
		this[TypeId$4] = TypeId$4;
		this[TypeId$3] = TypeId$3;
	}
	toJSON() {
		return inspect(this, {
			_id: "HttpClientResponse",
			request: this.request.toJSON(),
			status: this.status
		});
	}
	get status() {
		return this.source.status;
	}
	get url() {
		if (this.source.url) return this.source.url.split("#")[0];
		const url = toUrl(this.request);
		if (isNone(url)) return "";
		url.value.hash = "";
		return url.value.href;
	}
	get headers() {
		return fromInput$1(this.source.headers);
	}
	cachedCookies;
	get cookies() {
		if (this.cachedCookies) return this.cachedCookies;
		return this.cachedCookies = fromSetCookie(this.source.headers.getSetCookie());
	}
	get remoteAddress() {
		return none();
	}
	get stream() {
		return this.source.body ? fromReadableStream({
			evaluate: () => this.source.body,
			onError: (cause) => new HttpClientError({ reason: new DecodeError({
				request: this.request,
				response: this,
				cause
			}) })
		}) : fail(new HttpClientError({ reason: new EmptyBodyError({
			request: this.request,
			response: this,
			description: "can not create stream from empty body"
		}) }));
	}
	get json() {
		return flatMap(this.text, (text) => try_({
			try: () => text === "" ? null : JSON.parse(text),
			catch: (cause) => new HttpClientError({ reason: new DecodeError({
				request: this.request,
				response: this,
				cause
			}) })
		}));
	}
	textBody;
	get text() {
		return this.textBody ??= map$2(this.arrayBuffer, (_) => new TextDecoder().decode(_));
	}
	get urlParamsBody() {
		return flatMap(this.text, (_) => try_({
			try: () => fromInput(new URLSearchParams(_)),
			catch: (cause) => new HttpClientError({ reason: new DecodeError({
				request: this.request,
				response: this,
				cause
			}) })
		}));
	}
	formDataBody;
	get formData() {
		return this.formDataBody ??= tryPromise({
			try: () => this.source.formData(),
			catch: (cause) => new HttpClientError({ reason: new DecodeError({
				request: this.request,
				response: this,
				cause
			}) })
		}).pipe(cached, runSync$1);
	}
	arrayBufferBody;
	get arrayBuffer() {
		if (this.arrayBufferBody) return this.arrayBufferBody;
		this.arrayBufferBody = tryPromise({
			try: () => this.source.arrayBuffer(),
			catch: (cause) => new HttpClientError({ reason: new DecodeError({
				request: this.request,
				response: this,
				cause
			}) })
		}).pipe(cached, runSync$1);
		return this.arrayBufferBody;
	}
	pipe() {
		return pipeArguments(this, arguments);
	}
};
//#endregion
//#region node_modules/effect/dist/http/HttpTraceContext.js
/**
* HTTP propagation helpers for Effect tracing context.
*
* This module converts Effect `Tracer.Span` values into outbound trace headers
* and decodes inbound propagation headers into `Tracer.ExternalSpan` parents.
* HTTP clients use it to continue the current span across outgoing requests, and
* server middleware uses it to parent request spans from upstream services.
*
* @stability unstable
* @since 4.0.0
*/
/**
* Encodes a span into HTTP trace propagation headers.
*
* **Details**
*
* The generated headers include both compact B3 (`b3`) and W3C `traceparent`
* formats.
*
* @stability unstable
* @category encoding
* @since 4.0.0
*/
const toHeaders = (span) => fromRecordUnsafe({
	b3: `${span.traceId}-${span.spanId}-${span.sampled ? "1" : "0"}${match$4(span.parent, {
		onNone: () => "",
		onSome: (parent) => `-${parent.spanId}`
	})}`,
	traceparent: `00-${span.traceId}-${span.spanId}-${span.sampled ? "01" : "00"}`
});
//#endregion
//#region node_modules/effect/dist/http/HttpClient.js
const TypeId$2 = "~effect/http/HttpClient";
/**
* Service tag for the default outgoing HTTP client service.
*
* **When to use**
*
* Use to provide the default outgoing HTTP client service used by request
* accessors such as `execute`, `get`, and `post`.
*
* @stability unstable
* @category services
* @since 4.0.0
*/
const HttpClient = /*#__PURE__*/ Service("effect/HttpClient");
/**
* Transforms a client by applying an effectful transformation to each response effect.
*
* @stability unstable
* @category mapping
* @since 4.0.0
*/
const transformResponse = /*#__PURE__*/ dual(2, (self, f) => makeWith((request) => f(self.postprocess(request)), self.preprocess));
/**
* Constructs an `HttpClient.With` from a preprocessing function and a postprocessing function.
*
* **Details**
*
* `execute` applies preprocessing to the request and then passes the resulting request effect to postprocessing.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const makeWith = (postprocess, preprocess) => {
	const self = Object.create(Proto$4);
	self.preprocess = preprocess;
	self.postprocess = postprocess;
	self.execute = function(request) {
		return postprocess(preprocess(request));
	};
	return self;
};
const Proto$4 = {
	[TypeId$2]: TypeId$2,
	pipe() {
		return pipeArguments(this, arguments);
	},
	...BaseProto,
	toJSON() {
		return { _id: "effect/HttpClient" };
	},
	.../*#__PURE__*/ Object.fromEntries(/*#__PURE__*/ allShort.map(([fullMethod, method]) => [method, function(url, options) {
		return this.execute(make$4(fullMethod)(url, options));
	}]))
};
/**
* Constructs an `HttpClient` from a low-level request runner.
*
* **Details**
*
* The runner receives the request, resolved URL, abort signal, and current fiber. The client wrapper handles URL construction failures, tracing and propagation, header redaction, and aborting non-scoped requests on interruption.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const make$3 = (f) => makeWith((effect) => flatMap(effect, (request) => withFiber((fiber) => {
	const scopedController = scopedRequests.get(request);
	const controller = scopedController ?? new AbortController();
	const urlResult = make$5(request.url, request.urlParams, getOrUndefined$1(request.hash));
	if (isFailure(urlResult)) return fail$3(new HttpClientError({ reason: new InvalidUrlError({
		request,
		cause: urlResult.failure
	}) }));
	const url = urlResult.success;
	if (fiber.getRef(DisablePropagation) || fiber.getRef(TracerDisabledWhen)(request)) {
		const effect = f(request, url, controller.signal, fiber);
		if (scopedController) return effect;
		return uninterruptibleMask((restore) => matchCauseEffect(restore(effect), {
			onSuccess(response) {
				responseRegistry.register(response, controller);
				return succeed$3(new InterruptibleResponse(response, controller));
			},
			onFailure(cause) {
				if (hasInterrupts(cause)) controller.abort();
				return failCause$2(cause);
			}
		}));
	}
	return useSpan(fiber.getRef(SpanNameGenerator)(request), { kind: "client" }, (span) => {
		span.attribute("http.request.method", request.method);
		span.attribute("server.address", url.origin);
		if (url.port !== "") span.attribute("server.port", +url.port);
		span.attribute("url.full", url.toString());
		span.attribute("url.path", url.pathname);
		span.attribute("url.scheme", url.protocol.slice(0, -1));
		const query = url.search.slice(1);
		if (query !== "") span.attribute("url.query", query);
		const redactedHeaderNames = fiber.getRef(CurrentRedactedNames);
		const headerFilter = fiber.getRef(TracerHeaderFilter);
		for (const name in request.headers) {
			if (!headerFilter(name, "request")) continue;
			span.attribute(`http.request.header.${name}`, isRedactedName(name, redactedHeaderNames) ? "<redacted>" : request.headers[name]);
		}
		request = fiber.getRef(TracerPropagationEnabled) ? setHeaders(request, toHeaders(span)) : request;
		return uninterruptibleMask((restore) => restore(f(request, url, controller.signal, fiber)).pipe(withParentSpan(span, { captureStackTrace: false }), matchCauseEffect({
			onSuccess: (response) => {
				span.attribute("http.response.status_code", response.status);
				for (const name in response.headers) {
					if (!headerFilter(name, "response")) continue;
					span.attribute(`http.response.header.${name}`, isRedactedName(name, redactedHeaderNames) ? "<redacted>" : response.headers[name]);
				}
				if (scopedController) return succeed$3(response);
				responseRegistry.register(response, controller);
				return succeed$3(new InterruptibleResponse(response, controller));
			},
			onFailure(cause) {
				if (!scopedController && hasInterrupts(cause)) controller.abort();
				return failCause$2(cause);
			}
		})));
	});
})), succeed$3);
/**
* Context reference for a predicate that disables client-side tracing for matching outgoing requests.
*
* @stability unstable
* @category services
* @since 4.0.0
*/
const TracerDisabledWhen = /*#__PURE__*/ Reference("effect/http/HttpClient/TracerDisabledWhen", { defaultValue: () => constFalse });
/**
* Context reference for filtering request and response headers added to client spans.
*
* @stability unstable
* @category services
* @since 4.0.0
*/
const TracerHeaderFilter = /*#__PURE__*/ Reference("effect/http/HttpClient/TracerHeaderFilter", { defaultValue: () => constTrue });
/**
* Context reference that controls whether outgoing client spans are propagated to request headers.
*
* @stability unstable
* @category services
* @since 4.0.0
*/
const TracerPropagationEnabled = /*#__PURE__*/ Reference("effect/http/HttpClient/TracerPropagationEnabled", { defaultValue: constTrue });
/**
* Context reference for generating the span name used for outgoing client request spans.
*
* @stability unstable
* @category services
* @since 4.0.0
*/
const SpanNameGenerator = /*#__PURE__*/ Reference("effect/http/HttpClient/SpanNameGenerator", { defaultValue: () => (request) => `http.client ${request.method}` });
/**
* Creates an `HttpClient` layer and merges the layer construction context into client response effects.
*
* @stability unstable
* @category layers
* @since 4.0.0
*/
const layerMergedContext = (effect$2) => effect(HttpClient)(contextWith((context) => map$2(effect$2, (client) => transformResponse(client, updateContext((input) => merge$3(context, input))))));
const responseRegistry = /*#__PURE__*/ (() => {
	if ("FinalizationRegistry" in globalThis && globalThis.FinalizationRegistry) {
		const registry = /*#__PURE__*/ new FinalizationRegistry((controller) => {
			controller.abort();
		});
		return {
			register(response, controller) {
				registry.register(response, controller, response);
			},
			unregister(response) {
				registry.unregister(response);
			}
		};
	}
	const timers = /*#__PURE__*/ new Map();
	return {
		register(response, controller) {
			timers.set(response, setTimeout(() => controller.abort(), 5e3));
		},
		unregister(response) {
			const timer = timers.get(response);
			if (timer === void 0) return;
			clearTimeout(timer);
			timers.delete(response);
		}
	};
})();
const scopedRequests = /*#__PURE__*/ new WeakMap();
var InterruptibleResponse = class {
	original;
	controller;
	constructor(original, controller) {
		this.original = original;
		this.controller = controller;
	}
	[TypeId$3] = TypeId$3;
	[TypeId$4] = TypeId$4;
	applyInterrupt(effect) {
		return suspend$2(() => {
			responseRegistry.unregister(this.original);
			return onInterrupt(effect, () => sync(() => {
				this.controller.abort();
			}));
		});
	}
	get request() {
		return this.original.request;
	}
	get url() {
		return this.original.url;
	}
	get status() {
		return this.original.status;
	}
	get headers() {
		return this.original.headers;
	}
	get cookies() {
		return this.original.cookies;
	}
	get remoteAddress() {
		return this.original.remoteAddress;
	}
	get formData() {
		return this.applyInterrupt(this.original.formData);
	}
	get text() {
		return this.applyInterrupt(this.original.text);
	}
	get json() {
		return this.applyInterrupt(this.original.json);
	}
	get urlParamsBody() {
		return this.applyInterrupt(this.original.urlParamsBody);
	}
	get arrayBuffer() {
		return this.applyInterrupt(this.original.arrayBuffer);
	}
	get stream() {
		return suspend(() => {
			responseRegistry.unregister(this.original);
			return ensuring(this.original.stream, sync(() => {
				this.controller.abort();
			}));
		});
	}
	toJSON() {
		return this.original.toJSON();
	}
	[NodeInspectSymbol]() {
		return this.original[NodeInspectSymbol]();
	}
	pipe() {
		return pipeArguments(this, arguments);
	}
};
//#endregion
//#region node_modules/effect/dist/http/FetchHttpClient.js
/**
* Fetch-based implementation of the Effect HTTP client service.
*
* This module provides an `HttpClient` layer that executes requests through a
* Web Fetch API implementation. It is the transport to use in browsers, edge
* runtimes, and Node.js environments where `globalThis.fetch` is available, or
* anywhere a compatible fetch function can be supplied.
*
* @stability unstable
* @since 4.0.0
*/
/**
* Context reference for the `fetch` implementation used by the fetch-based HTTP client.
*
* **Details**
*
* Defaults to `globalThis.fetch`.
*
* @stability unstable
* @category services
* @since 4.0.0
*/
const Fetch = /*#__PURE__*/ Reference("effect/http/FetchHttpClient/Fetch", { defaultValue: () => globalThis.fetch });
/**
* Service that contains default fetch options for the fetch-based HTTP client.
*
* **When to use**
*
* Use to provide default credentials, cache, redirect, integrity, or other
* fetch options for outgoing HTTP requests.
*
* **Details**
*
* Request-specific method, headers, body, and abort signal are supplied by the client when a request is executed.
*
* @stability unstable
* @category services
* @since 4.0.0
*/
var RequestInit = class extends (/*#__PURE__*/ Service()("effect/http/FetchHttpClient/RequestInit")) {};
/**
* Layer that provides an `HttpClient` implementation backed by the configured
* `Fetch` function.
*
* **When to use**
*
* Use when an Effect program should execute `HttpClient` requests through the
* platform `fetch` implementation, especially in browser, edge, or Node.js
* runtimes with `globalThis.fetch`.
*
* **Details**
*
* The layer uses the current `Fetch` reference and optional `RequestInit`
* service for each request. Request-specific method, headers, body, and abort
* signal are supplied by the client and override matching `RequestInit` fields.
*
* **Gotchas**
*
* Fetch behavior comes from the runtime's implementation, so CORS, cookies,
* redirects, abort handling, and streaming support can vary by platform. Stream
* request bodies are sent as Web streams with `duplex: "half"`, and any
* `content-length` header is removed before calling `fetch`.
*
* @see {@link Fetch} for supplying the fetch implementation used by this layer
* @see {@link RequestInit} for default `RequestInit` options applied before request-specific fields
*
* @stability unstable
* @category layers
* @since 4.0.0
*/
const layer$2 = /*#__PURE__*/ layerMergedContext(/*#__PURE__*/ succeed$3(/* @__PURE__ */ make$3((request, url, signal, fiber) => {
	const fetch = fiber.getRef(Fetch);
	const options = getOrUndefined(fiber.context, RequestInit) ?? {};
	let headers = options.headers ? merge$2(fromInput$1(options.headers), request.headers) : request.headers;
	if (headers["content-length"]) headers = remove$1(headers, "content-length");
	const send = (body) => map$2(tryPromise({
		try: () => fetch(url, {
			...options,
			method: request.method,
			headers,
			body,
			duplex: typeof ReadableStream !== "undefined" && body instanceof ReadableStream ? "half" : void 0,
			signal
		}),
		catch: (cause) => new HttpClientError({ reason: new TransportError({
			request,
			cause
		}) })
	}), (response) => fromWeb(request, response));
	switch (request.body._tag) {
		case "Raw":
		case "Uint8Array": return send(request.body.body);
		case "FormData": return send(request.body.formData);
		case "Stream": return flatMap(toReadableStreamEffect(request.body.stream), send);
	}
	return send(void 0);
})));
//#endregion
//#region node_modules/effect/dist/ErrorReporter.js
/**
* Defines the runtime property key used to mark an object error as ignored by error
* reporting.
*
* **When to use**
*
* Use to suppress reporting for expected object errors, such as HTTP 404
* responses.
*
* **Details**
*
* Set `error[ErrorReporter.ignore]` to `true` to prevent the error from being
* forwarded to reporters. This is useful for expected failures such as HTTP 404
* responses.
*
* **Example** (Marking errors as ignored)
*
* ```ts import.meta.vitest
* import { Data, ErrorReporter } from "effect"
*
* class NotFoundError extends Data.TaggedError("NotFoundError")<{}> {
*   readonly [ErrorReporter.ignore] = true
* }
*
* ErrorReporter.isIgnored(new NotFoundError()) // => true
* ```
*
* @see {@link isIgnored} for checking whether a value carries this annotation
* @see {@link Reportable} for the annotation contract recognized on object
* errors
*
* @category annotations
* @since 4.0.0
*/
const ignore = "~effect/ErrorReporter/ignore";
//#endregion
//#region node_modules/effect/dist/http/internal/headers.js
const Proto$3 = /*#__PURE__*/ Object.getPrototypeOf(empty$5);
/**
* @internal
*/
const emptyMutableUnsafe = () => Object.create(Proto$3);
//#endregion
//#region node_modules/effect/dist/http/HttpServerResponse.js
const TypeId$1 = "~effect/http/HttpServerResponse";
const getContentType = (options, headers) => {
	if (options?.contentType) return options.contentType;
	else if (options?.headers) return headers["content-type"];
};
/**
* Creates a JSON HTTP response synchronously.
*
* **When to use**
*
* Use when the response body is known to be JSON-serializable and you need a
* synchronous `HttpServerResponse`.
*
* **Gotchas**
*
* Unlike `json`, serialization errors from `JSON.stringify` are not captured in
* `Effect`.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const jsonUnsafe = (body, options) => {
	const headers = options?.headers ? fromInput$1(options.headers) : empty$5;
	return makeResponse({
		status: options?.status ?? 200,
		statusText: options?.statusText,
		headers,
		cookies: options?.cookies,
		body: jsonUnsafe$1(body, getContentType(options, headers))
	});
};
/**
* Creates a streaming response from a stream of byte chunks.
*
* **Details**
*
* Optional response metadata can supply the status, headers, content type, and
* content length.
*
* @stability unstable
* @category constructors
* @since 4.0.0
*/
const stream = (body, options) => {
	const headers = options?.headers ? fromInput$1(options.headers) : empty$5;
	return makeResponse({
		status: options?.status ?? 200,
		statusText: options?.statusText,
		headers,
		cookies: options?.cookies,
		body: stream$1(body, getContentType(options, headers), options?.contentLength)
	});
};
/**
* Returns whether a response must omit its body because its status is 204, 205,
* or 304, or `withoutBody` is true.
*
* @stability unstable
* @category predicates
* @since 4.0.0
*/
const omitsBody = (response, withoutBody = false) => withoutBody || response.status === 204 || response.status === 205 || response.status === 304;
/**
* Converts an `HttpServerResponse` to a Web `Response`.
*
* **Details**
*
* Cookies are appended as `Set-Cookie` headers. Stream bodies are converted using
* the supplied context.
*
* Bodies are omitted for statuses 204, 205, and 304, or when `withoutBody` is true
* (for example, for HEAD responses). Omitted raw `ReadableStream` bodies are
* cancelled without awaiting completion, and cancellation errors are ignored.
*
* A raw `Response` body is returned as-is after the outer headers are merged
* into it: outer headers replace native ones, and cookies are appended. When
* its body is omitted, the bodyless `Response` keeps those merged headers and
* uses the outer status for 204, 205 and 304, or the raw `Response` status
* otherwise.
*
* @stability unstable
* @category converting
* @since 4.0.0
*/
const toWeb = (response, options) => {
	const headers = new globalThis.Headers(response.headers);
	if (!isEmpty(response.cookies)) {
		const toAdd = toSetCookieHeaders(response.cookies);
		for (const header of toAdd) headers.append("set-cookie", header);
	}
	const body = response.body;
	const outerOmitsBody = omitsBody(response);
	const withoutBody = outerOmitsBody || options?.withoutBody === true;
	if (body._tag === "Raw" && body.body instanceof Response) {
		const raw = body.body;
		for (const [key, value] of headers) if (key === "set-cookie") raw.headers.append(key, value);
		else raw.headers.set(key, value);
		if (!withoutBody) return raw;
		const source = outerOmitsBody ? response : raw;
		return new Response(void 0, {
			status: source.status,
			statusText: source.statusText,
			headers: raw.headers
		});
	}
	if (withoutBody) {
		if (body._tag === "Raw" && isReadableStream(body.body)) body.body.cancel().catch(constVoid);
		return new Response(void 0, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	}
	switch (body._tag) {
		case "Empty": return new Response(void 0, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
		case "Uint8Array": return new Response(body.text ?? body.body, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
		case "Raw": return new Response(body.body, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
		case "FormData": return new Response(body.formData, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
		case "Stream": return new Response(toReadableStreamWith(body.stream, options?.context ?? empty$7()), {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	}
};
const isReadableStream = (u) => typeof ReadableStream !== "undefined" && u instanceof ReadableStream;
const Proto$2 = {
	...PipeInspectableProto,
	[TypeId$1]: TypeId$1,
	[ignore]: true,
	toJSON() {
		return {
			_id: "HttpServerResponse",
			status: this.status,
			statusText: this.statusText,
			headers: redact$1(this.headers),
			cookies: this.cookies.toJSON(),
			body: this.body.toJSON()
		};
	}
};
const makeResponse = (options, ownedHeaders) => {
	const self = Object.create(Proto$2);
	self.status = options.status;
	self.statusText = options.statusText;
	self.cookies = options.cookies ?? empty$6;
	self.body = options.body ?? empty$1;
	if (self.body._tag !== "Empty" && (self.body.contentType || self.body.contentLength !== void 0)) {
		const owned = ownedHeaders !== void 0;
		const newHeaders = owned ? ownedHeaders : options.headers === void 0 || options.headers === empty$5 ? emptyMutableUnsafe() : fromRecordUnsafe({ ...options.headers });
		if (self.body.contentType && (!owned || newHeaders["content-type"] === void 0)) newHeaders["content-type"] = self.body.contentType;
		if (self.body.contentLength !== void 0 && (!owned || newHeaders["content-length"] === void 0)) newHeaders["content-length"] = self.body.contentLength.toString();
		self.headers = newHeaders;
	} else self.headers = ownedHeaders ?? options.headers ?? empty$5;
	return self;
};
//#endregion
//#region src/version.ts
const version = "0.1.1";
//#endregion
//#region src/domain.ts
const TrimmedNonEmptyString = String$2.check(makeFilter((value) => value.trim().length > 0));
const IsoDateTime = String$2;
Literals([
	"codex",
	"claudeAgent",
	"opencode",
	"cursor",
	"grok",
	"antigravity",
	"acp"
]);
const ServerProviderUsageLimits = Struct({
	checkedAt: String$2,
	windows: ArraySchema(Struct({
		id: String$2,
		kind: Literals([
			"session",
			"weekly",
			"monthly",
			"other"
		]),
		label: String$2,
		usedPercent: Number$1,
		resetsAt: optional(String$2),
		windowDurationMins: optional(Number$1)
	})),
	unavailable: optional(Struct({
		reason: Literals(["unsupported", "probeFailed"]),
		message: optional(String$2)
	}))
});
//#endregion
//#region src/contracts.ts
const MODEL_PROXY_PATH = "/api/plugins/agent-proxy";
const ModelProxyProvider = Literals([
	"codex",
	"claude",
	"gemini",
	"antigravity",
	"kimi",
	"xai"
]);
const ModelProxyStrategy = Literals([
	"closest-reset",
	"round-robin",
	"least-active-sessions"
]);
const ModelProxyStickyIdleMinutes = Int.check(isBetween({
	minimum: 1,
	maximum: 1440
}));
const ModelProxyAccount = Struct({
	id: TrimmedNonEmptyString,
	name: TrimmedNonEmptyString,
	provider: TrimmedNonEmptyString,
	email: optional(String$2),
	disabled: Boolean$1,
	status: String$2,
	activeSessions: optional(Int),
	usageLimits: optional(ServerProviderUsageLimits),
	plan: optional(String$2)
});
const ModelProxySnapshot = Struct({
	enabled: Boolean$1,
	status: Literals([
		"stopped",
		"running",
		"failed"
	]),
	version: String$2,
	endpointPath: String$2,
	strategy: ModelProxyStrategy,
	stickyIdleMinutes: ModelProxyStickyIdleMinutes,
	checkedAt: IsoDateTime,
	accounts: ArraySchema(ModelProxyAccount),
	error: optional(String$2),
	client: Struct({
		configured: Boolean$1,
		local: Boolean$1,
		url: optional(String$2)
	}),
	/** Returned only by an explicit key request. */
	apiKey: optional(String$2),
	oauth: optional(Struct({
		provider: ModelProxyProvider,
		url: String$2,
		state: String$2,
		status: Literals([
			"wait",
			"ok",
			"error"
		])
	}))
});
const ModelProxyAccountName = TrimmedNonEmptyString.check(isPattern(/^[^/\\\p{Cc}]+\.json$/u));
const ModelProxyManageInput = Union([
	Struct({ action: Literals([
		"status",
		"start",
		"stop",
		"refresh",
		"revealKey",
		"rotateKey"
	]) }),
	Struct({
		action: Literal("setStrategy"),
		strategy: ModelProxyStrategy
	}),
	Struct({
		action: Literal("setStickyIdleMinutes"),
		minutes: ModelProxyStickyIdleMinutes
	}),
	Struct({
		action: Literal("authStart"),
		provider: ModelProxyProvider
	}),
	Struct({
		action: Literal("authStatus"),
		provider: ModelProxyProvider,
		state: TrimmedNonEmptyString
	}),
	Struct({
		action: Literal("authCancel"),
		state: TrimmedNonEmptyString
	}),
	Struct({
		action: Literal("authComplete"),
		provider: ModelProxyProvider,
		state: TrimmedNonEmptyString,
		redirectUrl: TrimmedNonEmptyString
	}),
	Struct({
		action: Literal("setAccountEnabled"),
		name: TrimmedNonEmptyString,
		enabled: Boolean$1
	}),
	Struct({
		action: Literal("removeAccount"),
		name: ModelProxyAccountName
	}),
	Struct({
		action: Literal("importAccount"),
		name: ModelProxyAccountName,
		credential: Record(String$2, Unknown)
	}),
	Struct({ action: Literal("useLocal") }),
	Struct({
		action: Literal("configureClient"),
		url: TrimmedNonEmptyString,
		fallbackUrls: optional(ArraySchema(TrimmedNonEmptyString)),
		apiKey: TrimmedNonEmptyString
	}),
	Struct({ action: Literal("disconnectClient") })
]);
var ModelProxyError = class extends TaggedError()("ModelProxyError", { operation: Literals([
	"storage",
	"management",
	"disabled",
	"callback",
	"unsupported",
	"unauthorized",
	"noAccounts",
	"upstream",
	"oauthConfig"
]) }) {
	get message() {
		return {
			storage: "Could not read or save model proxy settings.",
			management: "The model proxy management request failed.",
			disabled: "Start the model proxy before managing accounts.",
			callback: "Paste the full OAuth callback URL for this login.",
			unsupported: "This provider or API format is not supported by T3 Proxy yet.",
			unauthorized: "The T3 Proxy API key is invalid.",
			noAccounts: "No enabled account is available for this model. Check its quota or connect another account.",
			upstream: "The upstream provider request failed.",
			oauthConfig: "Google OAuth requires a client ID configured on this T3 server. See the T3 Proxy usage guide."
		}[this.operation];
	}
};
new TextEncoder();
const decoder = new TextDecoder();
//#endregion
//#region node_modules/jose/dist/webapi/lib/base64.js
function decodeBase64(encoded) {
	if (Uint8Array.fromBase64) return Uint8Array.fromBase64(encoded);
	const binary = atob(encoded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}
//#endregion
//#region node_modules/jose/dist/webapi/util/base64url.js
function decode(input) {
	if (Uint8Array.fromBase64) return Uint8Array.fromBase64(typeof input === "string" ? input : decoder.decode(input), { alphabet: "base64url" });
	let encoded = input;
	if (encoded instanceof Uint8Array) encoded = decoder.decode(encoded);
	encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
	try {
		return decodeBase64(encoded);
	} catch {
		throw new TypeError("The input to be decoded is not correctly encoded.");
	}
}
//#endregion
//#region node_modules/jose/dist/webapi/util/errors.js
var JOSEError = class extends Error {
	static code = "ERR_JOSE_GENERIC";
	code = "ERR_JOSE_GENERIC";
	constructor(message, options) {
		super(message, options);
		this.name = this.constructor.name;
		Error.captureStackTrace?.(this, this.constructor);
	}
};
var JWTInvalid = class extends JOSEError {
	static code = "ERR_JWT_INVALID";
	code = "ERR_JWT_INVALID";
};
//#endregion
//#region node_modules/jose/dist/webapi/lib/type_checks.js
const isObjectLike = (value) => typeof value === "object" && value !== null;
function isObject(input) {
	if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") return false;
	if (Object.getPrototypeOf(input) === null) return true;
	let proto = input;
	while (Object.getPrototypeOf(proto) !== null) proto = Object.getPrototypeOf(proto);
	return Object.getPrototypeOf(input) === proto;
}
//#endregion
//#region node_modules/jose/dist/webapi/util/decode_jwt.js
function decodeJwt(jwt) {
	if (typeof jwt !== "string") throw new JWTInvalid("JWTs must use Compact JWS serialization, JWT must be a string");
	const { 1: payload, length } = jwt.split(".");
	if (length === 5) throw new JWTInvalid("Only JWTs using Compact JWS serialization can be decoded");
	if (length !== 3) throw new JWTInvalid("Invalid JWT");
	if (!payload) throw new JWTInvalid("JWTs must contain a payload");
	let decoded;
	try {
		decoded = decode(payload);
	} catch {
		throw new JWTInvalid("Failed to base64url decode the payload");
	}
	let result;
	try {
		result = JSON.parse(decoder.decode(decoded));
	} catch {
		throw new JWTInvalid("Failed to parse the decoded payload as JSON");
	}
	if (!isObject(result)) throw new JWTInvalid("Invalid JWT Claims Set");
	return result;
}
//#endregion
//#region node_modules/effect/dist/ConfigProvider.js
/**
* Data sources used by `Config` to load raw configuration values. A
* `ConfigProvider` reads paths from places such as environment variables,
* JavaScript objects, `.env` contents, or directories, and returns a uniform
* `Node` shape that config schemas can decode. The module also includes helpers
* for composing providers, changing paths, and installing providers through
* layers.
*
* @since 4.0.0
*/
/**
* Creates a `Value` node representing a terminal string leaf.
*
* **When to use**
*
* Use when building nodes inside a custom `ConfigProvider`'s `get`
* callback.
*
* **Details**
*
* The function returns a new plain object.
*
* **Example** (Creating a value node)
*
* ```ts import.meta.vitest
* import { ConfigProvider } from "effect"
*
* ConfigProvider.makeValue("3000") // => { _tag: "Value", value: "3000" }
* ```
*
* @see {@link makeRecord} – for object-like containers
* @see {@link makeArray} – for array-like containers
*
* @category constructors
* @since 4.0.0
*/
function makeValue(value) {
	return {
		_tag: "Value",
		value
	};
}
/**
* Creates a `Record` node representing an object-like container with known
* child keys.
*
* **When to use**
*
* Use when you need to describe a directory or JSON object inside a custom
* provider.
*
* **Details**
*
* The optional `value` allows a node to be both a container and a leaf at the
* same time (for example, an env var `A=x` that also has children `A_FOO` and
* `A_BAR`).
*
* **Example** (Creating a record node)
*
* ```ts import.meta.vitest
* import { ConfigProvider } from "effect"
*
* const node = ConfigProvider.makeRecord(new Set(["host", "port"]))
* node._tag // => "Record"
* if (node._tag === "Record") {
*   node.keys // => new Set(["host", "port"])
*   node.value // => undefined
* }
* ```
*
* @see {@link makeValue} – for terminal leaves
* @see {@link makeArray} – for array-like containers
*
* @category constructors
* @since 4.0.0
*/
function makeRecord(keys, value) {
	return {
		_tag: "Record",
		keys,
		value
	};
}
/**
* Creates an `Array` node representing an indexed container with a known
* length.
*
* **When to use**
*
* Use when you need to describe a JSON array or numerically indexed env vars
* inside a custom provider.
*
* **Details**
*
* The optional `value` allows a node to be both a container and a leaf at the
* same time.
*
* **Example** (Creating an array node)
*
* ```ts import.meta.vitest
* import { ConfigProvider } from "effect"
*
* ConfigProvider.makeArray(3) // => { _tag: "Array", length: 3, value: undefined }
* ```
*
* @see {@link makeValue} – for terminal leaves
* @see {@link makeRecord} – for object-like containers
*
* @category constructors
* @since 4.0.0
*/
function makeArray(length, value) {
	return {
		_tag: "Array",
		length,
		value
	};
}
/**
* Context reference for the active raw configuration provider, registered in the context with a
* default value of `fromEnv()`. Because it is a `Context.Reference`, it is
* available without explicit provision; `Config` schemas automatically resolve
* it.
*
* **When to use**
*
* Use to override the active raw configuration provider for an entire program,
* or retrieve the current provider inside an Effect.
*
* **Example** (Providing a custom provider)
*
* ```ts import.meta.vitest
* import { ConfigProvider, Effect } from "effect"
*
* const provider = ConfigProvider.fromUnknown({ port: 8080 })
*
* const program = Effect.gen(function*() {
*   const current = yield* ConfigProvider.ConfigProvider
*   return current
* }).pipe(
*   Effect.provideService(ConfigProvider.ConfigProvider, provider)
* )
*
* Effect.runSync(program) === provider // => true
* ```
*
* @see {@link layer} – install a provider as a Layer
* @see {@link layerAdd} – add a fallback provider as a Layer
*
* @category services
* @since 4.0.0
*/
const ConfigProvider = /*#__PURE__*/ Reference("effect/ConfigProvider", { defaultValue: () => fromEnv() });
const Proto$1 = {
	...PipeInspectableProto,
	toJSON() {
		return { _id: "ConfigProvider" };
	}
};
const identityPath = (path) => path;
function makeProvider(load, mapInput) {
	const self = Object.create(Proto$1);
	self.load = load;
	self.mapInput = mapInput;
	return self;
}
function makeSource(get, transform) {
	return makeProvider((path) => get(transform(path)), (f) => makeSource(get, (path) => f(transform(path))));
}
/**
* Creates a `ConfigProvider` from a raw lookup function.
*
* **When to use**
*
* Use when implementing a provider backed by a custom store, such as a
* database, remote API, or in-memory map.
*
* **Details**
*
* The `get` callback receives a `Path` and must return
* `Effect<Node | undefined, SourceError>`. Return `undefined` when the path does
* not exist, a `Node` when it does, and fail with `SourceError` only when the
* source cannot be read.
*
* Providers created by `make` also implement the path-transformation
* capability used by {@link mapInput}, {@link constantCase}, and
* {@link nested}.
*
* **Example** (Creating a simple in-memory provider)
*
* ```ts import.meta.vitest
* import { ConfigProvider, Effect } from "effect"
*
* const data: Record<string, string> = {
*   host: "localhost",
*   port: "5432"
* }
*
* const provider = ConfigProvider.make((path) => {
*   const key = path.join(".")
*   const value = data[key]
*   return Effect.succeed(
*     value !== undefined ? ConfigProvider.makeValue(value) : undefined
*   )
* })
*
* Effect.runSync(provider.load(["host"])) // => ConfigProvider.makeValue("localhost")
* ```
*
* @see {@link fromEnv} – pre-built provider for environment variables
* @see {@link fromUnknown} – pre-built provider for JSON objects
*
* @category constructors
* @since 4.0.0
*/
function make$2(get) {
	return makeSource(get, identityPath);
}
function emptyStringAsMissing(value, preserveEmptyStrings) {
	return value === "" && !preserveEmptyStrings ? void 0 : value;
}
/**
* Creates a `ConfigProvider` backed by an explicit environment record.
*
* **When to use**
*
* Use when a restricted runtime cannot evaluate the automatic environment
* detection performed by {@link fromEnv}, or whenever the environment record
* must be supplied explicitly.
*
* **Details**
*
* `undefined` values are ignored. Path lookup and child discovery otherwise
* use the same environment-variable semantics as {@link fromEnv}.
*
* Environment variable names are captured at construction time to establish
* record keys and array lengths. The supplied record remains live for value
* lookups, so updates to known paths are observed by later loads. Keys added
* after construction can be loaded directly, but do not appear in captured
* parent record keys or array lengths.
*
* Literal empty strings are treated as missing values by default. Pass
* `{ preserveEmptyStrings: true }` to keep empty strings as explicit values.
*
* @see {@link fromEnv} – automatically reads the runtime environment
*
* @category constructors
* @since 4.0.0
*/
function fromEnvRecord(env, options) {
	const preserveEmptyStrings = options?.preserveEmptyStrings === true;
	const trie = buildEnvTrie(env);
	return make$2((path) => succeed$3(nodeAtEnv(trie, env, path, preserveEmptyStrings)));
}
/**
* Creates a `ConfigProvider` backed by environment variables.
*
* **When to use**
*
* Use to read configuration from `process.env`, which is the default when no
* provider is explicitly set, or pass a custom env record for testing.
*
* **Details**
*
* Path segments are joined with `_` for direct lookup, and env var names are
* also split on `_` to build a trie for child key discovery. This means
* `DATABASE_HOST=localhost` is accessible at both path `["DATABASE_HOST"]`
* and `["DATABASE", "HOST"]`. If all immediate children of a trie node have
* purely numeric names, the node is reported as an `Array`; otherwise as a
* `Record`.
*
* The default environment merges `process.env` and `import.meta.env` (when
* available). Override by passing `{ env: { ... } }`.
*
* Literal empty strings are treated as missing values when loaded as values by
* default. Pass `{ preserveEmptyStrings: true }` to keep empty strings as
* explicit values. Child discovery still reflects the environment variable
* names present in the source.
*
* Never fails with `SourceError` — all lookups are synchronous.
*
* **Example** (Reading from a custom env record)
*
* ```ts import.meta.vitest
* import { Config, ConfigProvider, Effect } from "effect"
*
* const provider = ConfigProvider.fromEnv({
*   env: {
*     DATABASE_HOST: "localhost",
*     DATABASE_PORT: "5432"
*   }
* })
*
* const host = Config.String("HOST").parse(
*   provider.pipe(ConfigProvider.nested("DATABASE"))
* )
*
* Effect.runSync(host) // => "localhost"
* ```
*
* @see {@link fromUnknown} – for JSON objects
* @see {@link fromEnvRecord} – for explicit records in restricted runtimes
* @see {@link constantCase} – bridge camelCase keys to SCREAMING_SNAKE_CASE
*
* @category constructors
* @since 2.0.0
*/
function fromEnv(options) {
	return fromEnvRecord(options?.env ?? {
		...globalThis.process?.env,
		...import.meta.env
	}, { preserveEmptyStrings: options?.preserveEmptyStrings });
}
function buildEnvTrie(env) {
	const trie = {};
	for (const [name, value] of Object.entries(env)) {
		if (value === void 0) continue;
		const segments = name.split("_");
		let node = trie;
		for (const seg of segments) {
			const children = node.children ??= Object.create(null);
			node = children[seg] ??= {};
		}
	}
	return trie;
}
function nodeAtEnv(trie, env, path, preserveEmptyStrings) {
	const key = path.map(String).join("_");
	const leafValue = emptyStringAsMissing(Object.hasOwn(env, key) ? env[key] : void 0, preserveEmptyStrings);
	const trieNode = trieNodeAt(trie, path);
	const children = trieNode?.children ? Object.keys(trieNode.children) : [];
	if (children.length === 0) return leafValue === void 0 ? void 0 : makeValue(leafValue);
	if (children.every(isCanonicalArrayIndex)) return makeArray(Math.max(...children.map((k) => parseInt(k, 10))) + 1, leafValue);
	return makeRecord(new Set(children), leafValue);
}
function trieNodeAt(root, path) {
	if (path.length === 0) return root;
	let node = root;
	for (const seg of path) {
		node = node?.children?.[String(seg)];
		if (!node) return void 0;
	}
	return node;
}
//#endregion
//#region node_modules/effect/dist/Config.js
const TypeId = "~effect/Config";
/**
* Represents the error type produced when config loading or validation fails.
*
* **When to use**
*
* Use when you need to inspect config loading or validation failures.
*
* **Details**
*
* Wraps either:
* - A `SourceError` — the provider could not read data (I/O failure).
* - A `SchemaError` — the data was found but did not match the schema
*   (wrong type, out of range, missing key, etc.).
*
* @see {@link orElse} – recover from a ConfigError
* @see {@link withDefault} – provide a fallback when relevant input is absent
*
* @category errors
* @since 4.0.0
*/
var ConfigError = class {
	_tag = "ConfigError";
	name = "ConfigError";
	cause;
	constructor(cause) {
		this.cause = cause;
	}
	get message() {
		return this.cause.toString();
	}
	toString() {
		return `ConfigError(${this.message})`;
	}
};
const Proto = {
	.../*#__PURE__*/ Prototype({
		label: "Config",
		evaluate(fiber) {
			return this.parse(fiber.getRef(ConfigProvider));
		}
	}),
	[TypeId]: TypeId,
	toJSON() {
		return { _id: "Config" };
	}
};
function make$1(evaluator) {
	const self = Object.create(Proto);
	self.evaluator = evaluator;
	self.parse = (provider) => flatMapEager(evaluator(provider, []), fromResult);
	return self;
}
const evaluateAt = (self, provider, pathPrefix) => self.evaluator(provider, pathPrefix);
/**
* Combines multiple configs into a single config that parses all of them.
*
* **When to use**
*
* Use when you need to group related configs into a tuple or named struct.
*
* **Details**
*
* Accepts a tuple (preserves positions), an iterable, or a record of configs.
* Returns a config whose parsed value mirrors the input shape.
*
* A combined config is absent when any child is absent and no child fails.
* Validation and source errors propagate even when another child is absent.
* An outer {@link withDefault} replaces the entire absent group, while
* {@link option} returns `None`. Apply defaults to individual children to
* preserve the values of other children.
*
* Unlike a `Schema.Struct` passed to {@link schema}, `all` combines independent
* lookups. A struct validates an existing object and fails when required fields
* are missing; `all` can recover missing children through a group default.
*
* **Example** (Defaulting an incomplete config group)
*
* ```ts import.meta.vitest
* import { Config, ConfigProvider, Effect } from "effect"
*
* const dbConfig = Config.all({
*   host: Config.String("host"),
*   port: Config.Number("port")
* }).pipe(Config.withDefault({ host: "localhost", port: 5432 }))
*
* const provider = ConfigProvider.fromUnknown({ host: "db.internal", port: 6000 })
* await Effect.runPromise(dbConfig.parse(provider)) // => { host: "db.internal", port: 6000 }
*
* const missingPort = ConfigProvider.fromUnknown({ host: "db.internal" })
* await Effect.runPromise(dbConfig.parse(missingPort)) // => { host: "localhost", port: 5432 }
* ```
*
* @category combinators
* @since 2.0.0
*/
function all(arg) {
	const configs = globalThis.Array.isArray(arg) ? arg : Symbol.iterator in arg ? [...arg] : arg;
	return make$1((provider, pathPrefix) => globalThis.Array.isArray(configs) ? mapEager(all$1(configs.map((config) => evaluateAt(config, provider, pathPrefix))), all$3) : mapEager(all$1(map$6(configs, (config) => evaluateAt(config, provider, pathPrefix))), all$3));
}
/**
* Provides a fallback value when the config is absent.
*
* **When to use**
*
* Use when you need to make a config key optional with a sensible default.
*
* **Gotchas**
*
* Validation and source errors still propagate. For an {@link all} group, any
* absent child causes the default to replace the entire group unless another
* child fails. Apply defaults to individual children to preserve other values.
*
* A schema that successfully decodes absent input keeps its decoded value
* instead of using the default. Schema configs first represent a missing or
* incompatible provider shape as `undefined`; the default is used only when
* the schema rejects that value and no relevant input was found.
*
* **Example** (Defaulting a missing port)
*
* ```ts import.meta.vitest
* import { Config, ConfigProvider, Effect } from "effect"
*
* const port = Config.Number("port").pipe(Config.withDefault(3000))
*
* const provider = ConfigProvider.fromUnknown({})
* Effect.runSync(port.parse(provider)) // => 3000
* ```
*
* @see {@link option} – returns `Option` instead of a default value
* @see {@link orElse} – catches all errors, not just absent input
*
* @category combinators
* @since 2.0.0
*/
const withDefault = /*#__PURE__*/ dual(2, (self, defaultValue) => {
	return make$1((provider, pathPrefix) => mapEager(evaluateAt(self, provider, pathPrefix), (resolution) => isFailure(resolution) ? succeed$7(defaultValue) : resolution));
});
const isSourceError = (u) => isTagged(u, "SourceError");
const cursorToString = () => "<configuration>";
const loadCursor = (provider, path) => provider.load(path).pipe(orDie, mapEager((node) => ({
	provider,
	path,
	node,
	toString: cursorToString
})));
const loadChildCursor = (cursor, segment) => loadCursor(cursor.provider, [...cursor.path, segment]);
const decodeFromCursor = (ast, decode) => decodeTo$1(unknown, ast, new Transformation(transformEffect$1((input) => decode(input)), passthrough$1()));
const isScalarInput = (ast) => {
	switch (ast._tag) {
		case "Union": return ast.types.every(isScalarInput);
		case "Objects":
		case "Arrays":
		case "Suspend": return false;
		default: return true;
	}
};
const hasProviderInput = (ast, node) => {
	switch (ast._tag) {
		case "Objects": return node?._tag === "Record";
		case "Arrays": return node?._tag === "Array";
		case "Union": return ast.types.some((ast) => hasProviderInput(ast, node));
		case "Suspend": return hasProviderInput(ast.thunk(), node);
		default: return node?.value !== void 0;
	}
};
const toConfigCursorAST = /*#__PURE__*/ memoize((root) => {
	const seen = /* @__PURE__ */ new WeakSet();
	const recur = applyToSelfOrLastLinkEncoding((ast) => {
		seen.add(ast);
		switch (ast._tag) {
			case "Objects": {
				const matchesIndex = ast.indexSignatures.map((is) => _is(is.parameter));
				const materialize = fnUntraced(function* (cursor) {
					if (cursor.node?._tag !== "Record") return;
					const node = cursor.node;
					const keys = /* @__PURE__ */ new Set();
					for (const property of ast.propertySignatures) if (typeof property.name === "string") keys.add(property.name);
					if (matchesIndex.length > 0) {
						for (const key of node.keys) if (matchesIndex.some((matches) => matches(key))) keys.add(key);
					}
					const out = {};
					for (const key of keys) {
						const child = yield* loadChildCursor(cursor, key);
						if (child.node !== void 0) assignProperty(out, key, child);
					}
					return out;
				});
				return decodeFromCursor(ast.recur(recur, (ast) => ast), materialize);
			}
			case "Arrays": {
				const materialize = fnUntraced(function* (cursor) {
					if (cursor.node?._tag !== "Array") return;
					const out = [];
					for (let i = 0; i < cursor.node.length; i++) out.push(yield* loadChildCursor(cursor, i));
					return out;
				});
				return decodeFromCursor(ast.recur(recur), materialize);
			}
			case "Union":
				for (const member of ast.types) recur(member);
				if (!isScalarInput(ast)) return ast.recur(recur);
				break;
			case "Suspend": {
				const target = ast.thunk();
				if (!seen.has(target)) recur(target);
				return ast.recur(recur);
			}
			case "Declaration":
			case "Any": throw new globalThis.Error("Config.schema does not support opaque StringTree encodings", { cause: ast });
		}
		return decodeFromCursor(ast, (cursor) => succeed$3(cursor.node?.value));
	});
	return recur(root);
});
/**
* Creates a `Config<T>` from a `Schema.Codec`.
*
* **When to use**
*
* Use when you need to read structured or schema-validated configuration.
*
* **Details**
*
* The optional `path` sets the local path segment(s) for the config lookup.
* It is appended to the logical path prefix accumulated from outer
* {@link nested} calls. Pass a single string for a flat key or an array for
* nested paths.
*
* Convenience constructors such as `String`, `Number`, and `Boolean` delegate
* to this API.
*
* The codec is converted to its canonical `StringTree` form. Its encoded shape
* determines how provider data is loaded: scalar schemas read a co-located
* scalar value, object schemas read declared properties and matching record
* keys, and array schemas read indexed children. A mixed-shape union loads each
* member according to that member's shape before applying the union's mode and
* checks.
*
* At the config's lookup path, a missing node or a node that cannot provide the
* representation required by the schema is decoded as `undefined`. Missing
* object properties remain omitted so the schema's property semantics still
* apply. Decoding success always wins, even when no provider input was found.
* For example,
* `Schema.UndefinedOr(Schema.String)` decodes to `undefined` and is not replaced
* by {@link withDefault}. If decoding fails and no relevant representation was
* found, the config is absent. Invalid data in a relevant representation is a
* validation failure. Provider `SourceError`s are always failures.
*
* **Gotchas**
*
* Plain `Schema.Array` and `Schema.Record` schemas use structural provider
* input. Use {@link Array} or {@link Record} when a flat separated string must
* also be accepted.
*
* `Schema.Struct` and {@link all} describe different lookup models. An
* existing object, even an empty one, is validated as a whole by a struct;
* missing required fields cause a validation failure. An `all` group combines
* independent lookups and is absent if any child is absent and none fail.
*
* The canonical `StringTree` encoding must expose a concrete scalar, object,
* array, or union shape. Opaque encodings such as `Schema.Any`,
* `Schema.Unknown`, `Schema.ObjectKeyword`, `Schema.Json`, and
* `Schema.MutableJson` are rejected synchronously when this config is
* constructed, including when they are nested in another schema. Suspended
* recursive schemas remain supported when their eventual shape is concrete.
* Declarations such as `Schema.URL` also remain supported when their canonical
* encoding has a concrete shape. To read arbitrary JSON from one scalar value,
* use `Schema.fromJsonString(Schema.Json)`.
*
* **Example** (Reading a structured config)
*
* ```ts import.meta.vitest
* import { Config, ConfigProvider, Effect, Schema } from "effect"
*
* const DbConfig = Config.schema(
*   Schema.Struct({
*     host: Schema.String,
*     port: Schema.Int
*   }),
*   "db"
* )
*
* const provider = ConfigProvider.fromUnknown({
*   db: { host: "localhost", port: 5432 }
* })
*
* Effect.runSync(DbConfig.parse(provider)) // => { host: "localhost", port: 5432 }
* ```
*
* @see {@link String} / {@link Number} / {@link Boolean} – shortcuts for
*   single-value configs
*
* @category schemas
* @since 4.0.0
*/
function schema(codec, path) {
	const codecStringTree = toCodecStringTree(codec);
	const encodedAst = toEncoded(codecStringTree.ast);
	const decodeCursor = decodeUnknownEffect$1(make$13(toConfigCursorAST(codecStringTree.ast)));
	const localPath = typeof path === "string" ? [path] : path ?? [];
	return make$1((provider, pathPrefix) => {
		const fullPath = [...pathPrefix, ...localPath];
		return loadCursor(provider, fullPath).pipe(flatMapEager((cursor) => decodeCursor(cursor).pipe(mapEager(succeed$7), catchEager((issue) => {
			const error = new ConfigError(new SchemaError(fullPath.length > 0 ? new Pointer(fullPath, issue) : issue));
			return hasProviderInput(encodedAst, cursor.node) ? fail$3(error) : succeed$3(fail$6(error));
		}))), catchDefect((defect) => isSourceError(defect) ? fail$3(new ConfigError(defect)) : die(defect)));
	});
}
/**
* Creates a config for a single string value.
*
* **When to use**
*
* Use when reading a single string env var or config key.
*
* **Details**
*
* Shortcut for `Config.schema(Schema.String, name)`.
*
* **Example** (Reading a string config)
*
* ```ts import.meta.vitest
* import { Config, ConfigProvider, Effect } from "effect"
*
* const host = Config.String("HOST")
*
* const provider = ConfigProvider.fromUnknown({ HOST: "localhost" })
* Effect.runSync(host.parse(provider)) // => "localhost"
* ```
*
* @see {@link NonEmptyString} – rejects empty strings
* @see {@link schema} – for more complex types
*
* @category constructors
* @since 2.0.0
*/
function String$1(name) {
	return schema(String$2, name);
}
//#endregion
//#region src/mailbox.ts
/** One scoped owner runs mutations in arrival order; no lock or shared permit. */
const makeMailbox = gen(function* () {
	const jobs = yield* unbounded();
	yield* fromQueue(jobs).pipe(runForEach((job) => job), forkScoped);
	return { run: (operation) => gen(function* () {
		const context$2 = yield* context();
		const reply = yield* make$21();
		yield* offer(jobs, operation.pipe(provideContext(context$2), exit, flatMap((result) => done(reply, result)), asVoid));
		return yield* _await(reply);
	}) };
});
//#endregion
//#region src/runtime.ts
var ProxyRuntime = class extends Service()("agent-proxy/Runtime") {};
//#endregion
//#region src/storage.ts
var ProxyStorage = class extends Service()("agent-proxy/Storage") {};
const layer$1 = (host) => effect(ProxyStorage, gen(function* () {
	const mailbox = yield* makeMailbox;
	const crypto = yield* Crypto;
	const failure = () => new ModelProxyError({ operation: "storage" });
	const get = (name) => host.secrets.get(name).pipe(map$2((value) => value === null ? none() : some(Uint8Array.from(Buffer.from(value, "base64")))), mapError$2(failure));
	const set = (name, value) => host.secrets.set(name, Buffer.from(value).toString("base64")).pipe(mapError$2(failure));
	return ProxyStorage.of({
		get,
		set: (name, value) => set(name, value).pipe(mailbox.run),
		create: (name, value) => gen(function* () {
			if (isSome(yield* get(name))) return yield* failure();
			yield* set(name, value);
		}).pipe(mailbox.run),
		remove: (name) => host.secrets.remove(name).pipe(mapError$2(failure), mailbox.run),
		getOrCreateRandom: (name, bytes) => gen(function* () {
			const previous = yield* get(name);
			if (isSome(previous)) return previous.value;
			const value = yield* crypto.randomBytes(bytes).pipe(mapError$2(failure));
			yield* set(name, value);
			return value;
		}).pipe(mailbox.run)
	});
}));
//#endregion
//#region src/quota.ts
const percent = (value) => Math.max(0, Math.min(100, value));
function codexRateLimitsToLimits(input) {
	const monthly = ["free", "go"].includes(input.snapshot.planType ?? "");
	const windows = [];
	for (const [id, value, fallback] of [[
		"primary",
		input.snapshot.primary,
		monthly ? 43200 : 300
	], [
		"secondary",
		input.snapshot.secondary,
		10080
	]]) {
		if (!value || !Number.isFinite(value.usedPercent)) continue;
		const minutes = value.windowDurationMins ?? fallback;
		const kind = minutes >= 43200 ? "monthly" : minutes >= 10080 ? "weekly" : "session";
		windows.push({
			id,
			kind,
			label: kind === "monthly" ? "Monthly" : kind === "weekly" ? "Weekly" : "Session",
			usedPercent: percent(value.usedPercent),
			windowDurationMins: minutes,
			...value.resetsAt && Number.isFinite(value.resetsAt) ? { resetsAt: (/* @__PURE__ */ new Date(value.resetsAt * 1e3)).toISOString() } : {}
		});
	}
	return {
		checkedAt: input.checkedAt,
		windows
	};
}
function claudeUsageResponseToLimits(input) {
	const windows = [];
	for (const [id, kind, label, value, minutes] of [[
		"five_hour",
		"session",
		"Session",
		input.response.rate_limits.five_hour,
		300
	], [
		"seven_day",
		"weekly",
		"Weekly",
		input.response.rate_limits.seven_day,
		10080
	]]) if (value) windows.push({
		id,
		kind,
		label,
		usedPercent: percent(value.utilization),
		windowDurationMins: minutes,
		...value.resets_at ? { resetsAt: value.resets_at } : {}
	});
	return { limits: {
		checkedAt: input.checkedAt,
		windows
	} };
}
//#endregion
//#region src/modelProxyOAuth.ts
const googleScopes = "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
/** CLI OAuth flows. Google clients are supplied by the server operator. */
const PROXY_OAUTH = {
	codex: {
		clientId: "app_EMoamEEZ73f0CkXaXp7hrann",
		authorizeUrl: "https://auth.openai.com/oauth/authorize",
		tokenUrl: "https://auth.openai.com/oauth/token",
		redirectUri: "http://localhost:1455/auth/callback",
		scope: "openid email profile offline_access"
	},
	claude: {
		clientId: "9d1c250a-e61b-44d9-88ed-5944d1962f5e",
		authorizeUrl: "https://claude.ai/oauth/authorize",
		tokenUrl: "https://platform.claude.com/v1/oauth/token",
		redirectUri: "http://localhost:54545/callback",
		scope: "user:profile user:inference user:sessions:claude_code user:mcp_servers user:file_upload"
	},
	gemini: {
		clientId: "",
		authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
		tokenUrl: "https://oauth2.googleapis.com/token",
		redirectUri: "http://localhost:8085/oauth2callback",
		scope: googleScopes
	},
	antigravity: {
		clientId: "",
		authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
		tokenUrl: "https://oauth2.googleapis.com/token",
		redirectUri: "http://localhost:51121/oauth-callback",
		scope: `${googleScopes} https://www.googleapis.com/auth/cclog https://www.googleapis.com/auth/experimentsandconfigs`
	},
	kimi: {
		clientId: "17e5f671-d194-4dfb-9706-5516cb48c098",
		tokenUrl: "https://auth.kimi.com/api/oauth/token",
		deviceUrl: "https://auth.kimi.com/api/oauth/device_authorization",
		scope: ""
	},
	xai: {
		clientId: "b1a00492-073a-47ea-816f-4c329264a828",
		tokenUrl: "https://auth.x.ai/oauth/token",
		discoveryUrl: "https://auth.x.ai/.well-known/openid-configuration",
		scope: "openid profile email offline_access grok-cli:access api:access"
	}
};
const ProxyTokenResponse = Struct({
	access_token: NonEmptyString,
	refresh_token: optional(String$2),
	id_token: optional(String$2),
	expires_in: optional(Number$1),
	account: optional(Struct({
		uuid: optional(String$2),
		email_address: optional(String$2)
	}))
});
const ProxyDeviceResponse = Struct({
	device_code: NonEmptyString,
	user_code: String$2,
	verification_uri: String$2,
	verification_uri_complete: optional(String$2),
	interval: optional(Number$1),
	expires_in: optional(Number$1)
});
//#endregion
//#region src/modelProxyCallback.ts
/** A scoped receiver for browser sign-in on the server machine; remote clients can paste URLs. */
const receiveProxyCallback = fn("receiveProxyCallback")(function* (redirectUri, state) {
	const redirect = new URL(redirectUri);
	const callback = Promise.withResolvers();
	yield* acquireRelease(tryPromise({
		try: () => new Promise((resolve, reject) => {
			const server = NodeHttp.createServer((request, response) => {
				const url = new URL(request.url ?? "/", redirect);
				if (request.method !== "GET" || url.pathname !== redirect.pathname || url.searchParams.get("state") !== state) {
					response.writeHead(400).end("This sign-in callback is not valid.");
					return;
				}
				callback.resolve(url.toString());
				response.writeHead(200, {
					"Content-Type": "text/plain; charset=utf-8",
					"Cache-Control": "no-store"
				}).end("Sign-in received. Return to T3 Code to check your account.");
			});
			server.once("error", reject);
			server.listen(Number(redirect.port), "localhost", () => {
				server.off("error", reject);
				resolve(server);
			});
		}),
		catch: () => new ModelProxyError({ operation: "callback" })
	}), (server) => promise(() => new Promise((resolve) => {
		server.closeAllConnections();
		server.close(() => resolve());
	})));
	return yield* tryPromise({
		try: () => callback.promise,
		catch: () => new ModelProxyError({ operation: "callback" })
	});
});
//#endregion
//#region src/modelProxyProtocols.ts
const ProxyPayload = Record(String$2, Unknown);
const decodePayload = decodeUnknownSync(ProxyPayload);
const isPayload = is(ProxyPayload);
function object(value) {
	return isPayload(value) ? value : {};
}
function array(value) {
	return Array.isArray(value) ? value : [];
}
function text(value) {
	if (typeof value === "string") return value;
	return array(value).map((part) => object(part).text ?? "").join("");
}
function proxyProviderForModel(model) {
	const prefix = model.split("/")[0];
	if ([
		"codex",
		"claude",
		"gemini",
		"antigravity",
		"kimi",
		"xai"
	].includes(prefix)) return prefix;
	if (model.startsWith("claude-")) return "claude";
	if (model.startsWith("gemini-")) return "gemini";
	if (model.startsWith("grok-")) return "xai";
	if (model.startsWith("kimi-")) return "kimi";
	return "codex";
}
function unprefixProxyModel(model) {
	const provider = proxyProviderForModel(model);
	return model.startsWith(`${provider}/`) ? model.slice(provider.length + 1) : model;
}
function chatToResponses(body) {
	const instructions = [];
	const input = array(body.messages).flatMap((raw) => {
		const message = object(raw);
		if (message.role === "system" || message.role === "developer") {
			instructions.push(text(message.content));
			return [];
		}
		if (message.role === "tool") return [{
			type: "function_call_output",
			call_id: message.tool_call_id,
			output: text(message.content)
		}];
		const result = [];
		if (message.content !== null && message.content !== void 0) {
			const content = typeof message.content === "string" ? [{
				type: message.role === "assistant" ? "output_text" : "input_text",
				text: message.content
			}] : array(message.content).map((rawPart) => {
				const part = object(rawPart);
				if (part.type === "image_url") return {
					type: "input_image",
					image_url: object(part.image_url).url
				};
				return {
					...part,
					type: message.role === "assistant" ? "output_text" : "input_text"
				};
			});
			result.push({
				role: message.role,
				content
			});
		}
		for (const rawCall of array(message.tool_calls)) {
			const call = object(rawCall);
			const fn = object(call.function);
			result.push({
				type: "function_call",
				call_id: call.id,
				name: fn.name,
				arguments: fn.arguments
			});
		}
		return result;
	});
	return {
		model: body.model,
		input,
		instructions: instructions.join("\n\n"),
		...body.tools ? { tools: array(body.tools).map((raw) => {
			const tool = object(raw);
			return tool.type === "function" ? {
				type: "function",
				...object(tool.function)
			} : tool;
		}) } : {},
		...body.tool_choice ? { tool_choice: typeof body.tool_choice === "object" ? {
			type: "function",
			name: object(object(body.tool_choice).function).name
		} : body.tool_choice } : {},
		...body.parallel_tool_calls !== void 0 ? { parallel_tool_calls: body.parallel_tool_calls } : {},
		...body.reasoning_effort ? { reasoning: { effort: body.reasoning_effort } } : {},
		...body.response_format ? { text: { format: body.response_format } } : {},
		...body.service_tier ? { service_tier: body.service_tier } : {},
		...body.max_tokens ?? body.max_completion_tokens ? { max_output_tokens: body.max_tokens ?? body.max_completion_tokens } : {},
		...body.temperature !== void 0 ? { temperature: body.temperature } : {},
		...body.top_p !== void 0 ? { top_p: body.top_p } : {}
	};
}
function chatToClaude(body) {
	const system = [];
	const messages = array(body.messages).flatMap((raw) => {
		const message = object(raw);
		if (message.role === "system" || message.role === "developer") {
			system.push({
				type: "text",
				text: text(message.content)
			});
			return [];
		}
		if (message.role === "tool") return [{
			role: "user",
			content: [{
				type: "tool_result",
				tool_use_id: message.tool_call_id,
				content: text(message.content)
			}]
		}];
		const content = typeof message.content === "string" ? [{
			type: "text",
			text: message.content
		}] : array(message.content).map((part) => {
			const value = object(part);
			if (value.type !== "image_url") return value;
			const url = String(object(value.image_url).url ?? "");
			const match = /^data:([^;]+);base64,(.+)$/su.exec(url);
			return {
				type: "image",
				source: match ? {
					type: "base64",
					media_type: match[1],
					data: match[2]
				} : {
					type: "url",
					url
				}
			};
		});
		for (const rawCall of array(message.tool_calls)) {
			const call = object(rawCall);
			const fn = object(call.function);
			const input = typeof fn.arguments === "string" ? decodePayload(JSON.parse(fn.arguments)) : {};
			content.push({
				type: "tool_use",
				id: call.id,
				name: fn.name,
				input
			});
		}
		return [{
			role: message.role === "assistant" ? "assistant" : "user",
			content
		}];
	});
	return {
		model: body.model,
		messages,
		system,
		max_tokens: body.max_tokens ?? body.max_completion_tokens ?? 8192,
		stream: body.stream ?? false,
		...body.tools ? { tools: array(body.tools).map((raw) => {
			const fn = object(object(raw).function);
			return {
				name: fn.name,
				description: fn.description,
				input_schema: fn.parameters
			};
		}) } : {},
		...body.temperature !== void 0 ? { temperature: body.temperature } : {},
		...body.tool_choice ? { tool_choice: body.tool_choice === "required" ? { type: "any" } : body.tool_choice === "auto" ? { type: "auto" } : body.tool_choice === "none" ? { type: "none" } : {
			type: "tool",
			name: object(object(body.tool_choice).function).name
		} } : {}
	};
}
function responsesToChat(body) {
	const messages = body.instructions ? [{
		role: "system",
		content: text(body.instructions)
	}] : [];
	const input = typeof body.input === "string" ? [{
		role: "user",
		content: body.input
	}] : array(body.input);
	for (const raw of input) {
		const item = object(raw);
		if (item.type === "function_call") messages.push({
			role: "assistant",
			content: null,
			tool_calls: [{
				id: item.call_id,
				type: "function",
				function: {
					name: item.name,
					arguments: item.arguments
				}
			}]
		});
		else if (item.type === "function_call_output") messages.push({
			role: "tool",
			tool_call_id: item.call_id,
			content: item.output
		});
		else if (item.role) messages.push({
			role: item.role,
			content: typeof item.content === "string" ? item.content : array(item.content).map((rawPart) => {
				const part = object(rawPart);
				return part.type === "input_image" ? {
					type: "image_url",
					image_url: { url: part.image_url }
				} : {
					type: "text",
					text: part.text
				};
			})
		});
	}
	return {
		...body,
		messages,
		max_tokens: body.max_output_tokens,
		reasoning_effort: object(body.reasoning).effort,
		tools: array(body.tools).map((raw) => {
			const tool = object(raw);
			return {
				type: "function",
				function: {
					name: tool.name,
					description: tool.description,
					parameters: tool.parameters
				}
			};
		}),
		...typeof body.tool_choice === "object" ? { tool_choice: {
			type: "function",
			function: { name: object(body.tool_choice).name }
		} } : {}
	};
}
function claudeToChat(body) {
	const messages = body.system ? [{
		role: "system",
		content: text(body.system)
	}] : [];
	for (const raw of array(body.messages)) {
		const message = object(raw);
		if (typeof message.content === "string") {
			messages.push(message);
			continue;
		}
		const content = [];
		const tools = [];
		for (const rawPart of array(message.content)) {
			const part = object(rawPart);
			if (part.type === "tool_result") messages.push({
				role: "tool",
				tool_call_id: part.tool_use_id,
				content: text(part.content)
			});
			else if (part.type === "tool_use") tools.push({
				id: part.id,
				type: "function",
				function: {
					name: part.name,
					arguments: JSON.stringify(part.input)
				}
			});
			else if (part.type === "text") content.push({
				type: "text",
				text: part.text
			});
			else if (part.type === "image") {
				const source = object(part.source);
				content.push({
					type: "image_url",
					image_url: { url: source.type === "url" ? source.url : `data:${source.media_type};base64,${source.data}` }
				});
			}
		}
		if (content.length || tools.length) messages.push({
			role: message.role,
			content: content.length ? content : null,
			...tools.length ? { tool_calls: tools } : {}
		});
	}
	const choice = object(body.tool_choice);
	return {
		model: body.model,
		messages,
		stream: body.stream,
		max_tokens: body.max_tokens,
		temperature: body.temperature,
		top_p: body.top_p,
		tools: array(body.tools).map((raw) => {
			const tool = object(raw);
			return {
				type: "function",
				function: {
					name: tool.name,
					description: tool.description,
					parameters: tool.input_schema
				}
			};
		}),
		...choice.type ? { tool_choice: choice.type === "tool" ? {
			type: "function",
			function: { name: choice.name }
		} : choice.type === "any" ? "required" : choice.type } : {}
	};
}
function chatToGoogle(body) {
	const system = [];
	const choice = object(body.tool_choice);
	const functionName = object(choice.function).name;
	const toolMode = body.tool_choice === "none" ? "NONE" : body.tool_choice === "auto" ? "AUTO" : body.tool_choice === "required" || choice.type === "function" ? "ANY" : void 0;
	const maxOutputTokens = body.max_tokens ?? body.max_completion_tokens;
	const toolNames = /* @__PURE__ */ new Map();
	return {
		contents: array(body.messages).flatMap((raw) => {
			const message = object(raw);
			if (message.role === "system" || message.role === "developer") {
				system.push({ text: text(message.content) });
				return [];
			}
			if (message.role === "tool") return [{
				role: "user",
				parts: [{ functionResponse: {
					name: toolNames.get(String(message.tool_call_id)) ?? "tool",
					response: { result: message.content }
				} }]
			}];
			const parts = typeof message.content === "string" ? [{ text: message.content }] : array(message.content).map((rawPart) => {
				const part = object(rawPart);
				if (part.type !== "image_url") return { text: part.text };
				const url = String(object(part.image_url).url);
				const match = /^data:([^;]+);base64,(.+)$/su.exec(url);
				return match ? { inlineData: {
					mimeType: match[1],
					data: match[2]
				} } : { fileData: { fileUri: url } };
			});
			for (const rawCall of array(message.tool_calls)) {
				const call = object(rawCall);
				const fn = object(call.function);
				toolNames.set(String(call.id), String(fn.name));
				parts.push({ functionCall: {
					name: fn.name,
					args: typeof fn.arguments === "string" ? JSON.parse(fn.arguments) : {}
				} });
			}
			return parts.length ? [{
				role: message.role === "assistant" ? "model" : "user",
				parts
			}] : [];
		}),
		...system.length ? { systemInstruction: { parts: system } } : {},
		generationConfig: {
			...maxOutputTokens !== void 0 ? { maxOutputTokens } : {},
			...body.temperature !== void 0 ? { temperature: body.temperature } : {},
			...body.top_p !== void 0 ? { topP: body.top_p } : {}
		},
		...array(body.tools).length ? { tools: [{ functionDeclarations: array(body.tools).map((raw) => object(object(raw).function)) }] } : {},
		...toolMode ? { toolConfig: { functionCallingConfig: {
			mode: toolMode,
			...choice.type === "function" && typeof functionName === "string" ? { allowedFunctionNames: [functionName] } : {}
		} } } : {}
	};
}
/** Request shape sent upstream; the original protocol stays intact on native routes. */
function prepareProxyRequest(provider, apiKey, path, payload) {
	const queryIndex = path.indexOf("?");
	const route = queryIndex === -1 ? path : path.slice(0, queryIndex);
	const query = queryIndex === -1 ? "" : path.slice(queryIndex);
	const chat = route === "/v1/chat/completions";
	const body = {
		...payload,
		...typeof payload.model === "string" ? { model: unprefixProxyModel(payload.model) } : {}
	};
	const responses = route === "/v1/responses";
	const messages = route === "/v1/messages";
	const normalized = responses ? responsesToChat(body) : messages ? claudeToChat(body) : body;
	if (provider === "codex") {
		if (!responses && route !== "/v1/responses/compact" && !chat && !messages) throw new ModelProxyError({ operation: "unsupported" });
		const converted = chat || messages ? chatToResponses(normalized) : body;
		const translation = chat ? "responses-chat" : messages ? "responses-claude" : "native";
		if (apiKey) return {
			url: `https://api.openai.com${chat || messages ? "/v1/responses" : route + query}`,
			body: {
				...converted,
				stream: body.stream ?? false
			},
			translation
		};
		const { max_output_tokens: _max, temperature: _temperature, top_p: _topP, previous_response_id: _previous, ...supported } = converted;
		const compact = route.endsWith("/compact");
		return {
			url: `https://chatgpt.com/backend-api/codex/responses${compact ? "/compact" : ""}${translation === "native" ? query : ""}`,
			body: {
				...supported,
				...typeof supported.input === "string" ? { input: [{
					role: "user",
					content: [{
						type: "input_text",
						text: supported.input
					}]
				}] } : {},
				instructions: supported.instructions ?? "",
				store: false,
				...!compact ? { stream: true } : {}
			},
			translation
		};
	}
	if (provider === "claude" || provider === "kimi") {
		if (!messages && route !== "/v1/messages/count_tokens" && !chat && !responses) throw new ModelProxyError({ operation: "unsupported" });
		return {
			url: `${provider === "claude" ? "https://api.anthropic.com" : "https://api.kimi.com/coding"}${chat || responses ? "/v1/messages" : route + query}`,
			body: chat || responses ? chatToClaude(normalized) : body,
			translation: chat ? "claude-chat" : responses ? "claude-responses" : "native"
		};
	}
	if (provider === "xai") {
		if (!chat && !responses && !messages) throw new ModelProxyError({ operation: "unsupported" });
		return {
			url: `${apiKey ? "https://api.x.ai" : "https://cli-chat-proxy.grok.com"}${messages ? "/v1/chat/completions" : route + query}`,
			body: messages ? normalized : body,
			translation: messages ? "chat-claude" : "native"
		};
	}
	if (chat || responses || messages) {
		const model = String(body.model);
		const method = body.stream === true ? "streamGenerateContent?alt=sse" : "generateContent";
		const request = chatToGoogle(normalized);
		const translation = chat ? "google-chat" : responses ? "google-responses" : "google-claude";
		return {
			url: apiKey ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:${method}` : `https://cloudcode-pa.googleapis.com/v1internal:${method}`,
			body: apiKey ? request : {
				model,
				request
			},
			translation
		};
	}
	const match = /^\/v1beta\/models\/([A-Za-z0-9][A-Za-z0-9._-]*):(generateContent|streamGenerateContent|countTokens)$/u.exec(route);
	if (!match) throw new ModelProxyError({ operation: "unsupported" });
	const model = match[1];
	const operation = match[2];
	if (apiKey && provider === "gemini") return {
		url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:${operation}${query}`,
		body,
		translation: "native"
	};
	if (operation === "countTokens") return {
		url: "https://cloudcode-pa.googleapis.com/v1internal:countTokens",
		body: { request: {
			...body,
			model: `models/${model}`
		} },
		translation: "native"
	};
	return {
		url: `https://cloudcode-pa.googleapis.com/v1internal:${operation}${new URLSearchParams(query).get("alt") === "sse" ? "?alt=sse" : ""}`,
		body: {
			model,
			request: body
		},
		translation: "google-native"
	};
}
function proxyChatResponse(translation, raw, model) {
	if (translation === "native") return raw;
	if (translation === "google-native") return object(raw.response);
	if (translation === "chat-claude") return chatToClient(raw, "claude", model);
	if (translation.startsWith("google-")) {
		const response = raw.response ? object(raw.response) : raw;
		const candidate = object(array(response.candidates)[0]);
		const parts = array(object(candidate.content).parts);
		const metadata = object(response.usageMetadata);
		const tools = parts.filter((part) => object(part).functionCall).map((part, index) => {
			const fn = object(object(part).functionCall);
			return {
				id: `call_${index}`,
				type: "function",
				function: {
					name: fn.name,
					arguments: JSON.stringify(fn.args ?? {})
				}
			};
		});
		return chatToClient({
			id: response.responseId ?? "t3-proxy",
			object: "chat.completion",
			model,
			choices: [{
				index: 0,
				message: {
					role: "assistant",
					content: parts.filter((part) => !object(part).thought).map((part) => object(part).text ?? "").join(""),
					...tools.length ? { tool_calls: tools } : {}
				},
				finish_reason: tools.length ? "tool_calls" : candidate.finishReason === "MAX_TOKENS" ? "length" : "stop"
			}],
			usage: {
				prompt_tokens: metadata.promptTokenCount ?? 0,
				completion_tokens: metadata.candidatesTokenCount ?? 0,
				total_tokens: metadata.totalTokenCount ?? 0
			}
		}, translation.endsWith("-responses") ? "responses" : translation.endsWith("-claude") ? "claude" : "chat", model);
	}
	const claude = translation.startsWith("claude-");
	const content = claude ? array(raw.content) : array(raw.output).flatMap((item) => array(object(item).content));
	const tools = claude ? array(raw.content).filter((item) => object(item).type === "tool_use") : array(raw.output).filter((item) => object(item).type === "function_call");
	const usage = object(raw.usage);
	return chatToClient({
		id: raw.id,
		object: "chat.completion",
		model,
		choices: [{
			index: 0,
			message: {
				role: "assistant",
				content: content.filter((item) => ["text", "output_text"].includes(String(object(item).type))).map((item) => object(item).text ?? "").join("") || null,
				...tools.length ? { tool_calls: tools.map((rawTool) => {
					const tool = object(rawTool);
					return {
						id: tool.call_id ?? tool.id,
						type: "function",
						function: {
							name: tool.name,
							arguments: claude ? JSON.stringify(tool.input) : tool.arguments
						}
					};
				}) } : {}
			},
			finish_reason: tools.length ? "tool_calls" : raw.stop_reason === "max_tokens" ? "length" : "stop"
		}],
		usage: {
			prompt_tokens: usage.input_tokens ?? 0,
			completion_tokens: usage.output_tokens ?? 0,
			total_tokens: Number(usage.input_tokens ?? 0) + Number(usage.output_tokens ?? 0)
		}
	}, translation.endsWith("-responses") ? "responses" : translation.endsWith("-claude") ? "claude" : "chat", model);
}
function chatToClient(chat, target, model) {
	if (target === "chat") return chat;
	const choice = object(array(chat.choices)[0]);
	const message = object(choice.message);
	const usage = object(chat.usage);
	const tools = array(message.tool_calls).map(object);
	if (target === "claude") return {
		id: chat.id,
		type: "message",
		role: "assistant",
		model,
		content: [...message.content ? [{
			type: "text",
			text: message.content
		}] : [], ...tools.map((tool) => ({
			type: "tool_use",
			id: tool.id,
			name: object(tool.function).name,
			input: JSON.parse(String(object(tool.function).arguments ?? "{}"))
		}))],
		stop_reason: choice.finish_reason === "tool_calls" ? "tool_use" : choice.finish_reason === "length" ? "max_tokens" : "end_turn",
		stop_sequence: null,
		usage: {
			input_tokens: usage.prompt_tokens ?? 0,
			output_tokens: usage.completion_tokens ?? 0
		}
	};
	return {
		id: chat.id,
		object: "response",
		status: choice.finish_reason === "length" ? "incomplete" : "completed",
		model,
		output: [...message.content ? [{
			id: `${chat.id}_message`,
			type: "message",
			status: "completed",
			role: "assistant",
			content: [{
				type: "output_text",
				text: message.content,
				annotations: []
			}]
		}] : [], ...tools.map((tool) => ({
			id: `${tool.id}_item`,
			type: "function_call",
			status: "completed",
			call_id: tool.id,
			name: object(tool.function).name,
			arguments: object(tool.function).arguments
		}))],
		usage: {
			input_tokens: usage.prompt_tokens ?? 0,
			output_tokens: usage.completion_tokens ?? 0,
			total_tokens: usage.total_tokens ?? 0
		}
	};
}
/** One translator per request so tool indices and completion state cannot leak across streams. */
function makeChatStreamTranslator(translation, model) {
	let id = "t3-proxy";
	let finished = false;
	let inputTokens = 0;
	const indices = /* @__PURE__ */ new Map();
	const chunk = (delta, finishReason = null, usage) => `data: ${JSON.stringify({
		id,
		object: "chat.completion.chunk",
		model,
		choices: [{
			index: 0,
			delta,
			finish_reason: finishReason
		}],
		...usage ? { usage } : {}
	})}\n\n`;
	return (event) => {
		if (finished) return "";
		if (translation === "google-native") return `data: ${JSON.stringify(event.response ?? event)}\n\n`;
		if (translation.startsWith("responses-")) {
			if (event.type === "response.created") {
				id = String(object(event.response).id ?? id);
				return chunk({ role: "assistant" });
			}
			if (event.type === "response.output_text.delta") return chunk({ content: event.delta });
			if (event.type === "response.output_item.added" && object(event.item).type === "function_call") {
				const item = object(event.item);
				const index = indices.size;
				indices.set(String(item.id), index);
				return chunk({ tool_calls: [{
					index,
					id: item.call_id,
					type: "function",
					function: {
						name: item.name,
						arguments: ""
					}
				}] });
			}
			if (event.type === "response.function_call_arguments.delta") return chunk({ tool_calls: [{
				index: indices.get(String(event.item_id)) ?? 0,
				function: { arguments: event.delta }
			}] });
			if (event.type === "response.completed" || event.type === "response.incomplete") {
				finished = true;
				const usage = object(object(event.response).usage);
				return `${chunk({}, event.type === "response.incomplete" ? "length" : indices.size ? "tool_calls" : "stop", {
					prompt_tokens: usage.input_tokens ?? 0,
					completion_tokens: usage.output_tokens ?? 0,
					total_tokens: usage.total_tokens ?? 0
				})}data: [DONE]\n\n`;
			}
			if (event.type === "response.failed" || event.type === "error") {
				finished = true;
				return `data: ${JSON.stringify({ error: event.error ?? object(event.response).error ?? { message: "Upstream generation failed." } })}\n\n`;
			}
			return "";
		}
		if (translation === "chat-claude") return `data: ${JSON.stringify(event)}\n\n`;
		if (translation.startsWith("google-")) {
			const response = event.response ? object(event.response) : event;
			const candidate = object(array(response.candidates)[0]);
			const parts = array(object(candidate.content).parts);
			const metadata = object(response.usageMetadata);
			if (response.responseId) id = String(response.responseId);
			let output = "";
			for (const raw of parts) {
				const part = object(raw);
				if (typeof part.text === "string" && !part.thought) output += chunk({ content: part.text });
				if (part.functionCall) {
					const fn = object(part.functionCall);
					const index = indices.size;
					indices.set(`call_${index}`, index);
					output += chunk({ tool_calls: [{
						index,
						id: `call_${index}`,
						type: "function",
						function: {
							name: fn.name,
							arguments: JSON.stringify(fn.args ?? {})
						}
					}] });
				}
			}
			if (candidate.finishReason) {
				finished = true;
				output += `${chunk({}, indices.size ? "tool_calls" : candidate.finishReason === "MAX_TOKENS" ? "length" : "stop", {
					prompt_tokens: metadata.promptTokenCount ?? 0,
					completion_tokens: metadata.candidatesTokenCount ?? 0,
					total_tokens: metadata.totalTokenCount ?? 0
				})}data: [DONE]\n\n`;
			}
			return output;
		}
		if (event.type === "message_start") {
			id = String(object(event.message).id ?? id);
			inputTokens = Number(object(object(event.message).usage).input_tokens ?? 0);
			return chunk({ role: "assistant" });
		}
		if (event.type === "content_block_start" && object(event.content_block).type === "tool_use") {
			const block = object(event.content_block);
			const index = indices.size;
			indices.set(String(event.index), index);
			return chunk({ tool_calls: [{
				index,
				id: block.id,
				type: "function",
				function: {
					name: block.name,
					arguments: ""
				}
			}] });
		}
		if (event.type === "content_block_delta") {
			const delta = object(event.delta);
			if (delta.type === "text_delta") return chunk({ content: delta.text });
			if (delta.type === "input_json_delta") return chunk({ tool_calls: [{
				index: indices.get(String(event.index)) ?? 0,
				function: { arguments: delta.partial_json }
			}] });
		}
		if (event.type === "message_delta") return chunk({}, object(event.delta).stop_reason === "tool_use" ? "tool_calls" : object(event.delta).stop_reason === "max_tokens" ? "length" : "stop", {
			prompt_tokens: inputTokens,
			completion_tokens: object(event.usage).output_tokens ?? 0,
			total_tokens: inputTokens + Number(object(event.usage).output_tokens ?? 0)
		});
		if (event.type === "message_stop") {
			finished = true;
			return "data: [DONE]\n\n";
		}
		if (event.type === "error") {
			finished = true;
			return `data: ${JSON.stringify({ error: event.error })}\n\n`;
		}
		return "";
	};
}
/** Convert upstream events through chat chunks, keeping each CLI's native streaming protocol. */
function makeProxyStreamTranslator(translation, model) {
	const toChat = makeChatStreamTranslator(translation, model);
	const target = translation.endsWith("-responses") ? "responses" : translation.endsWith("-claude") ? "claude" : "chat";
	if (target === "chat") return toChat;
	const tools = /* @__PURE__ */ new Map();
	let id = "t3-proxy";
	let started = false;
	let textStarted = false;
	let textIndex = 0;
	let content = "";
	let sequence = 0;
	let nextIndex = 0;
	const emit = (type, value) => `event: ${type}\ndata: ${JSON.stringify({
		type,
		...value,
		...target === "responses" ? { sequence_number: sequence++ } : {}
	})}\n\n`;
	return (event) => {
		const data = toChat(event);
		let output = "";
		for (const line of data.split("\n")) {
			if (!line.startsWith("data: ") || line.slice(6) === "[DONE]") continue;
			const chunk = object(JSON.parse(line.slice(6)));
			if (chunk.error) {
				output += emit("error", { error: chunk.error });
				continue;
			}
			id = String(chunk.id ?? id);
			if (!started) {
				started = true;
				output += target === "claude" ? emit("message_start", { message: {
					id,
					type: "message",
					role: "assistant",
					model,
					content: [],
					stop_reason: null,
					stop_sequence: null,
					usage: {
						input_tokens: 0,
						output_tokens: 0
					}
				} }) : emit("response.created", { response: {
					id,
					object: "response",
					model,
					status: "in_progress",
					output: []
				} });
			}
			const choice = object(array(chunk.choices)[0]);
			const delta = object(choice.delta);
			if (typeof delta.content === "string" && delta.content.length > 0) {
				if (!textStarted) {
					textStarted = true;
					textIndex = nextIndex++;
					output += target === "claude" ? emit("content_block_start", {
						index: textIndex,
						content_block: {
							type: "text",
							text: ""
						}
					}) : emit("response.output_item.added", {
						output_index: textIndex,
						item: {
							id: `${id}_message`,
							type: "message",
							status: "in_progress",
							role: "assistant",
							content: []
						}
					}) + emit("response.content_part.added", {
						item_id: `${id}_message`,
						output_index: textIndex,
						content_index: 0,
						part: {
							type: "output_text",
							text: "",
							annotations: []
						}
					});
				}
				content += delta.content;
				output += target === "claude" ? emit("content_block_delta", {
					index: textIndex,
					delta: {
						type: "text_delta",
						text: delta.content
					}
				}) : emit("response.output_text.delta", {
					item_id: `${id}_message`,
					output_index: textIndex,
					content_index: 0,
					delta: delta.content
				});
			}
			for (const rawCall of array(delta.tool_calls)) {
				const call = object(rawCall);
				const fn = object(call.function);
				const key = Number(call.index ?? 0);
				let tool = tools.get(key);
				if (!tool) {
					tool = {
						id: String(call.id),
						name: String(fn.name),
						arguments: "",
						index: nextIndex++
					};
					tools.set(key, tool);
					output += target === "claude" ? emit("content_block_start", {
						index: tool.index,
						content_block: {
							type: "tool_use",
							id: tool.id,
							name: tool.name,
							input: {}
						}
					}) : emit("response.output_item.added", {
						output_index: tool.index,
						item: {
							id: `${tool.id}_item`,
							type: "function_call",
							status: "in_progress",
							call_id: tool.id,
							name: tool.name,
							arguments: ""
						}
					});
				}
				const argumentsDelta = String(fn.arguments ?? "");
				tool.arguments += argumentsDelta;
				if (argumentsDelta) output += target === "claude" ? emit("content_block_delta", {
					index: tool.index,
					delta: {
						type: "input_json_delta",
						partial_json: argumentsDelta
					}
				}) : emit("response.function_call_arguments.delta", {
					item_id: `${tool.id}_item`,
					output_index: tool.index,
					delta: argumentsDelta
				});
			}
			if (choice.finish_reason) {
				const result = chatToClient({
					id,
					choices: [{
						message: {
							content,
							tool_calls: [...tools.values()].map((tool) => ({
								id: tool.id,
								function: {
									name: tool.name,
									arguments: tool.arguments || "{}"
								}
							}))
						},
						finish_reason: choice.finish_reason
					}],
					usage: chunk.usage ?? {}
				}, target, model);
				if (target === "claude") {
					for (let index = 0; index < nextIndex; index++) output += emit("content_block_stop", { index });
					output += emit("message_delta", {
						delta: {
							stop_reason: result.stop_reason,
							stop_sequence: null
						},
						usage: result.usage
					}) + emit("message_stop", {});
				} else {
					const ordered = array(result.output).map(object).map((item) => ({
						item,
						index: item.type === "message" ? textIndex : [...tools.values()].find((tool) => tool.id === item.call_id)?.index ?? 0
					})).sort((left, right) => left.index - right.index);
					if (textStarted) output += emit("response.output_text.done", {
						item_id: `${id}_message`,
						output_index: textIndex,
						content_index: 0,
						text: content
					});
					for (const { index, item } of ordered) output += emit("response.output_item.done", {
						output_index: index,
						item
					});
					output += emit(result.status === "incomplete" ? "response.incomplete" : "response.completed", { response: {
						...result,
						output: ordered.map(({ item }) => item)
					} });
				}
			}
		}
		return output;
	};
}
//#endregion
//#region src/modelProxyBalancer.ts
const decodeJson$1 = decodeUnknownOption(fromJsonString(ProxyPayload));
/** Native CLI identifiers survive changing prompts and compaction; never identify by prompt text. */
function proxySessionId(headers, payload) {
	for (const name of [
		"x-t3-session-id",
		"x-opencode-session",
		"x-opencode-session-id",
		"x-session-affinity",
		"session-id",
		"session_id",
		"x-session-id",
		"x-client-session-id",
		"x-claude-code-session-id",
		"x-grok-conv-id",
		"x-http-session-id"
	]) {
		const value = headers[name]?.trim();
		if (value) return value;
	}
	const metadata = object(payload.metadata);
	const userId = metadata.user_id;
	if (typeof userId === "string") {
		const nested = decodeJson$1(userId);
		if (nested._tag === "Some" && typeof nested.value.session_id === "string") return nested.value.session_id || null;
		const legacy = /_session_(.+)$/u.exec(userId)?.[1];
		if (legacy) return legacy;
	}
	for (const value of [
		payload.session_id,
		metadata.session_id,
		object(payload.conversation).id,
		payload.prompt_cache_key,
		object(payload.request).sessionId,
		payload.sessionId
	]) if (typeof value === "string" && value.trim()) return value.trim();
	return null;
}
/** Prefer the nearest future reset with usable allowance; unknown resets rank last. */
function proxyNextReset(limits, now) {
	const resets = (limits?.windows ?? []).flatMap((window) => {
		if (!window.resetsAt || window.usedPercent >= 100) return [];
		const reset = Date.parse(window.resetsAt);
		return Number.isFinite(reset) && reset > now ? [reset] : [];
	});
	return resets.length ? Math.min(...resets) : Infinity;
}
/** Google reports independent model pools; another model's quota must not affect selection. */
function proxyModelQuota(limits, provider, model) {
	if (!limits || limits.unavailable) return void 0;
	if (provider !== "gemini" && provider !== "antigravity") return limits;
	return {
		...limits,
		windows: limits.windows.filter((window) => window.id === unprefixProxyModel(model))
	};
}
function proxyQuotaExhausted(limits, now) {
	return (limits?.windows ?? []).some((window) => window.usedPercent >= 100 && (!window.resetsAt || Date.parse(window.resetsAt) > now));
}
/** Bind before I/O so concurrent new sessions see one another's reservations. */
var ModelProxyBalancer = class {
	sessions = /* @__PURE__ */ new Map();
	live = /* @__PURE__ */ new Set();
	counts = /* @__PURE__ */ new Map();
	cursors = /* @__PURE__ */ new Map();
	prune(now, idleMs) {
		for (const binding of this.live) if (binding.inFlight === 0 && now - binding.lastUsedAt >= idleMs) this.remove(binding);
	}
	clear() {
		this.sessions.clear();
		this.live.clear();
		this.counts.clear();
		this.cursors.clear();
	}
	invalidate(accountId) {
		for (const binding of this.live) if (binding.accountId === accountId) this.remove(binding);
	}
	activeSessions(accountId) {
		return this.counts.get(accountId) ?? 0;
	}
	remove(binding) {
		if (binding.key && this.sessions.get(binding.key) === binding) this.sessions.delete(binding.key);
		if (!this.live.delete(binding)) return;
		const count = this.activeSessions(binding.accountId) - 1;
		if (count > 0) this.counts.set(binding.accountId, count);
		else this.counts.delete(binding.accountId);
	}
	acquire(input) {
		this.prune(input.now, input.idleMs);
		const key = input.session ? `${input.provider}:${input.session}` : null;
		let binding = key ? this.sessions.get(key) : void 0;
		if (binding && !input.candidates.some((account) => account.id === binding?.accountId)) {
			this.remove(binding);
			binding = void 0;
		}
		if (!binding) {
			const lastId = this.cursors.get(input.provider);
			const start = (input.candidates.findIndex((account) => account.id === lastId) + 1) % Math.max(1, input.candidates.length);
			const rotated = [...input.candidates.slice(start), ...input.candidates.slice(0, start)];
			const counts = new Map(rotated.map((account) => [account.id, this.activeSessions(account.id)]));
			const selected = rotated.toSorted((a, b) => {
				if (input.strategy === "closest-reset") {
					if (a.nextReset === b.nextReset) return 0;
					return a.nextReset < b.nextReset ? -1 : 1;
				}
				if (input.strategy === "least-active-sessions") return counts.get(a.id) - counts.get(b.id);
				return 0;
			})[0];
			if (!selected) return null;
			this.cursors.set(input.provider, selected.id);
			binding = {
				key,
				accountId: selected.id,
				lastUsedAt: input.now,
				inFlight: 0
			};
			this.live.add(binding);
			this.counts.set(selected.id, this.activeSessions(selected.id) + 1);
			if (key) this.sessions.set(key, binding);
		}
		binding.inFlight++;
		binding.lastUsedAt = input.now;
		const reserved = binding;
		let finished = false;
		return {
			accountId: reserved.accountId,
			finish: (now, success) => {
				if (finished) return;
				finished = true;
				reserved.inFlight--;
				reserved.lastUsedAt = now;
				if (!success || !key) {
					if (key && this.sessions.get(key) === reserved) this.sessions.delete(key);
					if (reserved.inFlight === 0) this.remove(reserved);
				} else if (this.sessions.get(key) !== reserved && reserved.inFlight === 0) this.remove(reserved);
			}
		};
	}
};
//#endregion
//#region src/ModelProxy.ts
const StoredAccount = Struct({
	id: String$2,
	name: String$2,
	provider: ModelProxyProvider,
	email: optional(String$2),
	subject: optional(String$2),
	disabled: Boolean$1,
	accessToken: String$2,
	refreshToken: optional(String$2),
	apiKey: Boolean$1,
	expiresAt: Number$1,
	accountId: optional(String$2),
	projectId: optional(String$2),
	tokenUrl: optional(String$2)
});
const State = Struct({
	enabled: Boolean$1,
	strategy: Literals([...ModelProxyStrategy.literals, "fill-first"]),
	stickyIdleMinutes: optional(ModelProxyStickyIdleMinutes),
	accounts: ArraySchema(StoredAccount),
	client: optional(Union([Struct({ type: Literal("local") }), Struct({
		type: Literal("remote"),
		url: String$2,
		apiKey: String$2
	})]))
});
const encodeState = encodeEffect(fromJsonString(State));
const decodeState = decodeUnknownEffect(fromJsonString(State));
const Json = decodeUnknownEffect(ProxyPayload);
const Claims = Struct({
	email: optional(String$2),
	sub: optional(String$2),
	"https://api.openai.com/auth": optional(Struct({ chatgpt_account_id: optional(String$2) }))
});
const TokenImport = Struct({
	type: optional(String$2),
	provider: optional(String$2),
	access_token: optional(String$2),
	refresh_token: optional(String$2),
	api_key: optional(String$2),
	id_token: optional(String$2),
	email: optional(String$2),
	account_id: optional(String$2),
	project_id: optional(String$2),
	expired: optional(String$2),
	expiry_date: optional(Number$1)
});
const Usage = Struct({
	plan_type: optional(String$2),
	rate_limit: optional(NullOr(Struct({
		primary_window: optional(NullOr(Struct({
			used_percent: Number$1,
			reset_at: optional(Number$1),
			limit_window_seconds: optional(Number$1)
		}))),
		secondary_window: optional(NullOr(Struct({
			used_percent: Number$1,
			reset_at: optional(Number$1),
			limit_window_seconds: optional(Number$1)
		})))
	})))
});
const ClaudeUsage = Struct({
	five_hour: optional(NullOr(Struct({
		utilization: Number$1,
		resets_at: NullOr(String$2)
	}))),
	seven_day: optional(NullOr(Struct({
		utilization: Number$1,
		resets_at: NullOr(String$2)
	})))
});
const decodeClaims = decodeUnknownEffect(Claims);
const decodeUsage = decodeUnknownEffect(Usage);
const decodeClaudeUsage = decodeUnknownEffect(ClaudeUsage);
const decodeTokens = decodeUnknownEffect(ProxyTokenResponse);
const decodeImportedToken = decodeUnknownEffect(TokenImport);
const decodeProvider = decodeUnknownEffect(ModelProxyProvider);
const decodeJsonPayload = decodeUnknownEffect(fromJsonString(ProxyPayload));
const encodeJsonPayload = encodeEffect(fromJsonString(ProxyPayload));
const encodeJsonString = encodeEffect(fromJsonString(String$2));
const decodeRemoteAccounts = decodeUnknownEffect(Struct({ accounts: ArraySchema(ModelProxyAccount) }));
const isProxyError = is(ModelProxyError);
const decodeProfile = decodeUnknownEffect(Struct({
	email: optional(String$2),
	id: optional(String$2)
}));
const decodeDevice = decodeUnknownEffect(ProxyDeviceResponse);
const decodeDiscovery = decodeUnknownEffect(Struct({
	device_authorization_endpoint: String$2,
	token_endpoint: String$2
}));
var ModelProxy = class extends Service()("t3/usage/ModelProxy") {};
const layer = effect(ModelProxy, gen(function* () {
	const config = yield* ProxyRuntime;
	const revision = yield* make$6(0);
	const changed = update(revision, (n) => n + 1);
	const serviceScope = yield* Scope;
	const secrets = yield* ProxyStorage;
	const crypto = yield* Crypto;
	const http = yield* HttpClient;
	const googleClients = yield* all({
		geminiId: String$1("T3CODE_PROXY_GEMINI_OAUTH_CLIENT_ID").pipe(withDefault("")),
		geminiSecret: String$1("T3CODE_PROXY_GEMINI_OAUTH_CLIENT_SECRET").pipe(withDefault("")),
		antigravityId: String$1("T3CODE_PROXY_ANTIGRAVITY_OAUTH_CLIENT_ID").pipe(withDefault("")),
		antigravitySecret: String$1("T3CODE_PROXY_ANTIGRAVITY_OAUTH_CLIENT_SECRET").pipe(withDefault(""))
	}).pipe(orDie);
	const oauthClients = {
		...PROXY_OAUTH,
		gemini: {
			...PROXY_OAUTH.gemini,
			clientId: googleClients.geminiId,
			clientSecret: googleClients.geminiSecret
		},
		antigravity: {
			...PROXY_OAUTH.antigravity,
			clientId: googleClients.antigravityId,
			clientSecret: googleClients.antigravitySecret
		}
	};
	const writes = yield* makeMailbox;
	const management = yield* makeMailbox;
	const quotaRefresh = yield* makeMailbox;
	const tokenLocks = /* @__PURE__ */ new Map();
	const pending = /* @__PURE__ */ new Map();
	const receivers = /* @__PURE__ */ new Map();
	const limits = /* @__PURE__ */ new Map();
	const cooldowns = /* @__PURE__ */ new Map();
	const balancer = new ModelProxyBalancer();
	let state = {
		enabled: false,
		strategy: "round-robin",
		accounts: []
	};
	let storageFailed = false;
	let key;
	const storageError = () => new ModelProxyError({ operation: "storage" });
	const upstreamError = () => new ModelProxyError({ operation: "upstream" });
	const logFailure = (operation) => (cause) => {
		const httpError = isHttpClientError(cause) ? cause : void 0;
		return logWarning("T3 Proxy operation failed").pipe(annotateLogs({
			operation,
			category: httpError ? httpError.reason._tag : "Failure",
			...httpError?.response ? { status: httpError.response.status } : {}
		}));
	};
	const storageFailure = (cause) => logFailure("storage")(cause).pipe(andThen(fail$3(storageError())));
	const upstreamFailure = (cause) => logFailure("upstream")(cause).pipe(andThen(fail$3(upstreamError())));
	const getKey = suspend$2(() => key ? succeed$3(key) : secrets.getOrCreateRandom("model-proxy-api", 32).pipe(map$2((bytes) => {
		key ??= encode$1(bytes);
		return key;
	}), catch_$1(storageFailure)));
	const update$1 = (change) => gen(function* () {
		if (storageFailed) return yield* new ModelProxyError({ operation: "storage" });
		const next = change(state);
		const json = yield* encodeState(next).pipe(catch_$1(storageFailure));
		yield* secrets.set("model-proxy-state", new TextEncoder().encode(json)).pipe(catch_$1(storageFailure));
		state = next;
		yield* changed;
	}).pipe(writes.run);
	yield* secrets.get("model-proxy-state").pipe(flatMap((saved) => isSome(saved) ? decodeState(new TextDecoder().decode(saved.value)).pipe(map$2((value) => {
		state = value;
	})) : void_), catch_$1((cause) => logFailure("storage")(cause).pipe(andThen(sync(() => {
		storageFailed = true;
	})))));
	const tokenRequest = (provider, data, tokenUrl = PROXY_OAUTH[provider].tokenUrl) => {
		const request = post(tokenUrl);
		return http.execute(provider === "claude" ? bodyJsonUnsafe(request, data) : bodyUrlParams(request, data)).pipe(flatMap(filterStatusOk), flatMap((response) => response.json), flatMap(decodeTokens), timeout("30 seconds"), catch_$1(upstreamFailure), annotateLogs({
			provider,
			stage: "token"
		}));
	};
	const getAccountToken = fn("ModelProxy.getAccountToken")(function* (id, force = false) {
		let lock = tokenLocks.get(id);
		if (!lock) {
			lock = yield* makeMailbox.pipe(provideService(Scope, serviceScope));
			tokenLocks.set(id, lock);
		}
		return yield* gen(function* () {
			const account = state.accounts.find((entry) => entry.id === id);
			if (!account || account.disabled) return yield* new ModelProxyError({ operation: "noAccounts" });
			const now = yield* currentTimeMillis;
			if (account.apiKey || !force && (account.expiresAt === 0 || account.expiresAt > now + 6e4)) return account;
			if (!account.refreshToken) return yield* new ModelProxyError({ operation: "upstream" });
			const oauth = oauthClients[account.provider];
			if (!oauth.clientId) return yield* new ModelProxyError({ operation: "oauthConfig" });
			const result = yield* tokenRequest(account.provider, {
				grant_type: "refresh_token",
				refresh_token: account.refreshToken,
				client_id: oauth.clientId,
				...oauth.clientSecret ? { client_secret: oauth.clientSecret } : {},
				...account.provider === "claude" ? { scope: oauth.scope } : {}
			}, account.tokenUrl);
			const next = {
				...account,
				accessToken: result.access_token,
				refreshToken: result.refresh_token ?? account.refreshToken,
				expiresAt: now + (result.expires_in ?? 3600) * 1e3
			};
			yield* update$1((current) => ({
				...current,
				accounts: current.accounts.map((entry) => entry.id === id ? {
					...entry,
					accessToken: next.accessToken,
					refreshToken: next.refreshToken,
					expiresAt: next.expiresAt
				} : entry)
			}));
			const current = state.accounts.find((entry) => entry.id === id);
			if (!current || current.disabled) return yield* new ModelProxyError({ operation: "noAccounts" });
			return current;
		}).pipe(lock.run);
	});
	const accountHeaders = (account, incoming = {}) => {
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${account.accessToken}`
		};
		for (const name of [
			"session-id",
			"session_id",
			"thread-id",
			"x-opencode-session",
			"x-opencode-session-id",
			"x-session-affinity",
			"x-claude-code-session-id",
			"x-client-session-id"
		]) if (incoming[name]) headers[name] = incoming[name];
		if (account.provider === "codex" && !account.apiKey) {
			headers["OpenAI-Beta"] = "responses=experimental";
			headers.Originator = "codex_cli_rs";
			if (account.accountId) headers["Chatgpt-Account-Id"] = account.accountId;
		}
		if (account.provider === "claude" || account.provider === "kimi") {
			headers["anthropic-version"] = incoming["anthropic-version"] ?? "2023-06-01";
			if (account.apiKey) {
				delete headers.Authorization;
				headers["x-api-key"] = account.accessToken;
			} else headers["anthropic-beta"] = [.../* @__PURE__ */ new Set([
				"oauth-2025-04-20",
				"claude-code-20250219",
				...(incoming["anthropic-beta"] ?? "").split(",").filter(Boolean)
			])].join(",");
			if (incoming["user-agent"]) headers["User-Agent"] = incoming["user-agent"];
		}
		if (account.provider === "gemini" && account.apiKey) {
			delete headers.Authorization;
			headers["x-goog-api-key"] = account.accessToken;
		}
		return headers;
	};
	const readLimits = fn("ModelProxy.readLimits")(function* (entry) {
		const checkedAt = formatIso(yield* now);
		if (entry.disabled || entry.apiKey || ![
			"codex",
			"claude",
			"gemini",
			"antigravity"
		].includes(entry.provider)) return;
		yield* gen(function* () {
			const account = yield* getAccountToken(entry.id);
			if (account.provider === "gemini" || account.provider === "antigravity") {
				const raw = yield* http.execute(post(`https://cloudcode-pa.googleapis.com/v1internal:${account.provider === "antigravity" ? "fetchAvailableModels" : "retrieveUserQuota"}`).pipe(setHeaders(accountHeaders(account)), bodyJsonUnsafe({ project: account.projectId }))).pipe(flatMap(filterStatusOk), flatMap((response) => response.json), flatMap(Json));
				const windows = (Array.isArray(raw.buckets) ? raw.buckets.map((bucket) => object(bucket)) : Object.entries(object(raw.models)).map(([modelId, model]) => ({
					modelId,
					...object(object(model).quotaInfo)
				}))).flatMap((bucket) => {
					if (typeof bucket.remainingFraction !== "number") return [];
					const resetsAt = typeof bucket.resetTime === "string" ? map$7(make$19(bucket.resetTime), formatIso).pipe(getOrUndefined$1) : void 0;
					const id = String(bucket.modelId ?? "quota");
					return [{
						id,
						label: id,
						kind: "other",
						usedPercent: Math.max(0, Math.min(100, (1 - bucket.remainingFraction) * 100)),
						...resetsAt ? { resetsAt } : {}
					}];
				});
				return {
					checkedAt,
					windows
				};
			}
			const url = account.provider === "codex" ? "https://chatgpt.com/backend-api/wham/usage" : "https://api.anthropic.com/api/oauth/usage";
			const response = yield* http.get(url, { headers: accountHeaders(account) }).pipe(flatMap(filterStatusOk), flatMap((response) => response.json));
			if (account.provider === "claude") {
				const quota = yield* decodeClaudeUsage(response);
				return claudeUsageResponseToLimits({
					checkedAt,
					response: {
						rate_limits_available: true,
						rate_limits: {
							five_hour: quota.five_hour ?? null,
							seven_day: quota.seven_day ?? null
						}
					}
				}).limits;
			}
			const quota = yield* decodeUsage(response);
			const toWindow = (window) => window ? {
				usedPercent: window.used_percent,
				resetsAt: window.reset_at ?? null,
				...window.limit_window_seconds !== void 0 ? { windowDurationMins: window.limit_window_seconds / 60 } : {}
			} : null;
			return codexRateLimitsToLimits({
				checkedAt,
				snapshot: {
					primary: toWindow(quota.rate_limit?.primary_window),
					secondary: toWindow(quota.rate_limit?.secondary_window),
					planType: quota.plan_type ?? null
				}
			});
		}).pipe(timeout("15 seconds"), tapError$2(logFailure("upstream")), match({
			onSuccess: (quota) => {
				if (quota) limits.set(entry.id, quota);
			},
			onFailure: () => {
				const previous = limits.get(entry.id);
				limits.set(entry.id, {
					checkedAt,
					windows: previous?.windows ?? [],
					unavailable: {
						reason: "probeFailed",
						message: "Could not refresh this account's quota."
					}
				});
			}
		}), annotateLogs({
			provider: entry.provider,
			stage: "quota"
		}), andThen(changed));
	});
	const refreshAccounts = fn("ModelProxy.refreshAccounts")(function* (force) {
		const now = yield* currentTimeMillis;
		yield* forEach(state.accounts.filter((account) => {
			const checkedAt = limits.get(account.id)?.checkedAt;
			return force || !checkedAt || now - Date.parse(checkedAt) >= 3e5;
		}), readLimits, {
			concurrency: 4,
			discard: true
		});
	}, quotaRefresh.run);
	const snapshot = gen(function* () {
		const now$2 = yield* currentTimeMillis;
		balancer.prune(now$2, (state.stickyIdleMinutes ?? 12) * 6e4);
		const remote = state.client?.type === "remote" ? yield* http.get(`${state.client.url}/v1/t3/quota`, { headers: { Authorization: `Bearer ${state.client.apiKey}` } }).pipe(flatMap(filterStatusOk), flatMap((response) => response.json), flatMap(decodeRemoteAccounts), timeout("10 seconds"), result) : void 0;
		const remoteAccounts = remote?._tag === "Success" ? remote.success.accounts : void 0;
		return {
			enabled: state.enabled,
			status: storageFailed ? "failed" : state.enabled ? "running" : "stopped",
			version,
			endpointPath: `${MODEL_PROXY_PATH}/v1`,
			strategy: state.strategy === "fill-first" ? "closest-reset" : state.strategy,
			stickyIdleMinutes: state.stickyIdleMinutes ?? 12,
			checkedAt: formatIso(yield* now),
			client: {
				configured: !!state.client,
				local: state.client?.type === "local",
				...state.client?.type === "remote" ? { url: state.client.url } : {}
			},
			accounts: state.client?.type === "remote" ? remoteAccounts ?? [] : state.accounts.map((account) => ({
				id: account.id,
				name: account.name,
				provider: account.provider,
				disabled: account.disabled,
				activeSessions: balancer.activeSessions(account.id),
				...account.email ? { email: account.email } : {},
				status: account.disabled ? "disabled" : [...cooldowns].some(([key, until]) => key.startsWith(`${account.id}:`) && until > now$2) ? "cooldown" : "ready",
				...limits.has(account.id) ? { usageLimits: limits.get(account.id) } : {}
			})),
			...storageFailed ? { error: "Could not read proxy credentials. Existing data has been preserved." } : remote?._tag === "Failure" ? { error: "The configured proxy server is unavailable." } : {}
		};
	});
	const saveTokens = fn("ModelProxy.saveTokens")(function* (provider, tokens, tokenUrl) {
		const now = yield* currentTimeMillis;
		const id = yield* crypto.randomUUIDv4.pipe(catch_$1(storageFailure));
		const claims = yield* try_({
			try: () => tokens.id_token ? decodeJwt(tokens.id_token) : {},
			catch: upstreamError
		}).pipe(flatMap(decodeClaims), orElseSucceed(() => ({})));
		let email = tokens.account?.email_address ?? claims.email;
		let subject = tokens.account?.uuid ?? claims.sub;
		let projectId;
		if (provider === "gemini" || provider === "antigravity") {
			const profile = yield* http.get("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } }).pipe(flatMap(filterStatusOk), flatMap((r) => r.json), flatMap(decodeProfile), catch_$1(upstreamFailure));
			email = profile.email;
			subject = profile.id;
			const assist = yield* http.execute(post("https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist").pipe(setHeader("Authorization", `Bearer ${tokens.access_token}`), bodyJsonUnsafe({ metadata: {
				ideType: "GEMINI_CLI",
				platform: "PLATFORM_UNSPECIFIED",
				pluginType: "GEMINI"
			} }))).pipe(flatMap(filterStatusOk), flatMap((r) => r.json), flatMap(Json), catch_$1(upstreamFailure));
			projectId = typeof assist.cloudaicompanionProject === "string" ? assist.cloudaicompanionProject : typeof object(assist.cloudaicompanionProject).id === "string" ? String(object(assist.cloudaicompanionProject).id) : void 0;
			if (!projectId) {
				const tier = Array.isArray(assist.allowedTiers) ? assist.allowedTiers.map((value) => object(value)).find((tier) => tier.isDefault === true) : void 0;
				const metadata = provider === "antigravity" ? {
					ide_type: "ANTIGRAVITY",
					ide_name: "antigravity"
				} : {
					ideType: "GEMINI_CLI",
					platform: "PLATFORM_UNSPECIFIED",
					pluginType: "GEMINI"
				};
				for (let attempt = 0; attempt < 5 && !projectId; attempt++) {
					const onboard = yield* http.execute(post(`https://${provider === "antigravity" ? "daily-" : ""}cloudcode-pa.googleapis.com/v1internal:onboardUser`).pipe(setHeader("Authorization", `Bearer ${tokens.access_token}`), bodyJsonUnsafe({
						tierId: tier?.id ?? "free-tier",
						tier_id: tier?.id ?? "free-tier",
						metadata
					}))).pipe(flatMap(filterStatusOk), flatMap((response) => response.json), flatMap(Json), timeout("30 seconds"), catch_$1(upstreamFailure));
					const project = object(onboard.response).cloudaicompanionProject ?? onboard.cloudaicompanionProject;
					projectId = typeof project === "string" ? project : typeof object(project).id === "string" ? String(object(project).id) : void 0;
					if (!projectId && attempt < 4) yield* sleep("2 seconds");
				}
				if (!projectId) return yield* new ModelProxyError({ operation: "upstream" });
			}
		}
		const existing = subject ? state.accounts.find((account) => account.provider === provider && account.subject === subject) : void 0;
		const account = {
			id: existing?.id ?? id,
			name: existing?.name ?? `${provider}-${id}.json`,
			provider,
			disabled: existing?.disabled ?? false,
			accessToken: tokens.access_token,
			apiKey: false,
			expiresAt: now + (tokens.expires_in ?? 3600) * 1e3,
			...tokens.refresh_token ?? existing?.refreshToken ? { refreshToken: tokens.refresh_token ?? existing?.refreshToken } : {},
			...email ? { email } : {},
			...subject ? { subject } : {},
			...claims["https://api.openai.com/auth"]?.chatgpt_account_id ? { accountId: claims["https://api.openai.com/auth"].chatgpt_account_id } : {},
			...projectId ? { projectId } : {},
			...tokenUrl ? { tokenUrl } : {}
		};
		yield* update$1((current) => ({
			...current,
			accounts: [...current.accounts.filter((entry) => entry.id !== account.id), account]
		}));
		yield* readLimits(account);
	});
	const oauthSnapshot = (login) => snapshot.pipe(map$2((value) => ({
		...value,
		oauth: {
			provider: login.provider,
			url: login.url,
			state: login.state,
			status: login.status
		}
	})));
	const completeAuth = fn("ModelProxy.completeAuth")(function* (login, redirectUrl) {
		if (login.status !== "wait" || login.expiresAt < (yield* currentTimeMillis) || !pending.has(login.state)) return yield* new ModelProxyError({ operation: "callback" });
		const callback = yield* try_({
			try: () => new URL(redirectUrl),
			catch: () => new ModelProxyError({ operation: "callback" })
		});
		const code = callback.searchParams.get("code");
		if (callback.searchParams.get("state") !== login.state || !code) return yield* new ModelProxyError({ operation: "callback" });
		const definition = oauthClients[login.provider];
		const tokens = yield* tokenRequest(login.provider, {
			grant_type: "authorization_code",
			client_id: definition.clientId,
			code,
			code_verifier: login.verifier,
			redirect_uri: definition.redirectUri,
			...definition.clientSecret ? { client_secret: definition.clientSecret } : {},
			...login.provider === "claude" ? { state: login.state } : {}
		});
		yield* saveTokens(login.provider, tokens);
		login.status = "ok";
	});
	const startAuth = fn("ModelProxy.startAuth")(function* (provider) {
		const now = yield* currentTimeMillis;
		for (const [id, flow] of pending) if (flow.expiresAt < now) {
			pending.delete(id);
			receivers.delete(id);
		}
		if ([...pending.values()].filter((flow) => flow.status === "wait").length >= 10) return yield* new ModelProxyError({ operation: "management" });
		const state = encode$1(yield* crypto.randomBytes(32).pipe(catch_$1(storageFailure)));
		const verifier = encode$1(yield* crypto.randomBytes(32).pipe(catch_$1(storageFailure)));
		const definition = oauthClients[provider];
		if (!definition.clientId) return yield* new ModelProxyError({ operation: "oauthConfig" });
		const login = {
			provider,
			state,
			verifier,
			status: "wait",
			url: "",
			expiresAt: now + 6e5
		};
		if (definition.authorizeUrl && definition.redirectUri) {
			const digest = yield* crypto.digest("SHA-256", new TextEncoder().encode(verifier)).pipe(catch_$1(storageFailure));
			const challenge = btoa(String.fromCharCode(...digest)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
			const url = new URL(definition.authorizeUrl);
			url.search = new URLSearchParams({
				response_type: "code",
				client_id: definition.clientId,
				redirect_uri: definition.redirectUri,
				scope: definition.scope,
				state,
				code_challenge: challenge,
				code_challenge_method: "S256",
				...provider === "codex" ? {
					id_token_add_organizations: "true",
					codex_cli_simplified_flow: "true",
					prompt: "login"
				} : {},
				...provider === "gemini" || provider === "antigravity" ? {
					access_type: "offline",
					prompt: "consent"
				} : {}
			}).toString();
			login.url = url.toString();
		} else {
			let deviceUrl = definition.deviceUrl;
			let tokenUrl = definition.tokenUrl;
			if (definition.discoveryUrl) {
				const discovery = yield* http.get(definition.discoveryUrl).pipe(flatMap(filterStatusOk), flatMap((r) => r.json), flatMap(decodeDiscovery), catch_$1(upstreamFailure));
				if (![discovery.device_authorization_endpoint, discovery.token_endpoint].every((url) => new URL(url).origin === "https://auth.x.ai")) return yield* new ModelProxyError({ operation: "upstream" });
				deviceUrl = discovery.device_authorization_endpoint;
				tokenUrl = discovery.token_endpoint;
			}
			if (!deviceUrl) return yield* new ModelProxyError({ operation: "unsupported" });
			const response = yield* http.execute(post(deviceUrl).pipe(bodyUrlParams({
				client_id: definition.clientId,
				...definition.scope ? { scope: definition.scope } : {}
			}))).pipe(flatMap(filterStatusOk), flatMap((r) => r.json), flatMap(decodeDevice), catch_$1(upstreamFailure));
			login.deviceCode = response.device_code;
			login.tokenUrl = tokenUrl;
			login.interval = Math.max(5, response.interval ?? 5) * 1e3;
			login.expiresAt = now + Math.min(1800, response.expires_in ?? 600) * 1e3;
			login.url = response.verification_uri_complete ?? `${response.verification_uri}${response.verification_uri.includes("?") ? "&" : "?"}user_code=${encodeURIComponent(response.user_code)}`;
		}
		pending.set(state, login);
		if (definition.redirectUri) {
			const fiber = yield* receiveProxyCallback(definition.redirectUri, state).pipe(flatMap((url) => completeAuth(login, url).pipe(tapError$2(() => sync(() => {
				login.status = "error";
			})), management.run)), timeout("10 minutes"), ignore$1, scoped, forkIn(serviceScope));
			receivers.set(state, fiber);
		}
		return yield* oauthSnapshot(login);
	});
	const manage = fn("ModelProxy.manage")(function* (input) {
		switch (input.action) {
			case "status": break;
			case "start":
				yield* update$1((current) => ({
					...current,
					enabled: true,
					client: { type: "local" }
				}));
				yield* refreshAccounts(false);
				break;
			case "stop":
				yield* update$1(({ client: _client, ...current }) => ({
					...current,
					enabled: false
				}));
				balancer.clear();
				break;
			case "refresh":
				if (state.client?.type === "remote") yield* http.get(`${state.client.url}/v1/t3/quota/refresh`, { headers: { Authorization: `Bearer ${state.client.apiKey}` } }).pipe(flatMap(filterStatusOk), flatMap((response) => runDrain(response.stream)), timeout("30 seconds"), catch_$1(upstreamFailure));
				else yield* refreshAccounts(true);
				break;
			case "setStrategy":
				yield* update$1((current) => ({
					...current,
					strategy: input.strategy
				}));
				break;
			case "setStickyIdleMinutes":
				yield* update$1((current) => ({
					...current,
					stickyIdleMinutes: input.minutes
				}));
				balancer.prune(yield* currentTimeMillis, input.minutes * 6e4);
				break;
			case "revealKey": return {
				...yield* snapshot,
				apiKey: yield* getKey
			};
			case "rotateKey": {
				const bytes = yield* crypto.randomBytes(32).pipe(catch_$1(storageFailure));
				yield* secrets.set("model-proxy-api", bytes).pipe(catch_$1(storageFailure));
				key = encode$1(bytes);
				return {
					...yield* snapshot,
					apiKey: key
				};
			}
			case "useLocal":
				if (!state.enabled) return yield* new ModelProxyError({ operation: "disabled" });
				yield* update$1((current) => ({
					...current,
					client: { type: "local" }
				}));
				break;
			case "configureClient": {
				const urls = yield* forEach([input.url, ...input.fallbackUrls ?? []], (candidate) => gen(function* () {
					const url = yield* try_({
						try: () => new URL(candidate),
						catch: () => new ModelProxyError({ operation: "management" })
					});
					if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) return yield* new ModelProxyError({ operation: "management" });
					url.pathname = url.pathname.replace(/\/$/u, "").replace(/\/v1$/u, "") || "/api/plugins/agent-proxy";
					return url.toString().replace(/\/$/u, "");
				}));
				let selected;
				for (const url of new Set(urls)) if (yield* http.get(`${url}/v1/models`, { headers: { Authorization: `Bearer ${input.apiKey}` } }).pipe(flatMap(filterStatusOk), flatMap((response) => runDrain(response.stream)), timeout("10 seconds"), as(true), catchTags({
					HttpClientError: (error) => error.reason._tag === "TransportError" ? logFailure("upstream")(error).pipe(as(false)) : upstreamFailure(error),
					TimeoutError: (error) => logFailure("upstream")(error).pipe(as(false))
				}))) {
					selected = url;
					break;
				}
				if (!selected) return yield* new ModelProxyError({ operation: "upstream" });
				yield* update$1((current) => ({
					...current,
					enabled: false,
					client: {
						type: "remote",
						url: selected,
						apiKey: input.apiKey
					}
				}));
				break;
			}
			case "disconnectClient":
				yield* update$1(({ client: _client, ...current }) => current);
				break;
			case "setAccountEnabled":
				if (!state.accounts.some((account) => account.name === input.name)) return yield* new ModelProxyError({ operation: "noAccounts" });
				yield* update$1((current) => ({
					...current,
					accounts: current.accounts.map((entry) => entry.name === input.name ? {
						...entry,
						disabled: !input.enabled
					} : entry)
				}));
				if (!input.enabled) {
					const account = state.accounts.find((entry) => entry.name === input.name);
					if (account) balancer.invalidate(account.id);
				}
				break;
			case "removeAccount":
				for (const account of state.accounts) if (account.name === input.name) {
					balancer.invalidate(account.id);
					limits.delete(account.id);
					tokenLocks.delete(account.id);
					for (const key of cooldowns.keys()) if (key.startsWith(`${account.id}:`)) cooldowns.delete(key);
				}
				yield* update$1((current) => ({
					...current,
					accounts: current.accounts.filter((entry) => entry.name !== input.name)
				}));
				break;
			case "importAccount": {
				const raw = {
					...input.credential,
					...object(input.credential.token),
					...object(input.credential.tokens)
				};
				const imported = yield* decodeImportedToken(raw).pipe(catch_$1(upstreamFailure));
				const provider = yield* decodeProvider(imported.provider ?? imported.type).pipe(mapError$2(() => new ModelProxyError({ operation: "unsupported" })));
				const accessToken = imported.api_key ?? imported.access_token;
				if (!accessToken && !imported.refresh_token) return yield* new ModelProxyError({ operation: "management" });
				const id = yield* crypto.randomUUIDv4.pipe(catch_$1(storageFailure));
				const expiresAt = imported.expiry_date ?? (imported.expired ? Date.parse(imported.expired) : imported.refresh_token && !accessToken ? 1 : 0);
				if (!Number.isFinite(expiresAt)) return yield* new ModelProxyError({ operation: "management" });
				const claims = yield* try_({
					try: () => imported.id_token ? decodeJwt(imported.id_token) : {},
					catch: upstreamError
				}).pipe(flatMap(decodeClaims), orElseSucceed(() => ({})));
				const accountId = imported.account_id ?? claims["https://api.openai.com/auth"]?.chatgpt_account_id;
				const email = imported.email ?? claims.email;
				const account = {
					id,
					name: input.name,
					provider,
					accessToken: accessToken ?? "",
					disabled: false,
					apiKey: !!imported.api_key,
					expiresAt,
					...imported.refresh_token ? { refreshToken: imported.refresh_token } : {},
					...email ? { email } : {},
					...accountId ? { accountId } : {},
					...imported.project_id ? { projectId: imported.project_id } : {}
				};
				if (state.accounts.some((entry) => entry.name === input.name)) return yield* new ModelProxyError({ operation: "management" });
				yield* update$1((current) => ({
					...current,
					accounts: [...current.accounts, account]
				}));
				yield* readLimits(account);
				break;
			}
			case "authStart": return yield* startAuth(input.provider);
			case "authCancel":
				pending.delete(input.state);
				if (receivers.has(input.state)) yield* interrupt(receivers.get(input.state));
				receivers.delete(input.state);
				break;
			case "authComplete": {
				const login = pending.get(input.state);
				const now = yield* currentTimeMillis;
				if (!login || login.provider !== input.provider || login.status !== "wait" || login.expiresAt < now || login.deviceCode) return yield* new ModelProxyError({ operation: "callback" });
				yield* completeAuth(login, input.redirectUrl);
				if (receivers.has(input.state)) yield* interrupt(receivers.get(input.state));
				receivers.delete(input.state);
				return yield* oauthSnapshot(login);
			}
			case "authStatus": {
				const login = pending.get(input.state);
				const now = yield* currentTimeMillis;
				if (!login || login.provider !== input.provider) return yield* new ModelProxyError({ operation: "callback" });
				if (login.expiresAt < now) login.status = "error";
				if (login.status === "wait" && login.deviceCode && now >= (login.nextPollAt ?? 0)) {
					login.nextPollAt = now + (login.interval ?? 5e3);
					const response = yield* http.execute(post(login.tokenUrl).pipe(bodyUrlParams({
						grant_type: "urn:ietf:params:oauth:grant-type:device_code",
						client_id: oauthClients[login.provider].clientId,
						device_code: login.deviceCode
					}))).pipe(flatMap((r) => r.json), flatMap(Json), catch_$1(upstreamFailure));
					if (response.error === "slow_down") login.interval = (login.interval ?? 5e3) + 5e3;
					else if (response.error && response.error !== "authorization_pending") login.status = "error";
					else if (response.access_token) {
						const tokens = yield* decodeTokens(response).pipe(catch_$1(upstreamFailure));
						yield* saveTokens(login.provider, tokens, login.tokenUrl);
						login.status = "ok";
					}
				}
				return yield* oauthSnapshot(login);
			}
		}
		return yield* snapshot;
	}, management.run);
	const environment = fn("ModelProxy.environment")(function* (driver, base) {
		const supported = driver === "codex" || driver === "claudeAgent" || driver === "opencode";
		if (!state.client || !supported) return base;
		if (storageFailed) return yield* new ModelProxyError({ operation: "storage" });
		if (state.client.type === "local" && !state.enabled) return yield* new ModelProxyError({ operation: "disabled" });
		const apiKey = state.client.type === "remote" ? state.client.apiKey : yield* getKey;
		const url = state.client.type === "remote" ? state.client.url : yield* config.baseUrl;
		if (driver === "claudeAgent") return {
			...base,
			ANTHROPIC_BASE_URL: url,
			ANTHROPIC_AUTH_TOKEN: apiKey,
			ANTHROPIC_API_KEY: "",
			CLAUDE_CODE_OAUTH_TOKEN: ""
		};
		if (driver === "opencode") {
			const content = yield* decodeJsonPayload(base.OPENCODE_CONFIG_CONTENT ?? "{}").pipe(catch_$1(storageFailure));
			const provider = { ...object(content.provider) };
			for (const name of [
				"openai",
				"anthropic",
				"google",
				"xai",
				"kimi-for-coding"
			]) {
				const existing = object(provider[name]);
				provider[name] = {
					...existing,
					options: {
						...object(existing.options),
						baseURL: `${url}/${name === "google" ? "v1beta" : "v1"}`,
						apiKey
					}
				};
			}
			const json = yield* encodeJsonPayload({
				...content,
				provider
			}).pipe(catch_$1(storageFailure));
			return {
				...base,
				OPENCODE_CONFIG_CONTENT: json
			};
		}
		const proxyConfig = [
			"--config",
			"model_provider=\"t3_proxy\"",
			"--config",
			"model_providers.t3_proxy.name=\"T3 Proxy\"",
			"--config",
			`model_providers.t3_proxy.base_url=${yield* encodeJsonString(`${url}/v1`).pipe(catch_$1(storageFailure))}`,
			"--config",
			"model_providers.t3_proxy.wire_api=\"responses\"",
			"--config",
			"model_providers.t3_proxy.env_key=\"T3CODE_PROXY_API_KEY\"",
			"--config",
			"model_providers.t3_proxy.requires_openai_auth=false"
		];
		const escaped = proxyConfig.map((arg) => `'${arg.replaceAll("'", "'\\''")}'`).join(" ");
		return {
			...base,
			T3CODE_PROXY_API_KEY: apiKey,
			AGENT_PROXY_CODEX_CONFIG: yield* encodeJsonPayload({ args: proxyConfig }).pipe(catch_$1(storageFailure)),
			T3CODE_CODEX_LAUNCH_ARGS: `${base.T3CODE_CODEX_LAUNCH_ARGS ?? ""} ${escaped}`.trim()
		};
	});
	const forward = fn("ModelProxy.forward")(function* (input) {
		if (!state.enabled) return yield* new ModelProxyError({ operation: "disabled" });
		const expected = yield* getKey;
		const suppliedDigest = yield* crypto.digest("SHA-256", new TextEncoder().encode(input.apiKey)).pipe(catch_$1(upstreamFailure));
		const expectedDigest = yield* crypto.digest("SHA-256", new TextEncoder().encode(expected)).pipe(catch_$1(upstreamFailure));
		let difference = 0;
		for (let i = 0; i < expectedDigest.length; i++) difference |= expectedDigest[i] ^ suppliedDigest[i];
		if (difference !== 0) return yield* new ModelProxyError({ operation: "unauthorized" });
		const pathname = input.path.split("?", 1)[0];
		if (pathname === "/v1/t3/quota" && input.method === "GET") return jsonUnsafe(yield* snapshot);
		if (pathname === "/v1/t3/quota/refresh" && input.method === "GET") {
			yield* refreshAccounts(true);
			return jsonUnsafe(yield* snapshot);
		}
		if (pathname === "/v1/models" && input.method === "GET") {
			const data = yield* forEach(state.accounts.filter((account) => !account.disabled), (entry) => gen(function* () {
				const account = yield* getAccountToken(entry.id);
				const url = account.provider === "codex" ? account.apiKey ? "https://api.openai.com/v1/models" : "https://chatgpt.com/backend-api/codex/models?client_version=0.156.1" : account.provider === "claude" ? "https://api.anthropic.com/v1/models" : account.provider === "kimi" ? "https://api.kimi.com/coding/v1/models" : account.provider === "xai" ? "https://api.x.ai/v1/models" : "https://generativelanguage.googleapis.com/v1beta/models";
				const raw = yield* ((account.provider === "gemini" || account.provider === "antigravity") && !account.apiKey ? http.execute(post("https://cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels").pipe(setHeaders(accountHeaders(account)), bodyJsonUnsafe({ project: account.projectId }))) : http.get(url, { headers: accountHeaders(account) })).pipe(flatMap(filterStatusOk), flatMap((r) => r.json), flatMap(Json), catch_$1(upstreamFailure));
				return (Array.isArray(raw.data) ? raw.data : Array.isArray(raw.models) ? raw.models : Object.entries(object(raw.models)).map(([id, item]) => ({
					...object(item),
					id
				}))).flatMap((row) => {
					const item = object(row);
					const id = item.id ?? item.slug ?? item.name;
					return typeof id === "string" ? [{
						id: account.provider === "antigravity" ? `antigravity/${id.replace(/^models\//u, "")}` : id.replace(/^models\//u, ""),
						object: "model",
						owned_by: account.provider
					}] : [];
				});
			}).pipe(orElseSucceed(() => [])), { concurrency: 4 });
			const unique = new Map(data.flat().map((model) => [model.id, model]));
			return jsonUnsafe({
				object: "list",
				data: [...unique.values()]
			});
		}
		if (input.method !== "POST") return yield* new ModelProxyError({ operation: "unsupported" });
		const payload = yield* Json(input.payload).pipe(catch_$1(upstreamFailure));
		const model = typeof payload.model === "string" ? payload.model : /\/models\/([^:]+)/u.exec(input.path)?.[1];
		if (!model) return yield* new ModelProxyError({ operation: "unsupported" });
		const provider = proxyProviderForModel(model);
		const now = yield* currentTimeMillis;
		const rawSession = proxySessionId(input.headers, payload);
		const session = rawSession ? encode$1(yield* crypto.digest("SHA-256", new TextEncoder().encode(rawSession)).pipe(catch_$1(upstreamFailure))) : null;
		const candidates = state.accounts.filter((entry) => entry.provider === provider && !entry.disabled && !proxyQuotaExhausted(proxyModelQuota(limits.get(entry.id), provider, model), now) && (cooldowns.get(`${entry.id}:${model}`) ?? 0) <= now);
		const attempted = /* @__PURE__ */ new Set();
		for (let attempt = 0; attempt < candidates.length; attempt++) {
			const reservation = balancer.acquire({
				provider,
				session,
				candidates: candidates.filter((entry) => !attempted.has(entry.id)).map((entry) => ({
					id: entry.id,
					nextReset: proxyNextReset(proxyModelQuota(limits.get(entry.id), provider, model), now)
				})),
				strategy: state.strategy === "fill-first" ? "closest-reset" : state.strategy,
				now,
				idleMs: (state.stickyIdleMinutes ?? 12) * 6e4
			});
			if (!reservation) break;
			attempted.add(reservation.accountId);
			const entry = candidates.find((account) => account.id === reservation.accountId);
			let streamingResponse = false;
			let succeeded = false;
			const finish = (success) => currentTimeMillis.pipe(tap((time) => sync(() => reservation.finish(time, success))), andThen(changed), asVoid);
			const responseStream = (stream) => {
				streamingResponse = true;
				return stream.pipe(tapError(() => sync(() => {
					succeeded = false;
				})), ensuring(suspend$2(() => finish(succeeded))));
			};
			const attemptResponse = yield* gen(function* () {
				const accountResult = yield* getAccountToken(entry.id).pipe(result);
				if (accountResult._tag === "Failure") return null;
				let account = accountResult.success;
				const prepared = yield* try_({
					try: () => prepareProxyRequest(provider, account.apiKey, input.path, payload),
					catch: (cause) => isProxyError(cause) ? cause : upstreamError()
				});
				const body = (provider === "gemini" || provider === "antigravity") && !account.apiKey && prepared.translation !== "native" ? {
					...prepared.body,
					project: account.projectId,
					...provider === "antigravity" ? {
						userAgent: "antigravity",
						requestType: model.includes("image") ? "image_gen" : "agent",
						requestId: yield* crypto.randomUUIDv4.pipe(catch_$1(storageFailure))
					} : {}
				} : prepared.body;
				const send = () => http.execute(post(prepared.url).pipe(setHeaders(accountHeaders(account, input.headers)), bodyJsonUnsafe(body))).pipe(catch_$1(upstreamFailure));
				const sent = yield* send().pipe(result);
				if (sent._tag === "Failure") return null;
				let response = sent.success;
				if (response.status === 401 && account.refreshToken) {
					yield* runDrain(response.stream).pipe(ignore$1);
					const renewed = yield* getAccountToken(account.id, true).pipe(result);
					if (renewed._tag === "Failure") return null;
					account = renewed.success;
					const retried = yield* send().pipe(result);
					if (retried._tag === "Failure") return null;
					response = retried.success;
				}
				if (response.status === 401 || response.status === 429 || response.status >= 500) {
					const retry = Number(response.headers["retry-after"]);
					cooldowns.set(`${account.id}:${model}`, now + (Number.isFinite(retry) && retry > 0 ? Math.min(retry, 3600) : 60) * 1e3);
					balancer.invalidate(account.id);
					yield* runDrain(response.stream).pipe(ignore$1);
					return null;
				}
				const contentType = response.headers["content-type"] ?? (provider === "codex" && !account.apiKey && body.stream === true ? "text/event-stream" : "application/json");
				if (response.status >= 400) return stream(responseStream(response.stream), {
					status: response.status,
					contentType
				});
				succeeded = true;
				const streaming = payload.stream === true || input.path.includes("streamGenerateContent");
				const upstreamStreaming = contentType.includes("text/event-stream");
				if (prepared.translation === "native" && (!upstreamStreaming || streaming)) return stream(responseStream(response.stream), {
					status: response.status,
					contentType,
					headers: {
						"Cache-Control": "no-store",
						"X-Accel-Buffering": "no"
					}
				});
				if (upstreamStreaming && streaming) {
					const translate = makeProxyStreamTranslator(prepared.translation, model);
					const stream$2 = response.stream.pipe(decodeText(), splitLines, filter((line) => line.startsWith("data: ") && line.slice(6) !== "[DONE]"), mapEffect((line) => decodeJsonPayload(line.slice(6))), map(translate), filter((chunk) => chunk.length > 0), encodeText$1);
					return stream(responseStream(stream$2), {
						contentType: "text/event-stream",
						headers: {
							"Cache-Control": "no-store",
							"X-Accel-Buffering": "no"
						}
					});
				}
				let raw;
				if (upstreamStreaming) {
					const collected = yield* response.stream.pipe(decodeText(), splitLines, filter((line) => line.startsWith("data: ") && line.slice(6) !== "[DONE]"), mapEffect((line) => decodeJsonPayload(line.slice(6))), runFold(() => ({
						response: {},
						output: /* @__PURE__ */ new Map()
					}), (previous, event) => {
						if (event.type === "response.output_item.done" && typeof event.output_index === "number") previous.output.set(event.output_index, object(event.item));
						if (event.type === "response.completed" || event.type === "response.incomplete") previous.response = object(event.response);
						return previous;
					}), catch_$1(upstreamFailure));
					raw = {
						...collected.response,
						output: Array.isArray(collected.response.output) && collected.response.output.length ? collected.response.output : [...collected.output].sort(([left], [right]) => left - right).map(([, item]) => item)
					};
					if (!raw.id) return yield* new ModelProxyError({ operation: "upstream" });
				} else raw = yield* response.json.pipe(flatMap(Json), catch_$1(upstreamFailure));
				return jsonUnsafe(proxyChatResponse(prepared.translation, raw, model));
			}).pipe(onExit$1((exit) => streamingResponse ? void_ : finish(exit._tag === "Success" && succeeded)));
			if (attemptResponse) return attemptResponse;
		}
		return yield* new ModelProxyError({ operation: "noAccounts" });
	});
	if (state.enabled) yield* refreshAccounts(false).pipe(forkScoped);
	let nextRefresh = (yield* currentTimeMillis) + 6e4;
	yield* forever(gen(function* () {
		const now = yield* currentTimeMillis;
		yield* sleep(Math.max(0, nextRefresh - now));
		nextRefresh = (yield* currentTimeMillis) + 6e4;
		if (state.enabled) yield* refreshAccounts(false);
	})).pipe(forkScoped);
	return ModelProxy.of({
		manage,
		environment,
		forward,
		changes: map(changes(revision), () => void 0)
	});
}));
fn("proxyProviderEnvironment")(function* (driver, base) {
	const proxy = yield* serviceOption(ModelProxy);
	return isSome(proxy) ? yield* proxy.value.environment(driver, base) : base;
});
//#endregion
//#region src/plugin.ts
const MAX_REQUEST_BYTES = 16777216;
var RequestBodyTooLarge = class extends Error {};
const readPayload = (request) => tryPromise({
	try: async () => {
		const reader = request.body?.getReader();
		if (!reader) return JSON.parse("");
		try {
			const chunks = [];
			let size = 0;
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				size += value.byteLength;
				if (size > MAX_REQUEST_BYTES) {
					await reader.cancel().catch(() => {});
					throw new RequestBodyTooLarge();
				}
				chunks.push(value);
			}
			return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks, size)));
		} finally {
			reader.releaseLock();
		}
	},
	catch: (cause) => new PluginError({
		operation: cause instanceof RequestBodyTooLarge ? "body-too-large" : "json",
		cause: null
	})
});
const decodeManage = decodeUnknownEffect(ModelProxyManageInput);
const decodeCredential = decodeUnknownEffect(fromJsonString(Record(String$2, Unknown)));
const decodeConfigArgs = decodeUnknownEffect(fromJsonString(Struct({ args: ArraySchema(String$2) })));
const encodeSnapshot = encodeEffect(fromJsonString(ModelProxySnapshot));
const decodeJson = decodeUnknownEffect(fromJsonString(Json$1));
const Preferences = Struct({
	provider: String$2,
	showEmails: Boolean$1
});
const decodePreferences = decodeUnknownEffect(fromJsonString(Preferences));
const encodePreferences = encodeEffect(fromJsonString(Preferences));
const toPluginError = (error) => new PluginError({
	operation: error.operation,
	cause: null
});
const providerLabel = (provider) => ({
	codex: "Codex",
	claude: "Claude",
	gemini: "Gemini",
	antigravity: "Antigravity",
	kimi: "Kimi",
	xai: "xAI"
})[provider] ?? provider;
const action = (id, label, command, input = {}) => ({
	id,
	label,
	command,
	input
});
var plugin_default = {
	apiVersion: 1,
	id: "agent-proxy",
	name: "Agent proxy",
	version,
	description: "An external OAuth account pool with quota-aware model routing.",
	activate: (host) => gen(function* () {
		const context = yield* build(layer.pipe(provide(layer$1(host)), provide(succeed$4(ProxyRuntime, { baseUrl: host.httpBaseUrl.pipe(mapError$2(() => new ModelProxyError({ operation: "disabled" }))) })), provide(layer$2), provide(layer$3)));
		const proxy = get(context, ModelProxy);
		const revision = yield* make$6(0);
		const changed = update(revision, (n) => n + 1);
		const stored = yield* host.secrets.get("display-options");
		let preferences = stored ? yield* decodePreferences(stored).pipe(mapError$2(() => new PluginError({
			operation: "display-options",
			cause: null
		}))) : {
			provider: "all",
			showEmails: false
		};
		let oauth;
		const manage = (input) => proxy.manage(input).pipe(mapError$2(toPluginError));
		const read = manage({ action: "status" });
		const serializable = (snapshot) => encodeSnapshot(snapshot).pipe(flatMap(decodeJson), mapError$2(() => new PluginError({
			operation: "result",
			cause: null
		})));
		const command = (id, title, description, permission, agent, run) => ({
			id,
			title,
			description,
			permission,
			agent,
			run
		});
		const mutate = (input) => decodeManage(input).pipe(mapError$2(() => new PluginError({
			operation: "input",
			cause: null
		})), flatMap(manage), as(null));
		const pollSignIn = suspend$2(() => oauth?.status === "wait" ? manage({
			action: "authStatus",
			provider: oauth.provider,
			state: oauth.state
		}).pipe(tap((snapshot) => sync(() => {
			oauth = snapshot.oauth;
		})), andThen(changed), asVoid) : void_);
		yield* forever(sleep("5 seconds").pipe(andThen(pollSignIn), ignore$1)).pipe(forkScoped);
		const accountTable = (snapshot, provider, editable) => ({
			id: `accounts-${provider}`,
			kind: "table",
			columns: [
				"Account",
				"Provider",
				"Status",
				"Quota remaining",
				"Next reset",
				"Sessions"
			],
			rows: snapshot.accounts.filter((account) => (provider === "all" || account.provider === provider) && (preferences.provider === "all" || account.provider === preferences.provider)).map((account) => ({
				id: account.id,
				cells: [
					preferences.showEmails && account.email ? account.email : account.name.replace(/[^/]*@[^.]+/g, "account"),
					providerLabel(account.provider),
					account.status,
					account.usageLimits?.unavailable ? "Unavailable" : account.usageLimits?.windows.map((window) => `${window.label}: ${Math.max(0, 100 - window.usedPercent).toFixed(0)}%`).join(" · ") || "Not reported",
					account.usageLimits?.windows.flatMap((window) => window.resetsAt ? [`${window.label}: ${new Date(window.resetsAt).toLocaleString()}`] : []).join(" · ") || "Not reported",
					String(account.activeSessions ?? 0)
				],
				actions: editable ? [action("toggle", account.disabled ? "Enable account" : "Disable account", "account-enabled", {
					action: "setAccountEnabled",
					name: account.name,
					enabled: account.disabled
				}), action("remove", "Remove account", "remove-account", {
					action: "removeAccount",
					name: account.name
				})] : []
			}))
		});
		const view = (location) => gen(function* () {
			const snapshot = yield* read;
			const blocks = [{
				id: "status",
				kind: "text",
				text: `${snapshot.client.configured && !snapshot.client.local ? "Client" : snapshot.enabled ? "Server" : "Disabled"} · ${snapshot.accounts.length} accounts · ${snapshot.strategy} · ${snapshot.stickyIdleMinutes} minute session affinity`
			}];
			if (snapshot.error) blocks.push({
				id: "error",
				kind: "text",
				text: snapshot.error
			});
			if (location === "settings") {
				blocks.push({
					id: "mode",
					kind: "actions",
					actions: [action("start", "Run proxy server", "start"), action("stop", "Disable proxy routing", "stop")]
				});
				blocks.push({
					id: "pool-settings",
					kind: "form",
					label: "Save pool settings",
					command: "pool-settings",
					input: {},
					fields: [{
						name: "strategy",
						label: "Account selection",
						kind: "select",
						value: snapshot.strategy,
						options: ModelProxyStrategy.literals.map((value) => ({
							value,
							label: {
								"round-robin": "Round robin",
								"closest-reset": "Closest to reset",
								"least-active-sessions": "Least active sessions"
							}[value]
						}))
					}, {
						name: "minutes",
						label: "Sticky idle minutes (1–1440)",
						kind: "number",
						value: snapshot.stickyIdleMinutes,
						required: true
					}]
				});
				blocks.push({
					id: "api",
					kind: "text",
					text: `Model endpoint: ${host.httpBasePath}/v1. Remote clients need a directly reachable URL. Existing CLI sessions keep their old routing until restarted.`
				});
				blocks.push({
					id: "keys",
					kind: "actions",
					actions: [action("show", "Show proxy API key", "reveal-key"), action("rotate", "Rotate proxy API key", "rotate-key")]
				});
				blocks.push({
					id: "oauth",
					kind: "form",
					label: "Start provider sign-in",
					command: "auth-start",
					input: { action: "authStart" },
					fields: [{
						name: "provider",
						label: "Provider",
						kind: "select",
						value: "codex",
						options: ModelProxyProvider.literals.map((value) => ({
							value,
							label: providerLabel(value)
						}))
					}]
				});
				if (oauth) {
					blocks.push({
						id: "oauth-status",
						kind: "text",
						text: `${providerLabel(oauth.provider)} sign-in: ${oauth.status}`
					});
					if (oauth.status === "wait") {
						blocks.push({
							id: "oauth-url",
							kind: "link",
							label: "Open provider sign-in",
							url: oauth.url
						});
						blocks.push({
							id: "oauth-callback",
							kind: "form",
							label: "Complete sign-in",
							command: "auth-complete",
							input: {
								action: "authComplete",
								provider: oauth.provider,
								state: oauth.state
							},
							fields: [{
								name: "redirect-url",
								label: "Full callback URL (for a remote browser)",
								kind: "password",
								required: true
							}]
						});
						blocks.push({
							id: "oauth-cancel",
							kind: "actions",
							actions: [action("cancel", "Cancel sign-in", "auth-cancel", {
								action: "authCancel",
								state: oauth.state
							})]
						});
					}
				}
				blocks.push({
					id: "import",
					kind: "form",
					label: "Import account",
					command: "import-account",
					input: {},
					fields: [{
						name: "name",
						label: "Account file name",
						kind: "text",
						value: "account.json",
						required: true
					}, {
						name: "credential",
						label: "Credential JSON (never returned to clients)",
						kind: "password",
						required: true
					}]
				});
				blocks.push(accountTable(snapshot, "all", snapshot.enabled));
				blocks.push({
					id: "client",
					kind: "form",
					label: "Use remote proxy",
					command: "configure-client",
					input: { action: "configureClient" },
					fields: [{
						name: "url",
						label: "Remote proxy base URL (without /v1)",
						kind: "text",
						value: snapshot.client.url ?? "",
						required: true
					}, {
						name: "api-key",
						label: "Remote proxy API key",
						kind: "password",
						required: true
					}]
				});
				blocks.push({
					id: "disconnect",
					kind: "actions",
					actions: [action("disconnect", "Disconnect remote proxy", "disconnect-client")]
				});
			} else {
				blocks.push({
					id: "refresh",
					kind: "actions",
					actions: [action("refresh", "Refresh account quotas", "refresh")]
				});
				const providers = [...new Set(snapshot.accounts.map((account) => account.provider))];
				for (const provider of providers) blocks.push(accountTable(snapshot, provider, false));
				if (!providers.length) blocks.push({
					id: "empty",
					kind: "text",
					text: "No proxy accounts. Configure Agent proxy under Settings → Plugins."
				});
			}
			blocks.push({
				id: "display",
				kind: "form",
				label: "Save display options",
				command: "display-options",
				input: {},
				fields: [{
					name: "provider",
					label: "Provider filter",
					kind: "select",
					value: preferences.provider,
					options: [{
						value: "all",
						label: "All providers"
					}, ...ModelProxyProvider.literals.map((value) => ({
						value,
						label: providerLabel(value)
					}))]
				}, {
					name: "show-emails",
					label: "Show account email addresses",
					kind: "boolean",
					value: preferences.showEmails
				}]
			});
			return {
				title: "Agent proxy",
				blocks
			};
		});
		const readPermission = "diagnostics:read";
		return {
			changes: merge(proxy.changes, map(changes(revision), () => void 0)),
			commands: [
				command("status", "Proxy status", "Read proxy configuration, accounts, and quota windows without credentials.", readPermission, true, () => read.pipe(flatMap(serializable))),
				command("start", "Start proxy", "Start the account pool and route new supported CLI launches through it.", "providers:manage", true, () => manage({ action: "start" }).pipe(as(null))),
				command("stop", "Stop proxy", "Stop routing new launches and stop the account pool.", "providers:manage", true, () => manage({ action: "stop" }).pipe(as(null))),
				command("pool-settings", "Pool settings", "Choose quota-aware selection and sticky session idle expiry.", "providers:manage", true, (input) => gen(function* () {
					const strategy = yield* decodeManage({
						action: "setStrategy",
						strategy: input.strategy
					}).pipe(mapError$2(() => new PluginError({
						operation: "strategy",
						cause: null
					})));
					const idle = yield* decodeManage({
						action: "setStickyIdleMinutes",
						minutes: input.minutes
					}).pipe(mapError$2(() => new PluginError({
						operation: "idle-minutes",
						cause: null
					})));
					yield* manage(strategy);
					yield* manage(idle);
					return null;
				})),
				command("refresh", "Refresh quotas", "Refresh account quota windows.", readPermission, true, () => manage({ action: "refresh" }).pipe(as(null))),
				command("account-enabled", "Enable or disable account", "Control whether an account can receive new requests.", "providers:manage", true, (input) => mutate({
					...input,
					action: "setAccountEnabled"
				})),
				command("remove-account", "Remove account", "Remove an account and its stored credentials.", "providers:manage", true, (input) => mutate({
					...input,
					action: "removeAccount"
				})),
				command("configure-client", "Configure client", "Verify a remote proxy and route new supported CLI launches through it.", "providers:manage", false, (input) => mutate({
					...input,
					action: "configureClient",
					apiKey: input["api-key"]
				})),
				command("disconnect-client", "Disconnect client", "Remove this environment's remote proxy routing.", "providers:manage", true, () => manage({ action: "disconnectClient" }).pipe(as(null))),
				command("import-account", "Import account", "Import credential JSON privately; the JSON is never returned.", "providers:manage", false, (input) => decodeCredential(String(input.credential)).pipe(mapError$2(() => new PluginError({
					operation: "credential-json",
					cause: null
				})), flatMap((credential) => mutate({
					action: "importAccount",
					name: input.name ?? "account.json",
					credential
				})))),
				command("auth-start", "Start sign-in", "Begin a provider's OAuth or device authorization flow.", "providers:manage", false, (input) => decodeManage({
					...input,
					action: "authStart"
				}).pipe(mapError$2(() => new PluginError({
					operation: "input",
					cause: null
				})), flatMap(manage), tap((snapshot) => sync(() => {
					oauth = snapshot.oauth;
				})), andThen(changed), as(null))),
				command("auth-complete", "Complete sign-in", "Complete the pending PKCE sign-in with its full callback URL.", "providers:manage", false, (input) => decodeManage({
					...input,
					action: "authComplete",
					redirectUrl: input["redirect-url"]
				}).pipe(mapError$2(() => new PluginError({
					operation: "input",
					cause: null
				})), flatMap(manage), tap((snapshot) => sync(() => {
					oauth = snapshot.oauth;
				})), andThen(changed), as(null))),
				command("auth-cancel", "Cancel sign-in", "Cancel the pending provider authorization flow.", "providers:manage", false, (input) => mutate({
					...input,
					action: "authCancel"
				}).pipe(tap(() => sync(() => {
					oauth = void 0;
				})), andThen(changed), as(null))),
				...["revealKey", "rotateKey"].map((operation) => command(operation === "revealKey" ? "reveal-key" : "rotate-key", operation === "revealKey" ? "Show API key" : "Rotate API key", "Explicitly disclose the proxy API key only to this authorized caller.", "providers:manage", false, () => manage({ action: operation }).pipe(map$2((snapshot) => ({
					$t3: "secret",
					label: "Proxy API key",
					value: snapshot.apiKey ?? ""
				}))))),
				command("display-options", "Display options", "Set provider filtering and email visibility for this environment's proxy panels.", "settings:write", false, (input) => gen(function* () {
					const next = {
						provider: String(input.provider),
						showEmails: input["show-emails"] === true
					};
					if (next.provider !== "all" && !ModelProxyProvider.literals.includes(next.provider)) return yield* new PluginError({
						operation: "provider-filter",
						cause: null
					});
					yield* host.secrets.set("display-options", yield* encodePreferences(next).pipe(mapError$2(() => new PluginError({
						operation: "display-options",
						cause: null
					}))));
					preferences = next;
					yield* changed;
					return null;
				}))
			],
			views: [{
				id: "settings",
				title: "Agent proxy",
				location: "settings",
				permission: "providers:manage",
				read: () => view("settings")
			}, {
				id: "usage",
				title: "Agent proxy",
				location: "usage",
				permission: readPermission,
				read: () => view("usage")
			}],
			prepareLaunch: (launch) => gen(function* () {
				const environment = yield* proxy.environment(launch.provider, launch.environment).pipe(mapError$2(toPluginError));
				if (!environment.AGENT_PROXY_CODEX_CONFIG) return {
					...launch,
					environment
				};
				const args = yield* decodeConfigArgs(environment.AGENT_PROXY_CODEX_CONFIG).pipe(mapError$2(() => new PluginError({
					operation: "codex-configuration",
					cause: null
				})));
				const { AGENT_PROXY_CODEX_CONFIG: _internal, T3CODE_CODEX_LAUNCH_ARGS: _generated, ...rest } = environment;
				return {
					...launch,
					args: [...launch.args, ...args.args],
					environment: {
						...rest,
						...launch.environment.T3CODE_CODEX_LAUNCH_ARGS === void 0 ? {} : { T3CODE_CODEX_LAUNCH_ARGS: launch.environment.T3CODE_CODEX_LAUNCH_ARGS }
					}
				};
			}),
			handleHttp: (request) => gen(function* () {
				const url = new URL(request.url);
				const apiKey = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? request.headers.get("x-api-key") ?? url.searchParams.get("key") ?? "";
				let payload = {};
				if (!["GET", "HEAD"].includes(request.method)) payload = yield* readPayload(request);
				const response = yield* proxy.forward({
					path: url.pathname.slice(host.httpBasePath.length) + url.search,
					method: request.method,
					apiKey,
					headers: Object.fromEntries(request.headers),
					payload
				}).pipe(mapError$2(toPluginError));
				return toWeb(response);
			}).pipe(catchTags({ PluginError: (error) => succeed$3(Response.json({ error: {
				message: error.message,
				type: error.operation
			} }, { status: error.operation === "body-too-large" ? 413 : error.operation === "unauthorized" ? 401 : error.operation === "noAccounts" || error.operation === "disabled" ? 503 : error.operation === "unsupported" || error.operation === "json" ? 400 : 502 })) }))
		};
	})
};
//#endregion
export { plugin_default as default };
