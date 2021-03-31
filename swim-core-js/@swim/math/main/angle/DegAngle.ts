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

import {Equivalent, Murmur3} from "@swim/util";
import {Output} from "@swim/codec";
import {AngleUnits, AnyAngle, Angle} from "./Angle";

export class DegAngle extends Angle {
  /** @hidden */
  readonly _value: number;

  constructor(value: number) {
    super();
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  get units(): AngleUnits {
    return "deg";
  }

  degValue(): number {
    return this._value;
  }

  gradValue(): number {
    return this._value * 10 / 9;
  }

  radValue(): number {
    return this._value * Angle.PI / 180;
  }

  turnValue(): number {
    return this._value / 360;
  }

  deg(): DegAngle {
    return this;
  }

  compareTo(that: AnyAngle): number {
    const x = this._value;
    const y = Angle.fromAny(that).degValue();
    return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
  }

  equivalentTo(that: AnyAngle, epsilon: number = Equivalent.Epsilon): boolean {
    const x = this._value;
    const y = Angle.fromAny(that).degValue();
    return x === y || isNaN(x) && isNaN(y) || Math.abs(y - x) < epsilon;
  }

  equals(that: unknown): boolean {
    if (that instanceof DegAngle) {
      return this._value === that._value;
    }
    return false;
  }

  hashCode(): number {
    if (DegAngle._hashSeed === void 0) {
      DegAngle._hashSeed = Murmur3.seed(DegAngle);
    }
    return Murmur3.mash(Murmur3.mix(DegAngle._hashSeed, Murmur3.hash(this._value)));
  }

  debug(output: Output): void {
    output = output.write("Angle").write(46/*'.'*/).write("deg").write(40/*'('*/)
        .debug(this._value).write(41/*')'*/);
  }

  toString(): string {
    return this._value + "deg";
  }

  private static _hashSeed?: number;

  private static _zero?: DegAngle;
  static zero(units?: "deg"): DegAngle {
    if (DegAngle._zero === void 0) {
      DegAngle._zero = new DegAngle(0);
    }
    return DegAngle._zero;
  }
}
if (typeof CSSUnitValue !== "undefined") { // CSS Typed OM support
  DegAngle.prototype.toCssValue = function (this: DegAngle): CSSUnitValue | undefined {
    return new CSSUnitValue(this._value, "deg");
  };
}
Angle.Deg = DegAngle;
