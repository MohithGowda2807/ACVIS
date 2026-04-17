// ─── ACVIS Global State Store ───
import { create } from 'zustand';
import {
  type Review, type ProcessedReview, type AIOutput,
  type FeatureStats, type Alert, type Action, type TrendDay, type SpikeInfo,
  SAMPLE_REVIEWS, SAMPLE_COMPETITOR_REVIEWS
} from '@/lib/data';
import {
  runFullPipeline, calculateRiskVelocity, generateAutonomousDirectives,
  aggregateFeatureSentiment
} from '@/lib/engine';
import { api } from '@/lib/api';

interface AppState {
  // Pipeline data
  rawReviews: Review[];
  processedReviews: ProcessedReview[];
  aiOutputs: AIOutput[];
  featureSentiment: Record<string, FeatureStats>;
  trends: Record<string, Record<string, TrendDay>>;
  trendAlerts: Record<string, SpikeInfo>;
  rootCauses: Record<string, Record<string, number>>;
  emotions: Record<string, number>;
  predictions: { current: number; predicted: number; trend: string; slope: number };
  actions: Action[];
  alerts: Alert[];
  revenueImpact: {
    loss: number; churnIncrease: number; topLiability: string;
    exposure: number; recovery: number; currentRating: number; predictedRating: number;
  };

  // UI state
  isProcessing: boolean;
  pipelineStep: number;
  pipelineLabel: string;
  portal: 'company' | 'user';
  backendConnected: boolean;

  // Comparison
  companyStats: Record<string, FeatureStats> | null;
  competitorStats: Record<string, FeatureStats> | null;

  // User reviews
  userReviews: Review[];

  // Actions
  runPipeline: (reviews: Review[], isCompetitor?: boolean) => Promise<void>;
  runSamplePipeline: () => Promise<void>;
  runCompetitorPipeline: () => Promise<void>;
  submitUserReview: (text: string, rating: number, source: string) => void;
  loadFromBackend: () => Promise<void>;
  resetState: () => void;
  setPortal: (portal: 'company' | 'user') => void;
}

const initialState = {
  rawReviews: [],
  processedReviews: [],
  aiOutputs: [],
  featureSentiment: {},
  trends: {},
  trendAlerts: {},
  rootCauses: {},
  emotions: { anger: 0, frustration: 0, satisfaction: 0, neutral: 0 },
  predictions: { current: 0, predicted: 0, trend: 'stable', slope: 0 },
  actions: [],
  alerts: [],
  revenueImpact: { loss: 0, churnIncrease: 0, topLiability: '--', exposure: 0, recovery: 0, currentRating: 0, predictedRating: 0 },
  isProcessing: false,
  pipelineStep: -1,
  pipelineLabel: '',
  backendConnected: false,
  companyStats: null,
  competitorStats: null,
  userReviews: [],
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,
  portal: 'company',

  runPipeline: async (reviews: Review[], isCompetitor = false) => {
    if (get().isProcessing) return;
    set({ isProcessing: true, pipelineStep: 0, pipelineLabel: 'Sending to backend...' });

    try {
      // Try backend first
      set({ pipelineStep: 1, pipelineLabel: 'Backend NLP processing...' });
      const result = await api.analyze(reviews);

      if (result && result.status === 'success') {
        set({ pipelineStep: 3, pipelineLabel: 'Processing results...' });

        // Map backend snake_case to frontend camelCase
        const mappedRevenue = result.revenue_impact ? {
          loss: result.revenue_impact.loss || 0,
          churnIncrease: result.revenue_impact.churn_increase || 0,
          topLiability: result.revenue_impact.top_liability || '--',
          exposure: result.revenue_impact.exposure || 0,
          recovery: result.revenue_impact.recovery || 0,
          currentRating: result.revenue_impact.current_rating || 0,
          predictedRating: result.revenue_impact.predicted_rating || 0,
        } : initialState.revenueImpact;

        const stateUpdate: any = {
          rawReviews: reviews,
          featureSentiment: result.feature_sentiment || {},
          predictions: result.predictions || initialState.predictions,
          trends: result.trends || {},
          trendAlerts: result.trend_alerts || {},
          rootCauses: result.root_causes || {},
          emotions: result.emotions || initialState.emotions,
          actions: result.actions || [],
          alerts: result.alerts || [],
          revenueImpact: mappedRevenue,
          isProcessing: false,
          pipelineStep: 5,
          pipelineLabel: 'Complete (Backend NLP)',
          backendConnected: true,
        };

        if (isCompetitor) {
          stateUpdate.competitorStats = { ...stateUpdate.featureSentiment };
          stateUpdate.companyStats = get().companyStats;
        } else {
          stateUpdate.companyStats = { ...stateUpdate.featureSentiment };
        }

        set(stateUpdate);
        return;
      }
    } catch (e) {
      console.warn('Backend unavailable, falling back to client-side NLP:', e);
    }

    // Fallback to client-side engine
    try {
      set({ pipelineStep: 1, pipelineLabel: 'Client-side NLP processing...' });
      const result = await runFullPipeline(reviews, (step, label) => {
        set({ pipelineStep: step, pipelineLabel: label });
      });

      if (isCompetitor) {
        set({
          ...result,
          isProcessing: false,
          pipelineStep: 5,
          pipelineLabel: 'Complete (Client)',
          backendConnected: false,
          competitorStats: { ...result.featureSentiment },
          companyStats: get().companyStats,
        });
      } else {
        set({
          ...result,
          isProcessing: false,
          pipelineStep: 5,
          pipelineLabel: 'Complete (Client)',
          backendConnected: false,
          companyStats: { ...result.featureSentiment },
        });
      }
    } catch (e) {
      console.error('Pipeline error:', e);
      set({ isProcessing: false, pipelineStep: -1, pipelineLabel: 'Error' });
    }
  },

  runSamplePipeline: async () => {
    if (get().isProcessing) return;
    set({ isProcessing: true, pipelineStep: 0, pipelineLabel: 'Loading sample data...' });

    // Try backend with sample reviews
    try {
      set({ pipelineStep: 1, pipelineLabel: 'Sending sample reviews to backend...' });
      const result = await api.analyze(SAMPLE_REVIEWS);

      if (result && result.status === 'success') {
        set({ pipelineStep: 3, pipelineLabel: 'Processing results...' });

        const mappedRevenue = result.revenue_impact ? {
          loss: result.revenue_impact.loss || 0,
          churnIncrease: result.revenue_impact.churn_increase || 0,
          topLiability: result.revenue_impact.top_liability || '--',
          exposure: result.revenue_impact.exposure || 0,
          recovery: result.revenue_impact.recovery || 0,
          currentRating: result.revenue_impact.current_rating || 0,
          predictedRating: result.revenue_impact.predicted_rating || 0,
        } : initialState.revenueImpact;

        set({
          rawReviews: SAMPLE_REVIEWS,
          featureSentiment: result.feature_sentiment || {},
          predictions: result.predictions || initialState.predictions,
          trends: result.trends || {},
          trendAlerts: result.trend_alerts || {},
          rootCauses: result.root_causes || {},
          emotions: result.emotions || initialState.emotions,
          actions: result.actions || [],
          alerts: result.alerts || [],
          revenueImpact: mappedRevenue,
          isProcessing: false,
          pipelineStep: 5,
          pipelineLabel: 'Complete (Backend NLP)',
          backendConnected: true,
          companyStats: result.feature_sentiment || {},
        });
        return;
      }
    } catch (e) {
      console.warn('Backend unavailable for sample pipeline, falling back:', e);
    }

    // Fallback: try loading pre-computed AI data
    try {
      const response = await fetch('/ai_results.json');
      const aiData = await response.json();

      set({ pipelineStep: 3, pipelineLabel: 'Processing data...' });
      await new Promise(r => setTimeout(r, 500));

      set({
        rawReviews: aiData.rawReviews,
        processedReviews: aiData.rawReviews,
        aiOutputs: aiData.aiOutputs,
        featureSentiment: aiData.featureSentiment,
        predictions: aiData.predictions,
        isProcessing: false,
        pipelineStep: 5,
        pipelineLabel: 'Complete (Cached)',
        backendConnected: false,
        companyStats: aiData.featureSentiment,
      });
    } catch (e) {
      console.warn('Cached data not available, running client-side pipeline:', e);
      // Final fallback: full client-side pipeline
      await get().runPipeline([...SAMPLE_REVIEWS], false);
    }
  },

  runCompetitorPipeline: async () => {
    await get().runPipeline([...SAMPLE_COMPETITOR_REVIEWS], true);
  },

  loadFromBackend: async () => {
    try {
      const [insightsData, alertsData, actionsData, trendsData, revenueData] = await Promise.all([
        api.getInsights().catch(() => null),
        api.getAlerts().catch(() => []),
        api.getActions().catch(() => []),
        api.getTrends().catch(() => ({ trends: {}, trend_alerts: {} })),
        api.getRevenue().catch(() => ({})),
      ]);

      // Only populate if there's actual data
      if (insightsData && insightsData.feature_sentiment && Object.keys(insightsData.feature_sentiment).length > 0) {
        const mappedRevenue = revenueData ? {
          loss: revenueData.loss || 0,
          churnIncrease: revenueData.churn_increase || 0,
          topLiability: revenueData.top_liability || '--',
          exposure: revenueData.exposure || 0,
          recovery: revenueData.recovery || 0,
          currentRating: revenueData.current_rating || 0,
          predictedRating: revenueData.predicted_rating || 0,
        } : initialState.revenueImpact;

        set({
          featureSentiment: insightsData.feature_sentiment || {},
          predictions: insightsData.predictions || initialState.predictions,
          emotions: insightsData.emotions || initialState.emotions,
          trends: trendsData.trends || insightsData.trends || {},
          trendAlerts: trendsData.trend_alerts || insightsData.trend_alerts || {},
          rootCauses: insightsData.root_causes || {},
          alerts: alertsData || [],
          actions: actionsData || [],
          revenueImpact: mappedRevenue,
          rawReviews: [{ review_id: 'loaded', text: 'Loaded from backend', rating: null, timestamp: '', source: '' }],
          backendConnected: true,
          companyStats: insightsData.feature_sentiment || {},
        });
      }
    } catch (e) {
      console.warn('Could not load from backend:', e);
    }
  },

  submitUserReview: (text: string, rating: number, source: string) => {
    const review: Review = {
      review_id: `USR-${Date.now()}`,
      text,
      rating,
      timestamp: new Date().toISOString(),
      source,
    };
    set(state => ({ userReviews: [...state.userReviews, review] }));
  },

  resetState: () => set({ ...initialState, portal: get().portal }),
  setPortal: (portal) => set({ portal }),
}));
