export const quizReminderTemplate = (username, quizCount, quizLink) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Hyra AI</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px;">Tiếp tục hành trình học tập của bạn</p>
        </div>
        
        <div style="padding: 40px 32px;">
            <h2 style="color: #1e293b; font-size: 20px; margin-top: 0; font-weight: 600;">Xin chào ${username},</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 24px;">
                Chúng tôi nhận thấy bạn đang có <strong>${quizCount} bài quiz</strong> chưa hoàn thành. Việc ôn tập đều đặn sẽ giúp bạn ghi nhớ kiến thức lâu hơn và hiệu quả hơn.
            </p>
            
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 32px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #1e40af; font-size: 16px; margin: 0; font-style: italic;">
                    "Học tập không phải là việc làm đầy một cái xô, mà là thắp lên một ngọn lửa."
                </p>
            </div>

            <p style="color: #64748b; line-height: 1.6; margin-bottom: 32px;">
                Hãy dành chút thời gian để hoàn thành các bài tập này nhé!
            </p>
            
            <div style="text-align: center; margin-bottom: 32px;">
                <a href="${
                  quizLink || "#"
                }" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 12px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25); transition: transform 0.2s;">
                    Tiếp tục làm Quiz
                </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 24px;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                    Bạn nhận được email này vì bạn đã đăng ký nhận thông báo học tập từ Hyra AI.
                </p>
            </div>
        </div>
    </div>
`;
