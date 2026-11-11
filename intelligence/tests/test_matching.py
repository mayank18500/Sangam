import pytest
from app.matching.engine import matching_engine
from app.schemas.matching import (
    EntityMatchRequest,
    SourceEntity,
    TargetCanonicalEntity,
    InventoryCategoryEnum,
    MatchStatusEnum,
)

def test_hotel_exact_duplicate_match():
    source = SourceEntity(
        id="supp-101",
        name="The Oberoi Grand, Kolkata",
        category=InventoryCategoryEnum.HOTEL,
        city="Kolkata",
        country="India",
        latitude=22.5626,
        longitude=88.3510,
        star_rating=5.0,
    )
    
    canonical = TargetCanonicalEntity(
        id="canon-001",
        name="Oberoi Grand Hotel",
        category=InventoryCategoryEnum.HOTEL,
        destination_city="Kolkata",
        destination_country="India",
        latitude=22.5628,
        longitude=88.3512,
        star_rating=5.0,
    )
    
    unrelated = TargetCanonicalEntity(
        id="canon-002",
        name="Taj Palace New Delhi",
        category=InventoryCategoryEnum.HOTEL,
        destination_city="New Delhi",
        destination_country="India",
        latitude=28.5985,
        longitude=77.1725,
        star_rating=5.0,
    )
    
    req = EntityMatchRequest(
        source=source,
        candidates=[canonical, unrelated]
    )
    
    res = matching_engine.match_entities(req)
    assert res.best_match is not None
    assert res.best_match.canonical_id == "canon-001"
    assert res.best_match.overall_confidence >= 0.85
    assert res.best_match.match_status == MatchStatusEnum.AUTO_MATCHED
    
    # Ensure unrelated hotel is unmatched or ranked low
    unrelated_res = [c for c in res.ranked_candidates if c.canonical_id == "canon-002"][0]
    assert unrelated_res.overall_confidence < 0.40

def test_different_products_do_not_merge():
    # Taj Bengal Kolkata vs Taj Palace Delhi
    source = SourceEntity(
        id="supp-taj-bengal",
        name="Taj Bengal Kolkata",
        category=InventoryCategoryEnum.HOTEL,
        city="Kolkata",
        country="India",
        latitude=22.5360,
        longitude=88.3320,
    )
    
    taj_palace = TargetCanonicalEntity(
        id="canon-taj-palace",
        name="Taj Palace New Delhi",
        category=InventoryCategoryEnum.HOTEL,
        destination_city="New Delhi",
        destination_country="India",
        latitude=28.5985,
        longitude=77.1725,
    )
    
    req = EntityMatchRequest(
        source=source,
        candidates=[taj_palace]
    )
    
    res = matching_engine.match_entities(req)
    assert res.best_match is not None
    # Because of city mismatch penalty, it must NOT auto-match
    assert res.best_match.overall_confidence < 0.50
    assert res.best_match.match_status == MatchStatusEnum.UNMATCHED
