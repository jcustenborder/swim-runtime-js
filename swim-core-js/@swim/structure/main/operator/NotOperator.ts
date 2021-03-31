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

import {Murmur3, Objects} from "@swim/util";
import {Output} from "@swim/codec";
import {Item} from "../Item";
import {UnaryOperator} from "./UnaryOperator";
import {AnyInterpreter, Interpreter} from "../Interpreter";

export class NotOperator extends UnaryOperator {
  constructor(operand: Item) {
    super(operand);
  }

  operator(): string {
    return "!";
  }

  precedence(): number {
    return 10;
  }

  evaluate(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const argument = this._operand.evaluate(interpreter);
    return argument.not();
  }

  substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const argument = this._operand.substitute(interpreter);
    return argument.not();
  }

  typeOrder(): number {
    return 37;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof NotOperator) {
      return this._operand.compareTo(that._operand);
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equivalentTo(that: Item, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof NotOperator) {
      return this._operand.equivalentTo(that._operand, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof NotOperator) {
      return this._operand.equals(that._operand);
    }
    return false;
  }

  hashCode(): number {
    if (NotOperator._hashSeed === void 0) {
      NotOperator._hashSeed = Murmur3.seed(NotOperator);
    }
    return Murmur3.mash(Murmur3.mix(NotOperator._hashSeed, this._operand.hashCode()));
  }

  debug(output: Output): void {
    output.debug(this._operand).write(46/*'.'*/).write("not").write(40/*'('*/).write(41/*')'*/);
  }

  clone(): NotOperator {
    return new NotOperator(this._operand.clone());
  }

  private static _hashSeed?: number;
}
Item.NotOperator = NotOperator;
