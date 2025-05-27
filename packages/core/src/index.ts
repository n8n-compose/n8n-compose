import type { INode, IConnections, IWorkflowBase } from "n8n-workflow";
import type { NodeBase, WorkflowJson } from "./types";
import { nanoid } from "nanoid";
import { getLatestTypeVersion } from "./node-versioning";

export { file } from "./files";

export async function defineWorkflow<N extends readonly NodeBase[]>(
  wf: WorkflowJson<N>,
): Promise<IWorkflowBase> {
  const nodes: INode[] = [];
  const connections: IConnections = {};

  for (const node of wf.nodes) {
    nodes.push({
      id: node.id ?? nanoid(16),
      type: node.type,
      parameters: node.parameters ?? {},
      name: node.name ?? `${node.type} Node`,
      position: node.position ?? [0, 0],
      disabled: node.disabled ?? false,
      notes: node.notes ?? "",
      notesInFlow: node.notesInFlow ?? false,
      // TODO: How to handle plugin nodes?
      typeVersion: node.typeVersion ?? (await getLatestTypeVersion(node.type)),
    });
  }

  wf.connections.forEach((connection) => {
    const [sourceOpts, targetOpts] = connection;
    const sourceNode = sourceOpts.node;
    const sourceType = sourceOpts.type;
    const sourceIndex = sourceOpts.index ?? 0;

    if (!connections[sourceNode]) {
      connections[sourceNode] = {};
    }
    if (!connections[sourceNode][sourceType]) {
      connections[sourceNode][sourceType] = [];
    }
    const conn = connections[sourceNode][sourceType];
    if (!conn[sourceIndex]) {
      while (conn.length <= sourceIndex) {
        conn.push([]);
      }
    }
    const lane = conn[sourceIndex]!;
    lane.push({
      node: targetOpts.node,
      type: targetOpts.type,
      index: targetOpts.index ?? 0,
    });
  });

  return {
    id: wf.id ?? nanoid(16),
    name: wf.name,
    active: wf.active ?? true,
    createdAt: wf.createdAt ?? new Date(),
    updatedAt: wf.updatedAt ?? new Date(),
    nodes: nodes,
    connections: connections,
  } as IWorkflowBase;
}
