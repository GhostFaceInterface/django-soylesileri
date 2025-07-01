"""
Django Management Command: TürkiyeAPI'den JSON Export

Bu komut şu işlemleri yapar:
1. turkiyeapi.dev'den tüm il/ilçe/mahalle verilerini çeker
2. Hiyerarşik yapıda organize eder
3. Güzel formatlanmış JSON dosyasına kaydeder

Kullanım:
    python manage.py export_turkey_data_to_json
    
Çıktı:
    turkey_location_data.json (structured format)
    
Özellikler:
- Rate limiting (API'yi korumak için)
- Progress tracking 
- Error handling ve retry logic
- Structured JSON format (hiyerarşik)
- Validation ve data cleaning
"""

import requests
import time
import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
import logging
from datetime import datetime

# Logger ayarla
logger = logging.getLogger('export_turkey_data')
logger.setLevel(logging.INFO)

# Console handler ekle
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)


class Command(BaseCommand):
    help = 'TürkiyeAPI\'den verileri çekip JSON dosyasına kaydeder'
    
    # API ayarları
    BASE_URL = 'https://turkiyeapi.dev'
    RATE_LIMIT_DELAY = 0.5  # Saniye cinsinden request'ler arası bekleme
    MAX_RETRIES = 3
    TIMEOUT = 30  # Request timeout
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--output-file',
            type=str,
            default='turkey_location_data.json',
            help='Çıktı JSON dosyası adı (default: turkey_location_data.json)',
        )
        parser.add_argument(
            '--province-limit',
            type=int,
            help='Test için maksimum il sayısı (örn: --province-limit 5)',
        )
        parser.add_argument(
            '--no-neighborhoods',
            action='store_true',
            help='Mahalleleri dahil etme (sadece il/ilçe)',
        )
        parser.add_argument(
            '--pretty-print',
            action='store_true',
            help='JSON dosyasını güzel formatla (büyük olur ama okunabilir)',
        )
    
    def handle(self, *args, **options):
        """Ana command handler"""
        self.stdout.write(
            self.style.SUCCESS('🇹🇷 TürkiyeAPI JSON Export Başlıyor...')
        )
        
        self.output_file = options['output_file']
        self.province_limit = options.get('province_limit')
        self.include_neighborhoods = not options['no_neighborhoods']
        self.pretty_print = options['pretty_print']
        
        start_time = time.time()
        
        try:
            # Ana export işlemi
            data = self.export_all_data()
            
            # JSON dosyasına kaydet
            self.save_to_json(data)
            
            elapsed_time = time.time() - start_time
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Export tamamlandı! '
                    f'Dosya: {self.output_file}, '
                    f'Süre: {elapsed_time:.1f} saniye'
                )
            )
            
            # Özet bilgi
            self.print_summary(data)
            
        except KeyboardInterrupt:
            self.stdout.write(
                self.style.WARNING('\n⚠️ Export kullanıcı tarafından durduruldu.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Export hatası: {str(e)}')
            )
            logger.error(f'Export error: {str(e)}', exc_info=True)
    
    def export_all_data(self):
        """Tüm veriyi export et"""
        
        # Ana veri yapısı
        turkey_data = {
            "metadata": {
                "export_date": datetime.now().isoformat(),
                "api_source": self.BASE_URL,
                "total_provinces": 0,
                "total_districts": 0,
                "total_neighborhoods": 0,
                "includes_neighborhoods": self.include_neighborhoods
            },
            "provinces": []
        }
        
        # 1. İlleri çek
        self.stdout.write('📍 İller export ediliyor...')
        provinces_data = self.fetch_provinces()
        
        if not provinces_data:
            raise Exception("İl verisi çekilemedi!")
        
        # Province limit uygula (test için)
        if self.province_limit:
            provinces_data = provinces_data[:self.province_limit]
            self.stdout.write(f'⚠️ Test modu: Sadece {len(provinces_data)} il export edilecek')
        
        turkey_data["metadata"]["total_provinces"] = len(provinces_data)
        
        # 2. Her il için ilçeleri ve mahalleleri çek
        for index, province_data in enumerate(provinces_data, 1):
            self.stdout.write(
                f'📍 İşleniyor: {province_data["name"]} ({index}/{len(provinces_data)})'
            )
            
            # İl veri yapısı
            province_entry = {
                "id": province_data["id"],
                "name": province_data["name"],
                "districts": []
            }
            
            # İlçeleri çek
            districts_data = self.fetch_districts(province_data["id"])
            
            if districts_data:
                for district_data in districts_data:
                    # İlçe veri yapısı
                    district_entry = {
                        "id": district_data["id"],
                        "name": district_data["name"],
                        "neighborhoods": []
                    }
                    
                    # Mahalleleri çek (eğer istenmişse)
                    if self.include_neighborhoods:
                        neighborhoods_data = self.fetch_neighborhoods(district_data["id"])
                        
                        if neighborhoods_data:
                            for neighborhood_data in neighborhoods_data:
                                neighborhood_entry = {
                                    "id": neighborhood_data["id"],
                                    "name": neighborhood_data["name"]
                                }
                                district_entry["neighborhoods"].append(neighborhood_entry)
                        
                        turkey_data["metadata"]["total_neighborhoods"] += len(neighborhoods_data)
                    
                    province_entry["districts"].append(district_entry)
                
                turkey_data["metadata"]["total_districts"] += len(districts_data)
            
            turkey_data["provinces"].append(province_entry)
            
            # Rate limiting
            time.sleep(self.RATE_LIMIT_DELAY)
        
        return turkey_data
    
    def fetch_provinces(self):
        """Tüm illeri çek"""
        url = f'{self.BASE_URL}/api/v1/provinces'
        params = {
            'fields': 'id,name',
            'limit': 100
        }
        
        return self.fetch_all_data(url, params)
    
    def fetch_districts(self, province_id):
        """Bir ilin ilçelerini çek"""
        url = f'{self.BASE_URL}/api/v1/districts'
        params = {
            'provinceId': province_id,
            'fields': 'id,name,provinceId',
            'limit': 100
        }
        
        return self.fetch_all_data(url, params)
    
    def fetch_neighborhoods(self, district_id):
        """Bir ilçenin mahallelerini çek"""
        url = f'{self.BASE_URL}/api/v1/neighborhoods'
        params = {
            'districtId': district_id,
            'fields': 'id,name,districtId',
            'limit': 500  # Mahalle sayısı çok olabilir
        }
        
        return self.fetch_all_data(url, params)
    
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
    
    def save_to_json(self, data):
        """Veriyi JSON dosyasına kaydet"""
        try:
            # JSON formatı belirle
            if self.pretty_print:
                json_str = json.dumps(
                    data, 
                    ensure_ascii=False, 
                    indent=2, 
                    separators=(',', ': ')
                )
            else:
                json_str = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
            
            # Dosyaya yaz
            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write(json_str)
            
            # Dosya boyutu hesapla
            file_size = os.path.getsize(self.output_file)
            size_mb = file_size / (1024 * 1024)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'💾 JSON dosyası kaydedildi: {self.output_file} ({size_mb:.1f} MB)'
                )
            )
            
        except Exception as e:
            raise Exception(f"JSON dosyası kaydedilemedi: {str(e)}")
    
    def print_summary(self, data):
        """Export özeti yazdır"""
        metadata = data["metadata"]
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('📊 EXPORT ÖZETİ'))
        self.stdout.write('='*50)
        self.stdout.write(f'📅 Export Tarihi: {metadata["export_date"]}')
        self.stdout.write(f'🏙️ Toplam İl: {metadata["total_provinces"]}')
        self.stdout.write(f'🏘️ Toplam İlçe: {metadata["total_districts"]}')
        
        if metadata["includes_neighborhoods"]:
            self.stdout.write(f'🏠 Toplam Mahalle: {metadata["total_neighborhoods"]}')
        else:
            self.stdout.write('🏠 Mahalleler: Dahil edilmedi')
        
        self.stdout.write(f'📁 Dosya: {self.output_file}')
        
        # Dosya boyutu
        if os.path.exists(self.output_file):
            file_size = os.path.getsize(self.output_file)
            size_mb = file_size / (1024 * 1024)
            self.stdout.write(f'💾 Dosya Boyutu: {size_mb:.1f} MB')
        
        self.stdout.write('='*50)
        
        # Sonraki adım
        self.stdout.write('\n' + self.style.WARNING('📋 SONRAKI ADIM:'))
        self.stdout.write(
            f'   python manage.py import_turkey_data_from_json {self.output_file}'
        ) 