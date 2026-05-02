# @desislavsd/tiny-observable

Tiny observable state for plain objects and lightweight use cases.

- ultra light
- deep changes detection
- batched notifications for multiple mutations (spam protection)

## Installation

```bash
bun add @desislavsd/tiny-observable
```

## Usage

```typescript
import { observable, observe } from '@desislavsd/tiny-observable';

const state = observable({ count: 0 });

observe(state, console.log);

state.count++; // logs: { count: 1 }
```

### Batching and cleanup

Notifications are batched per microtask and observers receive the latest live state (not a snapshot). Cleanup is synchronous and cancels pending notifications.

```typescript
import { observable, observe } from '@desislavsd/tiny-observable';

const state = observable({ count: 0 });

const cleanup = observe(state, console.log);

// mutations are batched into a single
// notification on the next microtask
state.count++;
state.count++;

await Promise.resolve();
// logs once: { count: 2 }

state.count++;
cleanup(); // synchronous unsubscribe

await Promise.resolve();
// nothing is logged: the pending notification was cancelled
```

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT
