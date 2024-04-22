# RxJS Subscription Queue
The SubscriptionQueue is a locking mechanism for Observables. It is implemented as an operator for observables.
From the outside it looks like you have a normal subscription to an observable, but the original observable is not subscribed until the
previous Subscription ends.

## Example Usages
### with multiple observables
```ts
import { timer } from 'rxjs';
import { SubscriptionQueue, subscriptionQueue } from './subscription-queue';

const queue: SubscriptionQueue = subscriptionQueue();
queue.queueLengthObservable.subscribe((queueLength: number) => console.log('queueLength: ' + queueLength));

timer(300).pipe(tap({ subscribe: () => console.log('start waiting for 300ms') }), queue).subscribe(() => console.log('A'));
timer(100).pipe(tap({ subscribe: () => console.log('start waiting for 100ms') }), queue).subscribe(() => console.log('B'));
timer(200).pipe(tap({ subscribe: () => console.log('start waiting for 200ms') }), queue).subscribe(() => console.log('C'));

// Output:
// queueLength: 0
// queueLength: 1
// start waiting for 300ms
// queueLength: 2
// queueLength: 3
// A
// queueLength: 2
// start waiting for 100ms
// B
// queueLength: 1
// start waiting for 200ms
// C
// queueLength: 0
```
### subscribing multiple times
```ts
import { timer } from 'rxjs';
import { SubscriptionQueue, subscriptionQueue } from './subscription-queue';

const queue: SubscriptionQueue = subscriptionQueue();
queue.queueLengthObservable.subscribe((queueLength: number) => console.log('queueLength: ' + queueLength));
const observable = timer(100).pipe(
  tap({
    subscribe: () => console.log('start waiting for 100ms'),
    unsubscribe: () => console.log('cancel waiting')
  }),
  queue
);

const A = observable.subscribe(() => console.log('A'));
const B = observable.subscribe(() => console.log('B'));
B.unsubscribe();
const C = observable.subscribe(() => console.log('C'));
A.unsubscribe();
// Output:
// queueLength: 0
// queueLength: 1
// start waiting for 100ms
// queueLength: 2
// queueLength: 1
// queueLength: 2
// cancel waiting
// queueLength: 1
// start waiting for 100ms
// C
// queueLength: 0
```
## Properties of the SubscriptionQueue
### queueLength
```ts
queueLength: number;
```
The current length of the queue including the currently active subscription.
### queueLengthObservable
```ts
queueLengthObservable: Observable<number>;
```
An Observable emitting the current length of the queue including the currently active subscription. It emits once on subscription and again whenever the value changes.
