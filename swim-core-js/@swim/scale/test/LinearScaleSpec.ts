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
import {Scale} from "@swim/scale";

export class LinearScaleSpec extends Spec {
  @Test
  parseLinearScales(exam: Exam): void {
    exam.equal(Scale.parse("linear"), Scale.from(0, 1, Interpolator.between(void 0, void 0)));
    exam.equal(Scale.parse("3...5"), Scale.from(3, 5, Interpolator.between(void 0, void 0)));
  }

  @Test
  linearlyScaleNumbers(exam: Exam): void {
    const scale = Scale.from(3, 5, 7, 11);
    exam.equal(scale.scale(4), 9);
  }
}
