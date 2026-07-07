from typing import Any, Dict, List

from prompts import build_prompt, detect_intent, extract_crop_names
from tools import (
    get_crop_details,
    get_crop_guide,
    get_fertilizer_recommendation,
    get_irrigation_advice,
    get_pest_information,
    get_prediction_history,
)


def _normalize_prediction(prediction: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "crop_name": (prediction.get("predicted_crop") or prediction.get("crop") or "Recommended Crop").strip(),
        "confidence": prediction.get("confidence", 0),
        "season": prediction.get("growing_season") or prediction.get("season") or "Unknown",
        "location": prediction.get("farm_location") or prediction.get("location") or "Unknown",
        "soil_type": prediction.get("soil_type") or "Unknown",
        "n": prediction.get("n", 0),
        "p": prediction.get("p", 0),
        "k": prediction.get("k", 0),
        "temperature": prediction.get("temperature", 0),
        "humidity": prediction.get("humidity", 0),
        "rainfall": prediction.get("rainfall", 0),
        "water_availability": prediction.get("water_availability") or "Unknown",
        "ph": prediction.get("ph", 0),
    }


def _recent_history_summary(history: List[Dict[str, Any]] | None) -> str:
    if not history:
        return ""
    user_messages = [item.get("content", "") for item in history[-4:] if item.get("role") == "user"]
    return " ".join(user_messages).strip()


def _fertilizer_quantity(crop_name: str) -> str:
    crop_name = (crop_name or "").lower()
    if crop_name == "rice":
        return "about 90–120 kg N/ha, 40–60 kg P/ha, and 30–40 kg K/ha"
    if crop_name == "maize":
        return "about 100–140 kg N/ha, 50–70 kg P/ha, and 40–50 kg K/ha"
    if crop_name == "cotton":
        return "about 80–100 kg N/ha, 40–50 kg P/ha, and 40–60 kg K/ha"
    if crop_name == "chickpea":
        return "about 20–30 kg N/ha, 40–50 kg P/ha, and 20–30 kg K/ha"
    if crop_name == "apple":
        return "about 50–80 kg N/ha, 25–35 kg P/ha, and 40–60 kg K/ha"
    return "a balanced crop-specific dose based on soil testing"


def _build_dynamic_response(intent: str, message: str, context: Dict[str, Any], crop_details: Dict[str, Any], crop_guide: Dict[str, Any], fertilizer: Dict[str, Any], irrigation: Dict[str, Any], pest_info: Dict[str, Any], history_summary: str) -> str:
    crop_name = context["crop_name"]
    confidence = context["confidence"]
    location = context["location"]
    season = context["season"]
    soil_type = context["soil_type"]
    rainfall = context["rainfall"]
    water = context["water_availability"]

    if intent == "explain_recommendation":
        return (
            f"{crop_name} was selected because it fits your current farm profile well.\n"
            f"- The model confidence is {confidence}%, which indicates a strong match.\n"
            f"- {crop_details.get('suitability', 'It suits the current soil and climate conditions.')}\n"
            f"- Your {soil_type.lower()} soil, {season} season, and {rainfall} mm rainfall all support this choice."
        )

    if intent == "compare_crops":
        alt_crops = [crop.capitalize() for crop in extract_crop_names(message) if crop.lower() != crop_name.lower()]
        alt_crop = alt_crops[0] if alt_crops else "another crop"
        return (
            f"Compared with {alt_crop}, {crop_name} is still the stronger fit for your field.\n"
            f"- {crop_name} matches your current season, rainfall, and soil profile better.\n"
            f"- {alt_crop} could work, but it would need more adjustment in irrigation, timing, or nutrition."
        )

    if intent == "fertilizer":
        return (
            f"For {crop_name}, a practical starting dose is {_fertilizer_quantity(crop_name)}.\n"
            f"- Split nitrogen into 2–3 applications for better efficiency.\n"
            f"- {fertilizer.get('recommendation', 'Use a balanced crop-specific fertilizer plan.')}"
        )

    if intent == "irrigation":
        return (
            f"For {crop_name}, follow this irrigation approach:\n"
            f"- {irrigation.get('schedule', 'Keep the soil moisture steady and monitor stress signs.')}\n"
            f"- With {water.lower()} water availability and {rainfall} mm rainfall, avoid overwatering during wet periods."
        )

    if intent == "pests":
        return (
            f"Main pests to watch for on {crop_name}:\n"
            f"- {pest_info.get('risks', 'Inspect the crop regularly for insects and early damage.')}\n"
            f"- {pest_info.get('advice', 'Use scouting and timely action to reduce losses.')}"
        )

    if intent == "diseases":
        return (
            f"Common disease risks for {crop_name} include fungal and moisture-related issues.\n"
            f"- Keep the canopy dry and avoid dense planting.\n"
            f"- Inspect leaves and stems regularly for early symptoms."
        )

    if intent == "yield":
        return (
            f"A realistic expectation for {crop_name} is: \n"
            f"- {crop_details.get('yield', 'Yield depends on field management and weather conditions.')}\n"
            f"- Good timing, balanced nutrition, and steady irrigation will improve output."
        )

    if intent == "suitability":
        location_note = "in your current location" if location.lower() == "unknown" else f"for {location}"
        return (
            f"{crop_name} appears suitable {location_note}.\n"
            f"- The current soil type, pH, and season support it.\n"
            f"- If you are asking about a specific region such as Tamil Nadu, I would still check local temperature and rainfall patterns before planting."
        )

    if intent == "rainfall_risk":
        return (
            f"If rainfall drops, {crop_name} may face more stress.\n"
            f"- Increase monitoring of soil moisture and avoid late-season water stress.\n"
            f"- Use mulch and timely irrigation to protect growth."
        )

    if intent == "farming_tips":
        return (
            f"Best practical tips for {crop_name}:\n"
            f"- Keep the field weed-free and monitor regularly.\n"
            f"- Use balanced nutrition and avoid overwatering.\n"
            f"- Follow the season and local weather closely."
        )

    if intent == "confidence":
        return (
            f"The confidence score of {confidence}% means the model found a strong match for your inputs.\n"
            f"- Higher confidence suggests the current soil, weather, and season all align well.\n"
            f"- It does not guarantee field success, so local scouting still matters."
        )

    if history_summary:
        return (
            f"Based on your recent discussion, I would focus on {crop_name} first.\n"
            f"- {crop_details.get('suitability', 'It suits your current farm conditions.')}\n"
            f"- For more detail, ask about fertilizer, irrigation, pests, or expected yield."
        )

    return (
        f"Here is the short answer for {crop_name}:\n"
        f"- It fits your current field conditions.\n"
        f"- Keep an eye on irrigation, nutrition, and pest pressure."
    )


def generate_ai_response(message: str, prediction: Dict[str, Any], history: List[Dict[str, Any]] | None = None, db=None, user_id: int | None = None) -> str:
    context = _normalize_prediction(prediction)
    crop_name = context["crop_name"]
    crop_details = get_crop_details(crop_name)
    crop_guide = get_crop_guide(crop_name)
    fertilizer = get_fertilizer_recommendation(crop_name, context["soil_type"], context["n"], context["p"], context["k"])
    irrigation = get_irrigation_advice(crop_name, context["water_availability"], context["rainfall"], context["season"])
    pest_info = get_pest_information(crop_name)
    history_items = get_prediction_history(db, user_id) if db and user_id else []

    intent = detect_intent(message, history)
    prompt = build_prompt(message, prediction, history, intent)
    _ = prompt

    history_summary = _recent_history_summary(history)
    response = _build_dynamic_response(
        intent=intent,
        message=message,
        context=context,
        crop_details=crop_details,
        crop_guide=crop_guide,
        fertilizer=fertilizer,
        irrigation=irrigation,
        pest_info=pest_info,
        history_summary=history_summary,
    )

    if history_items:
        recent_history = ", ".join([item.get("crop", "") for item in history_items[:3] if item.get("crop")])
        if recent_history:
            response = response + f"\n\nRecent history: {recent_history}"

    return response
