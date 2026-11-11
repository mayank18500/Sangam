import pytest
from app.normalization.cleaner import clean_text, normalize_entity_name, haversine_distance_km, geo_proximity_score

def test_clean_text():
    raw = "  The Oberoi Grand, Kolkata!  "
    assert clean_text(raw) == "the oberoi grand kolkata"

def test_normalize_hotel_name():
    # Noise tokens like 'hotel', 'the' should be stripped
    name1 = "The Oberoi Grand Hotel"
    name2 = "Oberoi Grand"
    assert normalize_entity_name(name1, "HOTEL") == "oberoi grand"
    assert normalize_entity_name(name2, "HOTEL") == "oberoi grand"

def test_normalize_sightseeing_name():
    name1 = "Victoria Memorial Hall Guided Tour"
    name2 = "Victoria Memorial Hall"
    assert normalize_entity_name(name1, "SIGHTSEEING") == "victoria memorial hall"
    assert normalize_entity_name(name2, "SIGHTSEEING") == "victoria memorial hall"

def test_haversine_distance():
    # Kolkata to Kolkata same point = 0km
    d = haversine_distance_km(22.5626, 88.3510, 22.5626, 88.3510)
    assert d == 0.0
    
    # Distance of approx 100 meters
    d_near = haversine_distance_km(22.5626, 88.3510, 22.5630, 88.3515)
    assert d_near < 0.2
    assert geo_proximity_score(d_near, 1.0) > 0.8
