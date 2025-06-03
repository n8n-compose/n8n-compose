// ---------------------------------------------------------------------------
// Core structural types -----------------------------------------------------
// ---------------------------------------------------------------------------

import type {
  IDataObject,
  IPinData,
  IWorkflowSettings,
  INodeParameters,
  INode,
  INodeTypeDescription,
  NodeConnectionType,
} from "n8n-workflow";

/**
 * A base interface for nodes in n8n-compose.
 * It extends the INode interface from n8n-workflow, but omits and redefines
 * as optional properties that we can generate at build time
 * */
export interface NodeBase<Name extends string = string>
  extends Omit<INode, "id" | "parameters" | "typeVersion"> {
  name: Name;
  id?: string;
  parameters?: INodeParameters;
  typeVersion?: number;
}

type NodeName<N extends readonly NodeBase[]> = N[number]["name"];

export type NodeConnectionTypeLiteral = `${NodeConnectionType}`;

interface ConnectionOptions<N extends readonly NodeBase[]> {
  node: NodeName<N>;
  type: NodeConnectionTypeLiteral;
  index?: number;
}

/**
 * Represents a connection between two nodes in a workflow.
 * Instead of the n8n workflow connection format, we represent connections
 * as a tuple of two ConnectionOptions.
 * */
type Connection<N extends readonly NodeBase[]> = readonly [
  ConnectionOptions<N>,
  ConnectionOptions<N>,
];

type Connections<N extends readonly NodeBase[]> = readonly Connection<N>[];

/**
 * Our WorkflowJson interface represents a workflow in n8n-compose.
 * THe main difference to the n8n workflow interface is the different
 * representation of connections. We also make more properties optional
 * to make workflow definitions less verbose.
 * */
export interface WorkflowJson<N extends readonly NodeBase[]> {
  name: string;
  nodes: N;
  connections: Connections<N>;
  id?: string;
  active?: boolean;
  createdAt?: Date;
  startedAt?: Date;
  updatedAt?: Date;
  settings?: IWorkflowSettings;
  staticData?: IDataObject;
  pinData?: IPinData;
  versionId?: string;
}

export interface N8nNodes {
  [nodeType: string]: INodeTypeDescription;
}
