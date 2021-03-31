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

import {AnyValue, Value} from "@swim/structure";
import {Envelope} from "./Envelope";
import {HostAddressed} from "./HostAddressed";

export class DeauthedResponse extends HostAddressed {
  constructor(body: Value) {
    super(body);
  }

  protected copy(body: Value): this {
    return new DeauthedResponse(body) as this;
  }

  static tag(): string {
    return "deauthed";
  }

  static of(body: AnyValue = Value.absent()): DeauthedResponse {
    body = Value.fromAny(body);
    return new DeauthedResponse(body);
  }

  static fromValue(value: Value): DeauthedResponse | undefined {
    return HostAddressed.fromValue(value, DeauthedResponse) as DeauthedResponse | undefined;
  }
}
Envelope.DeauthedResponse = DeauthedResponse;
