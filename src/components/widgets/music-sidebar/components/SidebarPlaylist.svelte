<script lang="ts">
import AccordionDrawer from "../../common/AccordionDrawer.svelte";
import type { Song } from "../../music-player/types";
import TrackListItem from "./TrackListItem.svelte";

interface Props {
	playlist: Song[];
	currentIndex: number;
	isPlaying: boolean;
	show: boolean;
	onClose: () => void;
	onPlaySong: (index: number) => void;
}

const { playlist, currentIndex, isPlaying, show, onClose, onPlaySong }: Props =
	$props();
</script>

<AccordionDrawer {show} class="mt-0">
	<div
		class="mt-2 border-t border-[color-mix(in_srgb,var(--content-meta)_12%,transparent_88%)] pt-2"
	>
		<div
			class="flex max-h-48 flex-col gap-1 overflow-y-auto pr-1 pb-1 [scrollbar-width:none]"
			role="listbox"
			aria-label="Playlist"
			aria-multiselectable="false"
		>
			{#each playlist as song, index}
				<TrackListItem
					{song}
					isCurrent={index === currentIndex}
					{isPlaying}
					onclick={() => onPlaySong(index)}
				/>
			{/each}
		</div>
	</div>
</AccordionDrawer>
