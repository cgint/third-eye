import sharp from 'sharp';

export class MockAIModel {
    constructor(private responseText: string = "Mock analysis result for testing") {
        this.responseText = responseText;
    }

    async generateContent() {
        return {
            response: {
                text: () => this.responseText
            }
        };
    }
}

export async function createTestImage(width: number = 1024, height: number = 1024): Promise<Buffer> {
    // Create a valid JPEG image using sharp
    return await sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 255, g: 0, b: 0 }
        }
    })
    .jpeg()
    .toBuffer();
}
