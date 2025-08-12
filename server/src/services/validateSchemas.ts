import fs from "fs";
import path from "path";
import { StatementExtraction, DealMetrics, Summary } from "../schemas/analysis";

const fixturesDir = path.resolve(__dirname, "../../../docs/fixtures");

["sample_extraction.json","sample_metrics.json","sample_summary.json"].forEach(f=>{
  const j = JSON.parse(fs.readFileSync(path.join(fixturesDir, f),"utf8"));
  if (f.includes("extraction")) StatementExtraction.parse(j);
  if (f.includes("metrics")) DealMetrics.parse(j);
  if (f.includes("summary")) Summary.parse(j);
  console.log("OK:", f);
});