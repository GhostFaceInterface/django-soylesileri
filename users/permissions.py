from rest_framework import permissions

class IsSelfOrReadOnly(permissions.BasePermission):
    """Allow users to edit their own profile, read-only for others."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj == request.user
