// LLM 调用层：默认走本地 claude CLI（订阅 OAuth，零 API key），
// 设了 ANTHROPIC_API_KEY 时自动切到 Anthropic SDK（部署到 Vercel 用）
import { spawn } from "node:child_process";

export interface LlmResult {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  costUsd: number;
}

function runClaudeCli(
  prompt: string,
  { model = "haiku", timeoutMs = 180_000 } = {}
): Promise<LlmResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(`claude -p --model ${model} --output-format json`, {
      shell: true,
      windowsHide: true,
    });
    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("claude CLI 超时"));
    }, timeoutMs);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0)
        return reject(
          new Error(`claude CLI 退出码 ${code}: ${err.slice(0, 500)}`)
        );
      try {
        const envelope = JSON.parse(out);
        if (envelope.is_error)
          return reject(
            new Error(`claude CLI 报错: ${String(envelope.result).slice(0, 300)}`)
          );
        const usage = envelope.usage ?? {};
        resolve({
          text: envelope.result ?? "",
          model:
            Object.keys(envelope.modelUsage ?? {}).join(",") || `cli:${model}`,
          inputTokens:
            (usage.input_tokens ?? 0) +
            (usage.cache_creation_input_tokens ?? 0),
          outputTokens: usage.output_tokens ?? 0,
          cacheReadTokens: usage.cache_read_input_tokens ?? 0,
          costUsd: envelope.total_cost_usd ?? 0,
        });
      } catch {
        reject(new Error("无法解析 claude CLI 输出: " + out.slice(0, 300)));
      }
    });
    child.stdin.write(prompt, "utf8");
    child.stdin.end();
  });
}

async function runAnthropicApi(prompt: string): Promise<LlmResult> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const model = "claude-haiku-4-5-20251001";
  const msg = await client.messages.create({
    model,
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });
  const text = msg.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
  const inputTokens = msg.usage.input_tokens;
  const outputTokens = msg.usage.output_tokens;
  return {
    text,
    model,
    inputTokens,
    outputTokens,
    cacheReadTokens: msg.usage.cache_read_input_tokens ?? 0,
    // Haiku 4.5: $1/M in, $5/M out
    costUsd: (inputTokens / 1e6) * 1 + (outputTokens / 1e6) * 5,
  };
}

export async function generateText(prompt: string): Promise<LlmResult> {
  if (process.env.ANTHROPIC_API_KEY) return runAnthropicApi(prompt);
  return runClaudeCli(prompt);
}

/** 从模型输出里抠出 JSON（容忍代码围栏和前后废话） */
export function extractJson<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("模型输出中没有 JSON");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}
