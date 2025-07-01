from django.db import models

class Province(models.Model):
    """İl modeli - sadece temel bilgiler"""
    api_id = models.IntegerField(unique=True)  # TürkiyeAPI'deki ID
    name = models.CharField(max_length=100)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'İl'
        verbose_name_plural = 'İller'
    
    def __str__(self):
        return self.name

class District(models.Model):
    """İlçe modeli - sadece temel bilgiler"""
    api_id = models.IntegerField(unique=True)
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='districts')
    name = models.CharField(max_length=100)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'İlçe' 
        verbose_name_plural = 'İlçeler'
    
    def __str__(self):
        return f"{self.name}, {self.province.name}"

class Neighborhood(models.Model):
    """Mahalle modeli - sadece temel bilgiler"""
    api_id = models.IntegerField(unique=True)
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='neighborhoods')
    name = models.CharField(max_length=100)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Mahalle'
        verbose_name_plural = 'Mahalleler'
    
    def __str__(self):
        return f"{self.name}, {self.district.name}"