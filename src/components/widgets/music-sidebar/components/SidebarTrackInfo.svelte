<script lang="ts">
import Icon from "@iconify/svelte";

import type { Song } from "../../music-player/types";

interface Props {
	currentSong: Song;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	onToggleMute: () => void;
	onSetVolume: (volume: number) => void;
}

const {
	currentSong,
	currentTime,
	duration,
	volume,
	isMuted,
	onToggleMute,
	onSetVolume,
}: Props = $props();

const currentTimeLabel = $derived(
	`${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, "0")}`,
);

const durationLabel = $derived(
	`${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, "0")}`,
);

const volumePercent = $derived(
	isMuted ? 0 : Math.max(0, Math.min(100, volume * 100)),
);

let isVolumeDragging = false;

function handleVolumePointer(event: PointerEvent) {
	const el = event.currentTarget as HTMLElement | null;
	if (!el) {
		return;
	}
	isVolumeDragging = true;
	const rect = el.getBoundingClientRect();
	const percent = (event.clientX - rect.left) / rect.width;
	const nextVolume = Math.max(0, Math.min(1, percent));
	onSetVolume(nextVolume);
	el.setPointerCapture(event.pointerId);
}

function handleVolumeMove(event: PointerEvent) {
	if (!isVolumeDragging) {
		return;
	}
	handleVolumePointer(event);
}

function handleVolumeEnd() {
	isVolumeDragging = false;
}

function handleVolumeKeyDown(event: KeyboardEvent) {
	if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
		event.preventDefault();
		onSetVolume(Math.max(0, volume - 0.05));
	} else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
		event.preventDefault();
		onSetVolume(Math.min(1, volume + 0.05));
	} else if (event.key === "Enter") {
		event.preventDefault();
		onToggleMute();
	}
}
</script>

<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
	<div class="mb-[0.06rem]">
		<span
			class="block truncate font-semibold leading-[1.1] text-[var(--content-main)] dark:text-neutral-100"
			>{currentSong.title}</span
		>
	</div>
	<div class="mb-[0.36rem] max-[520px]:mb-[0.28rem]">
		<span class="block truncate text-xs text-[var(--content-meta)]"
			>{currentSong.artist}</span
		>
	</div>
	<div
		class="flex min-w-0 items-center justify-between gap-[0.55rem] max-[520px]:gap-1.5"
	>
		<div
			class="flex shrink-0 items-center gap-[0.2rem] whitespace-nowrap text-xs text-[var(--content-meta)] max-[520px]:text-[0.625rem]"
			aria-live="polite"
		>
			<span>{currentTimeLabel}</span>
			<span class="opacity-60">/</span>
			<span>{durationLabel}</span>
		</div>

		<div
			class="ml-auto flex min-w-0 items-center justify-end gap-[0.35rem] max-[520px]:gap-1"
		>
			<button
				type="button"
				class="flex h-6 w-6 items-center justify-center rounded-md text-[var(--content-meta)] transition-colors duration-150 hover:text-[var(--primary)] max-[520px]:h-5 max-[520px]:w-5"
				onclick={onToggleMute}
				aria-label="Toggle volume"
			>
				<Icon
					icon={isMuted || volume === 0
						? "material-symbols:volume-off-rounded"
						: "material-symbols:volume-up-rounded"}
					class="text-base"
				/>
			</button>

			<div
				class="relative h-1 w-16 shrink-0 cursor-pointer overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--btn-regular-bg)_80%,var(--content-meta)_20%)] transition-[height] duration-150 hover:h-1.5 focus-visible:h-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] max-[520px]:w-[3.2rem]"
				onpointerdown={handleVolumePointer}
				onpointermove={handleVolumeMove}
				onpointerup={handleVolumeEnd}
				onpointercancel={handleVolumeEnd}
				onkeydown={handleVolumeKeyDown}
				role="slider"
				tabindex="0"
				aria-label="Volume"
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={volumePercent}
			>
				<div
					class="h-full rounded-[inherit] bg-[var(--primary)] transition-[width] duration-100 ease-linear"
					style={`width: ${volumePercent}%`}
				></div>
			</div>
		</div>
	</div>
</div>
