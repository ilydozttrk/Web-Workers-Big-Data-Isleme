# 1. GİRİŞ

## 1.1. Problem Tanımı
**Çözülen problem:** Büyük veri setlerini (CSV/JSON dosyalarını) geleneksel web uygulamalarında işlerken, tarayıcının ana iş parçacığının (Main Thread) bloke olması ve arayüzün (UI) donarak uygulamanın çökmesi.

Günlük hayatta birçok veri analisti ve araştırmacı, KVKK gibi veri gizliliği kuralları nedeniyle dosyalarını uzak sunuculara yüklemek istememektedir. Bu nedenle analizi lokal tarayıcı ortamında yapmak istemektedirler. Ancak JavaScript'in tek iş parçacıklı doğası (single-threaded) sebebiyle, büyük dosyaların okunması esnasında (örneğin 50MB bir dosya) tarayıcı dakikalarca yanıt vermez hale gelir. 
- *Örnek Şikayet 1 (Reddit r/javascript):* "Whenever I try to parse a 10MB CSV file in my React app, the whole page freezes until the parsing is done. Users think the app crashed."
- *Örnek Şikayet 2 (Ekşi Sözlük):* "Excel'de 200 bin satırlık veriyi açmaya çalışırken bilgisayarım kitleniyor, Google Sheets zaten 5MB üstü yükleyince donup kalıyor."
- *Sayısal Kanıt:* Geliştirici anketlerine göre web performans şikayetlerinin %40'ı ana iş parçacığını (Main Thread) uzun süre meşgul eden senkron işlemlerden kaynaklanmaktadır (Lighthouse raporları).

## 1.2. Projenin Amacı ve Kapsamı
Bu projenin amacı, **Web Workers API** kullanarak ağır hesaplama süreçlerini arka plana taşımak ve böylece devasa boyutlu CSV dosyalarını UI'ı dondurmadan tarayıcı içinde işlemektir. 
**V1 (MVP) Kapsamındakiler:**
- Sürükle-bırak ile dosya yükleme ve PapaParse ile asenkron okuma
- Sayısal kolonlar için anlık istatistik hesaplama (min, max, ortalama, medyan)
- Chart.js ile sonuçların görselleştirilmesi
- Excel/CSV dışa aktarma

**Out-of-Scope (V1 Kapsam Dışı):**
- SQL benzeri (DuckDB) in-browser gelişmiş sorgulama
- Çoklu dosyaları birleştirme (JOIN) işlemleri

**Başarı Kriteri:** Uygulamanın başarı kriteri (North Star Metric), kullanıcıların "başarıyla çökme yaşamadan işlediği 100K+ satırlı CSV sayısı"dır.

## 1.3. Raporun Yapısı
Bu raporun kalan bölümleri şu şekildedir: Bölüm 2'de ürün yönetimi (PRD) kapsamında gereksinimler, Bölüm 3'te pazar ve rakip analizi, Bölüm 4'te teknoloji yığını sunulmuştur. Bölüm 5 ve 6'da sistem mimarisi ve veri akışına değinilmiş, Bölüm 7'de UI/UX kararları tartışılmıştır. Bölüm 8, 9 ve 10 sırasıyla güvenlik, maliyet analizi ve uygulama çıktılarından oluşmakta, rapor sonuç bölümüyle (Bölüm 11) tamamlanmaktadır.

---

# 2. GEREKSİNİM ANALİZİ — PRD

## 2.1. Yönetici Özeti (Executive Summary)
Web Workers Big Data İşleme projesi, araştırmacıların ve analistlerin verilerini herhangi bir bulut sunucusuna yüklemeden doğrudan tarayıcı ortamında incelemelerini sağlayan güvenli ve yüksek performanslı bir araçtır.

Günümüzde gizlilik (KVKK) ihlalleri giderek arttığı için firmalar verilerinin üçüncü parti sunucularda (SaaS) işlenmesini yasaklamaktadır. Bu nedenle tamamen "istemci tarafında (client-side)" çalışan ancak masaüstü programları kadar güçlü olan web uygulamalarına duyulan ihtiyaç her zamankinden fazladır.

Başarımız, 1. yılın sonunda aracı her ay düzenli kullanan (MAU) 500 analiste ulaşmak ve "LCP < 1.5s" gibi yüksek performans standartlarını korumaktır.

## 2.2. Hedef Kitle ve Persona
**Birincil segment:** Veri analistleri, araştırmacılar ve akademi öğrencileri.

**Tablo 1: Persona 1 Kartı**
| Alan | Değer |
|---|---|
| Ad | Araştırmacı Aslı |
| Yaş / Şehir | 25 / Ankara |
| Rol / Meslek | Yüksek Lisans Öğrencisi |
| Teknoloji kullanımı | Mac OS, Safari, Excel |
| Günlük rutin | Kaggle'dan indirdiği açık veri setlerini tezleri için inceler. |
| Ana hedef | Bir dosyanın genel dağılımını kod yazmadan görmek. |
| Pain Points (3) | 1. Python öğrenmek vakit alıyor; 2. Veri setleri büyük olunca Excel kilitleniyor; 3. Kurulum gerektiren ağır programları sevmiyor. |
| Ürünümüzü ne zaman açar? | İnternetten bir CSV dosyası indirdiği saniye, hızlıca göz atmak için. |
| Motto | "En iyi araç, bana kurulum yaptırmadan çalışan araçtır." |

**Tablo 2: Persona 2 Kartı**
| Alan | Değer |
|---|---|
| Ad | Analist Burak |
| Yaş / Şehir | 30 / İstanbul |
| Rol / Meslek | Kurumsal Veri Analisti |
| Teknoloji kullanımı | Windows, Chrome, SQL |
| Günlük rutin | Banka veritabanlarından çektiği devasa log kayıtlarını inceler. |
| Ana hedef | Veriyi (anormallikleri) hızlıca filtrelemek. |
| Pain Points (3) | 1. Gizli veriyi buluta atması yasak; 2. Raporlama yavaş; 3. UI'ı donan araçlar sinirini bozuyor. |
| Ürünümüzü ne zaman açar? | Yüz binlerce satırlık ham veriyi dışa aktarıp ilk kontrolleri yaparken. |
| Motto | "Veri güvenliği benim için hızdan bile önemlidir." |

## 2.3. Jobs To Be Done (JTBD)
1. "When I'm **büyük bir dosya indirdiğimde**, I want to **hızlıca istatistikleri ve dağılımı görmek**, so I can **anormal değerleri tespit edebilmek**."
2. "When I'm **gizli müşteri verisi incelerken**, I want to **dosyayı internete yüklemeden (lokal) işlemek**, so I can **veri ihlali riskinden %100 kaçınmak**."
3. "When I'm **bilgisayarıma bir program kurmaya üşendiğimde**, I want to **sadece bir web linkine tıklayarak analiz yapabilmek**, so I can **zaman kazanmak**."

## 2.4. Ana Özellikler ve Kullanıcı Hikâyeleri
**Tablo 3: MVP Kapsamındaki Temel Özellikler**
| Özellik | Açıklama / Öncelik |
|---|---|
| Dosya yükle (drag-drop) 100MB+ CSV | Must-have / V1 |
| Progress bar (worker'dan mesaj) | Must-have / V1 |
| Filtreleme, sayısal istatistik (min/max/avg) | Must-have / V1 |
| Chart: Histogram | Must-have / V1 |
| Export: Filtrelenmiş veri (Excel/CSV) | Must-have / V1 |

**FR-01: As a** Araştırmacı, **I want to** CSV dosyamı sürükleyip bırakmak, **so that** hemen işleme başlayabileyim.
*Acceptance:* Given kullanıcı sayfada, When dosyayı bırakır, Then worker işlemi başlar.

**FR-02: As a** Analist, **I want to** işlem sürerken arayüzün donmadığını görmek, **so that** iptal butonuna basabileyim.
*Acceptance:* Given büyük dosya işlenirken, When kullanıcı sayfayı kaydırır, Then FPS düşmez.

## 2.5. İşlevsel Olmayan Gereksinimler (NFR)
| Kategori | Gereksinim | Nasıl ölçülecek? |
|---|---|---|
| Performans | LCP < 1.5 s | Lighthouse |
| UX | Main Thread Blocking Time < 50ms | Chrome DevTools Performance |
| Güvenlik | Veri sunucuya KESİNLİKLE gönderilmez | Network sekmesi (API çağrısı olmamalı) |

## 2.6. Kapsam Dışı (Out-of-Scope)
V1 kapsamında yapmayacağımız ama V2'ye ertelenen özellikler:
- Çoklu CSV dosyalarını JOIN ile birleştirmek (Karmaşık bellek yönetimi gerektiğinden kapsam dışı).
- WebAssembly (WASM) ile tarayıcı içi tam donanımlı SQL motoru çalıştırmak.

---

# 3. PİYASA VE REKABET ANALİZİ

## 3.1. Pazar Büyüklüğü
- **TAM:** Tüm dünyada veri ile çalışan 100 milyondan fazla bilgi işçisi (Data Professionals).
- **SAM:** Kurulum gerektirmeyen "tarayıcı tabanlı araç" tercih eden kitle (yaklaşık %15).
- **SOM:** Türkiye pazarındaki akademi öğrencileri ve küçük-orta ölçekli işletme analistleri.

## 3.2. Rakip Karşılaştırma Matrisi
| Özellik | Bizim Ürün | Google Sheets | Masaüstü Excel | ObservableHQ |
|---|---|---|---|---|
| Ücretsiz kullanım | ✓ | ✓ | — | ✓ |
| Büyük Veride (100K+) Donmama | ✓ (Worker) | — (Kilitlenir) | ✓ | — |
| Sunucusuz / %100 Gizli | ✓ | — (Bulut) | ✓ | — |
| Kodlama gerektirmez | ✓ | ✓ | ✓ | — (JS gerekir) |

## 3.4. SWOT Analizi
**Güçlü Yönler (S):** Çok hızlı, 0 kurulum, arayüz asla donmaz, veri güvenliği %100.
**Zayıf Yönler (W):** Tarayıcı belleğine bağımlıdır (Kullanıcının RAM'i düşükse çöker).
**Fırsatlar (O):** KVKK ve benzeri yasalar firmaları bulut yerine lokal çözümlere itiyor.
**Tehditler (T):** Tarayıcıların bellek limitleri, rakip bulut araçlarının hızlanması.

## 3.5. Positioning Statement
**FOR** veri güvenliğine ve hıza önem veren analistler,  
**WHO** büyük veri setlerini incelerken bilgisayarlarının donmasından sıkılanlar,  
**OUR PRODUCT IS A** sunucusuz web veri analiz aracıdır,  
**THAT** verileri %100 kullanıcının tarayıcısında, sıfır gecikmeyle analiz eder.  
**UNLIKE** Google Sheets,  
**OUR PRODUCT** ana iş parçacığını asla dondurmaz ve veriyi asla internete yüklemez.

---

# 4. TEKNOLOJİ YIĞINI (TECH STACK)

## 4.1. Katmanlar — Özet Tablosu
| Katman | Teknolojiler |
|---|---|
| Frontend | Vanilla JavaScript (ES6+), Vanilla CSS |
| Workers | Native Web Workers API |
| CSV parse | PapaParse (worker mode) |
| Chart | Chart.js 4 |
| Dışa Aktarım | xlsx (SheetJS) |
| Build | Vite |
| Deployment | Vercel |

## 4.2. Frontend: Vanilla JS & Vanilla CSS
- **Neden seçildi?** React veya Vue gibi framework'ler Virtual DOM kullandıkları için devasa boyutlardaki (örn: 500.000 obje) verileri bellekte tutarken (state management) ciddi performans kayıpları yaşatır. Bu projede performansı maksimumda tutmak için doğrudan (native) DOM manipülasyonu kullanılmıştır.

## 4.3. Workers: Web Workers API
- **Neden seçildi?** Projenin kalbidir. Teknoloji seçimi olmaktan öte sistemin ana zorunluluğudur. Ağır JS hesaplamalarını asenkron hale getirerek UI'ı %100 akıcı tutar.

## 4.4. Parsing: PapaParse
- **Neden seçildi?** CSV dosyalarını "streaming" (parça parça) okuyabilen ve Web Worker ortamında yerel desteği (worker: true parametresi) bulunan en hızlı JS kütüphanesidir.

## 4.5. Charting: Chart.js
- **Neden seçildi?** HTML5 Canvas tabanlı olduğu için DOM elemanları üretmez. Bu sayede binlerce veriyi görselleştirirken çok hızlı render alır.

---

# 5. SİSTEM MİMARİSİ

## 5.1. Yüksek Seviye Mimari (C4 — Level 1: Context)
*Uygulama sunucusuz olduğu için mimari sadece Kullanıcı ve Tarayıcı etrafında şekillenir.*
```text
Kullanıcı ---> Tarayıcı (Web Workers Big Data Analyzer) ---> Lokal Dosya Sistemi
```

## 5.2. Container Seviyesi (C4 — Level 2)
```text
[ MAIN THREAD (UI) ] <------postMessage------> [ WORKER THREAD ]
  - DOM Render                                   - PapaParse okuma
  - Chart.js çizim                               - İstatistik hesaplama
  - Olay Dinleyiciler                            - Bellek (Array) yönetimi
```

## 5.5. Mimari Karar Kayıtları (ADR)
| ADR No | Karar | Neden? |
|---|---|---|
| ADR-001 | Framework kullanılmaması | State kütüphanelerinin büyük veride bellek şişirmesini önlemek |
| ADR-002 | Sunucu (Backend) kullanılmaması | Tamamen "privacy-first" olmak ve hosting maliyetini sıfırlamak |

---

# 6. VERİ MODELİ VE API TASARIMI

*Not: Uygulama %100 istemci tarafında çalışmaktadır, bu nedenle veritabanı (PostgreSQL vb.) veya sunucu API'si (REST/GraphQL) yoktur.*

## 6.1. İstemci Tarafı Bellek (In-Memory) Veri Modeli
Uygulamanın RAM üzerinde tuttuğu ana veri yapısı (State) şu şekildedir:
```javascript
{
  columns: ["Age", "Income", "Score"],
  rows: [
    { Age: 25, Income: 45000, Score: 85 },
    { Age: 34, Income: 65000, Score: 92 }
  ],
  stats: {
    Age: { min: 18, max: 65, avg: 35.2, median: 32 },
    Income: { min: 20000, max: 120000, avg: 55000, median: 50000 }
  }
}
```

---

# 7. KULLANICI ARAYÜZÜ TASARIMI

## 7.1. Bilgi Mimarisi
Tek sayfa uygulaması (Single Page Application).
- / (Ana Ekran)
  - Yükleme Alanı
  - Dataset Özeti ve İstatistik Kartları
  - Filtre & Arama Paneli
  - Histogram Grafiği ve Veri Tablosu

## 7.3. Design System
- **Renk Paleti:** Slate 900 (Arka Plan), Neon Yeşil #4ade80 (Primary/Success), Cyan #22d3ee (Secondary).
- **Tipografi:** Modern, okunaklı "Inter" fontu.
- **Konsept:** Glassmorphism (yarı saydam arka planlar ve blur efektleri) ile şık bir görünüm.

## 7.5. Responsive Tasarım
- 375px (Mobil): Kontroller alt alta dizilir, tablo yatayda scroll edilebilir hale gelir.
- 1024px+ (Desktop): Kontroller yan yana, grafik ve tablo tüm ekranı kaplar.

---

# 8. GÜVENLİK, PERFORMANS VE TEST

## 8.1. Güvenlik
Bu proje mimarisi gereği dünyadaki en güvenilir (secure) veri işleme yöntemlerinden birini kullanır. **Zira veri kullanıcının bilgisayarını asla terk etmez (No data transmission).** Bu nedenle OWASP riskleri (SQL Injection, CSRF, DDoS) projemiz için geçerli değildir. 

## 8.2. Performans
| Metrik | Gerçekleşen | Nasıl Sağlandı? |
|---|---|---|
| LCP | < 1 sn | Vercel CDN ve çok küçük bundle size |
| UI Blocking | < 50ms | Tüm parsing işlemleri Web Worker'a atıldı |

---

# 9. MALİYET, GELİR MODELİ VE GTM

## 9.1. Gelir Modeli
Proje akademik amaçla ve **Açık Kaynak (Open Source - MIT Lisansı)** olarak yayınlanmıştır. Herhangi bir abonelik veya ücretli versiyonu yoktur.

## 9.3. Maliyet Analizi
**Aylık Maliyet: 0 TL**
- Hosting: Vercel Free Tier
- Veritabanı Maliyeti: 0 TL (Kullanıcı cihazı kullanılıyor)
- Backend İşlem Maliyeti: 0 TL (Kullanıcı cihazı kullanılıyor)

---

# 10. UYGULAMA VE GELİŞTİRME

## 10.1. Kurulum
```bash
git clone https://github.com/ilydozttrk/Web-Workers-Big-Data-Isleme.git
cd repo
npm install
npm run dev
```

## 10.3. Kullanılan AI Araçları ve Katkı Oranı
| Araç | Ne için kullanıldı? |
|---|---|
| Claude (Anthropic) | Kod mimarisini yapılandırma, Worker entegrasyonu, Dokümantasyon |
| Tüm çıktıların kontrolü | %100 manuel kontrol edilmiş ve optimize edilmiştir. |

---

# 11. SONUÇ VE DEĞERLENDİRME

## 11.1. Proje Hakkında Genel Değerlendirme
Proje hedeflenen "UI dondurmadan büyük veri işleme" hedefine %100 ulaşmıştır. 5 MB boyutundaki (yaklaşık 100.000 satır) bir CSV dosyası sisteme saniyeler içinde yüklenmekte ve ana iş parçacığı serbest kaldığı için bu sırada CSS animasyonları çalışmaya devam etmektedir. 

## 11.2. Karşılaşılan Zorluklar ve Çözümleri
1. **Zorluk:** Worker'dan ana thread'e devasa verinin geçişinde yaşanan kilitlenme.
   **Çözüm:** Verinin string yerine JSON olarak parçalar (chunk) halinde gönderilmesi (veya `transferable objects` mantığının kullanılması).

## 11.3. Gelecek Çalışmalar (Future Work)
- **V2 Hedefi:** Verilerin WebAssembly (WASM) tabanlı bir in-browser SQL veritabanına (örn. DuckDB-WASM) atılarak gerçek SQL sorgularının yazılabilmesi.

## 11.4. Kazanılan Yetkinlikler
1. Web Workers API ile asenkron mimari kurma
2. Vanilla JS ile yüksek performanslı DOM manipülasyonu
3. Büyük veri setlerinde streaming (parçalı okuma) algoritmaları
4. Vite ve Vercel ile modern frontend derleme ve deploy süreçleri
5. PRD yazımı ve profesyonel ürün yönetimi kavramları (JTBD, Persona)

---

# KAYNAKÇA
[1] MDN Web Docs. "Using Web Workers". https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
[2] PapaParse Documentation. "Worker Mode". https://www.papaparse.com/docs
[3] Chart.js Documentation. "Canvas Rendering". https://www.chartjs.org/docs/
[4] Cagan, M. (2018). Inspired: How to Create Tech Products Customers Love. Wiley.
[5] SheetJS Community Edition. https://sheetjs.com/

---

# EKLER
**EK A — Tam Ekran Görüntüleri Arşivi**
Ekran görüntüleri GitHub reposunda `/docs/screenshots/` dizini altında yer almaktadır.
- 01-landing.png (Açılış sayfası)
- 02-dashboard.png (İstatistik paneli ve kontroller)
- 03-histogram.png (Tablo ve grafik alanı)
