// src/utils/auth.js

// Save user object to localStorage after login
export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

// Get logged-in user object
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Remove user data (used in logout)
export const logout = () => {
  localStorage.removeItem("user");
};
