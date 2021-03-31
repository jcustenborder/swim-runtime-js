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

import {Murmur3, Equivalent, HashCode, Numbers, Constructors} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import {R2Function} from "./R2Function";
import {AnyShapeR2, ShapeR2} from "./ShapeR2";
import {PointR2} from "./PointR2";
import {SegmentR2} from "./SegmentR2";
import {BoxR2} from "./BoxR2";

export type AnyCircleR2 = CircleR2 | CircleR2Init;

export interface CircleR2Init {
  cx: number;
  cy: number;
  r: number;
}

export class CircleR2 extends ShapeR2 implements Equivalent<CircleR2>, HashCode, Debug {
  /** @hidden */
  readonly _cx: number;
  /** @hidden */
  readonly _cy: number;
  /** @hidden */
  readonly _r: number;

  constructor(x: number, y: number, r: number) {
    super();
    this._cx = x;
    this._cy = y;
    this._r = r;
  }

  isDefined(): boolean {
    return this._cx !== 0 || this._cy !== 0 || this._r !== 0;
  }

  get cx(): number {
    return this._cx;
  }

  get cy(): number {
    return this._cy;
  }

  get r(): number {
    return this._r;
  }

  get xMin(): number {
    return this._cx - this._r;
  }

  get yMin(): number {
    return this._cy - this._r;
  }

  get xMax(): number {
    return this._cx + this._r;
  }

  get yMax(): number {
    return this._cy + this._r;
  }

  contains(that: AnyShapeR2): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShapeR2 | number, y?: number): boolean {
    if (typeof that === "number") {
      const dx = that - this._cx;
      const dy = y! - this._cy;
      return dx * dx + dy * dy <= this._r * this._r;
    } else {
      that = ShapeR2.fromAny(that);
      if (that instanceof PointR2) {
        return this.containsPoint(that);
      } else if (that instanceof SegmentR2) {
        return this.containsSegment(that);
      } else if (that instanceof BoxR2) {
        return this.containsBox(that);
      } else if (that instanceof CircleR2) {
        return this.containsCircle(that);
      }
      return false;
    }
  }

  /** @hidden */
  containsPoint(that: PointR2): boolean {
    const dx = that._x - this._cx;
    const dy = that._y - this._cy;
    return dx * dx + dy * dy <= this._r * this._r;
  }

  /** @hidden */
  containsSegment(that: SegmentR2): boolean {
    const dx0 = that._x0 - this._cx;
    const dy0 = that._y0 - this._cy;
    const dx1 = that._x1 - this._cx;
    const dy1 = that._y1 - this._cy;
    const r2 = this._r * this._r;
    return dx0 * dx0 + dy0 * dy0 <= r2
        && dx1 * dx1 + dy1 * dy1 <= r2;
  }

  /** @hidden */
  containsBox(that: BoxR2): boolean {
    const dxMin = that._xMin - this._cx;
    const dyMin = that._yMin - this._cy;
    const dxMax = that._xMax - this._cx;
    const dyMax = that._yMax - this._cy;
    const r2 = this._r * this._r;
    return dxMin * dxMin + dyMin * dyMin <= r2
        && dxMin * dxMin + dyMax * dyMax <= r2
        && dxMax * dxMax + dyMin * dyMin <= r2
        && dxMax * dxMax + dyMax * dyMax <= r2;
  }

  /** @hidden */
  containsCircle(that: CircleR2): boolean {
    const dx = that._cx - this._cx;
    const dy = that._cy - this._cy;
    return dx * dx + dy * dy + that._r * that._r <= this._r * this._r;
  }

  intersects(that: AnyShapeR2): boolean {
    that = ShapeR2.fromAny(that);
    if (that instanceof PointR2) {
      return this.intersectsPoint(that);
    } else if (that instanceof SegmentR2) {
      return this.intersectsSegment(that);
    } else if (that instanceof BoxR2) {
      return this.intersectsBox(that);
    } else if (that instanceof CircleR2) {
      return this.intersectsCircle(that);
    } else {
      return (that as ShapeR2).intersects(this);
    }
    return false;
  }

  /** @hidden */
  intersectsPoint(that: PointR2): boolean {
    const dx = that._x - this._cx;
    const dy = that._y - this._cy;
    return dx * dx + dy * dy <= this._r * this._r;
  }

  /** @hidden */
  intersectsSegment(that: SegmentR2): boolean {
    const cx = this._cx;
    const cy = this._cy;
    const r = this._r;
    const x0 = that._x0;
    const y0 = that._y0;
    const x1 = that._x1;
    const y1 = that._y1;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const l = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / l;
    const unitY = dy / l;
    const d = (cx - x0) * unitY - (cy - y0) * unitX;
    if (d < -r || r < d) {
      return false;
    } else {
      const dcx0 = x0 - cx;
      const dcy0 = y0 - cy;
      const dcx1 = x1 - cx;
      const dcy1 = y1 - cy;
      const r2 = r * r;
      if (dcx0 * dcx0 + dcy0 * dcy0 <= r2 || dcx1 * dcx1 + dcy1 * dcy1 <= r2) {
        return true;
      } else {
        const uc = unitX * cx + unitY * cy;
        const u0 = unitX * x0 + unitY * y0;
        const u1 = unitX * x1 + unitY * y1;
        return u0 < uc && uc <= u1 || u1 < uc && uc <= u0;
      }
    }
  }

  /** @hidden */
  intersectsBox(that: BoxR2): boolean {
    const dx = (this._cx < that._xMin ? that._xMin : that._xMax < this._cx ? that._xMax : this._cx) - this._cx;
    const dy = (this._cy < that._yMin ? that._yMin : that._yMax < this._cy ? that._yMax : this._cy) - this._cy;
    return dx * dx + dy * dy <= this._r * this._r;
  }

  /** @hidden */
  intersectsCircle(that: CircleR2): boolean {
    const dx = that._cx - this._cx;
    const dy = that._cy - this._cy;
    const rr = this._r + that._r;
    return dx * dx + dy * dy <= rr * rr;
  }

  transform(f: R2Function): CircleR2 {
    const cx = f.transformX(this._cx, this._cy);
    const cy = f.transformY(this._cx, this._cy);
    const rx = f.transformX(this._cx + this._r, this._cy);
    const ry = f.transformY(this._cx + this._r, this._cy);
    const dx = rx - cx;
    const dy = ry - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    return new CircleR2(cx, cy, r);
  }

  toAny(): CircleR2Init {
    return {
      cx: this._cx,
      cy: this._cy,
      r: this._r,
    };
  }

  equivalentTo(that: CircleR2, epsilon?: number): boolean {
    return Numbers.equivalent(that._cx, this._cx, epsilon)
        && Numbers.equivalent(that._cy, this._cy, epsilon)
        && Numbers.equivalent(that._r, this._r, epsilon);
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof CircleR2) {
      return this._cx === that._cx && this._cy === that._cy && this._r === that._r;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Constructors.hash(CircleR2),
        Numbers.hash(this._cx)), Numbers.hash(this._cy)), Numbers.hash(this._r)));
  }

  debug(output: Output): void {
    output.write("CircleR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this._cx).write(", ").debug(this._cy).write(", ").debug(this._r).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  static of(cx: number, cy: number, r: number): CircleR2 {
    return new CircleR2(cx, cy, r);
  }

  static fromInit(value: CircleR2Init): CircleR2 {
    return new CircleR2(value.cx, value.cy, value.r);
  }

  static fromAny(value: AnyCircleR2): CircleR2 {
    if (value instanceof CircleR2) {
      return value;
    } else if (CircleR2.isInit(value)) {
      return CircleR2.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is CircleR2Init {
    if (typeof value === "object" && value !== null) {
      const init = value as CircleR2Init;
      return typeof init.cx === "number"
          && typeof init.cy === "number"
          && typeof init.r === "number";
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyCircleR2 {
    return value instanceof CircleR2
        || CircleR2.isInit(value);
  }
}
ShapeR2.Circle = CircleR2;
