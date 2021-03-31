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

import {Iterator, Cursor} from "@swim/util";
import type {Inlet} from "./Inlet";
import {Outlet} from "./Outlet";
import type {Inoutlet} from "./Inoutlet";
import type {MapValueFunction, WatchValueFunction} from "./function";

export abstract class AbstractInoutlet<I, O> implements Inoutlet<I, O> {
  /** @hidden */
  protected _input: Outlet<I> | null;
  /** @hidden */
  protected _outputs: ReadonlyArray<Inlet<O>> | null;
  /** @hidden */
  protected _version: number;

  constructor() {
    this._input = null;
    this._outputs = null;
    this._version = -1;
  }

  abstract get(): O | undefined;

  input(): Outlet<I> | null {
    return this._input;
  }

  bindInput(input: Outlet<I> | null): void {
    if (this._input !== null) {
      this._input.unbindOutput(this);
    }
    this._input = input;
    if (this._input !== null) {
      this._input.bindOutput(this);
    }
  }

  unbindInput(): void {
    if (this._input !== null) {
      this._input.unbindOutput(this);
    }
    this._input = null;
  }

  disconnectInputs(): void {
    if (this._outputs === null) {
      const input = this._input;
      if (input !== null) {
        input.unbindOutput(this);
        this._input = null;
        input.disconnectInputs();
      }
    }
  }

  outputIterator(): Iterator<Inlet<O>> {
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
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    for (let i = 0; i < n; i += 1) {
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
    if (this._input === null) {
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
  }

  decohereOutput(): void {
    this.decohere();
  }

  decohereInput(): void {
    this.decohere();
  }

  decohere(): void {
    if (this._version >= 0) {
      this.willDecohere();
      this._version = -1;
      this.onDecohere();
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        this._outputs![i]!.decohereOutput();
      }
      this.didDecohere();
    }
  }

  recohereOutput(version: number): void {
    this.recohere(version);
  }

  recohereInput(version: number): void {
    this.recohere(version);
  }

  recohere(version: number): void {
    if (this._version < 0) {
      this.willRecohere(version);
      this._version = version;
      if (this._input !== null) {
        this._input.recohereInput(version);
      }
      this.onRecohere(version);
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        this._outputs![i]!.recohereOutput(version);
      }
      this.didRecohere(version);
    }
  }

  protected willDecohere(): void {
    // stub
  }

  protected onDecohere(): void {
    // stub
  }

  protected didDecohere(): void {
    // stub
  }

  protected willRecohere(version: number): void {
    // stub
  }

  protected onRecohere(version: number): void {
    // stub
  }

  protected didRecohere(version: number): void {
    // stub
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
