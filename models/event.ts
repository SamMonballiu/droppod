interface Subscriber<T = void> {
  id: number;
  publish: (arg: T) => void;
}

type UnsubscribeFn = () => void;
export class SubscribableEvent<T = void> {
  private subscribers: Subscriber<T>[] = [];

  public raise(arg: T) {
    for (const subscriber of this.subscribers) {
      subscriber.publish(arg);
    }
  }

  public subscribe(payload: (arg: T) => void): UnsubscribeFn {
    const subscriber: Subscriber<T> = {
      publish: payload,
      id: this.subscribers.length,
    };

    this.subscribers.push(subscriber);

    return () => {
      this.subscribers = this.subscribers.filter((x) => x.id !== subscriber.id);
    };
  }
}
