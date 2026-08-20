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

test("keeps a complete source title when punctuation splits it into sentences", async () => {
  const sourceDocument = {
    ...document,
    name: "ЛР6 схеми контролю",
    textChunks: [{
      pageNumber: 7,
      chunkIndex: 0,
      content: "9. Джерело Методичні вказівки до лабораторної роботи № 6 «Дослідження схем. Схеми контролю», наданий файл «лр6_схеми контролю.docx».",
    }],
  };
  const result = await answerStoredDocuments("Яке використано джерело?", [sourceDocument]);
  assert.equal(result.noAnswer, false);
  assert.match(result.answer, /Схеми контролю»/u);
  assert.match(result.answer, /лр6_схеми контролю\.docx/u);
});
