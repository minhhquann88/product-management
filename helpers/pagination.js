module.exports = (objectPagination, query, countProducts) => {
  if (query.page) {
    objectPagination.currentPage = parseInt(query.page);
  }
  // console.log(objectPagination.currentPage);
  objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;
  objectPagination.totalPage = Math.ceil(countProducts / objectPagination.limitItems);
  return objectPagination;
};
