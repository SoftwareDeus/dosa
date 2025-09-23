import { describe, it, expect } from 'vitest';

describe('sum test', (): void => {
	it('adds 1 + 2 to equal 3', (): void => {
		const ONE = 1;
		const TWO = 2;
		const THREE = 3;
		expect(ONE + TWO).toBe(THREE);
	});
});
