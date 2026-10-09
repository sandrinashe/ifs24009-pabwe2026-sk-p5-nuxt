import { describe, it, expect, vi } from "vitest";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "./userApi";
import { apiFetch } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn().mockResolvedValue({ success: true }) }));

describe("userApi", () => {
  it("should call GET /users and GET /users/me", async () => {
    await getUsers();
    await getMe();
    expect(apiFetch).toHaveBeenCalledWith("/users");
    expect(apiFetch).toHaveBeenCalledWith("/users/me");
  });

  it("should call PUT /users/me with name and email", async () => {
    await putMe({ name: "A", email: "a@a.com", other: 1 });
    expect(apiFetch).toHaveBeenCalledWith("/users/me", { method: "PUT", body: { name: "A", email: "a@a.com" } });
  });

  it("should upload the photo as multipart form data", async () => {
    const file = new File(["x"], "photo.png", { type: "image/png" });
    await postPhoto(file);
    const [path, options] = apiFetch.mock.calls.at(-1);
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.formData.get("photo").name).toBe("photo.png");
  });

  it("should call PUT /users/password", async () => {
    const body = { password: "1", new_password: "2", new_password_confirmation: "2" };
    await putPassword({ ...body, extra: true });
    expect(apiFetch).toHaveBeenCalledWith("/users/password", { method: "PUT", body });
  });
});
