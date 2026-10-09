import { embedQuery } from "../src/lib/server/embeddings";
const started=Date.now();
embedQuery("AetherQ model readiness check").then(vector=>{
  console.log(`MiniLM ready: ${vector.length} dimensions in ${Date.now()-started} ms.`);
}).catch(error=>{console.error("Embedding warmup failed",error);process.exitCode=1;});
