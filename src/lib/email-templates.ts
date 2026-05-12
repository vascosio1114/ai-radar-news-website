interface TemplateParams {
  confirmUrl?: string;
  unsubscribeUrl?: string;
  lang?: "zh" | "en";
}

const CONFIRM_ZH = (url: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;background:#f9f9f9;">
  <div style="background:#fff;border-radius:12px;padding:32px;text-align:center;">
    <h1 style="font-size:24px;margin:0 0 16px;">確認您的訂閱</h1>
    <p style="color:#666;font-size:16px;margin:0 0 24px;">請點擊以下連結確認您的電子報訂閱：</p>
    <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">確認訂閱</a>
  </div>
</body>
</html>`;

const CONFIRM_EN = (url: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;background:#f9f9f9;">
  <div style="background:#fff;border-radius:12px;padding:32px;text-align:center;">
    <h1 style="font-size:24px;margin:0 0 16px;">Confirm Your Subscription</h1>
    <p style="color:#666;font-size:16px;margin:0 0 24px;">Click below to confirm your newsletter subscription:</p>
    <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Confirm</a>
  </div>
</body>
</html>`;

const UNSUB_ZH = (url: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;background:#f9f9f9;">
  <div style="background:#fff;border-radius:12px;padding:32px;text-align:center;">
    <h1 style="font-size:24px;margin:0 0 16px;">取消訂閱</h1>
    <p style="color:#666;font-size:16px;margin:0 0 24px;">您已取消訂閱。我們很遺憾看到您離開。</p>
    <a href="${url}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">確認取消訂閱</a>
  </div>
</body>
</html>`;

const UNSUB_EN = (url: string) => `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;background:#f9f9f9;">
  <div style="background:#fff;border-radius:12px;padding:32px;text-align:center;">
    <h1 style="font-size:24px;margin:0 0 16px;">Unsubscribe</h1>
    <p style="color:#666;font-size:16px;margin:0 0 24px;">You've been unsubscribed. Sorry to see you go.</p>
    <a href="${url}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Confirm Unsubscribe</a>
  </div>
</body>
</html>`;

export function buildConfirmationHtml(params: TemplateParams): string {
  const url = params.confirmUrl || "";
  return params.lang === "en" ? CONFIRM_EN(url) : CONFIRM_ZH(url);
}

export function buildUnsubscribeHtml(params: TemplateParams): string {
  const url = params.unsubscribeUrl || "";
  return params.lang === "en" ? UNSUB_EN(url) : UNSUB_ZH(url);
}