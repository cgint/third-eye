export interface ProcessedImage {
    mimeType: string;
    data: Uint8Array;
}

export interface AnalysisResult {
    result_text: string | null;
}
