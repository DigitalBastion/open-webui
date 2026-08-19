export const DEFAULT_REASONING_EFFORT_LEVELS = ['low', 'medium', 'high'];

export type ReasoningEffortCapability = string[] | null | undefined;

export type ResolvedReasoningEffort = {
	supported: boolean;
	levels: string[];
};

export const normalizeReasoningEffortLevels = (levels: unknown): string[] => {
	if (!Array.isArray(levels)) return [];

	return [...new Set(levels.filter((level) => typeof level === 'string').map((level) => level.trim()))]
		.filter(Boolean);
};

export const resolveReasoningEffort = (
	capability: ReasoningEffortCapability
): ResolvedReasoningEffort => {
	const levels = normalizeReasoningEffortLevels(capability);
	return {
		supported: levels.length > 0,
		levels
	};
};

export const intersectReasoningEffortLevels = (
	capabilities: ReasoningEffortCapability[]
): string[] => {
	if (capabilities.length === 0) return [];

	const resolved = capabilities.map(resolveReasoningEffort);
	if (resolved.some(({ supported }) => !supported)) return [];

	return resolved[0].levels.filter((level) =>
		resolved.slice(1).every(({ levels }) => levels.includes(level))
	);
};

export const getReasoningEffortRequestParams = (
	params: Record<string, any>,
	capability: ReasoningEffortCapability
) => {
	const nextParams = { ...params };
	const effort = nextParams.reasoning_effort;
	const { levels } = resolveReasoningEffort(capability);

	if (typeof effort === 'string' && !levels.includes(effort)) {
		delete nextParams.reasoning_effort;
	}

	return nextParams;
};
