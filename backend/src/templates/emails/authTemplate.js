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
