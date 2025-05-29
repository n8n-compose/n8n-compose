import type { INodeTypeDescription } from "n8n-workflow";
import { getAllKnownNodes } from "./nodes.js";

export async function getLatestTypeVersion(nodeType: string): Promise<number> {
  const allNodes = await getAllKnownNodes();

  let node: INodeTypeDescription | undefined = allNodes[nodeType];
  if (!node) {
    // Try to look for the node by name instead
    node = Object.values(allNodes).find((n) => n.name === nodeType);
    if (!node) {
      throw new Error(`Node type "${nodeType}" not found in known nodes.`);
    }
  }

  if (node.defaultVersion) {
    return node.defaultVersion;
  }

  return typeof node.version === "number"
    ? node.version
    : node.version[node.version.length - 1];
}
