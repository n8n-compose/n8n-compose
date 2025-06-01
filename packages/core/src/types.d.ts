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

// We omit and redefine as optional properties that we can generate at build time
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

type Connection<N extends readonly NodeBase[]> = readonly [
  ConnectionOptions<N>,
  ConnectionOptions<N>,
];

type Connections<N extends readonly NodeBase[]> = readonly Connection<N>[];

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
