export type Role = "user" | "assistant";
export type Message = { role: Role; content: string; ts: number; error?: boolean };

export const Modes = [
  { value: "ask", label: "ASK" },
  { value: "chat", label: "CHAT" },
] as const;

export type ModeValue = typeof Modes[number]["value"];