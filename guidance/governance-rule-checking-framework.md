# Governance Rule-Checking Framework for Dreadmarch Campaign Manager

## Finalized Governance Framework:
The governance framework outlined in this document has been derived from "Dreadmarch_Development_Protocol v1.5." It consolidates all the fundamental principles, ensuring that the system adheres to established development protocols while remaining flexible.

---

## Translated Guidance from Dreadmarch_Development_Protocol v1.5

### Core Governance Rules

1. **No Guessing or Implicit Assumptions**:
   - All actions must rely solely on explicit inputs from the user or existing canonical resources.
   - If there is any ambiguity, contradiction, or outdated information, pause and request clarification.

2. **Avoid Duplication**:
   - Ensure no duplicate implementations of features, datasets, or systems exist.
   - Always check for existing structures or logic before creating something new.

3. **Environment Awareness**:
   - If the working environment resets or loses context, you must notify the user of what's missing and request required inputs/files.

4. **Mandatory Rule Check Pre-Actions**:
   - Identify the type of action (e.g., dataset modification, UI update, module reorganization).
   - Validate the action against all relevant rules and state whether it’s:
     - **Allowed**
     - **Conditionally Allowed**
     - **Not Allowed**
   - Cite specific rules when evaluating an action and pause unless explicitly okayed in the prior instruction.

5. **Simplicity First**:
   - Proactively suggest simpler designs or workflows where applicable.
   - Explain the trade-offs, and only simplify with explicit user approval.

---

### Dataset Rules

1. **Strict Dataset Modifications**:
   - Use only editor jobs adhering to DB5 patch systems.
2. **No Implicit Calculations**:
   - Endpoint recalculations or inferred data are not permitted unless explicitly requested.
3. **Formal Schema Updates**:
   - Adding new schema fields requires explicit user approval and a formal protocol process.

---

### Viewer Architecture Rules

1. **Centralized State**:
   - Center all datasets, styling modules, and panels within the `window.DM4` namespace.
2. **Error Transparency**:
   - Fail any initializations that encounter missing modules, invalid data, or UI contracts clearly and visibly.
3. **Host Separation**:
   - Host-specific code must remain in dedicated files and not interfere with core module logic.

---

### UI & Style Contract Rules

1. **Text Roles**:
   - Adhere strictly to pre-approved text-role classes. All updates require formal integration into protocols.
2. **Style Modularity**:
   - All palette variable modifications must remain confined to dedicated style modules.