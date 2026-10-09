import { describe, it, expect } from "vitest";
import useInput from "./useInput";

describe("useInput", () => {
  it("should start with the default value", () => {
    expect(useInput()[0].value).toBe("");
    expect(useInput("halo")[0].value).toBe("halo");
  });

  it("should update value on change event", () => {
    const [value, onChange] = useInput();
    onChange({ target: { value: "baru" } });
    expect(value.value).toBe("baru");
  });
});
