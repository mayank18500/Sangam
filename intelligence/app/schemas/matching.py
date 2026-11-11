from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class InventoryCategoryEnum(str, Enum):
    HOTEL = "HOTEL"
    SIGHTSEEING = "SIGHTSEEING"

class MatchStatusEnum(str, Enum):
    AUTO_MATCHED = "AUTO_MATCHED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    UNMATCHED = "UNMATCHED"

class SourceEntity(BaseModel):
    id: str
    name: str
    category: InventoryCategoryEnum
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    star_rating: Optional[float] = None
    description: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)

class TargetCanonicalEntity(BaseModel):
    id: str
    name: str
    category: InventoryCategoryEnum
    destination_city: Optional[str] = None
    destination_country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    star_rating: Optional[float] = None
    description: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ScoreComponent(BaseModel):
    metric: str
    score: float
    weight: float
    weighted_score: float
    explanation: str

class MatchCandidate(BaseModel):
    canonical_id: str
    canonical_name: str
    overall_confidence: float
    match_status: MatchStatusEnum
    score_breakdown: List[ScoreComponent]
    reasoning: str

class EntityMatchRequest(BaseModel):
    source: SourceEntity
    candidates: List[TargetCanonicalEntity]
    auto_match_threshold: Optional[float] = None
    review_threshold: Optional[float] = None

class EntityMatchResponse(BaseModel):
    source_id: str
    source_name: str
    normalized_name: str
    best_match: Optional[MatchCandidate] = None
    ranked_candidates: List[MatchCandidate] = Field(default_factory=list)

# Variant Matching Schemas
class SourceVariant(BaseModel):
    id: str
    raw_name: str
    raw_description: Optional[str] = None
    category: InventoryCategoryEnum
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)

class TargetCanonicalVariant(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: InventoryCategoryEnum
    attributes: Optional[Dict[str, Any]] = Field(default_factory=dict)

class VariantMatchCandidate(BaseModel):
    canonical_variant_id: str
    canonical_variant_name: str
    confidence_score: float
    match_status: MatchStatusEnum
    reasoning: str

class VariantMatchRequest(BaseModel):
    source_variant: SourceVariant
    candidates: List[TargetCanonicalVariant]

class VariantMatchResponse(BaseModel):
    source_variant_id: str
    best_match: Optional[VariantMatchCandidate] = None
    ranked_candidates: List[VariantMatchCandidate] = Field(default_factory=list)
