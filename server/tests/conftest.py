"""Pytest bootstrap for consistent import resolution.

Ensures backend tests can run from either the repository root or server/ directory
without requiring callers to set PYTHONPATH manually.
"""

from pathlib import Path
import sys

SERVER_ROOT = Path(__file__).resolve().parents[1]
server_root_str = str(SERVER_ROOT)
if server_root_str not in sys.path:
    sys.path.insert(0, server_root_str)
