import { Gallery } from "../components";
import { RouteContants } from "../routes";

import type { Card } from "../components/Gallery/Card";

export const Home = () => {
  const features: Card[] = [
    {
      id: crypto.randomUUID(),
      link: RouteContants.ROOT,
      title: "Indian Constitution Chatbot",
      description:
        "A Chatbot that can answer your questions from official Indian Contitution",
    },
    {
      id: crypto.randomUUID(),
      link: RouteContants.BNS_RAG,
      title: "AI BNS Master",
      description:
        "An AI based agent that has complete knowledge of BNS Sections.",
    },
    {
      id: crypto.randomUUID(),
      link: RouteContants.ROOT,
      title: "Generic ChatBot",
      description:
        "A RAG based ChatBot that reads your PDF document and answers your questions from it.",
    },
  ];

  return (
    <div className="home-container">
      <Gallery items={features} />
    </div>
  );
};
