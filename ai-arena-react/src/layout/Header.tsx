import { Link } from "react-router";
import { RouteContants } from "../routes";

const Header = () => {
  return (
    <header>
      <nav>
        <div id="brand">
          <Link to={RouteContants.ROOT} className="flat-link">
            AI Arena
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
