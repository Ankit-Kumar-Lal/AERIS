import time
import email.utils
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import List, Optional
import httpx
from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter(prefix="/news", tags=["News"])

class NewsItemOut(BaseModel):
    id: str
    title: str = ""
    source: str
    url: str
    publishedAt: str
    relativeTime: str
    category: str  # Flood, Disease Outbreak, Weather, Water Quality, Health Advisory
    state: str     # Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura, Northeast
    is_sample: bool = False

class NewsResponse(BaseModel):
    items: List[NewsItemOut]
    cached_at: str
    total: int
    source: str
    is_sample: bool = False

# 15-minute in-memory cache
_CACHE = {
    "data": None,
    "timestamp": 0.0
}
CACHE_TTL = 900.0  # 15 minutes

# Fallback sample data if RSS is unreachable or network is restricted
# Marked with is_sample=True as mandated by project requirements
SAMPLE_NEWS: List[dict] = [
    {
        "id": "sample-1",
        "title": "Assam: Dhansiri River Crosses Danger Mark; Local PHCs Mobilise Diarrhoeal Surveillance",
        "source": "The Assam Tribune",
        "url": "https://assamtribune.com",
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "relativeTime": "1h ago",
        "category": "Flood",
        "state": "Assam",
        "is_sample": True
    },
    {
        "id": "sample-2",
        "title": "Meghalaya Health Dept Issues Pre-Monsoon Advisory on Water-Borne Gastrointestinal Infections",
        "source": "Shillong Times",
        "url": "https://theshillongtimes.com",
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "relativeTime": "3h ago",
        "category": "Disease Outbreak",
        "state": "Meghalaya",
        "is_sample": True
    },
    {
        "id": "sample-3",
        "title": "Churachandpur Health Centre Reports Spike in Enteric Fever & Acute Diarrhoeal Cases",
        "source": "Imphal Free Press",
        "url": "https://ifp.co.in",
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "relativeTime": "5h ago",
        "category": "Disease Outbreak",
        "state": "Manipur",
        "is_sample": True
    },
    {
        "id": "sample-4",
        "title": "IMD Issues Heavy Rainfall Alert Across Arunachal Foothills & Upper Brahmaputra Valley",
        "source": "Arunachal Times",
        "url": "https://arunachaltimes.in",
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "relativeTime": "7h ago",
        "category": "Weather",
        "state": "Arunachal Pradesh",
        "is_sample": True
    },
    {
        "id": "sample-5",
        "title": "Mizoram Public Health Engineering Tests Community Drinking Wells for Coliform Pathogen Load",
        "source": "Aizawl Post",
        "url": "https://aizawlpost.com",
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "relativeTime": "11h ago",
        "category": "Water Quality",
        "state": "Mizoram",
        "is_sample": True
    },
    {
        "id": "sample-6",
        "title": "Tripura State NHM Deploys Mobile Testing Vans & Chlorine Tablets in Submerged Habitations",
        "source": "Tripura Chronicle",
        "url": "https://tripurachronicle.in",
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "relativeTime": "14h ago",
        "category": "Health Advisory",
        "state": "Tripura",
        "is_sample": True
    }
]


def _format_relative_time(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    diff = (now - dt).total_seconds()
    if diff < 0:
        return "Just now"
    if diff < 60:
        return f"{int(diff)}s ago"
    minutes = int(diff // 60)
    if minutes < 60:
        return f"{minutes}m ago"
    hours = int(minutes // 60)
    if hours < 24:
        return f"{hours}h ago"
    days = int(hours // 24)
    return f"{days}d ago"


def _detect_category(title: str) -> str:
    low = title.lower()
    # 1. Disease Outbreak
    disease_kws = [
        "diarrhoea", "diarrhea", "cholera", "typhoid", "dengue", "malaria",
        "hepatitis", "fever", "outbreak", "cases", "infection", "epidemic",
        "encephalitis", "je ", "pathogen", "gastrointestinal"
    ]
    if any(k in low for k in disease_kws):
        return "Disease Outbreak"

    # 2. Water Quality
    water_kws = [
        "water contamination", "contaminated water", "drinking water", "potable",
        "tube-well", "tubewell", "coliform", "arsenic", "fluoride", "water supply",
        "filtration", "chlorin", "water quality", "purification", "sample", "well"
    ]
    if any(k in low for k in water_kws):
        return "Water Quality"

    # 3. Flood
    flood_kws = [
        "flood", "inundat", "submerg", "waterlog", "river", "brahmaputra",
        "barrage", "deluge", "erosion", "overflow", "breach", "embankment"
    ]
    if any(k in low for k in flood_kws):
        return "Flood"

    # 4. Weather
    weather_kws = [
        "weather", "rain", "monsoon", "cloudburst", "imd", "forecast",
        "cyclone", "thunderstorm", "storm", "squall", "downpour", "warning"
    ]
    if any(k in low for k in weather_kws):
        return "Weather"

    # 5. Health Advisory / Default
    advisory_kws = [
        "advisory", "health alert", "hospital", "asha", "nhm", "health dept",
        "medical", "surveillance", "relief camp", "ors", "precautions"
    ]
    if any(k in low for k in advisory_kws):
        return "Health Advisory"

    return "Health Advisory"


def _detect_state(title: str) -> str:
    low = title.lower()
    if any(k in low for k in ["assam", "guwahati", "lakhimpur", "dhakuakhana", "majuli", "dibrugarh", "silchar", "jorhat", "barpeta", "golaghat", "tezpur", "sonitpur", "nagaon", "cachar", "dhubri", "kamrup"]):
        return "Assam"
    if any(k in low for k in ["arunachal", "itanagar", "pasighat", "tawang", "ziro", "siang", "lohit", "subansiri"]):
        return "Arunachal Pradesh"
    if any(k in low for k in ["manipur", "imphal", "churachandpur", "bishnupur", "thoubal", "senapati"]):
        return "Manipur"
    if any(k in low for k in ["meghalaya", "shillong", "mawsynram", "cherrapunji", "sohra", "tura", "khasi", "garo", "jaintia"]):
        return "Meghalaya"
    if any(k in low for k in ["mizoram", "aizawl", "champhai", "lunglei", "kolasib"]):
        return "Mizoram"
    if any(k in low for k in ["nagaland", "kohima", "dimapur", "mokokchung"]):
        return "Nagaland"
    if any(k in low for k in ["sikkim", "gangtok", "namchi", "mangan", "gyalshing"]):
        return "Sikkim"
    if any(k in low for k in ["tripura", "agartala", "dhalai", "dharmanagar", "unakoti"]):
        return "Tripura"
    return "Northeast"


async def _fetch_rss_feeds() -> List[dict]:
    queries = [
        'Assam OR Meghalaya OR Tripura flood',
        '(Assam OR Northeast OR Meghalaya OR Mizoram OR Manipur) (diarrhoea OR cholera OR typhoid OR dengue OR malaria)',
        '(Assam OR Meghalaya OR Mizoram OR Tripura) (water contamination OR drinking water)',
        'Northeast India monsoon rain alert'
    ]

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AERIS/2.0 NewsEngine'
    }

    all_items = []
    seen_urls = set()
    seen_titles = set()

    async with httpx.AsyncClient(headers=headers, timeout=6.0, follow_redirects=True) as client:
        for q in queries:
            url = f"https://news.google.com/rss/search?q={httpx.URL(q)}&hl=en-IN&gl=IN&ceid=IN:en"
            try:
                resp = await client.get(url)
                if resp.status_code == 200 and resp.text:
                    root = ET.fromstring(resp.text)
                    channel = root.find("channel")
                    if channel is None:
                        continue
                    for item in channel.findall("item"):
                        raw_title = item.findtext("title", "").strip()
                        raw_link = item.findtext("link", "").strip()
                        raw_pub = item.findtext("pubDate", "").strip()
                        source_elem = item.findtext("source", "").strip()

                        if not raw_title or not raw_link or raw_link in seen_urls:
                            continue

                        # Clean Title and Source
                        title = raw_title
                        source_name = source_elem
                        if " - " in raw_title:
                            parts = raw_title.rsplit(" - ", 1)
                            title = parts[0].strip()
                            if not source_name:
                                source_name = parts[1].strip()

                        # De-duplicate near identical titles
                        norm_title = "".join(c.lower() for c in title if c.isalnum())
                        if norm_title in seen_titles:
                            continue

                        # Parse published datetime
                        dt = datetime.now(timezone.utc)
                        if raw_pub:
                            try:
                                dt = email.utils.parsedate_to_datetime(raw_pub)
                                if dt.tzinfo is None:
                                    dt = dt.replace(tzinfo=timezone.utc)
                            except Exception:
                                pass

                        seen_urls.add(raw_link)
                        seen_titles.add(norm_title)

                        all_items.append({
                            "id": f"rss-{len(all_items)+1}",
                            "title": title,
                            "source": source_name or "Regional News",
                            "url": raw_link,
                            "publishedAt": dt.isoformat(),
                            "relativeTime": _format_relative_time(dt),
                            "timestamp": dt.timestamp(),
                            "category": _detect_category(title),
                            "state": _detect_state(title),
                            "is_sample": False
                        })
            except Exception:
                # Silently continue to next query to ensure resiliency
                continue

    # Sort descending by published timestamp
    all_items.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
    return all_items


@router.get("/northeast", response_model=NewsResponse)
async def get_northeast_news(
    category: Optional[str] = None,
    limit: int = 15
):
    now = time.time()
    cached = _CACHE["data"]

    # Use in-memory cache if fresh
    if cached is not None and (now - _CACHE["timestamp"]) < CACHE_TTL:
        items = cached
        is_sample = False
    else:
        try:
            live_items = await _fetch_rss_feeds()
            if live_items and len(live_items) >= 3:
                _CACHE["data"] = live_items
                _CACHE["timestamp"] = now
                items = live_items
                is_sample = False
            else:
                items = SAMPLE_NEWS
                is_sample = True
        except Exception:
            items = SAMPLE_NEWS
            is_sample = True

    # Filter by category if requested
    filtered = items
    if category and category.lower() != "all":
        cat_lower = category.lower()
        filtered = [
            it for it in items
            if it.get("category", "").lower() == cat_lower or
               (cat_lower == "disease" and it.get("category") == "Disease Outbreak") or
               (cat_lower == "water" and it.get("category") == "Water Quality")
        ]

    # Return top items up to limit
    selected = filtered[:limit]
    cached_at_str = datetime.fromtimestamp(
        _CACHE["timestamp"] if _CACHE["timestamp"] > 0 else now,
        tz=timezone.utc
    ).isoformat()

    return NewsResponse(
        items=selected,
        cached_at=cached_at_str,
        total=len(selected),
        source="google_news_rss" if not is_sample else "sample_fallback",
        is_sample=is_sample
    )
