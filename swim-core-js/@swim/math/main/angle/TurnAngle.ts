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

import {Lazy, Murmur3, Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {AngleUnits, Angle} from "./Angle";

export class TurnAngle extends Angle {
  constructor(value: number) {
    super();
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
    });
  }

  declare readonly value: number;

  get units(): AngleUnits {
    return "turn";
  }

  degValue(): number {
    return this.value * 360;
  }

  gradValue(): number {
    return this.value * 400;
  }

  radValue(): number {
    return this.value * (2 * Math.PI);
  }

  turnValue(): number {
    return this.value;
  }

  turn(): TurnAngle {
    return this;
  }

  toCssValue(): CSSUnitValue | null {
    if (typeof CSSUnitValue !== "undefined") {
      return new CSSUnitValue(this.value, "turn");
    } else {
      return null;
    }
  }

  compareTo(that: unknown): number {
    if (that instanceof Angle) {
      const x = this.value;
      const y = that.turnValue();
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return NaN;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof Angle) {
      return Numbers.equivalent(this.value, that.turnValue());
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (that instanceof TurnAngle) {
      return this.value === that.value;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(TurnAngle), Numbers.hash(this.value)));
  }

  debug(output: Output): void {
    output = output.write("Angle").write(46/*'.'*/).write("turn")
        .write(40/*'('*/).debug(this.value).write(41/*')'*/);
  }

  toString(): string {
    return this.value + "turn";
  }

  @Lazy
  static zero(): TurnAngle {
    return new TurnAngle(0);
  }
}
