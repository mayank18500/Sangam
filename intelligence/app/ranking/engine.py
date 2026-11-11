from typing import List
from app.schemas.ranking import (
    OfferRankingRequest,
    OfferRankingResponse,
    RankedOffer,
    OfferRankBreakdown,
)
from app.config.settings import settings

class OfferRankingEngine:
    def rank_offers(self, request: OfferRankingRequest) -> OfferRankingResponse:
        offers = request.offers
        if not offers:
            return OfferRankingResponse(total_offers_evaluated=0, ranked_offers=[])
        
        pw = request.price_weight if request.price_weight is not None else settings.ranking_weights.price
        rw = request.reliability_weight if request.reliability_weight is not None else settings.ranking_weights.supplier_reliability
        cw = request.cancellation_weight if request.cancellation_weight is not None else settings.ranking_weights.cancellation_flexibility
        iw = request.inclusions_weight if request.inclusions_weight is not None else settings.ranking_weights.inclusions_value
        
        # Determine price range
        prices = [o.net_price for o in offers]
        min_price = min(prices)
        max_price = max(prices)
        price_spread = max_price - min_price
        
        ranked: List[RankedOffer] = []
        
        for offer in offers:
            # 1. Price Score: Cheaper is better (1.0 = lowest price, 0.2 = highest price in range)
            if price_spread == 0:
                price_score = 1.0
            else:
                price_score = 1.0 - 0.8 * ((offer.net_price - min_price) / price_spread)
            
            # 2. Reliability Score: Direct supplier rating
            reliability_score = min(1.0, max(0.0, offer.supplier_reliability_score))
            
            # 3. Cancellation Flexibility Score
            cancellation_score = 0.2  # Non-refundable baseline
            if offer.cancellation_refundable:
                hours = offer.cancellation_deadline_hours or 24
                if hours <= 24:
                    cancellation_score = 1.0  # Flexible until 24 hours
                elif hours <= 48:
                    cancellation_score = 0.85
                elif hours <= 72:
                    cancellation_score = 0.70
                else:
                    cancellation_score = 0.50
            
            # 4. Inclusions Score
            inc_score = 0.2
            if offer.meal_plan and "breakfast" in offer.meal_plan.lower():
                inc_score += 0.35
            if offer.transfer_included:
                inc_score += 0.25
            if offer.inclusions_count > 0:
                inc_score += min(0.20, offer.inclusions_count * 0.05)
            inclusions_score = min(1.0, inc_score)
            
            # Overall weighted score
            overall = (
                price_score * pw +
                reliability_score * rw +
                cancellation_score * cw +
                inclusions_score * iw
            )
            
            justification = (
                f"Ranked with price ${offer.net_price:.2f} ({price_score:.2f}), "
                f"supplier reliability {reliability_score:.2f}, "
                f"cancellation flex {cancellation_score:.2f}, and inclusions {inclusions_score:.2f}."
            )
            
            ranked.append(
                RankedOffer(
                    rank_position=1,  # updated after sort
                    offer_id=offer.offer_id,
                    overall_score=round(overall, 4),
                    breakdown=OfferRankBreakdown(
                        price_score=round(price_score, 4),
                        reliability_score=round(reliability_score, 4),
                        cancellation_score=round(cancellation_score, 4),
                        inclusions_score=round(inclusions_score, 4),
                    ),
                    justification=justification,
                )
            )
        
        # Sort descending by overall score
        ranked.sort(key=lambda r: r.overall_score, reverse=True)
        
        # Assign final rank position
        for i, item in enumerate(ranked):
            item.rank_position = i + 1
        
        return OfferRankingResponse(
            total_offers_evaluated=len(ranked),
            ranked_offers=ranked,
        )

offer_ranking_engine = OfferRankingEngine()
