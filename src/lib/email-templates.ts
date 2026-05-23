interface TemplateParams {
  confirmUrl?: string;
  unsubscribeUrl?: string;
  siteUrl?: string;
  lang?: "zh" | "en";
}

const BRAND = {
  name: "AI Radar",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://ai-radar-wheat.vercel.app",
};

function button(label: string, href: string, bg = "#2563eb") {
  return `
    <a href="${href}" target="_blank" rel="noopener noreferrer"
      style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;line-height:1;border-radius:999px;padding:15px 24px;box-shadow:0 12px 32px rgba(37,99,235,.28);">
      ${label}
    </a>`;
}

function shell({
  preheader,
  title,
  intro,
  children,
  footerNote,
}: {
  preheader: string;
  title: string;
  intro: string;
  children: string;
  footerNote: string;
}) {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#050507;color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans TC','PingFang TC','Microsoft JhengHei',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050507;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:collapse;">
          <tr>
            <td style="padding:0 0 18px;">
              <div style="display:inline-flex;align-items:center;gap:10px;color:#93c5fd;font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:#38bdf8;box-shadow:0 0 18px #38bdf8;"></span>
                ${BRAND.name}
              </div>
            </td>
          </tr>

          <tr>
            <td style="border:1px solid rgba(148,163,184,.22);border-radius:28px;overflow:hidden;background:linear-gradient(145deg,#101828 0%,#0b1120 48%,#020617 100%);box-shadow:0 24px 80px rgba(0,0,0,.45);">
              <div style="padding:34px 30px 10px;background:radial-gradient(circle at 18% 0%,rgba(56,189,248,.26),transparent 34%),radial-gradient(circle at 92% 18%,rgba(59,130,246,.24),transparent 34%);">
                <div style="display:inline-block;margin-bottom:18px;padding:7px 12px;border:1px solid rgba(125,211,252,.35);border-radius:999px;background:rgba(15,23,42,.72);color:#bae6fd;font-size:12px;font-weight:700;letter-spacing:.08em;">
                  DAILY AI INTELLIGENCE
                </div>
                <h1 style="margin:0;color:#ffffff;font-size:34px;line-height:1.12;letter-spacing:-.04em;font-weight:850;">
                  ${title}
                </h1>
                <p style="margin:16px 0 0;color:#cbd5e1;font-size:16px;line-height:1.75;">
                  ${intro}
                </p>
              </div>

              <div style="padding:24px 30px 34px;">
                ${children}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 8px 0;color:#64748b;font-size:12px;line-height:1.7;text-align:center;">
              ${footerNote}<br />
              © ${new Date().getFullYear()} ${BRAND.name}. Built for curious AI builders.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const featureListZh = `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0 26px;">
    <tr>
      <td style="padding:14px 16px;border:1px solid rgba(148,163,184,.18);border-radius:18px;background:rgba(15,23,42,.64);color:#dbeafe;font-size:14px;line-height:1.75;">
        <div style="margin-bottom:8px;"><strong style="color:#ffffff;">你將會收到：</strong></div>
        <div>• 每日 AI 文章重點整理</div>
        <div>• 新 AI 工具 / GitHub trending / arXiv paper 快速掃描</div>
        <div>• 由 AI Radar 編輯角度整理的中文解讀</div>
      </td>
    </tr>
  </table>`;

const featureListEn = `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0 26px;">
    <tr>
      <td style="padding:14px 16px;border:1px solid rgba(148,163,184,.18);border-radius:18px;background:rgba(15,23,42,.64);color:#dbeafe;font-size:14px;line-height:1.75;">
        <div style="margin-bottom:8px;"><strong style="color:#ffffff;">You'll receive:</strong></div>
        <div>• Curated AI article highlights</div>
        <div>• New tools, GitHub trends, and arXiv signals</div>
        <div>• Concise analysis from AI Radar</div>
      </td>
    </tr>
  </table>`;

export function buildConfirmationHtml(params: TemplateParams): string {
  const url = params.confirmUrl || "";
  const isEn = params.lang === "en";

  return shell({
    preheader: isEn
      ? "Confirm your AI Radar subscription."
      : "確認訂閱 AI Radar，每日接收 AI 重點情報。",
    title: isEn ? "Confirm your subscription" : "確認訂閱 AI Radar",
    intro: isEn
      ? "One click and you're in. We'll send curated AI signals, tools, and trend summaries to your inbox."
      : "只差一步即可完成訂閱。確認後，我們會將每日 AI 文章、工具更新與趨勢重點送到您的收件箱。",
    children: `
      <div style="text-align:center;margin:6px 0 22px;">
        ${button(isEn ? "Confirm subscription" : "確認訂閱", url)}
      </div>
      ${isEn ? featureListEn : featureListZh}
      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.75;text-align:center;">
        ${isEn ? "If the button doesn't work, copy and paste this link into your browser:" : "如果按鈕無法開啟，請複製以下連結到瀏覽器："}<br />
        <a href="${url}" style="color:#7dd3fc;word-break:break-all;text-decoration:none;">${url}</a>
      </p>`,
    footerNote: isEn
      ? "You received this email because someone subscribed to AI Radar with this address."
      : "您收到此電郵，是因為有人使用此電子郵件地址訂閱 AI Radar。若不是您本人操作，可以直接忽略。",
  });
}

export function buildWelcomeHtml(params: TemplateParams): string {
  const unsubscribeUrl = params.unsubscribeUrl || "";
  const siteUrl = params.siteUrl || BRAND.siteUrl;
  const isEn = params.lang === "en";

  return shell({
    preheader: isEn ? "You're now subscribed to AI Radar." : "你已成功訂閱 AI Radar。",
    title: isEn ? "You're subscribed ✅" : "訂閱成功 ✅",
    intro: isEn
      ? "Welcome aboard. Your AI signal feed is now active."
      : "歡迎加入。由今日開始，您會定期收到 AI Radar 精選的 AI 動態與趨勢重點。",
    children: `
      <div style="text-align:center;margin:6px 0 22px;">
        ${button(isEn ? "Read AI Radar" : "立即查看 AI Radar", siteUrl, "#0ea5e9")}
      </div>
      ${isEn ? featureListEn : featureListZh}
      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.75;text-align:center;">
        ${isEn ? "Want to leave the list?" : "想停止接收 email？"}
        <a href="${unsubscribeUrl}" style="color:#7dd3fc;text-decoration:none;">${isEn ? "Unsubscribe here" : "按此取消訂閱"}</a>
      </p>`,
    footerNote: isEn
      ? "Thanks for reading AI Radar."
      : "感謝您訂閱 AI Radar。我們會盡量只發送真正值得閱讀的內容。",
  });
}

export function buildUnsubscribeHtml(params: TemplateParams): string {
  const url = params.unsubscribeUrl || "";
  const isEn = params.lang === "en";

  return shell({
    preheader: isEn ? "Confirm unsubscribe from AI Radar." : "確認取消訂閱 AI Radar。",
    title: isEn ? "Unsubscribe?" : "確認取消訂閱？",
    intro: isEn
      ? "Click below to stop receiving AI Radar emails."
      : "如果您確定不想再收到 AI Radar 電郵，可以按下方按鈕完成取消訂閱。",
    children: `
      <div style="text-align:center;margin:6px 0 22px;">
        ${button(isEn ? "Confirm unsubscribe" : "確認取消訂閱", url, "#dc2626")}
      </div>
      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.75;text-align:center;">
        ${isEn ? "If this was a mistake, you can ignore this email." : "如果只是誤按，可以直接忽略此電郵。"}
      </p>`,
    footerNote: isEn
      ? "You're in control of your subscription preferences."
      : "您可以隨時管理自己的訂閱狀態。",
  });
}
