import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email, password, to, subject, text, html, buttonText, buttonUrl } = await req.json();

    if (!email || !password || !to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Gmail app passwords often come with spaces like "vaxb uznk lkqm mbah"
    const cleanPassword = password.replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: cleanPassword,
      },
    });

    // A more professional HTML template if none is provided
    const defaultHtml = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <div style="margin-bottom: 32px; text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background-color: #6D28D9; border-radius: 12px; margin-bottom: 16px;">
            <span style="color: white; font-weight: bold; font-size: 24px;">L</span>
          </div>
          <h1 style="color: #171717; font-size: 24px; font-weight: 700; margin: 0;">Lumina</h1>
        </div>
        
        <div style="margin-bottom: 32px;">
          <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
            ${text ? text.replace(/\n/g, '<br>') : 'Hello from Lumina!'}
          </p>
          
          ${buttonUrl ? `
            <div style="text-align: center; margin: 40px 0;">
              <a href="${buttonUrl}" style="background-color: #6D28D9; color: white; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; font-size: 16px;">
                ${buttonText || 'Verify Account'}
              </a>
            </div>
          ` : ''}
          
          <p style="color: #6b7280; font-size: 14px; line-height: 20px;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; pt-24; margin-top: 40px; padding-top: 24px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Lumina. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Lumina" <${email}>`,
      to,
      subject: subject || 'Lumina Notification',
      text: text || 'Notification from Lumina',
      html: html || defaultHtml,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully', 
      messageId: info.messageId 
    });
  } catch (error: any) {
    console.error('Nodemailer error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to send email' 
    }, { status: 500 });
  }
}
