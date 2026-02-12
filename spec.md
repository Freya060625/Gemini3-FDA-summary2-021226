# Technical Specification: FDA 510(k) Review Studio - Intelligent Device Summary Module

## 1. Executive Summary

This document outlines the technical design and functional specifications for the "Intelligent Device Summary" module within the FDA 510(k) Review Studio. The objective is to augment the existing agentic AI system with a dedicated deep-dive generation engine. This engine allows users to input minimal device metadata (Name and Description) and receive a comprehensive, regulatory-grade markdown report (2000-3000 words), complete with data tables and strategic follow-up questions.

The system utilizes Google's Gemini 2.5 Flash and Gemini 3 Flash Preview models to handle the large context window and complex reasoning required for regulatory documentation.

---

## 2. System Architecture

### 2.1 High-Level Overview
The application follows a **Client-Side SPA (Single Page Application)** architecture using React 19. The application communicates directly with the Google GenAI SDK to minimize backend infrastructure complexity.

*   **Frontend Framework:** React 19 + TypeScript
*   **Styling:** Tailwind CSS (Custom "Flower" Themes: Nordic, Polar, Midnight, Aurora)
*   **AI Orchestration:** `@google/genai` SDK (Direct API calls via browser)
*   **State Management:** React `useState` / `useReducer` (Local + Lifted State for App Context)

### 2.2 Integration Point
The new feature acts as a sibling component to the existing modules (`Pipeline`, `NoteKeeper`, `Dashboard`). It is integrated into the `Layout` component via the navigation sidebar under the ID `summary`.

---

## 3. Feature Specification: Intelligent Device Summary

### 3.1 Functional Requirements

1.  **Input Mechanism:**
    *   User must provide **Device Name** (String).
    *   User must provide **Device Description** (String, multi-line).
    *   User must select **AI Model** (Selection: `gemini-2.5-flash`, `gemini-3-flash-preview`).

2.  **Prompt Customization (New):**
    *   **Advanced Prompt Settings:** A collapsible toggle in the input panel reveals configuration fields.
    *   **System Instruction:** Users can edit the system-level instruction (Default: "You are a senior FDA Regulatory Affairs expert...").
    *   **Prompt Template:** Users can edit the structural requirements (Word count, table requirements, specific sections) that are appended to the device details. This allows for adapting the summary style for different regulatory submissions (e.g., De Novo vs 510(k)).

3.  **Generation Engine:**
    *   The system must generate a structured document.
    *   **Target Length:** 2000 ~ 3000 words.
    *   **Format:** Standard Markdown.
    *   **Structural Elements:** Exactly 3 Markdown tables.
    *   **Ending:** A section containing exactly 20 strategic follow-up questions.

4.  **Interaction & Refinement:**
    *   **View Modes:** Toggle between `Preview` (Rendered HTML) and `Edit` (Raw Markdown).
    *   **Refinement Loop:** Users must be able to keep the generated summary in context and issue follow-up prompts (e.g., "Expand on the risk section") to modify the text without regenerating from scratch.

### 3.2 Content Strategy

The generated content must cover specific FDA regulatory domains:
*   **Intended Use & Indications:** Precise phrasing crucial for 510(k) logic.
*   **Regulatory Classification:** Product Code, Regulation Number, and Device Class prediction.
*   **Risk Analysis:** Alignment with ISO 14971 (Hazardous Situations, Harms, Mitigations).
*   **Substantial Equivalence (SE):** Comparison logic against potential predicates.
*   **Testing:** Biocompatibility (ISO 10993) and Performance Bench Testing.

### 3.3 Pipeline Customization

To enhance the flexibility of the standard Review Pipeline, the system now exposes agent configuration directly in the UI.

1.  **Editable System Prompts:**
    *   Users can click a "Settings" icon on any agent card (Classifier, Predicate Matcher, Risk Analyzer).
    *   This expands a configuration panel where the `System Instruction` can be edited in real-time.
    *   Changes to the prompt take effect immediately for the next run of that agent.

2.  **Parameter Tuning:**
    *   **Temperature:** A slider allows adjustment of model creativity (0.0 to 1.0).
    *   **Max Tokens:** Numeric input to control the verbosity of the agent's output.

---

## 4. Prompt Engineering Strategy

To achieve the specific constraints (Word count, Table count, Question count), the system utilizes a **Chain-of-Thought (CoT)** inspired prompt structure with explicit formatting constraints.

### 4.1 System Instruction
> "You are a Senior FDA Regulatory Affairs Consultant and Medical Device Engineer. You specialize in drafting comprehensive 510(k) pre-market notifications. Your writing style is technical, precise, and exhaustive."

### 4.2 User Prompt Structure
The prompt is dynamically constructed using template literals and the user-editable template:

```text
TASK: Create a comprehensive Regulatory Strategy Document for:
Device: ${deviceName}
Description: ${deviceDesc}

${promptTemplate}
```

**Default Prompt Template:**
```text
Requirements:
1. Length: Approximately 2000-3000 words.
2. Format: Structured Markdown.
3. Content:
   - Intended Use & Indications for Use
   - Regulatory Classification (Product Code, Regulation Number, Class)
   - Comprehensive Risk Analysis (ISO 14971 perspective)
   - Substantial Equivalence discussion
   - Biocompatibility & Performance Testing requirements
4. Tables: Include exactly 3 distinct tables (e.g., Predicate Comparison, Risk Table, Standards List).
5. Ending: Conclude with a section titled "Follow-up Questions" containing exactly 20 distinct questions relevant to the submission strategy.
```

### 4.3 Refinement Prompt Strategy
To support the "Keep prompt on summary" feature, the system passes the *current* markdown state back to the model as context.

```text
CONTEXT: The following is an existing regulatory draft:
"""
${currentSummaryMarkdown}
"""

USER INSTRUCTION: ${userRefinementPrompt}

TASK: Rewrite the document or specific sections to satisfy the User Instruction. Maintain the original depth and markdown formatting. Return the full updated document.
```

---

## 5. UI/UX Design

### 5.1 Layout
The interface utilizes a **Split-Screen / Master-Detail** layout to accommodate the input density and output length.

*   **Left Panel (Controls - 33% width):**
    *   Input fields for Device Name and Description.
    *   Model Selector dropdown.
    *   **Advanced Settings Toggle:** A gear icon next to the section title expands the prompt configuration area.
    *   Primary "Generate" Action Button (Visual prominence, loading state).
    *   Refinement Chat Input (Appears only after generation).
*   **Right Panel (Document Viewer - 66% width):**
    *   Header with View Toggles (Raw vs. Preview).
    *   Scrollable content area.
    *   Markdown rendering uses `react-markdown` with `remark-gfm` to ensure tables render correctly with borders and alignment.

### 5.2 Visual Language
The design adheres to the **"Nordic Flower"** design system:
*   **Glassmorphism:** Panels use `bg-white/5` with `backdrop-blur-md` to sit comfortably on dynamic backgrounds.
*   **Typography:** `Inter` font family for clean readability of long-form text.
*   **Feedback:** 
    *   *Loading:* Animate spin icons and "Consulting FDA Database..." text pulses to reassure the user during long generation times (10-20 seconds).
    *   *Success:* Toast notifications via the Log system.

---

## 6. Data Model & State

### 6.1 Component State (`FdaDeviceSummary.tsx`)

| State Variable | Type | Description |
| :--- | :--- | :--- |
| `deviceName` | `string` | User input for device name. |
| `deviceDesc` | `string` | User input for device mechanism/description. |
| `generatedSummary` | `string` | The raw markdown returned by Gemini. |
| `isGenerating` | `boolean` | Lock state for API calls. |
| `model` | `string` | Selected model ID (e.g., `gemini-3-flash-preview`). |
| `showSettings` | `boolean` | Toggle for advanced prompt inputs. |
| `systemPrompt` | `string` | Editable system instruction. |
| `promptTemplate` | `string` | Editable requirements template. |

### 6.2 Application State Integration
The module reads and writes to the global `AppState`:
*   **Read:** Check `appState.mana` before generation.
*   **Write:** Deduct `mana` (Cost: 50) and add `experience` (Reward: 50XP) upon successful generation.
*   **Log:** Push events to `LogEntry` array for the Dashboard.

---

## 7. Technical Constraints & Mitigation

### 7.1 Context Window Limits
*   **Challenge:** The Refinement feature requires sending the generated 3000-word summary *back* to the model.
*   **Solution:** Gemini 1.5/2.5/3 series models feature context windows >1M tokens. A 3000-word text is approx 4000 tokens, which is trivial for these models. No truncation logic is required.

### 7.2 Generation Latency
*   **Challenge:** Generating 3000 words takes significant time.
*   **Solution:**
    *   Set `timeout` to infinite or high value in fetch configuration (if applicable, though SDK handles streams well).
    *   Provide explicit visual feedback (Spinners).
    *   *Future Optimization:* Implement `generateContentStream` to render text chunk-by-chunk for better perceived performance.

---

## 8. Security & Compliance (Simulation)

While this is a demo/tool, the spec acknowledges:
*   **API Key Protection:** The `process.env.API_KEY` is used. In a production environment, this would be proxied through a backend to prevent key leakage in the client bundle.
*   **Data Privacy:** Input data is sent to Google Cloud. The prompt includes a disclaimer (implicit in the specialized nature) that this is for drafting and not final FDA submission without human review.
