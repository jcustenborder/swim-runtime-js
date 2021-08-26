// Copyright 2015-2021 Swim Inc.
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

import type {WatchValueFunction} from "../function";
import {WatchValueOperator} from "./WatchValueOperator";

export class WatchValueCombinator<I> extends WatchValueOperator<I> {
  constructor(func: WatchValueFunction<I>) {
    super();
    Object.defineProperty(this, "func", {
      value: func,
      enumerable: true,
    });
  }

  /** @hidden */
  readonly func!: WatchValueFunction<I>;

  override evaluate(value: I | undefined): void {
    if (value !== void 0) {
      const func = this.func;
      return func(value);
    }
  }
}
