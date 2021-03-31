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
import {Output} from "@swim/codec";
import {Item} from "../Item";
import {Field} from "../Field";
import {Attr} from "../Attr";
import {Text} from "../Text";
import {Selector} from "../Selector";
import {AnyInterpreter, Interpreter} from "../Interpreter";

export class GetAttrSelector extends Selector {
  /** @hidden */
  readonly _key: Text;
  /** @hidden */
  readonly _then: Selector;

  constructor(key: Text, then: Selector) {
    super();
    this._key = key;
    this._then = then;
  }

  accessor(): Text {
    return this._key;
  }

  then(): Selector {
    return this._then;
  }

  forSelected<T, S = unknown>(interpreter: Interpreter,
                              callback: (this: S, interpreter: Interpreter) => T | undefined,
                              thisArg?: S): T | undefined {
    interpreter.willSelect(this);
    const key = this._key;
    const selected = GetAttrSelector.forSelected(key, this._then, interpreter, callback);
    interpreter.didSelect(this, selected);
    return selected;
  }

  private static forSelected<T, S>(key: Text, then: Selector, interpreter: Interpreter,
                                   callback: (this: S, interpreter: Interpreter) => T | undefined,
                                   thisArg?: S): T | undefined {
    let selected: T | undefined;
    if (interpreter.scopeDepth() !== 0) {
      // Pop the next selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      let field: Field | undefined;
      // Only records can have members.
      if (scope instanceof Item.Record) {
        field = scope.getField(key);
        if (field instanceof Attr) {
          // Push the field value onto the scope stack.
          interpreter.pushScope(field.toValue());
          // Subselect the field value.
          selected = then.forSelected(interpreter, callback, thisArg);
          // Pop the field value off of the scope stack.
          interpreter.popScope();
        }
      }
      if (field === void 0 && selected === void 0) {
        GetAttrSelector.forSelected(key, then, interpreter, callback, thisArg);
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
    }
    return selected;
  }

  mapSelected<S = unknown>(interpreter: Interpreter,
                           transform: (this: S, interpreter: Interpreter) => Item,
                           thisArg?: S): Item {
    let result: Item;
    interpreter.willTransform(this);
    const key = this._key;
    if (interpreter.scopeDepth() !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      // Only records can have members.
      if (scope instanceof Item.Record) {
        const oldField = scope.getField(key);
        if (oldField instanceof Item.Attr) {
          // Push the field value onto the scope stack.
          interpreter.pushScope(oldField.toValue());
          // Transform the field value.
          const newItem = this._then.mapSelected(interpreter, transform, thisArg);
          // Pop the field value off the scope stack.
          interpreter.popScope();
          if (newItem instanceof Item.Field) {
            // Replace the original field with the transformed field.
            if (key.equals(newItem.key)) {
              scope.setAttr(key, newItem.toValue());
            } else {
              scope.delete(key);
              scope.push(newItem);
            }
          } else if (newItem.isDefined()) {
            // Update the field with the transformed value.
            scope.setAttr(key, newItem.toValue());
          } else {
            // Remove the field.
            scope.delete(key);
          }
        }
      }
      // Push the transformed selection back onto the stack.
      interpreter.pushScope(scope);
      result = scope;
    } else {
      result = Item.absent();
    }
    interpreter.didTransform(this, result);
    return result;
  }

  substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const key = this._key;
    const value = GetAttrSelector.substitute(key, this._then, interpreter);
    if (value !== void 0) {
      return value;
    }
    let then = this._then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this._then;
    }
    return new GetAttrSelector(this._key, then as Selector);
  }

  private static substitute(key: Text, then: Selector, interpreter: Interpreter): Item | undefined {
    let selected: Item | undefined;
    if (interpreter.scopeDepth() !== 0) {
      // Pop the next selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      let field: Field | undefined;
      // Only records can have members.
      if (scope instanceof Item.Record) {
        field = scope.getField(key);
        if (field instanceof Item.Attr) {
          // Substitute the field value.
          selected = field.toValue().substitute(interpreter);
        }
      }
      if (field === void 0 && selected === void 0) {
        GetAttrSelector.substitute(key, then, interpreter);
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
    }
    return selected;
  }

  andThen(then: Selector): Selector {
    return new GetAttrSelector(this._key, this._then.andThen(then));
  }

  typeOrder(): number {
    return 13;
  }

  compareTo(that: Item): number {
    if (that instanceof GetAttrSelector) {
      let order = this._key.compareTo(that._key);
      if (order === 0) {
        order = this._then.compareTo(that._then);
      }
      return order;
    }
    return Numbers.compare(this.typeOrder(), that.typeOrder());
  }

  equivalentTo(that: Item, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GetAttrSelector) {
      return this._key.equals(that._key) && this._then.equivalentTo(that._then, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GetAttrSelector) {
      return this._key.equals(that._key) && this._then.equals(that._then);
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(GetAttrSelector),
        this._key.hashCode()), this._then.hashCode()));
  }

  debugThen(output: Output): void {
    output = output.write(46/*'.'*/).write("getAttr").write(40/*'('*/).debug(this._key).write(41/*')'*/);
    this._then.debugThen(output);
  }

  clone(): Selector {
    return new GetAttrSelector(this._key.clone(), this._then.clone());
  }
}
Item.GetAttrSelector = GetAttrSelector;
