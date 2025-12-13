import { render, screen } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import App from "./App";

test("renders assessment container", () => {
  render(
    <RecoilRoot>
      <App />
    </RecoilRoot>
  );
  const titleElement = screen.getByText(/Assessment: Mini Study Viewer/i);
  expect(titleElement).toBeInTheDocument();
});
