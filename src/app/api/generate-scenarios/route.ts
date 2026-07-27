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
    startNodeId: string;
    goalNodeId: string;
    goalText: string;
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
        { "source": "start", "target": "n1" },
        { "source": "n1", "target": "n2" },
        { "source": "nN", "target": "goal" }
      ]
    }
  ]
}

Rules:
- Generate exactly 1 scenario
- Generate 3-5 NEW nodes (only events and actions)
- Build ONE linear path FROM "start" TO "goal"
- "start" = the left anchor node (already on the canvas) — do NOT include it in "nodes"
- "goal" = the target goal — do NOT include it in "nodes"
- First edge MUST be { "source": "start", "target": "n1" }
- Last edge MUST be { "source": "nN", "target": "goal" } where nN is the last node id
- Middle edges connect sequentially: n1→n2, n2→n3, etc.
- "event" = external things that happen TO the person
- "action" = decisions the person makes
- Node ids must be unique within the scenario (n1, n2, n3...)
- Be specific to the user's profile (city, profession, income, savings, age)
- Continue logically from the existing life path and lead toward the target goal
- Text should be short (max 80 chars per node)
- Do NOT repeat nodes from the existing path`;

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
- Activity: ${profile.activityLevel || 'not specified'}`;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { profile, branch, startNodeId, goalNodeId, goalText } = body;

    if (!goalText?.trim()) {
      return NextResponse.json({ error: 'Goal text is required' }, { status: 400 });
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

    if (!startNodeId?.trim() || !goalNodeId?.trim()) {
      return NextResponse.json(
        { error: 'startNodeId and goalNodeId are required' },
        { status: 400 },
      );
    }

    const lastBranchNode = branch[branch.length - 1];
    if (lastBranchNode.id !== startNodeId) {
      return NextResponse.json(
        { error: 'startNodeId must match the last node in branch' },
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

Current life path (context):
${branchText}

The left anchor node (use id "start" in edges) describes the current situation.
Target goal (use id "goal" in the last edge): ${goalText}

Generate 1 path of 3-5 events/actions that logically connects the starting point to the target goal.
Do NOT repeat nodes from the current path.
First edge: { "source": "start", "target": "n1" }
Last edge MUST end with { "source": "nN", "target": "goal" }`,
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

    data.scenarios = data.scenarios.slice(0, 1);

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

      const firstEdge = scenario.edges[0];
      const lastEdge = scenario.edges[scenario.edges.length - 1];
      if (firstEdge?.source !== 'start' || !firstEdge?.target) return null;
      if (lastEdge?.target !== 'goal') return null;
    }

    return data;
  } catch {
    return null;
  }
}