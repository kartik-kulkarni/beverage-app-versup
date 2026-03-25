interface DeepInfraSearchResult {
  suggestions: Array<{ name: string; type: string }>;
}

interface DeepInfraDetailsResult {
  description: string;
  tasting_notes: string;
  photo_url: string;
  serving_suggestions: string[];
}

function stripCodeBlock(content: string): string {
  let cleaned = content;
  if (cleaned.includes("```json")) {
    cleaned = cleaned.split("```json")[1].split("```")[0];
  } else if (cleaned.includes("```")) {
    cleaned = cleaned.split("```")[1].split("```")[0];
  }
  return cleaned.trim();
}

async function callDeepInfra(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<string> {
  const baseUrl =
    process.env.DEEPINFRA_BASE_URL || "https://api.deepinfra.com/v1/openai";
  const model =
    process.env.DEEPINFRA_MODEL ||
    "meta-llama/Llama-4-Scout-17B-16E-Instruct";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepInfra API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function searchBeverages(
  query: string
): Promise<DeepInfraSearchResult["suggestions"]> {
  const prompt = `You are a beverage expert. Given the partial or full name "${query}", 
identify the 5 best matching beverages (beers, wines, spirits, or liqueurs).

For each match, provide:
- name: The full official name of the beverage
- type: The category/type (e.g., "Scotch Whisky - Islay Single Malt", "IPA Beer", "Cabernet Sauvignon - Red Wine", "Orange Liqueur", "London Dry Gin", etc.)

Return ONLY a valid JSON object in this exact format:
{
  "suggestions": [
    {"name": "Full Beverage Name", "type": "Beverage Category/Type"},
    ...
  ]
}

Focus on well-known, real beverages. Be specific with the type classification.`;

  const content = await callDeepInfra(
    "You are a beverage expert assistant. Always respond with valid JSON only.",
    prompt,
    1000
  );

  const parsed: DeepInfraSearchResult = JSON.parse(stripCodeBlock(content));
  return parsed.suggestions.slice(0, 5);
}

export async function getBeverageDetails(
  name: string,
  beverageType: string
): Promise<DeepInfraDetailsResult> {
  const prompt = `You are a beverage expert. Provide detailed information about "${name}" (${beverageType}).

Return ONLY a valid JSON object with this exact structure:
{
  "description": "A concise 5-6 line description covering the beverage's history, origin, and what makes it notable.",
  "tasting_notes": "Detailed tasting notes including aroma, flavor profile, finish, and any distinctive characteristics.",
  "photo_url": "https://via.placeholder.com/400x600.png?text=${encodeURIComponent(name)}",
  "serving_suggestions": ["List of serving suggestions appropriate for this beverage type"]
}

For serving_suggestions:
- For spirits and liqueurs: Include "Neat", "On the rocks" if appropriate, and 2-3 popular cocktails that feature this beverage
- For beer: Include serving temperature, glassware recommendations
- For wine: Include serving temperature, decanting recommendations, food pairings

Be accurate and specific to this exact beverage.`;

  const content = await callDeepInfra(
    "You are a beverage expert assistant. Always respond with valid JSON only.",
    prompt,
    1500
  );

  const parsed: DeepInfraDetailsResult = JSON.parse(stripCodeBlock(content));

  parsed.photo_url = `https://via.placeholder.com/400x600.png?text=${encodeURIComponent(name)}`;

  return parsed;
}
