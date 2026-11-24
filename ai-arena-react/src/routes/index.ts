import { createBrowserRouter } from "react-router";

import { Layout } from "../layout";
import { BNSChat, Home } from "../features";

export const RouteContants = {
  ROOT: '/',
  BNS_RAG: 'bns-rag-chatbot'
}

export const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        index: true,
        path: RouteContants.ROOT,
        Component: Home,
      },
      {
        path: RouteContants.BNS_RAG,
        children: [
          {
            index: true,
            Component: BNSChat
          }
        ]
      }
    ]
  }
])

