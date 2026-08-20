import type { DocumentStatus } from "../lib/demo-data";
export function StatusPill({ status }: { status: DocumentStatus }) { return <span className={`status status-${status.toLowerCase()}`}><i />{status}</span>; }
