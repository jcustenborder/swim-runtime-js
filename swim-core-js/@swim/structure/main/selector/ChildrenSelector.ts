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
import {Selector} from "../Selector";
import {AnyInterpreter, Interpreter} from "../Interpreter";

export class ChildrenSelector extends Selector {
  /** @hidden */
  readonly _then: Selector;

  constructor(then: Selector) {
    super();
    this._then = then;
  }

  then(): Selector {
    return this._then;
  }

  forSelected<T, S = unknown>(interpreter: Interpreter,
                              callback: (this: S, interpreter: Interpreter) => T | undefined,
                              thisArg?: S): T | undefined {
    let selected: T | undefined;
    interpreter.willSelect(this);
    if (interpreter.scopeDepth() !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      // Only records can have children.
      if (scope instanceof Item.Record) {
        const children = scope.iterator();
        // For each child, while none have been selected:
        while (selected === void 0 && children.hasNext()) {
          const child = children.next().value!;
          // Push the child onto the scope stack.
          interpreter.pushScope(child);
          // Subselect the child.
          selected = this._then.forSelected(interpreter, callback, thisArg);
          // Pop the child off of the scope stack.
          interpreter.popScope();
        }
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
    }
    interpreter.didSelect(this, selected);
    return selected;
  }

  mapSelected<S = unknown>(interpreter: Interpreter,
                           transform: (this: S, interpreter: Interpreter) => Item,
                           thisArg?: S): Item {
    let result: Item;
    interpreter.willTransform(this);
    if (interpreter.scopeDepth() !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      // Only records can have children.
      if (scope instanceof Item.Record) {
        const children = scope.iterator();
        // For each child:
        while (children.hasNext()) {
          const oldChild = children.next().value!;
          // Push the child onto the scope stack.
          interpreter.pushScope(oldChild);
          // Transform the child.
          const newChild = this._then.mapSelected(interpreter, transform);
          // Pop the child off the scope stack.
          interpreter.popScope();
          if (newChild.isDefined()) {
            // Update the child, if its identity changed.
            if (newChild !== oldChild) {
              children.set(newChild);
            }
          } else {
            // Remove the child, if it transformed to Absent.
            children.delete();
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
    let then = this._then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this._then;
    }
    return new ChildrenSelector(then as Selector);
  }

  andThen(then: Selector): Selector {
    return new ChildrenSelector(this._then.andThen(then));
  }

  typeOrder(): number {
    return 17;
  }

  compareTo(that: Item): number {
    if (that instanceof ChildrenSelector) {
      return this._then.compareTo(that._then);
    }
    return Numbers.compare(this.typeOrder(), that.typeOrder());
  }

  equivalentTo(that: Item, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ChildrenSelector) {
      return this._then.equivalentTo(that._then, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ChildrenSelector) {
      return this._then.equals(that._then);
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(ChildrenSelector), this._then.hashCode()));
  }

  debugThen(output: Output): void {
    output = output.write(46/*'.'*/).write("children").write(40/*'('*/).write(41/*')'*/);
    this._then.debugThen(output);
  }

  clone(): Selector {
    return new ChildrenSelector(this._then.clone());
  }
}
Item.ChildrenSelector = ChildrenSelector;
