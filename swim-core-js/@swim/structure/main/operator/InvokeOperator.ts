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

import {Murmur3, Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Interpolator} from "@swim/mapping";
import {Item} from "../Item";
import type {Value} from "../Value";
import {Operator} from "../Operator";
import {InvokeOperatorInterpolator} from "../"; // forward import
import {AnyInterpreter, Interpreter} from "../Interpreter";

export class InvokeOperator extends Operator {
  /** @hidden */
  readonly _func: Value;
  /** @hidden */
  readonly _args: Value;
  /** @hidden */
  _state?: unknown;

  constructor(func: Value, args: Value) {
    super();
    this._func = func;
    this._args = args.commit();
  }

  func(): Value {
    return this._func;
  }

  args(): Value {
    return this._args;
  }

  state(): unknown {
    return this._state;
  }

  setState(state: unknown): void {
    this._state = state;
  }

  isConstant(): boolean {
    return this._func.isConstant() && this._args.isConstant();
  }

  precedence(): number {
    return 11;
  }

  evaluate(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const func = this._func.evaluate(interpreter);
    if (func instanceof Item.Func) {
      return func.invoke(this._args, interpreter, this);
    }
    return Item.absent();
  }

  substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const func = this._func.evaluate(interpreter);
    if (func instanceof Item.Func) {
      const result = func.expand(this._args, interpreter, this);
      if (result !== void 0) {
        return result;
      }
    }
    const args = this._args.substitute(interpreter).toValue();
    return new InvokeOperator(this._func, args);
  }

  interpolateTo(that: InvokeOperator): Interpolator<InvokeOperator>;
  interpolateTo(that: Item): Interpolator<Item>;
  interpolateTo(that: unknown): Interpolator<Item> | null;
  interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof InvokeOperator) {
      return InvokeOperatorInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  typeOrder(): number {
    return 41;
  }

  compareTo(that: unknown): number {
    if (that instanceof InvokeOperator) {
      let order = this._func.compareTo(that._func);
      if (order === 0) {
        order = this._args.compareTo(that._args);
      }
      return order;
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder(), that.typeOrder());
    }
    return NaN;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof InvokeOperator) {
      return this._func.equals(that._func)
          && this._args.equivalentTo(that._args, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof InvokeOperator) {
      return this._func.equals(that._func) && this._args.equals(that._args);
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(InvokeOperator),
        this._func.hashCode()), this._args.hashCode()));
  }

  debug(output: Output): void {
    output.debug(this._func).write(46/*'.'*/).write("invoke").write(40/*'('*/)
        .debug(this._args).write(41/*')'*/);
  }

  clone(): InvokeOperator {
    return new InvokeOperator(this._func.clone(), this._args.clone());
  }
}
Item.InvokeOperator = InvokeOperator;
