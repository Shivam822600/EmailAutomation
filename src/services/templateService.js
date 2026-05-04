const fs = require('fs');
const path = require('path');

const templatePath = path.join(process.cwd(), 'template.html');

const loadTemplate = async () => {
  return fs.promises.readFile(templatePath, 'utf8');
};

module.exports = {
  loadTemplate,
};
