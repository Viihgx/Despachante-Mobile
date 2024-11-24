import '../styles/global.css';
import { Slot } from "expo-router";
import { FlowProvider } from "../contexts/FlowContext";

export default function RootLayout() {
  return (
    <FlowProvider>
      <Slot />
    </FlowProvider>
  );
}
