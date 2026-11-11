from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class OfferInput(BaseModel):
    offer_id: str
    supplier_id: str
    supplier_name: str
    supplier_reliability_score: float = Field(ge=0.0, le=1.0, default=0.85)
    net_price: float
    currency: str = "USD"
    cancellation_refundable: bool = True
    cancellation_deadline_hours: Optional[int] = 48
    transfer_included: bool = False
    meal_plan: Optional[str] = None
    inclusions_count: int = 0
    inclusions: List[str] = Field(default_factory=list)
    booking_conditions: Optional[str] = None

class OfferRankBreakdown(BaseModel):
    price_score: float
    reliability_score: float
    cancellation_score: float
    inclusions_score: float

class RankedOffer(BaseModel):
    rank_position: int
    offer_id: str
    overall_score: float
    breakdown: OfferRankBreakdown
    justification: str

class OfferRankingRequest(BaseModel):
    offers: List[OfferInput]
    price_weight: Optional[float] = 0.40
    reliability_weight: Optional[float] = 0.25
    cancellation_weight: Optional[float] = 0.20
    inclusions_weight: Optional[float] = 0.15

class OfferRankingResponse(BaseModel):
    total_offers_evaluated: int
    ranked_offers: List[RankedOffer]
