const mongoose = require("mongoose");
const dotenv = require("dotenv");
const MenuItem = require("../models/MenuItem");

dotenv.config();

const menuData = [
  {
    name: "Latte",
    description: "Smooth espresso with steamed milk.",
    price: 5.5,
    category: "coffee",
    image: "/images/latte.jpg",
    isAvailable: true,
  },
  {
    name: "Cappuccino",
    description: "Rich espresso with milk foam.",
    price: 5.0,
    category: "coffee",
    image: "/images/cappuccino.jpg",
    isAvailable: true,
  },
  {
    name: "Flat White",
    description: "Velvety milk with double espresso.",
    price: 5.2,
    category: "coffee",
    image: "/images/flatwhite.jpg",
    isAvailable: true,
  },
  {
    name: "Beef Burger",
    description: "Juicy beef patty with lettuce and cheese.",
    price: 10.5,
    category: "food",
    image: "/images/burger.jpg",
    isAvailable: true,
  },
  {
    name: "French Fries",
    description: "Crispy golden fries with seasoning.",
    price: 4.5,
    category: "food",
    image: "/images/fries.jpg",
    isAvailable: true,
  },
  {
    name: "Coke",
    description: "Chilled soft drink.",
    price: 2.8,
    category: "drink",
    image: "/images/coke.jpg",
    isAvailable: true,
  },
  {
    name: "Cheesecake",
    description: "Creamy cheesecake slice.",
    price: 6.0,
    category: "dessert",
    image: "/images/cheesecake.jpg",
    isAvailable: true,
  },
];

const seedMenu = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await MenuItem.deleteMany();
    await MenuItem.insertMany(menuData);

    console.log("Menu seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedMenu();