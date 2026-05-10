# Web Workers Big Data İşleme

> **Proje Kodu:** P22 · **Zorluk:** Orta-Zor · **Puan:** 50 · **Hafta:** 3

**Öğrenci:** İLAYDA ÖZTÜRK  
**Öğrenci No:** 23080410302  
**E-posta:** ilydoztrk6@gmail.com  
**Ders:** BMU1208 Web Tabanlı Programlama — *Dr. Öğr. Üyesi Davut ARI*  
**Kurum:** Bitlis Eren Üniversitesi — Mühendislik-Mimarlık Fakültesi — Bilgisayar Mühendisliği  
**Dönem:** 2025-2026 Bahar  

---

## İçindekiler
1. [Proje Künyesi](#1-proje-künyesi)
2. [Executive Summary](#2-executive-summary)
3. [Problem ve Motivasyon](#3-problem-ve-motivasyon)
4. [Hedef Kitle ve Persona](#4-hedef-kitle-ve-persona)
5. [Ürün Gereksinimleri (PRD)](#5-ürün-gereksinimleri-prd)
6. [Piyasa ve Rekabet Analizi](#6-piyasa-ve-rekabet-analizi)
7. [Teknoloji Yığını (Tech Stack)](#7-teknoloji-yığını-tech-stack)
8. [Sistem Mimarisi](#8-sistem-mimarisi)
9. [Veri Modeli ve API Tasarımı](#9-veri-modeli-ve-api-tasarımı)
10. [UI/UX Tasarımı](#10-uiux-tasarımı)
11. [Güvenlik, Performans, Test](#11-güvenlik-performans-test)
12. [Maliyet, Gelir Modeli, GTM](#12-maliyet-gelir-modeli-gtm)

---

## 1. Proje Künyesi

| Alan | Değer |
|------|-------|
| Proje Adı | Web Workers Big Data İşleme |
| Proje Kodu | P22 |
| Slogan (1 cümle) | "Tarayıcınızın sınırlarını zorlayan, UI dondurmayan veri analizi." |
| Kategori | Data Analysis / Productivity |
| Hedef Platform | Web (Desktop & Mobile) |
| GitHub | https://github.com/ilydozttrk/Web-Workers-Big-Data-Isleme |
| Canlı Demo | https://web-workers-big-data-analyzer.vercel.app |
| Lisans | MIT |
| Başlangıç | 2026-04-15 |
| Hedef Bitiş | 2026-05-15 |
| Durum | 🟢 Launched |

### Tech Stack (Özet)
| Katman | Teknolojiler |
|--------|--------------|
| Frontend | Vanilla JavaScript (ES Modules), Vanilla CSS |
| Workers | Web Workers API |
| CSV parse | PapaParse (worker mode) |
| Chart | Chart.js 4 |
| Dışa Aktarım | xlsx (SheetJS) |
| Build | Vite 8 |
| Deployment | Vercel |

---

## 2. Executive Summary

### 2.1 Ne Yapıyoruz?
Web Workers Big Data Analyzer, devasa boyutlardaki (100.000+ satır) CSV veri setlerini doğrudan kullanıcının tarayıcısında, sayfa performansını düşürmeden ve arayüzü dondurmadan analiz etmeyi sağlayan bir web uygulamasıdır. Öğrenciler, veri analistleri ve araştırmacılar için hiçbir kurulum gerektirmeyen, %100 istemci tarafında (client-side) çalışan güvenli bir çözümdür.

### 2.2 Neden Şimdi?
Günümüzde veri setleri giderek büyüyor ve bu verileri incelemek için ağır masaüstü programları (Excel, SPSS) veya bulut tabanlı ücretli servisler gerekiyor. Tarayıcı teknolojilerinin (Web Workers, gelişmiş JS motorları) geldiği nokta, artık bu işlemleri kullanıcı bilgisayarında lokal olarak, sıfır sunucu maliyetiyle yapmaya olanak tanımaktadır.

### 2.3 Başarı Nasıl Görünüyor?
1. yıl hedefi: Aylık 10.000 tekil kullanıcının 1 milyon+ satırlık dosyalarını çökme yaşamadan analiz edebilmesi. Kullanıcı verilerinin hiçbir sunucuya aktarılmaması sayesinde %100 veri gizliliği ile güvenilir bir "hızlı analiz" aracı olarak konumlanmak.

---

## 3. Problem ve Motivasyon

### 3.1 Hangi Probleme Çözüm Getiriyoruz?
JavaScript tek thread'li (single-threaded) bir yapıya sahiptir. Tarayıcıda büyük bir dosya okunmak veya karmaşık bir matematiksel işlem yapılmak istendiğinde, "Ana Thread" (UI Thread) meşgul olur. Bu durum, kullanıcının sayfada kaydırma yapmasını, butonlara tıklamasını engeller ve sayfanın "yanıt vermiyor" diyerek çökmesine neden olur.

### 3.2 Kanıt: Problem Gerçekten Var Mı?
- Google Sheets veya Excel Online'a 50MB'lık bir CSV yüklendiğinde tarayıcı sekmesi donar veya çöker.
- Klasik web uygulamalarında veri işleme süreci backend'e (sunucuya) gönderilir. Ancak bu durum hem sunucu maliyetlerini artırır hem de KVKK/GDPR açısından veri gizliliği riskleri doğurur.

### 3.3 Mevcut Çözümler ve Eksikleri
| Mevcut çözüm | Kullanıcıya ne vadeder? | Neden yetersiz? |
|--------------|------------------------|------------------|
| Google Sheets | Tarayıcıda veri analizi | 5-10 MB üstü verilerde aşırı yavaşlama ve çökme |
| Masaüstü Excel | Güçlü analiz | Kurulum ve lisans gerektirir |
| Python (Pandas)| Sınırsız analiz gücü | Kodlama bilmeyi gerektirir, son kullanıcıya uygun değil |

### 3.4 Bizim Diferansiyasyonumuz
1. **Sıfır Sunucu Maliyeti / Yüksek Gizlilik:** Veri asla bir sunucuya yüklenmez, tarayıcı içinde (RAM) işlenir.
2. **Asenkron Çalışma:** İşlemler Web Worker'a devredildiği için kullanıcı arayüzü her zaman akıcı (60 FPS) kalır.
3. **Anında Kurulumsuz Kullanım:** Sadece bir URL ile her cihazdan erişilebilir.

---

## 4. Hedef Kitle ve Persona

### 4.1 Birincil Segment
Veri bilimi öğrencileri, araştırmacılar ve hızlı bir veri setinin "röntgenini" çekmek isteyen junior veri analistleri.

### 4.2 Persona Kartları

#### 👩‍💼 Persona 1 — "Araştırmacı Aslı"
| Alan | Değer |
|------|-------|
| Yaş / Şehir | 24, Ankara |
| Rol / Meslek | Yüksek Lisans Öğrencisi |
| Teknoloji kullanımı | Orta |
| Günlük rutini | Akademik makaleler için Kaggle'dan indirdiği verileri inceler. |
| Ana hedefi | Bir CSV dosyasının temel istatistiklerini kod yazmadan görmek. |
| Pain points | Python yazmak vakit alıyor, Excel büyük veride kilitleniyor. |

#### 👨‍🎓 Persona 2 — "Analist Burak"
| Alan | Değer |
|------|-------|
| Yaş / Şehir | 28, İstanbul |
| Rol / Meslek | Veri Analisti |
| Teknoloji kullanımı | İleri |
| Günlük rutini | SQL sorguları ile veri çeker, hızlı doğrulamalar yapar. |
| Ana hedefi | Bir raw datanın içindeki uç değerleri (min/max) ve dağılımı hızlıca kontrol etmek. |
| Pain points | Veriyi sunucuya yüklemek KVKK gereği yasak. Lokal bir çözüm arıyor. |

### 4.3 Jobs To Be Done (JTBD)
1. *"When I'm **büyük bir CSV dosyası indirdiğimde**, I want to **hızlıca dağılımını görmek**, so I can **anormal veriler olup olmadığını anlamak**."*
2. *"When I'm **gizli müşteri verisi incelerken**, I want to **dosyayı buluta yüklemeden işlemek**, so I can **veri ihlali riskinden kaçınmak**."*

---

## 5. Ürün Gereksinimleri (PRD)

### 5.1 Ana Hedef ve North Star Metric
- **Ana hedef:** Kullanıcıların büyük veri setlerini tarayıcı çökmeden analiz etmelerini sağlamak.
- **North Star Metric:** Tarayıcıda başarılı şekilde işlenen +100K satırlı CSV sayısı.

### 5.2 Kapsam
#### In-Scope (V1 — MVP)
1. Drag & Drop CSV dosya yükleme
2. Web Worker tabanlı PapaParse ile stream-parsing
3. Sayısal veri analizleri (Ortalama, Medyan, Std. Sapma, Min, Max)
4. Chart.js ile histogram çizimi
5. Arama yapma ve dinamik filtreleme
6. İşlenmiş veriyi Excel/CSV olarak dışa aktarma

#### Out-of-Scope (V1)
- DuckDB-WASM ile in-browser SQL çalıştırma (V2'ye ertelendi)
- Çoklu dosya birleştirme (JOIN işlemleri)

### 5.3 Fonksiyonel Gereksinimler (User Stories)

**FR-01 — Dosya Yükleme**
> As a **Kullanıcı**, I want to **sürükle-bırak ile dosya yüklemek**, so that **işlemimi hızlıca başlatabileyim**.
**Acceptance Criteria:** Yüklenen dosya CSV değilse hata mesajı verilmelidir.

**FR-02 — Web Worker İşleme**
> As a **Kullanıcı**, I want to **işlem sırasında UI'ın donmamasını**, so that **iptal butonuna basabileyim veya diğer alanları inceleyebileyim**.
**Acceptance Criteria:** İşlem sürerken progress bar güncellenmeli ve sayfa scroll edilebilmelidir.

**FR-03 — İstatistiklerin Görüntülenmesi**
> As a **Analist**, I want to **sütun bazlı ortalama ve medyanı görmek**, so that **veri setini anlayabileyim**.
**Acceptance Criteria:** Sadece sayısal (numeric) kolonlar istatistik hesaplamasına dahil edilmelidir.

### 5.4 Non-Functional Requirements
| Kategori | Gereksinim | Nasıl ölçülecek? |
|----------|------------|-------------------|
| Performans | LCP < 1.5s | Lighthouse |
| UX | Main Thread Blocking Time < 50ms | Chrome DevTools Performance |
| Güvenlik | Sunucu tarafı veri depolanmayacak | Network tab |

---

## 6. Piyasa ve Rekabet Analizi

### 6.1 Rakip Analizi
| Özellik | **Bizim Ürünümüz** | Google Sheets | Excel (Desktop) |
|---------|--------------------|---------|---------|
| Kurulum/Üyelik gereksiz| ✅ | ❌ (Üyelik) | ❌ (Kurulum) |
| 100K+ Satırda Donmama| ✅ (Web Worker) | ❌ (Kilitlenir)| ✅ |
| Sunucusuz / %100 Lokal | ✅ | ❌ (Bulut) | ✅ |

### 6.2 SWOT Analizi
**GÜÇLÜ YÖNLER:** Çok hızlı, hafif, güvenli, kurulumsuz.
**ZAYIF YÖNLER:** RAM miktarı kullanıcının bilgisayarına bağlıdır. (Çok eski cihazlarda 2-3 milyon satır Out of Memory verebilir).
**FIRSATLAR:** Tarayıcı tabanlı analiz (WASM) giderek popülerleşiyor.
**TEHDİTLER:** Gelişmiş BI toolları (Tableau, PowerBI) bulut tabanlı çözümlerini hızlandırabilir.

---

## 7. Teknoloji Yığını (Tech Stack)

### 7.1 Özet Tablo
| Katman | Teknoloji | Versiyon | Neden Seçildi? |
|--------|-----------|----------|-----|
| Frontend | Vanilla JS | ES6+ | Framework overhead'i (React re-render vb.) yaşamamak için. |
| Stil | Vanilla CSS | CSS3 | Native CSS değişkenleri ve Glassmorphism için. |
| Threading| Web Workers | Native | UI thread'i bloklamadan CPU-intensive işlem yapmak için. |
| Parsing | PapaParse | 5.x | Hızlıdır ve worker thread içerisinde streaming (parça parça) okuma destekler. |
| Charting | Chart.js | 4.x | Canvas tabanlı olduğu için yüksek miktarda veriyi (10+ bucket) çok hızlı çizer. |
| Export | xlsx (SheetJS)| 0.18 | Tarayıcı içinde native .xlsx formatında binary dosya oluşturabilmek için. |
| Build | Vite | 8.x | Worker dosyalarını native ESM modülü olarak paketlemede en modern araçtır. |

### 7.2 Mimari Kararı (ADR Özeti)
**ADR-001: Neden React/Vue kullanılmadı?**
Büyük veri dizileri (Array of Objects) tutulacağı için, React gibi kütüphanelerin Virtual DOM mekanizması gereksiz bellek (RAM) tüketimine ve re-render gecikmelerine yol açacaktı. Saf DOM manipülasyonu tercih edildi.

---

## 8. Sistem Mimarisi

### 8.1 Yüksek Seviye Akış (C4)

```text
┌─────────────────┐        postMessage()        ┌─────────────────┐
│                 ├────────────────────────────►│                 │
│  Main Thread    │                             │  Worker Thread  │
│  (UI / DOM)     │◄────────────────────────────┤  (Arka Plan)    │
│                 │        progress/complete    │                 │
└─────────────────┘                             └─────────────────┘
```

### 8.2 Veri Akışı
1. Kullanıcı `<input type="file">` ile dosyayı seçer.
2. Main Thread, dosyayı referans olarak (Structured Clone algoritması ile) Worker'a gönderir.
3. Worker, `Papa.parse` ile dosyayı satır satır okur (streaming). Olası bellek (RAM) taşmalarını önlemek için veri chunk'lar halinde işlenir.
4. İşlem bitince tüm istatistik dizisi tekrar Main Thread'e `postMessage` ile iletilir.

---

## 9. Veri Modeli ve API Tasarımı

*Not: Bu proje %100 istemci tarafında (client-side) çalıştığı için bir Backend API'si veya SQL Veritabanı kullanılmamıştır. Tüm veri modeli kullanıcının tarayıcı belleğinde (RAM) tutulur.*

### 9.1 İstemci Tarafı Veri Yapısı (State)
Uygulama bellekte aşağıdaki JSON benzeri yapıyı tutar:
```json
{
  "rows": [
    { "Age": 25, "BloodPressure": 120, "Outcome": 1 },
    { "Age": 45, "BloodPressure": 140, "Outcome": 0 }
  ],
  "stats": {
    "Age": { "min": 21, "max": 80, "avg": 40.5, "median": 35 },
    "BloodPressure": { "min": 60, "max": 180, "avg": 110, "median": 105 }
  }
}
```

---

## 10. UI/UX Tasarımı

### 10.1 Tasarım Dili ve Teması
- **Karanlık Tema (Dark Mode):** Uzun süreli veri analizi yapan kullanıcıların göz yorgunluğunu azaltmak için `slate-900` ve `slate-800` renk tonları kullanılmıştır.
- **Glassmorphism:** Yarı şeffaf, blur (bulanıklık) efektli paneller kullanılarak modern ve derinlikli bir görünüm elde edilmiştir.
- **Vurgu Renkleri:** Neon Yeşil (`#4ade80`) ve Cyan (`#22d3ee`) gradient'leri ana aksiyon butonlarında ve önemli verilerde kullanılarak hiyerarşi oluşturulmuştur.

### 10.2 Ergonomik Akış
Kullanıcı paneli 3 satırlık mantıksal bir iş akışına bölünmüştür:
1. **İşlem:** Process CSV / Cancel (Süreci yönetir)
2. **Filtre:** Sütun Seçimi, Min/Max değer ataması (Veriyi manipüle eder)
3. **Dışa Aktarım ve Arama:** Excel/CSV Export, Arama Kutusu (Çıktıyı alır)

---

## 11. Güvenlik, Performans, Test

### 11.1 Güvenlik
- **Sıfır Veri İhlali Riski:** Dosyalar `FileReader` ve Web Workers ile tarayıcı ortamında lokal (localhost) işlendiğinden sunucu tabanlı XSS, SQL Injection veya veri sızıntısı riskleri barındırmaz.

### 11.2 Performans Ölçümleri
Uygulama, farklı boyutlardaki veri setleri ile test edilmiştir:
- **10.000 Satır (~500 KB):** < 0.5 saniye
- **100.000 Satır (~5 MB):** ~3 saniye
- **500.000 Satır (~25 MB):** ~15 saniye

*Performans Notu:* Bu süreler zarfında Main Thread kesinlikle bloklanmamakta ve CSS animasyonları akıcı (60 FPS) bir şekilde çalışmaya devam etmektedir. İşlem iptal edildiğinde (Cancel butonu) worker anında `worker.terminate()` komutuyla sonlandırılarak bellek boşaltılmaktadır (Memory Leak önlemi).

---

## 12. Maliyet, Gelir Modeli, GTM

### 12.1 Proje Maliyeti
- **Geliştirme Maliyeti:** 0 TL (Açık kaynak kütüphaneler kullanıldı).
- **Sunucu (Hosting) Maliyeti:** 0 TL (Vercel Free Tier üzerinde sadece statik dosyalar HTML/CSS/JS barındırılıyor. Tüm işlemci gücü kullanıcının tarayıcısından sağlanır).

### 12.2 Gelir Modeli
Bu proje akademik bir bitirme projesi olduğundan açık kaynak (MIT Lisansı) olarak yayınlanmıştır. Ticari bir gelir beklentisi yoktur.

---
*Bu rapor, BMU1208 dersi proje teslim gereksinimlerine tam uygun olacak şekilde hazırlanmıştır.*
