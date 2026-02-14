# Dev Daily

Geliştiriciler için günlük trend özeti. GitHub Trending, Hacker News ve Dev.to verilerini tek bir dashboard'da toplar, Groq API ile günün analizini sunar.

## Ne Yapıyor?

**3 kaynaktan veri çekiyor:**
- **GitHub Trending** — Son 7 günün en çok yıldız alan repoları (GitHub Search API)
- **Hacker News** — Anlık en popüler hikayeler (Firebase API)
- **Dev.to** — Haftanın en çok etkileşim alan makaleleri (Dev.to API)

**AI ile analiz ediyor:**
- Tüm kaynaklardan gelen trendleri Groq API ile analiz ediyor
- 2-3 cümlelik günlük özet üretiyor
- "Bugün ne öğrenmeliyim?" sorusuna cevap veriyor
- AI kullanılamadığında otomatik fallback özet gösteriyor (API gerektirmez)

**Ek özellikler:**
- Dark / Light tema (sistem tercihini algılar)
- EN / TR dil desteği (tarayıcı diline göre otomatik seçim)
- 5 dakikalık client-side cache (gereksiz API çağrısı yapmaz)
- Retry mekanizması (başarısız istekler 2 kez daha denenir)
- Responsive tasarım (mobil uyumlu)
- RSS feed (UI'dan tek tıkla)
- AI özet paylaşımı (Web Share / clipboard)

## Mimari Kararlar

### Neden AI ile çeviri yapmıyoruz?

İlk tasarımda dinamik içerikler (repo adları, makale başlıkları) AI ile Türkçeye çevriliyordu. Bunu kaldırdık çünkü:

- **Gereksiz maliyet** — Her dil değişikliğinde API call = para
- **Gecikme** — Kullanıcı TR'ye geçince 3-5sn ceviri bekliyor
- **Kırılganlık** — API fail olursa çeviri de fail olur
- **Anlamsız** — Hedef kitle developer; "Kubernetes autoscaler" Türkçeye çevirmenin anlamı yok

Statik UI string'leri zaten iki dilde mevcut. Dinamik içerik (repo/makale başlıkları) İngilizce kalıyor. AI sadece summary için kullanılıyor — asıl değer orada.

### Neden API proxy (serverless function)?

AI API'yi frontend'den doğrudan çağırmak **2 kritik sorun** yaratır:
1. **Güvenlik** — API key frontend kodunda görünür, herkes çalabilir
2. **CORS** — LLM API'leri browser'dan gelen istekleri kabul etmez

Bu yüzden `/api/claude` endpoint'i var — Vercel serverless function olarak çalışır, API key backend'de kalır.

### Neden inline styles?

Tek sayfalık bir dashboard için CSS-in-JS kütüphanesi veya CSS modules eklemek over-engineering olur. Inline style'lar:
- Ek bağımlılık gerektirmez
- Component ile birlikte yaşar (colocation)
- Tema objesiyle doğrudan çalışır
- Bu ölçekte performans farkı yok

### Dosya yapısı

```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Ana orkestrasyon — veri fetch + state yönetimi
├── config.js                 # API URL'leri, limitler, dil renkleri
├── theme.jsx                 # Dark/Light tema tanımları + React Context
├── i18n.jsx                  # EN/TR çeviri string'leri + React Context
├── lib/
│   ├── http.js               # HTTP client — timeout, retry, hata sınıfları
│   └── utils.js              # Yardımcı fonksiyonlar (truncate, timeAgo, formatNumber...)
├── services/
│   ├── data.js               # GitHub, HN, Dev.to veri çekme + normalize etme
│   └── ai.js                 # AI summary — prompt, parse, fallback
├── hooks/
│   └── useAsyncData.js       # Generic async veri hook'u — cache, loading, error state
└── components/
    ├── ui.jsx                # Küçük UI parçaları — Tag, Skeleton, Error, ItemCard, MetaItem
    ├── SectionCard.jsx       # Ortak kart layout'u (başlık + badge + icon + children)
    ├── GlobalStyles.jsx      # CSS animasyonlar, scrollbar, tema geçişleri
    ├── Header.jsx            # Logo, tarih, dil/tema toggle, refresh butonu
    ├── GitHubSection.jsx     # GitHub trending kartı
    ├── HNSection.jsx         # Hacker News kartı
    ├── DevToSection.jsx      # Dev.to kartı
    └── AISummarySection.jsx  # AI özet kartı

api/
└── digest.js                 # Vercel serverless function — AI summary proxy
```

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusu (AI özet fallback ile çalışır)
npm run dev

# Production build
npm run build
```

## Deploy (Vercel)

```bash
# 1. Vercel CLI ile deploy
npx vercel

# 2. Environment variable ekle (Vercel Dashboard veya CLI)
vercel env add GROQ_API_KEY

# 3. Production deploy
npx vercel --prod
```

**Önemli:** `GROQ_API_KEY` olmadan uygulama çalışır ama AI summary yerine otomatik fallback özet gösterilir. GitHub, HN ve Dev.to verileri API key gerektirmez.

## Veri Akışı

```
Sayfa yüklenir
  ├─ GitHub API  ──→ normalize ──→ display
  ├─ HN API      ──→ normalize ──→ display     (paralel)
  ├─ Dev.to API  ──→ normalize ──→ display
  └─ Hepsi bittikten sonra:
       └─ Raw data → Groq API → AI Summary
                                   (fail olursa → fallback summary)
```

- 3 veri kaynağı **paralel** çekilir (`Promise.all`)
- Her kaynak bağımsız hata yönetimine sahip (biri fail olsa diğerleri çalışır)
- AI summary tüm verileri bekler (trend analizi için hepsine ihtiyacı var)
- Dil değişikliğinde sadece AI summary yeniden üretilir (veri tekrar çekilmez)

## Public API Endpoints

```
GET  /api/digest?lang=en&topics=ai,web
GET  /api/rss
GET  /api/archive              # date list
GET  /api/archive?date=YYYY-MM-DD
GET  /api/weekly?lang=en
GET  /api/analytics            # top clicks
POST /api/track                # { source, id, title, url }
POST /api/email                # { action: "subscribe" | "unsubscribe" | "send", ... }
GET  /api/og                   # OpenGraph image (SVG)
```

## Env Vars (Production)

- `GROQ_API_KEY` — AI summary
- `GITHUB_TOKEN` — GitHub rate limit boost (optional)
- `KV_REST_API_URL` + `KV_REST_API_TOKEN` — Vercel KV (archive + analytics + email list)
- `RESEND_API_KEY` + `RESEND_FROM` — email digest (optional)

## Teknolojiler

- **React 19** — UI
- **Vite 6** — Build tool
- **Groq API** — AI summary
- **Vercel** — Deploy + serverless functions
