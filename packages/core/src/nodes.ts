import N8nNodesBase from "n8n-nodes-base/dist/known/nodes.json" with { type: "json" };
import N8nLangChainNodes from "@n8n/n8n-nodes-langchain/dist/known/nodes.json" with { type: "json" };

import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

import type { N8nNodes } from "./types.d.ts";
import { INodeTypeDescription } from "n8n-workflow";

const allKnownNodes: N8nNodes | undefined = undefined;

export async function getAllKnownNodes(): Promise<N8nNodes> {
  if (allKnownNodes) {
    return allKnownNodes;
  }
  const n8nBaseNodes: N8nNodes = await getNodeDescriptions(
    N8nNodesBase,
    "n8n-nodes-base",
  );
  const n8nLangChainNodes: N8nNodes = await getNodeDescriptions(
    N8nLangChainNodes,
    "@n8n/n8n-nodes-langchain",
  );

  return { ...n8nBaseNodes, ...n8nLangChainNodes };
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
  Object.entries(nodes).map(async ([key, node]) => {
    const fullKey = [pkgDir, key].join(".");
    descriptions[fullKey] = await loadNodeDescription(node, pkgDir);
  });
  return descriptions;
}
