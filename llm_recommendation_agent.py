import re
import json
import time
import google.generativeai as genai
from typing import Dict, Any
from ml_model.agents_project_life.ML_andRetriever_agent import run_agent1  # Agent 1 (forecaster + hospital retriever)

# -----------------------------
# CONFIGURATION
# -----------------------------
GOOGLE_API_KEY = "AIzaSyD_El1U098OO6jHcQu-OA2CRanmNxIS52k"  # 🔑 Replace with your API key
genai.configure(api_key=GOOGLE_API_KEY)

PRIMARY_MODEL = "models/gemini-pro-latest"
FALLBACK_MODEL = "models/gemini-flash-latest"


# -----------------------------
# GEMINI CALLER WITH FALLBACK
# -----------------------------
def call_gemini_with_fallback(prompt: str, retries: int = 2) -> str:
    """Calls Gemini Pro with auto fallback to Flash if unavailable."""
    for attempt in range(retries):
        try:
            model = genai.GenerativeModel(PRIMARY_MODEL)
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text

        except Exception as e:
            err = str(e)
            print(f"⚠️ Gemini Pro error: {err}")
            if any(k in err.lower() for k in ["not found", "quota", "limit", "unavailable"]):
                print(f"⚙️ Falling back → {FALLBACK_MODEL}")
                try:
                    model = genai.GenerativeModel(FALLBACK_MODEL)
                    response = model.generate_content(prompt)
                    if response and response.text:
                        return response.text
                except Exception as f2:
                    print("❌ Fallback model failed:", f2)
                    raise f2

            # Retry on transient errors
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise

    raise RuntimeError("All Gemini attempts failed.")


# -----------------------------
# JSON CLEANUP / EXTRACTION
# -----------------------------
def extract_json_from_text(text: str) -> dict:
    """Extracts JSON from Gemini text response safely."""
    if not text:
        raise ValueError("Empty response from Gemini")

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        json_str = match.group(0)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass

    fixed = (
        text.replace("'", '"')
        .replace(",}", "}")
        .replace(",]", "]")
        .strip()
    )
    return json.loads(fixed)


# -----------------------------
# AGENT 2 — LLM PLANNER
# -----------------------------
def run_agent2_llm(input_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Uses Gemini 2.x to create individualized hospital surge plans."""

    # 1️⃣ Run Agent 1 (forecaster)
    agent1_output = run_agent1(input_payload)
    surge = agent1_output["surgeForecast"]
    surge_type = surge["primarySurgeType"]
    surge_severity = surge["primarySurgeSeverity"]
    env = surge.get("environmentalContext", {})
    pincode = agent1_output.get("pincode")

    hospitals_data = agent1_output.get("hospitals", [])
    hospitals = hospitals_data.get("records") if isinstance(hospitals_data, dict) else hospitals_data

    # 2️⃣ Build contextual prompt
    context = f"""
You are an **AI Hospital Operations Planner**.

You will receive a 72-hour surge forecast and a list of hospitals in pincode {pincode}.
Each hospital includes specialty, capacity, staff, and emergency availability.

Generate an individualized operational plan for each hospital based on the surge type and severity.

### Surge Details
- Type: {surge_type}
- Severity: {surge_severity}
- Pincode: {pincode}
- Environmental Context: {json.dumps(env)}

### Rules
- Match hospital specialty to surge type.
- Large + emergency + rating > 4 ⇒ Primary-Surge-Center.
- Small or non-specialty ⇒ Support-Overflow.
- Irrelevant specialty ⇒ Non-Target.
- Never exceed total_beds, icu_beds, or staff counts.
- Actions must be feasible within 72 hours.
- Include the hospital's specialty in output for context.

### Output Schema (JSON only)
{{
  "pincode": "{pincode}",
  "surgeType": "{surge_type}",
  "surgeSeverity": "{surge_severity}",
  "environmentalContext": {json.dumps(env)},
  "hospitalPlans": [
    {{
      "hospital_id": <int>,
      "hospital_name": "<string>",
      "specialty": "<string>",
      "role": "<Primary-Surge-Center|Support-Overflow|Non-Target>",
      "rationale": ["<reason1>", "<reason2>"],
      "recommendedActions": {{
        "staffing": ["..."],
        "capacity": ["..."],
        "inventory": ["..."],
        "coordination": ["..."]
      }}
    }}
  ]
}}

### Hospitals Data
{json.dumps(hospitals, indent=2, ensure_ascii=False)}

Return valid JSON only — no markdown, no explanations.
"""

    # 3️⃣ Call Gemini and extract JSON
    response_text = call_gemini_with_fallback(context)

    try:
        return extract_json_from_text(response_text)
    except Exception as e:
        print("❌ Gemini response not valid JSON:\n", response_text)
        raise ValueError(f"Gemini returned invalid JSON: {e}")


# -----------------------------
# TEST LOCALLY
# -----------------------------
if __name__ == "__main__":
    test_payload = {
        "pincode": 600002,
        "aqi_index": 120,
        "temperature_mean_c": 31,
        "relative_humidity_mean": 68,
        "rain_mm": 2,
        "uv_index_mean": 6,
    }

    print("🚀 Running Agent 2 (Gemini Planner)…")
    result = run_agent2_llm(test_payload)
    print(json.dumps(result, indent=2))
