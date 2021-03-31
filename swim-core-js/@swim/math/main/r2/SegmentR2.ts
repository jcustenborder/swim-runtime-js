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

import {HashCode, Murmur3, Objects} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import {R2Function} from "./R2Function";
import {AnyShapeR2, ShapeR2} from "./ShapeR2";
import {PointR2} from "./PointR2";
import {CurveR2Context} from "./CurveR2Context";
import {CurveR2} from "./CurveR2";
import {BezierCurveR2} from "./BezierCurveR2";

export type AnySegmentR2 = SegmentR2 | SegmentR2Init;

export interface SegmentR2Init {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export class SegmentR2 extends BezierCurveR2 implements HashCode, Debug {
  /** @hidden */
  readonly _x0: number;
  /** @hidden */
  readonly _y0: number;
  /** @hidden */
  readonly _x1: number;
  /** @hidden */
  readonly _y1: number;

  constructor(x0: number, y0: number, x1: number, y1: number) {
    super();
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
  }

  isDefined(): boolean {
    return isFinite(this._x0) && isFinite(this._y0)
        && isFinite(this._x1) && isFinite(this._y1);
  }

  get x0(): number {
    return this._x0;
  }

  get y0(): number {
    return this._y0;
  }

  get x1(): number {
    return this._x1;
  }

  get y1(): number {
    return this._y1;
  }

  get xMin(): number {
    return Math.min(this._x0, this._x1);
  }

  get yMin(): number {
    return Math.min(this._y0, this._y1);
  }

  get xMax(): number {
    return Math.max(this._x0, this._x1);
  }

  get yMax(): number {
    return Math.max(this._y0, this._y1);
  }

  interpolateX(u: number): number {
    return (1.0 - u) * this._x0 + u * this._x1;
  }

  interpolateY(u: number): number {
   return (1.0 - u) * this._y0 + u * this._y1;
  }

  interpolate(u: number): PointR2 {
    const v = 1.0 - u;
    const x01 = v * this._x0 + u * this._x1;
    const y01 = v * this._y0 + u * this._y1;
    return new PointR2(x01, y01);
  }

  contains(that: AnyShapeR2): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShapeR2 | number, y?: number): boolean {
    if (typeof that === "number") {
      return SegmentR2.contains(this._x0, this._y0, this._x1, this._y1, that, y!);
    } else {
      that = ShapeR2.fromAny(that);
      if (that instanceof PointR2) {
        return this.containsPoint(that);
      } else if (that instanceof SegmentR2) {
        return this.containsSegment(that);
      }
      return false;
    }
  }

  /** @hidden */
  containsPoint(that: PointR2): boolean {
    return SegmentR2.contains(this._x0, this._y0, this._x1, this._y1, that._x, that._y);
  }

  /** @hidden */
  containsSegment(that: SegmentR2): boolean {
    return SegmentR2.contains(this._x0, this._y0, this._x1, this._y1, that._x0, that._y0)
        && SegmentR2.contains(this._x0, this._y0, this._x1, this._y1, that._x1, that._y1);
  }

  /** @hidden */
  static contains(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
    return (ax <= cx && cx <= bx || bx <= cx && cx <= ax)
        && (ay <= cy && cy <= by || by <= cy && cy <= ay)
        && (bx - ax) * (cy - ay) === (cx - ax) * (by - ay);
  }

  intersects(that: AnyShapeR2): boolean {
    that = ShapeR2.fromAny(that);
    if (that instanceof PointR2) {
      return this.intersectsPoint(that);
    } else if (that instanceof SegmentR2) {
      return this.intersectsSegment(that);
    } else {
      return (that as ShapeR2).intersects(this);
    }
    return false;
  }

  /** @hidden */
  intersectsPoint(that: PointR2): boolean {
    return SegmentR2.contains(this._x0, this._y0, this._x1, this._y1, that._x, that._y);
  }

  /** @hidden */
  intersectsSegment(that: SegmentR2): boolean {
    return SegmentR2.intersects(this._x0, this._y0, this._x1 - this._x0, this._y1 - this._y0,
                                that._x0, that._y0, that._x1 - that._x0, that._y1 - that._y0);
  }

  /** @hidden */
  static intersects(px: number, py: number, rx: number, ry: number,
                    qx: number, qy: number, sx: number, sy: number): boolean {
    const pqx = qx - px;
    const pqy = qy - py;
    const pqr = pqx * ry - pqy * rx;
    const rs = rx * sy - ry * sx;
    if (pqr === 0 && rs === 0) { // collinear
      const rr = rx * rx + ry * ry;
      const sr = sx * rx + sy * ry;
      const t0 = (pqx * rx + pqy * ry) / rr;
      const t1 = t0 + sr / rr;
      return sr >= 0 ? 0 < t1 && t0 < 1 : 0 < t0 && t1 < 1;
    } else if (rs === 0) { // parallel
      return false;
    } else {
      const pqs = pqx * sy - pqy * sx;
      const t = pqs / rs; // (q − p) × s / (r × s)
      const u = pqr / rs; // (q − p) × r / (r × s)
      return 0 <= t && t <= 1 && 0 <= u && u <= 1;
    }
  }

  split(u: number): [SegmentR2, SegmentR2] {
    const v = 1.0 - u;
    const x01 = v * this._x0 + u * this._x1;
    const y01 = v * this._y0 + u * this._y1;
    const c0 = new SegmentR2(this._x0, this._y0, x01, y01);
    const c1 = new SegmentR2(x01, y01, this._x1, this._y1);
    return [c0, c1];
  }

  transform(f: R2Function): SegmentR2 {
    return new SegmentR2(f.transformX(this._x0, this._y0), f.transformY(this._x0, this._y0),
                         f.transformX(this._x1, this._y1), f.transformY(this._x1, this._y1));
  }

  toAny(): SegmentR2Init {
    return {
      x0: this._x0,
      y0: this._y0,
      x1: this._x1,
      y1: this._y1,
    };
  }

  drawMove(context: CurveR2Context): void {
    context.moveTo(this._x0, this._y0);
  }

  drawRest(context: CurveR2Context): void {
    context.lineTo(this._x1, this._y1);
  }

  transformDrawMove(context: CurveR2Context, f: R2Function): void {
    context.moveTo(f.transformX(this._x0, this._y0), f.transformY(this._x0, this._y0));
  }

  transformDrawRest(context: CurveR2Context, f: R2Function): void {
    context.lineTo(f.transformX(this._x1, this._y1), f.transformY(this._x1, this._y1));
  }

  writeMove(output: Output): void {
    output.write(77/*'M'*/);
    Format.displayNumber(this._x0, output)
    output.write(44/*','*/)
    Format.displayNumber(this._y0, output);
  }

  writeRest(output: Output): void {
    output.write(76/*'L'*/);
    Format.displayNumber(this._x1, output)
    output.write(44/*','*/)
    Format.displayNumber(this._y1, output);
  }

  equivalentTo(that: CurveR2, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SegmentR2) {
      return Objects.equivalent(that._x0, this._x0, epsilon)
          && Objects.equivalent(that._y0, this._y0, epsilon)
          && Objects.equivalent(that._x1, this._x1, epsilon)
          && Objects.equivalent(that._y1, this._y1, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SegmentR2) {
      return this._x0 === that._x0 && this._y0 === that._y0
          && this._x1 === that._x1 && this._y1 === that._y1;
    }
    return false;
  }

  hashCode(): number {
    if (SegmentR2._hashSeed === void 0) {
      SegmentR2._hashSeed = Murmur3.seed(SegmentR2);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(SegmentR2._hashSeed,
        Murmur3.hash(this._x0)), Murmur3.hash(this._y0)),
        Murmur3.hash(this._x1)), Murmur3.hash(this._y1)));
  }

  debug(output: Output): void {
    output.write("SegmentR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this._x0).write(", ").debug(this._y0).write(", ")
        .debug(this._x1).write(", ").debug(this._y1).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _hashSeed?: number;

  static of(x0: number, y0: number, x1: number, y1: number): SegmentR2 {
    return new SegmentR2(x0, y0, x1, y1);
  }

  static fromInit(value: SegmentR2Init): SegmentR2 {
    return new SegmentR2(value.x0, value.y0, value.x1, value.y1);
  }

  static fromAny(value: AnySegmentR2): SegmentR2 {
    if (value instanceof SegmentR2) {
      return value;
    } else if (SegmentR2.isInit(value)) {
      return SegmentR2.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is SegmentR2Init {
    if (typeof value === "object" && value !== null) {
      const init = value as SegmentR2Init;
      return typeof init.x0 === "number"
          && typeof init.y0 === "number"
          && typeof init.x1 === "number"
          && typeof init.y1 === "number";
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnySegmentR2 {
    return value instanceof SegmentR2
        || SegmentR2.isInit(value);
  }
}
ShapeR2.Segment = SegmentR2;
CurveR2.Linear = SegmentR2;
