# Dev Daily

**[dev-daily.vercel.app](https://dev-daily.vercel.app)**

Geliştiriciler için günlük trend özeti. GitHub Trending, Hacker News ve Dev.to verilerini tek bir dashboard'da toplar, AI ile günün analizini sunar.

## Özellikler

- **GitHub Trending** — Son 7 günün en çok yıldız alan repoları
- **Hacker News** — Anlık en popüler hikayeler
- **Dev.to** — Haftanın en çok etkileşim alan makaleleri
- **AI Özet** — Trendlerin günlük analizi + "Bugün ne öğrenmeliyim?" önerisi
- **RSS Feed** — `/api/rss`
- Dark / Light tema, EN / TR dil desteği
- Responsive tasarım

## Kurulum

```bash
npm install
npm run dev
```

## Deploy (Vercel)

GitHub repo'yu Vercel'e import et, environment variable'ları ekle, deploy et.

## Environment Variables

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `GROQ_API_KEY` | Evet | AI özet için |
| `GITHUB_TOKEN` | Hayır | GitHub rate limit boost |
| `KV_REST_API_URL` | Hayır | Vercel KV (arşiv + analytics) |
| `KV_REST_API_TOKEN` | Hayır | Vercel KV |
| `RESEND_API_KEY` | Hayır | Email digest |
| `RESEND_FROM` | Hayır | Email gönderici adresi |

`GROQ_API_KEY` olmadan uygulama çalışır, AI özet yerine otomatik fallback gösterilir.

## API Endpoints

```
GET  /api/digest?lang=en&topics=ai,web
GET  /api/rss
GET  /api/archive
GET  /api/archive?date=YYYY-MM-DD
GET  /api/weekly?lang=en
GET  /api/analytics
POST /api/track
GET  /api/og
```

## Teknolojiler

React 19, Vite 6, Groq API, Vercel Serverless Functions
