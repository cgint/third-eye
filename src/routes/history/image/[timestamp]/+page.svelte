<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getAnalysisHistory, type AnalysisEntry } from '$lib/stores/analysisHistoryStore';
	import { resolveHistoryEntryImage } from '$lib/utils/analysisHistoryImageViewer';

	const analysisHistory = getAnalysisHistory();

	type ViewState =
		| { kind: 'loading' }
		| { kind: 'ready'; imageData: string }
		| { kind: 'error'; message: string };

	let viewState: ViewState = { kind: 'loading' };

	function handleClose() {
		// Prefer native history back to preserve scroll position in the history list.
		if (typeof history !== 'undefined' && history.length > 1) {
			history.back();
			return;
		}
		goto('/');
	}

	function parseOptionalIndex(raw: string | null): number | undefined {
		if (raw === null) return undefined;
		const parsed = Number(raw);
		if (!Number.isInteger(parsed)) return NaN;
		return parsed;
	}

	$: {
		const timestampRaw = $page.params.timestamp;
		const timestamp = Number(timestampRaw);
		const index = parseOptionalIndex($page.url.searchParams.get('i'));

		if (!Number.isFinite(timestamp)) {
			viewState = { kind: 'error', message: 'Invalid image reference.' };
		} else if (Number.isNaN(index as any)) {
			viewState = { kind: 'error', message: 'Invalid image index.' };
		} else {
			const entry: AnalysisEntry | undefined = $analysisHistory.find((e) => e.timestamp === timestamp);
			if (!entry) {
				viewState = { kind: 'error', message: 'Image not found in history.' };
			} else {
				const resolved = resolveHistoryEntryImage(entry, index);
				if (!resolved.ok) {
					viewState = { kind: 'error', message: 'Unable to open this image.' };
				} else {
					viewState = { kind: 'ready', imageData: resolved.imageData };
				}
			}
		}
	}
</script>

<svelte:head>
	<title>History image</title>
</svelte:head>

<div class="viewer" role="dialog" aria-label="Full-screen image viewer">
	<header class="viewer-header">
		<button class="close" onclick={handleClose} aria-label="Close full-screen image viewer">
			Back
		</button>
	</header>

	<main class="viewer-body">
		{#if viewState.kind === 'loading'}
			<div class="status">Loading…</div>
		{:else if viewState.kind === 'error'}
			<div class="status">
				<p>{viewState.message}</p>
				<button onclick={handleClose} class="secondary">Back</button>
			</div>
		{:else}
			<img src={viewState.imageData} alt="Analysis history" />
		{/if}
	</main>
</div>

<style>
	.viewer {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100dvh;
		background: #000;
		color: #fff;
		display: flex;
		flex-direction: column;
		padding-top: env(safe-area-inset-top);
		padding-right: env(safe-area-inset-right);
		padding-bottom: env(safe-area-inset-bottom);
		padding-left: env(safe-area-inset-left);
	}

	.viewer-header {
		flex: 0 0 auto;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: 12px;
	}

	.viewer-body {
		flex: 1 1 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12px;
		overflow: hidden;
	}

	img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border-radius: 8px;
	}

	.status {
		text-align: center;
		max-width: 34rem;
		line-height: 1.4;
	}

	button.close {
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.18);
		color: white;
		border-radius: 12px;
		padding: 8px 12px;
		font-weight: 600;
		cursor: pointer;
	}

	button.secondary {
		margin-top: 12px;
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.18);
		color: white;
		border-radius: 12px;
		padding: 8px 12px;
		font-weight: 600;
		cursor: pointer;
	}
</style>
