import N8nNodesBase from "n8n-nodes-base/dist/known/nodes.json" with { type: "json" };
import N8nLangChainNodes from "@n8n/n8n-nodes-langchain/dist/known/nodes.json" with { type: "json" };

import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

import type { N8nNodes } from "./types.d.ts";

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
) {
  const absPath = join(pkgDir, code.sourcePath);
  const modURL = pathToFileURL(absPath).href;

  const mod = await import(modURL);

  const NodeConstructor = mod[code.className] ?? mod.default;
  const instance = new NodeConstructor();

  return instance.description;
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
