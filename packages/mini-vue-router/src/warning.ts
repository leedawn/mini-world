export function warn(msg: string, ...args: unknown[]) {
  console.warn.apply(console, [msg, ...args])
}
