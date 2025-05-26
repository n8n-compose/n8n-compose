import { defineWorkflow } from "../src/index";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NodeBase, WorkflowJson } from "../src/types";
import type { NodeConnectionType } from "n8n-workflow";
import * as nodeVersioning from "../src/node-versioning";

describe("defineWorkflow", () => {
  beforeEach(() => {
    vi.spyOn(nodeVersioning, "getLatestTypeVersion").mockResolvedValue(1);
  });

  it("transforms a basic workflow definition into a valid IWorkflowBase", async () => {
    interface MyNodeBase extends NodeBase {
      type: string;
    }

    type MyNodes = [
      MyNodeBase & { name: "Start"; type: "n8n-nodes-base.start" },
      MyNodeBase & { name: "Set"; type: "n8n-nodes-base.set" },
    ];

    const workflowDefinition: WorkflowJson<MyNodes> = {
      name: "Test Workflow",
      nodes: [
        {
          name: "Start",
          type: "n8n-nodes-base.start",
          position: [100, 200],
        },
        {
          name: "Set",
          type: "n8n-nodes-base.set",
          position: [300, 200],
          parameters: {
            values: {
              number: [
                {
                  name: "count",
                  value: 1,
                },
              ],
            },
          },
        },
      ],
      connections: [
        [
          { node: "Start", type: "main" as NodeConnectionType },
          { node: "Set", type: "main" as NodeConnectionType },
        ],
      ],
    };

    const result = await defineWorkflow(workflowDefinition);

    expect(result).toBeDefined();
    expect(result.name).toBe("Test Workflow");
    expect(result.active).toBe(true);
    expect(result.nodes).toHaveLength(2);

    const startNode = result.nodes.find((n) => n.name === "Start");
    const setNode = result.nodes.find((n) => n.name === "Set");

    expect(startNode).toBeDefined();
    expect(startNode?.type).toBe("n8n-nodes-base.start");
    expect(startNode?.position).toEqual([100, 200]);
    expect(startNode?.typeVersion).toBe(1); // From the mock

    expect(setNode).toBeDefined();
    expect(setNode?.type).toBe("n8n-nodes-base.set");
    expect(setNode?.parameters).toEqual({
      values: {
        number: [
          {
            name: "count",
            value: 1,
          },
        ],
      },
    });

    expect(result.connections).toBeDefined();
    expect(result.connections[startNode!.name]).toBeDefined();
    expect(result.connections[startNode!.name].main).toBeDefined();
    expect(result.connections[startNode!.name].main[0]).toBeDefined();
    expect(result.connections[startNode!.name].main[0]![0]).toEqual({
      node: "Set",
      type: "main",
      index: 0,
    });
  });
});
