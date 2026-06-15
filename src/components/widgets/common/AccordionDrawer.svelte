<script lang="ts">
import type { Snippet } from "svelte";

interface Props {
	show: boolean;
	class?: string;
	children?: Snippet;
}

const { show, class: className = "", children }: Props = $props();
</script>

<div
	class={`grid opacity-0 transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${show ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr]"} ${className}`}
>
	<div class="min-h-0 overflow-hidden">
		{@render children?.()}
	</div>
</div>
