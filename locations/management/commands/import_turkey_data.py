"""
Django Management Command: TürkiyeAPI'den Konum Verilerini İmport Et

Bu komut şu işlemleri yapar:
1. turkiyeapi.dev'den tüm illeri çeker ve Province modeline kaydeder
2. Her il için tüm ilçeleri çeker ve District modeline kaydeder  
3. Her ilçe için tüm mahalleleri çeker ve Neighborhood modeline kaydeder

Kullanım:
    python manage.py import_turkey_data
    
Özellikler:
- Rate limiting (API'yi overload etmemek için)
- Progress tracking (hangi aşamada olduğumuz)
- Error handling ve retry logic
- Duplicate prevention (zaten varsa skip)
- Resume capability (yarıda kalırsa devam et)
"""

import requests
import time
from django.core.management.base import BaseCommand
from django.db import transaction
from locations.models import Province, District, Neighborhood
import logging

# Logger ayarla
logger = logging.getLogger('import_turkey_data')
logger.setLevel(logging.INFO)

# Console handler ekle
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)


class Command(BaseCommand):
    help = 'TürkiyeAPI\'den il, ilçe ve mahalle verilerini import eder'
    
    # API ayarları
    BASE_URL = 'https://turkiyeapi.dev'
    RATE_LIMIT_DELAY = 0.5  # Saniye cinsinden request'ler arası bekleme
    MAX_RETRIES = 3
    TIMEOUT = 30  # Request timeout
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--provinces-only',
            action='store_true',
            help='Sadece illeri import et (test için)',
        )
        parser.add_argument(
            '--districts-only',
            action='store_true',
            help='Sadece ilçeleri import et (iller zaten var olmalı)',
        )
        parser.add_argument(
            '--neighborhoods-only',
            action='store_true',
            help='Sadece mahalleleri import et (iller ve ilçeler zaten var olmalı)',
        )
        parser.add_argument(
            '--province-id',
            type=int,
            help='Sadece belirli bir ilin verilerini import et',
        )
        parser.add_argument(
            '--district-id',
            type=int,
            help='Sadece belirli bir ilçenin mahallelerini import et',
        )
    
    def handle(self, *args, **options):
        """Ana command handler"""
        self.stdout.write(
            self.style.SUCCESS('🇹🇷 TürkiyeAPI Import Başlıyor...')
        )
        
        start_time = time.time()
        
        try:
            # Hangi işlemleri yapacağımızı belirle
            if options['provinces_only']:
                self.import_provinces()
            elif options['districts_only']:
                self.import_districts(province_id=options.get('province_id'))
            elif options['neighborhoods_only']:
                self.import_neighborhoods(district_id=options.get('district_id'))
            elif options['province_id']:
                # Sadece belirli bir il
                self.import_single_province(options['province_id'])
            elif options['district_id']:
                # Sadece belirli bir ilçe
                self.import_single_district(options['district_id'])
            else:
                # Tam import - hepsi
                self.full_import()
            
            elapsed_time = time.time() - start_time
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Import tamamlandı! Süre: {elapsed_time:.1f} saniye'
                )
            )
            
        except KeyboardInterrupt:
            self.stdout.write(
                self.style.WARNING('\n⚠️ Import kullanıcı tarafından durduruldu.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Import hatası: {str(e)}')
            )
            logger.error(f'Import error: {str(e)}', exc_info=True)
    
    def full_import(self):
        """Tam import: İl -> İlçe -> Mahalle"""
        self.stdout.write('🚀 Tam import başlıyor...')
        
        # 1. İlleri import et
        provinces = self.import_provinces()
        
        # 2. İlçeleri import et
        self.import_districts()
        
        # 3. Mahalleleri import et
        self.import_neighborhoods()
        
        self.stdout.write(self.style.SUCCESS('🎉 Tam import tamamlandı!'))
    
    def import_provinces(self):
        """Tüm illeri import et"""
        self.stdout.write('📍 İller import ediliyor...')
        
        url = f'{self.BASE_URL}/api/v1/provinces'
        params = {
            'fields': 'id,name',
            'limit': 100  # API limit
        }
        
        provinces_data = self.fetch_all_data(url, params)
        
        if not provinces_data:
            self.stdout.write(self.style.ERROR('❌ İl verisi çekilemedi!'))
            return []
        
        provinces = []
        created_count = 0
        updated_count = 0
        
        with transaction.atomic():
            for province_data in provinces_data:
                province, created = Province.objects.update_or_create(
                    api_id=province_data['id'],
                    defaults={
                        'name': province_data['name']
                    }
                )
                
                provinces.append(province)
                
                if created:
                    created_count += 1
                    logger.info(f'Province created: {province.name}')
                else:
                    updated_count += 1
                    logger.info(f'Province updated: {province.name}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ İller tamamlandı! '
                f'Yeni: {created_count}, Güncellenen: {updated_count}, '
                f'Toplam: {len(provinces_data)}'
            )
        )
        
        return provinces
    
    def import_districts(self, province_id=None):
        """İlçeleri import et"""
        if province_id:
            provinces = Province.objects.filter(api_id=province_id)
            self.stdout.write(f'📍 Sadece {province_id} nolu ilin ilçeleri import ediliyor...')
        else:
            provinces = Province.objects.all()
            self.stdout.write('📍 Tüm ilçeler import ediliyor...')
        
        if not provinces.exists():
            self.stdout.write(
                self.style.ERROR('❌ Önce illeri import etmelisiniz!')
            )
            return
        
        total_provinces = provinces.count()
        created_count = 0
        updated_count = 0
        
        for index, province in enumerate(provinces, 1):
            self.stdout.write(
                f'📍 İlçeler işleniyor: {province.name} '
                f'({index}/{total_provinces})'
            )
            
            url = f'{self.BASE_URL}/api/v1/districts'
            params = {
                'provinceId': province.api_id,
                'fields': 'id,name,provinceId',
                'limit': 100
            }
            
            districts_data = self.fetch_all_data(url, params)
            
            if districts_data:
                with transaction.atomic():
                    for district_data in districts_data:
                        district, created = District.objects.update_or_create(
                            api_id=district_data['id'],
                            defaults={
                                'name': district_data['name'],
                                'province': province
                            }
                        )
                        
                        if created:
                            created_count += 1
                            logger.info(f'District created: {district.name}, {province.name}')
                        else:
                            updated_count += 1
                            logger.info(f'District updated: {district.name}, {province.name}')
            
            # Rate limiting
            time.sleep(self.RATE_LIMIT_DELAY)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ İlçeler tamamlandı! '
                f'Yeni: {created_count}, Güncellenen: {updated_count}'
            )
        )
    
    def import_neighborhoods(self, district_id=None):
        """Mahalleleri import et"""
        if district_id:
            districts = District.objects.filter(api_id=district_id)
            self.stdout.write(f'📍 Sadece {district_id} nolu ilçenin mahalleleri import ediliyor...')
        else:
            districts = District.objects.all()
            self.stdout.write('📍 Tüm mahalleler import ediliyor...')
        
        if not districts.exists():
            self.stdout.write(
                self.style.ERROR('❌ Önce illeri ve ilçeleri import etmelisiniz!')
            )
            return
        
        total_districts = districts.count()
        created_count = 0
        updated_count = 0
        
        for index, district in enumerate(districts, 1):
            if index % 10 == 0 or index == 1:  # Her 10 ilçede bir progress göster
                self.stdout.write(
                    f'📍 Mahalleler işleniyor: {district.name}, {district.province.name} '
                    f'({index}/{total_districts})'
                )
            
            url = f'{self.BASE_URL}/api/v1/neighborhoods'
            params = {
                'districtId': district.api_id,
                'fields': 'id,name,districtId',
                'limit': 500  # Mahalle sayısı çok olabilir
            }
            
            neighborhoods_data = self.fetch_all_data(url, params)
            
            if neighborhoods_data:
                with transaction.atomic():
                    for neighborhood_data in neighborhoods_data:
                        neighborhood, created = Neighborhood.objects.update_or_create(
                            api_id=neighborhood_data['id'],
                            defaults={
                                'name': neighborhood_data['name'],
                                'district': district
                            }
                        )
                        
                        if created:
                            created_count += 1
                            if created_count % 100 == 0:  # Her 100 mahallede bir log
                                logger.info(f'Neighborhoods created so far: {created_count}')
                        else:
                            updated_count += 1
            
            # Rate limiting - mahalleler için biraz daha yavaş
            time.sleep(self.RATE_LIMIT_DELAY * 1.5)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Mahalleler tamamlandı! '
                f'Yeni: {created_count}, Güncellenen: {updated_count}'
            )
        )
    
    def import_single_province(self, province_id):
        """Sadece belirli bir ili ve onun alt birimlerini import et"""
        self.stdout.write(f'📍 {province_id} nolu il import ediliyor...')
        
        # Önce ili import et
        url = f'{self.BASE_URL}/api/v1/provinces/{province_id}'
        data = self.fetch_data(url, {})
        
        if not data:
            self.stdout.write(self.style.ERROR(f'❌ {province_id} nolu il bulunamadı!'))
            return
        
        province, created = Province.objects.update_or_create(
            api_id=data['id'],
            defaults={'name': data['name']}
        )
        
        self.stdout.write(f'✅ İl: {province.name}')
        
        # Sonra ilçeleri
        self.import_districts(province_id=province_id)
        
        # Son olarak mahalleleri
        districts = District.objects.filter(province=province)
        for district in districts:
            self.import_neighborhoods(district_id=district.api_id)
    
    def import_single_district(self, district_id):
        """Sadece belirli bir ilçenin mahallelerini import et"""
        self.stdout.write(f'📍 {district_id} nolu ilçenin mahalleleri import ediliyor...')
        self.import_neighborhoods(district_id=district_id)
    
    def fetch_all_data(self, url, params):
        """Pagination ile tüm veriyi çek"""
        all_data = []
        offset = 0
        limit = params.get('limit', 100)
        
        while True:
            current_params = params.copy()
            current_params.update({
                'offset': offset,
                'limit': limit
            })
            
            data = self.fetch_data(url, current_params)
            
            if not data:
                break
            
            all_data.extend(data)
            
            # Eğer gelen veri limit'ten az ise son sayfa
            if len(data) < limit:
                break
            
            offset += limit
            
            # Rate limiting
            time.sleep(self.RATE_LIMIT_DELAY)
        
        return all_data
    
    def fetch_data(self, url, params):
        """API'den veri çek (retry logic ile)"""
        for attempt in range(self.MAX_RETRIES):
            try:
                response = requests.get(
                    url, 
                    params=params, 
                    timeout=self.TIMEOUT
                )
                response.raise_for_status()
                
                json_data = response.json()
                
                if json_data.get('status') == 'OK':
                    return json_data.get('data', [])
                else:
                    logger.warning(f'API returned non-OK status: {json_data}')
                    return []
                
            except requests.exceptions.RequestException as e:
                logger.warning(
                    f'Request failed (attempt {attempt + 1}/{self.MAX_RETRIES}): {e}'
                )
                
                if attempt < self.MAX_RETRIES - 1:
                    # Exponential backoff
                    wait_time = (2 ** attempt) * self.RATE_LIMIT_DELAY
                    time.sleep(wait_time)
                else:
                    logger.error(f'All retry attempts failed for {url}')
                    return []
            
            except ValueError as e:
                logger.error(f'JSON decode error for {url}: {e}')
                return []
        
        return [] 