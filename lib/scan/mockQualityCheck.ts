export interface QualityCheckResult {
  passed: boolean;
  reason?: string;
}

// MOCK — replaced with real blur/quality validation (e.g. Laplacian variance) at merge time.
// Runs a trivial brightness/variance heuristic against a downsampled canvas read of the photo,
// then rolls a small random failure chance so the retake path is genuinely exercisable in demo.
export async function mockQualityCheck(imageDataUrl: string): Promise<QualityCheckResult> {
  const brightness = await estimateAverageBrightness(imageDataUrl);

  if (brightness < 15 || brightness > 245) {
    return { passed: false, reason: 'lighting' };
  }

  // MOCK: ~12% random "blurry" failure to demonstrate the retake flow.
  if (Math.random() < 0.12) {
    return { passed: false, reason: 'blur' };
  }

  return { passed: true };
}

function estimateAverageBrightness(imageDataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const sampleSize = 32;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(128);
        return;
      }
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
      let total = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        total += (data[i] + data[i + 1] + data[i + 2]) / 3;
        count += 1;
      }
      resolve(count > 0 ? total / count : 128);
    };
    img.onerror = () => resolve(128);
    img.src = imageDataUrl;
  });
}
