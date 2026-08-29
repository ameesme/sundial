"""File-backed persistence for Sundial.

Thin wrapper around Home Assistant's :class:`Store`, which writes JSON to
``<config>/.storage/sundial`` — that file *is* the backup of all schemas,
assignments and global settings.
"""

from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION
from .models import InvalidStoreData, StoreData

_LOGGER = logging.getLogger(__name__)


class SundialStore:
    """Load/save the single :class:`StoreData` document."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.data: StoreData = StoreData()

    async def async_load(self) -> StoreData:
        """Load persisted data, falling back to defaults on first run.

        A structurally broken file starts us on defaults rather than failing
        setup: it is not overwritten until something saves, so the original
        stays on disk to be recovered by hand.
        """
        raw = await self._store.async_load()
        try:
            self.data = StoreData.from_dict(raw)
        except InvalidStoreData:
            _LOGGER.exception(
                "Stored configuration in .storage/%s could not be read; "
                "starting from defaults. The file has not been modified",
                STORAGE_KEY,
            )
            self.data = StoreData()
        return self.data

    async def async_save(self) -> None:
        """Persist the current in-memory data to disk."""
        await self._store.async_save(self.data.to_dict())
