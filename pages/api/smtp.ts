import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // POSTリクエストのみを受け付ける場合
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 送信用のトランスポーターを作成（OutlookのSMTP設定）
    const transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // 587番ポートの場合はfalse（STARTTLSを使用するため）
        auth: {
            user: process.env.OUTLOOK_USER,
            pass: process.env.OUTLOOK_APP_PASS,
        },
        tls: {
            ciphers: 'SSLv3', // Outlookの仕様上、古い暗号化互換性が必要な場合があるため指定
        },
    });

    try {
        // メールの内容を設定
        const mailOptions = {
            from: process.env.OUTLOOK_USER, // 送信元（自分のOutlookアドレス）
            to: 'SKNewRoles@outlook.com',
            subject: 'ようこそ!',
            text: '',
            html: '<p>ようこそ！13ninstudioへ！</p>',
        };

        // メール送信を実行
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'メールが送信されました。' });
    } catch (error) {
        console.error('SMTP送信エラー:', error);
        return res.status(500).json({ success: false, message: 'メール送信に失敗しました。', error });
    }
}