import axios from 'axios';
import { injectable } from 'inversify';
import { Result, success, failure } from '../utils/result.js';
import { internalServerError, serviceUnavailable } from '../utils/errors.js';
import 'dotenv/config';

export interface GroqService {
  extractCharacters(
    text: string
  ): Promise<
    Result<{ characters: Array<{ name: string; aliases: string[] }> }>
  >;
  analyzeInteractionsAndSentiments(
    text: string,
    characters: Array<{ name: string; aliases: string[] }>
  ): Promise<
    Result<{
      nodes: Array<{ id: string; name: string; val: number }>;
      links: Array<{
        source: string;
        target: string;
        value: number;
        sentiment: 'positive' | 'negative' | 'neutral';
      }>;
    }>
  >;
}

@injectable()
export class Groq implements GroqService {
  private readonly apiKey = process.env['GROQ_API_KEY'];
  private readonly baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly model = 'llama-3.3-70b-versatile';

  private async makeRequest(
    messages: Array<{ role: string; content: string }>
  ): Promise<Result<string>> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages,
          temperature: 0.2,
          top_p: 1,
          max_tokens: 4000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      return success(response.data.choices[0].message.content);
    } catch (error) {
      console.warn('Groq API request failed:', error);

      if (error instanceof Error && error.message.includes('timeout')) {
        return failure(serviceUnavailable('Groq API request timeout'));
      }

      return failure(internalServerError('Groq API request failed'));
    }
  }

  private parseJSONResponse(response: string): any {
    try {
      // Strip any accidental prefaces/suffixes and clean up
      let cleanedResponse = response.trim();

      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '');

      // Find JSON object
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonString = jsonMatch[0];
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn(
        'JSON parsing failed, attempting to retry with cleaned response:'
      );

      // Try to extract just the JSON part more aggressively
      try {
        const jsonStart = response.indexOf('{');
        const jsonEnd = response.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const extractedJson = response.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(extractedJson);
        }
      } catch (retryError) {
        // If retry fails, throw original error
      }

      throw new Error(`Invalid JSON response: ${error}`);
    }
  }

  async extractCharacters(
    text: string
  ): Promise<
    Result<{ characters: Array<{ name: string; aliases: string[] }> }>
  > {
    const messages = [
      {
        role: 'system',
        content: `You extract characters from both plays and novels/prose. Return STRICT JSON ONLY. No prose.

OUTPUT SCHEMA:
{
  "characters": [
    { "name": "Hamlet", "aliases": ["Prince Hamlet", "Prince of Denmark"] },
    { "name": "Claudius", "aliases": ["King", "King of Denmark"] }
  ]
}

RULES FOR PLAYS:
- Look for speaker labels (e.g., "Hamlet:", "KING CLAUDIUS:")
- Only include characters who actually speak
- Exclude stage directions and narrators
- Include titles, nicknames, and abbreviations as aliases

RULES FOR NOVELS/PROSE:
- Look for characters mentioned in dialogue (quoted speech)
- Look for characters described in narration
- Include both speaking and non-speaking named characters
- Focus on recurring characters with clear identities
- Exclude generic references (e.g., "the servant", "a man")

GENERAL RULES:
- Use the most common name as the canonical name
- Include titles, nicknames, and abbreviations as aliases
- Prefer shorter names over longer titles (e.g., "Hamlet" not "Prince Hamlet")
- Unify different spellings/variants of the same character`,
      },
      {
        role: 'user',
        content: `TEXT:
${text}

Extract all characters from this text (play or novel). Include both speaking and non-speaking named characters.`,
      },
    ];

    const result = await this.makeRequest(messages);
    if (!result.success) {
      return result;
    }

    try {
      const parsed = this.parseJSONResponse(result.data);
      if (!parsed.characters || !Array.isArray(parsed.characters)) {
        return failure(
          internalServerError('Invalid character extraction response')
        );
      }

      console.log('Characters extracted');
      return success({
        characters: parsed.characters,
      });
    } catch (error) {
      return failure(
        internalServerError(`Failed to parse character extraction: ${error}`)
      );
    }
  }

  async analyzeInteractionsAndSentiments(
    text: string,
    characters: Array<{ name: string; aliases: string[] }>
  ): Promise<
    Result<{
      nodes: Array<{ id: string; name: string; val: number }>;
      links: Array<{
        source: string;
        target: string;
        value: number;
        sentiment: 'positive' | 'negative' | 'neutral';
      }>;
    }>
  > {
    const messages = [
      {
        role: 'system',
        content: `You analyze character interactions and their emotional sentiments in literary texts. Return STRICT JSON ONLY. No prose.

OUTPUT SCHEMA (for react-force-graph):
{
  "nodes": [
    { "id": "Romeo", "name": "Romeo", "val": 45 },
    { "id": "Juliet", "name": "Juliet", "val": 38 }
  ],
  "links": [
    { "source": "Romeo", "target": "Juliet", "value": 23, "sentiment": "positive" },
    { "source": "Tybalt", "target": "Romeo", "value": 15, "sentiment": "negative" },
    { "source": "Mercutio", "target": "Romeo", "value": 12, "sentiment": "neutral" }
  ]
}

INTERACTION ANALYSIS RULES:
- Count interactions between characters (speaking to each other, being in same scene, direct references)
- Use character names as node IDs (exact matches from the provided character list)
- Set node "val" to total interaction count for that character
- Set link "value" to interaction count between those two characters
- Include both directions for undirected interactions (A->B and B->A)
- Only include characters from the provided list
- Count interactions as: dialogue exchanges, scene co-presence, direct mentions

SENTIMENT CLASSIFICATION RULES:
- "positive": Characters who are friends, lovers, allies, or have warm/affectionate interactions
- "negative": Characters who are enemies, rivals, or have hostile/conflictual interactions
- "neutral": Characters who interact but have neither clearly positive nor negative feelings

ANALYSIS GUIDELINES:
- Look for dialogue tone, actions, and narrative descriptions
- Consider the overall context of their relationship
- Focus on emotional dynamics rather than just plot events
- Use character names exactly as provided in the source/target fields
- Only include relationships that have interactions (value > 0)`,
      },
      {
        role: 'user',
        content: `TEXT:
${text}

CHARACTERS TO ANALYZE:
${characters.map(c => `${c.name}${c.aliases && c.aliases.length > 0 ? ` (aliases: ${c.aliases.join(', ')})` : ''}`).join('\n')}

Analyze both interactions and emotional sentiments between these characters and return the complete graph structure with sentiment data.`,
      },
    ];

    const result = await this.makeRequest(messages);
    if (!result.success) {
      return result;
    }

    try {
      const parsed = this.parseJSONResponse(result.data);
      if (
        !parsed.nodes ||
        !Array.isArray(parsed.nodes) ||
        !parsed.links ||
        !Array.isArray(parsed.links)
      ) {
        return failure(
          internalServerError(
            'Invalid interaction and sentiment analysis response'
          )
        );
      }

      console.log('Interactions and sentiments analyzed');
      return success({
        nodes: parsed.nodes,
        links: parsed.links,
      });
    } catch (error) {
      return failure(
        internalServerError(
          `Failed to parse interaction and sentiment analysis: ${error}`
        )
      );
    }
  }
}
