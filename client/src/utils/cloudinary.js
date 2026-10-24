// Cloudinary unsigned browser upload.
//
// Replaces the former Firebase Storage uploads. Uses XHR rather than fetch so
// the existing progress indicators keep working — fetch cannot report upload
// progress.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = () =>
  Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Upload a file and resolve with its secure CDN url.
 *
 * @param {File} file
 * @param {(percent: string) => void} [onProgress] called with "0".."100"
 * @returns {Promise<string>} secure_url of the stored image
 */
export const uploadToCloudinary = (file, onProgress) =>
  new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      reject(
        new Error(
          "Image uploads are not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET."
        )
      );
      return;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    );

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(((event.loaded / event.total) * 100).toFixed(0));
      }
    };

    xhr.onload = () => {
      let payload;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Unexpected response from the image service"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && payload.secure_url) {
        resolve(payload.secure_url);
      } else {
        reject(new Error(payload?.error?.message || "Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    xhr.send(body);
  });
