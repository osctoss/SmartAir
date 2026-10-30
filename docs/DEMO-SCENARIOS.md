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
  > *Watch what happens when a resident enters: clicking `+ Person` places the resident in the room, immediately starts the ceiling fan at Medium speed, and starts a 5-minute countdown. Rather than blast the compressor instantly, the system evaluates whether fan circulation alone satisfies operative comfort.*
  >
  > *When cooling is required, the AC compressor activates and cools the room deterministically at 1°C every 5 seconds. As soon as the room reaches 28°C (setpoint + 2°C), the fan automatically steps down to Low RPM to eliminate drafts and noise. When the room reaches the 26°C setpoint, the compressor switches OFF, and the fan continues running at Low RPM to sustain convective airflow.*
  >
  > *With our modular hardware system, users can click 'Edit Devices' to install an Evaporative Cooler or remove the AC in real time. For coolers, our smart high-humidity protection shuts off the pump if humidity exceeds 65% RH to avoid mold and mugginess.*
  >
  > *Finally, when the resident leaves, a 20-second vacancy timer counts down and safely shuts down the fan."*

- **Visual Actions**:
  1. Click **Room H-301** in the room list.
  2. Click **`+ Person`** to simulate resident entry: observe the visual occupant avatar seated in the room, fan spinning immediately, and the 5-minute AC countdown starting.
  3. Step the simulation forward: watch the 5-minute delay complete and the AC compressor switch ON.
  4. Observe deterministic step-cooling: temperature drops 1°C every 5 seconds.
  5. Watch the fan speed automatically drop to **Low RPM** at 28°C while compressor cools.
  6. Watch the compressor switch **OFF** (`COMPRESSOR_REST`) at 26°C while fan maintains continuous Low RPM air circulation.
  7. Click **"Edit Devices"** in the toolbar: demonstrate modular equipment management by toggling AC, Evaporative Cooler, or PC.
  8. Push humidity past 65% on an active cooler: show the high-humidity protection cutoff banner and fan takeover.
  9. Click **`- Person`** to empty the room: observe the 20-second vacancy countdown and fan auto-off.
  10. Open **"Energy Lab"** in the sidebar:
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
