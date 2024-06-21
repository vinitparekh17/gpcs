export const SignUpTemplate = (user: string) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to Omnisive</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Omnisive!</h1>
        </div>
        <div class="content">
            <p>Dear ${user},</p>
            <p>We are delighted to welcome you to Omnisive. Thank you for signing up and becoming a part of our community.</p>
            <p>At Omnisive, we strive to provide AI powered services. Our mission is to make your life easy.</p>
            <p>If you have any questions or need assistance, please feel free to contact our support team at support@example.com.</p>
            <p>Once again, welcome aboard! We look forward to serving you and helping you achieve your goals.</p>
            <p>Best regards,</p>
            <p>Omnisive Team</p>
        </div>
    </div>
</body>
</html>`;

export const PasswordResetTemplate = (url: string) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Your Password</h1>
        </div>
        <div class="content">
            <p>We received a request to reset your password for your account with Omnisive. If you did not initiate this request, please ignore this email, and your password will remain unchanged.</p>
            <p>To reset your password, please click the following link:</p>
            <p><a href="${url}">Reset Password</a></p>
            <p>This link will be valid for the next 24 hours. If it expires, you can request a new password reset link from our website.</p>
            <p>If you have any questions or need further assistance, please contact our support team at support@example.com.</p>
            <p>Thank you for your understanding.</p>
            <p>Best regards,</p>
            <p>Omnisive Team</p>
        </div>
    </div>
</body>
</html>`;

export const PaymentSuccessTemplate = (
    user: string,
    amount: number
) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Successful</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        h1 {
            color: #00ff4c;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Successful</h1>
        </div>
        <div class="content">
            <p>Dear ${user},</p>
            <p>We are pleased to inform you that your payment of Rs. ${amount} has been successfully captured.</p>
            <p>If you have any questions or need assistance, please feel free to contact our support team at support@example.com.</p>
            <p>Thank you for choosing Omnisive. We look forward to serving you and helping you achieve your goals.</p>
            <p>Best regards,</p>
            <p>Omnisive Team</p>
        </div>
    </div>
</body>
</html>`;
