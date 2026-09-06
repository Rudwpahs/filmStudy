import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.28.2/full/pyodide.mjs';

let runtimePromise;
async function runtime() {
  if (!runtimePromise) runtimePromise = loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.2/full/' });
  return runtimePromise;
}

self.onmessage = async (event) => {
  const { id, code, packages = [] } = event.data;
  try {
    const pyodide = await runtime();
    const allowed = packages.filter((name) => name === 'numpy');
    if (allowed.length) await pyodide.loadPackage(allowed);
    const stdout = [];
    const stderr = [];
    pyodide.setStdout({ batched: (text) => stdout.push(text) });
    pyodide.setStderr({ batched: (text) => stderr.push(text) });
    const result = await pyodide.runPythonAsync(code);
    if (result !== undefined && result !== null && stdout.length === 0) stdout.push(String(result));
    self.postMessage({ id, type: 'result', stdout: stdout.join('\n'), stderr: stderr.join('\n') });
  } catch (error) {
    self.postMessage({ id, type: 'error', message: error instanceof Error ? error.message : String(error) });
  }
};
