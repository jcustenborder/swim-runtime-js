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

import {Interpolator} from "@swim/mapping";
import {VectorR2} from "./VectorR2";

/** @hidden */
export const VectorR2Interpolator = function (v0: VectorR2, v1: VectorR2): Interpolator<VectorR2> {
  const interpolator = function (u: number): VectorR2 {
    const v0 = interpolator[0];
    const v1 = interpolator[1];
    const x = v0._x + u * (v1._x - v0._x);
    const y = v0._y + u * (v1._y - v0._y);
    return new VectorR2(x, y);
  } as Interpolator<VectorR2>;
  Object.setPrototypeOf(interpolator, VectorR2Interpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: v0,
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: v1,
    enumerable: true,
  });
  return interpolator;
} as {
  (v0: VectorR2, v1: VectorR2): Interpolator<VectorR2>;

  /** @hidden */
  prototype: Interpolator<VectorR2>;
};

VectorR2Interpolator.prototype = Object.create(Interpolator.prototype);
