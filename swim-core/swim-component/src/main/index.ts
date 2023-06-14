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

// Fastener

export {Affinity} from "./Affinity";

export {FastenerClassCache} from "./FastenerContext";
export {FastenerNameCache} from "./FastenerContext";
export type {FastenerContextClass} from "./FastenerContext";
export {FastenerContext} from "./FastenerContext";

export type {FastenerFlags} from "./Fastener";
export type {FastenerOwner} from "./Fastener";
export type {FastenerDecorator} from "./Fastener";
export type {FastenerDescriptor} from "./Fastener";
export type {FastenerTemplate} from "./Fastener";
export type {FastenerClass} from "./Fastener";
export {Fastener} from "./Fastener";

// Property

export type {PropertyValue} from "./Property";
export type {PropertyValueInit} from "./Property";
export type {AnyPropertyValue} from "./Property";
export type {PropertyDecorator} from "./Property";
export type {PropertyDescriptor} from "./Property";
export type {PropertyTemplate} from "./Property";
export type {PropertyClass} from "./Property";
export {Property} from "./Property";

// Animator

export type {AnimatorValue} from "./Animator";
export type {AnimatorValueInit} from "./Animator";
export type {AnyAnimatorValue} from "./Animator";
export type {AnimatorDecorator} from "./Animator";
export type {AnimatorDescriptor} from "./Animator";
export type {AnimatorTemplate} from "./Animator";
export type {AnimatorClass} from "./Animator";
export {Animator} from "./Animator";

// Timer

export type {TimerDecorator} from "./Timer";
export type {TimerDescriptor} from "./Timer";
export type {TimerTemplate} from "./Timer";
export type {TimerClass} from "./Timer";
export {Timer} from "./Timer";

// Event

export type {EventHandlerTarget} from "./EventHandler";
export type {EventHandlerDecorator} from "./EventHandler";
export type {EventHandlerDescriptor} from "./EventHandler";
export type {EventHandlerTemplate} from "./EventHandler";
export type {EventHandlerClass} from "./EventHandler";
export {EventHandler} from "./EventHandler";

export type {EventTimerTarget} from "./EventTimer";
export type {EventTimerDecorator} from "./EventTimer";
export type {EventTimerDescriptor} from "./EventTimer";
export type {EventTimerTemplate} from "./EventTimer";
export type {EventTimerClass} from "./EventTimer";
export {EventTimer} from "./EventTimer";

// Provider

export type {ProviderService} from "./Provider";
export type {ProviderDecorator} from "./Provider";
export type {ProviderDescriptor} from "./Provider";
export type {ProviderTemplate} from "./Provider";
export type {ProviderClass} from "./Provider";
export {Provider} from "./Provider";

// Component

export type {ComponentFlags} from "./Component";
export type {AnyComponent} from "./Component";
export type {ComponentInit} from "./Component";
export type {ComponentFactory} from "./Component";
export type {ComponentClass} from "./Component";
export type {ComponentConstructor} from "./Component";
export type {ComponentObserver} from "./Component";
export {Component} from "./Component";

export type {ComponentRelationComponent} from "./ComponentRelation";
export type {ComponentRelationDecorator} from "./ComponentRelation";
export type {ComponentRelationDescriptor} from "./ComponentRelation";
export type {ComponentRelationTemplate} from "./ComponentRelation";
export type {ComponentRelationClass} from "./ComponentRelation";
export {ComponentRelation} from "./ComponentRelation";

export type {ComponentRefComponent} from "./ComponentRef";
export type {ComponentRefDecorator} from "./ComponentRef";
export type {ComponentRefDescriptor} from "./ComponentRef";
export type {ComponentRefTemplate} from "./ComponentRef";
export type {ComponentRefClass} from "./ComponentRef";
export {ComponentRef} from "./ComponentRef";

export type {ComponentSetComponent} from "./ComponentSet";
export type {ComponentSetDecorator} from "./ComponentSet";
export type {ComponentSetDescriptor} from "./ComponentSet";
export type {ComponentSetTemplate} from "./ComponentSet";
export type {ComponentSetClass} from "./ComponentSet";
export {ComponentSet} from "./ComponentSet";

// Service

export type {ServiceFactory} from "./Service";
export type {ServiceClass} from "./Service";
export type {ServiceConstructor} from "./Service";
export type {ServiceObserver} from "./Service";
export {Service} from "./Service";
