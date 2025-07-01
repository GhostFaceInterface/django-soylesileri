"""
Django Management Command: JSON'dan Django Import

Bu komut şu işlemleri yapar:
1. JSON dosyasından hiyerarşik yapıdaki veriyi okur
2. Django modellerine (Province, District, Neighborhood) kaydeder
3. İlişkileri doğru şekilde kurar

Kullanım:
    python manage.py import_turkey_data_from_json turkey_location_data.json
    
Özellikler:
- Transaction safety (başarısız olursa rollback)
- Duplicate prevention (zaten varsa günceller)
- Progress tracking
- Validation ve error handling
- Batch processing (performance için)
"""

import json
import time
from django.core.management.base import BaseCommand
from django.db import transaction
from locations.models import Province, District, Neighborhood
import logging
import os

# Logger ayarla
logger = logging.getLogger('import_from_json')
logger.setLevel(logging.INFO)

# Console handler ekle
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)


class Command(BaseCommand):
    help = 'JSON dosyasından Türkiye konum verilerini Django\'ya import eder'
    
    def add_arguments(self, parser):
        parser.add_argument(
            'json_file',
            type=str,
            help='Import edilecek JSON dosyası',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Sadece test et, veritabanına kaydetme',
        )
        parser.add_argument(
            '--clear-existing',
            action='store_true',
            help='Mevcut verileri önce sil',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Batch processing boyutu (default: 100)',
        )
    
    def handle(self, *args, **options):
        """Ana command handler"""
        self.json_file = options['json_file']
        self.dry_run = options['dry_run']
        self.clear_existing = options['clear_existing']
        self.batch_size = options['batch_size']
        
        if self.dry_run:
            self.stdout.write(
                self.style.WARNING('🧪 DRY RUN modu - veritabanına kaydedilmeyecek!')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'📥 JSON Import Başlıyor: {self.json_file}')
        )
        
        start_time = time.time()
        
        try:
            # JSON dosyasını oku
            data = self.load_json_file()
            
            # Veri doğrulama
            self.validate_data(data)
            
            # Mevcut verileri sil (eğer istenmişse)
            if self.clear_existing:
                self.clear_existing_data()
            
            # Import işlemi
            stats = self.import_data(data)
            
            elapsed_time = time.time() - start_time
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Import tamamlandı! Süre: {elapsed_time:.1f} saniye'
                )
            )
            
            # Özet bilgi
            self.print_summary(stats, data.get('metadata', {}))
            
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(f'❌ JSON dosyası bulunamadı: {self.json_file}')
            )
        except json.JSONDecodeError as e:
            self.stdout.write(
                self.style.ERROR(f'❌ JSON format hatası: {str(e)}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Import hatası: {str(e)}')
            )
            logger.error(f'Import error: {str(e)}', exc_info=True)
    
    def load_json_file(self):
        """JSON dosyasını oku"""
        if not os.path.exists(self.json_file):
            raise FileNotFoundError(f"JSON dosyası bulunamadı: {self.json_file}")
        
        # Dosya boyutunu kontrol et
        file_size = os.path.getsize(self.json_file)
        size_mb = file_size / (1024 * 1024)
        
        self.stdout.write(f'📁 JSON dosyası okunuyor... ({size_mb:.1f} MB)')
        
        with open(self.json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.stdout.write('✅ JSON dosyası başarıyla okundu')
        return data
    
    def validate_data(self, data):
        """Veri yapısını doğrula"""
        self.stdout.write('🔍 Veri yapısı doğrulanıyor...')
        
        # Temel yapı kontrolü
        if not isinstance(data, dict):
            raise ValueError("JSON root objesi dictionary olmalı")
        
        if 'provinces' not in data:
            raise ValueError("JSON'da 'provinces' anahtarı bulunamadı")
        
        if not isinstance(data['provinces'], list):
            raise ValueError("'provinces' bir liste olmalı")
        
        # Metadata kontrolü
        if 'metadata' in data:
            metadata = data['metadata']
            self.stdout.write(f'📊 Export tarihi: {metadata.get("export_date", "Bilinmiyor")}')
            self.stdout.write(f'🏙️ İl sayısı: {metadata.get("total_provinces", "Bilinmiyor")}')
            self.stdout.write(f'🏘️ İlçe sayısı: {metadata.get("total_districts", "Bilinmiyor")}')
            
            if metadata.get("includes_neighborhoods", False):
                self.stdout.write(f'🏠 Mahalle sayısı: {metadata.get("total_neighborhoods", "Bilinmiyor")}')
        
        # İl yapısı kontrolü
        provinces_count = len(data['provinces'])
        if provinces_count == 0:
            raise ValueError("JSON'da hiç il bulunamadı")
        
        self.stdout.write(f'✅ Veri yapısı geçerli - {provinces_count} il bulundu')
    
    def clear_existing_data(self):
        """Mevcut verileri sil"""
        if self.dry_run:
            self.stdout.write('🧪 DRY RUN: Mevcut veriler silinecekti')
            return
        
        self.stdout.write('🗑️ Mevcut veriler siliniyor...')
        
        with transaction.atomic():
            # Cascade delete sayesinde otomatik silinir
            neighborhoods_count = Neighborhood.objects.count()
            districts_count = District.objects.count()
            provinces_count = Province.objects.count()
            
            Neighborhood.objects.all().delete()
            District.objects.all().delete()
            Province.objects.all().delete()
            
            self.stdout.write(
                f'✅ Silindi: {provinces_count} il, {districts_count} ilçe, {neighborhoods_count} mahalle'
            )
    
    def import_data(self, data):
        """Ana import işlemi"""
        provinces_data = data['provinces']
        
        stats = {
            'provinces': {'created': 0, 'updated': 0},
            'districts': {'created': 0, 'updated': 0},
            'neighborhoods': {'created': 0, 'updated': 0}
        }
        
        total_provinces = len(provinces_data)
        
        # İl bazında import
        for index, province_data in enumerate(provinces_data, 1):
            self.stdout.write(
                f'📍 İşleniyor: {province_data["name"]} ({index}/{total_provinces})'
            )
            
            province_stats = self.import_province(province_data)
            
            # İstatistikleri birleştir
            for model_type in stats:
                for action in stats[model_type]:
                    stats[model_type][action] += province_stats[model_type][action]
        
        return stats
    
    def import_province(self, province_data):
        """Tek bir ili import et"""
        province_stats = {
            'provinces': {'created': 0, 'updated': 0},
            'districts': {'created': 0, 'updated': 0},
            'neighborhoods': {'created': 0, 'updated': 0}
        }
        
        if self.dry_run:
            # Dry run için sadece sayım yap
            province_stats['provinces']['created'] = 1
            province_stats['districts']['created'] = len(province_data.get('districts', []))
            
            for district_data in province_data.get('districts', []):
                province_stats['neighborhoods']['created'] += len(district_data.get('neighborhoods', []))
            
            return province_stats
        
        # Gerçek import
        with transaction.atomic():
            # 1. İli oluştur/güncelle
            province, created = Province.objects.update_or_create(
                api_id=province_data['id'],
                defaults={
                    'name': province_data['name']
                }
            )
            
            if created:
                province_stats['provinces']['created'] += 1
                logger.info(f'Province created: {province.name}')
            else:
                province_stats['provinces']['updated'] += 1
                logger.info(f'Province updated: {province.name}')
            
            # 2. İlçeleri işle
            for district_data in province_data.get('districts', []):
                district, created = District.objects.update_or_create(
                    api_id=district_data['id'],
                    defaults={
                        'name': district_data['name'],
                        'province': province
                    }
                )
                
                if created:
                    province_stats['districts']['created'] += 1
                else:
                    province_stats['districts']['updated'] += 1
                
                # 3. Mahalleleri işle
                neighborhoods_batch = []
                for neighborhood_data in district_data.get('neighborhoods', []):
                    neighborhood, created = Neighborhood.objects.update_or_create(
                        api_id=neighborhood_data['id'],
                        defaults={
                            'name': neighborhood_data['name'],
                            'district': district
                        }
                    )
                    
                    if created:
                        province_stats['neighborhoods']['created'] += 1
                    else:
                        province_stats['neighborhoods']['updated'] += 1
        
        return province_stats
    
    def print_summary(self, stats, metadata):
        """Import özeti yazdır"""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('📊 IMPORT ÖZETİ'))
        self.stdout.write('='*50)
        
        if self.dry_run:
            self.stdout.write(self.style.WARNING('⚠️ DRY RUN MODU - VERİTABANINA KAYDEDİLMEDİ'))
        
        # İstatistikler
        self.stdout.write(f'🏙️ İller:')
        self.stdout.write(f'   Yeni: {stats["provinces"]["created"]}')
        self.stdout.write(f'   Güncellenen: {stats["provinces"]["updated"]}')
        
        self.stdout.write(f'🏘️ İlçeler:')
        self.stdout.write(f'   Yeni: {stats["districts"]["created"]}')
        self.stdout.write(f'   Güncellenen: {stats["districts"]["updated"]}')
        
        self.stdout.write(f'🏠 Mahalleler:')
        self.stdout.write(f'   Yeni: {stats["neighborhoods"]["created"]}')
        self.stdout.write(f'   Güncellenen: {stats["neighborhoods"]["updated"]}')
        
        # Toplam
        total_created = (
            stats["provinces"]["created"] + 
            stats["districts"]["created"] + 
            stats["neighborhoods"]["created"]
        )
        total_updated = (
            stats["provinces"]["updated"] + 
            stats["districts"]["updated"] + 
            stats["neighborhoods"]["updated"]
        )
        
        self.stdout.write(f'\n📊 TOPLAM:')
        self.stdout.write(f'   Yeni kayıt: {total_created}')
        self.stdout.write(f'   Güncellenen: {total_updated}')
        self.stdout.write(f'   Toplam işlem: {total_created + total_updated}')
        
        self.stdout.write('='*50)
        
        if not self.dry_run:
            # Sonraki adım
            self.stdout.write('\n' + self.style.SUCCESS('🎉 VERİTABANI HAZIR!'))
            self.stdout.write('📋 API endpoint\'lerini test edebilirsiniz:')
            self.stdout.write('   GET /api/provinces/')
            self.stdout.write('   GET /api/districts/')
            self.stdout.write('   GET /api/neighborhoods/') 