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

import {Input, Parser} from "@swim/codec";
import type {DateTimeInit} from "../DateTime";
import {DateTimeFormat} from "./DateTimeFormat";

/** @internal */
export class Hour24Parser extends Parser<DateTimeInit> {
  private readonly date: DateTimeInit | undefined;
  private readonly hour: number | undefined;
  private readonly step: number | undefined;

  constructor(date?: DateTimeInit, hour?: number, step?: number) {
    super();
    this.date = date;
    this.hour = hour;
    this.step = step;
  }

  override feed(input: Input): Parser<DateTimeInit> {
    return Hour24Parser.parse(input, this.date, this.hour, this.step);
  }

  static parse(input: Input, date?: DateTimeInit, hour?: number, step?: number): Parser<DateTimeInit> {
    return DateTimeFormat.parseDateNumber(input, Hour24Parser, "hour (24)", 2, 2, date, hour, step);
  }

  static term(hour: number, date: DateTimeInit): Parser<DateTimeInit> {
    date.hour = hour;
    return Parser.done(date);
  }

  static cont(date: DateTimeInit, hour: number, step: number): Parser<DateTimeInit> {
    return new Hour24Parser(date, hour, step);
  }
}
