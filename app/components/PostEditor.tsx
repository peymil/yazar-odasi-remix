import { useHydrated } from "~/lib/utils";
import type { PostEditorProps } from "./PostEditor.client";

export function PostEditor(props: PostEditorProps) {
  const isHydrated = useHydrated();

  if (!isHydrated) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="h-[400px] border rounded-md bg-gray-50 animate-pulse" />
      </div>
    );
  }

  // Dynamic import to avoid SSR issues with browser-only dependencies
  const { PostEditor: ClientPostEditor } = require("./PostEditor.client");
  return <ClientPostEditor {...props} />;
}
