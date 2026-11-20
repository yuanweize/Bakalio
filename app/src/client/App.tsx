import { Outlet } from "react-router";
import { Preferences } from "../studio/i18n";
import "../studio/style.css";
export function App() {
  return (
    <Preferences>
      <Outlet />
    </Preferences>
  );
}
