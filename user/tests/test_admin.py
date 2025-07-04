from django.contrib.admin.sites import AdminSite
from django.contrib.auth.models import AnonymousUser
from django.test import TestCase

from user.admin import UserAdmin
from user.models import User


class MockRequest:
    def __init__(self):
        self.user = AnonymousUser()


class UserAdminTest(TestCase):
    def setUp(self):
        self.site = AdminSite()
        self.user_admin = UserAdmin(User, self.site)

        # Create test users with different active statuses
        self.active_user = User.objects.create_user(
            username="active_user",
            email="active@example.com",
            first_name="Active",
            last_name="User",
            is_active=True,
        )

        self.inactive_user = User.objects.create_user(
            username="inactive_user",
            email="inactive@example.com",
            first_name="Inactive",
            last_name="User",
            is_active=False,
        )

        self.staff_user = User.objects.create_user(
            username="staff_user",
            email="staff@example.com",
            first_name="Staff",
            last_name="User",
            is_active=True,
            is_staff=True,
        )

        self.moderator_user = User.objects.create_user(
            username="moderator_user",
            email="moderator@example.com",
            first_name="Moderator",
            last_name="User",
            is_active=True,
            is_moderator=True,
        )

    def test_list_display_includes_active_status(self):
        """Test that list_display includes is_active field"""
        self.assertIn("is_active", self.user_admin.list_display)
        self.assertIn("username", self.user_admin.list_display)
        self.assertIn("email", self.user_admin.list_display)
        self.assertIn("is_staff", self.user_admin.list_display)
        self.assertIn("is_moderator", self.user_admin.list_display)

    def test_list_filter_includes_active_status(self):
        """Test that list_filter includes is_active field"""
        self.assertIn("is_active", self.user_admin.list_filter)
        self.assertIn("is_staff", self.user_admin.list_filter)
        self.assertIn("is_moderator", self.user_admin.list_filter)
        self.assertIn("is_superuser", self.user_admin.list_filter)

    def test_search_fields_configured(self):
        """Test that search_fields are properly configured"""
        self.assertIn("username", self.user_admin.search_fields)
        self.assertIn("first_name", self.user_admin.search_fields)
        self.assertIn("last_name", self.user_admin.search_fields)
        self.assertIn("email", self.user_admin.search_fields)

    def test_ordering_configured(self):
        """Test that ordering is configured"""
        self.assertEqual(self.user_admin.ordering, ("-date_joined",))

    def test_get_queryset_returns_all_users(self):
        """Test that get_queryset returns all users"""
        request = MockRequest()
        queryset = self.user_admin.get_queryset(request)

        # Should include both active and inactive users
        self.assertEqual(queryset.count(), 4)
        self.assertIn(self.active_user, queryset)
        self.assertIn(self.inactive_user, queryset)
        self.assertIn(self.staff_user, queryset)
        self.assertIn(self.moderator_user, queryset)

    def test_user_model_has_active_field(self):
        """Test that User model has is_active field"""
        self.assertTrue(hasattr(User, "is_active"))
        self.assertTrue(self.active_user.is_active)
        self.assertFalse(self.inactive_user.is_active)

    def test_user_model_has_moderator_field(self):
        """Test that User model has is_moderator field"""
        self.assertTrue(hasattr(User, "is_moderator"))
        self.assertTrue(self.moderator_user.is_moderator)
        self.assertFalse(self.active_user.is_moderator)

    def test_can_moderate_method(self):
        """Test the can_moderate method works correctly"""
        # Active moderator should be able to moderate
        self.assertTrue(self.moderator_user.can_moderate())

        # Active staff should be able to moderate
        self.assertTrue(self.staff_user.can_moderate())

        # Inactive user should not be able to moderate
        self.assertFalse(self.inactive_user.can_moderate())

        # Regular active user should not be able to moderate
        self.assertFalse(self.active_user.can_moderate())

    def test_can_admin_method(self):
        """Test the can_admin method works correctly"""
        # Active staff should be able to admin
        self.assertTrue(self.staff_user.can_admin())

        # Inactive user should not be able to admin
        self.assertFalse(self.inactive_user.can_admin())

        # Regular active user should not be able to admin
        self.assertFalse(self.active_user.can_admin())

        # Moderator without staff should not be able to admin
        self.assertFalse(self.moderator_user.can_admin())
