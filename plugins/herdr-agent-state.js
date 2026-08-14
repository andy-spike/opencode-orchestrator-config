// installed by herdr
// managed by herdr; reinstalling or updating the integration overwrites this file.
// add custom hooks/plugins beside this file instead of editing it.
// HERDR_INTEGRATION_ID=opencode
// HERDR_INTEGRATION_VERSION=9
//
// Ported to the OpenCode V2 plugin API (beta).
// Requires @opencode-ai/plugin@next to match the opencode2 release.

import net from "node:net";
import { Plugin } from "@opencode-ai/plugin";

const SOURCE = "herdr:opencode";
const AGENT = "opencode";
let reportSeq = Date.now() * 1000;
let requestChain = Promise.resolve();
let reportedRootSessionID;

// Track child sessions so their events cannot replace the pane's root session.
// Their user prompts still project state without attaching the child session id.
const childSessions = new Set();
const CHILD_EVENT_STATES = new Map([
  ["permission.asked", "blocked"],
  ["question.asked", "blocked"],
  ["permission.replied", "working"],
  ["question.replied", "working"],
  ["question.rejected", "working"],
]);

function nextReportSeq() {
  reportSeq += 1;
  return reportSeq;
}

function sessionIDFromData(data) {
  return typeof data?.sessionID === "string" && data.sessionID
    ? data.sessionID
    : undefined;
}

const SESSION_STATE_BY_STATUS = new Map([
  ["idle", "idle"],
  ["active", "working"],
  ["busy", "working"],
  ["pending", "working"],
  ["retry", "working"],
  ["running", "working"],
  ["streaming", "working"],
  ["working", "working"],
]);

function stateFromSessionStatus(status) {
  const kind = typeof status === "string" ? status : status?.type;
  return typeof kind === "string"
    ? SESSION_STATE_BY_STATUS.get(kind.toLowerCase())
    : undefined;
}

function request(method, params) {
  const pending = requestChain.then(() => requestOnce(method, params));
  requestChain = pending.catch(() => {});
  return pending;
}

function requestOnce(method, params) {
  const paneId = process.env.HERDR_PANE_ID;
  const socketPath = process.env.HERDR_SOCKET_PATH;

  if (!paneId || !socketPath) {
    return Promise.resolve();
  }

  const socketEndpoint =
    process.platform === "win32" ? `\\\\.\\pipe\\${socketPath}` : socketPath;

  const requestId = `${SOURCE}:${Date.now()}:${Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0")}`;
  const request = {
    id: requestId,
    method,
    params: {
      pane_id: paneId,
      source: SOURCE,
      agent: AGENT,
      seq: nextReportSeq(),
      ...params,
    },
  };

  return new Promise((resolve) => {
    const client = net.createConnection(socketEndpoint, () => {
      client.write(`${JSON.stringify(request)}\n`);
    });

    const finish = () => {
      client.destroy();
      resolve();
    };

    client.setTimeout(500, finish);
    client.on("data", finish);
    client.on("error", finish);
    client.on("end", finish);
    client.on("close", resolve);
  });
}

function reportSession(sessionID, sessionStartSource) {
  if (!sessionID) {
    return Promise.resolve();
  }
  const params = { agent_session_id: sessionID };
  if (sessionStartSource) {
    params.session_start_source = sessionStartSource;
  }
  return request("pane.report_agent_session", params);
}

function reportState(state, sessionID) {
  const params = { state };
  if (sessionID) {
    reportedRootSessionID = sessionID;
    params.agent_session_id = sessionID;
  }
  return request("pane.report_agent", params);
}

function handleEvent(type, data) {
  const sessionID = sessionIDFromData(data);

  if (data?.parentID && data.sessionID) {
    childSessions.add(data.sessionID);
  }
  if (sessionID && childSessions.has(sessionID)) {
    const state = CHILD_EVENT_STATES.get(type);
    if (state) {
      return reportState(state);
    }
    return Promise.resolve();
  }

  switch (type) {
    case "session.created":
      // A root session.created is a genuine new-session start (subagent
      // creates are dropped above). Signal it so herdr replaces the pane's
      // prior session id instead of treating the change as cross-talk.
      return reportSession(sessionID, "new");
    case "session.renamed":
    case "session.agent.selected":
    case "session.model.selected":
      if (sessionID && sessionID !== reportedRootSessionID) {
        return reportSession(sessionID);
      }
      return Promise.resolve();
    case "session.status": {
      const state = stateFromSessionStatus(data?.status);
      if (state) {
        return reportState(state, sessionID);
      }
      return reportSession(sessionID);
    }
    case "session.inbox.delivered":
    case "session.execution.started":
    case "session.tool.called":
    case "session.compaction.ended":
    case "permission.replied":
    case "question.replied":
    case "question.rejected":
      return reportState("working", sessionID);
    case "permission.asked":
    case "question.asked":
    case "session.execution.failed":
      return reportState("blocked", sessionID);
    case "session.idle":
      return reportState("idle", sessionID);
    default:
      return Promise.resolve();
  }
}

export default Plugin.define({
  id: "herdr.agent-state",
  setup: async (ctx) => {
    if (
      process.env.HERDR_ENV !== "1" ||
      !process.env.HERDR_SOCKET_PATH ||
      !process.env.HERDR_PANE_ID
    ) {
      return;
    }

    try {
      for await (const event of ctx.event.subscribe()) {
        await handleEvent(event?.type, event?.data);
      }
    } catch {
      return;
    }
  },
});
