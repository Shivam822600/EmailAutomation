const fs = require('fs');
const path = require('path');

const templatePath = path.join(process.cwd(), 'template.html');

const loadTemplate = async () => {
  return fs.promises.readFile(templatePath, 'utf8');
};

const renderTemplate = (template, variables) => {
  return template.replace(/{{\s*(name|company)\s*}}/g, (match, key) => {
    return variables[key] || '';
  });
};

module.exports = {
  loadTemplate,
  renderTemplate,
};
