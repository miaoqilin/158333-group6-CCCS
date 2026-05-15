export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
};

export const saveCart = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

export const clearCart = () => {
  localStorage.removeItem("cart");
};

export const addToCart = (item, specialInstructions = "") => {
  const cart = getCart();

  const exist = cart.find(
    (i) =>
      i._id === item._id &&
      (i.specialInstructions || "") === (specialInstructions || "")
  );

  if (exist) {
    exist.qty += 1;
  } else {
    cart.push({
      _id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      dietaryCategory: item.dietaryCategory,
      itemType: item.itemType,
      packageItems: item.packageItems || [],
      vendor: item.vendor,
      specialInstructions,
      qty: 1,
    });
  }

  saveCart(cart);
};

export const updateCartItemQty = (id, specialInstructions, qty) => {
  const cart = getCart();

  const updated = cart.map((item) => {
    if (
      item._id === id &&
      (item.specialInstructions || "") === (specialInstructions || "")
    ) {
      return {
        ...item,
        qty: Math.max(1, qty),
      };
    }

    return item;
  });

  saveCart(updated);
  return updated;
};

export const removeCartItem = (id, specialInstructions) => {
  const cart = getCart();

  const updated = cart.filter(
    (item) =>
      !(
        item._id === id &&
        (item.specialInstructions || "") === (specialInstructions || "")
      )
  );

  saveCart(updated);
  return updated;
};