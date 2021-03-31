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

import type {Comparable, Equivalent, HashCode} from "@swim/util";
import {Output, Parser, Debug, Diagnostic, Unicode} from "@swim/codec";
import {Attr, Value, Form} from "@swim/structure";
import type {DegAngle} from "./DegAngle";
import type {RadAngle} from "./RadAngle";
import type {GradAngle} from "./GradAngle";
import type {TurnAngle} from "./TurnAngle";
import type {AngleParser} from "./AngleParser";
import type {AngleForm} from "./AngleForm";

export type AngleUnits = "deg" | "rad" | "grad" | "turn";

export type AnyAngle = Angle | string | number;

export abstract class Angle implements HashCode, Equivalent, Comparable, Debug {
  isDefined(): boolean {
    return this.value !== 0;
  }

  abstract get value(): number;

  abstract get units(): AngleUnits;

  plus(that: AnyAngle, units: AngleUnits = this.units): Angle {
    that = Angle.fromAny(that);
    return Angle.from(this.toValue(units) + that.toValue(units), units);
  }

  opposite(units: AngleUnits = this.units): Angle {
    return Angle.from(-this.toValue(units), units);
  }

  minus(that: AnyAngle, units: AngleUnits = this.units): Angle {
    that = Angle.fromAny(that);
    return Angle.from(this.toValue(units) - that.toValue(units), units);
  }

  times(scalar: number, units: AngleUnits = this.units): Angle {
    return Angle.from(this.toValue(units) * scalar, units);
  }

  divide(scalar: number, units: AngleUnits = this.units): Angle {
    return Angle.from(this.toValue(units) / scalar, units);
  }

  combine(that: AnyAngle, scalar: number = 1, units: AngleUnits = this.units): Angle {
    that = Angle.fromAny(that);
    return Angle.from(this.toValue(units) + that.toValue(units) * scalar, units);
  }

  norm(total: AnyAngle, units: AngleUnits = this.units): Angle {
    total = Angle.fromAny(total);
    return Angle.from(this.toValue(units) / total.toValue(units), units);
  }

  abstract degValue(): number;

  abstract gradValue(): number;

  abstract radValue(): number;

  abstract turnValue(): number;

  deg(): DegAngle {
    return Angle.deg(this.degValue());
  }

  rad(): RadAngle {
    return Angle.rad(this.radValue());
  }

  grad(): GradAngle {
    return Angle.grad(this.gradValue());
  }

  turn(): TurnAngle {
    return Angle.turn(this.turnValue());
  }

  toValue(units: AngleUnits): number {
    switch (units) {
      case "deg": return this.degValue();
      case "grad": return this.gradValue();
      case "rad": return this.radValue();
      case "turn": return this.turnValue();
      default: throw new Error("unknown angle units: " + units);
    }
  }

  to(units: AngleUnits): Angle {
    switch (units) {
      case "deg": return this.deg();
      case "grad": return this.grad();
      case "rad": return this.rad();
      case "turn": return this.turn();
      default: throw new Error("unknown angle units: " + units);
    }
  }

  toCssValue(): CSSUnitValue | undefined {
    return void 0; // conditionally overridden when CSS Typed OM is available
  }

  abstract compareTo(that: unknown): number;

  abstract equivalentTo(that: unknown, epsilon?: number): boolean;

  abstract equals(that: unknown): boolean;

  abstract hashCode(): number;

  abstract debug(output: Output): void;

  abstract toString(): string;

  static zero(units: AngleUnits = "rad"): Angle {
    switch (units) {
      case "deg": return Angle.Deg.zero();
      case "rad": return Angle.Rad.zero();
      case "grad": return Angle.Grad.zero();
      case "turn": return Angle.Turn.zero();
      default: throw new Error("unknown angle units: " + units);
    }
  }

  static deg(value: number): DegAngle {
    return new Angle.Deg(value);
  }

  static rad(value: number): RadAngle {
    return new Angle.Rad(value);
  }

  static grad(value: number): GradAngle {
    return new Angle.Grad(value);
  }

  static turn(value: number): TurnAngle {
    return new Angle.Turn(value);
  }

  static from(value: number, units: AngleUnits = "rad"): Angle {
    switch (units) {
      case "deg": return Angle.deg(value);
      case "rad": return Angle.rad(value);
      case "grad": return Angle.grad(value);
      case "turn": return Angle.turn(value);
      default: throw new Error("unknown angle units: " + units);
    }
  }

  static fromCss(value: CSSStyleValue): Angle {
    if (value instanceof CSSUnitValue) {
      return Angle.from(value.value, value.unit as AngleUnits);
    } else {
      throw new TypeError("" + value);
    }
  }

  static fromAny(value: AnyAngle, defaultUnits?: AngleUnits): Angle {
    if (value instanceof Angle) {
      return value;
    } else if (typeof value === "number") {
      return Angle.from(value, defaultUnits);
    } else if (typeof value === "string") {
      return Angle.parse(value, defaultUnits);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): Angle | undefined {
    if (value.length === 2) {
      const num = value.getItem(0).numberValue();
      const units = value.getItem(1);
      if (num !== void 0 && isFinite(num) && units instanceof Attr && units.toValue() === Value.extant()) {
        switch (units.key.value) {
          case "deg": return Angle.deg(num);
          case "rad": return Angle.rad(num);
          case "grad": return Angle.grad(num);
          case "turn": return Angle.turn(num);
          default:
        }
      }
    }
    return void 0;
  }

  static parse(string: string, defaultUnits?: AngleUnits): Angle {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = Angle.Parser.parse(input, defaultUnits);
    if (parser.isDone()) {
      while (input.isCont() && Unicode.isWhitespace(input.head())) {
        input = input.step();
      }
    }
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return parser.bind();
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyAngle {
    return value instanceof Angle
        || typeof value === "number"
        || typeof value === "string";
  }

  private static _form: Form<Angle, AnyAngle>;
  static form(defaultUnits?: AngleUnits, unit?: AnyAngle): Form<Angle, AnyAngle> {
    if (unit !== void 0) {
      unit = Angle.fromAny(unit);
    }
    if (defaultUnits !== void 0 || unit !== void 0) {
      return new Angle.Form(defaultUnits, unit);
    } else {
      if (Angle._form === void 0) {
        Angle._form = new Angle.Form();
      }
      return Angle._form;
    }
  }

  /** @hidden */
  static readonly PI: number = Math.PI;
  /** @hidden */
  static readonly TAU: number = 2 * Angle.PI;

  // Forward type declarations
  /** @hidden */
  static Deg: typeof DegAngle; // defined by DegAngle
  /** @hidden */
  static Rad: typeof RadAngle; // defined by RadAngle
  /** @hidden */
  static Grad: typeof GradAngle; // defined by GradAngle
  /** @hidden */
  static Turn: typeof TurnAngle; // defined by TurnAngle
  /** @hidden */
  static Parser: typeof AngleParser; // defined by AngleParser
  /** @hidden */
  static Form: typeof AngleForm; // defined by AngleForm
}
