# Quiz Import - LLM Conversion Prompt

**Purpose:** This prompt is designed to be given to an LLM (like ChatGPT, Claude, etc.) along with:
1. Unformatted quiz questions from a teacher
2. The downloaded quiz import template JSON file

The LLM will convert the teacher's questions into the proper JSON format that matches our import template.

---

## 📋 Instructions for Admin

1. Download the quiz import template from the quiz module editor
2. Copy the teacher's questions (in any format - text, Word doc, PDF text, etc.)
3. Give both to the LLM with the prompt below
4. Copy the LLM's output JSON
5. Save it as a `.json` file
6. Import it using the "Import from JSON" button

---

## 🤖 LLM Prompt (Copy This Entire Section)

```
You are a quiz data conversion assistant. Your task is to convert unformatted quiz questions into a specific JSON format for a quiz import system.

## CRITICAL RULES - READ CAREFULLY:

1. **INCLUDE ANSWERS AND EXPLANATIONS** - The import system now accepts:
   - `correct_answer` (optional) - Plain text answer that matches one of the options
   - `explanation` (optional) - Plain text explanation (no HTML formatting)

2. **ONLY INCLUDE** these fields:
   - `question` (required) - Plain text question
   - `question_html` (optional) - HTML formatted question (only if provided)
   - `options` (required) - Array of plain text options (minimum 2)
   - `options_html` (optional) - Array of HTML formatted options (only if provided)
   - `points` (optional) - Points for question (defaults to 1 if not provided)
   - `correct_answer` (optional) - Plain text answer (must exactly match one of the options)
   - `explanation` (optional) - Plain text explanation (no HTML, admins can format in UI if needed)

**Note:** 
- `correct_answer` and `explanation` are plain text only. They will be pre-filled in the UI where admins can format them if needed.
- Time limit and attempt limit are set separately in the UI by admins, not in the import JSON.

## INPUT FILES:

You will receive:
1. **Template File**: A JSON template showing the exact structure required
2. **Teacher Questions**: Unformatted questions in any format (text, list, etc.)

## OUTPUT REQUIREMENTS:

Generate a JSON object that:
- Matches the template structure EXACTLY
- Contains questions, options, and optionally answers/explanations
- Has valid JSON syntax
- Has at least 2 options per question
- Uses plain text for `question`, `options`, `correct_answer`, and `explanation` fields
- Only includes `question_html` and `options_html` if HTML formatting is explicitly provided
- Ensures `correct_answer` exactly matches one of the options (case-sensitive)

## VALIDATION RULES:

Before outputting, verify:
- ✅ Every question has a `question` field (non-empty string)
- ✅ Every question has an `options` array with at least 2 items
- ✅ All options are non-empty strings
- ✅ If `correct_answer` is provided, it exactly matches one of the options
- ✅ `explanation` is plain text only (no HTML)
- ✅ `points` is a positive number or omitted (defaults to 1)
- ✅ If `options_html` exists, its length matches `options` length
- ✅ JSON is valid and properly formatted

## EXAMPLE OUTPUT STRUCTURE:

```json
{
  "quiz": [
    {
      "question": "What is 2+2?",
      "options": ["2", "3", "4", "5"],
      "correct_answer": "4",
      "explanation": "2 plus 2 equals 4",
      "points": 1
    },
    {
      "question": "What is the capital of France?",
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "correct_answer": "Paris",
      "explanation": "Paris is the capital and largest city of France",
      "points": 1
    }
  ]
}
```

**Note:** 
- `correct_answer` must exactly match one of the options (case-sensitive)
- `explanation` is plain text only (no HTML)
- Time limit and attempt limit are set separately in the UI, not in the import JSON

## PROCESSING STEPS:

1. **Read the template file** to understand the exact structure
2. **Parse the teacher's questions** - extract:
   - Question text
   - All options (even if marked as "correct" or "answer")
   - **Correct answer** - The option text that is marked as correct (must match one of the options exactly)
   - **Explanation** - Any explanation text provided (plain text only, no HTML)
   - Points (if mentioned)
   - HTML formatting (if present)
3. **Extract answers and explanations**:
   - Identify which option is marked as correct (from markers like "(Correct)", "(Answer)", "✓", "★", or answer keys)
   - Extract the explanation text if provided
   - Include `correct_answer` field with the exact option text
   - Include `explanation` field with plain text explanation (strip any HTML if present)
4. **Build the JSON** following the template structure
5. **Validate** against all rules above (especially that `correct_answer` matches one of the options)
6. **Output ONLY the JSON** - no explanations, no markdown code blocks, just pure JSON

## COMMON SCENARIOS:

**Scenario 1: Simple text questions with answer**
```
Q1. What is 2+2?
a) 2
b) 3
c) 4 (correct)
d) 5
```
→ Convert to JSON with:
- options: ["2", "3", "4", "5"]
- correct_answer: "4" (the option text marked as correct)

**Scenario 2: Questions with answer key**
```
Question: What is the capital of France?
Options: A) Paris, B) London, C) Berlin, D) Madrid
Answer: A
```
→ Convert to JSON with:
- options: ["Paris", "London", "Berlin", "Madrid"]
- correct_answer: "Paris" (the option corresponding to Answer A)

**Scenario 3: Questions with explanations**
```
Q: What is photosynthesis?
A) Process of making food
B) Process of breathing
C) Process of reproduction
Answer: A
Explanation: Photosynthesis is the process by which plants make food.
```
→ Convert to JSON with:
- options: ["Process of making food", "Process of breathing", "Process of reproduction"]
- correct_answer: "Process of making food" (the option corresponding to Answer A)
- explanation: "Photosynthesis is the process by which plants make food." (plain text)

**Scenario 4: Multiple choice with points**
```
Question 1 (5 points): What is 2+2?
1. 2
2. 3
3. 4 (correct)
4. 5
```
→ Convert with:
- points: 5
- correct_answer: "4" (the option text marked as correct)

## ERROR PREVENTION:

- ❌ DO NOT guess which option is correct (only include if clearly marked)
- ✅ DO include `correct_answer` field if answer is clearly indicated
- ✅ DO include `explanation` field if explanation is provided
- ✅ DO ensure `correct_answer` exactly matches one of the options (case-sensitive)
- ✅ DO use plain text for `explanation` (strip any HTML formatting)
- ❌ DO NOT modify question text to remove answer indicators (extract them to `correct_answer` field)
- ❌ DO NOT add fields not in the template
- ✅ DO preserve all options exactly as written
- ✅ DO use plain text for `correct_answer` and `explanation` (no HTML)
- ✅ DO maintain question order
- ❌ DO NOT include metadata (time_limit, attempt_limit) - these are set via UI

## OUTPUT FORMAT:

Output ONLY valid JSON. Do not include:
- Markdown code blocks (```json)
- Explanations before/after
- Comments in JSON
- Any text outside the JSON

Start directly with `{` and end with `}`.

---

Now, please convert the provided teacher questions into the required JSON format following all rules above.
```

---

## 📝 Usage Example

**Admin's message to LLM:**

```
[Paste the prompt above]

Here is the template file:
[Paste the downloaded template JSON]

Here are the teacher's questions:
[Paste the unformatted questions]

Please convert them to the required JSON format.
```

---

## ✅ Verification Checklist

After receiving LLM output, verify:
- [ ] JSON is valid (can be parsed)
- [ ] No `correct_answer` or `answer` fields
- [ ] No `explanation` or `explanation_html` fields
- [ ] Every question has at least 2 options
- [ ] All required fields are present
- [ ] File can be imported successfully

---

**Last Updated:** January 2026  
**Version:** 1.0
