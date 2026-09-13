# JetMatch V1 — Eşleştirme ve Puanlama Spesifikasyonu

Bu doküman, JetSwap platformunda "Para Yok. Takas Var." vaadinin çekirdeğini oluşturan **JetMatch V1 Matching Engine** mimarisini, aday seçim kurallarını, puanlama ağırlıklarını, normalizasyon formülünü ve açıklanabilirlik ilkelerini tanımlar.

---

## 1. Temel Prensipler

1. **Deterministik ve Şeffaf:** Aynı veritabanı durumu verildiğinde JetMatch daima aynı adayları, aynı sıralamayı ve aynı puanları üretir. Rastgelelik veya yapay zeka halüsinasyonu içermez.
2. **Sıfır Nakit İlkesi:** Fiyat farkı, nakit dengeleme veya para değeri hesaplaması kesinlikle yapılmaz. Takas yalnızca eşyaların karşılıklı ihtiyaç uyumuna göre değerlenir.
3. **Eksik Veriye Sıfır Puan İlkesi:** Veritabanında güvenilir şekilde bulunmayan sinyaller için asla sahte puan üretilmez.
4. **Gizlilik İlkesi:** JetMatch API yanıtları karşı tarafın telefon, e-posta veya şifre bilgilerini asla içermez. İletişim bilgileri yalnızca iki taraf da takas teklifini kabul ettiğinde açığa çıkar.

---

## 2. Aday Keşif Kuralları (Candidate Discovery)

Bir eşyanın (`HAVE`), diğer kullanıcıların eşyaları arasından eşleşme adayı olabilmesi için aşağıdaki tüm koşulları sağlaması zorunludur:

- **Durum Filtresi:** Yalnızca `status = 'AVAILABLE'` olan eşyalar eşleşmeye dahil edilir. `PENDING_TRADE`, `TRADED` ve `ARCHIVED` durumundaki eşyalar doğrudan elenir.
- **Kendiyle Eşleşmeme:** Kullanıcının kendi sahip olduğu diğer eşyalar aday havuzuna dahil edilmez (`candidate.userId != source.userId`).
- **Kategori Uyumu:** Aday eşyanın kategorisi (`candidate.categoryId`), kaynak eşyanın yapılandırılmış isteklerinden (`ItemWant.categoryId`) en az biriyle eşleşmelidir. Kaynak istek `isFlexible: true` ise kategori esnekliği değerlendirilir.
- **Zorunlu Kondisyon Kriteri (Hard Constraint):** Eğer kullanıcı bir istek için `minimumCondition` (örn: `GOOD`) belirtmişse, aday eşyanın kondisyonu bu seviyeden düşükse (`FAIR`) aday doğrudan elenir.

---

## 3. Eşleşme Türleri (Match Types)

### 3.1. MUTUAL (Karşılıklı İki Yönlü Eşleşme)
- **Tanım:** Kullanıcı A, B'nin sahip olduğu eşya kategorisini istemektedir (`A.wants` ∋ `B.category`). Aynı zamanda Kullanıcı B de A'nın sahip olduğu eşya kategorisini istemektedir (`B.wants` ∋ `A.category`).
- **Örnek:**
  - Kullanıcı A: Telefon sahibi, Fotoğraf Makinesi arıyor.
  - Kullanıcı B: Fotoğraf Makinesi sahibi, Telefon arıyor.
- **Değer:** JetSwap ekosisteminin en değerli eşleşmesidir. İki tarafın da takas isteği doğrudan karşılanır.

### 3.2. ONE_WAY (Tek Yönlü Uyumlu Eşleşme)
- **Tanım:** Kullanıcı A, B'nin eşyasını istemektedir. Kullanıcı B henüz spesifik olarak A'nın ürününü belirtmemiş olsa da, isteklerinde esnek takas kabul edeceğini beyan etmiştir (`isFlexible: true`).
- **Örnek:**
  - Kullanıcı A: Telefon sahibi, Fotoğraf Makinesi arıyor.
  - Kullanıcı B: Fotoğraf Makinesi sahibi, "Benzer veya dengi tekliflere açığım" (esnek) işaretlemiş.
- **Sınır:** ONE_WAY eşleşmeler hiçbir zaman karşılıklılık taban puanını (+40) alamaz ve toplam skoru 74'ü geçemez.

---

## 4. 100 Puanlık Puanlama Modeli

### 4.1. Ağırlık Dağılımı

| Sinyal | Teorik Maksimum | V1 Uygulanan Puan | Açıklama |
| :--- | :---: | :---: | :--- |
| **Karşılıklı İstek (Reciprocal WANT)** | 40 | **40** | Yalnızca `MUTUAL` eşleşmelerde verilir. `ONE_WAY` için 0 puandır. |
| **Kategori Eşleşmesi** | 15 | **15** | Yapılandırılmış kategori uyumu sağlandığında verilir. |
| **Kondisyon Uyumu** | 5 | **5** | Aday eşya istenen minimum kondisyonu karşıladığında verilir. |
| **Konum — Şehir** | 10 | **10** | İki eşya aynı şehirde ise (+10 puan). |
| **Konum — Ülke** | — | **5** | Farklı şehirde ancak aynı ülkede ise (+5 puan). |
| **İstek Önceliği Bonusu** | — | **+1 - +5** | 1. Tercih: +5 puan, 2. Tercih: +3 puan, 3. Tercih: +1 puan. |
| **Marka Uyumu (Brand)** | 10 | **0** | V1'de `Item` modelinde bağımsız yapılandırılmış marka kolonu olmadığından sahte puan verilmez. |
| **Model Uyumu (Model)** | 10 | **0** | V1'de `Item` modelinde bağımsız model kolonu olmadığından sahte puan verilmez. |
| **Geospatial Mesafe (Distance)** | 5 | **0** | Enlem/boylam koordinatları bulunmadığından sahte mesafe puanı verilmez. |
| **JetTrust Güven Puanı** | 5 | **0** | JetTrust itibar motoru sonraki sprintte geleceğinden sahte puan verilmez. |
| **Toplam** | **100** | **75 (V1 Maksimum)** | |

---

## 5. Puan Normalizasyonu

V1'de henüz veri tabanında bulunmayan özelliklerin (mesafe, JetTrust vb.) eşleşme yüzdesini yapay olarak düşürmesini önlemek amacıyla normalizasyon uygulanır:

$$\text{rawScore} = \text{reciprocityPoints} + \text{categoryPoints} + \text{conditionPoints} + \text{locationPoints}$$

$$\text{totalEarned} = \text{rawScore} + \text{priorityBonus}$$

$$\text{normalizedScore} = \min\left(100, \operatorname{round}\left(\frac{\text{totalEarned}}{75} \times 100\right)\right)$$

### 5.1. Karşılıklılık Tavanı (Reciprocity Ceiling)
- `MUTUAL` eşleşmeler: 75 ile 100 arasında yüksek skorlar alabilir.
- `ONE_WAY` eşleşmeler: En iyi ihtimalle $15 + 5 + 10 + 5 = 35$ puan kazanır ($35 / 75 \times 100 \approx 47$ puan). En üst sınırı **74 puan** ile kilitlenmiştir.

---

## 6. Eşleşme Etiketleri (Match Labels)

Kullanıcı arayüzünde gösterilecek insan dostu etiketler skora ve eşleşme tipine göre belirlenir:

| Skor Aralığı | Eşleşme Tipi | Etiket | Anlamı |
| :---: | :---: | :--- | :--- |
| **90 – 100** | MUTUAL | **Mükemmel Takas** | İki taraf da birbirinin eşyasını istiyor, aynı şehirde ve kondisyon uyumlu. |
| **75 – 89** | MUTUAL | **Güçlü Eşleşme** | Karşılıklı takas isteği mevcut, kargo ile veya farklı şehirde takas yapılabilir. |
| **60 – 74** | MUTUAL / ONE_WAY | **Uygun Takas** | Kategori ve durum uyumlu, tek yönlü veya esnek tercih. |
| **< 60** | ONE_WAY | **Keşfet** | Alternatif veya potansiyel takas adayı. |

---

## 7. Açıklanabilirlik ve Neden Kodları (Reason Codes)

Her eşleşme nesnesi, puanın neden verildiğini açıklayan yapılandırılmış kodlar ve Türkçe mesajlar içerir:

- `MUTUAL_WANT` (+40): "İki tarafın takas tercihleri karşılıklı uyumlu (HAVE ↔ WANT)."
- `CATEGORY_MATCH` (+15): "Aradığın takas kategorisiyle tam eşleşiyor."
- `CONDITION_MATCH` (+5): "Ürün durumu belirlediğin minimum kondisyon beklentisini karşılıyor."
- `SAME_CITY` (+10): "Aynı şehirdesiniz; elden teslimat veya hızlı takas için ideal."
- `SAME_COUNTRY` (+5): "Aynı ülkedesiniz; kargo ile güvenli takas yapılabilir."
- `FLEXIBLE_WANT`: "Karşı taraf esnek ve benzer tekliflere açık."
- `PRIORITY_WANT` (+1 - +5): "Bu eşya senin öncelikli istek listendendir."

---

## 8. Deterministik Sıralama ve Tekilleştirme (Tie-Breaking)

1. **Tekilleştirme:** Bir aday eşya kaynak eşyanın birden fazla isteğine uyuyorsa, sistem en yüksek puanı alan tek bir eşleşme kaydını saklar.
2. **Sıralama Önceliği (Deterministic Tie-Breakers):**
   - 1. Kriter: `score DESC` (Puanı yüksek olan öne geçer)
   - 2. Kriter: `matchType` (`MUTUAL` daima `ONE_WAY`'in önünde yer alır)
   - 3. Kriter: `candidateItem.createdAt DESC` (Daha yeni ilanlar öne geçer)
   - 4. Kriter: `candidateItem.id ASC` (Alfabetik ID ile tam determinizm sağlanır)

---

## 9. Bilinen Kısıtlar ve Sonraki Adımlar

- **Swap Chains:** 3 veya daha fazla kullanıcı arasındaki döngüsel takas zincirleri (A -> B -> C -> A) V1 kapsamı dışındadır.
- **Geospatial Distance:** Enlem/boylam koordinatları eklendiğinde Haversine formülü ile km mesafesi hesaplanacaktır.
- **JetTrust:** Kullanıcı itibar ve güven skorları sonraki sprintte entegre edilecektir.
