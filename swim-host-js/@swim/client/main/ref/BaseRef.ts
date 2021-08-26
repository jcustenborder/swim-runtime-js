// Copyright 2015-2021 Swim Inc.
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

import {Arrays} from "@swim/util";
import {AnyValue, Value} from "@swim/structure";
import type {AnyUri, Uri} from "@swim/uri";
import type {Host} from "../host/Host";
import type {DownlinkOwner} from "../downlink/DownlinkOwner";
import type {Downlink} from "../downlink/Downlink";
import type {EventDownlinkInit, EventDownlink} from "../downlink/EventDownlink";
import type {ListDownlinkInit, ListDownlink} from "../downlink/ListDownlink";
import type {MapDownlinkInit, MapDownlink} from "../downlink/MapDownlink";
import type {ValueDownlinkInit, ValueDownlink} from "../downlink/ValueDownlink";
import type {RefContext} from "./RefContext";
import type {HostRef} from "./HostRef";
import type {NodeRef} from "./NodeRef";
import type {LaneRef} from "./LaneRef";
import type {WarpRef} from "../WarpRef";
import type {
  WarpDidConnect,
  WarpDidAuthenticate,
  WarpDidDeauthenticate,
  WarpDidDisconnect,
  WarpDidFail,
  WarpObserver,
} from "../WarpObserver";

export abstract class BaseRef implements DownlinkOwner, WarpRef {
  constructor(context: RefContext) {
    Object.defineProperty(this, "context", {
      value: context,
      enumerable: true,
    });
    Object.defineProperty(this, "host", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "downlinks", {
      value: [],
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "observers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  readonly context!: RefContext;

  /** @hidden */
  readonly host!: Host | null;

  /** @hidden */
  readonly downlinks!: Downlink[];

  /** @hidden */
  readonly observers!: ReadonlyArray<WarpObserver>;

  abstract readonly hostUri: Uri;

  isConnected(): boolean {
    const host = this.host;
    return host !== null && host.isConnected();
  }

  isAuthenticated(): boolean {
    const host = this.host;
    return host !== null && host.isAuthenticated();
  }

  get session(): Value {
    const host = this.host;
    return host !== null ? host.session : Value.absent();
  }

  authenticate(credentials: AnyValue): void {
    this.context.authenticate(this.hostUri, credentials);
  }

  abstract downlink(init?: EventDownlinkInit): EventDownlink;

  abstract downlinkList(init?: ListDownlinkInit<Value, AnyValue>): ListDownlink<Value, AnyValue>;
  abstract downlinkList<V extends VU, VU = never>(init?: ListDownlinkInit<V, VU>): ListDownlink<V, VU>;

  abstract downlinkMap(init?: MapDownlinkInit<Value, Value, AnyValue, AnyValue>): MapDownlink<Value, Value, AnyValue, AnyValue>;
  abstract downlinkMap<K extends KU, V extends VU, KU = never, VU = never>(init?: MapDownlinkInit<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;

  abstract downlinkValue(init?: ValueDownlinkInit<Value, AnyValue>): ValueDownlink<Value, AnyValue>;
  abstract downlinkValue<V extends VU, VU = never>(init?: ValueDownlinkInit<V, VU>): ValueDownlink<V, VU>;

  abstract hostRef(hostUri: AnyUri): HostRef;

  abstract nodeRef(hostUri: AnyUri, nodeUri: AnyUri): NodeRef;
  abstract nodeRef(nodeUri: AnyUri): NodeRef;

  abstract laneRef(hostUri: AnyUri, nodeUri: AnyUri, laneUri: AnyUri): LaneRef;
  abstract laneRef(nodeUri: AnyUri, laneUri: AnyUri): LaneRef;

  /** @hidden */
  addDownlink(downlink: Downlink): void {
    const downlinks = this.downlinks;
    if (downlinks.length === 0) {
      this.open();
    }
    downlinks.push(downlink);
  }

  /** @hidden */
  removeDownlink(downlink: Downlink): void {
    const downlinks = this.downlinks;
    const i = downlinks.indexOf(downlink);
    if (i >= 0) {
      downlinks.splice(i, 1);
      if (downlinks.length === 0) {
        this.close();
      }
    }
  }

  open(): void {
    this.context.openRef(this);
  }

  close(): void {
    this.context.closeRef(this);
  }

  /** @hidden */
  closeUp(): void {
    const downlinks = this.downlinks;
    Object.defineProperty(this, "downlinks", {
      value: [],
      enumerable: true,
      configurable: true,
    });
    for (let i = 0, n = downlinks.length; i < n; i += 1) {
      downlinks[i]!.close();
    }
  }

  observe(observer: WarpObserver): this {
    Object.defineProperty(this, "observers", {
      value: Arrays.inserted(observer, this.observers),
      enumerable: true,
      configurable: true,
    });
    return this;
  }

  unobserve(observer: unknown): this {
    const oldObservers = this.observers;
    const n = oldObservers.length;
    for (let i = 0; i < n; i += 1) {
      const oldObserver = oldObservers[i]! as {[key: string]: unknown};
      let found = oldObserver === observer; // check object identity
      if (!found) {
        for (const key in oldObserver) { // check property identity
          if (oldObserver[key] === observer) {
            found = true;
            break;
          }
        }
      }
      if (found) {
        if (n > 1) {
          const newObservers = new Array<WarpObserver>(n - 1);
          for (let j = 0; j < i; j += 1) {
            newObservers[j] = oldObservers[j]!;
          }
          for (let j = i + 1; j < n; j += 1) {
            newObservers[j - 1] = oldObservers[j]!;
          }
          Object.defineProperty(this, "observers", {
            value: newObservers,
            enumerable: true,
            configurable: true,
          });
        } else {
          Object.defineProperty(this, "observers", {
            value: Arrays.empty,
            enumerable: true,
            configurable: true,
          });
        }
        break;
      }
    }
    return this;
  }

  didConnect(didConnect: WarpDidConnect): this {
    return this.observe({didConnect});
  }

  didAuthenticate(didAuthenticate: WarpDidAuthenticate): this {
    return this.observe({didAuthenticate});
  }

  didDeauthenticate(didDeauthenticate: WarpDidDeauthenticate): this {
    return this.observe({didDeauthenticate});
  }

  didDisconnect(didDisconnect: WarpDidDisconnect): this {
    return this.observe({didDisconnect});
  }

  didFail(didFail: WarpDidFail): this {
    return this.observe({didFail});
  }

  /** @hidden */
  hostDidConnect(host: Host): void {
    Object.defineProperty(this, "host", {
      value: host,
      enumerable: true,
      configurable: true,
    });
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didConnect !== void 0) {
        observer.didConnect(host, this);
      }
    }
  }

  /** @hidden */
  hostDidAuthenticate(body: Value, host: Host): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didAuthenticate !== void 0) {
        observer.didAuthenticate(body, host, this);
      }
    }
  }

  /** @hidden */
  hostDidDeauthenticate(body: Value, host: Host): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didDeauthenticate !== void 0) {
        observer.didDeauthenticate(body, host, this);
      }
    }
  }

  /** @hidden */
  hostDidDisconnect(host: Host): void {
    Object.defineProperty(this, "host", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didDisconnect !== void 0) {
        observer.didDisconnect(host, this);
      }
    }
  }

  /** @hidden */
  hostDidFail(error: unknown, host: Host): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didFail !== void 0) {
        observer.didFail(error, host, this);
      }
    }
  }
}
