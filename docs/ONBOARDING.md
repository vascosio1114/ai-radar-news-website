# 👋 歡迎入隊！AI Radar Onboarding 指引

呢份 doc 係寫俾**新加入嘅 dev**（即係你！）睇嘅。
跟住做大約 15 分鐘可以由零去到本機 run 到網站、可以開 branch 寫 code。

---

## 🎯 你會做嘅嘢

- 設定 dev 環境（Node、Git、SSH key）
- Clone 個 repo 落本機
- 跑 dev server，喺 browser 睇到網站
- 識點開 feature branch、commit、push、開 Pull Request

---

## ✅ Step 0：開工前 checklist

打開 Mac 終端機（Terminal / iTerm），check 你裝咗冇以下三樣：

```bash
node -v       # 應該見到 v18.x.x 或以上
npm -v        # 應該見到 9.x.x 或以上
git --version # 應該見到 git version 2.x
```

- ❌ 任何一個冇 → 落 Step 0a
- ✅ 三個都有 → 跳去 Step 1

### Step 0a：安裝 Node + Git（如果未裝）

**最快**：用 Homebrew 一次過裝晒。

```bash
# 裝 Homebrew（如果未有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 裝 Node + Git
brew install node git
```

裝完再 run 一次 `node -v && npm -v && git --version` 確認。

順便裝定 VS Code 編輯器：https://code.visualstudio.com

---

## 🔑 Step 1：SSH key 連 GitHub

GitHub 而家唔可以再用 password push code，要用 SSH key。

### 1a. 睇下你有冇 key

```bash
ls -al ~/.ssh
```

- 見到 `id_ed25519` 同 `id_ed25519.pub` → 跳去 Step 1c
- 見唔到 → 落 Step 1b

### 1b. Generate 新 key

```bash
ssh-keygen -t ed25519 -C "你嘅GitHub email"
```

連續撳 **3 次 Enter**（用 default path、唔設 passphrase）。

```bash
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

### 1c. 將 public key 加去 GitHub

```bash
pbcopy < ~/.ssh/id_ed25519.pub
echo "✅ 已 copy，去 GitHub 貼"
```

開 https://github.com/settings/ssh/new

- **Title**：`MacBook`（或乜都得）
- **Key** 欄位 → **Cmd+V** 貼上去
- 撳 **Add SSH key**（可能要再輸入 GitHub password 確認）

### 1d. Test connection

```bash
ssh -T git@github.com
```

見到 `Hi 你username! You've successfully authenticated...` 就 OK。

---

## 📥 Step 2：等 invite + Clone repo

### 2a. 等 invite

阿 Vasco 會喺 GitHub repo Settings → Collaborators 加你。
你個 GitHub email 會收到一封 invite，撳 link 入去 Accept。

或者直接開：https://github.com/vascosio1114/ai-radar/invitations

### 2b. Clone 落本機

揀個你想放 project 嘅 folder（建議 `~/dev`）：

```bash
mkdir -p ~/dev
cd ~/dev
git clone git@github.com:vascosio1114/ai-radar.git
cd ai-radar
```

---

## 📦 Step 3：安裝 + run dev server

```bash
# 安裝 dependencies（第一次大約 30 秒 – 1 分鐘）
npm install

# 起 .env.local（Supabase 暫時未連，留空都行得）
cp .env.local.example .env.local

# 起 dev server
npm run dev
```

開 http://localhost:3000

應該見到：
- 深色 Hero section（科技藍 glow）
- Trending news + Latest news grid
- AI Tools cards
- Newsletter 訂閱區

撳右上角 sun/moon icon 試下切換深淺主題。
撳 navbar 試下入 News / Tools / Tutorials / Trends 等 page。

> ⚠️ 如果 `npm install` 出錯，最常見原因係 Node 版本太舊。跑 `node -v` 確認 ≥ 18.0。

---

## 🗂️ Step 4：5 分鐘睇晒個 codebase

打開 VS Code：

```bash
code ~/dev/ai-radar
```

最重要記住嘅 folder：

```
src/app/                ← 每個 page 一個 folder
  page.tsx              ← Homepage（用 mock data）
  news/page.tsx         ← News 列表
  news/[slug]/page.tsx  ← 文章內文
  tools/page.tsx        ← AI 工具（client component，有 filter tab）
  admin/page.tsx        ← Admin dashboard（之後加 CRUD）

src/components/
  layout/  ← Navbar, Footer
  home/    ← Hero, TrendingNews, LatestNews, TrendingTools, Newsletter
  cards/   ← ArticleCard, ToolCard
  shared/  ← SectionHeader, ThemeToggle
  providers/ ← ThemeProvider

src/lib/
  site.ts          ← 網站名 + nav 設定 + tool category
  utils.ts         ← cn(), formatDate(), timeAgo()
  supabase/        ← Supabase client（server / browser 兩個版本）

src/data/mock.ts   ← 假資料（之後接通 Supabase 會 phase out）
src/types/index.ts ← TypeScript types

docs/
  ARCHITECTURE.md  ← 整個 stack 同分層解釋
  DATABASE.md      ← Supabase SQL schema + RLS（之後做 DB 嗰陣抄）
  SETUP.md         ← 完整 setup guide
  ROADMAP.md       ← 由 Phase 0 到 Phase 7 嘅計劃
```

**強烈建議**揀 30 分鐘讀晒：

1. [`README.md`](../README.md)
2. [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)
3. [`docs/ROADMAP.md`](./ROADMAP.md)

---

## 🌿 Step 5：Git Workflow（每次寫 code 跟住做）

我哋唔直接 push 落 `main`。每次寫嘢開 feature branch，做完開 PR 等對方 review。

### 開新 feature

```bash
# 同步最新 main
git checkout main
git pull

# 開新 branch（branch 名格式：feat/xxx 或 fix/xxx）
git checkout -b feat/article-detail-page
```

### 寫 code → commit → push

```bash
# 寫完 code 之後...
git status                   # 睇下改咗咩
git add .                    # stage 全部改動
git commit -m "feat: add markdown rendering"
git push -u origin feat/article-detail-page
```

> Commit message 用 [Conventional Commits](https://www.conventionalcommits.org/) format：
> - `feat:` 新功能
> - `fix:` bug fix
> - `style:` UI/CSS 改動
> - `refactor:` code 重組（無功能改動）
> - `docs:` 文件更新
> - `chore:` 雜項（package.json、config 等）

### 開 Pull Request

去 https://github.com/vascosio1114/ai-radar/pulls

1. **New pull request**
2. base: `main` ← compare: `feat/你個 branch`
3. 寫個簡短 description（做咗咩、Screenshot 如果 UI 改動）
4. **Reviewers** 揀 Vasco（或互相 review）
5. **Create pull request**

對方 Approve 之後撳 **Merge pull request** → 你 branch 入 main → Vercel 自動 deploy。

### 如果 main 有更新（rebase）

```bash
git fetch origin
git rebase origin/main
# 解 conflict（如果有）→ git add . → git rebase --continue
git push --force-with-lease
```

---

## 🚨 救命 cheat sheet

| 情況                          | 點救                                                        |
| ----------------------------- | ----------------------------------------------------------- |
| Push 之後想撤銷               | 暫時冇得直接撤，開新 commit 反操作 (`git revert HEAD`)       |
| 啱啱 commit 但未 push，想改   | `git reset --soft HEAD~1`（保留改動）                       |
| 改錯 branch，想搬 commit 去新 branch | `git stash` → `git checkout -b 新branch` → `git stash pop` |
| Pull conflict                 | 開 VS Code 解 `<<<<<<<` 嗰啲位 → `git add .` → `git commit`  |
| `npm install` 行極都 fail     | 試 `rm -rf node_modules package-lock.json && npm install`   |
| Dev server 行咗但 hot reload 死 | Ctrl+C → 再 `npm run dev`                                  |
| Tailwind class 唔生效         | check 你 class 名 spell 啱 + 重啟 dev server                 |
| TypeScript 紅線               | 跑 `npm run type-check` 睇 error，多數係 import path 錯     |

---

## 🎨 開發守則（Conventions）

- **檔名**：components 用 `PascalCase.tsx`（例如 `ArticleCard.tsx`），其他用 `kebab-case` 或 `camelCase`
- **Import**：用絕對 path `@/...`，唔好用 `../../../`
- **Server vs Client component**：預設 server，要用 hook / event handler 先加 `"use client"` 喺第一行
- **Tailwind**：盡量用 `lib/utils.ts` 嘅 `cn()` merge class，避免 conflict
- **唔好直接改 main**：永遠開 feature branch
- **唔好 commit `.env.local`**：已經 ignore 咗，但都要小心
- **新 dependency 要傾過先 add**：避免 bundle bloat

---

## 🆘 撞牆時點算

1. **先 Google + 睇 Next.js / Tailwind / Supabase 官方文檔**
2. 再睇 `docs/` folder 入面有冇答案
3. 仲係搞唔掂 → 直接喺 group / DM 拋俾 Vasco
4. 如果係 bug → 開 GitHub Issue 講清楚：
   - 你做咗咩
   - 預期結果
   - 實際結果
   - error message + screenshot

---

## 🚀 你嘅第一個 ticket（試水溫）

建議第一單嘢揀啲輕鬆嘅，例如：

- [ ] 將 `lib/site.ts` 嘅 `SITE_NAME` 由 `AI Radar` 改做我哋最後決定嘅名
- [ ] 喺 `mock.ts` 加多 2 個你覺得有用嘅 AI 工具
- [ ] 整 `/about` page（純靜態 page，講團隊 + 願景）
- [ ] 整 favicon（換走 default 個 sparkle icon）

跑流程：開 branch → 寫 → push → PR → merge。第一次行完成個 cycle 之後就 onboard 完。

歡迎入隊 🎉
