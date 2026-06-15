<script lang="ts">
import Icon from "@iconify/svelte";

import type { Song } from "../../music-player/types";

interface Props {
	song: Song;
	isCurrent: boolean;
	isPlaying: boolean;
	onclick: () => void;
}

const { song, isCurrent, isPlaying, onclick }: Props = $props();

function getAssetPath(path: string): string {
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	if (path.startsWith("/")) {
		return path;
	}
	return `/${path}`;
}
</script>

<div
	class={`group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-[background-color,transform] duration-200 hover:bg-[color-mix(in_srgb,var(--btn-plain-bg-hover)_75%,transparent_25%)] ${isCurrent ? "bg-[color-mix(in_srgb,var(--btn-plain-bg)_80%,transparent_20%)]" : ""}`}
	{onclick}
	onkeydown={(e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onclick();
		}
	}}
	role="option"
	tabindex="0"
	aria-selected={isCurrent}
	aria-label={`播放 ${song.title} - ${song.artist}`}
>
	<div
		class="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--btn-regular-bg)]"
	>
		<img
			src={getAssetPath(song.cover)}
			alt={song.title}
			loading="lazy"
			class="h-full w-full object-cover"
		/>
	</div>
	<div class="min-w-0 flex-1">
		<div
			class={`truncate text-xs font-bold transition-colors duration-200 group-hover:text-[var(--primary)] dark:text-neutral-200 ${isCurrent ? "text-[var(--primary)]" : "text-[var(--content-main)]"}`}
		>
			{song.title}
		</div>
		<div
			class={`truncate text-[10px] dark:text-neutral-400 ${isCurrent ? "text-[var(--primary)]" : "text-[var(--content-meta)]"}`}
		>
			{song.artist}
		</div>
	</div>
	{#if isCurrent && isPlaying}
		<Icon
			icon="material-symbols:graphic-eq-rounded"
			class="text-[var(--primary)]"
			style="color: var(--primary);"
		/>
	{/if}
</div>
