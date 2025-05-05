interface User {
  full_name: string;
  email: string;
}

export const processTemplate = (template: string, user: User): string => {
  return template
    .replace(/{user\.full_name}/g, user.full_name)
    .replace(/{user\.email}/g, user.email)
    .replace(/{church\.name}/g, 'CGPHC')
    .replace(/{date\.today}/g, new Date().toLocaleDateString())
    .replace(/{date\.time}/g, new Date().toLocaleTimeString());
};