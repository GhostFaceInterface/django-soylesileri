import os 
import uuid
from PIL import Image, ImageOps
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
import logging

logger = logging.getLogger("custom")

class ImageProcessor:
    """
    4:3 formatında resim işleme için yardımcı sınıf
    
    Python Syntax Açıklaması:
    - class: Sınıf tanımlama
    - @staticmethod: Sınıf instance'ına bağlı olmayan metod
    - PIL: Python Imaging Library (Pillow)
    """

    ALLOWED_FORMATS = ['JPEG', 'PNG', 'WEBP', "JPG"]
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
    
    # 🆕 TEK FORMAT: 4:3 ASPECT RATIO
    ASPECT_RATIO = 4 / 3  # 1.333...
    
    # 🆕 4:3 BOYUTLARI - Sadece original ve thumbnail
    SIZES = {
        "original": (1200, 900),     # 4:3 format - Ana resim
        "thumbnail": (320, 240),     # 4:3 format - Küçük resim
    }

    @staticmethod
    def validate_image(image_file):
        try:
            if image_file.size > ImageProcessor.MAX_FILE_SIZE:
                raise ValueError(f"Dosya boyutu çok büyük. Maksimum {ImageProcessor.MAX_FILE_SIZE // (1024*1024)}MB olabilir.")
            
            image = Image.open(image_file)
            if image.format not in ImageProcessor.ALLOWED_FORMATS:
                raise ValueError(f"Desteklenmeyen format. Sadece {', '.join(ImageProcessor.ALLOWED_FORMATS)} desteklenir.")
            
            if image.size[0] < 320 or image.size[1] < 240:
                raise ValueError("Resim boyutu çok küçük. En az 320x240 piksel olmalıdır.")
            
            return True
        
        except Exception as e:
            logger.error(f"Resim doğrulama hatası: {e}")
            raise ValueError(f"Resim doğrulama hatası: {e}")
        
    @staticmethod
    def generate_filename(original_name):
        name, ext = os.path.splitext(original_name)
        unique_id = uuid.uuid4().hex[:8]
        clean_name = name.replace(" ", "_").replace("-", "_").replace("ş", "s").replace("ğ", "g").replace("ı", "i").replace("ü", "u").replace("ö", "o").replace("ç", "c")
        return f"{clean_name}_{unique_id}{ext.lower()}"
    
    @staticmethod
    def fit_to_4_3(image, target_size):
        """
        Resmi 4:3 formatına sığdır - ASPECT RATIO BOZULMADAN
        
        Mantık:
        1. Resmin en boy oranını koru
        2. 4:3 çerçeveye sığdır
        3. Boş yerleri siyah dolgularla doldur (letterbox/pillarbox)
        """
        target_width, target_height = target_size
        original_width, original_height = image.size
        
        # Orijinal aspect ratio
        original_ratio = original_width / original_height
        target_ratio = target_width / target_height  # 4:3 = 1.333...
        
        # Resmi 4:3 çerçeveye sığdırmak için boyutları hesapla
        if original_ratio > target_ratio:
            # Resim çok geniş - genişliği 4:3'e sığdır, yükseklikte siyah şerit
            new_width = target_width
            new_height = int(target_width / original_ratio)
        else:
            # Resim çok uzun - yüksekliği 4:3'e sığdır, genişlikte siyah şerit  
            new_height = target_height
            new_width = int(target_height * original_ratio)
        
        # Resmi yeniden boyutlandır (aspect ratio korunur)
        resized_image = image.resize((new_width, new_height), Image.LANCZOS)
        
        # 4:3 siyah background oluştur
        final_image = Image.new('RGB', (target_width, target_height), (0, 0, 0))
        
        # Resmi ortaya yapıştır
        x_offset = (target_width - new_width) // 2
        y_offset = (target_height - new_height) // 2
        final_image.paste(resized_image, (x_offset, y_offset))
        
        return final_image

    @staticmethod
    def process_image(image_file, size_name="original"):
        """
        Resmi işle ve 4:3 formatına uyarla
        """
        try:
            image = Image.open(image_file)
            image = ImageOps.exif_transpose(image)  # EXIF rotation fix
            
            # RGBA/P formatlarını RGB'ye çevir
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")

            # Hedef boyutu al
            target_size = ImageProcessor.SIZES.get(size_name)
            if not target_size:
                raise ValueError(f"Geçersiz boyut: {size_name}")
            
            # 4:3 formatına uyarla
            processed_image = ImageProcessor.fit_to_4_3(image, target_size)
            
            # BytesIO'ya kaydet
            from io import BytesIO
            output = BytesIO()
            processed_image.save(output, format="JPEG", quality=85, optimize=True)
            output.seek(0)

            return ContentFile(output.getvalue())
            
        except Exception as e:
            logger.error(f"Resim işleme hatası: {e}")
            raise ValueError(f"Resim işleme hatası: {e}")
        
    @staticmethod
    def create_thumbnails(image_file, filename_base):
        thumbnails = {}
        base_name, extension = os.path.splitext(filename_base)
        for size_name, dimensions in ImageProcessor.SIZES.items():
            try:
                processed_image = ImageProcessor.process_image(image_file, size_name)
                if size_name == "original":
                    # ✅ Orijinal resim ana dizine
                    file_path = default_storage.save(
                        f"listing_images/{base_name}.jpg",
                        processed_image
                    )
                else:
                    # Thumbnail'lar alt dizine
                    file_path = default_storage.save(
                        f"listing_images/thumbnails/{base_name}_{size_name}.jpg",
                        processed_image
                    )
                
                thumbnails[size_name] = file_path
                logger.info(f"4:3 Resim oluşturuldu: {size_name} ({ImageProcessor.SIZES[size_name][0]}x{ImageProcessor.SIZES[size_name][1]}) - {file_path}")
                
            except Exception as e:
                logger.error(f"Resim oluşturma hatası ({size_name}): {e}")
                
        return thumbnails
    
    
