export const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo"));
  } catch {
    return null;
  }
};

export const saveUserInfo = (userInfo) => {
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
};

export const logoutUser = () => {
  localStorage.removeItem("userInfo");
};

export const isLoggedIn = () => {
  return Boolean(getUserInfo()?.token);
};

export const isAdmin = () => {
  return getUserInfo()?.role === "admin";
};

export const isVendor = () => {
  const user = getUserInfo();
  return user?.role === "vendor" && user?.vendorStatus === "approved";
};

export const updateStoredUserProfile = (profile) => {
  const oldUser = getUserInfo();

  if (!oldUser) {
    return;
  }

  saveUserInfo({
    ...oldUser,
    ...profile,
    token: oldUser.token,
  });
};