import type {
  NodeBase,
  WorkflowJson,
  Connections,
  ConnectionOptions,
} from "./types.js";
import { IWorkflowBase, NodeConnectionType } from "n8n-workflow";

type ConnectionMutable<N extends readonly NodeBase[]> = [
  ConnectionOptions<N>,
  ConnectionOptions<N>,
];

export async function parseWorkflowJSON(
  wf: IWorkflowBase,
): Promise<WorkflowJson<NodeBase[]>> {
  /**
   * Converts a workflow JSON exported from n8n into an n8n-compose configuration.
   *
   * @param wf - The workflow JSON object to convert.
   * @return A promise that resolves to a WorkflowJson object compatible with n8n-compose.
   * @throws {Error} If the workflow is not valid or cannot be converted.
   */
  const nodes: NodeBase[] = wf.nodes;
  const conns: ConnectionMutable<NodeBase[]>[] = [];

  Object.keys(wf.connections).forEach((sourceNode) => {
    const sourceConnections = wf.connections[sourceNode];

    Object.keys(sourceConnections).forEach((srcType) => {
      const sourceType = srcType as NodeConnectionType;
      const sourceTypeConnections = sourceConnections[sourceType];

      sourceTypeConnections.forEach((targetNodes, index) => {
        if (!targetNodes || !Array.isArray(targetNodes)) {
          return;
        }
        targetNodes.forEach((targetNode) => {
          conns.push([
            { node: sourceNode, type: sourceType, index },
            {
              node: targetNode.node,
              type: targetNode.type,
              index: targetNode.index,
            },
          ]);
        });
      });
    });
  });

  const connections: Connections<NodeBase[]> = conns as Connections<NodeBase[]>;

  return {
    id: wf.id,
    name: wf.name,
    active: wf.active,
    createdAt: wf.createdAt,
    updatedAt: wf.updatedAt,
    nodes: nodes,
    connections: connections,
  } as WorkflowJson<NodeBase[]>;
}
