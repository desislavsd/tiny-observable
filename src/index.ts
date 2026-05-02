const raws = new WeakMap<object, object>();
const subs = new WeakMap<object, Set<object | ((v: object) => void)>>();
const queue = new Set<object>();

function notify(proxy: object) {
	if (typeof proxy !== 'object' || !proxy) return;

	const scheduled = queue.size > 0;

	queue.add(proxy);

	subs.get(proxy)?.forEach(notify);

	if (scheduled) return;

	queueMicrotask(() => {
		queue.forEach((p) => {
			subs.get(p)?.forEach((f) => typeof f === 'function' && f(p));
		});
		queue.clear();
	});
}

export function observable<T extends object>(target: T): T {
	if (typeof target !== 'object' || !target) return target;

	if (raws.has(target)) return raws.get(target) as T;

	if (subs.has(target)) return target;

	let initializing = true;

	const proxy = new Proxy(target, {
		set(target, prop, value) {
			const old = (proxy as any)[prop];

			value = observable(value);

			subs.get(old)?.delete(proxy);

			subs.get(value)?.add(proxy);

			const result = Reflect.set(target, prop, value);

			if (!initializing && value !== old) notify(proxy);

			return result;
		},
		deleteProperty(target, prop) {
			if (!Object.hasOwn(target, prop)) return true;

			const old = (proxy as any)[prop];

			subs.get(old)?.delete(proxy);

			const result = Reflect.deleteProperty(target, prop);

			notify(proxy);

			return result;
		},
	});

	raws.set(target, proxy);

	subs.set(proxy, new Set());

	Object.assign(proxy, target);

	initializing = false;

	return proxy;
}

export function observe<T extends object>(proxy: T, fn: (v: T) => void): () => void {
	subs.get(proxy)?.add(fn);
	return () => subs.get(proxy)?.delete(fn);
}
