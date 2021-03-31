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

import {Murmur3, Constructors} from "@swim/util";
import {Output, Parser, Diagnostic, Unicode} from "@swim/codec";
import {Item, Attr, Value, Record} from "@swim/structure";
import {AnyLength, Length} from "../length/Length";
import {AnyAngle, Angle} from "../angle/Angle";
import {Transform} from "./Transform";
import {AffineTransform} from "./AffineTransform";

export class RotateTransform extends Transform {
  /** @hidden */
  readonly _a: Angle;
  /** @hidden */
  _string?: string;

  constructor(a: Angle) {
    super();
    this._a = a;
  }

  get angle(): Angle {
    return this._a;
  }

  transform(that: Transform): Transform;
  transform(point: [number, number]): [number, number];
  transform(x: number, y: number): [number, number];
  transform(point: [AnyLength, AnyLength]): [Length, Length];
  transform(x: AnyLength, y: AnyLength): [Length, Length];
  transform(x: Transform | [AnyLength, AnyLength] | AnyLength, y?: AnyLength): Transform | [number, number] | [Length, Length] {
    if (x instanceof Transform) {
      if (x instanceof Transform.Identity) {
        return this;
      } else {
        return new Transform.List([this, x]);
      }
    } else {
      if (Array.isArray(x)) {
        y = x[1];
        x = x[0];
      }
      x = Length.fromAny(x);
      y = Length.fromAny(y!);
      const a = this._a.radValue();
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      if (typeof x === "number" && typeof y === "number") {
        return [x * cosA - y * sinA,
                x * sinA + y * cosA];
      } else {
        return [x.times(cosA).minus(y.times(sinA)),
                x.times(sinA).plus(y.times(cosA))];
      }
    }
  }

  transformX(x: number, y: number): number {
    const a = this._a.radValue();
    return x * Math.cos(a) - y * Math.sin(a);
  }

  transformY(x: number, y: number): number {
    const a = this._a.radValue();
    return x * Math.sin(a) + y * Math.cos(a);
  }

  inverse(): Transform {
    return new RotateTransform(this._a.opposite());
  }

  toAffine(): AffineTransform {
    const a = this._a.radValue();
    return new Transform.Affine(Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0);
  }

  toValue(): Value {
    return Record.of(Attr.of("rotate", this._a.toString()));
  }

  conformsTo(that: Transform): boolean {
    return that instanceof RotateTransform;
  }

  equals(that: Transform): boolean {
    if (that instanceof RotateTransform) {
      return this._a.equals(that._a);
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(RotateTransform), this._a.hashCode()));
  }

  debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("rotate")
        .write(40/*'('*/).debug(this._a).write(41/*')'*/);
  }

  toString(): string {
    let string = this._string;
    if (string === void 0) {
      string = "rotate(" + this._a + ")";
      this._string = string;
    }
    return string;
  }

  toAttributeString(): string {
    return "rotate(" + this._a.degValue() + ")";
  }

  static from(a: AnyAngle): RotateTransform {
    a = Angle.fromAny(a, "deg");
    return new RotateTransform(a);
  }

  static fromCssTransformComponent(component: CSSRotate): RotateTransform {
    const a = Angle.fromCss(component.angle);
    return new RotateTransform(a);
  }

  static fromAny(value: RotateTransform | string): RotateTransform {
    if (value instanceof RotateTransform) {
      return value;
    } else if (typeof value === "string") {
      return RotateTransform.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): RotateTransform | undefined {
    const header = value.header("rotate");
    if (header.isDefined()) {
      let a = Angle.zero();
      header.forEach(function (item: Item, index: number) {
        const key = item.key.stringValue();
        if (key === "a") {
          a = item.toValue().cast(Angle.form(), a);
        } else if (item instanceof Value && index === 0) {
          a = item.cast(Angle.form(), a);
        }
      }, this);
      return new RotateTransform(a);
    }
    return void 0;
  }

  static parse(string: string): RotateTransform {
    let input = Unicode.stringInput(string);
    while (input.isCont() && Unicode.isWhitespace(input.head())) {
      input = input.step();
    }
    let parser = Transform.RotateParser.parse(input);
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
}
if (typeof CSSRotate !== "undefined") { // CSS Typed OM support
  RotateTransform.prototype.toCssTransformComponent = function (this: RotateTransform): CSSTransformComponent | undefined {
    const angle = this._a.toCssValue();
    return new CSSRotate(angle!);
  };
}
Transform.Rotate = RotateTransform;
