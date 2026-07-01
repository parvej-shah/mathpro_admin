interface ConvertOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxBytes?: number;
  quality?: number;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for conversion"));
    };
    image.src = url;
  });
}

function canvasToWebpBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", quality);
  });
}

/**
 * Converts an image file to webp client-side, downscaling to fit maxWidth/maxHeight
 * and iteratively lowering quality until it fits maxBytes (if provided).
 */
export async function convertImageToWebp(
  file: File,
  { maxWidth, maxHeight, maxBytes, quality = 0.85 }: ConvertOptions = {}
): Promise<File> {
  const image = await loadImage(file);

  let { width, height } = image;
  if (maxWidth && width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }
  if (maxHeight && height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser");
  }
  ctx.drawImage(image, 0, 0, width, height);

  let currentQuality = quality;
  let blob = await canvasToWebpBlob(canvas, currentQuality);

  if (!blob) {
    throw new Error("This browser cannot encode webp images");
  }

  if (maxBytes) {
    let attempts = 0;
    while (blob && blob.size > maxBytes && attempts < 6) {
      currentQuality = Math.max(currentQuality - 0.15, 0.3);
      blob = await canvasToWebpBlob(canvas, currentQuality);
      attempts += 1;
    }

    if (!blob || blob.size > maxBytes) {
      throw new Error(
        `Could not compress this image under ${Math.round(maxBytes / 1024)}KB. Please pick a smaller or simpler image.`
      );
    }
  }

  const webpName = file.name.replace(/\.[^./\\]+$/, "") + ".webp";
  return new File([blob], webpName, { type: "image/webp" });
}
