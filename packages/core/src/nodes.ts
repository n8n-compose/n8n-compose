import N8nNodesBase from "n8n-nodes-base/dist/known/nodes.json" with { type: "json" };
import N8nNodesBaseSpec from "n8n-nodes-base/package.json" with { type: "json" };
import N8nLangChainNodes from "@n8n/n8n-nodes-langchain/dist/known/nodes.json" with { type: "json" };
import N8nLangChainNodesSpec from "@n8n/n8n-nodes-langchain/package.json" with { type: "json" };

import { createHash } from "node:crypto";

import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promises as fs } from "node:fs";

import type { N8nNodes, N8nNodesCache } from "./types.d.ts";
import { INodeTypeDescription } from "n8n-workflow";
import { promiseQueue } from "./helpers.js";

let allKnownNodes: N8nNodes | null = null;

async function fetchCachedNodes(): Promise<N8nNodes | null> {
  const pkgs = [
    'n8n-nodes-base@' + N8nNodesBaseSpec.version,
    '@n8n/nodes-langchain@' + N8nLangChainNodesSpec.version,
  ].sort().join('-');
  const key = createHash('sha1').update(pkgs).digest('hex');
  const cachePath = process.cwd() + `/.n8n-compose-cache/nodes-${key}.json`;
  try {
    const cachedData = (await import(cachePath)).default as N8nNodesCache;
    return cachedData.nodes;
  } catch (error) {
    return null;
  }
}

export async function getAllKnownNodes(): Promise<N8nNodes> {
  if (allKnownNodes) {
    return allKnownNodes;
  }
  const cachedNodes = await fetchCachedNodes();
  if (cachedNodes) {
    console.log("Using cached node descriptions");
    allKnownNodes = cachedNodes;
    return cachedNodes;
  }
  const n8nBaseNodes: N8nNodes = await getNodeDescriptions(
    N8nNodesBase,
    "n8n-nodes-base",
  );
  const n8nLangChainNodes: N8nNodes = await getNodeDescriptions(
    N8nLangChainNodes,
    "@n8n/n8n-nodes-langchain",
  );
  allKnownNodes = {
    ...n8nBaseNodes,
    ...n8nLangChainNodes,
  };

  const pkgs = [
    'n8n-nodes-base@' + N8nNodesBaseSpec.version,
    '@n8n/nodes-langchain@' + N8nLangChainNodesSpec.version,
  ].sort().join('-');
  const cacheKey = createHash('sha1').update(pkgs).digest('hex');
  const cachePath = process.cwd() + `/.n8n-compose-cache/nodes-${cacheKey}.json`;
  const cacheDir = cachePath.substring(0, cachePath.lastIndexOf('/'));

  try {
    if (!(await fs.exists(cacheDir))) {
      fs.mkdir(cacheDir, { recursive: true });
    }
    await fs.writeFile(cachePath, JSON.stringify({
      meta: {
        generatedAt: new Date().toISOString(),
        packages: {
          'n8n-nodes-base': N8nNodesBaseSpec.version,
          '@n8n/nodes-langchain': N8nLangChainNodesSpec.version,
        },
      },
      nodes: allKnownNodes,
    }, null, 2));
  } catch (error) {
    console.error(`Failed to write cache file at ${cachePath}:`, error);
  }
  
  console.log(`Cached node descriptions to ${cachePath}`);
  return allKnownNodes;
}

export async function loadNodeDescription(
  code: {
    className: string;
    sourcePath: string;
  },
  pkgDir: string,
): Promise<INodeTypeDescription | undefined> {
  const path = join("node_modules", pkgDir, code.sourcePath);
  const absPath = resolve("../", "../", path);
  const modURL = pathToFileURL(absPath).href;

  try {
    const mod = await import(modURL);

    const NodeConstructor = mod[code.className] ?? mod.default;
    const instance = new NodeConstructor();

    return instance.description;
  } catch (error) {
    console.error(`Failed to load node description for ${code.className}: ${error}`);
  }
}

export async function getNodeDescriptions(
  nodes: {
    [key: string]: {
      className: string;
      sourcePath: string;
    };
  },
  pkgDir: string,
) {
  const descriptions: N8nNodes = {};
  let promises: Promise<void>[] = [];
  Object.entries(nodes).map(([key, node]) => {
    const promise = async () => {
      const fullKey = [pkgDir, key].join(".");
      const description = await loadNodeDescription(node, pkgDir);
      if (description) {
        descriptions[fullKey] = description;
      }
    }
    promises.push(promise());
  });
  await promiseQueue(promises, 100);
  console.log(
    `Loaded ${Object.keys(descriptions).length} node descriptions from ${pkgDir}`,
  );
  return descriptions;
}
