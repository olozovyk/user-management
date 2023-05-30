export const getSkipForPagination = (limit: number, page: number): number => {
  return (page - 1) * limit;
};
