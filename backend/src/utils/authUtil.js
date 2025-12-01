export const getUserIdFromReq = (req) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(400).json({
      sucess: false,
      error: "Token không hợp lệ",
      statusCode: 400,
    });
  }
  return userId;
};
