<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { i18n as i18nType } from 'i18next';
	import Checkbox from '$lib/components/common/Checkbox.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import {
		DEFAULT_REASONING_EFFORT_LEVELS,
		normalizeReasoningEffortLevels
	} from '$lib/utils/reasoning';
	import { marked } from 'marked';

	const i18n: Writable<i18nType> = getContext('i18n');

	const capabilityLabels = {
		vision: {
			label: $i18n.t('Vision'),
			description: $i18n.t('Model accepts image inputs')
		},
		file_upload: {
			label: $i18n.t('File Upload'),
			description: $i18n.t('Model accepts file inputs')
		},
		file_context: {
			label: $i18n.t('File Context'),
			description: $i18n.t('Inject file content into conversation context')
		},
		web_search: {
			label: $i18n.t('Web Search'),
			description: $i18n.t('Model can search the web for information')
		},
		image_generation: {
			label: $i18n.t('Image Generation'),
			description: $i18n.t('Model can generate images based on text prompts')
		},
		code_interpreter: {
			label: $i18n.t('Code Interpreter'),
			description: $i18n.t('Model can execute code and perform calculations')
		},
		terminal: {
			label: $i18n.t('Terminal'),
			description: $i18n.t(
				'Model can access Open Terminal for command execution and file management'
			)
		},
		usage: {
			label: $i18n.t('Usage'),
			description: $i18n.t(
				'Sends `stream_options: { include_usage: true }` in the request.\nSupported providers will return token usage information in the response when set.'
			)
		},
		citations: {
			label: $i18n.t('Citations'),
			description: $i18n.t('Displays citations in the response')
		},
		status_updates: {
			label: $i18n.t('Status Updates'),
			description: $i18n.t('Displays status updates (e.g., web search progress) in the response')
		},
		reasoning_effort: {
			label: $i18n.t('Reasoning Effort'),
			description: $i18n.t('Allows users to choose how much effort the model spends reasoning')
		},
		memory: {
			label: $i18n.t('Memory'),
			description: $i18n.t('Inject stored memories into conversation context')
		},
		builtin_tools: {
			label: $i18n.t('Builtin Tools'),
			description: $i18n.t(
				'Automatically inject system tools in native function calling mode (e.g., timestamps, memory, chat history, notes, etc.)'
			)
		}
	};

	type Capability = keyof typeof capabilityLabels;

	type Capabilities = Partial<Record<Exclude<Capability, 'reasoning_effort'>, boolean>> & {
		reasoning_effort?: string[];
	};

	const suggestedReasoningEffortLevels = [
		'none',
		'minimal',
		'low',
		'medium',
		'high',
		'xhigh',
		'max'
	];

	export let capabilities: Capabilities = {};

	let reasoningEffortLevelsInput = '';
	let serializedReasoningEffortLevels: string | null = null;

	$: reasoningEffortEnabled =
		Array.isArray(capabilities.reasoning_effort) && capabilities.reasoning_effort.length > 0;
	$: {
		const levels = normalizeReasoningEffortLevels(capabilities.reasoning_effort);
		const serializedLevels = levels.join(',');

		if (serializedLevels !== serializedReasoningEffortLevels) {
			reasoningEffortLevelsInput = levels.join(', ');
			serializedReasoningEffortLevels = serializedLevels;
		}
	}

	const setCapability = (capability: Capability, checked: boolean) => {
		if (capability === 'reasoning_effort') {
			const currentLevels = normalizeReasoningEffortLevels(capabilities.reasoning_effort);
			capabilities = {
				...capabilities,
				reasoning_effort: checked
					? currentLevels.length > 0
						? currentLevels
						: [...DEFAULT_REASONING_EFFORT_LEVELS]
					: []
			};
			return;
		}

		capabilities[capability] = checked;
		capabilities = capabilities;
	};

	const saveReasoningEffortLevels = () => {
		capabilities = {
			...capabilities,
			reasoning_effort: normalizeReasoningEffortLevels(reasoningEffortLevelsInput.split(','))
		};
	};

	// Hide file_context when file_upload is disabled
	$: visibleCapabilities = (Object.keys(capabilityLabels) as Capability[]).filter((cap) => {
		if (cap === 'file_context' && !capabilities.file_upload) {
			return false;
		}
		return true;
	});
</script>

<div>
	<div class="mb-1.5 text-xs text-gray-400 dark:text-gray-600">{$i18n.t('Capabilities')}</div>
	<div class="grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
		{#each visibleCapabilities as capability}
			<div
				class={capability === 'reasoning_effort' && reasoningEffortEnabled
					? 'sm:col-span-2 lg:col-span-3'
					: ''}
			>
				<div class="flex min-h-6 items-center gap-2.5">
					<Checkbox
						ariaLabel={$i18n.t(capabilityLabels[capability].label)}
						state={capability === 'reasoning_effort'
							? reasoningEffortEnabled
								? 'checked'
								: 'unchecked'
							: capabilities[capability]
								? 'checked'
								: 'unchecked'}
						on:change={(e) => setCapability(capability, e.detail === 'checked')}
					/>
					<button
						type="button"
						class="min-w-0 cursor-pointer text-left text-xs text-gray-600 dark:text-gray-400"
						on:click={() =>
							setCapability(
								capability,
								capability === 'reasoning_effort'
									? !reasoningEffortEnabled
									: !capabilities[capability]
							)}
					>
						<Tooltip
							as="span"
							className="block min-w-0"
							content={marked.parse(capabilityLabels[capability].description)}
						>
							<span class="block truncate">{$i18n.t(capabilityLabels[capability].label)}</span>
						</Tooltip>
					</button>
				</div>

				{#if capability === 'reasoning_effort' && reasoningEffortEnabled}
					<label class="mt-1 block pl-6">
						<span class="sr-only">{$i18n.t('Supported reasoning effort levels')}</span>
						<input
							class="w-full rounded-md border border-gray-100 bg-transparent px-2 py-1 text-xs text-gray-700 outline-hidden placeholder:text-gray-400 focus:border-gray-300 dark:border-gray-800 dark:text-gray-300 dark:placeholder:text-gray-600 dark:focus:border-gray-700"
							type="text"
							bind:value={reasoningEffortLevelsInput}
							placeholder={$i18n.t('Supported levels (low, medium, high)')}
							aria-describedby="reasoning-effort-levels-help"
							on:change={saveReasoningEffortLevels}
						/>
					</label>
					<p
						id="reasoning-effort-levels-help"
						class="mt-1 pl-6 text-[11px] leading-tight text-gray-400 dark:text-gray-600"
					>
						{$i18n.t('Comma-separated, ordered levels. Suggested: {{levels}}', {
							levels: suggestedReasoningEffortLevels.join(', ')
						})}
					</p>
				{/if}
			</div>
		{/each}
	</div>
</div>
