<script lang="ts">
import Icon from "@iconify/svelte";

import NextButton from "../../music-player/atoms/NextButton.svelte";
import PlayButton from "../../music-player/atoms/PlayButton.svelte";
import PrevButton from "../../music-player/atoms/PrevButton.svelte";

interface Props {
	isPlaying: boolean;
	isShuffled: boolean;
	repeatMode: number;
	onToggleMode?: () => void;
	onPrev: () => void;
	onNext: () => void;
	onTogglePlay: () => void;
	onTogglePlaylist: () => void;
}

const {
	isPlaying,
	isShuffled,
	repeatMode,
	onToggleMode,
	onPrev,
	onNext,
	onTogglePlay,
	onTogglePlaylist,
}: Props = $props();

const repeatIcon = $derived(
	isShuffled
		? "material-symbols:shuffle-rounded"
		: repeatMode === 1
			? "material-symbols:repeat-one-rounded"
			: "material-symbols:repeat-rounded",
);

const modeActive = $derived(isShuffled || repeatMode > 0);
</script>

<div
	class="mt-3 flex flex-nowrap items-center justify-between gap-1 px-0.5 max-[520px]:gap-[0.15rem] max-[520px]:px-0 max-[520px]:[&_.btn-plain]:h-9 max-[520px]:[&_.btn-plain]:w-9 max-[520px]:[&_.btn-plain]:flex-[0_0_2.25rem] max-[520px]:[&_.btn-plain]:rounded-[0.6rem] max-[520px]:[&_.btn-plain]:p-0 max-[520px]:[&_.btn-regular]:h-11 max-[520px]:[&_.btn-regular]:w-11 max-[520px]:[&_.btn-regular]:flex-[0_0_2.75rem] [&_button]:shrink-0"
>
	<button
		class={`flex h-8 w-8 flex-none items-center justify-center transition-[color,transform] duration-150 hover:text-[var(--primary)] active:scale-[0.96] max-[520px]:h-[1.9rem] max-[520px]:w-[1.9rem] max-[520px]:flex-[0_0_1.9rem] ${modeActive ? "text-[var(--primary)]" : "text-[var(--content-meta)]"}`}
		onclick={() => onToggleMode?.()}
		aria-label="Repeat mode"
	>
		<Icon icon={repeatIcon} class="text-xl" />
	</button>
	<PrevButton onclick={onPrev} disabled={false} />
	<PlayButton {isPlaying} isLoading={false} onclick={onTogglePlay} />
	<NextButton onclick={onNext} disabled={false} />
	<button
		class="flex h-8 w-8 flex-none items-center justify-center text-[var(--content-meta)] transition-[color,transform] duration-150 hover:text-[var(--primary)] active:scale-[0.96] max-[520px]:h-[1.9rem] max-[520px]:w-[1.9rem] max-[520px]:flex-[0_0_1.9rem]"
		onclick={onTogglePlaylist}
		aria-label="Playlist"
	>
		<Icon icon="material-symbols:queue-music-rounded" />
	</button>
</div>
