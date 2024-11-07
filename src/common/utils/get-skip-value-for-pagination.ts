export const getSkipValueForPagination = (
  limit: number,
  page: number,
): number => {
  return (page - 1) * limit;
};
