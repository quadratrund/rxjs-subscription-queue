import { Observable, Subject, Subscriber, TeardownLogic } from 'rxjs';

export interface SubscriberInfo<T> {
  readonly subscriber: Subscriber<T>;
  readonly active: boolean;
}

export class MultiSubject<T> extends Observable<T> {
  public readonly subscribers: readonly SubscriberInfo<T>[];
  public readonly activeSubscribers: readonly Subscriber<T>[];
  public readonly onSubscribe: Observable<SubscriberInfo<T>>;
  public readonly onUnsubscribe: Observable<SubscriberInfo<T>>;

  constructor() {
    const subscribers: SubscriberInfo<T>[] = [];
    const activeSubscribers: Subscriber<T>[] = [];
    const onSubscribe: Subject<SubscriberInfo<T>> = new Subject();
    const onUnsubscribe: Subject<SubscriberInfo<T>> = new Subject();

    super((subscriber: Subscriber<T>): TeardownLogic => {
      const info = {
        subscriber,
        active: true
      };
      subscribers.push(info);
      activeSubscribers.push(subscriber);
      onSubscribe.next(info);
      return () => {
        info.active = false;
        const index = activeSubscribers.indexOf(subscriber);
        activeSubscribers.splice(index, 1);
        onUnsubscribe.next(info);
      };
    });

    this.subscribers = subscribers;
    this.activeSubscribers = activeSubscribers;
    this.onSubscribe = onSubscribe.asObservable();
    this.onUnsubscribe = onUnsubscribe.asObservable();
  }
}
