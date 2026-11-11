from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.config.settings import settings
from app.schemas.matching import (
    EntityMatchRequest,
    EntityMatchResponse,
    VariantMatchRequest,
    VariantMatchResponse,
)
from app.schemas.ranking import (
    OfferRankingRequest,
    OfferRankingResponse,
)
from app.matching.engine import matching_engine
from app.ranking.engine import offer_ranking_engine

app = FastAPI(
    title="Sangam Intelligence Service",
    description="AI-powered travel inventory deduplication, matching & offer ranking engine",
    version=settings.version,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.version,
        "timestamp": datetime.utcnow().isoformat(),
        "capabilities": [
            "hotel_deduplication",
            "sightseeing_matching",
            "variant_resolution",
            "multi_criteria_ranking"
        ]
    }

@app.post("/match/entities", response_model=EntityMatchResponse)
def match_entities(request: EntityMatchRequest):
    """
    Evaluates a raw supplier listing against a candidate pool of canonical entities.
    Returns best match, confidence score, and explainable score components.
    """
    try:
        return matching_engine.match_entities(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failure: {str(e)}")

@app.post("/match/variants", response_model=VariantMatchResponse)
def match_variants(request: VariantMatchRequest):
    """
    Matches supplier room types or ticket tiers against canonical variants.
    """
    try:
        return matching_engine.match_variants(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Variant matching failure: {str(e)}")

@app.post("/rank/offers", response_model=OfferRankingResponse)
def rank_offers(request: OfferRankingRequest):
    """
    Ranks multi-supplier offers across price, reliability, cancellation policy, and inclusions.
    """
    try:
        return offer_ranking_engine.rank_offers(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ranking failure: {str(e)}")
