export const otpEmailTemplate = (otp) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Hyra AI</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">Trợ lý học tập thông minh của bạn</p>
        </div>
        
        <div style="padding: 40px 32px;">
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0; font-weight: 600;">Xác thực tài khoản</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
                Cảm ơn bạn đã đăng ký tài khoản tại Hyra AI. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP dưới đây để xác thực email của bạn.
            </p>
            
            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 24px; text-align: center; margin: 32px 0;">
                <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a; display: block;">${otp}</span>
            </div>
            
            <p style="color: #64748b; font-size: 14px; text-align: center;">
                Mã này sẽ hết hạn sau <strong>5 phút</strong>.
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 24px;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                    Nếu bạn không yêu cầu, vui lòng bỏ qua email này.
                </p>
            </div>
        </div>
    </div>
`;

export const welcomeWithGoogleEmailTemplate = (
  email,
  username,
  defaultPassword
) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Hyra AI</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">Chào mừng bạn đến với Hyra AI</p>
        </div>
        
        <div style="padding: 40px 32px;">
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0; font-weight: 600;">Xin chào ${username},</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
                Chúc mừng bạn đã trở thành thành viên của cộng đồng Hyra AI. Tài khoản của bạn đã được tạo thành công thông qua liên kết Google.
            </p>
            
            <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 24px; margin: 32px 0;">
                <p style="color: #9a3412; font-size: 14px; margin-top: 0; margin-bottom: 12px; font-weight: 600;">Thông tin đăng nhập của bạn:</p>
                <div style="margin-bottom: 8px;">
                    <span style="color: #64748b; font-size: 14px;">Email:</span>
                    <span style="color: #1e293b; font-weight: 600; margin-left: 8px;">${email}</span>
                </div>
                <div>
                    <span style="color: #64748b; font-size: 14px;">Mật khẩu mặc định:</span>
                    <span style="font-family: 'Courier New', monospace; background-color: #ffffff; padding: 4px 8px; border-radius: 4px; border: 1px solid #fed7aa; color: #c2410c; font-weight: 700; margin-left: 8px;">${defaultPassword}</span>
                </div>
            </div>

            <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
                Vì lý do bảo mật, chúng tôi khuyến nghị bạn nên <strong>đổi mật khẩu ngay sau khi đăng nhập lần đầu tiên</strong>.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="http://localhost:3000/dashboard" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Đăng nhập ngay</a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 24px;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                    Đây là email tự động, vui lòng không trả lời email này.
                </p>
            </div>
        </div>
    </div>
`;

export const welcomeEmailTemplate = (email, username) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Hyra AI</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">
                Chào mừng bạn đến với Hyra AI
            </p>
        </div>
        
        <div style="padding: 40px 32px;">
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0; font-weight: 600;">
                Xin chào ${username},
            </h2>

            <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
                Chúc mừng bạn đã đăng ký tài khoản Hyra AI thành công. Tài khoản của bạn đã sẵn sàng để sử dụng.
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 32px 0;">
                <p style="color: #334155; font-size: 14px; margin-top: 0; margin-bottom: 12px; font-weight: 600;">
                    Thông tin tài khoản:
                </p>
                <div>
                    <span style="color: #64748b; font-size: 14px;">Email:</span>
                    <span style="color: #1e293b; font-weight: 600; margin-left: 8px;">
                        ${email}
                    </span>
                </div>
            </div>

            <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
                Bạn có thể đăng nhập ngay để khám phá các tính năng và dịch vụ thông minh của Hyra AI.
            </p>

            <div style="text-align: center; margin: 32px 0;">
                <a href="http://localhost:3000/dashboard" 
                   style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Đăng nhập ngay
                </a>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 24px;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                    Nếu bạn không thực hiện đăng ký tài khoản này, vui lòng bỏ qua email.
                    <br />
                    Đây là email tự động, vui lòng không trả lời email này.
                </p>
            </div>
        </div>
    </div>
`;
