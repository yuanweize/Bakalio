import http from "node:http";

let calls = 0;
const server = http.createServer(async (req, res) => {
  if (req.url === "/stats") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ calls }));
    return;
  }
  if (req.method !== "POST" || req.url !== "/v1/chat/completions") {
    res.writeHead(404).end();
    return;
  }
  calls++;
  let body = "";
  for await (const chunk of req) body += chunk;
  const request = JSON.parse(body);
  const input = JSON.parse(request.messages[1].content);
  const isRevision = Boolean(input.revision);
  const result = isRevision
    ? {
        text: "A clearly fictional example with no claimed findings.",
        missingInputs: [],
      }
    : {
        text: "A fictional introduction. [NEEDS INPUT: real research evidence]",
        missingInputs: ["real research evidence"],
      };
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      choices: [{ message: { content: JSON.stringify(result) } }],
      usage: { prompt_tokens: 120, completion_tokens: 30 },
    }),
  );
});
server.listen(4399, "127.0.0.1", () => console.log("Local AI fixture ready"));
