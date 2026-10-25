# SmartAir — Interactive Digital-Twin Simulator

[![GitHub Repository](https://img.shields.io/badge/GitHub-osctoss%2FSmartAir-181717?logo=github)](https://github.com/osctoss/SmartAir)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-729b1a?logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.50-2EAD33?logo=playwright)](https://playwright.dev/)

> **SIMULATION ONLY DISCLAIMER**
> SmartAir is a software prototype and digital-twin simulator designed exclusively for educational, presentation, and technical evaluation purposes. It does **not** connect to real Atomberg ceiling fan hardware, real IoT microcontrollers, or physical sirens. It does **not** dial emergency services, make telephone calls, or send cellular SMS alerts. All thermal, comfort, and energy models are illustrative software estimates.

---

## 📖 Executive Summary

In Indian universities, student hostels, and PG accommodations, extreme summer temperatures drive intense cooling demand while institutional operators face paramount resident safety responsibilities.

**SmartAir** is a client-side interactive digital-twin simulator featuring two specialized commercial editions of BLDC smart fans within a single cohesive workspace:

1. **SmartAir Smart Home Edition**:
   - Comfort intelligence coordinating BLDC ceiling fans with inverter air conditioners.
   - Respects fundamental physics: fan airflow does not chill air temperature; instead, convective velocity depresses perceived skin temperature by up to 2.5°C, keeping residents comfortable at an energy-efficient 26°C AC setpoint.
   - Acoustic Quiet Mode ceiling cap (caps fan at Low speed during lectures/calls).
   - Occupancy-driven 60-second vacancy auto-off countdown.
   - Side-by-side **Energy Lab** comparative analytics derived directly from watt-hour Riemann integration without arbitrary hardcoded savings claims.

2. **SmartAir Smart Care Edition**:
   - Institutional safety intelligence for student hostels and residential facilities.
   - Interactive 2.5D isometric SVG room visualization with ceiling fan spin and draggable virtual weight (with accessible keyboard alternative).
   - Edge-triggered abnormal-load detection (10 kg default threshold) with duplicate event latching and clean re-arming.
   - Real-time animated radio packet propagation to a floor gateway.
   - Building siren coordination and simulated audio horn preview.
   - Interactive hardware fault injection (Radio Link Offline, Gateway Offline, Siren Fault).
   - Institutional Warden Operations Center featuring distinct Acknowledgement and Resolution workflows with exportable audit logs (CSV and JSON).

---

## ⚡ Quickstart Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` v9.0.0 or higher
- Git

### Installation & Execution
```bash
# Clone the repository
git clone https://github.com/osctoss/SmartAir.git
cd SmartAir

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing Suite

SmartAir is built with a comprehensive multi-tier test pyramid:

```bash
# Run all unit and component tests via Vitest
npm test

# Run tests in interactive watch mode
npm run test:watch

# Execute Playwright End-to-End browser journeys
npm run test:e2e

# Run strict TypeScript type verification (zero errors)
npm run typecheck

# Run ESLint validation
npm run lint

# Build production bundle
npm run build
```

---

## 🏛️ Application Architecture & Key Features

| View Route | Path | Description |
|---|---|---|
| **Overview** | `/overview` | Workspace KPI metrics, active room cards, quick status overview |
| **Room Registry** | `/rooms` | Searchable room table/grid, edition filters, clone and archive actions |
| **Add Room Wizard** | `/rooms/new` | 4-step provisioning wizard (Identity -> Edition -> Config -> Review) |
| **Room Simulator** | `/rooms/:roomId` | 2.5D Isometric SVG room twin, dual-edition dashboards, simulation clock |
| **Network Topology**| `/network` | Logical RF node-link diagram, packet travel dots, fault injection panel |
| **Warden Console** | `/admin` | Active incidents, permanent event audit trail, device registry, CSV export |
| **Event Detail** | `/admin/events/:id`| Deep-linkable lifecycle timeline tracking detection to resolution |
| **Energy Lab** | `/energy-lab` | Side-by-side comparative modeling, 24h benchmark, Recharts visualizations |
| **Settings** | `/settings` | Simulation speed, vacancy delays, reduce-motion toggle, JSON backup/restore |

---

## 📚 Technical Documentation

Deep-dive documentation is available in the [`docs/`](./docs) directory:
- [**System Architecture & State Flow (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md): Multi-store Zustand state graph, repository persistence, and decoupled simulation loops.
- [**Simulation & Mathematical Models (`docs/SIMULATION-MODEL.md`)**](./docs/SIMULATION-MODEL.md): Thermal equations, humidity drift, comfort index, power tables, and edge detection latching.
- [**Presenter's 3–5 Minute Demo Script (`docs/DEMO-SCENARIOS.md`)**](./docs/DEMO-SCENARIOS.md): Step-by-step walkthrough script for evaluating judges, stakeholders, and reviewers.

---

## 🛡️ License & Notice

Developed for demonstration and simulation purposes. Repository: [https://github.com/osctoss/SmartAir](https://github.com/osctoss/SmartAir). All third-party product names (e.g. Atomberg) are trademarks of their respective owners and referenced solely for commercial context and technological comparison.
