"""Unit tests for the data model and its (de)serialisation."""

from __future__ import annotations

import pytest

from sundial.const import DEFAULT_SCHEMA_ID, HOURS_PER_DAY
from sundial.models import (
    GlobalSettings,
    InvalidStoreData,
    LightConfig,
    Schema,
    StoreData,
    SunConfig,
)


def test_storedata_always_has_default_active_schema():
    data = StoreData()
    assert DEFAULT_SCHEMA_ID in data.schemas
    assert data.active_schema_id == DEFAULT_SCHEMA_ID
    assert data.active_schema.id == DEFAULT_SCHEMA_ID


def test_active_schema_falls_back_when_missing():
    data = StoreData(active_schema_id="ghost")
    # __post_init__ repairs an invalid active id.
    assert data.active_schema_id == DEFAULT_SCHEMA_ID


def test_lightconfig_normalises_to_24_hours():
    cfg = LightConfig(hours=[{"brightness": 50, "color_temp": 3000}])
    assert len(cfg.hours) == HOURS_PER_DAY
    assert cfg.hours[0] == {"brightness": 50, "color_temp": 3000}
    assert cfg.hours[1] is None


def test_lightconfig_drops_malformed_cells():
    cfg = LightConfig(hours=[{"brightness": 50}, "nope", None])
    assert cfg.hours[0] is None  # missing color_temp
    assert cfg.hours[1] is None


def test_lightconfig_drops_corrupt_cell_values_not_whole_config():
    # A cell whose values can't be coerced must not abort loading the config;
    # only that cell falls back to the sun.
    cfg = LightConfig(
        hours=[
            {"brightness": "garbage", "color_temp": 3000},
            {"brightness": 40, "color_temp": None},
            {"brightness": 40, "color_temp": 3000},
        ]
    )
    assert cfg.hours[0] is None
    assert cfg.hours[1] is None
    assert cfg.hours[2] == {"brightness": 40, "color_temp": 3000}


def test_invalid_render_mode_falls_back_to_auto():
    assert LightConfig(render_mode="nonsense").render_mode == "auto"
    assert LightConfig(render_mode="rgb").render_mode == "rgb"


def test_inverted_ranges_are_reordered():
    light = LightConfig(
        min_brightness=90, max_brightness=10, min_color_temp=5000, max_color_temp=2000
    )
    assert (light.min_brightness, light.max_brightness) == (10, 90)
    assert (light.min_color_temp, light.max_color_temp) == (2000, 5000)

    sun = SunConfig(min_brightness=80, max_brightness=20)
    assert (sun.min_brightness, sun.max_brightness) == (20, 80)


def test_schema_round_trip():
    schema = Schema(
        id="evening",
        name="Evening",
        sun=SunConfig(min_color_temp=1800, sunset_time="21:30:00"),
        lights={
            "light.kitchen": LightConfig(
                max_brightness=80,
                hours=[{"brightness": 30, "color_temp": 2200}],
            )
        },
    )
    restored = Schema.from_dict(schema.to_dict())
    assert restored.sun.min_color_temp == 1800
    assert restored.sun.sunset_time == "21:30:00"
    assert restored.lights["light.kitchen"].max_brightness == 80
    assert restored.lights["light.kitchen"].hours[0] == {
        "brightness": 30,
        "color_temp": 2200,
    }


def test_schema_light_config_defaults_when_absent():
    schema = Schema(id="s", name="s")
    cfg = schema.light_config("light.unknown")
    assert isinstance(cfg, LightConfig)
    assert all(cell is None for cell in cfg.hours)


def test_storedata_round_trip():
    data = StoreData(
        settings=GlobalSettings(interval=60, transition=10),
        schemas={DEFAULT_SCHEMA_ID: Schema(id=DEFAULT_SCHEMA_ID, name="Default")},
        active_schema_id=DEFAULT_SCHEMA_ID,
    )
    restored = StoreData.from_dict(data.to_dict())
    assert restored.settings.interval == 60
    assert restored.active_schema_id == DEFAULT_SCHEMA_ID
    assert DEFAULT_SCHEMA_ID in restored.schemas


# --- malformed input ---------------------------------------------------------
#
# A hand-edited backup reaches StoreData.from_dict unvalidated. Structural
# breakage raises InvalidStoreData (the panel reports it); individual bad
# values degrade to the field default.


@pytest.mark.parametrize(
    "document",
    [
        {"schemas": {"a": {"name": "no id"}}},  # schema without an id
        {"schemas": {"a": "not a dict"}},
        {"schemas": [{"id": "a"}]},  # schemas as a list
        {"schemas": {"a": {"id": "a", "lights": ["light.kitchen"]}}},
        "not a document",
    ],
)
def test_from_dict_rejects_malformed_documents(document):
    with pytest.raises(InvalidStoreData):
        StoreData.from_dict(document)


def test_from_dict_coerces_numeric_strings():
    data = StoreData.from_dict(
        {
            "settings": {"interval": "60", "transition": "10"},
            "schemas": {
                "a": {"id": "a", "lights": {"light.k": {"max_brightness": "80"}}}
            },
        }
    )
    assert data.settings.interval == 60
    assert data.settings.transition == 10
    assert data.schemas["a"].lights["light.k"].max_brightness == 80


def test_from_dict_falls_back_on_non_numeric_values():
    data = StoreData.from_dict(
        {
            "settings": {"interval": "abc", "transition": None},
            "schemas": {
                "a": {"id": "a", "lights": {"light.k": {"min_brightness": "x"}}}
            },
        }
    )
    # Defaults, rather than a string that would explode at timedelta() time.
    assert data.settings.interval == GlobalSettings().interval
    assert data.settings.transition == GlobalSettings().transition
    light = data.schemas["a"].lights["light.k"]
    assert light.min_brightness == LightConfig().min_brightness


def test_from_dict_tolerates_non_dict_sub_objects():
    data = StoreData.from_dict(
        {"settings": "nope", "schemas": {"a": {"id": "a", "sun": "nope"}}}
    )
    assert data.settings.interval == GlobalSettings().interval
    assert data.schemas["a"].sun.min_brightness == SunConfig().min_brightness


def test_from_dict_accepts_none_and_empty():
    assert StoreData.from_dict(None).active_schema_id == DEFAULT_SCHEMA_ID
    assert StoreData.from_dict({}).active_schema_id == DEFAULT_SCHEMA_ID
