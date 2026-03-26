import os
import time
import psycopg2
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from main import app


def get_conn():
    return psycopg2.connect(
        user=os.getenv("SUPABASE_USER"),
        password=os.getenv("SUPABASE_PASSWORD"),
        host=os.getenv("SUPABASE_HOST"),
        port=os.getenv("SUPABASE_PORT"),
        dbname=os.getenv("SUPABASE_DBNAME"),
    )


def main():
    load_dotenv()

    suffix = str(int(time.time()))
    schedule_email = f"schedule-{suffix}@example.test"
    newsletter_email = f"newsletter-{suffix}@example.test"
    redeem_email = f"redeem-{suffix}@example.test"
    diy_email = f"diy-{suffix}@example.test"
    job_email = f"job-{suffix}@example.test"

    client = TestClient(app)
    conn = get_conn()
    conn.autocommit = False

    try:
        r = client.post(
            "/api/schedule",
            json={
                "firstName": "Smoke",
                "lastName": "Schedule",
                "phone": "2065550101",
                "email": schedule_email,
                "message": "Schedule API smoke test",
            },
        )
        assert r.status_code == 200, f"/api/schedule failed: {r.status_code} {r.text}"

        r = client.post("/api/newsletter", json={"email": newsletter_email})
        assert r.status_code == 200, f"/api/newsletter failed: {r.status_code} {r.text}"

        r = client.post(
            "/api/redeem-offer",
            json={
                "firstName": "Smoke",
                "lastName": "Redeem",
                "phone": "2065550102",
                "email": redeem_email,
                "couponDiscount": "$93.75 OFF",
                "couponCondition": "ANY SERVICE OVER $1,500",
            },
        )
        assert r.status_code == 200, f"/api/redeem-offer failed: {r.status_code} {r.text}"

        r = client.post(
            "/api/diy-permit",
            json={
                "firstName": "Smoke",
                "lastName": "DIY",
                "email": diy_email,
                "phone": "2065550103",
                "address": "123 Test St",
                "city": "Seattle",
                "projectDescription": "Smoke test permit request",
                "inspection": "unsure",
            },
        )
        assert r.status_code == 200, f"/api/diy-permit failed: {r.status_code} {r.text}"

        r = client.post(
            "/api/job-application",
            data={
                "firstName": "Smoke",
                "lastName": "Job",
                "phone": "2065550104",
                "email": job_email,
                "position": "Licensed Residential Plumber",
                "experience": "5 years",
                "message": "Smoke test application",
                "additionalInfo": "N/A",
            },
            files={"resume": ("resume.txt", b"Smoke test resume content", "text/plain")},
        )
        assert r.status_code == 200, f"/api/job-application failed: {r.status_code} {r.text}"

        with conn.cursor() as cur:
            cur.execute('SELECT COUNT(*) FROM "Schedule Online" WHERE email=%s', (schedule_email,))
            schedule_count = cur.fetchone()[0]

            cur.execute('SELECT COUNT(*) FROM "Newsletter" WHERE email=%s', (newsletter_email,))
            newsletter_count = cur.fetchone()[0]

            cur.execute('SELECT COUNT(*) FROM "Redeemed Offers" WHERE email=%s', (redeem_email,))
            redeemed_count = cur.fetchone()[0]

            cur.execute('SELECT COUNT(*) FROM "DIY Permit Requests" WHERE email=%s', (diy_email,))
            diy_count = cur.fetchone()[0]

            cur.execute('SELECT COUNT(*) FROM "Job Applications" WHERE email=%s', (job_email,))
            job_count = cur.fetchone()[0]

        assert schedule_count == 1, f"Expected 1 schedule row, got {schedule_count}"
        assert newsletter_count == 1, f"Expected 1 newsletter row, got {newsletter_count}"
        assert redeemed_count == 1, f"Expected 1 redeemed offer row, got {redeemed_count}"
        assert diy_count == 1, f"Expected 1 DIY row, got {diy_count}"
        assert job_count == 1, f"Expected 1 job row, got {job_count}"

        print("API smoke tests: PASS")
        print("DB verification: PASS", {
            "schedule": schedule_count,
            "newsletter": newsletter_count,
            "redeemed": redeemed_count,
            "diy": diy_count,
            "job": job_count,
        })

        with conn.cursor() as cur:
            cur.execute('DELETE FROM "Schedule Online" WHERE email=%s', (schedule_email,))
            cur.execute('DELETE FROM "Newsletter" WHERE email=%s', (newsletter_email,))
            cur.execute('DELETE FROM "Redeemed Offers" WHERE email=%s', (redeem_email,))
            cur.execute('DELETE FROM "DIY Permit Requests" WHERE email=%s', (diy_email,))
            cur.execute('DELETE FROM "Job Applications" WHERE email=%s', (job_email,))
        conn.commit()
        print("Cleanup: PASS")

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
