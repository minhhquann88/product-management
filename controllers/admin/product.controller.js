const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");

//  ! [GET] /admin/products
module.exports.index = async (req, res) => {
  // console.log(req.query);
  // console.log(req.query.status);

  const filterStatus = filterStatusHelper(req.query);
  // console.log(filterStatus);

  let find = {
    deleted: false,
  };
  // Trạng thái
  if (req.query.status) find.status = req.query.status;
  // Tìm kiếm
  const objectSearch = searchHelper(req.query);
  // console.log(objectSearch);
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }
  // Phân trang
  const countProducts = await Product.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countProducts
  );

  const products = await Product.find(find)
    .sort({ position: "desc" })
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip); // lấy ra 4 sản phẩm
  res.render("admin/pages/products/index.pug", {
    pageTitle: "trang tổng quan",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

//  ! [GET] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  // console.log(req.params); // {status, id}
  const status = req.params.status;
  const id = req.params.id;

  await Product.updateOne({ _id: id }, { status: status });

  req.flash("success", "Cập nhật trạng thái sản phẩm thành công!"); // Tbao thành công
  res.redirect("back"); //Chuyển hướng về trang
};

//  ! [GET] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  // console.log(req.body); //* Nhấn submit thì gửi về req.body
  const type = req.body.type;
  const ids = req.body.ids.split(", ");
  switch (type) {
    case "active":
      await Product.updateMany({ _id: { $in: ids } }, { status: "active" });
      req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`); // Tbao thành công
      break;

    case "inactive":
      await Product.updateMany({ _id: { $in: ids } }, { status: "inactive" });
      req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`); // Tbao thành công

      break;
    case "delete-all":
      await Product.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date() });
      req.flash("success", `Xoá thành công ${ids.length} sản phẩm!`); // Tbao thành công

      break;
    case "change-position":
      for (const item of ids) {
        const arr = item.split("-");
        const id = arr[0];
        const position = arr[1];
        await Product.updateOne({ _id: id }, { position: position });
        req.flash("success", `Đổi vị trí thành công ${ids.length} sản phẩm!`); // Tbao thành công
      }
      break;
    default:
      break;
  }

  res.redirect("back");
};

//  ! [DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
  // console.log(req.params); // {status, id}
  const status = req.params.status;
  const id = req.params.id;

  // await Product.deleteOne({ _id: id });// Xoá vĩnh viễn
  await Product.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() }); //Xoá mềm

  res.redirect("back"); //Chuyển hướng về trang
};

//  ! [GET] /admin/products/create
module.exports.create = (req, res) => {
  res.render("admin/pages/products/create.pug", {
    pageTitle: "Thêm sản phẩm",
  });
};

//  ! [POST] /admin/products/create
module.exports.createPost = async (req, res) => {
  // console.log(req.file); // ! File upload lên
  // console.log(req.body); // ! Data upload lên

  req.body.price = parseInt(req.body.price);
  req.body.stock = parseInt(req.body.stock);
  req.body.discountPercent = parseInt(req.body.discountPercent);
  if (req.body.position == "") {
    const countProducts = await Product.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }
  const product = new Product(req.body);
  await product.save();
  res.redirect(`${systemConfig.prefixAdmin}/products`);
};

// ! [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {
  console.log(req.params.id);
  const find = {
    deleted: false,
    _id: req.params.id,
  };
  const product = await Product.findOne(find);

  res.render("admin/pages/products/edit.pug", {
    pageTitle: "Cập nhật sản phẩm",
    product: product,
  });
};

// ! [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
  console.log(req.body); // ! Data upload lên
  req.body.price = parseInt(req.body.price);
  req.body.stock = parseInt(req.body.stock);
  req.body.discountPercent = parseInt(req.body.discountPercent);
  req.body.position = parseInt(req.body.position);

  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }
  try {
    await Product.updateOne({ _id: req.params.id }, req.body);
    req.flash("success", "Cập nhật sản phẩm thành công!"); // Tbao thành công
  } catch (error) {
    req.flash("error", "Cập nhật sản phẩm thất bại!"); // Tbao thất bại
  }
  res.redirect("back");
};

// ! [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
  console.log(req.params.id);
  try {
    const find = {
      deleted: false,
      _id: req.params.id,
    };
    const product = await Product.findOne(find);

    res.render("admin/pages/products/detail.pug", {
      pageTitle: product.title,
      product: product,
    });
  } catch (error) {
    req.flash("error", "Lỗi không xác định!"); // Tbao thất bại
    res.redirect("back");
  }
};
