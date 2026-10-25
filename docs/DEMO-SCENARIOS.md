# SmartAir Presenter's Live Demonstration Guide (3–5 Minutes)

This cheat sheet provides a crisp, high-impact demonstration script for evaluating or presenting the **SmartAir Digital-Twin Simulator**.

---

## Preparation (10 Seconds Before Demo)
1. Open the application in your browser (default `http://localhost:5173`).
2. Go to **Settings** -> Click **"Restore Demo Hostel"** to ensure pristine dataset.
3. Verify the browser window is at standard 1080p desktop or full screen.

---

## Phase 1: Context & Vision (30 Seconds)
- **Presenter Script**:
  > *"Welcome to SmartAir. In India's residential and institutional sectors—especially universities and student hostels—ceiling fans and air conditioners account for over 50% of summer electricity consumption. Concurrently, student hostels face grave safety responsibilities requiring non-invasive abnormal-load detection.*
  >
  > *SmartAir is a digital-twin simulation platform demonstrating two commercial editions of smart BLDC ceiling fans: **Smart Home** comfort coordination and **Smart Care** institutional abnormal-load safety."*

- **Visual Action**:
  - Show the **Overview Dashboard** (`/overview`).
  - Highlight the KPI cards (3 Total Rooms, 1 Gateway, Active Status) and notice the prominent `SIMULATION ONLY` header badge.

---

## Phase 2: SmartAir Smart Home & Energy Lab (90 Seconds)
- **Presenter Script**:
  > *"First, let's explore **SmartAir Smart Home** in Room H-301. Traditional cooling forces residents to chill rooms down to 21°C because ordinary fans don't coordinate with air conditioners.*
  >
  > *Here, our physical model adheres to the fundamental law of thermal physics: fan airflow does not chill air temperature; instead, convective velocity creates a 2.5°C skin depression. Notice how our comfort index stays in the 'Optimal' green zone even with the AC set at an energy-conscious 26°C."*

- **Visual Actions**:
  1. Click **Room H-301** in the room list.
  2. In the simulator, observe the rotating fan blades and airflow streamlines in the 2.5D isometric room.
  3. Toggle **Quiet Mode** on: Point out that the fan speed automatically caps at Low to reduce acoustic noise during video calls or study sessions.
  4. Advance time by clicking **`+1 Min`** or hitting **Run Sim**.
  5. Click **"Energy Lab"** in the sidebar:
     - Review the side-by-side comparative cards (Conventional Chilling vs SmartAir Coordinated).
     - Click **"Run 24h Scenario Comparison"**.
     - Point out the honest calculation: savings are derived directly from watt-hour Riemann integration without arbitrary hardcoded marketing numbers.

---

## Phase 3: SmartAir Smart Care Safety Pipeline (90 Seconds)
- **Presenter Script**:
  > *"Now, let's switch to **SmartAir Smart Care**, designed for student hostels and PGs. Room A-204 is equipped with an edge load sensor configured with an illustrative 10 kg threshold.*
  >
  > *Let's place a 12 kg virtual weight on the fan. Watch the edge-triggered detection: the local room buzzer activates immediately, a Sub-GHz radio packet transmits to the building gateway, and the central building siren sounds."*

- **Visual Actions**:
  1. Navigate to **Room A-204** (`/rooms/room-care-a204`).
  2. Under "Virtual Test Weight", click **"Place on Fan"** (or drag the weight onto the ceiling fan target).
  3. Observe:
     - The fan drop target highlights in red.
     - **Incident Progression Pipeline** animates through:
       1. Sensor Sensing: Instant success.
       2. Local Alarm: Buzzer sounds.
       3. Radio Transmission: ~750ms animated packet.
       4. Gateway Ingestion: Room A-204 location resolved.
       5. Shared Building Siren: Sounds centrally.

---

## Phase 4: Network Topology & Fault Injection (45 Seconds)
- **Presenter Script**:
  > *"What happens during hardware faults? In the **Network Topology** view, we can trace packets flowing from room modules to the central floor gateway and building siren.*
  >
  > *Let's inject a fault: we toggle 'Radio Link Offline'. When a load event occurs, local detection succeeds, but the radio packet fails, and the building siren remains silent. The system behaves with total determinism."*

- **Visual Actions**:
  1. Click **Network** in the navigation rail (`/network`).
  2. Point out the interactive node-link SVG diagram.
  3. Click **"Radio Link Offline"** under Fault Injection controls.
  4. Note the red indicator on the Radio Link node and the live entry in the Network Event Log.

---

## Phase 5: Warden Operations Center & Incident Audit (45 Seconds)
- **Presenter Script**:
  > *"Finally, let's step into the warden's shoes in the **Admin Operations Center**. Institutional operators need a legally auditable lifecycle.*
  >
  > *Notice that acknowledging an incident is distinct from resolving it. Acknowledging stops the siren and records operator attendance. Resolving requires an inspection confirmation and archival note, permanently preserving the audit trail."*

- **Visual Actions**:
  1. Click **Admin Console** (`/admin`).
  2. Show the active incident row for Room A-204.
  3. Click **"Acknowledge"**: Confirm operator label ("Demo Warden").
  4. Click **"Resolve"**: Type a quick note (*"Room checked; accidental weight removed"*) and confirm resolution.
  5. Switch to **"Audit History"** tab to show that the closed incident is permanently recorded.
  6. Click **"Export CSV"** to demonstrate downloadable reporting.

---

## Phase 6: Conclusion (15 Seconds)
- **Presenter Script**:
  > *"SmartAir demonstrates that software digital-twins can validate both occupant comfort and institutional life safety in a single, responsive, offline-first web platform."*
