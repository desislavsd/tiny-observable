import { expect, test, mock } from 'bun:test';
import { observable, observe } from '../src';

test('Should propagate deep changes, notify subscribers and batch updates', async () => {
	const { state, fn } = setup({ nested: { count: 0 } });

	state.nested.count++;

	state.nested.count++;

	expect(fn).toHaveBeenCalledTimes(0);

	await Promise.resolve();

	expect(fn).toHaveBeenCalledTimes(1);
	expect(fn).toHaveBeenCalledWith(state);

	delete (state as { nested?: {} }).nested;

	await Promise.resolve();

	expect(fn).toHaveBeenCalledWith({});
});

test('Should cleanup immediately', async () => {
	const { state, fn, cleanup } = setup();

	state.count++;
	state.count++;

	cleanup();

	state.count++;

	await Promise.resolve();

	expect(fn).toHaveBeenCalledTimes(0);
});

function setup(): {
	state: { count: number };
	fn: ReturnType<typeof mock>;
	cleanup: () => void;
};
function setup<T extends object>(
	data: T,
): {
	state: T;
	fn: ReturnType<typeof mock>;
	cleanup: () => void;
};
function setup(data: object = { count: 0 }) {
	const state = observable(data);
	const fn = mock();
	const cleanup = observe(state, fn);

	return { state, fn, cleanup };
}
