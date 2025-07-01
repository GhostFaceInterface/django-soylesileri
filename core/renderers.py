"""
Custom JSON Renderer for Turkish Character Support

Bu renderer, REST Framework'ün default JSON renderer'ını
override ederek Türkçe karakterlerin düzgün gösterilmesini sağlar.

ensure_ascii=False ayarı ile Unicode karakterler doğru şekilde encode edilir.
"""

import json
from rest_framework.renderers import JSONRenderer


class TurkishJSONRenderer(JSONRenderer):
    """
    Custom JSON renderer that properly handles Turkish characters
    """
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        """
        Render `data` into JSON, returning a bytestring.
        """
        if data is None:
            return b''

        # Use default encoder class if not set
        encoder_class = getattr(self, 'encoder_class', None) or self.get_encoder_class()
        
        # Default values for missing attributes
        indent = getattr(self, 'indent', None)
        strict = getattr(self, 'strict', True)
        compact = getattr(self, 'compact', False)

        ret = json.dumps(
            data, 
            cls=encoder_class,
            indent=indent, 
            ensure_ascii=False,  # 🔥 Bu satır Türkçe karakterleri düzeltir
            allow_nan=not strict, 
            separators=compact and (',', ':') or (',', ': ')
        )

        # DRF expects bytes
        return ret.encode('utf-8')
    
    def get_encoder_class(self):
        """
        Return the JSON encoder class to use.
        """
        return getattr(json, 'JSONEncoder', None) or json.JSONEncoder 