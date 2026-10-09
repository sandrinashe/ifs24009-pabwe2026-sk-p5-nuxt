import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// Mock method DOM yang tidak tersedia di jsdom
window.scrollTo = vi.fn();
window.matchMedia =
  window.matchMedia ||
  vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
URL.createObjectURL = vi.fn(() => "blob:mock-preview");
URL.revokeObjectURL = vi.fn();

// Mock Toast UI (membutuhkan layout browser sungguhan)
vi.mock("@toast-ui/editor", () => {
  class Editor {
    static instances = [];
    constructor(options) {
      this.options = options;
      this.markdown = options.initialValue;
      this.handlers = {};
      Editor.instances.push(this);
    }
    on(event, handler) {
      this.handlers[event] = handler;
    }
    getMarkdown() {
      return this.markdown;
    }
    destroy() {
      this.destroyed = true;
    }
  }
  return { default: Editor };
});

vi.mock("@toast-ui/editor/viewer", () => {
  class Viewer {
    static instances = [];
    constructor(options) {
      this.options = options;
      this.markdown = options.initialValue;
      Viewer.instances.push(this);
    }
    setMarkdown(value) {
      this.markdown = value;
    }
    destroy() {
      this.destroyed = true;
    }
  }
  return { default: Viewer };
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
