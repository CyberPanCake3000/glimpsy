import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import type { StartProfile } from '@/types/startProfile';
import type { GenerateScenariosResponse } from '@/types/scenario';
import type { BranchNode } from '@/lib/collectBranch';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY_SCENARIOS,
});

type RequestBody = {
  profile: StartProfile;
  branch: BranchNode[];
  anchorNodeId: string;
};

const SYSTEM_PROMPT = `You are a life scenario planner.
Return ONLY valid JSON. No markdown, no explanation.

Schema:
{
  "scenarios": [
    {
      "title": "string — short path name",
      "nodes": [
        { "id": "n1", "type": "event" | "action", "text": "string" }
      ],
      "edges": [
        { "source": "anchor", "target": "n1" }
      ]
    }
  ]
}

Rules:
- Generate exactly 2 scenarios
- Each scenario: 3-5 NEW nodes (continuations only, do not repeat the existing path)
- "event" = external things that happen TO the person
- "action" = decisions the person makes
- First edge of each scenario MUST be { "source": "anchor", "target": "n1" }
- Use "anchor" as source id in the first edge — the client will map it to the real node
- Node ids must be unique within a scenario (n1, n2, n3...)
- The 2 scenarios must be meaningfully different (not minor variations)
- Be specific to the user's profile (city, profession, income, savings, age)
- Continue logically from the existing life path provided by the user
- Text should be short (max 80 chars per node)`;

function formatBranch(branch: BranchNode[]): string {
  return branch
    .map((node) => {
      if (node.type === 'start') return '[start]';
      const label = node.type === 'event' ? 'event' : 'action';
      const text = node.text.trim() || '(empty)';
      return `[${label}] ${text}`;
    })
    .join(' → ');
}

function formatProfile(profile: StartProfile): string {
  return `Profile:
- Age: ${profile.age}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- City: ${profile.city}
- Profession: ${profile.profession}
- Income: ${profile.income}
- Savings: ${profile.savings}
- Activity: ${profile.activityLevel || 'not specified'}
- Goal: ${profile.goals}`;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { profile, branch, anchorNodeId } = body;

    if (!profile?.goals?.trim()) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    if (!Array.isArray(branch) || branch.length === 0) {
      return NextResponse.json({ error: 'Branch is required' }, { status: 400 });
    }

    if (!branch.some((node) => node.type === 'start')) {
      return NextResponse.json(
        { error: 'Branch must include start node' },
        { status: 400 },
      );
    }

    if (!anchorNodeId?.trim()) {
      return NextResponse.json(
        { error: 'anchorNodeId is required' },
        { status: 400 },
      );
    }

    const lastBranchNode = branch[branch.length - 1];
    if (lastBranchNode.id !== anchorNodeId) {
      return NextResponse.json(
        { error: 'anchorNodeId must match the last node in branch' },
        { status: 400 },
      );
    }

    const branchText = formatBranch(branch);
    const profileText = formatProfile(profile);

    const model = (process.env.MODEL_NAME ?? 'claude-haiku-4-5') as Anthropic.Model;

    const message = await anthropic.messages.create({
      model,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${profileText}

Current life path (already happened):
${branchText}

The user placed a "glimpse" marker at the end of this path.
Generate 2 alternative continuations FROM this point forward.
Do NOT repeat nodes from the current path.
Start each new scenario from "anchor".`,
        },
      ],
    });

    const rawText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    const parsed = parseScenariosJson(rawText);

    if (!parsed) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 },
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('generate-scenarios error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

function parseScenariosJson(raw: string): GenerateScenariosResponse | null {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const data = JSON.parse(cleaned) as GenerateScenariosResponse;

    if (!Array.isArray(data.scenarios) || data.scenarios.length === 0) {
      return null;
    }

    for (const scenario of data.scenarios) {
      if (
        !scenario.title ||
        !Array.isArray(scenario.nodes) ||
        !Array.isArray(scenario.edges) ||
        scenario.nodes.length === 0 ||
        scenario.edges.length === 0
      ) {
        return null;
      }

      for (const node of scenario.nodes) {
        if (
          !node.id ||
          !['event', 'action'].includes(node.type) ||
          !node.text?.trim()
        ) {
          return null;
        }
      }

      // первая связь должна начинаться с "anchor"
      const firstEdge = scenario.edges[0];
      if (firstEdge?.source !== 'anchor' || !firstEdge?.target) {
        return null;
      }
    }

    return data;
  } catch {
    return null;
  }
}