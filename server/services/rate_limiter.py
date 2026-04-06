"""
Rate limiting utility for form submissions
Uses in-memory storage to track request counts per IP address
"""

import time
from collections import defaultdict
from typing import Dict, Tuple

# In-memory store: {ip_address: {endpoint: [(timestamp, count)]}}
_request_tracker: Dict[str, Dict[str, list]] = defaultdict(lambda: defaultdict(list))

# Configuration: endpoint -> (max_requests, time_window_seconds)
RATE_LIMITS = {
    "schedule": (10, 3600),  # 10 requests per hour
    "newsletter": (5, 3600),  # 5 requests per hour
    "redeem-offer": (10, 3600),  # 10 requests per hour
    "diy-permit": (10, 3600),  # 10 requests per hour
    "job-application": (5, 3600),  # 5 requests per hour
    "send-email": (10, 3600),  # 10 requests per hour
    "verify-captcha": (20, 3600),  # 20 requests per hour
    "unsubscribe": (10, 3600),  # 10 requests per hour
    "images": (100, 3600),  # 100 requests per hour
    "blog-views": (30, 3600),  # 30 view increments per hour
}


def check_rate_limit(ip_address: str, endpoint: str) -> Tuple[bool, str]:
    """
    Check if request exceeds rate limit for given IP and endpoint.
    
    Returns:
        Tuple[bool, str]: (is_allowed, message)
    """
    if endpoint not in RATE_LIMITS:
        return True, "Endpoint not rate limited"
    
    max_requests, window_seconds = RATE_LIMITS[endpoint]
    current_time = time.time()
    
    # Get request history for this endpoint
    request_history = _request_tracker[ip_address][endpoint]
    
    # Remove old requests outside the time window
    request_history[:] = [
        (timestamp, count) for timestamp, count in request_history
        if current_time - timestamp < window_seconds
    ]
    
    # Count requests in current window
    total_requests = sum(count for _, count in request_history)
    
    if total_requests >= max_requests:
        return False, f"Rate limit exceeded. Maximum {max_requests} requests per hour."
    
    # Record this request
    if request_history and request_history[-1][0] == current_time:
        # Same second, increment count
        timestamp, count = request_history[-1]
        request_history[-1] = (timestamp, count + 1)
    else:
        # New second
        request_history.append((current_time, 1))
    
    return True, "OK"


def reset_rate_limit(ip_address: str, endpoint: str = None):
    """Reset rate limit for an IP address (or all endpoints if endpoint is None)"""
    if endpoint is None:
        _request_tracker[ip_address].clear()
    else:
        _request_tracker[ip_address][endpoint].clear()
