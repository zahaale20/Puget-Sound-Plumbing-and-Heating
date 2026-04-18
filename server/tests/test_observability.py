import logging
import os
import sys
import types
from unittest.mock import MagicMock

import observability


class TestJsonFormatter:
    def test_formats_basic_payload_with_request_id_and_extra(self) -> None:
        formatter = observability.JsonFormatter()
        token = observability.request_id_var.set("rid-123")
        try:
            record = logging.getLogger("test").makeRecord(
                "test", logging.INFO, __file__, 10, "hello %s", ("world",), None, extra={"key": "value"}
            )
            output = formatter.format(record)
            assert '"message":"hello world"' in output
            assert '"request_id":"rid-123"' in output
            assert '"key":"value"' in output
        finally:
            observability.request_id_var.reset(token)

    def test_formats_non_json_serializable_extra(self) -> None:
        formatter = observability.JsonFormatter()
        record = logging.getLogger("test").makeRecord(
            "test", logging.INFO, __file__, 11, "msg", (), None, extra={"obj": object()}
        )
        output = formatter.format(record)
        assert '"obj":"<' in output


class TestRequestIdFilter:
    def test_injects_dash_when_missing(self) -> None:
        filt = observability.RequestIdFilter()
        record = logging.getLogger("x").makeRecord("x", logging.INFO, __file__, 1, "m", (), None)
        observability.request_id_var.set(None)
        assert filt.filter(record) is True
        assert record.request_id == "-"  # type: ignore[attr-defined]


class TestConfigureLogging:
    def test_configure_text_logging(self, monkeypatch) -> None:
        monkeypatch.setenv("LOG_LEVEL", "DEBUG")
        monkeypatch.setenv("LOG_FORMAT", "text")
        observability.configure_logging()
        root = logging.getLogger()
        assert root.level == logging.DEBUG
        assert len(root.handlers) == 1

    def test_configure_json_logging(self, monkeypatch) -> None:
        monkeypatch.setenv("LOG_LEVEL", "INFO")
        monkeypatch.setenv("LOG_FORMAT", "json")
        observability.configure_logging()
        root = logging.getLogger()
        assert isinstance(root.handlers[0].formatter, observability.JsonFormatter)


class TestSentryInit:
    def test_init_sentry_returns_false_without_dsn(self, monkeypatch) -> None:
        monkeypatch.delenv("SENTRY_DSN", raising=False)
        assert observability.init_sentry() is False

    def test_init_sentry_returns_false_when_sdk_missing(self, monkeypatch):
        monkeypatch.setenv("SENTRY_DSN", "https://example@ingest/1")
        for key in list(sys.modules):
            if key.startswith("sentry_sdk"):
                del sys.modules[key]

        real_import = __import__

        def fake_import(name, *args, **kwargs):
            if name.startswith("sentry_sdk"):
                raise ImportError("missing")
            return real_import(name, *args, **kwargs)

        import builtins
        old_import = builtins.__import__
        builtins.__import__ = fake_import
        try:
            assert observability.init_sentry() is False
        finally:
            builtins.__import__ = old_import

    def test_init_sentry_success(self, monkeypatch) -> None:
        monkeypatch.setenv("SENTRY_DSN", "https://example@ingest/1")
        monkeypatch.setenv("SENTRY_ENVIRONMENT", "test")
        monkeypatch.setenv("SENTRY_TRACES_SAMPLE_RATE", "0.2")

        sentry_mod = types.ModuleType("sentry_sdk")
        sentry_mod.init = MagicMock()  # type: ignore[attr-defined]

        fastapi_mod = types.ModuleType("sentry_sdk.integrations.fastapi")
        starlette_mod = types.ModuleType("sentry_sdk.integrations.starlette")

        class FastApiIntegration:
            def __init__(self, transaction_style) -> None:
                self.transaction_style = transaction_style

        class StarletteIntegration:
            def __init__(self, transaction_style) -> None:
                self.transaction_style = transaction_style

        fastapi_mod.FastApiIntegration = FastApiIntegration  # type: ignore[attr-defined]
        starlette_mod.StarletteIntegration = StarletteIntegration  # type: ignore[attr-defined]

        sys.modules["sentry_sdk"] = sentry_mod
        sys.modules["sentry_sdk.integrations.fastapi"] = fastapi_mod
        sys.modules["sentry_sdk.integrations.starlette"] = starlette_mod

        try:
            assert observability.init_sentry() is True
            sentry_mod.init.assert_called_once()
        finally:
            for mod_name in [
                "sentry_sdk",
                "sentry_sdk.integrations.fastapi",
                "sentry_sdk.integrations.starlette",
            ]:
                if mod_name in sys.modules:
                    del sys.modules[mod_name]


class TestRequestId:
    def test_new_request_id_shape(self) -> None:
        rid = observability.new_request_id()
        assert len(rid) == 16
        int(rid, 16)


class TestMetricsHelpers:
    def test_record_request_metrics_noop_when_disabled(self, monkeypatch) -> None:
        """record_request_metrics must be a no-op when metrics are off."""
        monkeypatch.setattr(observability, "_metrics_enabled", False)
        # Should not raise even if prometheus_client is absent
        observability.record_request_metrics("GET", "/health/live", 200, 0.001)

    def test_is_metrics_enabled_reflects_flag(self, monkeypatch) -> None:
        monkeypatch.setattr(observability, "_metrics_enabled", True)
        assert observability.is_metrics_enabled() is True
        monkeypatch.setattr(observability, "_metrics_enabled", False)
        assert observability.is_metrics_enabled() is False

    def test_record_request_metrics_normalises_id_segments(self, monkeypatch):
        """Hex ID segments in paths should be replaced with {id}."""
        calls: list[tuple] = []

        class FakeCounter:
            def labels(self, **kwargs):
                calls.append(kwargs)
                return self
            def inc(self) -> None:
                pass

        class FakeHistogram:
            def labels(self, **kwargs):
                return self
            def observe(self, v) -> None:
                pass

        monkeypatch.setattr(observability, "_metrics_enabled", True)
        monkeypatch.setattr(observability, "http_requests_total", FakeCounter())
        monkeypatch.setattr(observability, "http_request_duration_seconds", FakeHistogram())

        observability.record_request_metrics("GET", "/blog/abcdef1234567890/comments", 200, 0.05)
        assert any("{id}" in c.get("path", "") for c in calls)
