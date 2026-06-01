const DEFAULT_IMAGE_BASE_URL =
  "https://mztk-bucket.s3.ap-northeast-2.amazonaws.com/";

const getImageBaseUrl = () => {
  const envBase = import.meta.env.VITE_IMAGE_BASE_URL as string | undefined;
  return envBase || DEFAULT_IMAGE_BASE_URL;
};

export const PLACEHOLDER_IMAGE_URL = "/icon/gallery.svg";

export const buildImageUrl = (value: string | null | undefined) => {
  if (!value) return PLACEHOLDER_IMAGE_URL;
  if (/^(blob:|data:|https?:\/\/|\/)/.test(value)) return value;

  const normalizedBase = getImageBaseUrl().endsWith("/")
    ? getImageBaseUrl()
    : `${getImageBaseUrl()}/`;
  const normalizedKey = value.startsWith("/") ? value.slice(1) : value;
  return `${normalizedBase}${normalizedKey}`;
};
