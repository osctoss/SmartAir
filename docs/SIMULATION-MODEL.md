# SmartAir Simulation & Mathematical Models

This document details the mathematical formulations, physical approximations, control heuristics, and explicit limitations implemented within the **SmartAir Simulator**.

---

## 1. Physical Principle: Convective Airflow vs Sensible Heat

> [!IMPORTANT]
> **Fundamental Modeling Rule**: Ceiling fan blade rotation circulates air; it does **not** subtract sensible heat degrees from the ambient air temperature.

In real physics, an electric ceiling fan motor dissipates a small amount of electrical energy into the room as heat ($6\text{W} - 45\text{W}$). The cooling effect experienced by human occupants is exclusively **convective and evaporative heat transfer** from exposed skin caused by localized air velocity.

### Implementation:
- In `src/simulation/smart-home/thermal-model.ts`, fan speed has **zero negative coefficient** on the physical air temperature equation $T_{indoor}(t)$.
- In `src/simulation/smart-home/comfort.ts`, fan air velocity is translated into a **perceived cooling offset** ($\Delta T_{airflow}$) that modifies operative temperature for human comfort assessment:

| Fan Speed | Air Velocity (Approx.) | Convective Skin Offset ($\Delta T_{airflow}$) |
|---|---|---|
| **Off** | $0.0\text{ m/s}$ | $0.0^\circ\text{C}$ |
| **Low** | $0.8\text{ m/s}$ | $1.0^\circ\text{C}$ |
| **Medium** | $1.5\text{ m/s}$ | $1.8^\circ\text{C}$ |
| **High** | $2.2\text{ m/s}$ | $2.5^\circ\text{C}$ |

---

## 2. Discrete Thermal & Humidity Models

### 2.1 Indoor Sensible Temperature Step
At each discrete time step $\Delta t$ (in hours), indoor temperature evolves according to building envelope thermal conduction and active cooling extraction:

$$T_{indoor}(t + \Delta t) = T_{indoor}(t) + \left[ k_{envelope} \cdot (T_{outdoor} - T_{indoor}) - \dot{Q}_{cooling} \right] \cdot \Delta t$$

Where:
- $k_{envelope} = 0.35\text{ h}^{-1}$: Thermal conductivity coefficient of typical masonry walls and windows.
- $\dot{Q}_{cooling}$: Active cooling power in $^\circ\text{C}/\text{hour}$:
  - If AC is cooling: $\dot{Q}_{ac} = 4.2^\circ\text{C}/\text{hour}$.
  - If AC is resting or off: $\dot{Q}_{ac} = 0.0^\circ\text{C}/\text{hour}$.
  - If Evaporative Cooler is running: $\dot{Q}_{cooler} = 2.8^\circ\text{C}/\text{hour}$.

### 2.2 Relative Humidity Drift & Dehumidification
Relative humidity $RH(t)$ responds to ambient conditions and air conditioning moisture condensation:

$$RH(t + \Delta t) = RH(t) + \left[ k_{humidity} \cdot (RH_{outdoor} - RH(t)) - \dot{M}_{condense} \right] \cdot \Delta t$$

Where:
- $k_{humidity} = 0.25\text{ h}^{-1}$.
- When AC compressor is actively running: $\dot{M}_{condense} = 12\%\text{ RH/hour}$, modeling evaporator coil condensation.

---

## 3. Illustrative Comfort Index

> [!NOTE]
> **Disclaimer**: The comfort score is an illustrative software model designed for interactive digital-twin demonstration. It is not an ISO 7730 or ASHRAE 55 certified PMV/PPD clinical instrument.

The composite comfort score $S \in [0, 100]$ evaluates perceived operative temperature $T_{op}$ and humidity $RH$:

$$T_{op} = T_{indoor} - \Delta T_{airflow}$$

### Penalties:
1. **Temperature Deviation Penalty** (Ideal: $24.0^\circ\text{C} \le T_{op} \le 26.5^\circ\text{C}$):
   - Under-cooling ($T_{op} > 26.5^\circ\text{C}$): $P_{temp} = (T_{op} - 26.5) \cdot 11$
   - Over-cooling ($T_{op} < 24.0^\circ\text{C}$): $P_{temp} = (24.0 - T_{op}) \cdot 8$
2. **Humidity Penalty** (Ideal: $35\% \le RH \le 60\%$):
   - High humidity ($RH > 60\%$): $P_{humidity} = (RH - 60) \cdot 0.75$
   - Dry air ($RH < 35\%$): $P_{humidity} = (35 - RH) \cdot 0.45$

Composite Score:
$$S = \text{clamp}\left(100 - P_{temp} - P_{humidity}, 0, 100\right)$$

---

## 4. Power & Energy Integration Model

### Instantaneous Power
At each instant, total electrical power consumption is the sum of fan and cooling equipment:

$$P_{total}(t) = P_{fan}(\text{speed}) + P_{cooling}(\text{state})$$

#### Power Consumption Reference Tables:
- **BLDC Ceiling Fan**:
  - Off: $0\text{ W}$
  - Low: $12\text{ W}$
  - Medium: $28\text{ W}$
  - High: $45\text{ W}$
- **Inverter AC**:
  - Off: $0\text{ W}$
  - Resting (Compressor idling): $75\text{ W}$
  - Cooling (Active refrigeration): $1450\text{ W}$

### Energy Integration:
Cumulative energy consumed across simulation runtime is accumulated continuously:

$$E_{\text{kWh}}(t) = \sum \frac{P_{total}(t) \cdot \Delta t_{\text{hours}}}{1000}$$

### Honest Comparative Modeling:
The simulator strictly computes modeled energy savings directly from the Riemann sum:

$$\%\text{ Savings} = \frac{E_{baseline} - E_{smartair}}{E_{baseline}} \cdot 100\%$$

- **Safety Check**: If $E_{baseline} \le 0.0001\text{ kWh}$, the percentage returns $0\%$ to prevent division by zero or `NaN`.
- **Honesty Rule**: Results are never hardcoded to commercial claim ranges; they reflect actual simulated user setpoints and runtimes.

---

## 5. Smart Care Abnormal-Load Model

### 5.1 Edge Triggering & Latch Logic
To prevent false alarms and event flooding during simulation ticks, the load detection engine employs a strict edge-triggered state machine:

```
Condition: (loadKg > thresholdKg) AND (loadPlacedOnFan == true)

- If Previous State == FALSE and Current State == TRUE:
    ==> TRIGGER NEW CareEvent
    ==> Latch active detection
    ==> Sound local buzzer
    ==> Queue simulated RF packet

- If Previous State == TRUE and Current State == TRUE:
    ==> NO DUPLICATE EVENT CREATED (maintain latch)

- If Current State == FALSE:
    ==> Unlatch detector
    ==> Re-arm for subsequent events
```

### 5.2 Network & Siren Propagation
- **Radio Packet Latency**: Simulated $750\text{ms} - 800\text{ms}$ propagation over virtual Sub-GHz / LoRa link.
- **Gateway Resolution**: Resolves immutable room identifier against building registry.
- **Siren Activation Invariant**:
  $$\text{Siren Sounds} \iff (\text{Gateway Ingestion Succeeded}) \land (\text{Siren Output Available}) \land (\text{Siren Enabled})$$

---

## 6. Simulation Non-Goals & Boundaries

1. **No Physical Hardware Link**: This software does not connect to real serial ports, BLE devices, or physical Atomberg fan microcontrollers.
2. **No Emergency Dispatch**: Under no circumstances does this simulator send real cellular SMS messages, dial telephone numbers, or alert emergency services.
3. **No Direct Thermal Fan Cooling**: As emphasized in Section 1, the ceiling fan model does not chill physical room air.
