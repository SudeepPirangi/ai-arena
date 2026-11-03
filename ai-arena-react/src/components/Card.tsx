import type { Feature } from "../types";

export default function Card({ feature: {id, title, description} }: { feature: Feature }) {
  return (
    <div id={`card-${id}`}>
      <p id="card-title">{title}</p>
      <span id="card-description">{description}</span>
    </div>
  )
}