export interface GEventObject {}

export interface GErrorEvent extends GEventObject
{
  /** The error message. */
  msg: string;
}

export interface GChangeEvent<M> extends GEventObject
{
  /** The old / previos value. */
  oldValue: M;

  /** The new / current value. */
  newValue: M;
}

export interface GIndexedChangeEvent<M> extends GChangeEvent<M>
{
  /** The index. */
  index: number;
}

export interface GProgressEvent extends GEventObject
{
  /** The ressource url. */
  url?: string;

  /** The total amount at which the progress is considered completed. Zero or negative values indicated an unknown amount. */
  total: number;

  /** The current progress. */
  progress: number;
}

export interface GPropertyChangeEvent extends GEventObject
{
  /** The poperty that changed its value. */
  property: string | symbol
}


interface ListenerEntry
{
  /** The listener function. */
  fn: Function;

  /** The listener context. */
  context: any;
}

export interface IEventDispatcher<EM>
{
  addEventListener<K extends keyof EM>(
    type: K,
    listener: (ev: EM[K]) => void,
    context: any
  ): void;

  removeEventListener<K extends keyof EM>(
    type: K,
    listener: (ev: EM[K]) => void,
    context: any
  ): void;

  removeEventListenersFor(
    context: any
  ): void;
}


/**
 * The EventDispatcher class definition.
 *
 * The EventDispatcher is kind of copied from threejs and extended to fit into the google closure environment.
 *
 * @author Stefan Glaser
 */
class EventDispatcher<EM> implements IEventDispatcher<EM>
{
  /** The map of all known event observer (listener) instances. */
  private readonly __event_observers: Map<keyof EM, ListenerEntry[]>;

  constructor()
  {
    this.__event_observers = new Map<keyof EM, ListenerEntry[]>();
  }

  /**
   * Add callback function for the given event type.
   *
   * @param type the event type
   * @param callback the callback function
   * @param context the listener context (this reference)
   * @returns this
   */
  addEventListener<K extends keyof EM> (type: K, callback: (this: any, event: EM[K]) => any, context?: any): this
  {
    if (!context) {
      // Ensure valid context
      context = this;
    }

    const listeners = this.__event_observers;

    // Lazy create listener array for specific event
    if (!listeners.has(type)) {
      listeners.set(type, []);
    }

    // Add listener if not yet present
    if (listeners.get(type).findIndex(entry => entry.fn === callback && entry.context === context) < 0) {
      listeners.get(type).push({ fn: callback, context: context });
    }

    return this;
  }

  /**
   * Remove listener callback funtion from the given event type.
   *
   * @param type the event name
   * @param callback the callback function
   * @param context the listener context (this reference)
   * @returns this
   */
  removeEventListener<K extends keyof EM> (type: K, callback: (this: any, event: EM[K]) => any, context: any = this): this
  {
    const listenerArray = this.__event_observers.get(type);

    if (listenerArray) {
      this.__event_observers.set(type, listenerArray.filter(entry => entry.fn !== callback || entry.context !== context));
    }

    return this;
  }

  /**
   * Remove listener callback funtions for the given context.
   *
   * @param context the listener context (this reference)
   * @returns this
   */
  removeEventListenersFor (context: any = this): this
  {
    for (let key in this.__event_observers.keys()) {
      const listenerArray = this.__event_observers.get(key as keyof EM);
      this.__event_observers.set(key as keyof EM, listenerArray.filter(entry => entry.context !== context));
    }

    return this;
  }

  /**
   * Call to dispatch an event to all registered listeners.
   *
   * @param type the event type / idefntifyer
   * @param event the event to dispatch
   */
  dispatchEvent<K extends keyof EM> (type: K, event: EM[K]): void
  {
    const listeners = this.__event_observers.get(type);

    if (listeners) {
      for (let i = 0; i < listeners.length; i++) {
        listeners[i].fn.call(listeners[i].context, event);
      }
    }
  }
}

export { EventDispatcher };
