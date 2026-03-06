declare module "react-froala-wysiwyg" {
  import { Component } from "react";

  interface FroalaEditorProps {
    tag?: string;
    config?: Record<string, unknown>;
    model?: string;
    onModelChange?: (model: string) => void;
  }

  export default class FroalaEditor extends Component<FroalaEditorProps> {}
}

declare module "froala-editor/js/plugins/*";