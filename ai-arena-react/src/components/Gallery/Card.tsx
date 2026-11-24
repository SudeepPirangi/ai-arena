import styles from "./Card.module.css";

export type Card = {
  id: string;
  imageURL?: string;
  link?: string;
  title: string;
  description?: string;
};

export type CardProps = {
  card: Card;
};

export const Card = ({ card: { id, title, description } }: CardProps) => {
  return (
    <div className={styles.Card} id={`card-${id}`}>
      <h1 className={styles.CardTitle}>{title}</h1>
      <span className={styles.CardDescription} title={description}>
        {description}
      </span>
    </div>
  );
};
