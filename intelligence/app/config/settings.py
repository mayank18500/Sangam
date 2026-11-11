from pydantic import BaseModel
from typing import Dict

class MatchingWeights(BaseModel):
    name_similarity: float = 0.50
    geo_proximity: float = 0.30
    star_rating: float = 0.10
    address_similarity: float = 0.10

class SightseeingMatchingWeights(BaseModel):
    name_similarity: float = 0.55
    geo_proximity: float = 0.25
    duration_match: float = 0.10
    destination_city: float = 0.10

class RankingWeights(BaseModel):
    price: float = 0.40
    supplier_reliability: float = 0.25
    cancellation_flexibility: float = 0.20
    inclusions_value: float = 0.15

class Settings(BaseModel):
    app_name: str = "Sangam Intelligence Service"
    version: str = "0.1.0"
    auto_match_threshold: float = 0.85
    review_required_threshold: float = 0.65
    hotel_weights: MatchingWeights = MatchingWeights()
    sightseeing_weights: SightseeingMatchingWeights = SightseeingMatchingWeights()
    ranking_weights: RankingWeights = RankingWeights()

settings = Settings()
