import type { AnalysisEntry } from '$lib/stores/analysisHistoryStore';

export type ResolveHistoryEntryImageError =
	| 'missing_image_data'
	| 'missing_index'
	| 'unexpected_index'
	| 'index_out_of_range';

export type ResolveHistoryEntryImageResult =
	| { ok: true; imageData: string }
	| { ok: false; error: ResolveHistoryEntryImageError };

/**
 * Resolves the image to display in the history image viewer.
 *
 * - Regular entries: must not provide an index.
 * - Comparison entries: must provide an index within range.
 */
export function resolveHistoryEntryImage(
	entry: Pick<AnalysisEntry, 'imageData'>,
	index: number | undefined | null
): ResolveHistoryEntryImageResult {
	const { imageData } = entry;

	if (Array.isArray(imageData)) {
		if (index === undefined || index === null) {
			return { ok: false, error: 'missing_index' };
		}
		if (index < 0 || index >= imageData.length) {
			return { ok: false, error: 'index_out_of_range' };
		}
		const selected = imageData[index];
		if (typeof selected !== 'string') {
			return { ok: false, error: 'missing_image_data' };
		}
		return { ok: true, imageData: selected };
	}

	// Regular (single-image) entry
	if (index !== undefined && index !== null) {
		return { ok: false, error: 'unexpected_index' };
	}
	if (typeof imageData !== 'string') {
		return { ok: false, error: 'missing_image_data' };
	}
	return { ok: true, imageData };
}
