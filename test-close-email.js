const nodemailer = require('nodemailer');
const hbs = require('handlebars');
const fs = require('fs');
const path = require('path');

async function sendTestEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'complaint.center.notification@gmail.com',
      pass: 'bekw fapq elma upzl',
    },
  });

  const templatePath = path.join(__dirname, 'template', 'closeTicket.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = hbs.compile(templateSource);

  const html = template({
    dataBody: {
      ticket_number: 'TK-2026030001',
      ticket_detail: 'ทดสอบการส่งอีเมลแจ้งปิดงาน - ลูกบ้านแจ้งปัญหาน้ำรั่วซึมบริเวณห้องน้ำชั้น 2 ได้ดำเนินการซ่อมแซมเรียบร้อยแล้ว',
      department_name: 'ฝ่ายซ่อมบำรุง (ทดสอบ)',
      category: 'แจ้งซ่อม',
      contact_name: 'คุณถาวร',
      public_url: 'https://css.senxgroup.com/public/ticket/test-token-example',
    },
  });

  const info = await transporter.sendMail({
    from: '"CUSTOMER COMPLAINT CENTER" <complaint.center.notification@gmail.com>',
    to: 'thavornp@senxgroup.com',
    subject: 'แจ้งปิดงาน Ticket TK-2026030001 (ทดสอบ)',
    html: html,
  });

  console.log('Email sent:', info.messageId);
}

sendTestEmail().catch(console.error);
