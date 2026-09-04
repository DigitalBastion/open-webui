<script lang="ts">
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import type { i18n as i18nType } from 'i18next';

	import { models, settings } from '$lib/stores';
	import Dropdown from '$lib/components/common/Dropdown.svelte';
	import DropdownMenu from '$lib/components/common/DropdownMenu.svelte';
	import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
	import { intersectReasoningEffortLevels } from '$lib/utils/reasoning';

	const i18n: Writable<i18nType> = getContext('i18n');

	export let selectedModelIds: string[] = [];
	export let params: Record<string, unknown> = {};

	let show = false;

	const humanizeEffort = (effort: string) => {
		if (effort.toLowerCase() === 'xhigh') return $i18n.t('Extra high');

		return effort
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.replace(/[_-]+/g, ' ')
			.replace(/\b\w/g, (letter) => letter.toUpperCase());
	};

	$: efforts = intersectReasoningEffortLevels(
		selectedModelIds.map((modelId) => {
			const capabilities = $models.find((model) => model.id === modelId)?.info?.meta
				?.capabilities as Record<string, unknown> | undefined;
			return capabilities?.reasoning_effort as string[] | null | undefined;
		})
	);
	$: reasoningEffortSupported = efforts.length > 0;
	$: hasLocalEffort = params?.reasoning_effort != null;
	$: effectiveEffort = String(
		params?.reasoning_effort ?? $settings?.params?.reasoning_effort ?? 'medium'
	);
	$: effortLabel = humanizeEffort(effectiveEffort);
	$: effectiveEffortSupported = efforts.includes(effectiveEffort);
	$: triggerLabel = hasLocalEffort ? effortLabel : `${$i18n.t('Default')}: ${effortLabel}`;

	const selectEffort = (effort: string | null) => {
		if (effort === null) {
			const nextParams = { ...(params ?? {}) };
			delete nextParams.reasoning_effort;
			params = nextParams;
		} else {
			params = { ...params, reasoning_effort: effort };
		}

		show = false;
	};
</script>

{#if reasoningEffortSupported}
	<Dropdown bind:show align="end" side="top">
		<button
			type="button"
			class="flex max-w-[7.5rem] items-center gap-1 rounded-lg px-2 py-1 text-[0.8125rem] font-normal transition-colors duration-100 focus:outline-hidden {effectiveEffortSupported
				? 'text-gray-600 hover:bg-gray-50/40 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/40 dark:hover:text-gray-200'
				: 'text-amber-700 hover:bg-amber-50/60 dark:text-amber-400 dark:hover:bg-amber-950/20'}"
			aria-haspopup="menu"
			aria-expanded={show}
			aria-label={$i18n.t('Reasoning effort: {{effort}}', { effort: triggerLabel })}
		>
			<span class="truncate">{triggerLabel}</span>
			<ChevronDown className="size-3.5 shrink-0" strokeWidth="1.75" />
		</button>

		<div slot="content">
			<DropdownMenu className="min-w-32">
				<button
					type="button"
					role="menuitemradio"
					aria-checked={!hasLocalEffort}
					on:click={() => selectEffort(null)}
				>
					<span>{$i18n.t('Default')}</span>
					{#if !hasLocalEffort}
						<span class="ml-auto max-w-24 truncate text-[11px] text-gray-400 dark:text-gray-500">
							{effortLabel}
						</span>
					{/if}
				</button>

				{#if !effectiveEffortSupported}
					<p
						class="max-w-52 px-2 py-1 text-[11px] leading-tight text-amber-700 dark:text-amber-400"
						role="status"
					>
						{$i18n.t('Current level is unavailable for the selected models')}
					</p>
				{/if}

				{#each efforts as effort}
					<button
						type="button"
						role="menuitemradio"
						aria-checked={hasLocalEffort && params.reasoning_effort === effort}
						on:click={() => selectEffort(effort)}
					>
						{humanizeEffort(effort)}
					</button>
				{/each}
			</DropdownMenu>
		</div>
	</Dropdown>
{/if}
