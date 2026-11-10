# GESTURA AI — Gesture-to-Action Mapping Reference

This document details the geometric detection logic, mathematical thresholds, and computer action mappings for each of the 7 supported hand gestures.

---

## Gesture Mapping Summary Table

| Gesture Name | Emoji | Target Computer Action | Geometric Condition | Debounce / Cooldown |
| :--- | :---: | :--- | :--- | :--- |
| **Open Palm** | 🖐️ | Activate / Pause Cursor Tracking | All 5 fingers extended ($\text{Tip}_y < \text{PIP}_y$) | 3-frame hysteresis |
| **Index Pointing** | 👉 | Move Mouse Cursor | Index extended; Middle, Ring, Pinky curled | Continuous EMA filter |
| **Pinch** | 👌 | Left Mouse Click | Distance(Thumb Tip, Index Tip) $< 0.045 \times \text{Scale}$ | 0.35s click cooldown |
| **Two-Finger Pinch** | 🤏 | Right Mouse Click (Context Menu) | Distance(Thumb Tip, Middle Tip) $< 0.048 \times \text{Scale}$ | 0.35s click cooldown |
| **Two-Finger Victory** | ✌️ | Vertical Page / Document Scroll | Index & Middle extended in V-shape; Ring & Pinky curled | 80ms throttle |
| **Closed Fist** | ✊ | Pause Controls / Safe Stop | All 4 fingers curled; Thumb tucked over knuckles | Instant trigger |
| **Thumbs Up** | 👍 | Confirm Selected Mode / Action | Thumb tip points vertically upward; 4 fingers curled | 0.5s confirmation |

---

## Kinematic Rule Specifications

### 1. OPEN PALM (Tracking Toggle)
- **Kinematic Rule**:
  $$\text{Index}_{\text{ext}} \land \text{Middle}_{\text{ext}} \land \text{Ring}_{\text{ext}} \land \text{Pinky}_{\text{ext}} \land \text{Thumb}_{\text{ext}}$$
- **Behavior**: When held steady for 3 consecutive frames, toggles cursor tracking mode without triggering mouse clicks.

### 2. INDEX FINGER POINTING (Cursor Movement)
- **Kinematic Rule**:
  $$\text{Index}_{\text{ext}} \land \neg \text{Middle}_{\text{ext}} \land \neg \text{Ring}_{\text{ext}} \land \neg \text{Pinky}_{\text{ext}}$$
- **Coordinate Mapping**:
  $$\hat{x} = \frac{x_{\text{index tip}} - m}{1 - 2m}, \quad \hat{y} = \frac{y_{\text{index tip}} - m}{1 - 2m}$$
  $$\text{Screen}_X = \text{clamp}(0, W - 1, \hat{x} \cdot W), \quad \text{Screen}_Y = \text{clamp}(0, H - 1, \hat{y} \cdot H)$$
- **Smoothing**: Filtered via Exponential Moving Average (EMA) and Deadzone ($\Delta d > 0.003$).

### 3. PINCH (Left Mouse Click)
- **Kinematic Rule**:
  $$\frac{\|\mathbf{p}_{\text{thumb tip}} - \mathbf{p}_{\text{index tip}}\|_2}{\text{Scale}} < \theta_{\text{pinch}} \quad (\theta_{\text{pinch}} \approx 0.045)$$
- **Click Event**: Executes `pyautogui.click(button='left')`.
- **Cooldown**: 350ms lockout timer prevents accidental double clicks.

### 4. TWO-FINGER PINCH (Right Mouse Click)
- **Kinematic Rule**:
  $$\frac{\|\mathbf{p}_{\text{thumb tip}} - \mathbf{p}_{\text{middle tip}}\|_2}{\text{Scale}} < \theta_{\text{two\_finger\_pinch}} \quad (\theta \approx 0.048)$$
- **Click Event**: Executes `pyautogui.click(button='right')`. Opens native context menus on macOS, Windows, and Linux.

### 5. TWO-FINGER VICTORY (Scroll)
- **Kinematic Rule**:
  $$\text{Index}_{\text{ext}} \land \text{Middle}_{\text{ext}} \land \neg \text{Ring}_{\text{ext}} \land \neg \text{Pinky}_{\text{ext}}$$
- **Vertical Displacement**:
  $$\Delta y = y_{\text{index tip}}^{(t-1)} - y_{\text{index tip}}^{(t)}$$
  $$\text{Scroll Amount} = \text{int}\left(\Delta y \times 120.0 \times \text{Sensitivity}_{\text{scroll}}\right)$$
  - $\Delta y > 0 \implies \text{Scroll Up}$
  - $\Delta y < 0 \implies \text{Scroll Down}$

### 6. CLOSED FIST (Safe Stop)
- **Kinematic Rule**:
  $$\neg \text{Index}_{\text{ext}} \land \neg \text{Middle}_{\text{ext}} \land \neg \text{Ring}_{\text{ext}} \land \neg \text{Pinky}_{\text{ext}} \land \neg \text{Thumb}_{\text{ext}}$$
- **Action**: Immediately freezes cursor coordinates, releases any held mouse buttons, and engages safe stop.

### 7. THUMBS UP (Confirmation Mode)
- **Kinematic Rule**:
  $$y_{\text{thumb tip}} < y_{\text{thumb IP}} < y_{\text{thumb MCP}} \quad \land \quad y_{\text{thumb tip}} < y_{\text{wrist}} - 0.2 \cdot \text{Scale}$$
  $$\neg \text{Index}_{\text{ext}} \land \neg \text{Middle}_{\text{ext}} \land \neg \text{Ring}_{\text{ext}} \land \neg \text{Pinky}_{\text{ext}}$$
- **Action**: Triggers modal confirmation, dialog approval, or mode activation.

---

## Conflict Resolution & Hysteresis

To guarantee that ambiguous transitions do not fire conflicting actions:
1. **Priority Hierarchy**:
   `CLOSED_FIST` (Highest) $\to$ `THUMBS_UP` $\to$ `PINCH` $\to$ `TWO_FINGER_PINCH` $\to$ `VICTORY` $\to$ `INDEX_POINTING` $\to$ `OPEN_PALM` (Lowest).
2. **Temporal Window**: A gesture must be classified in at least 3 of the last 5 sliding frames before being dispatched as confirmed.
3. **Release Hysteresis**: Pinch release threshold ($0.075$) is higher than pinch activation threshold ($0.045$), preventing boundary oscillation.
