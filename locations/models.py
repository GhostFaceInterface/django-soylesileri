from django.db import models

class City(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ['name'] #Şehirler admin panelde ve sorgularda alfabetik sıralansın diye
        verbose_name = 'Şehir' # Admin panelde “City” yerine “Şehir” görünsün diye
        verbose_name_plural = 'Şehirler' 


    def __str__(self):
        return self.name
