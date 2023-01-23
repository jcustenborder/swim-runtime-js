// Copyright 2015-2023 Swim.inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Lazy, Cursor} from "@swim/util";
import {KeysCursor} from "./KeysCursor";
import {ValuesCursor} from "./ValuesCursor";
import type {STreeContext} from "./STreeContext";
import {STreeLeaf} from "./"; // forward import

/** @internal */
export abstract class STreePage<V = unknown, I = unknown> {
  abstract readonly arity: number;

  abstract readonly size: number;

  abstract isEmpty(): boolean;

  abstract get(index: number): V | undefined;

  abstract getEntry(index: number): [I, V] | undefined;

  abstract updated(index: number, newValue: V, tree: STreeContext<V, I>): STreePage<V, I>;

  abstract inserted(index: number, newValue: V, id: I | undefined, tree: STreeContext<V, I>): STreePage<V, I>;

  abstract removed(index: number, tree: STreeContext<V, I>): STreePage<V, I>;

  abstract drop(lower: number, tree: STreeContext<V, I>): STreePage<V, I>;

  abstract take(upper: number, tree: STreeContext<V, I>): STreePage<V, I>;

  abstract balanced(tree: STreeContext<V, I>): STreePage<V, I>;

  abstract split(index: number): STreePage<V, I>;

  abstract splitLeft(index: number): STreePage<V, I>;

  abstract splitRight(index: number): STreePage<V, I>;

  abstract forEach<T, S>(callback: (this: S, value: V, index: number, id: I) => T | void,
                         thisArg: S, offset: number): T | undefined;

  keys(): Cursor<I> {
    return new KeysCursor(this.entries());
  }

  values(): Cursor<V> {
    return new ValuesCursor(this.entries());
  }

  abstract entries(): Cursor<[I, V]>;

  reverseKeys(): Cursor<I> {
    return new KeysCursor(this.reverseEntries());
  }

  reverseValues(): Cursor<V> {
    return new ValuesCursor(this.reverseEntries());
  }

  abstract reverseEntries(): Cursor<[I, V]>;

  @Lazy
  static empty<V, I>(): STreeLeaf<V, I> {
    return new STreeLeaf([]);
  }
}
