import { Link } from "react-router";
import { Card } from "./Card";
import styles from "./Card.module.css";

export type GalleryProps = {
  items: Card[];
};

export const Gallery = ({ items }: GalleryProps) => {
  return (
    <div className={styles.Gallery}>
      {items.map((item: Card) => (
        <Link to={item.link || "#"} key={item.id} className="flat-link">
          <Card card={item} />
        </Link>
      ))}
    </div>
  );
};
