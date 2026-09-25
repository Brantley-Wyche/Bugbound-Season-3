import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

const severities = new Set(['Low', 'Medium', 'High', 'Critical']);
const difficulties = new Set(['Beginner', 'Intermediate', 'Hard']);
const sourceExtensions = ['', '.js', '.jsx', '.ts', '.tsx', '.json'];
const forbidden = [
  ['network requests', /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/],
  ['browser storage', /\b(localStorage|sessionStorage|indexedDB)\b/],
  ['cookies', /\bdocument\s*\.\s*cookie\b/],
  ['environment data', /\bimport\s*\.\s*meta\s*\.\s*env\b/],
  ['dynamic code execution', /\b(eval|Function)\s*\(/],
];

export function discoverLevelFolders(root, errors = []) {
  const base = join(root, 'src', 'levels');
  const result = [];
  for (const parent of [base, join(base, 'custom')]) {
    if (!existsSync(parent)) continue;
    const expectedParent = join(realpathSync(root), 'src', 'levels', parent === base ? '' : 'custom');
    if (relative(expectedParent, realpathSync(parent)) !== '') {
      errors.push(`${relative(root, parent)}: linked curriculum directory is not allowed`);
      continue;
    }
    for (const name of readdirSync(parent)) {
      const path = join(parent, name);
      if (!statSync(path).isDirectory()) continue;
      if (!/^\d/.test(name)) continue;
      if (relative(join(realpathSync(parent), name), realpathSync(path)) !== '') {
        errors.push(`${relative(root, path)}: linked level directory escapes its canonical location`);
        continue;
      }
      if (!/^\d{2,}-[a-z0-9-]+$/.test(name)) {
        errors.push(`${relative(root, path)}: malformed level folder name`);
        continue;
      }
      if (!existsSync(join(path, 'manifest.js'))) {
        errors.push(`${relative(root, path)}: missing manifest.js`);
        continue;
      }
      result.push({ id: name, path, custom: parent.endsWith(`${sep}custom`), number: Number(name.split('-')[0]) });
    }
  }
  return result.sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));
}

function property(object, name) {
  return object.properties.find((entry) => ts.isPropertyAssignment(entry) &&
    (entry.name?.text === name || entry.name?.getText() === name))?.initializer ||
    object.properties.find((entry) => ts.isShorthandPropertyAssignment(entry) && entry.name.text === name)?.name;
}

function literal(node) {
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = literal(node.left);
    const right = literal(node.right);
    return typeof left === 'string' && typeof right === 'string' ? left + right : undefined;
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  return undefined;
}

function strings(node) {
  if (!node || !ts.isArrayLiteralExpression(node) || !node.elements.length) return null;
  const values = node.elements.map(literal);
  return values.every((value) => typeof value === 'string' && value.trim()) ? values : null;
}

function dateIsValid(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function inside(folder, target) {
  const diff = relative(folder, target);
  return diff === '' || (!diff.startsWith(`..${sep}`) && diff !== '..' && !isAbsolute(diff));
}

function parsed(path, errors, root) {
  let source;
  try { source = readFileSync(path, 'utf8'); }
  catch (error) { errors.push(`${relative(root, path)}: ${error.message}`); return null; }
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true,
    /\.tsx?$/.test(path) ? ts.ScriptKind.TSX : ts.ScriptKind.JSX);
  if (ast.parseDiagnostics.length) errors.push(`${relative(root, path)}: invalid source syntax`);
  return { source, ast };
}

function scanGraph(root, folder, path, errors, warnings, visited) {
  const normalized = resolve(path);
  if (visited.has(normalized)) return;
  visited.add(normalized);
  let real;
  try { real = realpathSync(normalized); }
  catch { errors.push(`${relative(root, normalized)}: referenced source does not exist`); return; }
  if (!inside(realpathSync(folder), real)) {
    errors.push(`${relative(root, normalized)}: import escapes its level folder`);
    return;
  }
  const result = parsed(normalized, errors, root);
  if (!result) return;
  const imports = [];
  const restricted = new Set();
  const visit = (node) => {
    // Check executable references, not teaching prose, comments, or ordinary string data.
    let candidate = ts.isIdentifier(node) ? node.text : '';
    if (ts.isPropertyAccessExpression(node)) candidate = node.getText(result.ast);
    if (ts.isElementAccessExpression(node) && ts.isStringLiteral(node.argumentExpression)) {
      candidate = `${node.expression.getText(result.ast)}.${node.argumentExpression.text}`;
    }
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) candidate = `${node.expression.getText(result.ast)}(`;
    for (const [description, pattern] of forbidden) if (pattern.test(candidate)) restricted.add(description);
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      imports.push(literal(node.moduleSpecifier));
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      imports.push(node.arguments.length === 1 ? literal(node.arguments[0]) : undefined);
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'require') {
      errors.push(`${relative(root, normalized)}: CommonJS require is not allowed`);
    }
    ts.forEachChild(node, visit);
  };
  visit(result.ast);
  for (const description of restricted) errors.push(`${relative(root, normalized)}: custom levels may not use ${description}`);
  for (const specifier of imports) {
    if (typeof specifier !== 'string') { errors.push(`${relative(root, normalized)}: dynamic import is not allowed`); continue; }
    if (specifier === 'react') continue;
    if (!specifier.startsWith('.')) {
      errors.push(`${relative(root, normalized)}: external import '${specifier}' is not allowed`);
      continue;
    }
    const candidate = resolve(dirname(normalized), specifier);
    if (!inside(folder, candidate)) {
      errors.push(`${relative(root, normalized)}: import escapes its level folder`);
      continue;
    }
    const resolved = sourceExtensions.map((suffix) => candidate + suffix).find((item) => existsSync(item) && statSync(item).isFile());
    if (!resolved) { errors.push(`${relative(root, normalized)}: unresolved import '${specifier}'`); continue; }
    if (extname(resolved) !== '.json') scanGraph(root, folder, resolved, errors, warnings, visited);
  }
}

function solutionSections(source) {
  const matches = [...source.matchAll(/^## Level (\d{2,})\b[^\r\n]*(?:\r?\n|$)/gm)];
  return matches.map((match, index) => ({ number: Number(match[1]), body: source.slice(match.index + match[0].length, matches[index + 1]?.index ?? source.length) }));
}

export function inspectCurriculum(root) {
  const errors = [];
  const warnings = [];
  const levels = [];
  const folders = discoverLevelFolders(root, errors);
  if (!folders.length) errors.push('No level folders found');
  const hintsPath = join(root, 'src', 'levels', 'hints.json');
  const solutionsPath = join(root, 'SOLUTIONS.md');
  let hints = {};
  let solutions = '';
  try { hints = JSON.parse(readFileSync(hintsPath, 'utf8')); if (!hints || Array.isArray(hints) || typeof hints !== 'object') throw Error('expected object'); }
  catch (error) { errors.push(`hints.json: ${error.message}`); }
  try { solutions = readFileSync(solutionsPath, 'utf8'); }
  catch (error) { errors.push(`SOLUTIONS.md: ${error.message}`); }
  const sections = solutionSections(solutions);
  const firstHeading = solutions.search(/^## Level \d{2,}\b/m);
  const preamble = firstHeading < 0 ? solutions : solutions.slice(0, firstHeading);
  if (/^```\r?\n[A-Za-z0-9+/=\s]+\r?\n```/m.test(preamble)) {
    errors.push('SOLUTIONS.md: orphaned encoded solution body without a level heading');
  }
  const seenIds = new Set();
  const seenNumbers = new Set();
  for (const folder of folders) {
    const errorCount = errors.length;
    const manifestPath = join(folder.path, 'manifest.js');
    const label = relative(root, manifestPath).replaceAll('\\', '/');
    const doc = parsed(manifestPath, errors, root);
    if (!doc) continue;
    const exports = doc.ast.statements.filter((statement) => ts.isExportAssignment(statement) && !statement.isExportEquals);
    if (exports.length !== 1 || !ts.isObjectLiteralExpression(exports[0].expression)) {
      errors.push(`${label}: default export must be a literal object`);
      continue;
    }
    const object = exports[0].expression;
    const propertyNames = new Set();
    for (const entry of object.properties) {
      if (ts.isShorthandPropertyAssignment(entry) && entry.name.text === 'Component') continue;
      if (!ts.isPropertyAssignment(entry) || !ts.isIdentifier(entry.name)) {
        errors.push(`${label}: manifest must use explicit literal metadata fields`);
        continue;
      }
      if (propertyNames.has(entry.name.text)) errors.push(`${label}: duplicate field '${entry.name.text}'`);
      propertyNames.add(entry.name.text);
    }
    const meta = {};
    for (const field of ['id', 'number', 'title', 'concept', 'severity', 'difficulty', 'source', 'generatedAt', 'vague', 'symptom']) {
      const node = property(object, field);
      if (node) meta[field] = literal(node);
    }
    for (const field of ['id', 'title', 'concept', 'severity', 'symptom']) {
      if (typeof meta[field] !== 'string' || !meta[field].trim()) errors.push(`${label}: ${field} must be a nonempty literal string`);
    }
    if (!Number.isSafeInteger(meta.number) || meta.number < 1) errors.push(`${label}: number must be a positive literal integer`);
    if (meta.id !== folder.id) errors.push(`${label}: id must match folder name`);
    if (meta.number !== folder.number) errors.push(`${label}: folder prefix does not match level number`);
    if (!severities.has(meta.severity)) errors.push(`${label}: invalid severity`);
    if (folder.custom) {
      if (!difficulties.has(meta.difficulty)) errors.push(`${label}: invalid difficulty`);
      if (!['agent', 'human'].includes(meta.source)) errors.push(`${label}: invalid source`);
      if (!dateIsValid(meta.generatedAt)) errors.push(`${label}: generatedAt must be a valid calendar date`);
    }
    if (property(object, 'vague') && typeof meta.vague !== 'boolean') errors.push(`${label}: vague must be a literal boolean`);
    if (seenIds.has(meta.id)) errors.push(`${label}: duplicate id`);
    if (seenNumbers.has(meta.number)) errors.push(`${label}: duplicate number`);
    seenIds.add(meta.id);
    seenNumbers.add(meta.number);
    const files = strings(property(object, 'files'));
    if (!files) errors.push(`${label}: files must be a nonempty literal string array`);
    for (const file of files || []) {
      const target = resolve(root, file);
      if (!inside(folder.path, target)) errors.push(`${label}: files reference escapes its level folder`);
      else if (!existsSync(target)) errors.push(`${label}: files reference missing path '${file}'`);
      else if (!inside(realpathSync(folder.path), realpathSync(target))) errors.push(`${label}: files reference escapes its level folder through a link`);
    }
    const lesson = strings(property(object, 'lesson'));
    if (!lesson) errors.push(`${label}: lesson must be a nonempty literal string array`);
    const component = property(object, 'Component');
    const imports = new Set(doc.ast.statements.filter(ts.isImportDeclaration).flatMap((statement) => statement.importClause?.name ? [statement.importClause.name.text] : []));
    if (!component || !ts.isIdentifier(component) || !imports.has(component.text)) errors.push(`${label}: Component must reference an imported component`);
    const checkNodes = property(object, 'checks');
    const checks = [];
    if (!checkNodes || !ts.isArrayLiteralExpression(checkNodes) || !checkNodes.elements.length) errors.push(`${label}: checks must be a nonempty literal array`);
    else for (const entry of checkNodes.elements) {
      if (!ts.isObjectLiteralExpression(entry)) { errors.push(`${label}: check must be an object`); continue; }
      const nameNode = property(entry, 'name');
      const name = nameNode && literal(nameNode);
      if (typeof name !== 'string' || !name.trim()) errors.push(`${label}: check name must be a nonempty literal string`);
      const run = property(entry, 'run');
      if (!run || !(ts.isArrowFunction(run) || ts.isFunctionExpression(run))) errors.push(`${label}: check run must be a function expression`);
      if (typeof name === 'string') checks.push({ name });
    }
    if (folder.custom) {
      const visited = new Set();
      scanGraph(root, folder.path, manifestPath, errors, warnings, visited);
      const sources = [...visited].filter((path) => path !== manifestPath);
      if (!sources.length) errors.push(`${label}: no component source files`);
      else if (!sources.some((path) => existsSync(path) && readFileSync(path, 'utf8').includes('data-testid'))) warnings.push(`${label}: no data-testid found in component sources`);
    }
    const hint = hints[meta.id];
    if (!Array.isArray(hint) || hint.length !== 3 || !hint.every((item) => typeof item === 'string' && item.length > 8 && /^[A-Za-z0-9+/]+={0,2}$/.test(item) && Buffer.from(item, 'base64').toString('base64') === item)) errors.push(`${label}: hints.json needs three encoded hints`);
    const matchingSections = sections.filter((section) => section.number === meta.number);
    if (matchingSections.length !== 1) errors.push(`${label}: SOLUTIONS.md needs exactly one Level ${meta.number} section`);
    if (errors.length === errorCount) levels.push({ id: meta.id, number: meta.number, title: meta.title, concept: meta.concept, severity: meta.severity,
      ...(folder.custom ? { difficulty: meta.difficulty, source: meta.source, generatedAt: meta.generatedAt } : {}),
      ...(meta.vague !== undefined ? { vague: meta.vague } : {}), files: files || [], symptom: meta.symptom,
      lesson: lesson || [], checks, manifestPath: label });
  }
  for (const id of Object.keys(hints)) if (!seenIds.has(id)) errors.push(`hints.json: orphaned entry '${id}'`);
  for (const section of sections) {
    if (!seenNumbers.has(section.number)) errors.push(`SOLUTIONS.md: orphaned Level ${section.number}`);
    if (!/^\s*```(?:[a-zA-Z]*)\r?\n[A-Za-z0-9+/=\s]+\r?\n```\s*$/.test(section.body)) errors.push(`SOLUTIONS.md: Level ${section.number} needs one encoded fenced body`);
  }
  return { levels, errors, warnings };
}
