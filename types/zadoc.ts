export type SkinType = 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive';
export type RecommendationType = 'best' | 'avoid';
export type AnalysisStatus = 'empty' | 'collecting' | 'processing' | 'complete' | 'failed';
export type PaymentStatus = 'created' | 'pending' | 'successful' | 'failed' | 'expired';

 
export interface ZadocUser { id: string; name: string; phone: string; language: 'en' | 'fr'; created_at: string; }
export interface ZadocProfile { id: string; user_id: string; name: string; image_url: string | null; age: number | null; gender: 'female' | 'male' | 'prefer_not_to_say' | null; routine_level: 'none' | 'simple' | 'moderate' | 'detailed' | null; reported_condition: string | null; skin_type: SkinType | null; skin_score: number | null; analysis_status: AnalysisStatus; is_unlocked: boolean; }
export interface SkinAnalysis { id: string; profile_id: string; image_url: string; skin_type: SkinType; skin_score: number; insights_json: string[]; created_at: string; }
export interface Product { id: string; name: string; slug: string; description: string; category: string; benefits: string[]; usage: string; warnings: string; active: boolean; images: { image_url: string; display_order: number }[]; }
export interface ProductRecommendation { id: string; product_id: string; skin_type: SkinType; recommendation_type: RecommendationType; rank: number; reason: string; product: Product; }
export interface Payment { id: string; user_id: string; profile_id: string; amount: number; currency: string; status: PaymentStatus; external_id: string; created_at: string; confirmed_at: string | null; }
 
