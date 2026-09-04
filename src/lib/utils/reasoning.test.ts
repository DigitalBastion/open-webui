import { describe, expect, it } from 'vitest';

import {
	getReasoningEffortRequestParams,
	intersectReasoningEffortLevels,
	normalizeReasoningEffortLevels,
	resolveReasoningEffort
} from './reasoning';

describe('reasoning effort capabilities', () => {
	it('normalizes custom levels while preserving order', () => {
		expect(normalizeReasoningEffortLevels([' low ', 'high', '', 'low', null])).toEqual([
			'low',
			'high'
		]);
	});

	it('resolves explicit levels as authoritative', () => {
		expect(resolveReasoningEffort(['minimal', 'low', 'high'])).toEqual({
			supported: true,
			levels: ['minimal', 'low', 'high']
		});
	});

	it('intersects levels in the first model ordering', () => {
		expect(
			intersectReasoningEffortLevels([
				['none', 'low', 'medium', 'high', 'xhigh'],
				['low', 'high', 'max']
			])
		).toEqual(['low', 'high']);
	});

	it('hides the capability if any selected model does not support it', () => {
		expect(intersectReasoningEffortLevels([['low', 'high'], undefined])).toEqual([]);
	});

	it('omits values outside the explicit levels', () => {
		expect(
			getReasoningEffortRequestParams({ reasoning_effort: 'xhigh', temperature: 0.5 }, [
				'low',
				'medium',
				'high'
			])
		).toEqual({ temperature: 0.5 });
	});

	it('preserves a supported effort in request params', () => {
		expect(getReasoningEffortRequestParams({ reasoning_effort: 'high' }, ['low', 'high'])).toEqual({
			reasoning_effort: 'high'
		});
	});
});
