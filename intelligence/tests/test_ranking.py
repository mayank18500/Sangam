import pytest
from app.ranking.engine import offer_ranking_engine
from app.schemas.ranking import OfferRankingRequest, OfferInput

def test_offer_ranking_prefers_better_price_and_reliability():
    cheap_reliable = OfferInput(
        offer_id="offer-1",
        supplier_id="sup-1",
        supplier_name="GlobalBedBank",
        supplier_reliability_score=0.95,
        net_price=120.0,
        cancellation_refundable=True,
        cancellation_deadline_hours=24,
        meal_plan="Bed & Breakfast",
        transfer_included=True,
    )
    
    expensive_unreliable = OfferInput(
        offer_id="offer-2",
        supplier_id="sup-2",
        supplier_name="ShakySupplier",
        supplier_reliability_score=0.60,
        net_price=250.0,
        cancellation_refundable=False,
    )
    
    req = OfferRankingRequest(offers=[expensive_unreliable, cheap_reliable])
    res = offer_ranking_engine.rank_offers(req)
    
    assert res.total_offers_evaluated == 2
    assert res.ranked_offers[0].offer_id == "offer-1"
    assert res.ranked_offers[0].rank_position == 1
    assert res.ranked_offers[0].overall_score > res.ranked_offers[1].overall_score
