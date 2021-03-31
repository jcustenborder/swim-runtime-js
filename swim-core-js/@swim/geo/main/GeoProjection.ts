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

import {AnyPointR2, PointR2} from "@swim/math";
import {GeoBox} from "./GeoBox";
import {AnyGeoPoint, GeoPoint} from "./GeoPoint";

export interface GeoProjection {
  readonly bounds: GeoBox;

  project(lnglat: AnyGeoPoint): PointR2;
  project(lng: number, lat: number): PointR2;

  unproject(point: AnyPointR2): GeoPoint;
  unproject(x: number, y: number): GeoPoint;
}

/** @hidden */
export const GeoProjection = {
  is(object: unknown): object is GeoProjection {
    if (typeof object === "object" && object !== null) {
      const projection = object as GeoProjection;
      return typeof projection.project === "function"
          && typeof projection.unproject === "function";
    }
    return false;
  },
};
