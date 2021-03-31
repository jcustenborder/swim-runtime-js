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

import {Output, WriterException, Writer} from "@swim/codec";
import type {ReconWriter} from "./ReconWriter";

/** @hidden */
export class GetItemSelectorWriter<I, V> extends Writer {
  private readonly _recon: ReconWriter<I, V>;
  private readonly _index: V;
  private readonly _then: V;
  private readonly _part: Writer | undefined;
  private readonly _step: number | undefined;

  constructor(recon: ReconWriter<I, V>, index: V, then: V, part?: Writer, step?: number) {
    super();
    this._recon = recon;
    this._index = index;
    this._then = then;
    this._part = part;
    this._step = step;
  }

  pull(output: Output): Writer {
    return GetItemSelectorWriter.write(output, this._recon, this._index, this._then,
                                       this._part, this._step);
  }

  static sizeOf<I, V>(recon: ReconWriter<I, V>, index: V, then: V): number {
    let size = 2; // "$#"
    size += recon.sizeOfValue(index);
    size += recon.sizeOfThen(then);
    return size;
  }

  static sizeOfThen<I, V>(recon: ReconWriter<I, V>, index: V, then: V): number {
    let size = 1; // '#'
    size += recon.sizeOfValue(index);
    size += recon.sizeOfThen(then);
    return size;
  }

  static write<I, V>(output: Output, recon: ReconWriter<I, V>, index: V, then: V,
                     part?: Writer, step: number = 1): Writer {
    if (step === 1 && output.isCont()) {
      output = output.write(36/*'$'*/);
      step = 2;
    }
    if (step === 2 && output.isCont()) {
      output = output.write(35/*'#'*/);
      step = 3;
    }
    if (step === 3) {
      if (part === void 0) {
        part = recon.writeValue(index, output);
      } else {
        part = part.pull(output);
      }
      if (part.isDone()) {
        return recon.writeThen(then, output);
      } else if (part.isError()) {
        return part.asError();
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new GetItemSelectorWriter<I, V>(recon, index, then, part, step);
  }

  static writeThen<I, V>(output: Output, recon: ReconWriter<I, V>, index: V, then: V): Writer {
    return GetItemSelectorWriter.write(output, recon, index, then, void 0, 2);
  }
}
