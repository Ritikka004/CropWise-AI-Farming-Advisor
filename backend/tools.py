from typing import Any, Dict, List


def get_crop_details(crop_name: str) -> Dict[str, Any]:
    crop_name = (crop_name or "").strip().lower()
    crop_data = {
        "rice": {
            "suitability": "Rice fits well in clay or loamy soils with plenty of water and warm temperatures.",
            "yield": "High yield is expected under steady irrigation and good nutrient management.",
            "notes": "Keep fields evenly flooded during key growth stages."
        },
        "maize": {
            "suitability": "Maize performs best in fertile loamy soils with moderate rainfall and adequate nitrogen.",
            "yield": "Good yield is possible with timely weeding and balanced fertilization.",
            "notes": "Use early-season weed control and protect against stem borers."
        },
        "chickpea": {
            "suitability": "Chickpea is suitable for dryland farming in well-drained loamy or black soils.",
            "yield": "Moderate to high yields are possible in cool and dry conditions.",
            "notes": "Avoid waterlogging and monitor for pod borer."
        },
        "cotton": {
            "suitability": "Cotton prefers black soil, warm conditions, and careful nutrient management.",
            "yield": "Strong yields are expected where irrigation and pest control are managed well.",
            "notes": "Watch for sucking pests and bollworm attacks."
        },
        "apple": {
            "suitability": "Apple grows well in cooler climates with loamy or red soils and good drainage.",
            "yield": "High yields are possible with regular pruning and disease management.",
            "notes": "Maintain orchard sanitation to reduce fungal issues."
        },
        "watermelon": {
            "suitability": "Watermelon thrives in warm, sunny weather and sandy to loamy soils with good drainage.",
            "yield": "Excellent yield is expected with regular irrigation and mulch.",
            "notes": "Protect vines from pests and fruit rot."
        }
    }
    return crop_data.get(crop_name, {
        "suitability": f"{crop_name.capitalize()} is a suitable option for the current field conditions.",
        "yield": "Yield will depend on timely care, irrigation, and field management.",
        "notes": "Practice regular monitoring and balanced nutrient management."
    })


def get_crop_guide(crop_name: str) -> Dict[str, Any]:
    crop_name = (crop_name or "").strip().lower()
    guides = {
        "rice": {
            "season": "Kharif",
            "water_need": "High",
            "alternative_crops": ["Maize", "Sugarcane"]
        },
        "maize": {
            "season": "Kharif or Zaid",
            "water_need": "Medium",
            "alternative_crops": ["Sorghum", "Chickpea"]
        },
        "chickpea": {
            "season": "Rabi",
            "water_need": "Low",
            "alternative_crops": ["Lentil", "Mustard"]
        },
        "cotton": {
            "season": "Kharif",
            "water_need": "Medium",
            "alternative_crops": ["Groundnut", "Soybean"]
        },
        "apple": {
            "season": "Winter",
            "water_need": "Medium",
            "alternative_crops": ["Pear", "Plum"]
        },
        "watermelon": {
            "season": "Zaid",
            "water_need": "Medium",
            "alternative_crops": ["Muskmelon", "Cucumber"]
        }
    }
    return guides.get(crop_name, {
        "season": "Varies",
        "water_need": "Medium",
        "alternative_crops": ["Millet", "Pulses"]
    })


def get_prediction_history(db, user_id: int) -> List[Dict[str, Any]]:
    if not db or not user_id:
        return []
    from models import PredictionHistory

    history_items = db.query(PredictionHistory).filter(PredictionHistory.user_id == user_id).order_by(PredictionHistory.date.desc()).limit(5).all()
    return [
        {
            "crop": item.crop_name,
            "confidence": item.confidence,
            "season": item.season,
            "location": item.location,
        }
        for item in history_items
    ]


def get_fertilizer_recommendation(crop_name: str, soil_type: str, n: float, p: float, k: float) -> Dict[str, Any]:
    crop_name = (crop_name or "").strip().lower()
    if crop_name == "rice":
        return {"recommendation": "Apply balanced NPK with extra nitrogen during early growth and potash during flowering.", "notes": "Use compost and avoid overuse of nitrogen."}
    if crop_name == "maize":
        return {"recommendation": "Use nitrogen-rich fertilizer in split doses and maintain phosphorus for root development.", "notes": "Add organic manure if soil fertility is low."}
    if crop_name == "chickpea":
        return {"recommendation": "Use a moderate dose of phosphorus and potash with organic manure for better pod filling.", "notes": "Avoid excess nitrogen to prevent excessive vegetative growth."}
    if crop_name == "cotton":
        return {"recommendation": "Apply potassium and phosphorus in balanced amounts, with careful nitrogen management.", "notes": "Soil testing is recommended for precise dosage."}
    if crop_name == "apple":
        return {"recommendation": "Use orchard-specific fertilizers with potassium and micronutrients for fruit quality.", "notes": "Supplement with compost and foliar sprays if needed."}
    return {"recommendation": "Use crop-specific fertilizers and keep the soil well supplied with organic matter.", "notes": f"Current soil tests show N={n}, P={p}, K={k} for {soil_type} soil."}


def get_irrigation_advice(crop_name: str, water_availability: str, rainfall: float, season: str) -> Dict[str, Any]:
    crop_name = (crop_name or "").strip().lower()
    if crop_name == "rice":
        return {"schedule": "Irrigate regularly to keep the field moist and avoid water stress at flowering.", "notes": "Maintain a stable water level during critical growth stages."}
    if crop_name == "maize":
        return {"schedule": "Provide deep irrigation during tasseling and grain filling, especially in dry spells.", "notes": "Use mulch to reduce evaporation."}
    if crop_name == "chickpea":
        return {"schedule": "Use light, timely irrigation only when the soil becomes dry at the root zone.", "notes": "Avoid over-irrigation in cool seasons."}
    if crop_name == "cotton":
        return {"schedule": "Maintain consistent moisture during flowering and boll formation.", "notes": "Irrigate less frequently during early vegetative growth."}
    if crop_name == "apple":
        return {"schedule": "Irrigate deeply but less often, especially during fruit development.", "notes": "Drip irrigation is preferred for water efficiency."}
    return {"schedule": "Use irrigation based on weather, soil moisture, and plant stress signs.", "notes": f"Current water availability is {water_availability} and rainfall is {rainfall} mm."}


def get_pest_information(crop_name: str) -> Dict[str, Any]:
    crop_name = (crop_name or "").strip().lower()
    pest_data = {
        "rice": {"risks": "Brown plant hopper and blast disease are common risks.", "advice": "Monitor leaf health and use resistant varieties where possible."},
        "maize": {"risks": "Stem borer and fungal leaf blight can reduce yield.", "advice": "Practice crop rotation and timely scouting."},
        "chickpea": {"risks": "Pod borer and wilt are important concerns.", "advice": "Use clean seed and avoid waterlogging."},
        "cotton": {"risks": "Aphids, bollworm, and leaf curl may appear.", "advice": "Use integrated pest management and field monitoring."},
        "apple": {"risks": "Scab and powdery mildew can affect fruit quality.", "advice": "Keep orchard sanitation high and prune regularly."},
        "watermelon": {"risks": "Fruit fly and powdery mildew are common threats.", "advice": "Use mulch and inspect fruits regularly."}
    }
    return pest_data.get(crop_name, {"risks": "Pest pressure should be monitored regularly.", "advice": "Use field scouting and early intervention."})
