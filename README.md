# Web Workers Big Data İşleme

> **Web Workers ile 1 milyon satır CSV'yi UI donmadan işle**

![Zorluk](https://img.shields.io/badge/Zorluk-Orta--Zor-orange)
![Puan](https://img.shields.io/badge/Puan-50-blue)
![Hafta](https://img.shields.io/badge/Hafta-3-gray)
![Lisans](https://img.shields.io/badge/License-MIT-green)
![Durum](https://img.shields.io/badge/Durum-Development-yellow)

<!-- Kodunuzu yazdıktan sonra aşağıdaki bölümleri doldurun ve ekleyin:
![CI](https://github.com/KULLANICI_ADI/final-p22-web-workers-big/actions/workflows/ci.yml/badge.svg)
![Deploy](https://img.shields.io/website?url=https://web-workers-big-data-isleme.vercel.app)
-->

## 🎯 Özet

[*1-2 paragraf: Ürün ne yapıyor, kime, hangi problemi çözüyor? Jargon yok.*]

## 🎥 Demo

🔗 **Canlı Demo:** https://web-workers-big-data-isleme.vercel.app  
👤 **Demo Hesap:** `demo@example.com` · `demo123`

![Demo GIF](repo/docs/demo.gif)

> _Not: Ekran görüntülerini ve demo GIF'ini kendi `repo/` içinde istediğiniz klasör yapısında tutabilirsiniz. Aşağıdaki görsel yolları örnektir; gerçek dosya konumlarınıza göre güncelleyin._

### Ekran Görüntüleri (Örnek yerleşim)

| Landing | Dashboard | Mobile |
|---------|-----------|--------|
| ![landing](repo/docs/screenshots/01-landing.png) | ![dashboard](repo/docs/screenshots/02-dashboard.png) | ![mobile](repo/docs/screenshots/03-mobile.png) |

## ✨ Ana Özellikler

- ✅ Dosya yükle (drag-drop) — 100 MB+ CSV
- ✅ Progress bar (worker'dan mesaj)
- ✅ Filtreleme, sıralama, gruplama (aggregation)
- ✅ Chart: histogram, scatter, line (işleme sonucu)
- ✅ Export: filtrelenmiş veri CSV/JSON
- ✅ SharedArrayBuffer ile zero-copy (opsiyonel)
- ✅ OffscreenCanvas ile worker'da chart render
- ✅ Persisted: IndexedDB ile dosya cache

## 🧰 Tech Stack

**Frontend:** `React 18 veya Vue 3`, `Tailwind CSS`  
**Workers:** `Web Workers (Comlink RPC wrapper)`  
**CSV parse:** `Papa Parse (worker mode)`  
**Chart:** `Apache ECharts veya Chart.js + OffscreenCanvas`  
**Depolama:** `IndexedDB (Dexie)`  
**Build:** `Vite (worker bundling)`  
**Deployment:** `Vercel / Cloudflare Pages`  

> Teknoloji seçimlerinin detaylı gerekçesi: [PROJE-RAPORU.md · Bölüm 7](PROJE-RAPORU.md#7-teknoloji-yığını-tech-stack)

## 🏗 Mimari

[*Mimari diyagramınızı buraya ekleyiniz — örn. `repo/docs/diagrams/container.png`*]

[Detaylı mimari ve ADR'lar →](PROJE-RAPORU.md#8-sistem-mimarisi)

## 🚀 Kurulum

### Gereksinimler

- Node.js ≥ 20
- Chrome/Edge/Firefox son sürüm

### Adım Adım

```bash
# 1) Repo'yu klonla
git clone https://github.com/KULLANICI_ADI/final-p22-web-workers-big.git
cd final-p22-web-workers-big

# 2) Environment dosyası
cp .env.example .env
# .env içindekileri doldurun (DATABASE_URL, JWT_SECRET, ...)

# 3) Bağımlılıkları yükle
pnpm install

# 4) Veritabanını hazırla (varsa)
# (Bu projede migration yok)

# 5) Çalıştır
pnpm dev
```

Proje: http://localhost:5173

## 🧪 Test

```bash
pnpm test
```

## 📁 Klasör Yapısı (bu teslimde)

```
.
├── README.md                   (bu dosya — özet, kurulum, demo)
├── PROJE-RAPORU.md             (uzun form final raporu — markdown)
├── PROJE-RAPORU-SABLON.docx    (uzun form final raporu — Word)
├── LICENSE
├── .env.example
└── repo/                       (projenizin kaynak kodu — kendi yapınız)
    └── README.md               (repo'nuzun kendi README'si)
```

> Ekran görüntüleri, diyagramlar, API dokümantasyonu gibi ek dosyaları `repo/` içinde **kendi tercih ettiğiniz alt klasör yapısında** tutabilirsiniz. Rapor belgesinde bu dosyalara referans verirsiniz.

## 🛣 Roadmap

- [x] V1 — MVP (bu teslim)
- [ ] V2 — WebAssembly ile SIMD tabanlı aggregation (3-10x hızlı)
- [ ] V3 — Multi-file join, SQL query engine in-browser (DuckDB-WASM)

## 🤝 Katkı

Bu proje **BMU1208 Web Tabanlı Programlama** dersi kapsamında **Bitlis Eren Üniversitesi** — **Bilgisayar Mühendisliği** bölümünde bir final ödevi olarak geliştirilmiştir.

Ders yürütücüsü: **Dr. Öğr. Üyesi Davut ARI**

Kod katkısı beklenmez, ancak fikir / feedback için issue açabilirsiniz.

## 📜 Lisans

MIT © 2026 **İLAYDA ÖZTÜRK** — Tam metin için [LICENSE](LICENSE).

## 🙋‍♂️ İletişim

- **Öğrenci:** İLAYDA ÖZTÜRK
- **Öğrenci No:** 23080410302
- **E-posta:** ilydoztrk6@gmail.com
- **Ders:** BMU1208 · Web Tabanlı Programlama
- **Kurum:** Bitlis Eren Üniversitesi — Mühendislik-Mimarlık Fakültesi

---

<sub>🤖 Bu projede [Claude Code](https://claude.com/claude-code) ve [Cursor](https://cursor.sh) gibi AI asistanları kullanılmıştır. Tüm mimari kararlar ve kullanım tercihleri öğrenci tarafından yapılmıştır.</sub>
