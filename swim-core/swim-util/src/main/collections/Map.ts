// Copyright 2015-2021 Swim.inc
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

import type {Iterator} from "./Iterator";

/** @public */
export interface Map<K = unknown, V = unknown> {
  readonly size: number;

  isEmpty(): boolean;

  has(key: K): boolean;

  get(key: K): V | undefined;

  set(key: K, newValue: V): this;

  delete(key: K): boolean;

  clear(): void;

  forEach<T>(callback: (key: K, value: V) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, key: K, value: V) => T | void,
                thisArg: S): T | undefined;

  keys(): Iterator<K>;

  values(): Iterator<V>;

  entries(): Iterator<[K, V]>;
}
