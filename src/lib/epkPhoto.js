// Loads an image and returns a centered crop at the given width:height ratio
// as a JPEG data URL, so a photo fills its frame without ever stretching.
export function coverPhoto(src, ratio = 1, width = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let cw = img.width;
      let ch = cw / ratio;
      if (ch > img.height) {
        ch = img.height;
        cw = ch * ratio;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.round(width / ratio);
      canvas
        .getContext("2d")
        .drawImage(img, (img.width - cw) / 2, (img.height - ch) / 2, cw, ch, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export const squarePhoto = (src, size = 600) => coverPhoto(src, 1, size);