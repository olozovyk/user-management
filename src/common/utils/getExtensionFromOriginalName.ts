export const getExtensionFromOriginalName = (originalName: string): string => {
  const arr = originalName.split('.');
  return arr[arr.length - 1];
};
