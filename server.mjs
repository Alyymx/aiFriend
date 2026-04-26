import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

app.use(cors());
app.use(express.json());

const toSlug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

const fallbackResearch = (query) => {
  const encoded = encodeURIComponent(query);
  return {
    answer: `Mochi found starter research for: "${query}". Add ANTHROPIC_API_KEY for deeper synthesis.`,
    links: [
      { title: `Google: ${query}`, url: `https://www.google.com/search?q=${encoded}` },
      { title: 'Wikipedia search', url: `https://en.wikipedia.org/wiki/Special:Search?search=${encoded}` },
      { title: 'arXiv papers', url: `https://arxiv.org/search/?query=${encoded}&searchtype=all` },
    ],
    docText: `# Research Brief\n\n## Topic\n${query}\n\n## Findings\n- This is fallback mode without Anthropic key.\n- Use listed sources to expand.\n\n## Sources\n- https://www.google.com/search?q=${encoded}\n- https://en.wikipedia.org/wiki/Special:Search?search=${encoded}\n- https://arxiv.org/search/?query=${encoded}&searchtype=all\n`,
    suggestedFileName: `mochi-research-${toSlug(query) || 'topic'}.md`,
  };
};

app.post('/api/research', async (req, res) => {
  const query = String(req.body?.query || '').trim();
  if (!query) return res.status(400).json({ error: 'Query is required' });

  if (!anthropic) return res.json(fallbackResearch(query));

  try {
    const prompt = `You are Mochi, a cat desktop AI agent. User request: "${query}".
Return strict JSON only:
{"answer":"2-4 concise sentences","links":[{"title":"","url":"https://..."}],"docText":"markdown report","suggestedFileName":"mochi-research-topic.md"}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 900,
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
    });

    const first = response.content[0];
    const rawText = first && first.type === 'text' ? first.text : '{}';
    const parsed = JSON.parse(rawText);
    return res.json(parsed);
  } catch {
    return res.json(fallbackResearch(query));
  }
});

app.listen(port, () => {
  console.log(`Mochi API listening on http://localhost:${port}`);
});
