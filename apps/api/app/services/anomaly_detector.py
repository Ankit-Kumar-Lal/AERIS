import math
from typing import List, Tuple


def calculate_rolling_z_score(daily_counts: List[int], current_count: int) -> float:
    """
    Computes the rolling z-score of today's case volume against the historical baseline (e.g. 14-30 days).
    z = (x - mean) / std_dev
    Returns 0.0 if baseline variance is zero or negligible.
    """
    if not daily_counts or len(daily_counts) < 3:
        return 0.0

    mean = sum(daily_counts) / len(daily_counts)
    variance = sum((x - mean) ** 2 for x in daily_counts) / len(daily_counts)
    std_dev = math.sqrt(variance)

    if std_dev < 0.1:
        # If std_dev is nearly zero, any positive jump is notable
        if current_count > mean:
            return round(min(5.0, (current_count - mean) / 1.0), 2)
        return 0.0

    z = (current_count - mean) / std_dev
    return round(float(z), 2)
