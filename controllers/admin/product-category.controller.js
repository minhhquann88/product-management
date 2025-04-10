const ProductCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
const createTreeHelper = require("../../helpers/createTree");

//  ! [GET] /admin/product-categorys
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };
  // Hàm đệ quy tạo cây danh mục
  const records = await ProductCategory.find(find);
  const newRecords = createTreeHelper.createTree(records);

  res.render("admin/pages/product-category/index.pug", {
    pageTitle: "Danh mục sản phẩm",
    records: newRecords,
  });
};

// ! [GET] /admin/product-category/create
module.exports.create = async (req, res) => {
  let find = {
    deleted: false,
  };
  // Hàm đệ quy tạo cây danh mục

  const records = await ProductCategory.find(find);
  const newRecords = createTreeHelper.createTree(records);

  res.render("admin/pages/product-category/create.pug", {
    pageTitle: "Thêm mới danh mục sản phẩm",
    records: newRecords,
  });
};

//  ! [POST] /admin/product-category/create
module.exports.createPost = async (req, res) => {
  // console.log(req.file); // ! File upload lên
  // console.log(req.body); // ! Data upload lên
  if (req.body.position == "") {
    const count = await ProductCategory.countDocuments();
    req.body.position = count + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  // if (req.file) {
  //   req.body.thumbnail = `/uploads/${req.file.filename}`;
  // }
  const record = new ProductCategory(req.body);
  await record.save();
  res.redirect(`${systemConfig.prefixAdmin}/product-category`);
};
