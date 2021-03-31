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

import {AnyDateTime, DateTime} from "../DateTime";
import {TimeInterval} from "./TimeInterval";

/** @hidden */
export class FilterTimeInterval extends TimeInterval {
  private readonly unit: TimeInterval;
  private readonly predicate: (d: DateTime) => boolean;

  constructor(unit: TimeInterval, predicate: (d: DateTime) => boolean) {
    super();
    this.unit = unit;
    this.predicate = predicate;
  }

  offset(t: AnyDateTime, k?: number): DateTime {
    let d = DateTime.fromAny(t);
    k = Math.max(1, typeof k === "number" ? Math.floor(k) : 1);
    while (k < 0) {
      do {
        d = this.unit.offset(d, -1);
      } while (d.isDefined() && !this.predicate(d));
      k += 1;
    }
    while (k > 0) {
      do {
        d = this.unit.offset(d, 1);
      } while (d.isDefined() && !this.predicate(d));
      k -= 1;
    }
    return d;
  }

  floor(t: AnyDateTime): DateTime {
    let d = DateTime.fromAny(t);
    while (d = this.unit.floor(d), d.isDefined() && !this.predicate(d)) {
      d = new DateTime(d.time - 1, d.zone);
    }
    return d;
  }
}
