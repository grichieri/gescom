// Lectura de imágenes elegidas por el usuario. Mientras no haya backend, la imagen se reduce
// y se guarda como texto ("data:image/jpeg;base64,...") junto al resto de datos en localStorage.

/** ¿La imagen se puede mostrar? Sí si va en el propio dato ("data:image/...") o es una URL del back/Cloudinary ("http(s)://..."). */
export const isUploadedImage = (url: string | null | undefined): boolean => !!url && /^(data:image\/|https?:\/\/)/.test(url);

/** Lee un archivo, lo reduce a `maxSize` píxeles de lado mayor y lo devuelve como "data:image/jpeg;...". */
export function readImage(file: File, maxSize: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
