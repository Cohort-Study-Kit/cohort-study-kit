from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    # We created our own user model in order to add the field is_moderator.
    id = models.AutoField(
        auto_created=True,
        primary_key=True,
        serialize=False,
        verbose_name="ID",
    )
    is_moderator = models.BooleanField(
        _("moderator status"),
        default=False,
        help_text=_("Designates whether the user can moderate content."),
    )

    def can_moderate(self):
        if self.is_active and (self.is_superuser or self.is_staff or self.is_moderator):
            return True
        return False

    def can_admin(self):
        if self.is_active and (self.is_superuser or self.is_staff):
            return True
        return False

    class Meta:
        db_table = "auth_user"
