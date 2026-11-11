import { env } from '../config/env.js';

export interface EntityMatchPayload {
  source: any;
  candidates: any[];
  auto_match_threshold?: number;
  review_threshold?: number;
}

export interface OfferRankPayload {
  offers: any[];
  price_weight?: number;
  reliability_weight?: number;
  cancellation_weight?: number;
  inclusions_weight?: number;
}

export class IntelligenceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.INTELLIGENCE_SERVICE_URL;
  }

  async checkHealth(): Promise<{ status: string; service: string }> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) {
      throw new Error(`Intelligence health check failed with status ${res.status}`);
    }
    return (await res.json()) as { status: string; service: string };
  }

  async matchEntities(payload: EntityMatchPayload): Promise<any> {
    const res = await fetch(`${this.baseUrl}/match/entities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Intelligence entity matching failed: ${errText}`);
    }
    return res.json();
  }

  async rankOffers(payload: OfferRankPayload): Promise<any> {
    const res = await fetch(`${this.baseUrl}/rank/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Intelligence offer ranking failed: ${errText}`);
    }
    return res.json();
  }
}

export const intelligenceClient = new IntelligenceClient();
