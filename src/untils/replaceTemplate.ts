export function replaceTemplate(template: any, data: any) {
  return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
}
