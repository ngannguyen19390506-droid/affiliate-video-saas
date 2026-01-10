export const VISION_USER_PROMPT = `
Analyze this image and return a JSON object with the following structure:

{
  "scene": "Brief description of the environment and context",
  "main_subject": "What is the main visible subject",
  "product_type": "Type of product if visible, otherwise null",
  "use_case": "How the product or subject is being used or could be used",
  "target_audience": "Who would most likely be interested in this",
  "key_visual_details": [
    "Important visible details (color, shape, texture, condition)"
  ],
  "emotion_or_vibe": "Overall feeling conveyed by the image",
  "selling_points": [
    "Practical benefits inferred from the image only"
  ],
  "limitations_or_uncertainty": [
    "Anything unclear or missing that should not be assumed"
  ]
}

Important:
- If a field cannot be confidently determined, use null or an empty array.
- Do NOT add any fields outside this structure.
- Ensure the JSON is strictly valid.
`;
