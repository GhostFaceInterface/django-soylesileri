from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
        - Bu metod, bir objeye erişim izni verilip verilmeyeceğini belirler.
        - İlk olarak, isteğin HTTP metodunu kontrol eder.
        - Eğer metod 'GET', 'HEAD' veya 'OPTIONS' gibi güvenli bir metod ise (SAFE_METHODS),
        herkese izin verir ve True döner.
        - Eğer metod güvenli değilse (örneğin 'POST', 'PUT', 'DELETE' gibi),
        objenin 'user' alanı ile isteği yapan kullanıcının (request.user) aynı olup olmadığını kontrol eder.
        - Eğer aynı ise True döner, aksi takdirde False döner.
    """

    def has_object_permission(self, request, view, obj):
        # GET, HEAD, OPTIONS ise herkese izin ver
        if request.method in permissions.SAFE_METHODS:
            return True
    
        # Diğer durumlarda sadece ilan sahibi erişebilir
        return obj.user == request.user