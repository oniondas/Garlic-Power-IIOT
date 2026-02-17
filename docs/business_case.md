# 💼 Garlic: Business Case & ROI Analysis

> **"Industrial IoT that pays for itself in less than 2 weeks."**

This document outlines the financial viability of the Garlic system, including a detailed Bill of Materials (BOM) and breakdown of the Return on Investment (ROI) for a typical SME factory.

---

## 💰 1. Bill of Materials (BOM) Breakdown

## 💰 1. Bill of Materials (BOM) Breakdown

Our "Stick & Play" node is engineered for extreme cost-efficiency. Below is the optimized BOM for mass production.

### **Per-Node Cost (Device A)**

| Component | Specification | Individual (₹) | **Bulk (₹)** |
| :--- | :--- | :--- | :--- |
| **Microcontroller** | ESP32-WROOM-32E-N4 | ₹150 | **₹47** |
| **Current Sensor** | SCT-013-030 Current Sensor | ₹350 | **₹120** |
| **Vibration Sensor** | LIS3DH (MEMS Chip) | ₹140 | **₹25** |
| **Power Regulation** | HT7333 LDO | ₹15 | **₹5** |
| **Passives** | Capacitors + Resistors | ₹25 | **₹15** |
| **Connectors** | Screw Terminals | ₹30 | **₹20** |
| **PCB** | 2-Layer FR4 | ₹80 | **₹30** |
| **Enclosure** | IP65 Enclosure | ₹200 | **₹60** |
| **Assembly** | Misc (headers, buffer) | ₹30 | **₹15** |
| **🔷 TOTAL COST** | | **₹1,020** | **₹337** |

> **Target Price**: At scale, a Garlic Node costs **₹337** to manufacture.
> **Comparison**: Traditional Wired vibration sensors cost **₹15,000+** per point + cabling labor.

---

## 📉 2. Return on Investment (ROI) Calculation

We calculate ROI based on two vectors: **Energy Savings** (Immediate) and **Downtime Prevention** (Insurance).

### **Scenario: Mid-Sized CNC Workshop**
*   **Machine Type**: 3-Axis CNC Machine (15kW Motor).
*   **Operational Hours**: 16 hours/day (2 Shifts).
*   **Electricity Rate**: **₹10.50 - ₹12.00 per kWh** (Commercial Grid Statistics 2024[^1]).

### **A. ROI Vector 1: Energy Leakage (The "Idle" Problem)**
Machines are often left running "Idle" (Motor ON, no cutting) during breaks or setup changes.
*   **Idle Power Consumption**: 2 kW (Coolant + Spindle idle).
*   **Wastage Per Day**: ~2 hours of avoidable idle time.
*   **Daily Loss**: 2 kW × 2 hours × ₹12 = **₹48 / day**.
*   **Monthly Loss**: ₹48 × 26 days = **₹1,248 / month**.

> **Payback Period (Energy Only)**:
> Cost of Device (₹337) / Monthly Savings (₹1,248) = **0.27 Months (approx. 8 Days)**.

### **B. ROI Vector 2: Downtime Prevention (One Failure Saved)**
Unplanned downtime can cost upwards of **$22,000 (₹18 Lakhs) per minute** globally[^2]. For local SMEs, a 2-day outage is catastrophic.
*   **Machine Failure**: Spindle Bearing Seizure.
*   **Loss Impact**: 16 hours × ₹5,000 = **₹80,000**.
*   **Garlic Value**: Detects "High Vibration" 2 weeks in advance.
*   **Savings**: ₹80,000 (Prevented Loss).

> **Total Year-1 Savings per Machine**:
> (Energy: ₹15,000) + (Prevented Failure: ₹80,000) - (Device Cost: ₹337) = **₹94,663 Profit**.

---

## 🚀 3. Scalability Model (SaaS)

Garlic is not just hardware; it's a platform.

*   **CAPEX (One-time)**: Hardware sold at 40% margin (~₹1,500 to end user).
*   **OPEX (Recurring)**: Cloud Dashboard & "AI Insights" Subscription.
    *   **Basic**: Free (Local View).
    *   **Pro**: ₹199/month/node (Historical Trends, Email Alerts, API Access).

### **Deployment Speed Impact**
*   **Traditional System**: 2 Engineers × 5 Days (Wiring) = ₹20,000 Labor Cost.
*   **Garlic System**: 1 Person × 2 Hours (Stick & Play) = ₹500 Labor Cost.
*   **Result**: 97% reduction in deployment cost.

---

## 🏆 Summary
*   **Hardware Cost**: < ₹350 @ Scale.
*   **Payback Period**: < 8 Days.
*   **Value Proposition**: Self-funding predictive maintenance.

---

### **References / Data Sources**
[^1]: **Industrial Power Tariffs**: Average commercial industrial rate in India is approx. ₹10.49/kWh (2025 Est), peaking higher in states like Maharashtra. [Source: Lakshmishree / Global Climatescope 2024]
[^2]: **Downtime Costs**: Global automotive downtime costs can reach $22k/min. Heavy industry averages high losses per hour. [Source: Siemens / The AEMT 2024 Reports]
