"""Unit tests for the pure lighting engine (no Home Assistant required)."""

from __future__ import annotations

import datetime as dt

import pytest

from sundial import engine
from sundial.models import LightConfig, SunConfig

UTC = dt.UTC


def _day_events(date: dt.datetime, sunrise_h: int = 6, sunset_h: int = 21):
    """Sunrise/sunset events spanning yesterday/today/tomorrow."""
    events = []
    for offset in (-1, 0, 1):
        day = date + dt.timedelta(days=offset)
        events.append((day + dt.timedelta(hours=sunrise_h), "sunrise"))
        events.append((day + dt.timedelta(hours=sunset_h), "sunset"))
    events.sort(key=lambda e: e[0])
    return events


def _sun_drives(sun: SunConfig, base: dt.datetime):
    """24 hourly drive signals, mirroring what the coordinator builds."""
    events = _day_events(base)
    return [
        engine.sun_drive(
            base + dt.timedelta(hours=h),
            engine.sun_snapshot(base + dt.timedelta(hours=h), events),
            sun,
        )
        for h in range(24)
    ]


# --- numeric helpers ---------------------------------------------------------


def test_clamp_and_lerp():
    assert engine.clamp(5, 0, 1) == 1
    assert engine.clamp(-5, 0, 1) == 0
    assert engine.lerp(0, 10, 0.25) == 2.5


def test_scaled_tanh_is_monotonic_and_centered():
    assert engine.scaled_tanh(0.5) == pytest.approx(0.5, abs=1e-9)
    lo = engine.scaled_tanh(0.0)
    hi = engine.scaled_tanh(1.0)
    assert lo == pytest.approx(0.05, abs=1e-9)
    assert hi == pytest.approx(0.95, abs=1e-9)


def test_color_difference_redmean():
    assert engine.color_difference_redmean((10, 20, 30), (10, 20, 30)) == 0.0
    assert engine.color_difference_redmean((0, 0, 0), (255, 255, 255)) > 0


def test_kelvin_to_rgb_warm_vs_cool():
    warm = engine.kelvin_to_rgb(2000)
    cool = engine.kelvin_to_rgb(6500)
    assert all(0 <= c <= 255 for c in warm + cool)
    assert warm[0] >= warm[2]  # warm: red >= blue
    assert cool[2] >= warm[2]  # cooler has more blue


# --- sun snapshot ------------------------------------------------------------


def test_sun_position_peaks_at_solar_noon():
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    noon = base + dt.timedelta(hours=13, minutes=30)  # midpoint of 6h..21h
    snap = engine.sun_snapshot(noon, _day_events(base))
    assert snap.is_day is True
    assert snap.position == pytest.approx(1.0, abs=1e-6)


def test_sun_position_negative_at_night():
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    midnight = base + dt.timedelta(hours=1, minutes=30)
    snap = engine.sun_snapshot(midnight, _day_events(base))
    assert snap.is_day is False
    assert snap.position < 0


def test_sun_drive_bright_warm_at_noon_dim_cool_at_night():
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    events = _day_events(base)
    noon = base + dt.timedelta(hours=13, minutes=30)
    night = base + dt.timedelta(hours=1)
    sun = SunConfig()

    day = engine.sun_drive(noon, engine.sun_snapshot(noon, events), sun)
    assert day.brightness == pytest.approx(1.0)
    assert day.warmth == pytest.approx(1.0, abs=1e-3)

    dark = engine.sun_drive(night, engine.sun_snapshot(night, events), sun)
    assert dark.brightness == pytest.approx(0.0)
    assert dark.warmth == 0.0


# --- sun row / mapping -------------------------------------------------------


def test_drive_to_values_scales_midpoint():
    bri, temp = engine.drive_to_values(
        engine.DriveSignal(0.5, 0.5), 0, 100, 2000, 6000
    )
    assert bri == pytest.approx(50)
    assert temp == pytest.approx(4000)


def test_sun_row_has_24_entries():
    sun = SunConfig()
    drives = _sun_drives(sun, dt.datetime(2026, 6, 14, tzinfo=UTC))
    row = engine.sun_row(engine.sun_values(sun, drives))
    assert len(row) == 24
    assert all(isinstance(b, int) and isinstance(t, int) for b, t in row)


# --- per-light timeline ------------------------------------------------------


def test_empty_light_follows_sun_clamped_to_its_range():
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    sun = SunConfig()
    drives = _sun_drives(sun, base)
    light = LightConfig(min_brightness=1, max_brightness=100)

    midday = engine.light_target(light, sun, drives, 13.0)
    assert midday.brightness_pct == 100  # sun is at full by day
    assert midday.color_temp_kelvin >= 5400

    night = engine.light_target(light, sun, drives, 1.0)
    assert night.brightness_pct <= 5
    assert night.color_temp_kelvin == light.min_color_temp


def test_empty_light_clamped_below_the_sun():
    # A light whose max is lower than the sun follows the sun but is capped.
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    sun = SunConfig()
    drives = _sun_drives(sun, base)
    capped = LightConfig(max_brightness=40)
    midday = engine.light_target(capped, sun, drives, 13.0)
    assert midday.brightness_pct == 40  # sun would be 100, clamped to the light


def test_scale_mode_maps_sun_signal_onto_light_range():
    # In "scale" mode an empty light uses its whole range across the day,
    # ignoring the sun's own min/max.
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    sun = SunConfig()
    drives = _sun_drives(sun, base)
    light = LightConfig(
        min_brightness=20, max_brightness=60, limit_mode="scale"
    )
    # Midday: sun demand ~1.0 -> light rides its max.
    midday = engine.light_target(light, sun, drives, 13.0)
    assert midday.brightness_pct == pytest.approx(60, abs=1)
    # Night: sun demand ~0.0 -> light rides its min (not clamped up from the sun).
    night = engine.light_target(light, sun, drives, 1.0)
    assert night.brightness_pct == pytest.approx(20, abs=1)


def test_cap_mode_clamps_sun_value_to_light_range():
    # In "cap" mode (default) an empty light tracks the sun's absolute value,
    # clamped to its range — so a low max holds the light down at midday.
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    sun = SunConfig()
    drives = _sun_drives(sun, base)
    capped = LightConfig(max_brightness=40)  # limit_mode defaults to "cap"
    midday = engine.light_target(capped, sun, drives, 13.0)
    assert midday.brightness_pct == 40


def test_explicit_cell_overrides_and_interpolates():
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    sun = SunConfig()
    drives = _sun_drives(sun, base)
    light = LightConfig()
    light.hours[9] = {"brightness": 40, "color_temp": 3000}
    light.hours[10] = {"brightness": 80, "color_temp": 4000}

    at_nine = engine.light_target(light, sun, drives, 9.0)
    assert at_nine.brightness_pct == 40
    assert at_nine.color_temp_kelvin == 3000

    halfway = engine.light_target(light, sun, drives, 9.5)
    assert halfway.brightness_pct == pytest.approx(60, abs=1)
    assert halfway.color_temp_kelvin == pytest.approx(3500, abs=5)


def test_target_changed_thresholds():
    target = engine.Target(brightness_pct=50, color_temp_kelvin=3000)
    # 50% -> ~128 on the 0-255 scale.
    assert engine.target_changed(target, 130, 3050) is False  # within thresholds
    assert engine.target_changed(target, 200, 3050) is True  # brightness diverges
    assert engine.target_changed(target, 130, 3200) is True  # color temp diverges


def test_color_is_manual_ignores_color_temp_expressed_as_rgb():
    # A light reporting our colour temp as RGB is not a manual change.
    target = engine.Target(brightness_pct=50, color_temp_kelvin=3000)
    near = engine.kelvin_to_rgb(3000)
    assert engine.color_is_manual(target, near) is False
    # A clearly different colour (deep blue) is a manual override.
    assert engine.color_is_manual(target, (0, 0, 255)) is True


def test_color_is_manual_compares_against_applied_rgb():
    # When we applied an explicit RGB, compare against that, not the temp.
    target = engine.Target(
        brightness_pct=50, color_temp_kelvin=3000, rgb_color=(10, 200, 40)
    )
    assert engine.color_is_manual(target, (12, 198, 44)) is False  # ~same
    assert engine.color_is_manual(target, (250, 10, 10)) is True  # different
    assert engine.color_is_manual(None, (1, 2, 3)) is False  # no baseline


def test_target_changed_no_baseline_or_missing_actuals():
    target = engine.Target(brightness_pct=50, color_temp_kelvin=3000)
    assert engine.target_changed(None, 255, 6500) is False  # no baseline
    # Missing actuals (e.g. a settling/transition update) are not divergence.
    assert engine.target_changed(target, None, None) is False


def test_explicit_cell_is_clamped_to_light_range():
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    sun = SunConfig()
    drives = _sun_drives(sun, base)
    light = LightConfig(
        max_brightness=100, min_color_temp=2000, max_color_temp=5500
    )
    light.hours[0] = {"brightness": 200, "color_temp": 9000}
    target = engine.light_target(light, sun, drives, 0.0)
    assert target.brightness_pct == 100
    assert target.color_temp_kelvin == 5500


def test_explicit_zero_brightness_stays_off():
    # An explicit 0% must not be clamped up to the light's minimum, so the
    # coordinator can turn the light off at that hour.
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    sun = SunConfig()
    drives = _sun_drives(sun, base)
    light = LightConfig(min_brightness=20, max_brightness=100)
    light.hours[3] = {"brightness": 0, "color_temp": 2500}
    target = engine.light_target(light, sun, drives, 3.0)
    assert target.brightness_pct == 0


def test_rgb_cell_overrides_temperature():
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    sun = SunConfig()
    drives = _sun_drives(sun, base)
    light = LightConfig()
    light.hours[12] = {"brightness": 80, "color_temp": 3000, "rgb_color": [10, 20, 30]}

    at_twelve = engine.light_target(light, sun, drives, 12.0)
    assert at_twelve.rgb_color == (10, 20, 30)  # rgb overrides
    assert at_twelve.color_temp_kelvin is not None  # baseline still present
    assert at_twelve.brightness_pct == 80


def test_rgb_interpolates_between_two_rgb_hours():
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    sun = SunConfig()
    drives = _sun_drives(sun, base)
    light = LightConfig()
    light.hours[10] = {"brightness": 50, "color_temp": 3000, "rgb_color": [0, 0, 0]}
    light.hours[11] = {
        "brightness": 50,
        "color_temp": 3000,
        "rgb_color": [100, 200, 50],
    }
    mid = engine.light_target(light, sun, drives, 10.5)
    assert mid.rgb_color == (50, 100, 25)


def test_rgb_snaps_for_mixed_neighbours():
    base = dt.datetime(2026, 6, 14, tzinfo=UTC)
    sun = SunConfig()
    drives = _sun_drives(sun, base)
    light = LightConfig()
    light.hours[12] = {"brightness": 50, "color_temp": 3000, "rgb_color": [1, 2, 3]}
    # Just past the rgb hour -> still rgb (nearer); well after -> no rgb (temp).
    assert engine.light_target(light, sun, drives, 12.2).rgb_color == (1, 2, 3)
    assert engine.light_target(light, sun, drives, 12.8).rgb_color is None
