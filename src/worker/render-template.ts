/** جایگزینی ساده {{variable}} در متن قالب پیامک */
export function renderTemplate(body: string, variables: Record<string, string>): string {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => variables[key] ?? '')
}
