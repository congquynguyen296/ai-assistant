export const unreadNotificationTemplate = (
  username,
  notificationCount,
  notificationLink
) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Hyra AI</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">Thông báo mới dành cho bạn</p>
        </div>
        
        <div style="padding: 40px 32px;">
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0; font-weight: 600;">Xin chào ${username},</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
                Bạn có <strong>${notificationCount} thông báo mới</strong> chưa đọc trên hệ thống Hyra AI. Đừng bỏ lỡ những cập nhật quan trọng về tiến độ học tập và các tài liệu mới nhé.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
                <div style="display: inline-block; position: relative;">
                    <img src="https://cdn-icons-png.flaticon.com/512/3602/3602145.png" alt="Notification" style="width: 80px; height: 80px; opacity: 0.8;">
                    <span style="position: absolute; top: -5px; right: -5px; background-color: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; border: 2px solid white;">${
                      notificationCount > 9 ? "9+" : notificationCount
                    }</span>
                </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 32px;">
                <a href="${
                  notificationLink || "#"
                }" style="display: inline-block; background-color: #f59e0b; color: white; text-decoration: none; padding: 12px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25); transition: transform 0.2s;">
                    Xem thông báo ngay
                </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 24px;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                    Bạn có thể tùy chỉnh cài đặt thông báo trong phần quản lý tài khoản.
                </p>
            </div>
        </div>
    </div>
`;
