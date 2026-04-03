const MenuItem = require("../models/MenuItem");

exports.getMenu = async (req, res) => {
  const menu = await MenuItem.find();
  res.json(menu);
};