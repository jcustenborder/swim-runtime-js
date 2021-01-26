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
import type {Output} from "@swim/codec";
import type {Interpolator} from "@swim/mapping";
import {Item, Value, Record} from "@swim/structure";
import {PointR2} from "../r2/PointR2";
import {Transform} from "./Transform";
import {AffineTransform} from "./AffineTransform";
import {IdentityTransform} from "./IdentityTransform";
import {TransformListInterpolator} from "../"; // forward import

export class TransformList extends Transform {
  constructor(transforms: ReadonlyArray<Transform>) {
    super();
    Object.defineProperty(this, "transforms", {
      value: transforms,
      enumerable: true,
    });
    Object.defineProperty(this, "stringValue", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly transforms: ReadonlyArray<Transform>;

  transform(that: Transform): Transform;
  transform(x: number, y: number): PointR2;
  transform(x: Transform | number, y?: number): Transform | PointR2 {
    if (arguments.length === 1) {
      if (x instanceof IdentityTransform) {
        return this;
      } else {
        return Transform.list(this, x as Transform);
      }
    } else {
      const transforms = this.transforms;
      for (let i = 0, n = transforms.length; i < n; i += 1) {
        const transform = transforms[i]!;
        const xi = transform.transformX(x as number, y!);
        const yi = transform.transformY(x as number, y!);
        x = xi;
        y = yi;
      }
      return new PointR2(x as number, y!);
    }
  }

  transformX(x: number, y: number): number {
    const transforms = this.transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      const transform = transforms[i]!;
      const xi = transform.transformX(x, y);
      const yi = transform.transformY(x, y);
      x = xi;
      y = yi;
    }
    return x;
  }

  transformY(x: number, y: number): number {
    const transforms = this.transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      const transform = transforms[i]!;
      const xi = transform.transformX(x, y);
      const yi = transform.transformY(x, y);
      x = xi;
      y = yi;
    }
    return y;
  }

  inverse(): Transform {
    const transforms = this.transforms;
    const n = transforms.length;
    const inverseTransforms = new Array<Transform>(n);
    for (let i = 0; i < n; i += 1) {
      inverseTransforms[i] = transforms[n - i - 1]!.inverse();
    }
    return new TransformList(inverseTransforms);
  }

  toAffine(): AffineTransform {
    let matrix = AffineTransform.identity();
    const transforms = this.transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      matrix = matrix.multiply(transforms[i]!.toAffine());
    }
    return matrix;
  }

  toCssTransformComponent(): CSSTransformComponent | null {
    if (typeof CSSTranslate !== "undefined") {
      return new CSSMatrixComponent(this.toMatrix());
    }
    return null;
  }

  toCssValue(): CSSStyleValue | null {
    if (typeof CSSTransformValue !== "undefined") {
      const transforms = this.transforms;
      const n = transforms.length;
      const components = new Array<CSSTransformComponent>(n);
      for (let i = 0, n = transforms.length; i < n; i += 1) {
        const transform = transforms[i]!;
        const component = transform.toCssTransformComponent();
        if (component !== null) {
          components[i] = component;
        } else {
          return null;
        }
      }
      return new CSSTransformValue(components);
    }
    return null;
  }

  toValue(): Value {
    const transforms = this.transforms;
    const n = transforms.length;
    const record = Record.create(n);
    for (let i = 0; i < n; i += 1) {
      record.push(transforms[i]!.toValue());
    }
    return record;
  }

  interpolateTo(that: TransformList): Interpolator<TransformList>;
  interpolateTo(that: Transform): Interpolator<Transform>;
  interpolateTo(that: unknown): Interpolator<Transform> | null;
  interpolateTo(that: unknown): Interpolator<Transform> | null {
    if (that instanceof TransformList) {
      return TransformListInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  conformsTo(that: Transform): boolean {
    if (that instanceof TransformList) {
      const n = this.transforms.length;
      if (n === that.transforms.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this.transforms[i]!.conformsTo(that.transforms[i]!)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (that instanceof TransformList) {
      const n = this.transforms.length;
      if (n === that.transforms.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this.transforms[i]!.equivalentTo(that.transforms[i]!, epsilon)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (that instanceof TransformList) {
      const n = this.transforms.length;
      if (n === that.transforms.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this.transforms[i]!.equals(that.transforms[i]!)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  hashCode(): number {
    let hashValue = Constructors.hash(TransformList);
    const transforms = this.transforms;
    for (let i = 0, n = transforms.length; i < n; i += 1) {
      hashValue = Murmur3.mix(hashValue, transforms[i]!.hashCode());
    }
    return Murmur3.mash(hashValue);
  }

  debug(output: Output): void {
    output = output.write("Transform").write(46/*'.'*/).write("list").write(40/*'('*/);
    const transforms = this.transforms;
    const n = transforms.length;
    if (n > 0) {
      output = output.debug(transforms[0]!);
      for (let i = 1; i < n; i += 1) {
        output = output.write(", ").debug(transforms[i]!);
      }
    }
    output = output.write(41/*')'*/);
  }

  /** @hidden */
  declare readonly stringValue: string | undefined;

  toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      const transforms = this.transforms;
      const n = transforms.length;
      if (n > 0) {
        stringValue = transforms[0]!.toString();
        for (let i = 1; i < n; i += 1) {
          stringValue += " ";
          stringValue += transforms[i]!.toString();
        }
      } else {
        stringValue = "none";
      }
      Object.defineProperty(this, "stringValue", {
        value: stringValue,
        enumerable: true,
        configurable: true,
      });
    }
    return stringValue;
  }

  toAttributeString(): string {
    const transforms = this.transforms;
    const n = transforms.length;
    if (n > 0) {
      let s = transforms[0]!.toAttributeString();
      for (let i = 1; i < n; i += 1) {
        s += " ";
        s += transforms[i]!.toAttributeString();
      }
      return s;
    } else {
      return "";
    }
  }

  static fromAny(value: TransformList | string): TransformList {
    if (value instanceof TransformList) {
      return value;
    } else if (typeof value === "string") {
      return TransformList.parse(value);
    }
    throw new TypeError("" + value);
  }

  static fromValue(value: Value): TransformList | null {
    const transforms: Transform[] = [];
    value.forEach(function (item: Item) {
      const transform = Transform.fromValue(item.toValue());
      if (transform !== null) {
        transforms.push(transform);
      }
    }, this);
    if (transforms.length !== 0) {
      return new TransformList(transforms);
    }
    return null;
  }

  static parse(string: string): TransformList {
    const transform = Transform.parse(string);
    if (transform instanceof TransformList) {
      return transform;
    } else {
      return new TransformList([transform]);
    }
  }
}
