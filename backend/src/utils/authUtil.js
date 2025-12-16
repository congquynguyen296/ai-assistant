export const getUserIdFromReq = (req) => {
  if (!req.user || !req.user.id) {
    throw new Error("User ID not found in request");
  }
  return req.user.id;
};
