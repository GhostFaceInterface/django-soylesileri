# 🚗 Django Otomobil İlanları Projesi - Kapsamlı Eğitim Yol Haritası

## 📋 Proje Genel Bakış

Bu proje, Django framework'ü kullanarak otomobil ilanlarının listelendiği, kullanıcıların kayıt olabileceği, mesajlaşabileceği ve ilan yönetimi yapabileceği tam kapsamlı bir web uygulamasıdır.

**Proje Hedefi:** Django'yu baştan sona öğrenmek için kapsamlı bir backend geliştirmek, sonrasında modern frontend teknolojileri ile tamamlamak.

---

## ✅ TAMAMLANAN KISMLAR (Backend)

### 1. 🏗️ **Proje Yapısı ve Temel Kurulum**
- ✅ Django projesi oluşturuldu (`oto_ilan`)
- ✅ Sanal ortam (virtual environment) kuruldu
- ✅ Gerekli paketler yüklendi (`requirements.txt`)
- ✅ Temel ayarlar yapılandırıldı (`settings.py`)
- ✅ Ana URL yapısı oluşturuldu
- ✅ Media dosya yönetimi ayarlandı
- ✅ Loglama sistemi konfigüre edildi

### 2. 👤 **Kullanıcı Yönetimi (users app)**
- ✅ Özel User modeli oluşturuldu (`AbstractUser`)
- ✅ Kullanıcı serializer'ları yazıldı
- ✅ JWT token authentication entegre edildi
- ✅ Kullanıcı ViewSet'leri oluşturuldu
- ✅ Hoş geldin e-postası sistemi (`users/utils.py`)
- ✅ Kullanıcı kayıt loglama sistemi (signals)
- ✅ Admin paneli konfigürasyonu

**Öğrenilen Konular:**
- Django `AbstractUser` kullanımı
- JWT token authentication
- Django signals (`post_save`)
- E-posta gönderme sistemi
- Custom user modeli oluşturma

### 3. 🚙 **Araç Modelleri (cars app)**
- ✅ Hiyerarşik araç yapısı: `CarBrand` → `CarModel` → `CarVariant` → `CarTrim`
- ✅ Ana `Car` modeli (tüm özellikleri içeren)
- ✅ Serializer'lar ve validasyonlar
- ✅ API endpoint'leri (sadece okuma)
- ✅ Admin paneli entegrasyonu
- ✅ `related_name` kullanımı

**Öğrenilen Konular:**
- Django model relationships (`ForeignKey`)
- `related_name` parametresi
- Model `Meta` options
- `__str__` metodları
- Django choices field

### 4. 📍 **Lokasyon Yönetimi (locations app)**
- ✅ `City` modeli
- ✅ API endpoint'leri
- ✅ Serializer'lar
- ✅ Admin panel konfigürasyonu

### 5. 📝 **İlan Sistemi (listings app)**
- ✅ `Listing` modeli (araç ilanları)
- ✅ `ListingImage` modeli (çoklu resim desteği)
- ✅ Filtreleme, arama ve sıralama (`django-filter`)
- ✅ Soft delete implementasyonu
- ✅ İzin kontrolleri (`IsOwnerOrReadOnly`)
- ✅ Listing create/update loglama (signals)
- ✅ Admin paneli özelleştirmeleri
- ✅ Resim yükleme sistemi

**Öğrenilen Konular:**
- Django filtreleme sistemi
- Soft delete pattern
- Custom permissions
- File upload handling
- Django signals (`pre_save`, `post_save`, `post_delete`)

### 6. 💬 **Mesajlaşma Sistemi (private_messages app)**
- ✅ `Message` modeli
- ✅ Mesaj gönderme/alma API'leri
- ✅ Kullanıcıya özel mesaj filtreleme
- ✅ Mesaj loglama sistemi (signals)
- ✅ Serializer'lar
- ✅ Django ORM `Q` queries (`|` operatörü)

**Öğrenilen Konular:**
- Django `Q` objects
- Complex querysets
- `settings.AUTH_USER_MODEL` kullanımı

### 7. ⚙️ **Core Sistem (core app)**
- ✅ Rate limiting (throttling) sistemi
- ✅ Özel throttle sınıfları
- ✅ Login, mesaj ve ilan oluşturma limitleri

**Öğrenilen Konular:**
- Django REST Framework throttling
- Custom throttle classes

### 8. 📊 **Loglama ve İzleme**
- ✅ Kapsamlı loglama sistemi
- ✅ Dosya ve konsol loglama
- ✅ Signal tabanlı aktivite takibi
- ✅ Custom logger konfigürasyonu

**Öğrenilen Konular:**
- Python logging module
- Django logging configuration
- Log formatters ve handlers

### 9. 🔧 **Altyapı ve Güvenlik**
- ✅ REST Framework konfigürasyonu
- ✅ JWT Authentication
- ✅ Pagination sistemi
- ✅ CORS ayarları (hazır)
- ✅ Django admin özelleştirmeleri

---

## ❌ BACKEND'DE DÜZELTILMESI GEREKEN HATALAR
### 1. ✅ **private_messages/views.py Düzeltildi**
- [x] "receiver" yazım hatası düzeltildi

### 2. ⚠️ **settings.py Eksik Ayar**
- [ ] `AUTH_USER_MODEL` tanımı eksik
  ```python
  # settings.py'ye eklenecek:
  AUTH_USER_MODEL = 'users.User'
  ```

---

## 🔄 BACKEND TAMAMLAMA GÖREVLERİ

### **Faz 1: Hata Düzeltmeleri ve Temel Tamamlama (1 Hafta)**

### ✅ **Tüm Kritik Hatalar Düzeltildi!**
- [x] private_messages/views.py receiver hatası ✅
- [x] settings.py AUTH_USER_MODEL zaten mevcut ✅
- [x] cars/models.py - Kod doğru ✅

#### 1.2 API Testleri ve Doğrulama
- [ ] Tüm endpoint'leri Postman ile test et
- [ ] Authentication flow'unu test et
- [ ] Error handling'i test et

#### 1.3 Mesajlaşma Sistemi Geliştirme
```python
# Eklenecek endpoint'ler:
- [ ] GET /api/messages/conversations/ - Konuşma listesi
- [ ] GET /api/messages/conversation-with/?user_id=X - Belirli kullanıcıyla konuşma
- [ ] POST /api/messages/mark-as-read/ - Mesajları okundu işaretle
- [ ] GET /api/messages/unread-count/ - Okunmamış mesaj sayısı
```

### **Faz 2: Gelişmiş Özellikler (2 Hafta)**

#### 2.1 Gelişmiş Filtreleme ve Arama ✅
```python
# listings/filters.py geliştirmeleri - TAMAMLANDI:
- [x] Fiyat aralığı filtreleme (min_price, max_price) ✅
- [x] Kilometre aralığı filtreleme ✅
- [x] Yıl aralığı filtreleme ✅
- [x] Yakıt tipi filtreleme (MultipleChoiceFilter) ✅
- [x] Vites tipi filtreleme (MultipleChoiceFilter) ✅
- [x] Renk filtreleme (icontains) ✅
- [x] Motor gücü aralığı filtreleme ✅
- [x] Şehir filtreleme (ModelMultipleChoiceFilter) ✅
- [x] Marka filtreleme (ModelMultipleChoiceFilter) ✅
- [x] Başlık ve açıklama arama (icontains) ✅
- [x] Esnek sıralama sistemi (OrderingFilter) ✅
- [x] CSVWidget kullanımı (çoklu seçim için) ✅
```

**Öğrenilen Konular:**
- ✅ Django-filter kütüphanesi ve FilterSet kullanımı
- ✅ NumberFilter, CharFilter, MultipleChoiceFilter türleri
- ✅ lookup_expr parametreleri (gte, lte, icontains, contains)
- ✅ ModelMultipleChoiceFilter ve CSVWidget
- ✅ OrderingFilter ile dinamik sıralama
- ✅ Field_name ile ilişkili modellere erişim (__)

#### 2.2 Medya Yönetimi Geliştirmeleri ✅
```python
# listings/utils.py ve models.py geliştirmeleri - TAMAMLANDI:
- [x] 16:9 Aspect Ratio Sistemi (1920x1080, 1280x720, 854x480, 320x180) ✅
- [x] Resim boyutlandırma sistemi (Pillow + fit_to_16_9 fonksiyonu) ✅
- [x] Otomatik thumbnail oluşturma (4 farklı 16:9 boyutu) ✅
- [x] Dosya format validasyonu (JPEG, PNG, WebP, JPG) ✅
- [x] Maksimum dosya boyutu kontrolü (5MB) ✅
- [x] Aspect ratio korunarak 16:9 çerçeveye sığdırma ✅
- [x] Letterbox/Pillarbox sistemi (siyah şeritler) ✅
- [x] Çoklu resim yükleme API endpoint'i ✅
- [x] Resim sıralama ve öncelik sistemi ✅
- [x] Ana resim belirleme sistemi ✅
- [x] Benzersiz dosya adı oluşturma ✅
- [x] Dosya boyutu ve dimension tracking ✅
- [x] Otomatik dosya temizleme (django-cleanup) ✅
```

**Öğrenilen Konular:**
- ✅ Python Pillow library ve gelişmiş resim işleme
- ✅ Aspect ratio hesaplamaları ve letterbox/pillarbox tekniği
- ✅ Django file upload handling ve validation
- ✅ Custom model save() metodları ve signal sistemleri
- ✅ SerializerMethodField kullanımı
- ✅ DRF custom actions (@action decorator)
- ✅ Bulk operations ve dosya yönetimi
- ✅ UUID ile unique filename generation
- ✅ 16:9 format standardizasyonu

#### 2.3 Güvenlik ve Validasyon
```python
# Güvenlik geliştirmeleri:
- [ ] E-posta doğrulama sistemi
- [ ] Şifre reset fonksiyonality
- [ ] API rate limiting detaylandırma
- [ ] File upload güvenlik kontrolleri
- [ ] Input sanitization
- [ ] CSRF protection kontrolü
```

### **Faz 3: İleri Özellikler (2 Hafta)**

#### 3.1 Bildirim Sistemi
```python
# Notification system:
- [ ] Notification modeli oluştur
- [ ] E-posta bildirimleri (Celery + Redis)
- [ ] İlan onay sistemi
- [ ] Mesaj bildirimleri
- [ ] Sistem duyuruları
- [ ] Bildirim tercih yönetimi
```

#### 3.2 Favoriler ve Takip Sistemi
```python
# Yeni özellikler:
- [ ] Favorite model (user + listing)
- [ ] Favori ekleme/çıkarma API'si
- [ ] Kullanıcı favori listesi
- [ ] Son görüntülenen ilanlar
- [ ] İlan view counter
```

#### 3.3 Analitik ve İstatistikler
```python
# Analytics system:
- [ ] İlan görüntülenme tracker
- [ ] Kullanıcı aktivite istatistikleri
- [ ] Popüler araç markaları analizi
- [ ] Dashboard API'leri
- [ ] Satış performance metrics
```

### **Faz 4: Optimizasyon ve Test (1 Hafta)**

#### 4.1 Performance Optimizasyonu
```python
# Performance improvements:
- [ ] Database query optimizasyonu
- [ ] select_related ve prefetch_related kullanımı
- [ ] Database indexing
- [ ] Caching implementasyonu (Redis)
- [ ] API response time optimization
```

#### 4.2 Test Yazma
```python
# Test coverage:
- [ ] Model testleri
- [ ] API endpoint testleri
- [ ] Authentication testleri
- [ ] Permission testleri
- [ ] Signal testleri
- [ ] Integration testleri
```

#### 4.3 Dokümantasyon
```python
# Documentation:
- [ ] API dokümantasyonu (Swagger/OpenAPI)
- [ ] Kod dokümantasyonu (docstrings)
- [ ] README.md güncelleme
- [ ] Deployment guide
```

---

## 🖥️ FRONTEND PLANI (Backend Tamamlandıktan Sonra)

### **Teknoloji Stack'i**
- **Framework**: React.js 18+ with TypeScript
- **Meta Framework**: Next.js 14+ (SSR, routing, optimization)
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Authentication**: JWT with refresh tokens

### **Frontend Geliştirme Aşamaları**

#### **Faz 1: Proje Kurulumu (1 Hafta)**
```bash
# Kurulum adımları:
- [ ] Next.js projesi oluştur
- [ ] TypeScript konfigürasyonu
- [ ] Tailwind CSS kurulumu
- [ ] ESLint ve Prettier ayarları
- [ ] Git hooks kurulumu (Husky)
- [ ] Folder structure oluşturma
```

#### **Faz 2: Authentication ve Layout (1 Hafta)**
```typescript
// Geliştirilecek components:
- [ ] Login/Register formları
- [ ] JWT token management
- [ ] Protected routes
- [ ] Layout components (Header, Footer, Sidebar)
- [ ] Navigation menu
- [ ] User profile dropdown
```

#### **Faz 3: İlan Sistemi UI (2 Hafta)**
```typescript
// İlan sayfaları:
- [ ] İlan listeleme sayfası
- [ ] İlan detay sayfası
- [ ] İlan oluşturma/düzenleme formları
- [ ] Resim yükleme komponenti
- [ ] Filtreleme sidebar'ı
- [ ] Pagination komponenti
- [ ] Search bar
```

#### **Faz 4: Mesajlaşma Sistemi (1,5 Hafta)**
```typescript
// Mesajlaşma UI:
- [ ] Mesaj listesi (conversation list)
- [ ] Chat interface
- [ ] Real-time messaging (WebSocket)
- [ ] Mesaj gönderme formu
- [ ] Unread message indicators
- [ ] Message status indicators
```

#### **Faz 5: Kullanıcı Paneli (1 Hafta)**
```typescript
// User dashboard:
- [ ] Kullanıcı profil sayfası
- [ ] İlan yönetimi (CRUD)
- [ ] Favori ilanlar
- [ ] Mesaj geçmişi
- [ ] Hesap ayarları
- [ ] Bildirim ayarları
```

#### **Faz 6: Responsive ve Optimizasyon (1 Hafta)**
```typescript
// Final touches:
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Error boundaries
- [ ] Loading states
- [ ] Image optimization
```

---

## 📚 ÖĞRENİM HEDEFLERİ ve KONULAR

### **Django Backend Konuları**

#### **Temel Seviye** ✅
- [x] Django proje yapısı ve apps
- [x] Models ve database relationships
- [x] Django ORM queries
- [x] Views (Function-based vs Class-based)
- [x] URL routing
- [x] Django admin customization

#### **İleri Seviye** 🔄
- [x] Django REST Framework
- [x] Authentication & Permissions
- [x] Serializers ve validation
- [x] Custom user models
- [x] Signal system
- [ ] Caching strategies
- [ ] Database optimization
- [ ] Security best practices

#### **Uzman Seviye** ⏳
- [ ] Celery & Redis (async tasks)
- [ ] WebSocket integration
- [ ] Advanced testing
- [ ] Performance profiling
- [ ] Production deployment
- [ ] Monitoring ve logging

### **Frontend Konuları** ⏳

#### **React & TypeScript**
- [ ] Component design patterns
- [ ] State management
- [ ] API integration
- [ ] Form handling
- [ ] Routing
- [ ] Authentication flow

#### **Next.js**
- [ ] SSR vs SSG
- [ ] API routes
- [ ] Image optimization
- [ ] SEO optimization
- [ ] Performance optimization

---

## 🛠️ SONRAKI ADIMLAR

### **Bu Hafta (Hafta 1):**
1. ✅ PROJE_YOL_HARITASI.md oluştur
2. [ ] Critical bug'ları düzelt:
   - private_messages/views.py receiver hatası
   - cars/models.py CarVariant field düzeltmesi
   - settings.py AUTH_USER_MODEL ekleme
3. [ ] API'leri Postman ile test et
4. [ ] Mesajlaşma endpoint'lerini genişlet

### **Gelecek Hafta (Hafta 2):**
1. [ ] Gelişmiş filtreleme sistemi implementasyonu
2. [ ] Medya yönetimi optimize et
3. [ ] Güvenlik validasyonları ekle
4. [ ] Unit testler yazmaya başla

### **3. Hafta:**
1. [ ] Bildirim sistemi geliştir
2. [ ] Favoriler sistemi ekle
3. [ ] Performance optimizasyonları
4. [ ] API dokümantasyonu hazırla

---

## 💡 ÖĞRENİM NOTLARI

### **Python/Django Syntax Açıklamaları**

#### **Django Signals:**
```python
@receiver(post_save, sender=User)
def user_created_handler(sender, instance, created, **kwargs):
    """
    Açıklama:
    - @receiver: Decorator, bu fonksiyonun signal listener olduğunu belirtir
    - post_save: Signal tipi, model kaydedildikten sonra çalışır
    - sender=User: Sadece User modelindeki değişiklikleri dinle
    - instance: Kaydedilen model instance'ı
    - created: Boolean, yeni oluşturuldu mu?
    - **kwargs: Ek parametreler
    """
    if created:
        print(f"Yeni kullanıcı: {instance.email}")
```

#### **Django ORM Queries:**
```python
# Q objects kullanımı
from django.db.models import Q

# OR sorgusu
Message.objects.filter(
    Q(sender=user) | Q(receiver=user)
)

# AND sorgusu
Car.objects.filter(
    Q(brand__name="Toyota") & Q(year__gte=2020)
)

# NOT sorgusu
Car.objects.filter(
    ~Q(fuel_type="electric")
)
```

#### **Related Name Kullanımı:**
```python
class CarBrand(models.Model):
    name = models.CharField(max_length=100)

class CarModel(models.Model):
    brand = models.ForeignKey(CarBrand, related_name='models')
    name = models.CharField(max_length=100)

# Kullanım:
toyota = CarBrand.objects.get(name='Toyota')
toyota_models = toyota.models.all()  # related_name sayesinde
```

---

## 📞 KAYNAKLAR ve YARDIM

### **Dokümantasyon:**
- 📖 [Django Documentation](https://docs.djangoproject.com/)
- 🔗 [Django REST Framework](https://www.django-rest-framework.org/)
- 🎯 [Django Best Practices](https://django-best-practices.readthedocs.io/)

### **Önerilen Kitaplar:**
- 📚 "Two Scoops of Django" - Django best practices
- 📚 "Django for Professionals" - Production-ready Django
- 📚 "High Performance Django" - Optimization techniques

### **Faydalı Araçlar:**
- 🔧 Postman - API testing
- 🐘 pgAdmin - PostgreSQL management
- 📊 Django Debug Toolbar - Performance monitoring
- 🧪 pytest - Advanced testing

---

## ✅ GÜNCELLEMELER

- **11 Haziran 2025**: Proje yol haritası oluşturuldu
- **11 Haziran 2025**: Mevcut durumu analiz edildi
- **11 Haziran 2025**: Backend tamamlama planı detaylandırıldı
- **13 Haziran 2025**: Faz 2.1 - Gelişmiş Filtreleme ve Arama sistemi tamamlandı ✅
- **16 Haziran 2025**: Faz 2.2 - 16:9 Medya Yönetimi sistemi tamamlandı ✅

---

*Bu doküman proje ilerledikçe güncellenecek ve genişletilecektir.*

**Son güncelleme:** 16 Haziran 2025  
**Proje durumu:** Backend %80 tamamlandı  
**Sonraki milestone:** Faz 2.3 - Güvenlik ve Validasyon Sistemi
