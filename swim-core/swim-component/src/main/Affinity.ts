// Copyright 2015-2023 Swim.inc
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

/** @public */
export type Affinity = 0 | 1 | 2 | 3 | 4;

/** @public */
export const Affinity: {
  readonly Transient: 0;
  readonly Inherited: 1;
  readonly Intrinsic: 2;
  readonly Extrinsic: 3;

  readonly Reflexive: 4;

  /** @internal */
  readonly Shift: number;
  /** @internal */
  readonly Mask: number;
} = Object.freeze({
  Transient: 0,
  Inherited: 1,
  Intrinsic: 2,
  Extrinsic: 3,

  Reflexive: 4,

  Shift: 2,
  Mask: (1 << 2) - 1,
});
