import { describe, expect, it } from 'vitest';

import { resolveHistoryEntryImage } from './analysisHistoryImageViewer';

describe('resolveHistoryEntryImage', () => {
	it('returns single image for regular entries when no index is provided', () => {
		const entry = { imageData: 'data:image/png;base64,AAA' };
		expect(resolveHistoryEntryImage(entry as any, undefined)).toEqual({
			ok: true,
			imageData: 'data:image/png;base64,AAA'
		});
	});

	it('errors when index is provided for a single-image entry', () => {
		const entry = { imageData: 'data:image/png;base64,AAA' };
		expect(resolveHistoryEntryImage(entry as any, 0)).toEqual({
			ok: false,
			error: 'unexpected_index'
		});
	});

	it('errors when index is missing for a comparison entry', () => {
		const entry = { imageData: ['data:image/png;base64,AAA', 'data:image/png;base64,BBB'] };
		expect(resolveHistoryEntryImage(entry as any, undefined)).toEqual({
			ok: false,
			error: 'missing_index'
		});
	});

	it('errors when index is out of range for a comparison entry', () => {
		const entry = { imageData: ['data:image/png;base64,AAA'] };
		expect(resolveHistoryEntryImage(entry as any, 1)).toEqual({
			ok: false,
			error: 'index_out_of_range'
		});
	});

	it('returns selected image for comparison entries when index is valid', () => {
		const entry = { imageData: ['data:image/png;base64,AAA', 'data:image/png;base64,BBB'] };
		expect(resolveHistoryEntryImage(entry as any, 1)).toEqual({
			ok: true,
			imageData: 'data:image/png;base64,BBB'
		});
	});
});
