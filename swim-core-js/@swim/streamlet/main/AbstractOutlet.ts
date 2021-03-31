// Copyright 2015-2020 Swim inc.
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

import {Cursor} from "@swim/util";
import type {Inlet} from "./Inlet";
import {Outlet} from "./Outlet";
import type {MapValueFunction, WatchValueFunction} from "./function";

export abstract class AbstractOutlet<O> implements Outlet<O> {
  /** @hidden */
  protected _outputs: ReadonlyArray<Inlet<O>> | null;
  /** @hidden */
  protected _version: number;

  constructor() {
    this._outputs = null;
    this._version = -1;
  }

  abstract get(): O | undefined;

  outputIterator(): Cursor<Inlet<O>> {
    return this._outputs !== null ? Cursor.array(this._outputs) : Cursor.empty();
  }

  bindOutput(output: Inlet<O>): void {
    const oldOutputs = this._outputs;
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    const newOutputs = new Array<Inlet<O>>(n + 1);
    for (let i = 0; i < n; i += 1) {
      newOutputs[i] = oldOutputs![i]!;
    }
    newOutputs[n] = output;
    this._outputs = newOutputs;
  }

  unbindOutput(output: Inlet<O>): void {
    const oldOutputs = this._outputs;
    for (let i = 0, n = oldOutputs !== null ? oldOutputs.length : 0; i < n; i += 1) {
      if (oldOutputs![i] === output) {
        if (n > 1) {
          const newOutputs = new Array<Inlet<O>>(n - 1);
          for (let j = 0; j < i; j += 1) {
            newOutputs[j] = oldOutputs![j]!;
          }
          for (let j = i; j < n - 1; j += 1) {
            newOutputs[j] = oldOutputs![j + 1]!;
          }
          this._outputs = newOutputs;
        } else {
          this._outputs = null;
        }
        break;
      }
    }
  }

  unbindOutputs(): void {
    const outputs = this._outputs;
    if (outputs !== null) {
      this._outputs = null;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.unbindInput();
      }
    }
  }

  disconnectOutputs(): void {
    const outputs = this._outputs;
    if (outputs !== null) {
      this._outputs = null;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.unbindInput();
        output.disconnectOutputs();
      }
    }
  }

  disconnectInputs(): void {
    // nop
  }

  decohereInput(): void {
    if (this._version >= 0) {
      this.willDecohereInput();
      this._version = -1;
      this.onDecohereInput();
      for (let i = 0, n = this._outputs !== null ? this._outputs.length : 0; i < n; i += 1) {
        this._outputs![i]!.decohereOutput();
      }
      this.didDecohereInput();
    }
  }

  recohereInput(version: number): void {
    if (this._version < 0) {
      this.willRecohereInput(version);
      this._version = version;
      this.onRecohereInput(version);
      for (let i = 0, n = this._outputs !== null ? this._outputs.length : 0; i < n; i += 1) {
        this._outputs![i]!.recohereOutput(version);
      }
      this.didRecohereInput(version);
    }
  }

  protected willDecohereInput(): void {
    // hook
  }

  protected onDecohereInput(): void {
    // hook
  }

  protected didDecohereInput(): void {
    // hook
  }

  protected willRecohereInput(version: number): void {
    // hook
  }

  protected onRecohereInput(version: number): void {
    // hook
  }

  protected didRecohereInput(version: number): void {
    // hook
  }

  memoize(): Outlet<O> {
    const combinator = new Outlet.MemoizeValueCombinator<O>();
    combinator.bindInput(this);
    return combinator;
  }

  map<O2>(func: MapValueFunction<O, O2>): Outlet<O2> {
    const combinator = new Outlet.MapValueCombinator<O, O2>(func);
    combinator.bindInput(this);
    return combinator;
  }

  watch(func: WatchValueFunction<O>): this {
    const combinator = new Outlet.WatchValueCombinator<O>(func);
    combinator.bindInput(this);
    return this;
  }
}
