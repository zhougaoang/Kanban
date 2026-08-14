/** 生成简单唯一 id（客户端本地使用，无需 uuid 依赖）。 */
export function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
