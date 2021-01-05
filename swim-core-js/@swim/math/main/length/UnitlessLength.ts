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

import {Murmur3, Equivalent, Numbers, Constructors} from "@swim/util";
import {Output} from "@swim/codec";
import {LengthUnits, AnyLength, Length} from "./Length";

export class UnitlessLength extends Length {
  /** @hidden */
  readonly _value: number;
  /** @hidden */
  readonly _node?: Node;

  constructor(value: number, node: Node | null = null) {
    super();
    this._value = value;
    if (node !== null) {
      this._node = node;
    }
  }

  isRelative(): boolean {
    return false;
  }

  get value(): number {
    return this._value;
  }

  get units(): LengthUnits {
    return "";
  }

  get node(): Node | null {
    const node = this._node;
    return node !== void 0 ? node : null;
  }

  unitValue(): number {
    return 0;
  }

  pxValue(): number {
    return this._value;
  }

  compareTo(that: AnyLength): number {
    const x = this._value;
    const y = Length.fromAny(that).value;
    return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
  }

  equivalentTo(that: AnyLength, epsilon: number = Equivalent.Epsilon): boolean {
    const x = this._value;
    const y = Length.fromAny(that).value;
    return x === y || isNaN(x) && isNaN(y) || Math.abs(y - x) < epsilon;
  }

  equals(that: unknown): boolean {
    if (that instanceof UnitlessLength) {
      return this._value === that._value && this._node === that._node;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(UnitlessLength), Numbers.hash(this._value)));
  }

  debug(output: Output): void {
    output = output.write("Length").write(46/*'.'*/).write("unitless").write(40/*'('*/).debug(this._value);
    if (this._node !== void 0) {
      output = output.write(", ").debug(this._node);
    }
    output = output.write(41/*')'*/);
  }

  toString(): string {
    return this._value + "";
  }

  private static _zero: UnitlessLength;
  static zero(units?: "", node?: Node | null): UnitlessLength;
  static zero(node?: Node | null): UnitlessLength;
  static zero(units?: "" | Node | null, node?: Node | null): UnitlessLength {
    if (typeof units !== "string") {
      node = units;
      units = "";
    }
    if (node === void 0 || node === null) {
      if (UnitlessLength._zero === void 0) {
        UnitlessLength._zero = new UnitlessLength(0);
      }
      return UnitlessLength._zero;
    } else {
      return new UnitlessLength(0, node);
    }
  }
}
Length.Unitless = UnitlessLength;
