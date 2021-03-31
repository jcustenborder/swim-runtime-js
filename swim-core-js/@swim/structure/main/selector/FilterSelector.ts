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
import {AnyItem, Item} from "../Item";
import {Selector} from "./Selector";
import {AnyInterpreter, Interpreter} from "../"; // forward import

export class FilterSelector extends Selector {
  /** @hidden */
  readonly _predicate: Selector;
  /** @hidden */
  readonly _then: Selector;

  constructor(predicate: Selector, then: Selector) {
    super();
    this._predicate = predicate;
    this._then = then;
  }

  predicate(): Selector {
    return this._predicate;
  }

  then(): Selector {
    return this._then;
  }

  forSelected<T>(interpreter: Interpreter,
                 callback: (interpreter: Interpreter) => T | undefined): T | undefined;
  forSelected<T, S>(interpreter: Interpreter,
                    callback: (this: S, interpreter: Interpreter) => T | undefined,
                    thisArg: S): T | undefined;
  forSelected<T, S>(interpreter: Interpreter,
                    callback: (this: S | undefined, interpreter: Interpreter) => T | undefined,
                    thisArg?: S): T | undefined {
    let selected: T | undefined;
    interpreter.willSelect(this);
    if (interpreter.scopeDepth() !== 0) {
      // If the filter matches the selection scope:
      if (this.filterSelected(interpreter)) {
        // Then subselect the selection scope.
        selected = this._then.forSelected(interpreter, callback, thisArg);
      }
    }
    interpreter.didSelect(this, selected);
    return selected;
  }

  mapSelected(interpreter: Interpreter,
              transform: (interpreter: Interpreter) => Item): Item;
  mapSelected<S>(interpreter: Interpreter,
                 transform: (this: S, interpreter: Interpreter) => Item,
                 thisArg: S): Item;
  mapSelected<S>(interpreter: Interpreter,
                 transform: (this: S | undefined, interpreter: Interpreter) => Item,
                 thisArg?: S): Item {
    let result: Item;
    interpreter.willTransform(this);
    if (interpreter.scopeDepth() !== 0) {
      // If the filter matches the selection scope:
      if (this.filterSelected(interpreter)) {
        // Then transform the selection scope.
        result = this._then.mapSelected(interpreter, transform, thisArg);
      } else {
        result = interpreter.peekScope().toValue();
      }
    } else {
      result = Item.absent();
    }
    interpreter.didTransform(this, result);
    return result;
  }

  substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    let predicate = this._predicate.substitute(interpreter);
    if (!(predicate instanceof Selector)) {
      predicate = this._predicate;
    }
    let then = this._then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this._then;
    }
    return new FilterSelector(predicate as Selector, then as Selector);
  }

  protected filterSelected(interpreter: Interpreter): boolean {
    return this._predicate.forSelected(interpreter, this.selected, this) !== void 0;
  }

  protected selected(interpreter: Interpreter): null {
    return null;
  }

  andThen(then: Selector): Selector {
    return new FilterSelector(this._predicate, this._then.andThen(then));
  }

  filter(predicate?: AnyItem): Selector {
    if (arguments.length === 0) {
      return this;
    } else {
      predicate = Item.fromAny(predicate);
      return this.andThen(predicate.filter());
    }
  }

  get typeOrder(): number {
    return 19;
  }

  compareTo(that: unknown): number {
    if (that instanceof FilterSelector) {
      let order = this._predicate.compareTo(that._predicate);
      if (order === 0) {
        order = this._then.compareTo(that._then);
      }
      return order;
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FilterSelector) {
      return this._predicate.equivalentTo(that._predicate, epsilon)
          && this._then.equivalentTo(that._then, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FilterSelector) {
      return this._predicate.equals(that._predicate) && this._then.equals(that._then);
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(FilterSelector),
        this._predicate.hashCode()), this._then.hashCode()));
  }

  debugThen(output: Output): void {
    output = output.write(46/*'.'*/).write("filter").write(40/*'('*/).debug(this._predicate).write(41/*')'*/);
    this._then.debugThen(output);
  }

  clone(): Selector {
    return new FilterSelector(this._predicate.clone(), this._then.clone());
  }
}
