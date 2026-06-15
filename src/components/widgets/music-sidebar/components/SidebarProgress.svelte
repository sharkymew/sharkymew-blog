<script lang="ts">
interface Props {
	currentTime: number;
	duration: number;
	onSeek: (time: number) => void;
}

const { currentTime, duration, onSeek }: Props = $props();

const progressPercent = $derived(
	duration > 0 ? Math.max(0, Math.min(100, (currentTime / duration) * 100)) : 0,
);

function handleClick(event: MouseEvent) {
	const el = event.currentTarget as HTMLElement | null;
	if (!el || duration <= 0) {
		return;
	}
	const rect = el.getBoundingClientRect();
	const percent = (event.clientX - rect.left) / rect.width;
	const clamped = Math.max(0, Math.min(1, percent));
	const time = clamped * duration;
	onSeek(time);
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		const time = duration * 0.5;
		onSeek(time);
	}
}
</script>

<div class="mt-[0.15rem]">
	<div
		class="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--btn-regular-bg)_80%,var(--content-meta)_20%)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
		onclick={handleClick}
		onkeydown={handleKeyDown}
		role="slider"
		tabindex="0"
		aria-label="Music progress"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={progressPercent}
	>
		<div
			class="h-full min-w-0 rounded-[inherit] bg-[var(--primary)] transition-[width] duration-100 ease-linear"
			style={`width: ${progressPercent}%`}
		></div>
	</div>
</div>
