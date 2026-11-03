import Card from "./Card";

import type { Feature } from "../types";

export default function Main() {
  const features: Feature[] = [{
    id: crypto.randomUUID(),
    title: "Simple ChatBot",
    description: "A generic AI ChatBot that answers your regular questions."
  }, {
    id: crypto.randomUUID(),
    title: "RAG Based ChatBot",
    description: "A RAG based ChatBot that reads your PDF document and answers your questions from it."
  }, {
    id: crypto.randomUUID(),
    title: "AI BNS Master",
    description: "An AI based agent that has complete knowledge of BNS Sections."
  }]
  return (<main>
    {
      features.map((feature: Feature) => (
        <div key={feature.id}><Card feature={feature}/></div>
      ))
    }
  </main>)
}