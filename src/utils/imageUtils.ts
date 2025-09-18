/**
 * Resizes and compresses an image file to optimize for web display
 * @param file The original image file
 * @param maxWidth Maximum width in pixels (default: 720)
 * @param quality JPEG quality (0-1, default: 0.8)
 * @returns Promise<File> The compressed image file
 */
export const compressImage = (
  file: File, 
  maxWidth: number = 720, 
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      const { width, height } = img;
      let newWidth = width;
      let newHeight = height;

      if (width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (height * maxWidth) / width;
      }

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Create a new File object with the same name and type
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Start loading the image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compresses multiple images in parallel
 * @param files Array of image files to compress
 * @param maxWidth Maximum width in pixels (default: 720)
 * @param quality JPEG quality (0-1, default: 0.8)
 * @returns Promise<File[]> Array of compressed image files
 */
export const compressImages = async (
  files: File[], 
  maxWidth: number = 720, 
  quality: number = 0.8
): Promise<File[]> => {
  return Promise.all(
    files.map(file => compressImage(file, maxWidth, quality))
  );
};