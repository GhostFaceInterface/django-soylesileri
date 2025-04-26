from rest_framework.throttling import SimpleRateThrottle

class ListingCreateThrottle(SimpleRateThrottle):
    scope = "listing_create"

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                "scope": self.scope,
                "ident": request.user.pk,
            }
        return None

class MessageSendThrottle(SimpleRateThrottle):
    scope = "message_send"

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                "scope": self.scope,
                "ident": request.user.pk,
            }
        return None
    
class LoginThrottle(SimpleRateThrottle):
    scope = "login"

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return self.cache_format % {
                "scope": self.scope,
                "ident": request.user.pk,
            }
