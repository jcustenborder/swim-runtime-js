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

import {Numbers} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {R2Function} from "./R2Function";
import type {AnyShapeR2} from "./ShapeR2";
import {PointR2} from "./PointR2";
import type {CurveR2Context} from "./CurveR2Context";
import {CurveR2} from "./CurveR2";

export class EllipticCurveR2 extends CurveR2 implements Debug {
  constructor(cx: number, cy: number, rx: number, ry: number,
              phi: number, a0: number, da: number) {
    super();
    Object.defineProperty(this, "cx", {
      value: cx,
      enumerable: true,
    });
    Object.defineProperty(this, "cy", {
      value: cy,
      enumerable: true,
    });
    Object.defineProperty(this, "rx", {
      value: rx,
      enumerable: true,
    });
    Object.defineProperty(this, "ry", {
      value: ry,
      enumerable: true,
    });
    Object.defineProperty(this, "phi", {
      value: phi,
      enumerable: true,
    });
    Object.defineProperty(this, "a0", {
      value: a0,
      enumerable: true,
    });
    Object.defineProperty(this, "da", {
      value: da,
      enumerable: true,
    });
  }

  declare readonly cx: number;

  declare readonly cy: number;

  declare readonly rx: number;

  declare readonly ry: number;

  declare readonly phi: number;

  declare readonly a0: number;

  declare readonly da: number;

  get xMin(): number {
    return this.cx - Math.max(this.rx, this.ry);
  }

  get yMin(): number {
    return this.cy - Math.max(this.rx, this.ry);
  }

  get xMax(): number {
    return this.cx + Math.max(this.rx, this.ry);
  }

  get yMax(): number {
    return this.cy + Math.max(this.rx, this.ry);
  }

  interpolateX(u: number): number {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const dx = this.rx * Math.cos(a);
    const dy = this.ry * Math.sin(a);
    const phi = this.phi;
    if (phi === 0) {
      return this.cx + dx;
    } else {
      return this.cx + dx * Math.cos(phi) - dy * Math.sin(phi);
    }
  }

  interpolateY(u: number): number {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const dx = this.rx * Math.cos(a);
    const dy = this.ry * Math.sin(a);
    const phi = this.phi;
    if (phi === 0) {
      return this.cy + dy;
    } else {
      return this.cy + dx * Math.sin(phi) + dy * Math.cos(phi);
    }
  }

  interpolate(u: number): PointR2 {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const dx = this.rx * Math.cos(a);
    const dy = this.ry * Math.sin(a);
    const phi = this.phi;
    if (phi === 0) {
      return new PointR2(this.cx + dx, this.cy + dy);
    } else {
      return new PointR2(this.cx + dx * Math.cos(phi) - dy * Math.sin(phi),
                         this.cy + dx * Math.sin(phi) + dy * Math.cos(phi));
    }
  }

  contains(that: AnyShapeR2): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShapeR2 | number, y?: number): boolean {
    return false; // TODO
  }

  intersects(that: AnyShapeR2): boolean {
    return false; // TODO
  }

  split(u: number): [EllipticCurveR2, EllipticCurveR2] {
    const a0 = this.a0;
    const da = this.da;
    const a = a0 + u * da;
    const c0 = new EllipticCurveR2(this.cx, this.cy, this.rx, this.ry,
                                   this.phi, a0, a - a0);
    const c1 = new EllipticCurveR2(this.cx, this.cy, this.rx, this.ry,
                                   this.phi, a, a0 + da - a);
    return [c0, c1];
  }

  transform(f: R2Function): EllipticCurveR2 {
    const a0 = this.a0;
    const a1 = a0 + this.da;
    const a0x = Math.cos(a0);
    const a0y = Math.sin(a0);
    const a1x = Math.cos(a1);
    const a1y = Math.sin(a1);
    const b0x = f.transformX(a0x, a0y);
    const b0y = f.transformY(a0x, a0y);
    const b1x = f.transformX(a1x, a1y);
    const b1y = f.transformY(a1x, a1y);
    const b0 = Math.atan2(b0y, b0x);
    const b1 = Math.atan2(b1y, b1x);
    return new EllipticCurveR2(f.transformX(this.cx, this.cy), f.transformY(this.cx, this.cy),
                               f.transformX(this.rx, this.ry), f.transformY(this.rx, this.ry),
                               this.phi, b0, b1 - b0);
  }

  drawMove(context: CurveR2Context): void {
    const {x0, y0} = this.toEndpoints();
    context.moveTo(x0, y0);
  }

  drawRest(context: CurveR2Context): void {
    context.ellipse(this.cx, this.cy, this.rx, this.ry, this.phi,
                    this.a0, this.a0 + this.da, this.da < 0);
  }

  transformDrawMove(context: CurveR2Context, f: R2Function): void {
    const {x0, y0} = this.toEndpoints();
    context.moveTo(f.transformX(x0, y0), f.transformY(x0, y0));
  }

  transformDrawRest(context: CurveR2Context, f: R2Function): void {
    const a0 = this.a0;
    const a1 = a0 + this.da;
    const a0x = Math.cos(a0);
    const a0y = Math.sin(a0);
    const a1x = Math.cos(a1);
    const a1y = Math.sin(a1);
    const b0x = f.transformX(a0x, a0y);
    const b0y = f.transformY(a0x, a0y);
    const b1x = f.transformX(a1x, a1y);
    const b1y = f.transformY(a1x, a1y);
    const b0 = Math.atan2(b0y, b0x);
    const b1 = Math.atan2(b1y, b1x);
    context.ellipse(f.transformX(this.cx, this.cy), f.transformY(this.cx, this.cy),
                    f.transformX(this.rx, this.ry), f.transformY(this.rx, this.ry),
                    this.phi, b0, b1, b1 - b0 < 0);
  }

  writeMove(output: Output): void {
    const {x0, y0} = this.toEndpoints();
    output.write(77/*'M'*/);
    Format.displayNumber(x0, output)
    output.write(44/*','*/)
    Format.displayNumber(y0, output);
  }

  writeRest(output: Output): void {
    const {rx, ry, phi, large, sweep, x1, y1} = this.toEndpoints();
    output.write(65/*'A'*/);
    Format.displayNumber(rx, output)
    output.write(44/*','*/)
    Format.displayNumber(ry, output);
    output.write(32/*' '*/)
    Format.displayNumber(phi, output)
    output.write(32/*' '*/)
    output.write(large ? 49/*'1'*/ : 48/*'0'*/);
    output.write(44/*','*/)
    output.write(sweep ? 49/*'1'*/ : 48/*'0'*/);
    output.write(32/*' '*/)
    Format.displayNumber(x1, output);
    output.write(44/*','*/)
    Format.displayNumber(y1, output);
  }

  toEndpoints(): {x0: number, y0: number, rx: number, ry: number, phi: number,
                  large: boolean, sweep: boolean, x1: number, y1: number} {
    const cx = this.cx;
    const cy = this.cy;
    const rx = this.rx;
    const ry = this.ry;
    const phi = this.phi;
    const a0 = this.a0;
    const da = this.da;
    const a1 = a0 + da;

    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const cosA0 = Math.cos(a0);
    const sinA0 = Math.sin(a0);
    const cosA1 = Math.cos(a1);
    const sinA1 = Math.sin(a1);
    const x0 = cosPhi * rx * cosA0 - sinPhi * ry * sinA0 + cx;
    const y0 = sinPhi * rx * cosA0 + cosPhi * ry * sinA0 + cy;
    const x1 = cosPhi * rx * cosA1 - sinPhi * ry * sinA1 + cx;
    const y1 = sinPhi * rx * cosA1 + cosPhi * ry * sinA1 + cy;
    const large = Math.abs(da) > Math.PI;
    const sweep = da > 0;
    return {x0, y0, rx, ry, phi, large, sweep, x1, y1};
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof EllipticCurveR2) {
      return Numbers.equivalent(this.cx, that.cx, epsilon)
          && Numbers.equivalent(this.cy, that.cy, epsilon)
          && Numbers.equivalent(this.rx, that.rx, epsilon)
          && Numbers.equivalent(this.ry, that.ry, epsilon)
          && Numbers.equivalent(this.phi, that.phi, epsilon)
          && Numbers.equivalent(this.a0, that.a0, epsilon)
          && Numbers.equivalent(this.da, that.da, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof EllipticCurveR2) {
      return this.cx === that.cx && this.cy === that.cy
          && this.rx === that.rx && this.ry === that.ry
          && this.phi === that.phi && this.a0 === that.a0
          && this.da === that.da;
    }
    return false;
  }

  debug(output: Output): void {
    output.write("CurveR2").write(46/*'.'*/).write("elliptic").write(40/*'('*/)
        .debug(this.cx).write(", ").debug(this.cy).write(", ")
        .debug(this.rx).write(", ").debug(this.ry).write(", ")
        .debug(this.phi).write(", ").debug(this.a0).write(", ")
        .debug(this.da).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  static fromEndpoints(x0: number, y0: number, rx: number, ry: number, phi: number,
                       large: boolean, sweep: boolean, x1: number, y1: number): EllipticCurveR2 {
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const x0p =  cosPhi * ((x0 - x1) / 2) + sinPhi * ((y0 - y1) / 2);
    const y0p = -sinPhi * ((x0 - x1) / 2) + cosPhi * ((y0 - y1) / 2);

    const rx2 = rx * rx;
    const ry2 = ry * ry;
    const x0p2 = x0p * x0p;
    const y0p2 = y0p * y0p;
    let sp = Math.sqrt((rx2 * ry2 - rx2 * y0p2 - ry2 * x0p2) / (rx2 * y0p2 + ry2 * x0p2));
    if (large === sweep) {
      sp = -sp;
    }
    const cxp =  sp * rx * y0p / ry;
    const cyp = -sp * ry * x0p / rx;
    const cx = cosPhi * cxp - sinPhi * cyp + (x0 + x1) / 2;
    const cy = sinPhi * cxp + cosPhi * cyp + (y0 + y1) / 2;

    function angle(ux: number, uy: number, vx: number, vy: number): number {
      const uv = ux * vx + uy * vy;
      const uu = ux * ux + uy * uy;
      const vv = vx * vx + vy * vy;
      let a = Math.acos(uv / (Math.sqrt(uu) * Math.sqrt(vv)));
      if (ux * vy - uy * vx < 0) {
        a = -a;
      }
      return a;
    }
    const a0 = angle(1, 0, (x0p - cxp) / rx, (y0p - cyp) / ry);
    let da = angle((x0p - cxp) / rx, (y0p - cyp) / ry, (-x0p - cxp) / rx, (-y0p - cyp) / ry) % (2 * Math.PI);
    if (!sweep && da > 0) {
      da -= 2 * Math.PI;
    } else if (sweep && da < 0) {
      da += 2 * Math.PI;
    }

    return new EllipticCurveR2(cx, cy, rx, ry, phi, a0, da);
  }
}
