export type UserRole = 
  | 'CIVILIAN' 
  | 'ASHA_NGO' 
  | 'POLICE' 
  | 'HEALTH_OFFICIAL' 
  | 'DISTRICT_ADMIN' 
  | 'SUPER_ADMIN';

export type VerificationStatus = 
  | 'PENDING_VERIFICATION' 
  | 'APPROVED' 
  | 'REJECTED';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface User {
  id: number;
  phone_number: string;
  email?: string;
  full_name: string;
  role: UserRole;
  verification_status: VerificationStatus;
  state: string;
  district: string;
  block?: string;
  village?: string;
  designation?: string;
  department?: string;
  official_id_number?: string;
  gov_id_type?: string;
  gov_id_masked?: string;
  is_id_verified: boolean;
  trust_score: number;
  total_reports_count?: number;
  verified_reports_count?: number;
  created_at: string;
}

export interface LocationItem {
  location_id: number;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number;
  status: 'active' | 'coming_soon';
  terrain_type: string;
  primary_water_source?: string;
  nearest_health_facility?: string;
  asha_count: number;
  current_risk_level: RiskLevel;
  case_count_7day: number;
  ml_risk_probability: number;
  ml_confidence: string;
  latest_wqi: number;
  latest_rainfall: number;
  active_alerts_count: number;
}

export interface FactorWeights {
  case_load_contrib_pct: number;
  wqi_contamination_contrib_pct: number;
  rainfall_runoff_contrib_pct: number;
  velocity_anomaly_contrib_pct: number;
  primary_driver: string;
}

export interface LocationDetail {
  location: LocationItem;
  latest_environmental_data?: {
    water_quality_index: number;
    rainfall_mm: number;
    ph: number;
    turbidity_ntu: number;
    chlorine_ppm: number;
    flood_risk_level: string;
    water_source_tested: string;
    recorded_at: string;
  };
  last_20_reports: Array<{
    report_id: number;
    reporter_type: string;
    symptoms: string[];
    patient_age_group: string;
    severity: string;
    affected_count: number;
    water_source?: string;
    tracking_id: string;
    verification_status: string;
    reported_at: string;
  }>;
  case_trend_7day: Array<{
    date: string;
    cases: number;
  }>;
  case_trend_30day: Array<{
    date: string;
    cases: number;
    rainfall: number;
  }>;
  current_risk_score?: {
    risk_level: RiskLevel;
    case_count_7day: number;
    ml_risk_probability: number;
    ml_confidence: string;
    z_score_anomaly: number;
    recommended_action: string;
    computed_at: string;
    contributing_factors?: {
      factor_weights?: FactorWeights;
      rule_evaluation?: Record<string, string>;
      recommended_action?: string;
    };
  };
  assigned_ashas: Array<{
    id: number;
    name: string;
    designation: string;
    phone: string;
    trust_score: number;
  }>;
  active_alerts: Array<{
    alert_id: number;
    title: string;
    message: string;
    severity: string;
    triggered_at: string;
  }>;
  explainability: Record<string, any>;
}

export interface SymptomReport {
  report_id: number;
  location_id: number;
  location_name?: string;
  district?: string;
  state?: string;
  reporter_type: string;
  symptoms: string[];
  patient_age_group: string;
  severity: string;
  affected_count: number;
  water_source?: string;
  notes?: string;
  tracking_id: string;
  verification_status: 'unverified' | 'verified' | 'rejected';
  verified_by_name?: string;
  verified_at?: string;
  verification_notes?: string;
  trust_weight: number;
  is_geo_consistent: boolean;
  photo_url?: string;
  voice_note_url?: string;
  reported_at: string;
}

export interface AlertItem {
  alert_id: number;
  location_id: number;
  location_name?: string;
  district?: string;
  state?: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'escalated' | 'resolved';
  assigned_to_name?: string;
  action_logs: Array<{
    action: string;
    user: string;
    role: string;
    note?: string;
    details?: string;
    timestamp: string;
  }>;
  resolution_notes?: string;
  triggered_at: string;
  resolved_at?: string;
}

export interface DashboardSummary {
  monitored_villages_count: number;
  active_alerts_count: number;
  cases_today_count: number;
  cases_7day_count: number;
  high_risk_villages_count: number;
  medium_risk_villages_count: number;
  low_risk_villages_count: number;
  avg_wqi: number;
  verified_reports_count: number;
  unverified_reports_count: number;
  validation_metrics: {
    lead_time_days: number;
    lead_time_desc: string;
    sensitivity_pct: number;
    sensitivity_desc: string;
    false_alert_rate_pct: number;
    false_alert_desc: string;
    coverage_pct: number;
    coverage_desc: string;
  };
  disease_distribution: Record<string, number>;
  top_attention_villages: Array<{
    location_id: number;
    name: string;
    district: string;
    state: string;
    risk_level: RiskLevel;
    case_count_7day: number;
    ml_risk_probability: number;
    ml_confidence: string;
    wqi: number;
    rainfall: number;
    factor_weights: FactorWeights;
    recommended_action: string;
  }>;
  monsoon_trend: Array<{
    date: string;
    cases: number;
    avg_rainfall: number;
  }>;
  data_quality: {
    completeness_score_pct: number;
    duplicate_reports_suppressed: number;
    geo_consistency_rate_pct: number;
    last_sensor_sync: string;
  };
}

export type ThemeMode = 'light' | 'dark' | 'high-contrast';
