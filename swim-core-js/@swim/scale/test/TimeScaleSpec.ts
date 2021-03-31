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

import {Spec, Test, Exam} from "@swim/unit";
import {Interpolator} from "@swim/interpolate";
import {DateTime, TimeZone} from "@swim/time";
import {Scale} from "@swim/scale";

export class TimeScaleSpec extends Spec {
  @Test
  parseTimeScales(exam: Exam): void {
    const d1 = DateTime.current(TimeZone.utc());
    const d0 = d1.day(d1.day() - 1);
    exam.equal(Scale.parse(d0.toString() + "..." + d1.toString()),
               Scale.from(d0, d1, Interpolator.between(void 0, void 0)));
  }

  @Test
  temporallyScaleNumbers(exam: Exam): void {
    const d0 = DateTime.fromAny({year: 2000, month: 0, day: 1});
    const d1 = DateTime.fromAny({year: 2000, month: 0, day: 2});
    const scale = Scale.from(d0, d1, 0, 86400);
    const noon = DateTime.fromAny({year: 2000, month: 0, day: 1, hour: 12});
    exam.equal(scale.scale(noon), 43200);
  }
}
