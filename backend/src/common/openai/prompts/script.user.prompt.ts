export const SCRIPT_USER_PROMPT = `
You are given the following image analysis result in JSON format:

{{VISION_JSON}}

Using ONLY this information, generate a short video script with the structure below:

{
  "hook": "1–2 short sentences that immediately grab attention in the first 2 seconds",
  "body": [
    "2–4 short spoken sentences describing the situation, use case, or benefit",
    "Sentences should feel natural when spoken aloud"
  ],
  "cta": "A soft, non-pushy call to action encouraging viewers to check the link"
}

Guidelines:
- The hook should focus on a relatable problem, situation, or curiosity.
- The body should reflect practical benefits inferred from the image.
- The CTA must be gentle (e.g. 'Ai cần thì xem link nhé'), not salesy.
- Do NOT add emojis.
- Do NOT mention discounts, prices, or guarantees.
- If some information is missing, keep the script generic rather than guessing.
- Ensure the JSON is strictly valid.
`;
