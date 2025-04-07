// Nhúng express: framework của Node.js
const express = require("express");

const bodyParser = require("body-parser"); // Nhận đc data gửi lên res.body
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");

//Nhúng methodOverride
const methodOverride = require("method-override");

// Nhúng env
require("dotenv").config();

// Nhúng database
const database = require("./config/database");
database.connect();

// Nhúng Route
const route = require("./routes/client/index.route");
const routeAdmin = require("./routes/admin/index.route");
const systemConfig = require("./config/system");

const app = express();
const port = process.env.PORT;

app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({ extended: false }));

// Flash
app.use(cookieParser("keboard cat"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());

//Thông báo nơi chứa view, cấu hình PUG vào dự án
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// Tạo ra các biến ở toàn cục (chỉ dùng cho file .pug)
app.locals.prefixAdmin = systemConfig.prefixAdmin;

// Nhúng file tĩnh
console.log(__dirname);
app.use(express.static(`${__dirname}/public`));

// Route
route(app);
routeAdmin(app);

app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});
