export function renderPasswordReminderEmail(params: {
  siteUrl: string;
  actionLink: string;
}) {
  const { siteUrl, actionLink } = params;
  const logoUrl = `${siteUrl}/icons/icon-512x512.png`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recordatorio de cambio de contraseña</title>
  <style>
    body{margin:0;padding:0;background:#ffffff;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937}
    .wrap{max-width:680px;margin:0 auto;padding:0 16px}
    .card{border-radius:10px;overflow:hidden;border:1px solid #e5e7eb}
    .header{background:#3e6d56;height:180px;display:flex;align-items:center;justify-content:center}
    .logo{width:120px;height:120px;border-radius:9999px;background:#365f4b;display:flex;align-items:center;justify-content:center}
    .logo img{width:72px;height:72px}
    .content{padding:32px}
    h1{font-size:22px;line-height:28px;margin:0 0 16px 0;color:#335b47}
    p{margin:0 0 12px 0}
    .btn{display:inline-block;background:#3e6d56;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600}
    .footer{background:#f3f4f6;color:#6b7280;font-size:12px;padding:18px;text-align:center}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="header">
        <div class="logo"><img src="${logoUrl}" alt="EcoColones" /></div>
      </div>
      <div class="content">
        <h1>¡Te extrañamos en EcoColones! 🌱</h1>
        <p>Hemos notado que aún no has actualizado tu contraseña.</p>
        <p>Por tu seguridad y para disfrutar de todas las funcionalidades, por favor cambia tu contraseña desde tu perfil.</p>
        <p style="margin-top:20px;margin-bottom:24px;">
          <a href="${actionLink}" class="btn">Actualizar mi contraseña</a>
        </p>
        <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} EcoColones · Promoviendo un consumo sostenible ♻️
      </div>
    </div>
  </div>
  </body>
  </html>`;
}
