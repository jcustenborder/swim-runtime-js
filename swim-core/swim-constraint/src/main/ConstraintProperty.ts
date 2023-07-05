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

import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import {Affinity} from "@swim/component";
import type {FastenerFlags} from "@swim/component";
import type {PropertyDescriptor} from "@swim/component";
import type {PropertyClass} from "@swim/component";
import {Property} from "@swim/component";
import type {AnyConstraintExpression} from "./ConstraintExpression";
import {ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintTerm} from "./ConstraintTerm";
import type {ConstraintVariable} from "./ConstraintVariable";
import type {AnyConstraintStrength} from "./"; // forward import
import {ConstraintStrength} from "./"; // forward import
import type {Constraint} from "./Constraint";
import {ConstraintScope} from "./"; // forward import
import type {ConstraintSolver} from "./ConstraintSolver";

/** @public */
export interface ConstraintPropertyDescriptor<T = unknown, U = T> extends PropertyDescriptor<T, U> {
  extends?: Proto<ConstraintProperty<any, any, any>> | boolean | null;
  strength?: AnyConstraintStrength;
  constrained?: boolean;
}

/** @public */
export interface ConstraintPropertyClass<P extends ConstraintProperty<any, any, any> = ConstraintProperty<any, any, any>> extends PropertyClass<P> {
  /** @internal */
  readonly ConstrainedFlag: FastenerFlags;
  /** @internal */
  readonly ConstrainingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface ConstraintProperty<O = unknown, T = unknown, U = T, I = T> extends Property<O, T, U, I>, ConstraintVariable {
  /** @internal @override */
  isExternal(): boolean;

  /** @internal @override */
  isDummy(): boolean;

  /** @internal @override */
  isInvalid(): boolean;

  /** @override */
  isConstant(): boolean;

  /** @internal @override */
  evaluateConstraintVariable(): void;

  /** @internal @override */
  updateConstraintSolution(value: number): void;

  /** @internal @protected */
  initStrength(): ConstraintStrength;

  /** @override */
  readonly strength: ConstraintStrength;

  setStrength(strength: AnyConstraintStrength): void;

  /** @override */
  get coefficient(): number;

  /** @override */
  get variable(): ConstraintVariable | null;

  /** @override */
  get terms(): ReadonlyMap<ConstraintVariable, number>;

  /** @override */
  get constant(): number;

  /** @override */
  plus(that: AnyConstraintExpression): ConstraintExpression;

  /** @override */
  negative(): ConstraintTerm;

  /** @override */
  minus(that: AnyConstraintExpression): ConstraintExpression;

  /** @override */
  times(scalar: number): ConstraintExpression;

  /** @override */
  divide(scalar: number): ConstraintExpression;

  get constrained(): boolean;

  constrain(constrained?: boolean): this;

  /** @internal */
  readonly conditionCount: number;

  /** @internal @override */
  addConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void;

  /** @internal @override */
  removeConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void;

  /** @internal */
  get constraining(): boolean;

  /** @internal */
  startConstraining(): void;

  /** @protected */
  willStartConstraining(): void;

  /** @protected */
  onStartConstraining(): void;

  /** @protected */
  didStartConstraining(): void;

  /** @internal */
  stopConstraining(): void;

  /** @protected */
  willStopConstraining(): void;

  /** @protected */
  onStopConstraining(): void;

  /** @protected */
  didStopConstraining(): void;

  /** @internal */
  updateConstraintVariable(): void;

  /** @protected @override */
  onSetValue(newValue: T, oldValue: T): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;

  /** @internal @protected */
  toNumber(value: T): number;
}

/** @public */
export const ConstraintProperty = (function (_super: typeof Property) {
  const ConstraintProperty = _super.extend("ConstraintProperty", {}) as ConstraintPropertyClass;

  ConstraintProperty.prototype.isExternal = function (this: ConstraintProperty): boolean {
    return true;
  };

  ConstraintProperty.prototype.isDummy = function (this: ConstraintProperty): boolean {
    return false;
  };

  ConstraintProperty.prototype.isInvalid = function (this: ConstraintProperty): boolean {
    return false;
  };

  ConstraintProperty.prototype.isConstant = function (this: ConstraintProperty): boolean {
    return false;
  };

  ConstraintProperty.prototype.evaluateConstraintVariable = function <T>(this: ConstraintProperty<unknown, T>): void {
    // hook
  };

  ConstraintProperty.prototype.updateConstraintSolution = function <T>(this: ConstraintProperty<unknown, T>, value: number): void {
    if (this.constrained && this.toNumber(this.value) !== value) {
      this.setValue(value as unknown as T, Affinity.Reflexive);
    }
  };

  ConstraintProperty.prototype.initStrength = function (this: ConstraintProperty): ConstraintStrength {
    let strength = (Object.getPrototypeOf(this) as ConstraintProperty).strength as ConstraintStrength | undefined;
    if (strength === void 0) {
      strength = ConstraintStrength.Strong;
    }
    return strength;
  };

  ConstraintProperty.prototype.setStrength = function (this: ConstraintProperty, strength: AnyConstraintStrength): void {
    (this as Mutable<typeof this>).strength = ConstraintStrength.fromAny(strength);
  };

  Object.defineProperty(ConstraintProperty.prototype, "coefficient", {
    value: 1,
    configurable: true,
  });

  Object.defineProperty(ConstraintProperty.prototype, "variable", {
    get(this: ConstraintProperty): ConstraintVariable {
      return this;
    },
    configurable: true,
  });

  Object.defineProperty(ConstraintProperty.prototype, "terms", {
    get(this: ConstraintProperty): ReadonlyMap<ConstraintVariable, number> {
      const terms = new Map<ConstraintVariable, number>();
      terms.set(this, 1);
      return terms;
    },
    configurable: true,
  });

  Object.defineProperty(ConstraintProperty.prototype, "constant", {
    value: 0,
    configurable: true,
  });

  ConstraintProperty.prototype.plus = function (this: ConstraintProperty, that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.product(2, this);
    }
    return ConstraintExpression.sum(this, that);
  };

  ConstraintProperty.prototype.negative = function (this: ConstraintProperty): ConstraintTerm {
    return ConstraintExpression.product(-1, this);
  };

  ConstraintProperty.prototype.minus = function (this: ConstraintProperty, that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (this === that) {
      return ConstraintExpression.zero();
    }
    return ConstraintExpression.sum(this, that.negative());
  };

  ConstraintProperty.prototype.times = function (this: ConstraintProperty, scalar: number): ConstraintExpression {
    return ConstraintExpression.product(scalar, this);
  };

  ConstraintProperty.prototype.divide = function (this: ConstraintProperty, scalar: number): ConstraintExpression {
    return ConstraintExpression.product(1 / scalar, this);
  };

  Object.defineProperty(ConstraintProperty.prototype, "constrained", {
    get(this: ConstraintProperty): boolean {
      return (this.flags & ConstraintProperty.ConstrainedFlag) !== 0;
    },
    configurable: true,
  });

  ConstraintProperty.prototype.constrain = function (this: ConstraintProperty<unknown, unknown, unknown>, constrained?: boolean): typeof this {
    if (constrained === void 0) {
      constrained = true;
    }
    const flags = this.flags;
    if (constrained && (flags & ConstraintProperty.ConstrainedFlag) === 0) {
      this.setFlags(flags | ConstraintProperty.ConstrainedFlag);
      if (this.conditionCount !== 0 && this.mounted) {
        this.stopConstraining();
      }
    } else if (!constrained && (flags & ConstraintProperty.ConstrainedFlag) !== 0) {
      this.setFlags(flags & ~ConstraintProperty.ConstrainedFlag);
      if (this.conditionCount !== 0 && this.mounted) {
        this.startConstraining();
        this.updateConstraintVariable();
      }
    }
    return this;
  };

  ConstraintProperty.prototype.addConstraintCondition = function (this: ConstraintProperty, constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount += 1;
    if (!this.constrained && this.conditionCount === 1 && this.mounted) {
      this.startConstraining();
      this.updateConstraintVariable();
    }
  };

  ConstraintProperty.prototype.removeConstraintCondition = function (this: ConstraintProperty, constraint: Constraint, solver: ConstraintSolver): void {
    (this as Mutable<typeof this>).conditionCount -= 1;
    if (!this.constrained && this.conditionCount === 0 && this.mounted) {
      this.stopConstraining();
    }
  };

  Object.defineProperty(ConstraintProperty.prototype, "constraining", {
    get(this: ConstraintProperty): boolean {
      return (this.flags & ConstraintProperty.ConstrainingFlag) !== 0;
    },
    configurable: true,
  });

  ConstraintProperty.prototype.startConstraining = function (this: ConstraintProperty): void {
    if ((this.flags & ConstraintProperty.ConstrainingFlag) !== 0) {
      return;
    }
    this.willStartConstraining();
    this.setFlags(this.flags | ConstraintProperty.ConstrainingFlag);
    this.onStartConstraining();
    this.didStartConstraining();
  };

  ConstraintProperty.prototype.willStartConstraining = function (this: ConstraintProperty): void {
    // hook
  };

  ConstraintProperty.prototype.onStartConstraining = function (this: ConstraintProperty): void {
    const constraintScope = this.owner;
    if (ConstraintScope[Symbol.hasInstance](constraintScope)) {
      constraintScope.addConstraintVariable(this);
    }
  };

  ConstraintProperty.prototype.didStartConstraining = function (this: ConstraintProperty): void {
    // hook
  };

  ConstraintProperty.prototype.stopConstraining = function (this: ConstraintProperty): void {
    if ((this.flags & ConstraintProperty.ConstrainingFlag) === 0) {
      return;
    }
    this.willStopConstraining();
    this.setFlags(this.flags & ~ConstraintProperty.ConstrainingFlag);
    this.onStopConstraining();
    this.didStopConstraining();
  };

  ConstraintProperty.prototype.willStopConstraining = function (this: ConstraintProperty): void {
    // hook
  };

  ConstraintProperty.prototype.onStopConstraining = function (this: ConstraintProperty): void {
    const constraintScope = this.owner;
    if (ConstraintScope[Symbol.hasInstance](constraintScope)) {
      constraintScope.removeConstraintVariable(this);
    }
  };

  ConstraintProperty.prototype.didStopConstraining = function (this: ConstraintProperty): void {
    // hook
  };

  ConstraintProperty.prototype.updateConstraintVariable = function (this: ConstraintProperty): void {
    const constraintScope = this.owner;
    const value = this.value;
    if (value !== void 0 && ConstraintScope[Symbol.hasInstance](constraintScope)) {
      constraintScope.setConstraintVariable(this, this.toNumber(value));
    }
  };

  ConstraintProperty.prototype.onSetValue = function <T>(this: ConstraintProperty<unknown, T>, newValue: T, oldValue: T): void {
    _super.prototype.onSetValue.call(this, newValue, oldValue);
    const constraintScope = this.owner;
    if (this.constraining && ConstraintScope[Symbol.hasInstance](constraintScope)) {
      constraintScope.setConstraintVariable(this, newValue !== void 0 && newValue !== null ? this.toNumber(newValue) : 0);
    }
  };

  ConstraintProperty.prototype.onMount = function <T>(this: ConstraintProperty<unknown, T>): void {
    _super.prototype.onMount.call(this);
    if (!this.constrained && this.conditionCount !== 0) {
      this.startConstraining();
    }
  };

  ConstraintProperty.prototype.onUnmount = function <T>(this: ConstraintProperty<unknown, T>): void {
    if (!this.constrained && this.conditionCount !== 0) {
      this.stopConstraining();
    }
    _super.prototype.onUnmount.call(this);
  };

  ConstraintProperty.prototype.toNumber = function <T>(this: ConstraintProperty<unknown, T>, value: T): number {
    return value !== void 0 && value !== null ? +value : 0;
  };

  ConstraintProperty.construct = function <P extends ConstraintProperty<any, any, any>>(property: P | null, owner: P extends ConstraintProperty<infer O, any, any> ? O : never): P {
    property = _super.construct.call(this, property, owner) as P;
    (property as Mutable<typeof property>).strength = property.initStrength();
    (property as Mutable<typeof property>).conditionCount = 0;
    const flagsInit = property.flagsInit;
    if (flagsInit !== void 0) {
      property.constrain((flagsInit & ConstraintProperty.ConstrainedFlag) !== 0);
    }
    return property;
  };

  ConstraintProperty.refine = function (propertyClass: ConstraintPropertyClass): void {
    _super.refine.call(this, propertyClass);
    const propertyPrototype = propertyClass.prototype;
    let flagsInit = propertyPrototype.flagsInit;

    if (Object.prototype.hasOwnProperty.call(propertyPrototype, "constrained")) {
      if (flagsInit === void 0) {
        flagsInit = 0;
      }
      if (propertyPrototype.constrained) {
        flagsInit |= ConstraintProperty.ConstrainedFlag;
      } else {
        flagsInit &= ~ConstraintProperty.ConstrainedFlag;
      }
      delete (propertyPrototype as ConstraintPropertyDescriptor).constrained;
    }

    if (flagsInit !== void 0) {
      Object.defineProperty(propertyPrototype, "flagsInit", {
        value: flagsInit,
        configurable: true,
      });
    }

    if (Object.prototype.hasOwnProperty.call(propertyPrototype, "strength")) {
      Object.defineProperty(propertyPrototype, "strength", {
        value: propertyPrototype.fromAny(propertyPrototype.strength),
        enumerable: true,
        configurable: true,
      });
    }
  };

  (ConstraintProperty as Mutable<typeof ConstraintProperty>).ConstrainedFlag = 1 << (_super.FlagShift + 0);
  (ConstraintProperty as Mutable<typeof ConstraintProperty>).ConstrainingFlag = 1 << (_super.FlagShift + 1);

  (ConstraintProperty as Mutable<typeof ConstraintProperty>).FlagShift = _super.FlagShift + 2;
  (ConstraintProperty as Mutable<typeof ConstraintProperty>).FlagMask = (1 << ConstraintProperty.FlagShift) - 1;

  return ConstraintProperty;
})(Property);
