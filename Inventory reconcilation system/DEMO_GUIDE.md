# Platform Evaluation & Demo Script

Follow this structured flow to evaluate the platform during investor demos.

---

## 1. Credentials Presets

Use these credentials to authenticate and simulate different corporate roles:

- **Operations Manager (Full operational access):**
  - Email: `kit27.am21@gmail.com`
  - Password: `omnilogistics2026`
- **Auditor User (Ledger extraction & audit logs):**
  - Email: `auditor@omnilogistics.com`
  - Password: `omnilogistics2026`

---

## 2. Interactive Review Script

### Step 1: Login
- Access the platform login screen at [http://localhost:3000/login](http://localhost:3000/login).
- Click the **Demo Preset Card** or type the credentials to access the Executive Command Center.

### Step 2: Review Executive Command Center
- Study the high-level KPI cards: total inventory valuation ($48M), active discrepancies, and overall system accuracy.
- Observe the live Recharts trends.

### Step 3: Run AI Reconciliation Agent Cycle
- Click the **"Execute AI Reconciliation"** button in the header.
- The button status updates to indicate that the LangGraph orchestrator is scanning databases.
- When finished, a confirmation bar highlights the newly-run cycle ID and updated statistics.

### Step 4: Investigate Mismatches
- Go to the **Reconciliation Center** using the sidebar.
- Examine individual stock items, identifying quantity gaps and AI-generated root cause explanations.
- Click **"Export CSV Audit Ledger"** to download the CSV report.

### Step 5: Verify Telemetry
- Open the **Infrastructure Intelligence** page.
- Study active temperature/humidity sensors and warning badges.
