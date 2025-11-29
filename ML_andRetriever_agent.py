# agents_project_life/agent1.py
from __future__ import annotations
from dataclasses import dataclass, asdict
from typing import List, Dict, Any
from datetime import datetime, timedelta
import statistics as stats
import joblib
import pandas as pd
import numpy as np
import os

# ---------- Config ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.getenv("FORECAST_MODEL_PATH", os.path.join(BASE_DIR, "final_patient_disease_forecast_model.joblib"))
HOSPITAL_DATA_PATH = os.getenv("HOSPITAL_DATA_PATH", os.path.join(BASE_DIR, "hospital_details.csv"))

# ---------- Data Contracts ----------
@dataclass
class Agent1Request:
    pincode: int
    aqi_index: float
    temperature_mean_c: float
    relative_humidity_mean: float
    rain_mm: float
    uv_index_mean: float

@dataclass
class TimeBucket:
    date: str
    predicted_patient_load: float
    predicted_disease_spike: str
    predicted_intensity: str

@dataclass
class SurgeForecast:
    horizonHours: int
    primarySurgeType: str
    primarySurgeSeverity: str
    timeBuckets: List[TimeBucket]

@dataclass
class Hospital:
    hospital_id: str
    hospital_name: str
    city: str
    pincode: str
    specialty: str
    total_beds: int
    icu_beds: int
    ventilators: int
    doctors_available: int
    nurses_available: int
    oxygen_cylinders: int
    ppe_kits: int
    emergency_available: str
    rating: float
    contact_number: str
    last_updated: str

@dataclass
class Agent1Response:
    pincode: str
    surgeForecast: SurgeForecast
    hospitals: List[Hospital]


# ---------- Utilities ----------
def _load_models(model_path: str = MODEL_PATH) -> Dict[str, Any]:
    bundle = joblib.load(model_path)
    return bundle

def _aqi_to_intensity(aqi: float) -> str:
    if 0 <= aqi <= 50:
        return "Good"
    elif 51 <= aqi <= 100:
        return "Moderate"
    elif 101 <= aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif 151 <= aqi <= 200:
        return "Unhealthy"
    elif 201 <= aqi <= 300:
        return "Very Unhealthy"
    elif 301 <= aqi <= 500:
        return "Hazardous"
    return "Invalid AQI"

def _intensity_to_severity(intensity: str) -> str:
    mapping = {
        "Good": "Low",
        "Moderate": "Moderate",
        "Unhealthy for Sensitive Groups": "Moderate",
        "Unhealthy": "High",
        "Very Unhealthy": "High",
        "Hazardous": "Severe",
    }
    return mapping.get(intensity, "Low")

def _build_feature_frame(req: Agent1Request, features: List[str]) -> pd.DataFrame:
    base = {
        "city": 0,
        "pincode": int(req.pincode),
        "population_density": 2000,
        "no_of_hospitals": 5,
        "avg_capacity": 150,
        "pm2_5": req.aqi_index * 0.6,
        "pm10": req.aqi_index * 0.4,
        "temperature_mean_c": req.temperature_mean_c,
        "relative_humidity_mean": req.relative_humidity_mean,
        "uv_index_mean": req.uv_index_mean,
        "rain_mm": req.rain_mm,
        "is_weekend": 0,
        "is_festival": 0,
        "school_open": 1,
        "month": datetime.now().month,
        "respiratory_risk": 0.3,
        "flu_risk": 0.3,
        "vector_risk": 0.3,
        "gastro_risk": 0.3,
    }
    for lag in [1, 2, 3, 7, 14]:
        for col in [
            "patient_load",
            "respiratory_cases",
            "flu_cases",
            "vector_cases",
            "gastro_cases",
            "other_cases",
        ]:
            base[f"{col}_lag{lag}"] = 0.0

    df = pd.DataFrame([base])
    for f in features:
        if f not in df.columns:
            df[f] = 0.0
    df = df[features].apply(pd.to_numeric, errors="coerce").fillna(0.0)
    return df


# ---------- Hospital Loader ----------
def _load_hospitals_by_pincode(pincode: int) -> List[Dict[str, Any]]:
    """
    Reads hospital_details.csv and returns all hospitals matching the given pincode.
    """
    if not os.path.exists(HOSPITAL_DATA_PATH):
        raise FileNotFoundError(f"Hospital data not found at {HOSPITAL_DATA_PATH}")

    df = pd.read_csv(HOSPITAL_DATA_PATH)
    df["pincode"] = df["pincode"].astype(str)
    hospitals = df[df["pincode"] == str(pincode)]

    # Convert to list of dicts for JSON serialization
    return hospitals.to_dict(orient="records")


# ---------- Core Agent ----------
def run_agent1(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Agent 1: takes UI payload, runs ML model, and attaches filtered hospital data.
    """
    req = Agent1Request(**payload)
    bundle = _load_models(MODEL_PATH)
    load_model = bundle["load_model"]
    disease_model = bundle["disease_model"]
    features = bundle["features"]

    aqi_intensity = _aqi_to_intensity(req.aqi_index)
    severity_overall = _intensity_to_severity(aqi_intensity)

    base_date = datetime.now()
    time_buckets: List[TimeBucket] = []
    disease_votes: List[str] = []

    X = _build_feature_frame(req, features)
    last_pred_load = 0.0
    for i in range(3):
        day = base_date + timedelta(days=i + 1)
        if "patient_load_lag1" in X.columns and i > 0:
            X.loc[0, "patient_load_lag1"] = float(last_pred_load)

        load_pred = float(load_model.predict(X)[0])
        disease_pred = str(disease_model.predict(X)[0])
        last_pred_load = load_pred
        disease_votes.append(disease_pred)

        time_buckets.append(
            TimeBucket(
                date=day.strftime("%Y-%m-%d"),
                predicted_patient_load=round(load_pred, 2),
                predicted_disease_spike=disease_pred,
                predicted_intensity=aqi_intensity,
            )
        )

    try:
        primary_type = stats.mode(disease_votes)
    except Exception:
        primary_type = disease_votes[-1] if disease_votes else "respiratory_risk"

    surge = SurgeForecast(
        horizonHours=72,
        primarySurgeType=primary_type,
        primarySurgeSeverity=severity_overall,
        timeBuckets=time_buckets,
    )

    # Fetch hospital details for this pincode
    hospitals = _load_hospitals_by_pincode(req.pincode)

    resp = {
        "pincode": str(req.pincode),
        "surgeForecast": {
            "horizonHours": surge.horizonHours,
            "primarySurgeType": surge.primarySurgeType,
            "primarySurgeSeverity": surge.primarySurgeSeverity,
            "timeBuckets": [asdict(tb) for tb in surge.timeBuckets],
        },
        "hospitals": hospitals,
    }
    return resp


# ---------- Local test ----------
if __name__ == "__main__":
    sample = {
        "pincode": 600002,
        "aqi_index": 90,
        "temperature_mean_c": 28,
        "relative_humidity_mean": 60,
        "rain_mm": 1,
        "uv_index_mean": 3.5,
    }
    out = run_agent1(sample)
    print(out)
