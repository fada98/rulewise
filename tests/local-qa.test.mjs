import assert from "node:assert/strict";
import test from "node:test";
import { answerStoredDocuments } from "../lib/local-qa.ts";

const document = {
  id: "uploaded-test",
  name: "Safety Rules",
  file: "safety.pdf",
  pages: 2,
  chunks: 2,
  uploaded: "Now",
  size: "10 KB",
  blob: new Blob(),
  textChunks: [
    { pageNumber: 1, chunkIndex: 0, content: "The venue manager must complete the safety inspection before the doors open. The signed checklist is retained for one year." },
    { pageNumber: 2, chunkIndex: 1, content: "Appeals must be filed within five business days after the written decision." },
  ],
};

test("answers from uploaded PDF text without downloading a model", async () => {
  const result = await answerStoredDocuments("Who completes the safety inspection?", [document]);
  assert.equal(result.noAnswer, false);
  assert.match(result.answer, /venue manager/i);
  assert.equal(result.sources[0].page, 1);
});

test("returns insufficient evidence for unrelated questions", async () => {
  const result = await answerStoredDocuments("What is the parking fee?", [document]);
  assert.equal(result.noAnswer, true);
  assert.deepEqual(result.sources, []);
});
