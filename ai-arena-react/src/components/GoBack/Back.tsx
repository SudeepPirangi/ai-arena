import { useNavigate } from "react-router";
import { Button } from "../UI";

export const Back = ({ text }: { text: string }) => {
  const navigate = useNavigate();
  return (
    <>
      <Button onClick={() => navigate(-1)}>{text}</Button>
    </>
  );
};
