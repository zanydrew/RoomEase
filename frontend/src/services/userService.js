import client from "../api/client";

export function getMe() {
  return client.get("/users/me");
}

export function updateMe({ full_name, phone_number, location, email }) {
  return client.patch("/users/me", {
    full_name,
    phone_number,
    location,
    email,
  });
}

const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export async function updateAvatar(file) {
  const base64 = await toBase64(file);
  return client.patch("/users/me/avatar", { image: base64 });
}

export function changePassword({ current_password, new_password }) {
  return client.patch("/users/me/password", { current_password, new_password });
}
