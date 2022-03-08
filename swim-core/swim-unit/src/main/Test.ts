// Copyright 2015-2022 Swim.inc
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

import {SpecTest} from "./SpecTest";
import type {SpecClass} from "./Spec";
import type {Exam} from "./Exam";

/**
 * Test evaluation function, invoked with an [[Exam]] instance to proove a unit
 * test case. Returns `void` if the test executes synchronously. Returns a
 * `Promise` if the test case executes asynchronously.
 *
 * ### Examples
 *
 * ```
 * class MySpec extends Spec {
 *   @Test
 *   myTest(exam: Exam): void {
 *     exam.ok(true);
 *   }
 *
 *   @Test
 *   myAsyncTest(exam: Exam): Promise<unknown> {
 *     return new Promise((resolve, reject) => {
 *       setTimeout(() => {
 *         exam.ok(true);
 *         resolve();
 *       }, 250);
 *     })
 *   }
 * }
 * ```
 *
 * @throws [TestException] if the an `exam` assertion fails.
 * @public
 */
export type TestFunc = (exam: Exam) => Promise<unknown> | unknown | void;

/**
 * [[TestFunc test function]] registration options. `TestOptions` are passed
 * to the [[Test]] method decorator factory to modify the registration of
 * test functions with the enclosing [[Spec]].
 * @public
 */
export interface TestOptions {
  /**
   * `true` if the test function should not be evaluated.
   */
  pending?: boolean;
}

/**
 * Returns a method decorator that registers [[TestFunc test functions]] with
 * the enclosing [[Spec]], using the given `options`.
 *
 * ### Examples
 *
 * ```
 * class MySpec extends Spec {
 *   @Test({pending: true})
 *   myTest(exam: Exam): void {
 *     throw new Error("unreachable");
 *   }
 * }
 * ```
 *
 * @public
 */
export function Test(options: TestOptions): MethodDecorator;

/**
 * Method decorator that registers a [[TestFunc test function]] with the
 * enclosing [[Spec]].
 *
 * ### Examples
 *
 * ```
 * class MySpec extends Spec {
 *   @Test
 *   myTest(exam: Exam): void {
 *     exam.ok(true);
 *   }
 * }
 * ```
 *
 * @public
 */
export function Test(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;

export function Test(target: TestOptions | Object, propertyKey?: string | symbol,
                     descriptor?: PropertyDescriptor): MethodDecorator | void {
  if (arguments.length === 1) {
    return SpecTest.decorate.bind(SpecTest, target as TestOptions);
  } else {
    SpecTest.decorate({}, target as SpecClass, propertyKey!, descriptor!);
  }
}
