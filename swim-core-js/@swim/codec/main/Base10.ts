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

import {Input} from "./Input";
import {Output} from "./Output";
import {Parser} from "./Parser";
import {Writer} from "./Writer";
import {Format} from "./Format";
import {Unicode} from "./Unicode";
import {Base10NumberParser} from "./Base10NumberParser";
import {Base10IntegerWriter} from "./Base10IntegerWriter";

/**
 * Base-10 (decimal) encoding [[Parser]]/[[Writer]] factory.
 */
export const Base10 = {} as {
  /**
   * Returns `true` if the Unicode code point `c` is a valid base-10 digit.
   */
  isDigit(c: number): boolean;

  /**
   * Returns the decimal quantity between `0` (inclusive) and `10` (exclusive)
   * represented by the base-10 digit `c`.
   *
   * @throws `Error` if `c` is not a valid base-10 digit.
   */
  decodeDigit(c: number): number;

  /**
   * Returns the Unicode code point of the base-10 digit that encodes the given
   * decimal quantity between `0` (inclusive) and `10` (exclusive).
   */
  encodeDigit(b: number): number;

  /**
   * Returns the number of whole decimal digits in the given absolute `value`.
   */
  countDigits(value: number): number;

  integerParser(): Parser<number>;

  parseInteger(input: Input): Parser<number>;

  decimalParser(): Parser<number>;

  parseDecimal(input: Input): Parser<number>;

  numberParser(): Parser<number>;

  parseNumber(input: Input): Parser<number>;

  /**
   * Returns a `Writer` that, when fed an input `number` value, returns a
   * continuation that writes the base-10 (decimal) encoding of the input value.
   */
  integerWriter(): Writer<number, unknown>;

  /**
   * Returns a `Writer` continuation that writes the base-10 (decimal) encoding
   * of the `input` value.
   */
  integerWriter(input: number): Writer<unknown, number>;

  /**
   * Writes the base-10 (decimal) encoding of the `input` value to the `output`,
   * returning a `Writer` continuation that knows how to write any remaining
   * output that couldn't be immediately generated.
   */
  writeInteger(input: number, output: Output): Writer<unknown, unknown>;

  // Forward type declarations
  /** @hidden */
  NumberParser: typeof Base10NumberParser; // defined by Base10NumberParser
  /** @hidden */
  IntegerWriter: typeof Base10IntegerWriter; // defined by Base10IntegerWriter
};

Base10.isDigit = function (c: number): boolean {
  return c >= 48/*'0'*/ && c <= 57/*'9'*/;
};

Base10.decodeDigit = function (c: number): number {
  if (c >= 48/*'0'*/ && c <= 57/*'9'*/) {
    return c - 48/*'0'*/;
  } else {
    const message = Unicode.stringOutput();
    message.write("Invalid base-10 digit: ");
    Format.debugChar(c, message);
    throw new Error(message.bind());
  }
};

Base10.encodeDigit = function (b: number): number {
  if (b >= 0 && b <= 9) {
    return 48/*'0'*/ + b;
  } else {
    throw new Error("" + b);
  }
};

Base10.countDigits = function (value: number): number {
  let size = 0;
  do {
    size += 1;
    value = (value / 10) | 0;
  } while (value !== 0);
  return size;
};

Base10.integerParser = function (): Parser<number> {
  return new Base10.NumberParser(void 0, void 0, 0);
};

Base10.parseInteger = function (input: Input): Parser<number> {
  return Base10.NumberParser.parse(input, void 0, void 0, 0);
};

Base10.decimalParser = function (): Parser<number> {
  return new Base10.NumberParser(void 0, void 0, 1);
};

Base10.parseDecimal = function (input: Input): Parser<number> {
  return Base10.NumberParser.parse(input, void 0, void 0, 1);
};

Base10.numberParser = function (): Parser<number> {
  return new Base10.NumberParser();
};

Base10.parseNumber = function (input: Input): Parser<number> {
  return Base10.NumberParser.parse(input);
};

Base10.integerWriter = function (input?: number): Writer<unknown, unknown> {
  if (input === void 0) {
    return new Base10.IntegerWriter(void 0, 0);
  } else {
    return new Base10.IntegerWriter(void 0, input);
  }
} as typeof Base10.integerWriter;

Base10.writeInteger = function (input: number, output: Output): Writer<unknown, unknown> {
  return Base10.IntegerWriter.write(output, void 0, input);
};
