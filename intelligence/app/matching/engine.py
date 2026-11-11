from typing import List, Optional
from rapidfuzz import fuzz

from app.schemas.matching import (
    SourceEntity,
    TargetCanonicalEntity,
    MatchCandidate,
    ScoreComponent,
    MatchStatusEnum,
    EntityMatchRequest,
    EntityMatchResponse,
    SourceVariant,
    TargetCanonicalVariant,
    VariantMatchCandidate,
    VariantMatchRequest,
    VariantMatchResponse,
)
from app.normalization.cleaner import (
    normalize_entity_name,
    clean_text,
    haversine_distance_km,
    geo_proximity_score,
)
from app.config.settings import settings

class MatchingEngine:
    def match_entities(self, request: EntityMatchRequest) -> EntityMatchResponse:
        source = request.source
        category = source.category.value
        source_normalized = normalize_entity_name(source.name, category)
        
        auto_thresh = request.auto_match_threshold or settings.auto_match_threshold
        review_thresh = request.review_threshold or settings.review_required_threshold
        
        candidates_scored: List[MatchCandidate] = []
        
        for cand in request.candidates:
            cand_normalized = normalize_entity_name(cand.name, category)
            
            # 1. Name Similarity (token_set_ratio handles reordered words and partial overlap)
            name_score_raw = fuzz.token_set_ratio(source_normalized, cand_normalized) / 100.0
            
            # Secondary check with exact ratio
            direct_ratio = fuzz.ratio(clean_text(source.name), clean_text(cand.name)) / 100.0
            combined_name_score = (name_score_raw * 0.7) + (direct_ratio * 0.3)
            
            # 2. Geo Proximity
            geo_score = 0.5  # Neutral default if coordinates absent
            geo_explanation = "Coordinates unavailable; neutral score applied."
            if (source.latitude is not None and source.longitude is not None and
                cand.latitude is not None and cand.longitude is not None):
                dist_km = haversine_distance_km(
                    source.latitude, source.longitude,
                    cand.latitude, cand.longitude
                )
                geo_score = geo_proximity_score(dist_km, max_radius_km=1.5)
                geo_explanation = f"Distance: {dist_km:.3f} km. Proximity score: {geo_score:.2f}."
            
            # 3. Star Rating / Category Specific
            star_score = 1.0
            star_explanation = "Ratings identical or unavailable."
            if source.star_rating is not None and cand.star_rating is not None:
                diff = abs(float(source.star_rating) - float(cand.star_rating))
                star_score = max(0.0, 1.0 - (diff * 0.3))
                star_explanation = f"Source {source.star_rating}★ vs Canonical {cand.star_rating}★."
            
            # 4. Address / City Matching
            addr_score = 0.5
            addr_explanation = "Address not provided."
            src_addr = clean_text(source.address or source.city or "")
            cand_addr = clean_text(cand.address or cand.destination_city or "")
            if src_addr and cand_addr:
                addr_score = fuzz.token_set_ratio(src_addr, cand_addr) / 100.0
                addr_explanation = f"Address token similarity: {addr_score:.2f}."
            
            # Determine weights based on category
            if category == "HOTEL":
                w = settings.hotel_weights
                overall = (
                    combined_name_score * w.name_similarity +
                    geo_score * w.geo_proximity +
                    star_score * w.star_rating +
                    addr_score * w.address_similarity
                )
                components = [
                    ScoreComponent(
                        metric="name_similarity",
                        score=round(combined_name_score, 4),
                        weight=w.name_similarity,
                        weighted_score=round(combined_name_score * w.name_similarity, 4),
                        explanation=f"Normalized '{source_normalized}' vs '{cand_normalized}'.",
                    ),
                    ScoreComponent(
                        metric="geo_proximity",
                        score=round(geo_score, 4),
                        weight=w.geo_proximity,
                        weighted_score=round(geo_score * w.geo_proximity, 4),
                        explanation=geo_explanation,
                    ),
                    ScoreComponent(
                        metric="star_rating",
                        score=round(star_score, 4),
                        weight=w.star_rating,
                        weighted_score=round(star_score * w.star_rating, 4),
                        explanation=star_explanation,
                    ),
                    ScoreComponent(
                        metric="address_similarity",
                        score=round(addr_score, 4),
                        weight=w.address_similarity,
                        weighted_score=round(addr_score * w.address_similarity, 4),
                        explanation=addr_explanation,
                    ),
                ]
            else:
                w_sight = settings.sightseeing_weights
                overall = (
                    combined_name_score * w_sight.name_similarity +
                    geo_score * w_sight.geo_proximity +
                    addr_score * (w_sight.duration_match + w_sight.destination_city)
                )
                components = [
                    ScoreComponent(
                        metric="name_similarity",
                        score=round(combined_name_score, 4),
                        weight=w_sight.name_similarity,
                        weighted_score=round(combined_name_score * w_sight.name_similarity, 4),
                        explanation=f"Normalized '{source_normalized}' vs '{cand_normalized}'.",
                    ),
                    ScoreComponent(
                        metric="geo_proximity",
                        score=round(geo_score, 4),
                        weight=w_sight.geo_proximity,
                        weighted_score=round(geo_score * w_sight.geo_proximity, 4),
                        explanation=geo_explanation,
                    ),
                    ScoreComponent(
                        metric="location_similarity",
                        score=round(addr_score, 4),
                        weight=w_sight.destination_city + w_sight.duration_match,
                        weighted_score=round(addr_score * (w_sight.destination_city + w_sight.duration_match), 4),
                        explanation=addr_explanation,
                    ),
                ]
            
            # City check penalty: if cities are specified and completely different, penalize heavily
            if source.city and cand.destination_city:
                city_sim = fuzz.ratio(clean_text(source.city), clean_text(cand.destination_city))
                if city_sim < 60:
                    overall = overall * 0.3
                    components.append(
                        ScoreComponent(
                            metric="city_mismatch_penalty",
                            score=0.3,
                            weight=1.0,
                            weighted_score=overall,
                            explanation=f"City mismatch: '{source.city}' != '{cand.destination_city}'. Match heavily penalized.",
                        )
                    )
            
            confidence = round(min(1.0, max(0.0, overall)), 4)
            
            if confidence >= auto_thresh:
                status = MatchStatusEnum.AUTO_MATCHED
                reasoning = f"High confidence match ({confidence:.2f} >= {auto_thresh:.2f})."
            elif confidence >= review_thresh:
                status = MatchStatusEnum.REVIEW_REQUIRED
                reasoning = f"Moderate confidence match ({confidence:.2f}); flagged for analyst review."
            else:
                status = MatchStatusEnum.UNMATCHED
                reasoning = f"Confidence score ({confidence:.2f}) below minimum review threshold ({review_thresh:.2f})."
            
            candidates_scored.append(
                MatchCandidate(
                    canonical_id=cand.id,
                    canonical_name=cand.name,
                    overall_confidence=confidence,
                    match_status=status,
                    score_breakdown=components,
                    reasoning=reasoning,
                )
            )
        
        # Sort candidates descending by confidence
        candidates_scored.sort(key=lambda c: c.overall_confidence, reverse=True)
        best = candidates_scored[0] if candidates_scored else None
        
        return EntityMatchResponse(
            source_id=source.id,
            source_name=source.name,
            normalized_name=source_normalized,
            best_match=best,
            ranked_candidates=candidates_scored,
        )

    def match_variants(self, request: VariantMatchRequest) -> VariantMatchResponse:
        source = request.source_variant
        source_clean = clean_text(source.raw_name)
        
        results: List[VariantMatchCandidate] = []
        for cand in request.candidates:
            cand_clean = clean_text(cand.name)
            score = fuzz.token_sort_ratio(source_clean, cand_clean) / 100.0
            
            if score >= 0.80:
                status = MatchStatusEnum.AUTO_MATCHED
                reason = f"Variant names match strongly ({score:.2f})."
            elif score >= 0.60:
                status = MatchStatusEnum.REVIEW_REQUIRED
                reason = f"Variant names share common attributes ({score:.2f}); review recommended."
            else:
                status = MatchStatusEnum.UNMATCHED
                reason = f"Variant similarity low ({score:.2f})."
            
            results.append(
                VariantMatchCandidate(
                    canonical_variant_id=cand.id,
                    canonical_variant_name=cand.name,
                    confidence_score=round(score, 4),
                    match_status=status,
                    reasoning=reason,
                )
            )
        
        results.sort(key=lambda v: v.confidence_score, reverse=True)
        best = results[0] if results else None
        
        return VariantMatchResponse(
            source_variant_id=source.id,
            best_match=best,
            ranked_candidates=results,
        )

matching_engine = MatchingEngine()
